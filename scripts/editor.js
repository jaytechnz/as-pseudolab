// ─── Editor: Syntax Highlighting + Gutter + Scroll Sync ──────────────────────
// Uses the textarea-behind-highlight-div technique:
//   .editor-highlight  (pointer-events:none, z-index 1)  ← coloured HTML
//   .editor-textarea   (transparent text, z-index 2)     ← real input target
//
// Token classes map to CSS in styles.css:
//   .tok-kw .tok-ctrl .tok-type .tok-fn .tok-str .tok-num
//   .tok-bool .tok-cmt .tok-op .tok-builtin .tok-err

// ══════════════════════════════════════════════════════════════════════════════
// TOKEN REGEX TABLE
// ══════════════════════════════════════════════════════════════════════════════

const CTRL_KEYWORDS = new Set([
  'IF','THEN','ELSE','ENDIF',
  'CASE','OF','OTHERWISE','ENDCASE',
  'FOR','TO','STEP','NEXT',
  'WHILE','DO','ENDWHILE',
  'REPEAT','UNTIL',
  'RETURN','CALL',
  'OPENFILE','READFILE','WRITEFILE','CLOSEFILE',
  'READ','WRITE','APPEND',
]);

const TYPE_KEYWORDS = new Set([
  'INTEGER','REAL','STRING','BOOLEAN','CHAR','ARRAY',
]);

const DECL_KEYWORDS = new Set([
  'DECLARE','CONSTANT','PROCEDURE','ENDPROCEDURE',
  'FUNCTION','ENDFUNCTION','RETURNS','BYREF','BYVALUE',
  'TYPE','ENDTYPE',
]);

const BUILTIN_FNS = new Set([
  'LENGTH','LCASE','UCASE','SUBSTRING',
  'TO_STRING','TO_INTEGER','TO_REAL',
  'ROUND','RANDOM','EOF','MOD','DIV',
]);

const IO_KEYWORDS = new Set(['INPUT','OUTPUT']);

// All words that should be uppercased automatically
const ALL_KEYWORDS = new Set([
  ...CTRL_KEYWORDS, ...TYPE_KEYWORDS, ...DECL_KEYWORDS, ...IO_KEYWORDS,
  ...BUILTIN_FNS,
  'AND','OR','NOT','TRUE','FALSE',
]);

// FOR-loop counter names that always stay lowercase
const LOOP_COUNTERS = new Set(['i','j','k']);

// Returns true if `text` (from line start to the point of interest) is inside
// a string literal or a comment — used to skip auto-formatting in those contexts.
function _isInStringOrComment(text) {
  let inStr = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (ch === inStr) inStr = null;
    } else {
      if (ch === '/' && text[i + 1] === '/') return true;
      if (ch === '"' || ch === "'") inStr = ch;
    }
  }
  return inStr !== null;
}

// Scan source for CONSTANT declarations and return a Set of their names (uppercased).
function _getConstantNames(source) {
  const names = new Set();
  const rx = /\bCONSTANT\s+([A-Za-z_][A-Za-z0-9_]*)/gi;
  let m;
  while ((m = rx.exec(source)) !== null) names.add(m[1].toUpperCase());
  return names;
}

// Ordered list of [className, RegExp] pairs — first match wins per position
const TOKEN_RULES = [
  ['tok-cmt',     /\/\/.*/y],
  ['tok-str',     /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/y],
  ['tok-num',     /-?\b\d+(?:\.\d+)?\b/y],
  ['tok-bool',    /\b(?:TRUE|FALSE)\b/y],
  ['tok-assign',  /←|<-/y],
  ['tok-op',      /[+\-*\/&=<>]+/y],
  ['tok-paren',   /[()[\],:.]/y],
  ['tok-word',    /[A-Za-z_][A-Za-z0-9_]*/y],
];

function classifyWord(word) {
  const upper = word.toUpperCase();
  if (upper === 'AND' || upper === 'OR' || upper === 'NOT') return 'tok-op';
  if (CTRL_KEYWORDS.has(upper))  return 'tok-ctrl';
  if (TYPE_KEYWORDS.has(upper))  return 'tok-type';
  if (DECL_KEYWORDS.has(upper))  return 'tok-kw';
  if (BUILTIN_FNS.has(upper))    return 'tok-builtin';
  if (IO_KEYWORDS.has(upper))    return 'tok-fn';
  return null; // identifier — no class
}

