// ─── Cambridge AS & A Level Pseudocode Interpreter ────────────────────────────
// Implements the 9618 pseudocode specification.
// No eval() — pure recursive descent parser + tree-walk interpreter.

// ══════════════════════════════════════════════════════════════════════════════
// TOKENISER
// ══════════════════════════════════════════════════════════════════════════════

const TT = {
  // Literals
  INTEGER: 'INTEGER', REAL: 'REAL', STRING: 'STRING', CHAR: 'CHAR', BOOLEAN: 'BOOLEAN',
  IDENTIFIER: 'IDENTIFIER',
  // Operators
  ASSIGN: 'ASSIGN',           // ←
  PLUS: 'PLUS', MINUS: 'MINUS', STAR: 'STAR', SLASH: 'SLASH',
  AMPERSAND: 'AMPERSAND',     // & (string concat)
  EQ: 'EQ', NEQ: 'NEQ', LT: 'LT', LTE: 'LTE', GT: 'GT', GTE: 'GTE',
  LPAREN: 'LPAREN', RPAREN: 'RPAREN',
  LBRACKET: 'LBRACKET', RBRACKET: 'RBRACKET',
  COMMA: 'COMMA', COLON: 'COLON', DOT: 'DOT',
  // Keywords — all uppercase in Cambridge pseudocode
  KW: 'KW',
  EOF: 'EOF'
};

const KEYWORDS = new Set([
  'DECLARE','CONSTANT','IF','THEN','ELSE','ENDIF',
  'CASE','OF','OTHERWISE','ENDCASE',
  'FOR','TO','STEP','NEXT',
  'WHILE','DO','ENDWHILE',
  'REPEAT','UNTIL',
  'PROCEDURE','ENDPROCEDURE','CALL',
  'FUNCTION','ENDFUNCTION','RETURNS','RETURN',
  'BYREF','BYVALUE','BYVAL',
  'TYPE','ENDTYPE',
  'OPENFILE','READFILE','WRITEFILE','CLOSEFILE',
  'READ','WRITE','APPEND',
  'INPUT','OUTPUT',
  'AND','OR','NOT',
  'MOD','DIV',
  'TRUE','FALSE',
  'INTEGER','REAL','STRING','BOOLEAN','CHAR','ARRAY','OF',
]);

// Built-in library function names — NOT reserved as keywords so that identifiers
// like 'Length' or 'Random' can be used as variable names without clashing.
const BUILTIN_NAMES = new Set([
  'LENGTH','LCASE','UCASE','SUBSTRING','MID','RIGHT','LEFT',
  'TO_STRING','TO_INTEGER','TO_REAL','STR_TO_NUM','NUM_TO_STR',
  'ROUND','INT','RANDOM','RAND','EOF',
]);

class Token {
  constructor(type, value, line) { this.type = type; this.value = value; this.line = line; }
}

class Lexer {
  constructor(src) {
    this.src = src;
    this.pos = 0;
    this.line = 1;
    this.tokens = [];
  }

  error(msg) { throw new RuntimeError(`Syntax error (line ${this.line}): ${msg}`); }

  peek(offset = 0) { return this.src[this.pos + offset]; }
  advance() {
    const ch = this.src[this.pos++];
    if (ch === '\n') this.line++;
    return ch;
  }

  skipWhitespaceAndComments() {
    while (this.pos < this.src.length) {
      const ch = this.peek();
      if (ch === ' ' || ch === '\t' || ch === '\r') { this.advance(); continue; }
      // Cambridge pseudocode uses // for comments
      if (ch === '/' && this.peek(1) === '/') {
        while (this.pos < this.src.length && this.peek() !== '\n') this.advance();
        continue;
      }
      break;
    }
  }

  readString() {
    const line = this.line;
    this.advance(); // opening "
    let s = '';
    while (this.pos < this.src.length && this.peek() !== '"') {
      s += this.advance();
    }
    if (this.pos >= this.src.length) this.error('Unterminated string literal');
    this.advance(); // closing "
    return new Token(TT.STRING, s, line);
  }

  readChar() {
    const line = this.line;
    this.advance(); // opening '
    const ch = this.advance();
    if (this.peek() !== "'") this.error("Expected closing ' for CHAR literal");
    this.advance();
    return new Token(TT.CHAR, ch, line);
  }

  readNumber(line) {
    let s = '';
    while (this.pos < this.src.length && /[0-9]/.test(this.peek())) s += this.advance();
    if (this.peek() === '.' && /[0-9]/.test(this.peek(1))) {
      s += this.advance(); // dot
      while (this.pos < this.src.length && /[0-9]/.test(this.peek())) s += this.advance();
      return new Token(TT.REAL, parseFloat(s), line);
    }
    return new Token(TT.INTEGER, parseInt(s, 10), line);
  }

  readIdentOrKeyword(line) {
    let s = '';
    while (this.pos < this.src.length && /[A-Za-z0-9_]/.test(this.peek())) s += this.advance();
    const upper = s.toUpperCase();
    if (upper === 'TRUE')  return new Token(TT.BOOLEAN, true, line);
    if (upper === 'FALSE') return new Token(TT.BOOLEAN, false, line);
    if (KEYWORDS.has(upper)) return new Token(TT.KW, upper, line);
    return new Token(TT.IDENTIFIER, s, line);
  }