// ══════════════════════════════════════════════════════════════════════════════
// HIGHLIGHTER
// Returns an HTML string with span-wrapped tokens.
// Newlines become literal newlines (pre-wrap handles display).
// ══════════════════════════════════════════════════════════════════════════════

export function highlightLine(line) {
  let out = '';
  let i   = 0;

  while (i < line.length) {
    // Skip spaces / tabs — pass through verbatim
    if (line[i] === ' ' || line[i] === '\t') {
      out += line[i++];
      continue;
    }

    let matched = false;
    for (const [cls, rx] of TOKEN_RULES) {
      rx.lastIndex = i;
      const m = rx.exec(line);
      if (!m) continue;

      let tokenClass = cls;
      const text = m[0];

      if (cls === 'tok-word') {
        const wc = classifyWord(text);
        tokenClass = wc ?? ''; // no span for plain identifiers
      }

      if (tokenClass) {
        const display = (cls === 'tok-assign') ? '←' : escHtml(text);
        out += `<span class="${tokenClass}">${display}</span>`;
      } else {
        out += escHtml(text);
      }

      i += text.length;
      matched = true;
      break;
    }

    if (!matched) {
      out += escHtml(line[i++]);
    }
  }

  return out;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

export function highlightSource(source) {
  return source
    .split('\n')
    .map(highlightLine)
    .join('\n');
}

// ══════════════════════════════════════════════════════════════════════════════
// EDITOR CLASS
// Owns: textarea, highlight div, gutter div
// ══════════════════════════════════════════════════════════════════════════════

export class Editor {
  constructor({ textarea, highlight, gutter }) {
    this.textarea  = textarea;
    this.highlight = highlight;
    this.gutter    = gutter;

    this.breakpoints     = new Set();  // 1-based line numbers
    this.executingLine   = null;
    this._onChangeListeners = [];
    this._onBreakpoint   = null;       // callback(Set<number>)
    this._foldedBlocks   = new Map();  // startLine(1-based) → endLine(1-based)

    this._bindEvents();
  }

  // ── Folding ───────────────────────────────────────────────────────────────

  _findFoldableBlocks(lines) {
    // Returns Map of startLine(1-based) → endLine(1-based) for PROCEDURE/FUNCTION blocks
    const blocks = new Map();
    const stack  = [];
    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim().toUpperCase();
      if (/^(PROCEDURE|FUNCTION)\b/.test(t)) stack.push(i + 1);
      if (/^(ENDPROCEDURE|ENDFUNCTION)\b/.test(t) && stack.length) {
        const start = stack.pop();
        blocks.set(start, i + 1);
      }
    }
    return blocks;
  }

  _toggleFold(lineNo) {
    if (this._foldedBlocks.has(lineNo)) {
      this._foldedBlocks.delete(lineNo);
    } else {
      const lines  = this.textarea.value.split('\n');
      const blocks = this._findFoldableBlocks(lines);
      if (blocks.has(lineNo)) this._foldedBlocks.set(lineNo, blocks.get(lineNo));
    }
    this._refresh();
  }

  _isFoldable(lineNo, foldableBlocks) { return foldableBlocks.has(lineNo); }
  _isFolded(lineNo)  { return this._foldedBlocks.has(lineNo); }
  _isHidden(lineNo) {
    for (const [start, end] of this._foldedBlocks) {
      if (lineNo > start && lineNo <= end) return true;
    }
    return false;
  }

  // ── Bind ─────────────────────────────────────────────────────────────────

  _bindEvents() {
    this.textarea.addEventListener('input',  (e) => { this._checkAutoDeindent(); this._autoFormatWord(e); this._refresh(); });
    this.textarea.addEventListener('scroll', () => this._syncScroll());
    this.textarea.addEventListener('keydown', e => this._onKeydown(e));

    this.gutter.addEventListener('click', e => {
      if (e.target.classList.contains('fold-toggle')) {
        const lineNo = parseInt(e.target.dataset.line, 10);
        this._toggleFold(lineNo);
        return;
      }
      const line = e.target.closest('.gutter-line');
      if (!line) return;
      const lineNo = parseInt(line.dataset.line, 10);
      this._toggleBreakpoint(lineNo);
    });
  }

  _onKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const ta        = this.textarea;
      const pos       = ta.selectionStart;
      const val       = ta.value;
      const lineStart = val.lastIndexOf('\n', pos - 1) + 1;
      const curLine   = val.slice(lineStart, pos);
      const indent    = curLine.match(/^(\s*)/)[1];

      // Format the last word on the line before inserting the newline
      this._formatWordBefore(pos);

      // Increase indent after block-opening keywords
      let newVal  = this.textarea.value; // may have changed after format
      let newPos  = this.textarea.selectionStart;
      const newLineStart = newVal.lastIndexOf('\n', newPos - 1) + 1;
      const newLine      = newVal.slice(newLineStart, newPos);
      const trimmed      = newLine.trim().toUpperCase();
      const openers      = /^(IF\b|THEN\b|ELSE\b|FOR\b|WHILE\b.*\bDO\b|REPEAT\b|DO\b|PROCEDURE\b|FUNCTION\b|CASE\b.*\bOF\b|TYPE\b)/;
      const extraIndent  = openers.test(trimmed) ? '   ' : '';

      // NEXT: deindent the NEXT line itself by one level before inserting newline
      if (/^NEXT\b/i.test(trimmed) && indent.length >= 3) {
        const newIndent = indent.slice(3);
        const deindented = newIndent + newLine.trimStart();
        newVal = newVal.slice(0, newLineStart) + deindented + newVal.slice(newLineStart + newLine.length);
        newPos = newLineStart + deindented.length;
        this.textarea.value = newVal;
        this.textarea.setSelectionRange(newPos, newPos);
      }

      const insertion = '\n' + (indent.length >= 3 && /^NEXT\b/i.test(trimmed) ? indent.slice(3) : indent) + extraIndent;
      this._insertAt(newPos, insertion, this.textarea.selectionEnd);
      return;
    }

    if (e.key === '-') {
      const ta  = this.textarea;
      const pos = ta.selectionStart;
      if (pos > 0 && ta.value[pos - 1] === '<') {
        e.preventDefault();
        this._insertAt(pos - 1, '←', ta.selectionEnd);
        return;
      }
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = this.textarea;
      if (e.shiftKey) {
        // Shift+Tab: remove up to 3 leading spaces from current line
        const pos       = ta.selectionStart;
        const lineStart = ta.value.lastIndexOf('\n', pos - 1) + 1;
        const spaces    = ta.value.slice(lineStart).match(/^( {1,3})/);
        if (spaces) {
          ta.setSelectionRange(lineStart, lineStart + spaces[1].length);
          this._insertAt(lineStart, '', lineStart + spaces[1].length);
        }
      } else {
        this._insertAt(ta.selectionStart, '   ', ta.selectionEnd);
      }
    }
  }

  // Direct textarea insert — works in all browsers, preserves undo stack where possible
  _insertAt(start, text, end) {
    const ta  = this.textarea;
    const val = ta.value;
    ta.value  = val.slice(0, start) + text + val.slice(end);
    const cur = start + text.length;
    ta.setSelectionRange(cur, cur);
    this._refresh();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  getValue()    { return this.textarea.value; }
  setValue(src) { this.textarea.value = src.replace(/<-/g, '←'); this._refresh(); }

  onChange(fn)    { this._onChangeListeners.push(fn); }
  onBreakpoint(fn){ this._onBreakpoint = fn; }

  setExecutingLine(lineNo) {
    this.executingLine = lineNo;
    this._renderGutter(this.getValue().split('\n').length);
  }

  clearExecutingLine() {
    this.executingLine = null;
    this._renderGutter(this.getValue().split('\n').length);
  }

  getBreakpoints() { return new Set(this.breakpoints); }

  clearBreakpoints() {
    this.breakpoints.clear();
    this._renderGutter(this.getValue().split('\n').length);
    if (this._onBreakpoint) this._onBreakpoint(this.breakpoints);
  }

  // Formats the word immediately before `pos` in the textarea.
  // Shared by _autoFormatWord (space/punctuation trigger) and Enter handler.
  _formatWordBefore(pos) {
    const ta  = this.textarea;
    const val = ta.value;
    let wordEnd = pos;
    while (wordEnd > 0 && /[A-Za-z0-9_]/.test(val[wordEnd - 1])) wordEnd--;
    // wordEnd now points to start of trailing word; walk back further to find its end
    // Actually: scan backwards from pos to find the word
    let end = pos;
    // skip any non-word chars right before pos (e.g. trailing space already typed)
    while (end > 0 && !/[A-Za-z0-9_]/.test(val[end - 1])) end--;
    let start = end;
    while (start > 0 && /[A-Za-z0-9_]/.test(val[start - 1])) start--;
    if (start >= end) return;

    const word = val.slice(start, end);
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(word)) return;

    const lineStart = val.lastIndexOf('\n', start - 1) + 1;
    if (_isInStringOrComment(val.slice(lineStart, start))) return;

    const upper = word.toUpperCase();
    const constants = _getConstantNames(val);
    let replacement;
    if (ALL_KEYWORDS.has(upper)) {
      replacement = upper;
    } else if (constants.has(upper)) {
      replacement = upper;
    } else if (LOOP_COUNTERS.has(word.toLowerCase())) {
      replacement = word.toLowerCase();
    } else {
      replacement = word[0].toUpperCase() + word.slice(1);
    }
    if (replacement === word) return;

    ta.value = val.slice(0, start) + replacement + val.slice(end);
    ta.setSelectionRange(pos, pos);
  }

  // ── Auto-format keywords and identifiers ─────────────────────────────────
  // Triggered on each input event. When the user types a word-terminating
  // character, looks back to find the previous word and reformats it:
  //   - Keywords → UPPERCASE
  //   - i / j / k → left lowercase (FOR loop counters)
  //   - Other identifiers → first letter capitalised, rest preserved

  _autoFormatWord(e) {
    // Only act on single-character insertions that terminate a word
    if (!e || e.inputType !== 'insertText') return;
    const ch = e.data;
    if (!ch || !/^[ \t()\[\]:,←\-]$/.test(ch)) return;

    const ta  = this.textarea;
    const pos = ta.selectionStart;
    const val = ta.value;

    // Find the word that ends just before the newly typed character
    // pos is after the inserted character; word ends at pos-1
    const wordEnd = pos - 1; // index of the terminator character
    if (wordEnd <= 0) return;

    // Walk back to find start of word
    let wordStart = wordEnd - 1;
    while (wordStart > 0 && /[A-Za-z0-9_]/.test(val[wordStart - 1])) wordStart--;
    if (wordStart >= wordEnd) return;

    const word = val.slice(wordStart, wordEnd);
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(word)) return; // not an identifier

    // Don't reformat inside a string or comment
    const lineStart = val.lastIndexOf('\n', wordStart - 1) + 1;
    if (_isInStringOrComment(val.slice(lineStart, wordStart))) return;

    // Determine replacement
    let replacement;
    const upper = word.toUpperCase();
    const constants = _getConstantNames(val);
    if (ALL_KEYWORDS.has(upper)) {
      replacement = upper;
    } else if (constants.has(upper)) {
      replacement = upper;
    } else if (LOOP_COUNTERS.has(word.toLowerCase())) {
      replacement = word.toLowerCase();
    } else {
      replacement = word[0].toUpperCase() + word.slice(1);
    }

    if (replacement === word) return; // nothing to change

    // Replace the word in-place, keeping cursor position intact
    const newVal = val.slice(0, wordStart) + replacement + val.slice(wordEnd);
    ta.value = newVal;
    ta.setSelectionRange(pos, pos);
  }

  // ── Auto de-indent on closing keywords ───────────────────────────────────

  _checkAutoDeindent() {
    const CLOSERS = new Set(['ENDIF','ENDCASE','ENDWHILE','UNTIL','ELSE','ENDPROCEDURE','ENDFUNCTION','ENDTYPE']);
    const ta  = this.textarea;
    const pos = ta.selectionStart;
    const val = ta.value;
    const lineStart = val.lastIndexOf('\n', pos - 1) + 1;
    const lineEnd   = val.indexOf('\n', lineStart);
    const curLine   = val.slice(lineStart, lineEnd === -1 ? val.length : lineEnd);

    // Must be exactly one of the closing keywords (trimmed), with leading whitespace
    const leading = curLine.match(/^( +)/)?.[1] ?? '';
    if (leading.length < 3) return;                        // nothing to remove
    const trimmedUp = curLine.trim().toUpperCase();
    if (!CLOSERS.has(trimmedUp) && !/^NEXT\b/.test(trimmedUp)) return; // not a closer

    // Remove 3 leading spaces
    const newLine  = leading.slice(3) + curLine.trimStart();
    const endIdx   = lineEnd === -1 ? val.length : lineEnd;
    ta.value       = val.slice(0, lineStart) + newLine + val.slice(endIdx);
    const newPos   = Math.max(lineStart, pos - 3);
    ta.setSelectionRange(newPos, newPos);
  }

  // ── Internal refresh ─────────────────────────────────────────────────────

  _refresh() {
    const src   = this.textarea.value;
    const lines = src.split('\n');

    // Update highlight — hidden lines are replaced with empty lines to keep
    // line count in sync with the textarea (required for scroll alignment).
    // The fold-start line gets an inline placeholder appended.
    const highlightLines = [];
    for (let i = 0; i < lines.length; i++) {
      const lineNo = i + 1;
      if (this._isHidden(lineNo)) {
        highlightLines.push('');
      } else if (this._isFolded(lineNo)) {
        const endLine = this._foldedBlocks.get(lineNo);
        const count   = endLine - lineNo - 1;
        highlightLines.push(
          highlightLine(lines[i]) +
          `<span class="fold-placeholder">  ··· ${count} line${count !== 1 ? 's' : ''} hidden ···</span>`
        );
      } else {
        highlightLines.push(highlightLine(lines[i]));
      }
    }
    this.highlight.innerHTML = highlightLines.join('\n') + '\n';

    // Update gutter
    this._renderGutter(lines.length);

    this._syncScroll();
    for (const fn of this._onChangeListeners) fn(src);
  }

  _renderGutter(lineCount) {
    const lines          = this.textarea.value.split('\n');
    const foldableBlocks = this._findFoldableBlocks(lines);
    let html = '';
    for (let i = 1; i <= lineCount; i++) {
      if (this._isHidden(i)) {
        // Keep an invisible slot so gutter stays aligned with textarea
        html += `<div class="gutter-line gutter-line--hidden" data-line="${i}"></div>`;
        continue;
      }
      const hasBp      = this.breakpoints.has(i);
      const isExec     = this.executingLine === i;
      const isFoldable = this._isFoldable(i, foldableBlocks);
      const isFolded   = this._isFolded(i);
      let cls = 'gutter-line';
      if (hasBp)  cls += ' has-breakpoint';
      if (isExec) cls += ' is-executing';
      const foldBtn = isFoldable
        ? `<span class="fold-toggle" data-line="${i}" title="${isFolded ? 'Expand' : 'Collapse'}">${isFolded ? '▶' : '▼'}</span>`
        : '';
      html += `<div class="${cls}" data-line="${i}">${i}${foldBtn}</div>`;
    }
    this.gutter.innerHTML = html;
  }

  _syncScroll() {
    const ta = this.textarea;
    this.highlight.scrollTop  = ta.scrollTop;
    this.highlight.scrollLeft = ta.scrollLeft;
    this.gutter.scrollTop     = ta.scrollTop;
  }

  _toggleBreakpoint(lineNo) {
    if (this.breakpoints.has(lineNo)) this.breakpoints.delete(lineNo);
    else                               this.breakpoints.add(lineNo);
    this._renderGutter(this.getValue().split('\n').length);
    if (this._onBreakpoint) this._onBreakpoint(new Set(this.breakpoints));
  }

  // ── Cursor info ───────────────────────────────────────────────────────────

  getCursorLineCol() {
    const pos  = this.textarea.selectionStart;
    const text = this.textarea.value.slice(0, pos);
    const lines = text.split('\n');
    return { line: lines.length, col: lines[lines.length - 1].length + 1 };
  }

  // ── Find / highlight error line ───────────────────────────────────────────

  markErrorLine(lineNo) {
    const lines = this.gutter.querySelectorAll('.gutter-line');
    lines.forEach(el => el.classList.remove('has-error'));
    if (lineNo && lineNo > 0) {
      const el = this.gutter.querySelector(`[data-line="${lineNo}"]`);
      if (el) el.classList.add('has-error');
    }
  }

  clearErrorLine() { this.markErrorLine(null); }

  // ── Import source ─────────────────────────────────────────────────────────

  insertAtCursor(text) {
    const ta = this.textarea;
    this._insertAt(ta.selectionStart, text, ta.selectionEnd);
  }
}