  tokenise() {
    while (this.pos < this.src.length) {
      this.skipWhitespaceAndComments();
      if (this.pos >= this.src.length) break;

      const line = this.line;
      const ch = this.peek();

      if (ch === '\n') { this.advance(); continue; }

      if (ch === '"') { this.tokens.push(this.readString()); continue; }
      if (ch === "'") { this.tokens.push(this.readChar()); continue; }
      if (/[0-9]/.test(ch)) { this.tokens.push(this.readNumber(line)); continue; }
      if (/[A-Za-z_]/.test(ch)) { this.tokens.push(this.readIdentOrKeyword(line)); continue; }

      // ← assignment arrow (UTF-8 left arrow U+2190)
      if (ch === '←' || (ch === '<' && this.peek(1) === '-')) {
        if (ch === '<') this.advance();
        this.advance();
        this.tokens.push(new Token(TT.ASSIGN, '←', line));
        continue;
      }

      this.advance();
      switch (ch) {
        case '+': this.tokens.push(new Token(TT.PLUS, '+', line)); break;
        case '-': this.tokens.push(new Token(TT.MINUS, '-', line)); break;
        case '*': this.tokens.push(new Token(TT.STAR, '*', line)); break;
        case '/': this.tokens.push(new Token(TT.SLASH, '/', line)); break;
        case '&': this.tokens.push(new Token(TT.AMPERSAND, '&', line)); break;
        case '(': this.tokens.push(new Token(TT.LPAREN, '(', line)); break;
        case ')': this.tokens.push(new Token(TT.RPAREN, ')', line)); break;
        case '[': this.tokens.push(new Token(TT.LBRACKET, '[', line)); break;
        case ']': this.tokens.push(new Token(TT.RBRACKET, ']', line)); break;
        case ',': this.tokens.push(new Token(TT.COMMA, ',', line)); break;
        case ':': this.tokens.push(new Token(TT.COLON, ':', line)); break;
        case '.': this.tokens.push(new Token(TT.DOT, '.', line)); break;
        case '=': this.tokens.push(new Token(TT.EQ, '=', line)); break;
        case '<':
          if (this.peek() === '=') { this.advance(); this.tokens.push(new Token(TT.LTE, '<=', line)); }
          else if (this.peek() === '>') { this.advance(); this.tokens.push(new Token(TT.NEQ, '<>', line)); }
          else this.tokens.push(new Token(TT.LT, '<', line));
          break;
        case '>':
          if (this.peek() === '=') { this.advance(); this.tokens.push(new Token(TT.GTE, '>=', line)); }
          else this.tokens.push(new Token(TT.GT, '>', line));
          break;
        default:
          if (ch.charCodeAt(0) > 32) {
            this.error(`Unexpected character '${ch}'`);
          }
          // skip non-printing / whitespace-like characters silently (e.g. BOM)
      }
    }
    this.tokens.push(new Token(TT.EOF, null, this.line));
    return this.tokens;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ERROR TYPES
// ══════════════════════════════════════════════════════════════════════════════

export class RuntimeError extends Error {
  constructor(msg, line) {
    super(msg);
    this.name = 'RuntimeError';
    this.pseudoLine = line ?? null;
  }
}

class ReturnSignal {
  constructor(value) { this.value = value; }
}

// ══════════════════════════════════════════════════════════════════════════════
// PARSER  (produces a flat list of statement nodes; expressions are nested)
// ══════════════════════════════════════════════════════════════════════════════

class Parser {
  constructor(tokens, { relaxedIdentifiers = false } = {}) {
    this.tokens = tokens;
    this.pos = 0;
    this.relaxedIdentifiers = relaxedIdentifiers;
  }

  peek(offset = 0) { return this.tokens[Math.min(this.pos + offset, this.tokens.length - 1)]; }
  advance() { return this.tokens[this.pos < this.tokens.length ? this.pos++ : this.pos]; }
  isEOF() { return this.peek().type === TT.EOF; }

  check(type, value) {
    const t = this.peek();
    if (type && t.type !== type) return false;
    if (value !== undefined && t.value !== value) return false;
    return true;
  }

  expect(type, value) {
    if (!this.check(type, value)) {
      const t = this.peek();
      const want = value ?? type;
      throw new RuntimeError(`Expected '${want}' but got '${t.value ?? t.type}' (line ${t.line})`, t.line);
    }
    return this.advance();
  }

  match(type, value) {
    if (this.check(type, value)) { this.advance(); return true; }
    return false;
  }

  // Skip any newline-equivalent tokens (we don't emit them, just advance on empty lines)
  // Statements are separated by newlines handled at the tokeniser level.

  // ── Entry point ──────────────────────────────────────────────────────────

  parseProgram() {
    const stmts = [];
    while (!this.isEOF()) {
      const stmt = this.parseStatement();
      if (stmt) stmts.push(stmt);
    }
    return stmts;
  }

  parseBlock(stopKeywords) {
    const stmts = [];
    while (!this.isEOF()) {
      if (stopKeywords.some(kw => this.check(TT.KW, kw))) break;
      const stmt = this.parseStatement();
      if (stmt) stmts.push(stmt);
    }
    return stmts;
  }

  parseStatement() {
    const t = this.peek();

    if (t.type === TT.KW) {
      switch (t.value) {
        case 'DECLARE':   return this.parseDeclare();
        case 'CONSTANT':  return this.parseConstant();
        case 'IF':        return this.parseIf();
        case 'CASE':      return this.parseCase();
        case 'FOR':       return this.parseFor();
        case 'WHILE':     return this.parseWhile();
        case 'REPEAT':    return this.parseRepeat();
        case 'PROCEDURE': return this.parseProcedureDef();
        case 'FUNCTION':  return this.parseFunctionDef();
        case 'CALL':      return this.parseCall();
        case 'RETURN':    return this.parseReturn();
        case 'INPUT':     return this.parseInput();
        case 'OUTPUT':    return this.parseOutput();
        case 'TYPE':      return this.parseTypeDef();
        case 'OPENFILE':  return this.parseOpenFile();
        case 'READFILE':  return this.parseReadFile();
        case 'WRITEFILE': return this.parseWriteFile();
        case 'CLOSEFILE': return this.parseCloseFile();
        // Block-end keywords: caller's parseBlock handles the stop
        default:
          this.advance(); // consume unknown/end keyword to avoid infinite loop
          return null;
      }
    }

    if (t.type === TT.IDENTIFIER) return this.parseAssignOrCall();

    // Unknown token — skip
    this.advance();
    return null;
  }

  // ── DECLARE ──────────────────────────────────────────────────────────────

  _checkIdentifierName(name, line) {
    if (this.relaxedIdentifiers) return;
    if (name.length === 1 && !'ijkn'.includes(name.toLowerCase())) {
      throw new RuntimeError(
        `Identifier '${name}' is a single character — use a descriptive name. Only i, j, k and n are allowed as single-character identifiers.`,
        line
      );
    }
  }

  parseDeclare() {
    const line = this.peek().line;
    this.advance(); // DECLARE
    // Collect one or more comma-separated names: DECLARE A, B, C : INTEGER
    const names = [this.expect(TT.IDENTIFIER).value];
    while (this.match(TT.COMMA)) {
      names.push(this.expect(TT.IDENTIFIER).value);
    }
    for (const name of names) this._checkIdentifierName(name, line);
    this.expect(TT.COLON);
    const typeInfo = this.parseTypeSpec();
    // Single-name form keeps backward-compat shape; multi-name wraps in names[]
    return names.length === 1
      ? { kind: 'Declare', name: names[0], typeInfo, line }
      : { kind: 'Declare', names, typeInfo, line };
  }

  parseTypeSpec() {
    if (this.check(TT.KW, 'ARRAY')) {
      this.advance(); // ARRAY
      this.expect(TT.LBRACKET);
      const lo1 = this.parseExpr();
      this.expect(TT.COLON);
      const hi1 = this.parseExpr();
      let lo2 = null, hi2 = null;
      if (this.match(TT.COMMA)) {
        lo2 = this.parseExpr();
        this.expect(TT.COLON);
        hi2 = this.parseExpr();
      }
      this.expect(TT.RBRACKET);
      this.expect(TT.KW, 'OF');
      const elementType = this.advance().value; // INTEGER, REAL, etc.
      return { kind: 'ArrayType', lo1, hi1, lo2, hi2, elementType };
    }
    return { kind: 'ScalarType', name: this.advance().value };
  }

  // ── CONSTANT ─────────────────────────────────────────────────────────────

  parseConstant() {
    const line = this.peek().line;
    this.advance(); // CONSTANT
    const name = this.expect(TT.IDENTIFIER).value;
    this.expect(TT.EQ);
    const value = this.parseExpr();
    return { kind: 'Constant', name, value, line };
  }

  // ── TYPE definition ───────────────────────────────────────────────────────

  parseTypeDef() {
    const line = this.peek().line;
    this.advance(); // TYPE
    const typeName = this.expect(TT.IDENTIFIER).value;
    const fields = [];
    // Collect DECLARE field : type lines until ENDTYPE
    while (!this.isEOF() && !this.check(TT.KW, 'ENDTYPE')) {
      if (this.check(TT.KW, 'DECLARE')) {
        this.advance(); // DECLARE
        const fieldName = this.expect(TT.IDENTIFIER).value;
        this.expect(TT.COLON);
        const fieldTypeTok = this.advance(); // INTEGER, REAL, etc.
        fields.push({ name: fieldName, type: fieldTypeTok.value });
      } else {
        this.advance(); // skip blank lines / unknown
      }
    }
    this.expect(TT.KW, 'ENDTYPE');
    return { kind: 'TypeDef', typeName, fields, line };
  }

  // ── Assignment / procedure call via identifier ───────────────────────────

  parseAssignOrCall() {
    const line = this.peek().line;
    const lhs = this.parseLHS(); // may be identifier or array access

    if (this.check(TT.ASSIGN)) {
      this.advance(); // ←
      const rhs = this.parseExpr();
      return { kind: 'Assign', lhs, rhs, line };
    }

    // If it was just an identifier and next is '(' it's a procedure call
    if (lhs.kind === 'Var' && this.check(TT.LPAREN)) {
      const args = this.parseArgList();
      return { kind: 'CallStmt', name: lhs.name, args, line };
    }

    throw new RuntimeError(`Expected ← after '${lhs.name ?? '?'}'`, line);
  }

  parseLHS() {
    const line = this.peek().line;
    const name = this.expect(TT.IDENTIFIER).value;
    if (this.check(TT.LBRACKET)) {
      this.advance();
      const idx1 = this.parseExpr();
      let idx2 = null;
      if (this.match(TT.COMMA)) idx2 = this.parseExpr();
      this.expect(TT.RBRACKET);
      // Allow array element member access: Arr[i].Field
      if (this.check(TT.DOT)) {
        this.advance();
        const field = this.expect(TT.IDENTIFIER).value;
        return { kind: 'MemberAccess', object: { kind: 'ArrayAccess', name, idx1, idx2, line }, field, line };
      }
      return { kind: 'ArrayAccess', name, idx1, idx2, line };
    }
    // Member access: Var.Field
    if (this.check(TT.DOT)) {
      this.advance();
      const field = this.expect(TT.IDENTIFIER).value;
      return { kind: 'MemberAccess', object: { kind: 'Var', name, line }, field, line };
    }
    return { kind: 'Var', name, line };
  }

  // ── CALL ─────────────────────────────────────────────────────────────────

  parseCall() {
    const line = this.peek().line;
    this.advance(); // CALL
    const name = this.expect(TT.IDENTIFIER).value;
    const args = this.check(TT.LPAREN) ? this.parseArgList() : [];
    return { kind: 'CallStmt', name, args, line };
  }

  parseArgList() {
    const args = [];
    this.expect(TT.LPAREN);
    if (!this.check(TT.RPAREN)) {
      args.push(this.parseExpr());
      while (this.match(TT.COMMA)) args.push(this.parseExpr());
    }
    this.expect(TT.RPAREN);
    return args;
  }

  // ── RETURN ───────────────────────────────────────────────────────────────

  parseReturn() {
    const line = this.peek().line;
    this.advance(); // RETURN
    const value = this.parseExpr();
    return { kind: 'Return', value, line };
  }

  // ── INPUT / OUTPUT ───────────────────────────────────────────────────────

  parseInput() {
    const line = this.peek().line;
    this.advance(); // INPUT
    const name = this.expect(TT.IDENTIFIER).value;
    if (this.check(TT.LBRACKET)) {
      this.advance();
      const idx1 = this.parseExpr();
      let idx2 = null;
      if (this.match(TT.COMMA)) idx2 = this.parseExpr();
      this.expect(TT.RBRACKET);
      return { kind: 'Input', target: name, idx1, idx2, line };
    }
    return { kind: 'Input', target: name, line };
  }

  parseOutput() {
    const line = this.peek().line;
    this.advance(); // OUTPUT
    const exprs = [this.parseExpr()];
    while (this.match(TT.COMMA)) exprs.push(this.parseExpr());
    return { kind: 'Output', exprs, line };
  }

  // ── IF ───────────────────────────────────────────────────────────────────

  parseIf() {
    const line = this.peek().line;
    this.advance(); // IF
    const condition = this.parseExpr();
    this.expect(TT.KW, 'THEN');
    const thenBranch = this.parseBlock(['ELSE', 'ENDIF']);
    let elseBranch = [];
    if (this.match(TT.KW, 'ELSE')) {
      // Allow ELSE IF
      if (this.check(TT.KW, 'IF')) {
        elseBranch = [this.parseIf()];
      } else {
        elseBranch = this.parseBlock(['ENDIF']);
      }
    }
    this.expect(TT.KW, 'ENDIF');
    return { kind: 'If', condition, thenBranch, elseBranch, line };
  }

  // ── CASE OF ──────────────────────────────────────────────────────────────

  parseCase() {
    const line = this.peek().line;
    this.advance(); // CASE
    this.expect(TT.KW, 'OF');
    const expr = this.parseExpr();
    const branches = [];
    let otherwise = null;

    while (!this.isEOF() && !this.check(TT.KW, 'ENDCASE')) {
      if (this.match(TT.KW, 'OTHERWISE')) {
        otherwise = this.parseBlock(['ENDCASE']);
        break;
      }
      // Parse one or more comma-separated values/ranges: v1, v2 TO v3, v4 :
      const matchers = [];
      do {
        const low = this.parseExpr();
        let high = null;
        if (this.check(TT.KW, 'TO')) {
          this.advance();
          high = this.parseExpr();
        }
        matchers.push({ low, high });
      } while (this.match(TT.COMMA));
      this.expect(TT.COLON);
      const body = this._parseCaseBranchBody();
      branches.push({ matchers, body });
    }
    this.expect(TT.KW, 'ENDCASE');
    return { kind: 'Case', expr, branches, otherwise, line };
  }

  /** Parse statements for one CASE branch, stopping before the next branch,
   *  OTHERWISE, or ENDCASE. */
  _parseCaseBranchBody() {
    const stmts = [];
    while (!this.isEOF()) {
      // Stop at block-level keywords
      if (this.check(TT.KW, 'ENDCASE') || this.check(TT.KW, 'OTHERWISE')) break;
      // Stop if this looks like the start of the next branch:
      // a literal or identifier immediately followed by a colon on the same line.
      if (this._isNextCaseBranch()) break;
      const stmt = this.parseStatement();
      if (stmt) stmts.push(stmt);
    }
    return stmts;
  }

  /** Returns true if the current position looks like the start of a new CASE branch. */
  _isNextCaseBranch() {
    const t = this.peek();
    const isValue = t.type === TT.STRING || t.type === TT.CHAR ||
                    t.type === TT.INTEGER || t.type === TT.REAL ||
                    t.type === TT.IDENTIFIER;
    if (!isValue) return false;
    // Scan forward past value, optional TO high, optional comma+value repeats,
    // and check if we eventually hit a colon.
    let i = this.pos + 1;
    while (i < this.tokens.length) {
      const tok = this.tokens[i];
      if (tok?.type === TT.COLON) return true;                       // found the colon
      if (tok?.type === TT.KW && tok?.value === 'TO') { i += 2; continue; } // skip TO + high
      if (tok?.type === TT.COMMA) { i += 2; continue; }             // skip , + next value
      break; // anything else — not a branch header
    }
    return false;
  }

  // ── FOR ... TO ... STEP ... NEXT ─────────────────────────────────────────

  parseFor() {
    const line = this.peek().line;
    this.advance(); // FOR
    const variable = this.expect(TT.IDENTIFIER).value;
    this.expect(TT.ASSIGN);
    const start = this.parseExpr();
    this.expect(TT.KW, 'TO');
    const end = this.parseExpr();
    let step = null;
    if (this.match(TT.KW, 'STEP')) step = this.parseExpr();
    const body = this.parseBlock(['NEXT']);
    this.expect(TT.KW, 'NEXT');
    // NEXT may optionally be followed by variable name
    if (this.check(TT.IDENTIFIER)) this.advance();
    return { kind: 'For', variable, start, end, step, body, line };
  }

  // ── WHILE DO ENDWHILE ────────────────────────────────────────────────────

  parseWhile() {
    const line = this.peek().line;
    this.advance(); // WHILE
    const condition = this.parseExpr();
    this.expect(TT.KW, 'DO');
    const body = this.parseBlock(['ENDWHILE']);
    this.expect(TT.KW, 'ENDWHILE');
    return { kind: 'While', condition, body, line };
  }

  // ── REPEAT UNTIL ─────────────────────────────────────────────────────────

  parseRepeat() {
    const line = this.peek().line;
    this.advance(); // REPEAT
    const body = this.parseBlock(['UNTIL']);
    this.expect(TT.KW, 'UNTIL');
    const condition = this.parseExpr();
    return { kind: 'Repeat', body, condition, line };
  }

  // ── PROCEDURE ────────────────────────────────────────────────────────────

  parseProcedureDef() {
    const line = this.peek().line;
    this.advance(); // PROCEDURE
    const name = this.expect(TT.IDENTIFIER).value;
    const params = this.check(TT.LPAREN) ? this.parseParamList() : [];
    const body = this.parseBlock(['ENDPROCEDURE']);
    this.expect(TT.KW, 'ENDPROCEDURE');
    return { kind: 'ProcedureDef', name, params, body, line };
  }

  // ── FUNCTION ─────────────────────────────────────────────────────────────

  parseFunctionDef() {
    const line = this.peek().line;
    this.advance(); // FUNCTION
    const name = this.expect(TT.IDENTIFIER).value;
    const params = this.check(TT.LPAREN) ? this.parseParamList() : [];
    // RETURNS is optional — some exam questions omit the return type
    let returnType = null;
    if (this.check(TT.KW, 'RETURNS')) {
      this.advance(); // consume RETURNS
      // Return type is also optional (e.g. bare "RETURNS" with no type)
      if (this.peek().type === TT.KW &&
          ['INTEGER','REAL','STRING','BOOLEAN','CHAR'].includes(this.peek().value)) {
        returnType = this.advance().value;
      } else if (this.peek().type === TT.IDENTIFIER) {
        returnType = this.advance().value;
      }
    }
    const body = this.parseBlock(['ENDFUNCTION']);
    this.expect(TT.KW, 'ENDFUNCTION');
    return { kind: 'FunctionDef', name, params, returnType, body, line };
  }

  parseParamList() {
    const params = [];
    this.expect(TT.LPAREN);
    if (!this.check(TT.RPAREN)) {
      params.push(this.parseParam());
      while (this.match(TT.COMMA)) params.push(this.parseParam());
    }
    this.expect(TT.RPAREN);
    return params;
  }

  parseParam() {
    let byRef = false;
    if (this.match(TT.KW, 'BYREF'))        byRef = true;
    else if (this.match(TT.KW, 'BYVAL'))   byRef = false; // AS 9618 spelling
    else this.match(TT.KW, 'BYVALUE');     // optional keyword, default
    const nameTok = this.expect(TT.IDENTIFIER);
    const name = nameTok.value;
    this._checkIdentifierName(name, nameTok.line);
    this.expect(TT.COLON);
    const type = this.advance().value;
    return { name, type, byRef };
  }

  // ── File operations ───────────────────────────────────────────────────────

  parseOpenFile() {
    const line = this.peek().line;
    this.advance(); // OPENFILE
    const filename = this.parseExpr();
    this.expect(TT.KW, 'FOR');
    const mode = this.advance().value; // READ | WRITE | APPEND
    return { kind: 'OpenFile', filename, mode, line };
  }

  parseReadFile() {
    const line = this.peek().line;
    this.advance(); // READFILE
    const filename = this.parseExpr();
    this.expect(TT.COMMA);
    const name = this.expect(TT.IDENTIFIER).value;
    // Support array element target: READFILE "f.txt", arr[i]
    if (this.check(TT.LBRACKET)) {
      this.advance();
      const idx1 = this.parseExpr();
      let idx2 = null;
      if (this.match(TT.COMMA)) idx2 = this.parseExpr();
      this.expect(TT.RBRACKET);
      return { kind: 'ReadFile', filename, target: name, idx1, idx2, line };
    }
    return { kind: 'ReadFile', filename, target: name, line };
  }

  parseWriteFile() {
    const line = this.peek().line;
    this.advance(); // WRITEFILE
    const filename = this.parseExpr();
    this.expect(TT.COMMA);
    const value = this.parseExpr();
    return { kind: 'WriteFile', filename, value, line };
  }

  parseCloseFile() {
    const line = this.peek().line;
    this.advance(); // CLOSEFILE
    const filename = this.parseExpr();
    if (this.match(TT.COMMA))
      throw new RuntimeError('CLOSEFILE takes one filename — use a separate CLOSEFILE for each file', line);
    return { kind: 'CloseFile', filename, line };
  }

  // ── Expressions ───────────────────────────────────────────────────────────

  parseExpr() { return this.parseOr(); }

  parseOr() {
    let left = this.parseAnd();
    while (this.check(TT.KW, 'OR')) {
      const line = this.peek().line; this.advance();
      left = { kind: 'BinOp', op: 'OR', left, right: this.parseAnd(), line };
    }
    return left;
  }

  parseAnd() {
    let left = this.parseNot();
    while (this.check(TT.KW, 'AND')) {
      const line = this.peek().line; this.advance();
      left = { kind: 'BinOp', op: 'AND', left, right: this.parseNot(), line };
    }
    return left;
  }

  parseNot() {
    if (this.check(TT.KW, 'NOT')) {
      const line = this.peek().line; this.advance();
      return { kind: 'UnaryOp', op: 'NOT', operand: this.parseNot(), line };
    }
    return this.parseComparison();
  }

  parseComparison() {
    let left = this.parseConcat();
    const ops = { [TT.EQ]:'=', [TT.NEQ]:'<>', [TT.LT]:'<', [TT.LTE]:'<=', [TT.GT]:'>', [TT.GTE]:'>=' };
    while (ops[this.peek().type]) {
      const line = this.peek().line;
      const op = ops[this.advance().type];
      left = { kind: 'BinOp', op, left, right: this.parseConcat(), line };
    }
    return left;
  }

  parseConcat() {
    let left = this.parseAddSub();
    while (this.check(TT.AMPERSAND)) {
      const line = this.peek().line; this.advance();
      left = { kind: 'BinOp', op: '&', left, right: this.parseAddSub(), line };
    }
    return left;
  }

  parseAddSub() {
    let left = this.parseMulDiv();
    while (this.check(TT.PLUS) || this.check(TT.MINUS)) {
      const line = this.peek().line;
      const op = this.advance().value;
      left = { kind: 'BinOp', op, left, right: this.parseMulDiv(), line };
    }
    return left;
  }

  parseMulDiv() {
    let left = this.parseUnary();
    while (
      this.check(TT.STAR) || this.check(TT.SLASH) ||
      this.check(TT.KW, 'MOD') || this.check(TT.KW, 'DIV')
    ) {
      const line = this.peek().line;
      const op = this.advance().value;
      left = { kind: 'BinOp', op, left, right: this.parseUnary(), line };
    }
    return left;
  }

  parseUnary() {
    if (this.check(TT.MINUS)) {
      const line = this.peek().line; this.advance();
      return { kind: 'UnaryOp', op: '-', operand: this.parsePrimary(), line };
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    const t = this.peek();

    if (t.type === TT.INTEGER || t.type === TT.REAL) {
      this.advance();
      return { kind: 'Literal', value: t.value, line: t.line };
    }
    if (t.type === TT.STRING || t.type === TT.CHAR) {
      this.advance();
      return { kind: 'Literal', value: t.value, line: t.line };
    }
    if (t.type === TT.BOOLEAN) {
      this.advance();
      return { kind: 'Literal', value: t.value, line: t.line };
    }
    if (t.type === TT.LPAREN) {
      this.advance();
      const expr = this.parseExpr();
      this.expect(TT.RPAREN);
      return expr;
    }

    // Built-in functions & keywords used as functions
    if (t.type === TT.IDENTIFIER) {
      this.advance();
      // Built-in function call (e.g. LENGTH(...), ROUND(...))
      if (BUILTIN_NAMES.has(t.value.toUpperCase()) && this.check(TT.LPAREN)) {
        return this.parseBuiltinCall(t.value.toUpperCase());
      }
      // Array access
      if (this.check(TT.LBRACKET)) {
        this.advance();
        const idx1 = this.parseExpr();
        let idx2 = null;
        if (this.match(TT.COMMA)) idx2 = this.parseExpr();
        this.expect(TT.RBRACKET);
        // Allow Arr[i].Field in expressions
        if (this.check(TT.DOT)) {
          this.advance();
          const field = this.expect(TT.IDENTIFIER).value;
          return { kind: 'MemberAccess', object: { kind: 'ArrayAccess', name: t.value, idx1, idx2, line: t.line }, field, line: t.line };
        }
        return { kind: 'ArrayAccess', name: t.value, idx1, idx2, line: t.line };
      }
      // Member access in expression: Var.Field
      if (this.check(TT.DOT)) {
        this.advance();
        const field = this.expect(TT.IDENTIFIER).value;
        return { kind: 'MemberAccess', object: { kind: 'Var', name: t.value, line: t.line }, field, line: t.line };
      }
      // User-defined function call
      if (this.check(TT.LPAREN)) {
        const args = this.parseArgList();
        return { kind: 'FunctionCall', name: t.value, args, line: t.line };
      }
      return { kind: 'Var', name: t.value, line: t.line };
    }

    // MOD and DIV as function calls: MOD(a, b) / DIV(a, b)
    if (t.type === TT.KW && (t.value === 'MOD' || t.value === 'DIV') && this.check_next_lparen()) {
      this.advance();
      return this.parseBuiltinCall(t.value);
    }

    throw new RuntimeError(`Unexpected token '${t.value ?? t.type}' (line ${t.line})`, t.line);
  }

  // Peek one ahead to see if the token after current is LPAREN
  check_next_lparen() {
    return this.peek(1).type === TT.LPAREN;
  }

  parseBuiltinCall(name) {
    this.expect(TT.LPAREN);
    const args = [];
    if (!this.check(TT.RPAREN)) {
      args.push(this.parseExpr());
      while (this.match(TT.COMMA)) args.push(this.parseExpr());
    }
    this.expect(TT.RPAREN);
    return { kind: 'FunctionCall', name, args, line: this.peek().line };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ENVIRONMENT  (scope chain)
// ══════════════════════════════════════════════════════════════════════════════

class Environment {
  constructor(parent = null) {
    this.vars   = new Map();
    this.types  = new Map(); // declared type names (uppercase key → type string)
    this.parent = parent;
  }

  // Used for DECLARE — records the declared type alongside the default value
  defineTyped(name, value, typeName) {
    const key = name.toUpperCase();
    this.vars.set(key, value);
    if (typeName) this.types.set(key, typeName.toUpperCase());
  }

  define(name, value) { this.vars.set(name.toUpperCase(), value); }

  getDeclaredType(name) {
    const key = name.toUpperCase();
    if (this.types.has(key)) return this.types.get(key);
    if (this.parent)         return this.parent.getDeclaredType(name);
    return null;
  }

  get(name) {
    const key = name.toUpperCase();
    if (this.vars.has(key)) return this.vars.get(key);
    if (this.parent)        return this.parent.get(name);
    throw new RuntimeError(`Undefined variable '${name}'`);
  }

  set(name, value) {
    const key = name.toUpperCase();
    if (this.vars.has(key)) { this.vars.set(key, value); return; }
    if (this.parent)        { this.parent.set(name, value); return; }
    throw new RuntimeError(`Undefined variable '${name}'`);
  }

  has(name) {
    const key = name.toUpperCase();
    return this.vars.has(key) || (this.parent?.has(name) ?? false);
  }

  // Return flat snapshot for variable watch window
  snapshot() {
    const out = {};
    if (this.parent) Object.assign(out, this.parent.snapshot());
    for (const [k, v] of this.vars) {
      out[k] = v instanceof PseudoArray ? v.display() : v;
    }
    return out;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// PSEUDO ARRAY
// ══════════════════════════════════════════════════════════════════════════════

class PseudoArray {
  constructor(lo1, hi1, lo2, hi2, elementType = null) {
    this.lo1 = lo1; this.hi1 = hi1;
    this.lo2 = lo2; this.hi2 = hi2;
    this.elementType = elementType;
    const size1 = hi1 - lo1 + 1;
    const size2 = lo2 !== null ? hi2 - lo2 + 1 : 1;
    this.data = new Array(size1 * size2).fill(null);
    this.size2 = size2;
  }

  _idx(i, j) {
    const r = (i - this.lo1) * (this.size2);
    const c = j !== null ? (j - this.lo2) : 0;
    return r + c;
  }

  get(i, j = null) { return this.data[this._idx(i, j)]; }
  set(i, j = null, v) { this.data[this._idx(i, j)] = v; }

  display() {
    if (this.lo2 === null) {
      return `[${this.data.map(v => v ?? '∅').join(', ')}]`;
    }
    const rows = [];
    for (let i = this.lo1; i <= this.hi1; i++) {
      const row = [];
      for (let j = this.lo2; j <= this.hi2; j++) row.push(this.get(i, j) ?? '∅');
      rows.push(`[${row.join(', ')}]`);
    }
    return rows.join('\n');
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// PSEUDO RECORD  (TYPE...ENDTYPE instances)
// ══════════════════════════════════════════════════════════════════════════════

class PseudoRecord {
  constructor(typeName, fields) {
    this.typeName = typeName;
    this.fields   = {}; // field name (uppercase) → value
    for (const { name, type } of fields) {
      const key = name.toUpperCase();
      switch (type.toUpperCase()) {
        case 'INTEGER': this.fields[key] = 0;     break;
        case 'REAL':    this.fields[key] = 0.0;   break;
        case 'BOOLEAN': this.fields[key] = false; break;
        default:        this.fields[key] = '';    break; // STRING / CHAR
      }
      // Store original casing for display
      this.fields[`__name_${key}`] = name;
    }
    this._fieldDefs = fields;
  }

  get(field) {
    const key = field.toUpperCase();
    if (!(key in this.fields)) throw new RuntimeError(`Record has no field '${field}'`);
    return this.fields[key];
  }

  set(field, value) {
    const key = field.toUpperCase();
    if (!(key in this.fields)) throw new RuntimeError(`Record has no field '${field}'`);
    this.fields[key] = value;
  }

  display() {
    return this._fieldDefs.map(f => `${f.name}: ${this.fields[f.name.toUpperCase()]}`).join(', ');
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// INTERPRETER
// ══════════════════════════════════════════════════════════════════════════════

// Unwrap Number objects returned by ROUND to primitives for arithmetic/comparison.
function _unbox(v) { return v instanceof Number ? v.valueOf() : v; }

// If one operand is a numeric string and the other is a number, coerce both to numbers.
function _numericCoerce(a, b) {
  a = _unbox(a); b = _unbox(b);
  if (typeof a === 'string' && typeof b === 'number' && !isNaN(Number(a))) return [Number(a), b];
  if (typeof b === 'string' && typeof a === 'number' && !isNaN(Number(b))) return [a, Number(b)];
  return [a, b];
}

export class Interpreter {
  constructor() {
    this.reset();
  }

  reset() {
    this.globalEnv    = new Environment();
    this.procedures   = new Map();
    this.functions    = new Map();
    this.typeDefs     = new Map(); // user-defined record types (TYPE...ENDTYPE)
    this.outputLines  = [];
    this.virtualFiles = new Map(); // filename → { mode, lines[], cursor }
    this.inputQueue   = [];
    this.inputCursor  = 0;

    // Debug
    this.breakpoints     = new Set();    // 1-based line numbers
    this.debugMode       = false;
    this.stepMode        = false;
    this._stepResolve    = null;
    this._stopped        = false;
    this._currentLine    = 0;
    this.onLineChange    = null;         // callback(lineNo)
    this.onOutput        = null;         // callback(text)
    this.onInputRequest  = null;         // callback(varName) → Promise<string>
    this.onError         = null;         // callback(err)
    this.onVarsChange    = null;         // callback(snapshot)
    this.onFilesChange   = null;         // callback(filesMap)

    // Prompt tracking (outputs before INPUT are flagged so test runner can ignore them)
    this._promptIndices    = new Set();
    this._lastPromptFloor  = 0;
    this._inputsConsumed   = false;  // set true if any INPUT statement is executed

    // Analytics
    this.errorLog        = [];
    this.constructsUsed  = new Set();
  }

  // ── Input queue ──────────────────────────────────────────────────────────

  setInputQueue(values) {
    this.inputQueue  = values.filter(v => v !== '');
    this.inputCursor = 0;
  }

  async _readInput(varName) {
    this._inputsConsumed = true;

    // Mark only the immediately preceding output as a prompt (if it is non-numeric).
    // Outputs further back are program data, not prompts — e.g. "Too low" / "Too high"
    // in a loop should not be stripped just because another INPUT follows.
    const last = this.outputLines.length - 1;
    if (last >= this._lastPromptFloor && isNaN(String(this.outputLines[last]).trim())) {
      this._promptIndices.add(last);
    }
    this._lastPromptFloor = this.outputLines.length;

    if (this.inputCursor < this.inputQueue.length) {
      return this.inputQueue[this.inputCursor++];
    }
    if (this.onInputRequest) {
      return await this.onInputRequest(varName);
    }
    throw new RuntimeError(`No input available for '${varName}'`);
  }

  // ── Debug controls ───────────────────────────────────────────────────────

  setBreakpoints(lineSet) { this.breakpoints = new Set(lineSet); }

  step() {
    if (this._stepResolve) { const r = this._stepResolve; this._stepResolve = null; r(); }
  }

  async _pauseIfNeeded(line) {
    this._currentLine = line;
    if (this.onLineChange) this.onLineChange(line);
    if (this.onVarsChange) this.onVarsChange(this.globalEnv.snapshot());

    if (this.debugMode) {
      if (this.stepMode || this.breakpoints.has(line)) {
        this.stepMode = true; // once a breakpoint hits, step from there
        await new Promise(resolve => { this._stepResolve = resolve; });
      }
    }
  }

  // ── Run ──────────────────────────────────────────────────────────────────

  async run(source, { debug = false, stepMode = false, relaxedIdentifiers = false } = {}) {
    this.debugMode = debug;
    this.stepMode  = stepMode;

    let tokens, ast;
    try {
      tokens = new Lexer(source).tokenise();
      ast    = new Parser(tokens, { relaxedIdentifiers }).parseProgram();
    } catch (e) {
      this._logError(e);
      if (this.onError) this.onError(e);
      return;
    }

    try {
      await this._execBlock(ast, this.globalEnv);
    } catch (e) {
      if (e instanceof ReturnSignal) {
        // top-level RETURN ignored
      } else {
        this._logError(e);
        if (this.onError) this.onError(e);
      }
    }
  }

  _logError(e) {
    this.errorLog.push({ message: e.message, line: e.pseudoLine ?? this._currentLine });
  }

  // ── Block & statement execution ──────────────────────────────────────────

  async _execBlock(stmts, env) {
    for (const stmt of stmts) {
      if (stmt) await this._execStmt(stmt, env);
    }
  }

  async _execStmt(stmt, env) {
    await this._pauseIfNeeded(stmt.line);

    switch (stmt.kind) {

      case 'TypeDef': {
        this.typeDefs.set(stmt.typeName.toUpperCase(), stmt);
        break;
      }

      case 'Declare': {
        this.constructsUsed.add('DECLARE');
        const ti = stmt.typeInfo;
        const declNames = stmt.names ?? [stmt.name];
        for (const declName of declNames) {
          if (ti.kind === 'ArrayType') {
            const lo1 = this._evalNum(ti.lo1, env);
            const hi1 = this._evalNum(ti.hi1, env);
            const lo2 = ti.lo2 ? this._evalNum(ti.lo2, env) : null;
            const hi2 = ti.hi2 ? this._evalNum(ti.hi2, env) : null;
            // Array of user-defined records
            const arr = new PseudoArray(lo1, hi1, lo2, hi2, ti.elementType ?? null);
            const recDef = this.typeDefs.get((ti.elementType ?? '').toUpperCase());
            if (recDef) {
              for (let idx = 0; idx < arr.data.length; idx++) {
                arr.data[idx] = new PseudoRecord(recDef.typeName, recDef.fields);
              }
            }
            env.defineTyped(declName, arr, ti.name ?? 'ARRAY');
          } else {
            // Check if it's a user-defined record type
            const recDef = this.typeDefs.get((ti.name ?? '').toUpperCase());
            if (recDef) {
              env.defineTyped(declName, new PseudoRecord(recDef.typeName, recDef.fields), ti.name);
            } else {
              env.defineTyped(declName, this._defaultValue(ti.name), ti.name);
            }
          }
        }
        break;
      }

      case 'Constant': {
        const val = this._eval(stmt.value, env);
        env.define(stmt.name, val);
        break;
      }

      case 'Assign': {
        // Check for uninitialised counter/accumulator: x ← x + expr
        if (stmt.lhs.kind === 'Var' && stmt.rhs.kind === 'BinOp' && stmt.rhs.op === '+') {
          const name = stmt.lhs.name;
          const { left, right } = stmt.rhs;
          const nameUp = name.toUpperCase();
          const refersToSelf = (left.kind  === 'Var' && left.name.toUpperCase()  === nameUp) ||
                               (right.kind === 'Var' && right.name.toUpperCase() === nameUp);
          if (refersToSelf) {
            let uninit = !env.has(name);
            if (!uninit) { try { if (env.get(name) === null) uninit = true; } catch (_) { uninit = true; } }
            if (uninit) throw new RuntimeError(
              `'${name}' has not been initialised — set it to 0 before the loop begins`,
              stmt.line
            );
          }
        }
        const val = await this._evalAsync(stmt.rhs, env);
        if (stmt.lhs.kind === 'Var') {
          const declType = env.getDeclaredType(stmt.lhs.name);
          if (declType) {
            const typeErr = this._checkTypeCompat(val, declType, stmt.lhs.name);
            if (typeErr) throw new RuntimeError(typeErr, stmt.line);
          }
        }
        this._assign(stmt.lhs, val, env);
        if (this.onVarsChange) this.onVarsChange(env.snapshot());
        break;
      }

      case 'Input': {
        this.constructsUsed.add('INPUT');
        const raw = await this._readInput(stmt.target);
        if (stmt.idx1 !== undefined) {
          const arr = env.get(stmt.target);
          if (!(arr instanceof PseudoArray)) throw new RuntimeError(`'${stmt.target}' is not an array`, stmt.line);
          const coerced = this._coerceInput(raw, env, stmt.target, arr.elementType);
          const i = this._evalNum(stmt.idx1, env);
          const j = stmt.idx2 ? this._evalNum(stmt.idx2, env) : null;
          arr.set(i, j, coerced);
        } else {
          const coerced = this._coerceInput(raw, env, stmt.target);
          if (env.has(stmt.target)) env.set(stmt.target, coerced);
          else                      env.define(stmt.target, coerced);
        }
        if (this.onVarsChange) this.onVarsChange(env.snapshot());
        break;
      }

      case 'Output': {
        this.constructsUsed.add('OUTPUT');
        const parts = await Promise.all(stmt.exprs.map(e => this._evalAsync(e, env)));
        const line  = parts.map(v => this._stringify(v)).join('');
        this.outputLines.push(line);
        if (this.onOutput) this.onOutput(line);
        break;
      }

      case 'If': {
        this.constructsUsed.add('IF');
        const cond = this._eval(stmt.condition, env);
        if (cond) await this._execBlock(stmt.thenBranch, env);
        else      await this._execBlock(stmt.elseBranch, env);
        break;
      }

      case 'Case': {
        this.constructsUsed.add('CASE');
        const val = this._eval(stmt.expr, env);
        let matched = false;
        for (const branch of stmt.branches) {
          const matches = branch.matchers.some(({ low, high }) => {
            const lo = this._eval(low, env);
            return high !== null
              ? val >= lo && val <= this._eval(high, env)
              : val === lo;
          });
          if (matches) {
            await this._execBlock(branch.body, env);
            matched = true;
            break;
          }
        }
        if (!matched && stmt.otherwise) {
          await this._execBlock(stmt.otherwise, env);
        }
        break;
      }

      case 'For': {
        this.constructsUsed.add('FOR');
        let start = this._evalNum(stmt.start, env);
        const end = this._evalNum(stmt.end, env);
        const step = stmt.step ? this._evalNum(stmt.step, env) : 1;
        if (!env.has(stmt.variable))
          throw new RuntimeError(`Variable '${stmt.variable}' used as FOR counter but not declared`, stmt.line);
        env.set(stmt.variable, start);
        const cmp = step >= 0 ? () => env.get(stmt.variable) <= end
                               : () => env.get(stmt.variable) >= end;
        while (cmp()) {
          await this._execBlock(stmt.body, env);
          env.set(stmt.variable, env.get(stmt.variable) + step);
        }
        break;
      }

      case 'While': {
        this.constructsUsed.add('WHILE');
        while (this._eval(stmt.condition, env)) {
          await this._execBlock(stmt.body, env);
        }
        break;
      }

      case 'Repeat': {
        this.constructsUsed.add('REPEAT');
        do {
          await this._execBlock(stmt.body, env);
        } while (!this._eval(stmt.condition, env));
        break;
      }

      case 'ProcedureDef': {
        this.procedures.set(stmt.name.toUpperCase(), stmt);
        break;
      }

      case 'FunctionDef': {
        this.functions.set(stmt.name.toUpperCase(), stmt);
        break;
      }

      case 'CallStmt': {
        this.constructsUsed.add('CALL');
        await this._callProcedure(stmt.name, stmt.args, env);
        break;
      }

      case 'Return': {
        const retVal = this._eval(stmt.value, env);
        throw new ReturnSignal(retVal);
      }

      case 'OpenFile': {
        this.constructsUsed.add('FILE');
        const fname = this._stringify(this._eval(stmt.filename, env));
        const mode  = stmt.mode; // READ | WRITE | APPEND
        if (!this.virtualFiles.has(fname)) {
          this.virtualFiles.set(fname, { mode, lines: [], cursor: 0 });
        } else {
          const f = this.virtualFiles.get(fname);
          f.mode = mode;
          if (mode === 'WRITE') { f.lines = []; f.cursor = 0; }
          if (mode === 'READ')  f.cursor = 0;
        }
        if (this.onFilesChange) this.onFilesChange(this._filesSnapshot());
        break;
      }

      case 'ReadFile': {
        const fname = this._stringify(this._eval(stmt.filename, env));
        const file  = this.virtualFiles.get(fname);
        if (!file) throw new RuntimeError(`File '${fname}' is not open`, stmt.line);
        if (file.cursor >= file.lines.length)
          throw new RuntimeError(`EOF reached in '${fname}'`, stmt.line);
        const rawVal = file.lines[file.cursor++];
        if (stmt.idx1 !== undefined) {
          // Array element target: READFILE "f.txt", arr[i]
          const arr = env.get(stmt.target);
          if (!(arr instanceof PseudoArray)) throw new RuntimeError(`'${stmt.target}' is not an array`, stmt.line);
          const coerced = this._coerceInput(rawVal, env, stmt.target, arr.elementType);
          const i = this._evalNum(stmt.idx1, env);
          const j = stmt.idx2 ? this._evalNum(stmt.idx2, env) : null;
          arr.set(i, j, coerced);
        } else {
          const coerced = this._coerceInput(rawVal, env, stmt.target);
          if (env.has(stmt.target)) env.set(stmt.target, coerced);
          else                       env.define(stmt.target, coerced);
        }
        if (this.onVarsChange) this.onVarsChange(env.snapshot());
        break;
      }

      case 'WriteFile': {
        const fname = this._stringify(this._eval(stmt.filename, env));
        const file  = this.virtualFiles.get(fname);
        if (!file) throw new RuntimeError(`File '${fname}' is not open`, stmt.line);
        file.lines.push(this._stringify(this._eval(stmt.value, env)));
        if (this.onFilesChange) this.onFilesChange(this._filesSnapshot());
        break;
      }

      case 'CloseFile': {
        const fname = this._stringify(this._eval(stmt.filename, env));
        if (this.virtualFiles.has(fname)) {
          this.virtualFiles.get(fname).mode = null;
        }
        if (this.onFilesChange) this.onFilesChange(this._filesSnapshot());
        break;
      }

      default:
        break;
    }
  }

  // ── Procedure / Function call ────────────────────────────────────────────

  async _callProcedure(name, argNodes, callerEnv) {
    const def = this.procedures.get(name.toUpperCase());
    if (!def) throw new RuntimeError(`Undefined procedure '${name}'`);
    if (def.name !== name) throw new RuntimeError(`Procedure name spelling/capitalisation mismatch: defined as '${def.name}', called as '${name}'`);

    const localEnv = new Environment(this.globalEnv);
    const argVals  = argNodes.map(a => this._eval(a, callerEnv));

    for (let i = 0; i < def.params.length; i++) {
      const p = def.params[i];
      localEnv.define(p.name, argVals[i] ?? null);
    }

    try {
      await this._execBlock(def.body, localEnv);
    } catch (e) {
      if (!(e instanceof ReturnSignal)) throw e;
    }

    // BYREF: write back
    for (let i = 0; i < def.params.length; i++) {
      const p = def.params[i];
      if (!p.byRef) continue;
      const argNode = argNodes[i];
      if (!argNode) continue;
      const writtenVal = localEnv.get(p.name);
      if (argNode.kind === 'Var') {
        callerEnv.set(argNode.name, writtenVal);
      } else if (argNode.kind === 'ArrayAccess') {
        const arr = callerEnv.get(argNode.name);
        if (arr instanceof PseudoArray) {
          const i2 = this._evalNum(argNode.idx1, callerEnv);
          const j2 = argNode.idx2 ? this._evalNum(argNode.idx2, callerEnv) : null;
          arr.set(i2, j2, writtenVal);
        }
      } else if (argNode.kind === 'MemberAccess') {
        const obj = this._eval(argNode.object, callerEnv);
        if (obj instanceof PseudoRecord) obj.set(argNode.field, writtenVal);
      }
    }
  }

  async _callFunction(name, argNodes, callerEnv) {
    const def = this.functions.get(name.toUpperCase());
    if (!def) throw new RuntimeError(`Undefined function '${name}'`);
    if (def.name !== name) throw new RuntimeError(`Function name spelling/capitalisation mismatch: defined as '${def.name}', called as '${name}'`);

    const localEnv = new Environment(this.globalEnv);
    const argVals  = argNodes.map(a => this._eval(a, callerEnv));

    for (let i = 0; i < def.params.length; i++) {
      localEnv.define(def.params[i].name, argVals[i] ?? null);
    }

    try {
      await this._execBlock(def.body, localEnv);
    } catch (e) {
      if (e instanceof ReturnSignal) return e.value;
      throw e;
    }
    throw new RuntimeError(`Function '${name}' did not return a value`);
  }

  // ── Expression evaluation ────────────────────────────────────────────────

  _eval(node, env) {
    switch (node.kind) {

      case 'Literal':
        return node.value;

      case 'Var': {
        const val = env.get(node.name);
        return val;
      }

      case 'ArrayAccess': {
        const arr = env.get(node.name);
        if (!(arr instanceof PseudoArray))
          throw new RuntimeError(`'${node.name}' is not an array`, node.line);
        const i = this._evalNum(node.idx1, env);
        const j = node.idx2 ? this._evalNum(node.idx2, env) : null;
        return arr.get(i, j);
      }

      case 'MemberAccess': {
        const obj = this._eval(node.object, env);
        if (!(obj instanceof PseudoRecord))
          throw new RuntimeError(`Cannot access field '${node.field}' — not a record`, node.line);
        return obj.get(node.field);
      }

      case 'BinOp':
        return this._evalBinOp(node, env);

      case 'UnaryOp': {
        if (node.op === '-') return -this._evalNum(node.operand, env);
        if (node.op === 'NOT') return !this._eval(node.operand, env);
        break;
      }

      case 'FunctionCall':
        return this._evalFunctionCall(node, env);

      default:
        throw new RuntimeError(`Unknown expression kind '${node.kind}'`, node.line);
    }
  }

  _evalNum(node, env) {
    const v = _unbox(this._eval(node, env));
    if (typeof v !== 'number') throw new RuntimeError(`Expected number, got '${v}'`, node.line);
    return v;
  }

  _evalBinOp(node, env) {
    const { op, left, right } = node;

    // Short-circuit boolean
    if (op === 'AND') return this._eval(left, env) && this._eval(right, env);
    if (op === 'OR')  return this._eval(left, env) || this._eval(right, env);

    const l = _unbox(this._eval(left, env));
    const r = _unbox(this._eval(right, env));

    switch (op) {
      case '+':  return l + r;
      case '-':  return l - r;
      case '*':  return l * r;
      case '/':  if (r === 0) throw new RuntimeError('Division by zero', node.line);
                 return l / r;
      case 'DIV': return Math.trunc(l / r);
      case 'MOD': return ((l % r) + r) % r;
      case '&':  return this._stringify(l) + this._stringify(r);
      case '=':  { const [a,b] = _numericCoerce(l,r); return a === b; }
      case '<>': { const [a,b] = _numericCoerce(l,r); return a !== b; }
      case '<':  { const [a,b] = _numericCoerce(l,r); return a < b; }
      case '<=': { const [a,b] = _numericCoerce(l,r); return a <= b; }
      case '>':  { const [a,b] = _numericCoerce(l,r); return a > b; }
      case '>=': { const [a,b] = _numericCoerce(l,r); return a >= b; }
      default: throw new RuntimeError(`Unknown operator '${op}'`, node.line);
    }
  }

  // Async variant of _eval — used for assignments and outputs so that
  // user-defined functions containing INPUT/loops run fully asynchronously.
  async _evalAsync(node, env) {
    if (node.kind === 'FunctionCall') {
      const name = node.name.toUpperCase();
      // Only user-defined functions need async; built-ins are sync
      if (!BUILTIN_NAMES.has(name)) {
        const def = this.functions.get(name);
        if (def) return this._callFunction(node.name, node.args, env);
      }
    }
    return this._eval(node, env);
  }

  _evalFunctionCall(node, env) {
    const name = node.name.toUpperCase();
    const args = node.args;

    switch (name) {
      case 'LENGTH': {
        const s = this._eval(args[0], env);
        if (typeof s === 'string') return s.length;
        if (s instanceof PseudoArray) return s.data.length;
        throw new RuntimeError('LENGTH requires a string or array', node.line);
      }
      case 'LCASE':
        return String(this._eval(args[0], env)).toLowerCase();
      case 'UCASE':
        return String(this._eval(args[0], env)).toUpperCase();
      case 'SUBSTRING':
      case 'MID': {
        const str   = String(this._eval(args[0], env));
        const start = this._evalNum(args[1], env) - 1; // 1-based
        const len   = this._evalNum(args[2], env);
        return str.substr(start, len);
      }
      case 'RIGHT': {
        const str = String(this._eval(args[0], env));
        const len = this._evalNum(args[1], env);
        return str.slice(-len);
      }
      case 'LEFT': {
        const str = String(this._eval(args[0], env));
        const len = this._evalNum(args[1], env);
        return str.slice(0, len);
      }
      case 'TO_STRING':
      case 'NUM_TO_STR':
        return String(this._eval(args[0], env));
      case 'TO_INTEGER':
      case 'STR_TO_NUM':
        return parseInt(this._eval(args[0], env), 10);
      case 'TO_REAL':
        return parseFloat(this._eval(args[0], env));
      case 'INT':
        return Math.trunc(this._evalNum(args[0], env));
      case 'ROUND': {
        const val = this._eval(args[0], env);
        const dp  = args[1] ? this._evalNum(args[1], env) : 0;
        // Return a RoundedReal so _stringify can preserve the decimal places
        const n = parseFloat(Number(val).toFixed(dp));
        return Object.assign(new Number(n), { _dp: dp });
      }
      case 'RANDOM':
      case 'RAND':
        return Math.random();
      case 'EOF': {
        const fname = this._stringify(this._eval(args[0], env));
        const file  = this.virtualFiles.get(fname);
        if (!file) throw new RuntimeError(`File '${fname}' is not open`, node.line);
        return file.cursor >= file.lines.length;
      }
      case 'MOD': {
        const a = this._evalNum(args[0], env);
        const b = this._evalNum(args[1], env);
        return ((a % b) + b) % b;
      }
      case 'DIV': {
        const a = this._evalNum(args[0], env);
        const b = this._evalNum(args[1], env);
        return Math.trunc(a / b);
      }
      default: {
        // User-defined function — must use await if async; but _eval is sync.
        // For user functions we need async. Throw a special signal.
        const def = this.functions.get(name);
        if (def) {
          // We can't await here (sync eval). Wrap value evaluation in a trick:
          // Actually we need to handle this properly — collect args synchronously,
          // then raise a special error that the async caller catches.
          // For simplicity: user functions in expressions must be pure/synchronous
          // (no INPUT inside them). We execute them synchronously with a simplified runner.
          return this._callFunctionSync(def, args, env, node.line);
        }
        throw new RuntimeError(`Unknown function '${node.name}'`, node.line);
      }
    }
  }

  _callFunctionSync(def, argNodes, callerEnv, line) {
    const localEnv = new Environment(this.globalEnv);
    const argVals  = argNodes.map(a => this._eval(a, callerEnv));
    for (let i = 0; i < def.params.length; i++) {
      localEnv.define(def.params[i].name, argVals[i] ?? null);
    }
    return this._execBlockSync(def.body, localEnv, line);
  }

  _execBlockSync(stmts, env, callLine) {
    for (const stmt of stmts) {
      const result = this._execStmtSync(stmt, env, callLine);
      if (result instanceof ReturnSignal) return result.value;
    }
    throw new RuntimeError('Function did not return a value', callLine);
  }

  _execStmtSync(stmt, env, callLine) {
    switch (stmt.kind) {
      case 'Declare': {
        const _ti = stmt.typeInfo;
        for (const _n of (stmt.names ?? [stmt.name])) {
          env.define(_n, this._defaultValue(_ti.name));
        }
        break;
      }
      case 'Assign': this._assign(stmt.lhs, this._eval(stmt.rhs, env), env); break;
      case 'If': {
        const cond = this._eval(stmt.condition, env);
        const branch = cond ? stmt.thenBranch : stmt.elseBranch;
        for (const s of branch) {
          const r = this._execStmtSync(s, env, callLine);
          if (r instanceof ReturnSignal) return r;
        }
        break;
      }
      case 'Return': return new ReturnSignal(this._eval(stmt.value, env));
      default: break;
    }
    return null;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _assign(lhs, val, env) {
    if (lhs.kind === 'Var') {
      if (env.has(lhs.name)) env.set(lhs.name, val);
      else                    env.define(lhs.name, val);
    } else if (lhs.kind === 'ArrayAccess') {
      const arr = env.get(lhs.name);
      if (!(arr instanceof PseudoArray))
        throw new RuntimeError(`'${lhs.name}' is not an array`, lhs.line);
      const i = this._evalNum(lhs.idx1, env);
      const j = lhs.idx2 ? this._evalNum(lhs.idx2, env) : null;
      arr.set(i, j, _unbox(val));
    } else if (lhs.kind === 'MemberAccess') {
      const obj = this._eval(lhs.object, env);
      if (!(obj instanceof PseudoRecord))
        throw new RuntimeError(`Cannot assign to field '${lhs.field}' — not a record`, lhs.line);
      obj.set(lhs.field, val);
    }
  }

  _checkTypeCompat(value, declType, varName) {
    if (value === null || value === undefined) return null;
    switch (declType.toUpperCase()) {
      case 'INTEGER':
      case 'REAL':
        if (typeof value === 'string')
          return `Type mismatch: '${varName}' is declared as ${declType} but was assigned the string "${value}" — use a numeric value`;
        if (typeof value === 'boolean')
          return `Type mismatch: '${varName}' is declared as ${declType} but was assigned a BOOLEAN`;
        break;
      case 'STRING':
        if (typeof value === 'boolean')
          return `Type mismatch: '${varName}' is declared as STRING but was assigned a BOOLEAN — use TRUE/FALSE as strings if needed`;
        break;
      case 'CHAR':
        if (typeof value === 'boolean')
          return `Type mismatch: '${varName}' is declared as CHAR but was assigned a BOOLEAN`;
        if (typeof value === 'string' && value.length !== 1)
          return `Type mismatch: '${varName}' is declared as CHAR but was assigned a string of ${value.length} characters — CHAR holds exactly one character, use single quotes e.g. 'A'`;
        if (typeof value === 'number')
          return `Type mismatch: '${varName}' is declared as CHAR but was assigned a number — use single quotes e.g. 'A'`;
        break;
      case 'BOOLEAN':
        if (typeof value !== 'boolean')
          return `Type mismatch: '${varName}' is declared as BOOLEAN but was assigned ${typeof value === 'string' ? `"${value}"` : value} — use TRUE or FALSE`;
        break;
    }
    return null;
  }

  _defaultValue(typeName) {
    switch ((typeName ?? '').toUpperCase()) {
      case 'INTEGER': return 0;
      case 'REAL':    return 0.0;
      case 'BOOLEAN': return false;
      case 'STRING':
      case 'CHAR':    return '';
      default:        return null;
    }
  }

  _coerceInput(raw, env, varName, elementType = null) {
    // If an explicit element type is provided (e.g. for array elements), use it directly
    if (elementType) {
      const t = elementType.toUpperCase();
      if (t === 'CHAR')    return raw.charAt(0);
      if (t === 'INTEGER') return parseInt(raw, 10);
      if (t === 'REAL')    return parseFloat(raw);
      if (t === 'BOOLEAN') return raw.toUpperCase() === 'TRUE';
      return raw; // STRING or unknown
    }
    // Try to infer type from declared variable, else use heuristic
    try {
      const existing = env.get(varName);
      const declType = env.getDeclaredType?.(varName);
      if (declType === 'CHAR') return raw.charAt(0); // take first character only
      if (typeof existing === 'number') return Number(raw);
      if (typeof existing === 'boolean') return raw.toUpperCase() === 'TRUE';
    } catch (_) {}
    // Heuristic
    if (/^-?\d+$/.test(raw.trim()))          return parseInt(raw, 10);
    if (/^-?\d+\.\d+$/.test(raw.trim()))     return parseFloat(raw);
    if (/^(TRUE|FALSE)$/i.test(raw.trim()))  return raw.toUpperCase() === 'TRUE';
    return raw;
  }

  _stringify(v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    if (v instanceof PseudoArray)  return v.display();
    if (v instanceof PseudoRecord) return v.display();
    if (v instanceof Number && v._dp !== undefined) return v.valueOf().toFixed(v._dp);
    return String(v);
  }

  _filesSnapshot() {
    const out = {};
    for (const [name, f] of this.virtualFiles) {
      out[name] = { mode: f.mode, lines: [...f.lines], cursor: f.cursor };
    }
    return out;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  getOutput()      { return this.outputLines.join('\n'); }
  getErrors()      { return this.errorLog; }
  getFiles()       { return this._filesSnapshot(); }
  getConstructs()  { return [...this.constructsUsed]; }

  /** Pre-populate a virtual file with content (for OPENFILE/READFILE tests) */
  loadFile(name, content) {
    this.virtualFiles.set(name, {
      mode: null,
      lines: content.split('\n'),
      cursor: 0
    });
  }

  /** Export a virtual file's content as a string */
  exportFile(name) {
    const f = this.virtualFiles.get(name);
    return f ? f.lines.join('\n') : null;
  }
}
