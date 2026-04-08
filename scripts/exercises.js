// ─── 227 Cambridge AS & A Level 9618 Pseudocode Exercises ──────────────────────
// Each exercise: { id, category, title, difficulty, xp, description, tests, hints, starterCode, prelude, postlude, sourceCheck }
// tests: [{ inputs: string[], expected: string[] }]
// difficulty: 'easy' (10xp) | 'medium' (25xp) | 'hard' (50xp)

const XP = { easy: 10, medium: 25, hard: 50 };

const PROC_SCAFFOLD = '// Procedures and/or Functions\n\n\n\n// Main Program\n';

function ex(id, cat, title, diff, desc, tests, hints = [], starter = '', prelude = '', sourceCheck = null, postlude = '', stripRandomLoops = false, preludeTestOnly = false) {
  return { id, category: cat, title, difficulty: diff, xp: XP[diff], description: desc, tests, hints, starterCode: starter, prelude, postlude, sourceCheck, stripRandomLoops, preludeTestOnly };
}
function t(inputs, expected) { return { inputs, expected }; }

function requireBYREF(source) {
  return /\bBYREF\b/i.test(source) ? null : 'You must pass at least one parameter BYREF.';
}

function requireTwoLoops(source) {
  const count = (source.match(/^\s*(FOR|WHILE|REPEAT)\b/gim) || []).length;
  return count >= 2 ? null : 'You must use two separate loops as described.';
}

function requireNestedLoops(source) {
  const count = (source.match(/^\s*(FOR|WHILE|REPEAT)\b/gim) || []).length;
  return count >= 2 ? null : 'You must use nested loops (an outer loop and an inner loop).';
}

function fileCheck(source, ...modes) {
  if (!/\bOPENFILE\b/i.test(source))
    return 'You must open the file using OPENFILE before reading or writing.';
  const openCount  = (source.match(/\bOPENFILE\b/gi)  || []).length;
  const closeCount = (source.match(/\bCLOSEFILE\b/gi) || []).length;
  if (closeCount < openCount)
    return 'You must close the file with CLOSEFILE every time you open it.';
  for (const mode of modes) {
    if (!new RegExp(`\\bOPENFILE\\b[^\\n]*\\bFOR\\s+${mode}\\b`, 'i').test(source))
      return `You must open the file FOR ${mode} as the instructions require.`;
  }
  return null;
}

// ══════════════════════════════════════════════════════════════════════════════
// CATEGORY METADATA
// ══════════════════════════════════════════════════════════════════════════════

export const CATEGORIES = [
  { id: 'basics',     label: 'Basics & Data Types',              count: 25 },
  { id: 'operators',  label: 'Operators & Type Conversion',      count: 15 },
  { id: 'selection',  label: 'Selection',                        count: 20 },
  { id: 'iteration',  label: 'Iteration',                        count: 19 },
  { id: 'strings',    label: 'String Handling',                  count: 25 },
  { id: 'procedures', label: 'Functions & Procedures',           count: 45 },
  { id: 'arrays',     label: 'Arrays',                           count: 19 },
  { id: 'records',    label: 'Records',                          count: 15 },
  { id: 'files',      label: 'File Handling',                    count: 20 },
  { id: 'algorithms', label: 'Standard Algorithms',              count: 13 },
  { id: 'exam',       label: 'Exam Questions',                   count: 7  },
];

// ══════════════════════════════════════════════════════════════════════════════
// EXERCISES
// ══════════════════════════════════════════════════════════════════════════════

export const EXERCISES = [

// ─────────────────────────────────────────────────────────────────────────────
// BASICS & DATA TYPES  (25)
// Scenarios are drawn from computer architecture, networking, and data
// representation — themes specific to the AS 9618 course context.
// ─────────────────────────────────────────────────────────────────────────────

ex('bas-01','basics','CHAR: CSV Delimiter','easy',
`Declare a CHAR variable called \`Separator\`, assign it the comma character \`','\`, and OUTPUT it.`,
[t([],[','])],
['CHAR holds exactly one character', "Single quotes are used for CHAR literals; double quotes are for STRING"]),

ex('bas-02','basics','REAL: Clock Speed','easy',
`Declare a REAL variable called \`ClockGHz\`, assign it \`3.6\`, and OUTPUT it.`,
[t([],['3.6'])],
['Use DECLARE to create a REAL variable', 'Assign 3.6 and OUTPUT the variable']),

ex('bas-03','basics','STRING: Protocol Name','easy',
`Declare a STRING variable called \`Protocol\`, assign it \`"HTTP/1.1"\`, and OUTPUT it.`,
[t([],['HTTP/1.1'])],
['Use DECLARE to create a STRING variable', 'Assign the string and OUTPUT it']),

ex('bas-04','basics','BOOLEAN: Connection Flag','easy',
`Declare a BOOLEAN variable called \`IsConnected\`, assign it \`TRUE\`. Declare a second BOOLEAN variable called \`HasError\`, assign it \`FALSE\`. OUTPUT both on separate lines.`,
[t([],['TRUE','FALSE'])],
['Declare both variables, assign TRUE and FALSE, then write two OUTPUT statements']),

ex('bas-05','basics','INTEGER Constant: MTU','easy',
`Declare a CONSTANT called \`MAX_TRANSMISSION_UNIT\` with value \`1500\` (the standard Ethernet Maximum Transmission Unit in bytes). OUTPUT it.`,
[t([],['1500'])],
['Constants are declared with CONSTANT followed by the name, = and the value', 'Constants can be used directly in OUTPUT']),

ex('bas-06','basics','REAL Constant: Tax Rate','easy',
`Declare a CONSTANT called \`TAX_RATE\` with value \`0.2\` (20% VAT). OUTPUT it.`,
[t([],['0.2'])],
['Constants are declared with CONSTANT and cannot be reassigned', 'Use the constant name directly in OUTPUT']),

ex('bas-07','basics','Reassign a Register','easy',
`Declare an INTEGER variable \`Register\`. First assign it \`0\` (cleared state), then reassign it to \`255\` (all bits set). OUTPUT the final value.`,
[t([],['255'])],
['The first assignment clears the register; the second sets it to 255', 'OUTPUT runs after the second assignment']),

ex('bas-08','basics','Screen Resolution','medium',
`Declare INTEGER variables \`ScreenWidth\` and \`ScreenHeight\` using a single DECLARE statement. Assign \`ScreenWidth ← 1920\` and \`ScreenHeight ← 1080\`. OUTPUT the total pixel count (Width × Height).`,
[t([],['2073600'])],
['Multiple variables of the same type can be declared in a single DECLARE statement', 'Multiply the two variables together inside the OUTPUT statement']),

ex('bas-09','basics','Input a Port Number','easy',
`INPUT an integer \`Port\` (a network port number). Use NUM_TO_STR and concatenation to OUTPUT \`Port: \` followed by the port number on a single line.`,
[t(['8080'],['Port: 8080']), t(['443'],['Port: 443'])],
['Use NUM_TO_STR to convert Port to a string, then join it with the label using &']),

ex('bas-10','basics','Swap Two Buffers','medium',
`Declare STRING variables \`BufferA ← "PING"\` and \`BufferB ← "PONG"\`. Swap their contents using a third variable \`Temp\`. OUTPUT \`BufferA\` then \`BufferB\` after the swap.`,
[t([],['PONG','PING'])],
['Copy BufferA into Temp, then BufferB into BufferA, then Temp into BufferB']),

ex('bas-11','basics','Input a Hostname','easy',
`INPUT a server hostname into a STRING variable \`Hostname\`. OUTPUT \`Connecting to: \` followed by the hostname.`,
[t(['cambridge.org'],['Connecting to: cambridge.org']), t(['localhost'],['Connecting to: localhost'])],
['Use the & operator to join "Connecting to: " with the Hostname variable']),

ex('bas-12','basics','Packet Size Sum','easy',
`INPUT two INTEGER packet sizes \`SizeA\` and \`SizeB\` (in bytes). OUTPUT their combined size.`,
[t(['512','256'],['768']), t(['1000','400'],['1400'])],
['Add SizeA and SizeB together inside the OUTPUT statement']),

ex('bas-13','basics','CHAR and STRING Pair','medium',
`Declare a CHAR variable \`StatusCode\` and assign it \`\'E\'\`. Declare a STRING variable \`StatusText\` and assign it \`"Error"\`. OUTPUT both on separate lines.`,
[t([],['E','Error'])],
["CHAR uses single quotes: 'E'", 'STRING uses double quotes: "Error"', 'Two separate OUTPUT statements']),

ex('bas-14','basics','Build a URL','medium',
`Declare \`Scheme ← "https"\` and \`Domain ← "cambridge.org"\`. Use string concatenation to OUTPUT the full URL: \`https://cambridge.org\`.`,
[t([],['https://cambridge.org'])],
['Join Scheme, "://", and Domain using the & operator']),

ex('bas-15','basics','Version String','medium',
`INPUT two integers \`Major\` and \`Minor\` (a version number). Use NUM_TO_STR to OUTPUT the version in the format \`v2.5\`.`,
[t(['2','5'],['v2.5']), t(['1','0'],['v1.0'])],
['Use NUM_TO_STR to convert each integer to a string', 'Join all parts using &: the "v" prefix, the two converted numbers, and the "." separator between them']),

ex('bas-16','basics','Course Label','easy',
`Declare \`Course ← "AS"\` and \`Code ← "9618"\`. OUTPUT \`AS 9618\` using string concatenation.`,
[t([],['AS 9618'])],
['Join Course, a space " ", and Code using the & operator']),

ex('bas-17','basics','Power Calculation','easy',
`Declare \`Voltage ← 12.0\` (volts) and \`Current ← 2.5\` (amps). Calculate and OUTPUT the power in watts (P = V × I).`,
[t([],['30'])],
['Multiply Voltage by Current inside the OUTPUT statement', '12.0 × 2.5 = 30']),

ex('bas-18','basics','Error Code Message','medium',
`INPUT an INTEGER \`ErrorCode\`. OUTPUT \`Error \` followed by the error code as text.`,
[t(['404'],['Error 404']), t(['500'],['Error 500'])],
['Use NUM_TO_STR(ErrorCode) to convert the integer to a string, then concatenate with "Error "']),

ex('bas-19','basics','Remaining Storage','medium',
`Declare \`TotalGB ← 256\` and \`UsedGB ← 87\`. OUTPUT the remaining storage available.`,
[t([],['169'])],
['Subtract UsedGB from TotalGB inside the OUTPUT statement']),

ex('bas-20','basics','Three Status Levels','easy',
`OUTPUT the three log severity levels on separate lines: \`INFO\`, \`WARNING\`, \`ERROR\`.`,
[t([],['INFO','WARNING','ERROR'])],
['Write three separate OUTPUT statements, one for each severity level']),

ex('bas-21','basics','Retry Counter','medium',
`Declare an INTEGER variable \`Retries\` and assign it \`0\`. Increment it three times (each time: \`Retries ← Retries + 1\`). OUTPUT the final value.`,
[t([],['3'])],
['Each increment adds 1 to Retries', 'After three increments, Retries equals 3']),

ex('bas-22','basics','Bits in a Nibble','easy',
`Declare CONSTANT \`NIBBLE_BITS = 4\` and CONSTANT \`BYTE_BITS = 8\`. OUTPUT both on separate lines.`,
[t([],['4','8'])],
['Declare both constants, then output each by name']),

ex('bas-23','basics','Zero a Register','easy',
`Declare INTEGER variable \`Accumulator\`. Assign it \`255\`, then reset it to \`0\`. OUTPUT its final value.`,
[t([],['0'])],
['The second assignment overwrites the first', 'OUTPUT after the reset']),

ex('bas-24','basics','Input Two Values, Output in Order','easy',
`INPUT a bandwidth in Mbps into \`Download\` and a bandwidth into \`Upload\`. OUTPUT Download then Upload on separate lines.`,
[t(['100','20'],['100','20']), t(['500','50'],['500','50'])],
['Use two INPUT statements followed by two OUTPUT statements']),

ex('bas-25','basics','Kilobytes to Bytes','medium',
`INPUT an INTEGER \`FileSizeKB\` (file size in kilobytes). Calculate the size in bytes (1 KB = 1024 bytes) and OUTPUT it.`,
[t(['4'],['4096']), t(['8'],['8192'])],
['Multiply FileSizeKB by 1024 inside the OUTPUT statement']),

// ─────────────────────────────────────────────────────────────────────────────
// OPERATORS & TYPE CONVERSION  (15)
// ─────────────────────────────────────────────────────────────────────────────

ex('ope-01','operators','Integer Division with DIV','easy',
`A 1500-byte Ethernet frame is split into segments of 512 bytes. Declare \`FrameSize ← 1500\` and \`SegmentSize ← 512\`. OUTPUT how many complete segments fit using \`DIV\`.`,
[t([],['2'])],
['DIV gives the whole-number quotient: 1500 DIV 512 = 2 complete segments']),

ex('ope-02','operators','Sequence Number Wrap','easy',
`TCP sequence numbers wrap modulo 256 in this exercise. Declare \`SeqNum ← 260\`. OUTPUT the wrapped sequence number using \`MOD 256\`.`,
[t([],['4'])],
['260 MOD 256 = 4 — the sequence wraps back around to 4']),

ex('ope-03','operators','Byte Parity','easy',
`INPUT a byte value \`Byte\` (an integer). If \`Byte MOD 2 = 0\`, OUTPUT \`Even parity\`; otherwise OUTPUT \`Odd parity\`.`,
[t(['128'],['Even parity']), t(['127'],['Odd parity']), t(['0'],['Even parity'])],
['MOD 2 tests divisibility by 2', '0 remainder means even parity; 1 means odd parity']),

ex('ope-04','operators','INT: Truncate a Frequency','easy',
`A signal frequency is measured as \`3.78\` GHz. Declare \`FreqGHz ← 3.78\`. Use \`INT()\` to truncate to a whole number and OUTPUT the result.`,
[t([],['3'])],
['INT() truncates towards zero — 3.78 becomes 3, not 4']),

ex('ope-05','operators','INT of Negative Voltage','medium',
`A voltage reading is \`-2.9\` V. Declare \`Voltage ← -2.9\`. Use \`INT()\` to truncate it and OUTPUT the result.`,
[t([],['-2'])],
['INT() truncates towards zero — -2.9 becomes -2, not -3']),

ex('ope-06','operators','STR_TO_NUM: Parse a Timeout','easy',
`A timeout value arrives as a string \`TimeoutStr ← "30"\`. Use \`STR_TO_NUM()\` to convert it to an integer, add 5 seconds as a buffer, and OUTPUT the result.`,
[t([],['35'])],
['STR_TO_NUM("30") converts the string to the integer 30', 'Then add 5 and OUTPUT the sum']),

ex('ope-07','operators','NUM_TO_STR: Build a Status Line','easy',
`Declare \`PacketsSent ← 42\`. Use \`NUM_TO_STR()\` to build the string \`Packets sent: 42\` using concatenation only (no comma in OUTPUT).`,
[t([],['Packets sent: 42'])],
['NUM_TO_STR converts an integer to a string', 'Convert the integer to a string first, then join it with the label using &']),

ex('ope-08','operators','Input a Delay and Convert','medium',
`INPUT a delay in milliseconds as a string into \`DelayStr\`. Use \`STR_TO_NUM()\` to convert it, multiply by 1000 to convert to microseconds, and OUTPUT the result.`,
[t(['5'],['5000']), t(['20'],['20000'])],
['Use STR_TO_NUM to convert the string before multiplying by 1000']),

ex('ope-09','operators','Format a Version String','medium',
`INPUT two integers \`Major\` and \`Minor\`. OUTPUT the version as \`Version: 3.1\` (or whatever values are entered).`,
[t(['3','1'],['Version: 3.1']), t(['10','0'],['Version: 10.0'])],
['Use NUM_TO_STR to convert each integer to a string', 'Join the label, the two converted numbers, and the dot separator all using &']),

ex('ope-10','operators','Arithmetic Precedence in Data Calculation','medium',
`Declare \`Header ← 20\` (header bytes) and \`Payload ← 1000\` (payload bytes). OUTPUT the total frame size without extra parentheses: \`Header + Payload * 2\`. Then OUTPUT \`(Header + Payload) * 2\` on a second line.`,
[t([],['2020','2040'])],
['Multiplication has higher precedence: 20 + 1000 * 2 = 2020', 'Parentheses force the addition first: (20 + 1000) * 2 = 2040']),

ex('ope-11','operators','Valid Port Range','medium',
`INPUT an integer \`Port\`. Well-known ports are 0–1023; registered ports are 1024–49151. OUTPUT \`Registered\` if Port >= 1024 AND Port <= 49151, otherwise OUTPUT \`Other\`.`,
[t(['8080'],['Registered']), t(['80'],['Other']), t(['49151'],['Registered']), t(['49152'],['Other'])],
['Use AND to combine both boundary conditions']),

ex('ope-12','operators','Reserved Address Check','easy',
`INPUT an INTEGER \`Address\` (a simplified network address). OUTPUT \`Reserved\` if Address = 0 OR Address = 255 (broadcast), otherwise OUTPUT \`Available\`.`,
[t(['0'],['Reserved']), t(['255'],['Reserved']), t(['128'],['Available'])],
['Use OR to check both special address values']),

ex('ope-13','operators','Toggle Encryption Flag','easy',
`Declare \`IsEncrypted ← FALSE\`. OUTPUT \`Encrypting...\` if NOT IsEncrypted (i.e., currently unencrypted), otherwise OUTPUT \`Already encrypted\`.`,
[t([],['Encrypting...'])],
['NOT IsEncrypted is TRUE when IsEncrypted is FALSE', 'Use IF NOT IsEncrypted THEN ... ELSE ...']),

ex('ope-14','operators','Quotient and Remainder','medium',
`INPUT two integers \`Dividend\` and \`Divisor\`. OUTPUT the integer quotient on the first line and the remainder on the second.`,
[t(['13','4'],['3','1']), t(['20','6'],['3','2'])],
['Use DIV for the whole-number quotient', 'Use MOD for the remainder']),

ex('ope-15','operators','Validate and Convert a Score','hard',
`INPUT a string \`ScoreStr\`. If its LENGTH is greater than 0, convert it with \`STR_TO_NUM()\` and OUTPUT the score multiplied by 2. Otherwise OUTPUT \`No score provided\`.`,
[t(['7'],['14']), t(['25'],['50']), t([''],['No score provided'])],
['Use LENGTH to check the input is non-empty before converting', 'Only apply STR_TO_NUM when LENGTH > 0']),

// ─────────────────────────────────────────────────────────────────────────────
// SELECTION  (20)
// ─────────────────────────────────────────────────────────────────────────────

ex('sel-01','selection','HTTP Status Category','medium',
`INPUT an integer \`StatusCode\`. OUTPUT the category: \`Success\` (200–299), \`Client error\` (400–499), \`Server error\` (500–599), otherwise \`Other\`.`,
[t(['200'],['Success']), t(['404'],['Client error']), t(['500'],['Server error']), t(['301'],['Other'])],
['Test the 200-range first using >= 200 AND <= 299', 'Use ELSE IF for subsequent ranges']),

ex('sel-02','selection','Signal Strength Band','medium',
`INPUT an integer \`dBm\` (signal strength, typically negative). OUTPUT \`Strong\` if > -60, \`Moderate\` if > -80, \`Weak\` if > -100, or \`No signal\` if <= -100.`,
[t(['-55'],['Strong']), t(['-70'],['Moderate']), t(['-90'],['Weak']), t(['-105'],['No signal'])],
['Test the highest threshold (> -60) first', 'Use nested IF/ELSE IF to work down through the bands']),

ex('sel-03','selection','Grade Classification','medium',
`INPUT an integer \`Mark\` (0–100). OUTPUT the grade: \`A\` (≥70), \`B\` (≥55), \`C\` (≥40), or \`U\` (below 40).`,
[t(['75'],['A']), t(['60'],['B']), t(['42'],['C']), t(['30'],['U'])],
['Test the highest threshold first', 'Use ELSE IF for subsequent grades']),

ex('sel-04','selection','Access Level','medium',
`INPUT an integer \`Level\` (1–4). Use CASE OF to OUTPUT: 4→\`Admin\`, 3→\`Moderator\`, 2→\`User\`, 1→\`Guest\`. Use OTHERWISE to OUTPUT \`Invalid level\`.`,
[t(['4'],['Admin']), t(['2'],['User']), t(['1'],['Guest']), t(['0'],['Invalid level'])],
['Use CASE OF Level with a branch for each value 1 to 4', 'Add OTHERWISE for anything else']),

ex('sel-05','selection','ASCII Category','medium',
`INPUT an integer \`Code\` (an ASCII code). Use CASE OF with ranges to OUTPUT: 65 TO 90 → \`Uppercase letter\`, 97 TO 122 → \`Lowercase letter\`, 48 TO 57 → \`Digit\`. Use OTHERWISE to OUTPUT \`Other character\`.`,
[t(['65'],['Uppercase letter']), t(['97'],['Lowercase letter']), t(['52'],['Digit']), t(['32'],['Other character'])],
['CASE OF supports range matching: 65 TO 90 : for uppercase letters', 'Add OTHERWISE for codes outside these ranges']),

ex('sel-06','selection','Validate Score Range','easy',
`INPUT an integer \`Score\`. OUTPUT \`Valid\` if it is between 0 and 100 inclusive, otherwise OUTPUT \`Invalid\`.`,
[t(['50'],['Valid']), t(['100'],['Valid']), t(['0'],['Valid']), t(['101'],['Invalid'])],
['Use AND to combine two conditions: Score >= 0 AND Score <= 100']),

ex('sel-07','selection','Authentication Check','medium',
`INPUT a STRING \`Password\` and a BOOLEAN \`TwoFA\`. OUTPUT \`Access granted\` if Password = "Cambridge9618" AND TwoFA = TRUE. Otherwise OUTPUT \`Access denied\`.`,
[t(['Cambridge9618','TRUE'],['Access granted']), t(['Cambridge9618','FALSE'],['Access denied']), t(['wrong','TRUE'],['Access denied'])],
['Use AND to require both conditions to be true']),

ex('sel-08','selection','Ticket Price by Age','medium',
`INPUT an integer \`Age\`. Output the ticket price: under 12 pay \`5\`, 65 or over pay \`7\`, everyone else pays \`12\`.`,
[t(['8'],['5']), t(['30'],['12']), t(['65'],['7']), t(['11'],['5'])],
['Check Age < 12 first, then Age >= 65, then else for the standard price']),

ex('sel-09','selection','Subnet Classifier','hard',
`INPUT an integer \`Address\` (0–255, the first octet of an IPv4 address). OUTPUT the class: \`Class A\` (1–126), \`Class B\` (128–191), \`Class C\` (192–223), or \`Special\` for anything else.`,
[t(['10'],['Class A']), t(['172'],['Class B']), t(['192'],['Class C']), t(['240'],['Special'])],
['Check Class A range first: Address >= 1 AND Address <= 126', 'Use AND for each range check']),

ex('sel-10','selection','Packet Validity Check','hard',
`INPUT an integer \`DataLen\` and an integer \`MaxLen\`. OUTPUT: \`Invalid: negative\` if DataLen < 0, \`Empty packet\` if DataLen = 0, \`Valid\` if DataLen <= MaxLen, otherwise \`Oversized\`.`,
[t(['-1','1500'],['Invalid: negative']), t(['0','1500'],['Empty packet']), t(['512','1500'],['Valid']), t(['2000','1500'],['Oversized'])],
['Test the error conditions first (negative, then zero)', 'Then check if DataLen is within the maximum']),

ex('sel-11','selection','Error Priority','hard',
`INPUT three integer error codes \`Code1\`, \`Code2\`, \`Code3\`. OUTPUT \`Critical\` if any code = 500. OUTPUT \`Warning\` if none are 500 but any are > 300. Otherwise OUTPUT \`OK\`.`,
[t(['200','500','201'],['Critical']), t(['301','201','100'],['Warning']), t(['200','201','202'],['OK'])],
['Check if any code equals 500 first using OR', 'Then check if any code > 300 using another OR']),

ex('sel-12','selection','BMI Category','hard',
`INPUT a REAL \`BMI\`. OUTPUT: \`Underweight\` (< 18.5), \`Normal\` (< 25.0), \`Overweight\` (< 30.0), or \`Obese\` (≥ 30.0).`,
[t(['17.5'],['Underweight']), t(['22.0'],['Normal']), t(['27.3'],['Overweight']), t(['32.0'],['Obese'])],
['Test the thresholds in ascending order using ELSE IF']),

ex('sel-13','selection','Password Strength','hard',
`INPUT a STRING \`Password\`. OUTPUT \`Strong\` if its length is 8 or more AND it does not equal \`"password"\`, otherwise OUTPUT \`Weak\`.`,
[t(['Cambridge9618'],['Strong']), t(['short'],['Weak']), t(['password'],['Weak'])],
['Use LENGTH to check the length, and AND to combine both conditions']),

ex('sel-14','selection','Data Type from Size','medium',
`INPUT an integer \`Bits\`. Use CASE OF to OUTPUT the data type: 1→\`Boolean\`, 8→\`Byte\`, 16→\`Word\`, 32→\`Double word\`, 64→\`Quad word\`. Use OTHERWISE for \`Unknown\`.`,
[t(['1'],['Boolean']), t(['8'],['Byte']), t(['32'],['Double word']), t(['24'],['Unknown'])],
['Use CASE OF Bits with integer values matching each data size']),

ex('sel-15','selection','CASE: File Permission Bits','hard',
`INPUT an integer \`Perms\` (0–7, a Unix-style permission octet). Use CASE OF to OUTPUT: 0→\`None\`, 1→\`Execute\`, 2→\`Write\`, 3→\`Write+Execute\`, 4→\`Read\`, 5→\`Read+Execute\`, 6→\`Read+Write\`, 7→\`Full access\`. Use OTHERWISE for \`Invalid\`.`,
[t(['7'],['Full access']), t(['4'],['Read']), t(['3'],['Write+Execute']), t(['8'],['Invalid'])],
['Use CASE OF Perms with a branch for each value 0 to 7']),

ex('sel-16','selection','Number Classification','medium',
`INPUT an integer \`Number\`. OUTPUT \`Large positive\` if > 100, \`Small positive\` if > 0, \`Zero\` if = 0, or \`Negative\` if < 0.`,
[t(['150'],['Large positive']), t(['50'],['Small positive']), t(['0'],['Zero']), t(['-5'],['Negative'])],
['Test the largest positive range first to avoid overlap']),

ex('sel-17','selection','HTTP Method Handler','easy',
`INPUT a string \`Method\`. Use CASE OF to OUTPUT: \`"GET"\`→\`Retrieve data\`, \`"POST"\`→\`Submit data\`, \`"PUT"\`→\`Update data\`, \`"DELETE"\`→\`Remove data\`. OTHERWISE OUTPUT \`Unknown method\`.`,
[t(['GET'],['Retrieve data']), t(['POST'],['Submit data']), t(['DELETE'],['Remove data']), t(['PATCH'],['Unknown method'])],
['CASE OF works with strings as well as integers']),

ex('sel-18','selection','Nested IF: Loan Decision','hard',
`INPUT an integer \`Income\` and a BOOLEAN \`HasGoodCredit\`. If Income >= 30000 AND HasGoodCredit = TRUE, OUTPUT \`Approved\`. If Income >= 30000 AND HasGoodCredit = FALSE, OUTPUT \`Review needed\`. Otherwise OUTPUT \`Declined\`.`,
[t(['35000','TRUE'],['Approved']), t(['35000','FALSE'],['Review needed']), t(['20000','TRUE'],['Declined'])],
['Test Income >= 30000 in the outer IF', 'Nest a second IF inside to check HasGoodCredit']),

ex('sel-19','selection','Memory Address Region','medium',
`INPUT an integer \`Address\`. OUTPUT \`Zero page\` if Address < 256, \`Main memory\` if Address < 32768, or \`Extended memory\` otherwise.`,
[t(['128'],['Zero page']), t(['1000'],['Main memory']), t(['40000'],['Extended memory'])],
['Test the smallest range (< 256) first', 'Use ELSE IF for the next range']),

ex('sel-20','selection','Divisibility Classifier','medium',
`INPUT an integer \`Number\`. OUTPUT \`Divisible by 3 and 5\` if divisible by both, \`Divisible by 3\` if only by 3, \`Divisible by 5\` if only by 5, or \`Neither\`.`,
[t(['15'],['Divisible by 3 and 5']), t(['9'],['Divisible by 3']), t(['10'],['Divisible by 5']), t(['7'],['Neither'])],
['Check the combined condition first', 'Then check each individually in ELSE IF branches']),

// ─────────────────────────────────────────────────────────────────────────────
// ITERATION  (19)
// ─────────────────────────────────────────────────────────────────────────────

ex('ite-01','iteration','FOR: Bit Positions','easy',
`Use a FOR loop to OUTPUT the 8 bit positions in a byte (0 to 7), one per line.`,
[t([],['0','1','2','3','4','5','6','7'])],
['A FOR loop starting at 0 and ending at 7 will visit all 8 bit positions', 'Output the loop variable on each iteration']),

ex('ite-02','iteration','FOR: Hex Row Values','easy',
`Use a FOR loop to OUTPUT the first 6 multiples of 16 (16, 32, 48, 64, 80, 96), one per line. These are the row start addresses in a hex dump.`,
[t([],['16','32','48','64','80','96'])],
['Use a FOR loop that runs 6 times', 'On each iteration, multiply the counter by 16 to get the row start address']),

ex('ite-03','iteration','FOR: Total Packet Sizes','medium',
`INPUT 5 packet sizes (integers) one at a time. Accumulate the total in \`TotalBytes\` and OUTPUT it.`,
[t(['100','200','150','300','250'],['1000']), t(['64','128','192','256','320'],['960'])],
['Initialise an accumulator to 0 before the loop', 'Add each input to the accumulator on each iteration']),

ex('ite-04','iteration','FOR: ASCII Sequence','medium',
`INPUT an integer \`Start\` (a starting ASCII code). Use a FOR loop to OUTPUT the next 5 integers starting from Start, one per line.`,
[t(['65'],['65','66','67','68','69']), t(['48'],['48','49','50','51','52'])],
['Loop from Start to Start + 4 (5 values total)', 'Output the loop variable on each iteration']),

ex('ite-05','iteration','FOR: 4-Byte Aligned Addresses','easy',
`Use a FOR loop with STEP 4 to OUTPUT memory addresses from 0 to 20 (0, 4, 8, 12, 16, 20). These are 4-byte word-aligned addresses.`,
[t([],['0','4','8','12','16','20'])],
['Use a FOR loop that starts at 0 and ends at 20, incrementing by 4 each time']),

ex('ite-06','iteration','WHILE: Connection Retries','medium',
`Declare \`Retries ← 0\`. Use a WHILE loop: while Retries < 3, OUTPUT \`Attempting connection...\` followed by Retries + 1 (use NUM_TO_STR), then increment Retries. After the loop, OUTPUT \`Max retries reached\`.`,
[t([],['Attempting connection... 1','Attempting connection... 2','Attempting connection... 3','Max retries reached'])],
['The loop condition is that Retries has not yet reached 3 — in AS 9618, WHILE has no DO keyword', 'Convert the attempt number to a string before joining it with the message', 'Increment Retries inside the loop body']),

ex('ite-07','iteration','WHILE: Validate Packet Size','medium',
`Keep asking the user to INPUT a packet size until they enter a valid Ethernet payload size (1 to 1500 bytes inclusive). OUTPUT the valid size.`,
[t(['0','1501','512'],['512']), t(['100'],['100'])],
['Use a WHILE loop that continues while the input is outside the valid range', 'INPUT a new value on each iteration']),

ex('ite-08','iteration','WHILE: Count ERROR Log Entries','hard',
`Repeatedly INPUT log severity levels (1=INFO, 2=WARNING, 3=ERROR). Stop when -1 is entered (sentinel). Count how many ERROR entries (level = 3) were logged and OUTPUT the count.`,
[t(['1','3','2','3','1','-1'],['2']), t(['-1'],['0']), t(['3','3','3','-1'],['3'])],
['Initialise an error counter to 0 before the loop', 'INPUT the first value before the WHILE, then check inside the loop']),

ex('ite-09','iteration','REPEAT: Password Length Validation','medium',
`Use a REPEAT UNTIL loop to keep asking the user to INPUT a password until it has LENGTH >= 8 characters. OUTPUT the accepted password.`,
[t(['hi','short','securepass'],['securepass']), t(['longenough'],['longenough'])],
['The UNTIL condition checks whether the password is now long enough', 'The loop body always runs at least once — so the first input is always processed']),

ex('ite-11','iteration','FOR: Factorial','hard',
`INPUT a positive integer \`Number\`. Calculate its factorial using a FOR loop and OUTPUT the result.`,
[t(['5'],['120']), t(['1'],['1']), t(['6'],['720'])],
['Initialise a result variable to 1 before the loop (not 0 — why?)', 'Multiply the result by each counter value from 1 to Number']),

ex('ite-12','iteration','WHILE: Population Count (1-bits)','hard',
`INPUT a positive integer \`Byte\`. Use a WHILE loop to count how many 1-bits it contains (population count): on each iteration check if Byte MOD 2 = 1, increment a counter if so, then Byte ← Byte DIV 2. OUTPUT the count.`,
[t(['7'],['3']), t(['8'],['1']), t(['15'],['4']), t(['0'],['0'])],
['Initialise a bit counter to 0 before the loop', 'Each iteration, check the lowest bit using MOD 2, then discard it using integer division by 2']),

ex('ite-13','iteration','FOR: Stars Pattern','medium',
`INPUT an integer \`Rows\` (1–5). Use nested FOR loops to OUTPUT a right-angled triangle of asterisks: row 1 has 1 star, row 2 has 2, etc.`,
[t(['3'],['*','**','***']), t(['1'],['*'])],
['Use an outer loop from 1 to Rows', 'Build each row as a string by concatenating "*" in an inner loop'],
'', '', requireNestedLoops),

ex('ite-14','iteration','FOR: Checksum Calculation','hard',
`INPUT 8 byte values (integers 0–255). Calculate the checksum: sum all 8 values then take MOD 256. OUTPUT the checksum.`,
[t(['10','20','30','40','50','60','70','80'],['104']), t(['0','0','0','0','0','0','0','0'],['0'])],
['Accumulate the sum of all 8 inputs', 'OUTPUT Sum MOD 256 after the loop']),

ex('ite-15','iteration','FOR: Accumulate to Threshold','hard',
`Declare \`Total ← 0\`. Repeatedly INPUT positive integers, adding each to Total, until Total >= 100. Count how many numbers were needed and OUTPUT the count.`,
[t(['30','40','50'],['3']), t(['100'],['1']), t(['10','10','10','10','10','10','10','10','10','10'],['10'])],
['Initialise a counter to 0 before the loop', 'The loop continues while the running total is still below the threshold']),

ex('ite-16','iteration','FOR: Memory Word Alignment','hard',
`Use a FOR loop for addresses 1 to 16. For each address OUTPUT: \`Word aligned\` if divisible by 4, \`Half-word aligned\` if divisible by 2 but not 4, otherwise \`Byte aligned\`.`,
[t([],['Byte aligned','Half-word aligned','Byte aligned','Word aligned','Byte aligned','Half-word aligned','Byte aligned','Word aligned','Byte aligned','Half-word aligned','Byte aligned','Word aligned','Byte aligned','Half-word aligned','Byte aligned','Word aligned'])],
['Check divisible by 4 first (MOD 4 = 0)', 'Then divisible by 2 (MOD 2 = 0) in ELSE IF', 'Else it is byte aligned']),

ex('ite-17','iteration','WHILE: Collatz Sequence','hard',
`INPUT a positive integer \`Number\`. Apply the Collatz rule: if even, divide by 2; if odd, multiply by 3 and add 1. Repeat until the number equals 1. OUTPUT each value before applying the rule, but not the final 1.`,
[t(['6'],['6','3','10','5','16','8','4','2']), t(['1'],[])],
['Output Number before each step', 'Use MOD 2 = 0 to check if even', 'Stop when Number = 1']),

ex('ite-18','iteration','FOR: Celsius to Fahrenheit Table','medium',
`Use a FOR loop with STEP 10 to OUTPUT temperatures from 0°C to 50°C converted to Fahrenheit (F = C × 9 / 5 + 32), one per line.`,
[t([],['32','50','68','86','104','122'])],
['Use a FOR loop with STEP 10 to jump in intervals of 10°C', 'Apply the conversion formula F = C × 9/5 + 32 inside the loop']),

ex('ite-19','iteration','WHILE: GCD by Euclidean Algorithm','hard',
`INPUT two positive integers \`Num1\` and \`Num2\`. Compute the GCD: WHILE Num2 <> 0, set Temp ← Num2, Num2 ← Num1 MOD Num2, Num1 ← Temp. OUTPUT the GCD.`,
[t(['48','18'],['6']), t(['100','75'],['25']), t(['7','5'],['1'])],
['The Euclidean algorithm: repeatedly replace (a, b) with (b, a MOD b) until b = 0', 'The loop continues while the second number is not zero — use a temporary variable to hold the old value']),

ex('ite-20','iteration','FOR: Fibonacci Terms','hard',
`INPUT an integer \`Num\` (Num ≥ 2). OUTPUT the first Num terms of the Fibonacci sequence (1, 1, 2, 3, 5, …), one per line.`,
[t(['5'],['1','1','2','3','5']), t(['7'],['1','1','2','3','5','8','13'])],
['Output the first two terms (both 1) before the loop', 'Each new term = previous + current; use variables to track the last two terms']),

// ─────────────────────────────────────────────────────────────────────────────
// STRING HANDLING  (25)
// ─────────────────────────────────────────────────────────────────────────────

ex('str-01','strings','Validate Minimum Password Length','medium',
`INPUT a password string \`Password\`. If its LENGTH < 8, OUTPUT \`Too short: \` followed by the length and \` characters\`. Otherwise OUTPUT \`Accepted\`.`,
[t(['hello'],['Too short: 5 characters']), t(['securepassword'],['Accepted']), t(['12345678'],['Accepted'])],
['Use LENGTH(Password) to get the length', 'Build the "Too short" message using & and NUM_TO_STR(LENGTH(Password))']),

ex('str-02','strings','Normalise Protocol Name','easy',
`INPUT a protocol name into \`Protocol\` (the user may type in any case). OUTPUT it in uppercase to standardise it.`,
[t(['http'],['HTTP']), t(['TCP/ip'],['TCP/IP']), t(['FTP'],['FTP'])],
['Use UCASE(Protocol) to convert to uppercase before outputting']),

ex('str-03','strings','MID: Extract Substring','easy',
`Assign \`Text ← "Cambridge"\`. Use \`MID()\` to extract and OUTPUT \`"bridge"\` (6 characters starting at position 4).`,
[t([],['bridge'])],
['MID(string, start, length) — positions are 1-based', 'Count along the string to find where "bridge" starts and how many characters it contains']),

ex('str-04','strings','MID: Extract First Character','easy',
`INPUT a string into \`Word\`. Use \`MID()\` to OUTPUT only the first character.`,
[t(['Alice'],['A']), t(['Cambridge'],['C'])],
['Characters are numbered from 1; use a starting position of 1 and a length of 1 to get the first character']),

ex('str-05','strings','RIGHT: Last Characters','easy',
`Assign \`Text ← "9618"\`. Use \`RIGHT()\` to extract and OUTPUT the last 2 characters.`,
[t([],['18'])],
['RIGHT(string, n) returns the last n characters']),

ex('str-06','strings','LEFT: First Characters','easy',
`Assign \`Text ← "Cambridge"\`. Use \`LEFT()\` to extract and OUTPUT the first 3 characters.`,
[t([],['Cam'])],
['LEFT(string, n) returns the first n characters']),

ex('str-07','strings','MID: Extract from Input','medium',
`INPUT a string \`Text\` of at least 3 characters. OUTPUT the 3-character substring starting at position 2.`,
[t(['Hello'],['ell']), t(['Computer'],['omp'])],
['Set the starting position to 2 and the length to 3 in your MID call']),

ex('str-08','strings','Build Initials','medium',
`INPUT a first name into \`FirstName\` and a last name into \`LastName\`. Extract the first character of each, convert to uppercase, join with a "." between, and add a final ".". OUTPUT the initials (e.g. \`J.S.\`).`,
[t(['john','smith'],['J.S.']), t(['Ada','Lovelace'],['A.L.'])],
['Use MID to extract the first character of each name', 'Apply UCASE to capitalise each initial', 'Join the two capitalised initials with a dot between them and a dot at the end']),

ex('str-09','strings','Reverse a Three-Letter Word','medium',
`INPUT a 3-letter string into \`Word\`. OUTPUT the word reversed using MID.`,
[t(['Cat'],['taC']), t(['dog'],['god'])],
['Extract the characters at positions 3, 2, and 1 separately using MID', 'Concatenate them in that reverse order using &']),

ex('str-10','strings','Count Vowels','hard',
`INPUT a string into \`Word\`. Count how many vowels (a, e, i, o, u — case insensitive) it contains and OUTPUT the count.`,
[t(['Hello'],['2']), t(['Cambridge'],['3']), t(['rhythm'],['0'])],
['Loop from 1 to LENGTH(Word), extract each character with MID and LCASE', 'Check against "a", "e", "i", "o", "u" using OR']),

ex('str-11','strings','Palindrome Check','hard',
`INPUT a string into \`Word\`. Check if it is a palindrome (same forwards and backwards). OUTPUT \`Palindrome\` or \`Not a palindrome\`.`,
[t(['racecar'],['Palindrome']), t(['level'],['Palindrome']), t(['hello'],['Not a palindrome'])],
['Build a reversed version by looping from LENGTH(Word) down to 1', 'Concatenate MID(Word, Index, 1) on each iteration', 'Compare the reversed string to the original']),

ex('str-12','strings','First and Last Character','medium',
`INPUT a string \`Word\`. OUTPUT the first character and last character on separate lines.`,
[t(['Hello'],['H','o']), t(['AS'],['A','S'])],
['The first character is always at position 1', 'The last character is at the position given by the length of the string']),

ex('str-13','strings','Uppercase Initial','easy',
`INPUT a full name into \`FullName\`. OUTPUT the first character converted to uppercase.`,
[t(['alice'],['A']), t(['bob'],['B'])],
['Use MID to extract the first character, then UCASE to capitalise it']),

ex('str-14','strings','Check File Extension','medium',
`INPUT a filename into \`FileName\`. OUTPUT \`CSV file\` if the last 4 characters equal \`".csv"\` (case insensitive), otherwise OUTPUT \`Other file\`.`,
[t(['data.csv'],['CSV file']), t(['DATA.CSV'],['CSV file']), t(['report.txt'],['Other file'])],
['Use RIGHT(FileName, 4) to get the last 4 characters', 'Use LCASE before comparing to ".csv"']),

ex('str-15','strings','MID: Parse First Word','hard',
`Assign \`Sentence ← "Cambridge 9618"\`. Use MID or LEFT to extract \`"Cambridge"\` (the first 9 characters) and OUTPUT it.`,
[t([],['Cambridge'])],
['"Cambridge" is 9 characters; both LEFT and MID can extract a fixed number of characters from the start of a string']),

ex('str-16','strings','String Repeat','hard',
`INPUT a CHAR \`Ch\` and an integer \`Times\`. Build and OUTPUT a string consisting of \`Ch\` repeated \`Times\` times.`,
[t(['*','5'],['*****']), t(['X','3'],['XXX'])],
['Initialise a string variable to empty before the loop', 'Concatenate Ch to it on each iteration of the loop']),

ex('str-17','strings','MID: Extract Token from CSV','hard',
`Assign \`Record ← "Alice,16,Computer Science"\`. The first field ends at the comma (position 6). Use MID to extract the name (positions 1 to 5) and OUTPUT it.`,
[t([],['Alice'])],
['"Alice" is 5 characters, starting at position 1', 'Both LEFT and MID can extract characters from the start of a string']),

ex('str-18','strings','Truncate to N Characters','medium',
`INPUT a string \`Text\` and an integer \`Limit\`. If the string is longer than Limit characters, OUTPUT only the first Limit characters followed by \`...\`. Otherwise OUTPUT the string as-is.`,
[t(['Hello World','5'],['Hello...']), t(['Hi','5'],['Hi'])],
['Use LENGTH to check if the string exceeds Limit', 'If too long, extract only the first Limit characters and add "..." afterwards']),

ex('str-19','strings','Username Generator','medium',
`INPUT a first name and last name. Generate a username: first 3 characters of first name (lowercase) + first 3 characters of last name (lowercase). OUTPUT it.`,
[t(['Alice','Smith'],['alismi']), t(['Bob','Jones'],['bobjone'.substring(0,6)])],
['Use LEFT or MID to extract the first 3 characters of each name', 'Apply LCASE to convert to lowercase', 'Concatenate the two parts']),

ex('str-20','strings','Count Characters in Common','hard',
`INPUT two strings \`Str1\` and \`Str2\` of the same length. Count how many positions have the same character (case sensitive) and OUTPUT the count.`,
[t(['hello','hExlo'],['4']), t(['abc','abc'],['3']), t(['abc','xyz'],['0'])],
['Loop from 1 to LENGTH(Str1)', 'Compare MID(Str1, Index, 1) with MID(Str2, Index, 1)']),

ex('str-21','strings','RIGHT: File Extension','easy',
`INPUT a filename into \`FileName\`. Use \`RIGHT()\` to OUTPUT the last 3 characters (the extension without the dot).`,
[t(['data.csv'],['csv']), t(['report.txt'],['txt'])],
['RIGHT(FileName, 3) returns the last 3 characters']),

ex('str-22','strings','Case-Insensitive Comparison','medium',
`INPUT two strings \`Word1\` and \`Word2\`. OUTPUT \`Match\` if they are equal ignoring case, otherwise OUTPUT \`No match\`.`,
[t(['hello','HELLO'],['Match']), t(['Cat','cat'],['Match']), t(['dog','cat'],['No match'])],
['Convert both to the same case using LCASE before comparing']),

ex('str-23','strings','MID in a Loop','hard',
`INPUT a string \`Text\`. Use a FOR loop and MID to OUTPUT each character on a separate line.`,
[t(['Hi'],['H','i']), t(['Cat'],['C','a','t'])],
['Loop from 1 to LENGTH(Text)', 'OUTPUT MID(Text, Index, 1) on each iteration']),

ex('str-24','strings','Sentence Statistics','hard',
`INPUT a sentence into \`Sentence\`. OUTPUT its length on line 1, the sentence in uppercase on line 2, and the first character in lowercase on line 3.`,
[t(['Hello World'],['11','HELLO WORLD','h']), t(['AS'],['2','AS','a'])],
['Each of the three outputs uses a different string function: one measures length, one converts the whole string to a different case, and one extracts and converts a single character']),

ex('str-25','strings','MID: Extract Date Parts','hard',
`Assign \`DateStr ← "2025-09-15"\`. Extract and OUTPUT: the year (first 4 chars), the month (chars 6–7), and the day (chars 9–10) each on a separate line.`,
[t([],['2025','09','15'])],
['The year is the first 4 characters of the string', 'The month is 2 characters, starting after the first hyphen (count to find the position)', 'The day is 2 characters, starting after the second hyphen']),

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTIONS & PROCEDURES  (45)
// ─────────────────────────────────────────────────────────────────────────────

ex('pro-01','procedures','Simple Procedure','easy',
`Write a PROCEDURE called \`Greet\` with no parameters that OUTPUTs \`Hello!\`. Then CALL it once.`,
[t([],['Hello!'])],
['Procedure definitions begin with PROCEDURE and end with ENDPROCEDURE', 'Use the CALL keyword to invoke a procedure'],
PROC_SCAFFOLD),

ex('pro-02','procedures','Procedure with BYVAL Parameter','easy',
`Write a PROCEDURE \`ShowProtocol(BYVAL Name : STRING)\` that OUTPUTs \`Protocol: \` followed by the name. INPUT a protocol name and CALL the procedure.`,
[t(['HTTP'],['Protocol: HTTP']), t(['TCP'],['Protocol: TCP'])],
['BYVAL passes a copy — changes inside do not affect the caller', 'Use & to build the output string'],
PROC_SCAFFOLD),

ex('pro-03','procedures','Procedure: Compute Power Usage','easy',
`Write a PROCEDURE \`PrintPower(BYVAL Voltage : REAL, BYVAL Current : REAL)\` that OUTPUTs the power in watts (P = V × I). Call it with 12.0 and 2.5.`,
[t([],['30'])],
['Multiply Voltage by Current inside the procedure and OUTPUT the result'],
PROC_SCAFFOLD),

ex('pro-04','procedures','Procedure Called Multiple Times','medium',
`Write a PROCEDURE \`PrintSeparator\` that OUTPUTs \`----------\`. Call it three times.`,
[t([],['----------','----------','----------'])],
['Define the procedure once, then call it three times'],
PROC_SCAFFOLD),

ex('pro-05','procedures','Procedure with Two Parameters','medium',
`Write a PROCEDURE \`ShowInfo(BYVAL Name : STRING, BYVAL Age : INTEGER)\` that OUTPUTs a sentence like \`Alice is 16 years old\`. Use NUM_TO_STR and string concatenation (not a comma in OUTPUT). INPUT a name and an age, then CALL the procedure.`,
[t(['Alice','16'],['Alice is 16 years old']), t(['Bob','14'],['Bob is 14 years old'])],
['Use NUM_TO_STR to convert Age to a string, then join Name, the age, and the surrounding words using &'],
PROC_SCAFFOLD),

ex('pro-06','procedures','BYREF: Increment a Counter','medium',
`Write a PROCEDURE \`Increment(BYREF Count : INTEGER)\` that adds 1 to \`Count\`. Declare \`Counter ← 0\`, call \`Increment\` three times, then OUTPUT \`Counter\`.`,
[t([],['3'])],
['BYREF passes a reference — changes inside affect the original variable'],
PROC_SCAFFOLD),

ex('pro-07','procedures','BYREF: Double a Value','medium',
`Write a PROCEDURE \`Double(BYREF Num : INTEGER)\` that multiplies \`Num\` by 2. Declare \`Value ← 5\`, call \`Double(Value)\`, then OUTPUT \`Value\`.`,
[t([],['10'])],
['Multiply the BYREF parameter by 2 inside the procedure', 'BYREF means the change persists in the caller'],
PROC_SCAFFOLD),

ex('pro-08','procedures','BYREF: Swap Two Values','hard',
`Write a PROCEDURE \`Swap(BYREF Num1 : INTEGER, BYREF Num2 : INTEGER)\` that swaps the two values using a temporary variable. Declare \`Num1 ← 10\` and \`Num2 ← 20\`, call the procedure, then OUTPUT both.`,
[t([],['20','10'])],
['Use BYREF for both parameters', 'Declare a Temp variable inside the procedure to hold one value during the swap'],
PROC_SCAFFOLD,
'',
requireBYREF),

ex('pro-09','procedures','Procedure in a Loop','medium',
`Write a PROCEDURE \`PrintNumber(BYVAL Num : INTEGER)\` that OUTPUTs the number. Use a FOR loop to call it for numbers 1, 2, and 3.`,
[t([],['1','2','3'])],
['Pass the loop variable as the argument to the procedure on each iteration'],
PROC_SCAFFOLD),

ex('pro-10','procedures','Procedure: Classify Number','hard',
`Write a PROCEDURE \`Classify(BYVAL Num : INTEGER)\` that OUTPUTs \`Positive\`, \`Negative\`, or \`Zero\`. INPUT a number and CALL it.`,
[t(['7'],['Positive']), t(['-3'],['Negative']), t(['0'],['Zero'])],
['Use IF statements inside the procedure to classify the number'],
PROC_SCAFFOLD),

ex('fun-01','procedures','Function: Add Two Numbers','easy',
`Write a FUNCTION \`Add(BYVAL Num1 : INTEGER, BYVAL Num2 : INTEGER) RETURNS INTEGER\` that returns Num1 + Num2. OUTPUT the result of calling \`Add(3, 4)\`.`,
[t([],['7'])],
['Use FUNCTION ... RETURNS INTEGER and ENDFUNCTION', 'Use RETURN to send back the result'],
PROC_SCAFFOLD),

ex('fun-02','procedures','Function: Square','easy',
`Write a FUNCTION \`Square(BYVAL Num : INTEGER) RETURNS INTEGER\` that returns Num². OUTPUT \`Square(7)\`.`,
[t([],['49'])],
['A single RETURN statement is enough — return the number multiplied by itself'],
PROC_SCAFFOLD),

ex('fun-03','procedures','Function: Max of Two','medium',
`Write a FUNCTION \`MaxOf(BYVAL Num1 : INTEGER, BYVAL Num2 : INTEGER) RETURNS INTEGER\` that returns the larger value. INPUT two integers, OUTPUT the max.`,
[t(['8','3'],['8']), t(['2','9'],['9']), t(['5','5'],['5'])],
['Use IF inside the function to compare and return the larger value'],
PROC_SCAFFOLD),

ex('fun-04','procedures','Function: IsEven','medium',
`Write a FUNCTION \`IsEven(BYVAL Num : INTEGER) RETURNS BOOLEAN\` that returns TRUE if Num is even, FALSE otherwise. INPUT Num, OUTPUT the result.`,
[t(['4'],['TRUE']), t(['7'],['FALSE'])],
['Use MOD 2 = 0 to test for even numbers'],
PROC_SCAFFOLD),

ex('fun-05','procedures','Function: Absolute Value','medium',
`Write a FUNCTION \`AbsVal(BYVAL Num : REAL) RETURNS REAL\` that returns the absolute value. Test it with -5.5 and OUTPUT the result.`,
[t([],['-5.5'.replace('-','')])],
['If Num < 0 then RETURN Num * -1, otherwise RETURN Num'],
PROC_SCAFFOLD),

ex('fun-06','procedures','Function: String Length Check','medium',
`Write a FUNCTION \`IsLong(BYVAL Text : STRING) RETURNS BOOLEAN\` that returns TRUE if the string has more than 5 characters. INPUT a word, OUTPUT the result.`,
[t(['Hello'],['FALSE']), t(['Cambridge'],['TRUE'])],
['Use LENGTH(Text) inside the function and compare with 5'],
PROC_SCAFFOLD),

ex('fun-07','procedures','Function: InitialOf','medium',
`Write a FUNCTION \`InitialOf(BYVAL Name : STRING) RETURNS STRING\` that returns the first character of Name in uppercase. INPUT a name, OUTPUT the result.`,
[t(['alice'],['A']), t(['Bob'],['B'])],
['Use MID to extract the first character — positions start at 1 and you only need 1 character', 'Apply UCASE to the extracted character before returning it'],
PROC_SCAFFOLD),

ex('fun-08','procedures','Function Calling Another Function','hard',
`Write a FUNCTION \`Min(BYVAL Num1 : INTEGER, BYVAL Num2 : INTEGER) RETURNS INTEGER\` and a FUNCTION \`MinOfThree(BYVAL Num1 : INTEGER, BYVAL Num2 : INTEGER, BYVAL Num3 : INTEGER) RETURNS INTEGER\` that uses \`Min\`. INPUT three integers, OUTPUT the smallest.`,
[t(['3','1','4'],['1']), t(['9','5','7'],['5'])],
['MinOfThree returns Min(Min(Num1, Num2), Num3)', 'Define Min first, then MinOfThree'],
PROC_SCAFFOLD),

ex('fun-09','procedures','Procedure with BYVAL and BYREF','hard',
`Write a PROCEDURE \`ScaleAndCount(BYVAL Scale : INTEGER, BYREF Counter : INTEGER)\` that adds \`Scale * 2\` to \`Counter\`. Declare \`Total ← 0\`. Call with Scale=5 twice and Scale=3 once. OUTPUT \`Total\`.`,
[t([],['26'])],
['BYREF Counter persists changes; BYVAL Scale is a copy', '5*2 + 5*2 + 3*2 = 26'],
PROC_SCAFFOLD,
'',
requireBYREF),

ex('fun-10','procedures','Function: Grade Letter','medium',
`Write a FUNCTION \`Grade(BYVAL Mark : INTEGER) RETURNS STRING\` that returns the grade letter: A (≥70), B (≥55), C (≥40), or U. INPUT a mark, OUTPUT the grade.`,
[t(['80'],['A']), t(['60'],['B']), t(['45'],['C']), t(['30'],['U'])],
['Use nested IF statements inside the function to determine and return the grade'],
PROC_SCAFFOLD),

ex('fun-11','procedures','Function: Power','hard',
`Write a FUNCTION \`Power(BYVAL Base : INTEGER, BYVAL Exponent : INTEGER) RETURNS INTEGER\` that calculates Base raised to the power Exponent using a FOR loop. INPUT both, OUTPUT the result.`,
[t(['2','8'],['256']), t(['3','4'],['81']), t(['5','1'],['5'])],
['Initialise a result variable to 1 inside the function', 'Multiply it by Base on each pass of the loop, running Exponent times'],
PROC_SCAFFOLD),

ex('fun-12','procedures','Procedure: Print Table','medium',
`Write a PROCEDURE \`PrintTable(BYVAL Times : INTEGER)\` that outputs the multiplication table for Times from 1 to 5, formatted as \`3 x 1 = 3\`. Use NUM_TO_STR and & to build each output line. INPUT a number and CALL it.`,
[t(['3'],['3 x 1 = 3','3 x 2 = 6','3 x 3 = 9','3 x 4 = 12','3 x 5 = 15'])],
['Use a FOR loop from 1 to 5 inside the procedure', 'Convert each integer to a string with NUM_TO_STR and join all parts with &'],
PROC_SCAFFOLD),

ex('fun-13','procedures','Function: Count Digits','hard',
`Write a FUNCTION \`CountDigits(BYVAL Num : INTEGER) RETURNS INTEGER\` that returns how many digits are in Num (assume positive). INPUT Num, OUTPUT the digit count.`,
[t(['12345'],['5']), t(['7'],['1']), t(['1000'],['4'])],
['Use a WHILE loop: while Num > 0, divide by 10 using DIV and increment count'],
PROC_SCAFFOLD),

ex('fun-14','procedures','BYREF: Accumulate Total','hard',
`Write a PROCEDURE \`AddToTotal(BYVAL Amount : INTEGER, BYREF RunningTotal : INTEGER)\` that adds \`Amount\` to \`RunningTotal\`. Declare \`Total ← 0\`. INPUT 5 integers and call the procedure for each. OUTPUT \`Total\`.`,
[t(['10','20','30','40','50'],['150']), t(['1','2','3','4','5'],['15'])],
['BYREF ensures each call updates the same Total variable'],
PROC_SCAFFOLD,
'',
requireBYREF),

ex('fun-15','procedures','Function: Celsius to Fahrenheit','easy',
`Write a FUNCTION \`CtoF(BYVAL Celsius : REAL) RETURNS REAL\` that converts using F = (C × 9/5) + 32. INPUT a temperature, OUTPUT the result.`,
[t(['0'],['32']), t(['100'],['212']), t(['37'],['98.6'])],
['Apply the formula inside the function and return the result'],
PROC_SCAFFOLD),

ex('fun-16','procedures','Two Procedures in Sequence','easy',
`Write two procedures: \`Header\` (OUTPUTs \`=== Report ===\`) and \`Footer\` (OUTPUTs \`=== End ===\`). Call both in order.`,
[t([],['=== Report ===','=== End ==='])],
['Define both procedures separately, then call them in the correct order'],
PROC_SCAFFOLD),

ex('fun-17','procedures','Function: IsPrime','hard',
`Write a FUNCTION \`IsPrime(BYVAL Num : INTEGER) RETURNS BOOLEAN\` that returns TRUE if Num is prime. INPUT a number and OUTPUT the result.`,
[t(['7'],['TRUE']), t(['9'],['FALSE']), t(['2'],['TRUE']), t(['1'],['FALSE'])],
['A prime is > 1 with no divisors other than 1 and itself', 'Use a FOR loop from 2 to Num - 1 checking MOD'],
PROC_SCAFFOLD),

ex('fun-18','procedures','Procedure: Validate and Report','hard',
`Write a PROCEDURE \`Validate(BYVAL Score : INTEGER, BYREF IsValid : BOOLEAN)\` that sets \`IsValid\` to TRUE if 0 ≤ Score ≤ 100, otherwise FALSE. INPUT a score, call the procedure, then OUTPUT \`Valid\` or \`Invalid\`.`,
[t(['85'],['Valid']), t(['-1'],['Invalid']), t(['100'],['Valid'])],
['BYREF IsValid lets the procedure set the caller\'s variable', 'Assign the result of a Boolean expression directly to the BYREF parameter'],
PROC_SCAFFOLD,
'',
requireBYREF),

ex('fun-19','procedures','Function: Sum of Digits','hard',
`Write a FUNCTION \`SumDigits(BYVAL Num : INTEGER) RETURNS INTEGER\` that returns the sum of all digits in Num. INPUT Num, OUTPUT the sum.`,
[t(['123'],['6']), t(['9999'],['36']), t(['5'],['5'])],
['Each iteration, extract the last digit using MOD 10, then remove it using integer division by 10'],
PROC_SCAFFOLD),

ex('fun-20','procedures','Function: Repeat String','hard',
`Write a FUNCTION \`RepeatStr(BYVAL Str : STRING, BYVAL Times : INTEGER) RETURNS STRING\` that returns \`Str\` repeated \`Times\` times. OUTPUT \`RepeatStr("AS", 3)\`.`,
[t([],['ASASAS'])],
['Initialise a result string to empty inside the function', 'Concatenate Str to it Times times using a FOR loop'],
PROC_SCAFFOLD),

ex('fun-21','procedures','Mixed BYVAL and BYREF Parameters','hard',
`Write a PROCEDURE \`MinMax(BYVAL Num1 : INTEGER, BYVAL Num2 : INTEGER, BYREF MinVal : INTEGER, BYREF MaxVal : INTEGER)\` that sets MinVal and MaxVal. INPUT two integers, call the procedure, OUTPUT MinVal then MaxVal.`,
[t(['8','3'],['3','8']), t(['5','5'],['5','5'])],
['Use IF inside the procedure to decide which of Num1/Num2 is smaller and assign MinVal and MaxVal accordingly'],
PROC_SCAFFOLD,
'',
requireBYREF),

ex('fun-22','procedures','Function: Factorial','hard',
`Write a FUNCTION \`Factorial(BYVAL Num : INTEGER) RETURNS INTEGER\` that returns Num!. OUTPUT \`Factorial(6)\`.`,
[t([],['720'])],
['Initialise a result variable to 1 inside the function', 'Use a FOR loop from 1 to Num, multiplying the result by each counter value'],
PROC_SCAFFOLD),

ex('fun-23','procedures','BYREF Output Parameter','hard',
`Write a PROCEDURE \`ParseInt(BYVAL Text : STRING, BYREF Value : INTEGER, BYREF Success : BOOLEAN)\` that sets Value to STR_TO_NUM(Text) and Success ← TRUE (for this exercise, assume the input is always numeric). Pre-declare \`ParseText ← "42"\`, call the procedure, output Value if Success is TRUE.`,
[t([],['42'])],
['BYREF Value and BYREF Success both get set inside the procedure', 'Use STR_TO_NUM(Text) to convert the string'],
PROC_SCAFFOLD,
'DECLARE ParseText : STRING\nParseText ← "42"\n',
requireBYREF),

ex('fun-24','procedures','Procedure: Print Star Row','medium',
`Write a PROCEDURE \`StarRow(BYVAL Width : INTEGER)\` that outputs a row of \`Width\` asterisks as a single string. Call it with 5.`,
[t([],['*****'])],
['Build the row inside the procedure using a FOR loop and & concatenation', 'OUTPUT the completed string'],
PROC_SCAFFOLD),

ex('fun-25','procedures','Function: String Contains Digit','hard',
`Write a FUNCTION \`ContainsDigit(BYVAL Text : STRING) RETURNS BOOLEAN\` that returns TRUE if Text contains any digit character (0–9). INPUT a string, OUTPUT the result.`,
[t(['Pass123'],['TRUE']), t(['Cambridge'],['FALSE'])],
['Loop from 1 to LENGTH(Text)', 'Check each character with MID(Text, Index, 1) against "0" through "9" using OR'],
PROC_SCAFFOLD),

ex('fun-26','procedures','Procedure: Report Card','hard',
`Write a PROCEDURE \`ReportCard(BYVAL Name : STRING, BYVAL Score : INTEGER)\` that outputs: the name, the score, and the grade (A/B/C/U using the 70/55/40 boundary). INPUT name and score, then call it.`,
[t(['Alice','75'],['Alice','75','A']), t(['Bob','45'],['Bob','45','C'])],
['Use IF inside the procedure to determine the grade', 'Three separate OUTPUT statements inside the procedure'],
PROC_SCAFFOLD),

ex('fun-27','procedures','Function: Hypotenuse Approximation','hard',
`Write a FUNCTION \`Hypotenuse(BYVAL SideA : REAL, BYVAL SideB : REAL) RETURNS REAL\` that iterates 20 times: start with \`Guess ← SideA\`, update \`Guess ← (Guess + (SideA*SideA + SideB*SideB) / Guess) / 2\`. Return INT(Guess * 10 + 0.5) / 10. Test with SideA=3, SideB=4 (expected: 5.0).`,
[t([],['5'])],
['Start with an initial guess equal to SideA inside the function', 'Apply the iterative update 20 times in a FOR loop'],
PROC_SCAFFOLD),

ex('fun-28','procedures','BYREF: Reset a Value','medium',
`Write a PROCEDURE \`ResetCounter(BYREF Counter : INTEGER)\` that sets Counter to 0. Declare \`Score ← 99\`, call \`ResetCounter(Score)\`, then OUTPUT \`Score\`.`,
[t([],['0'])],
['BYREF means the procedure changes the original variable', 'The procedure body only needs to set the parameter to 0'],
PROC_SCAFFOLD,
'',
requireBYREF),

ex('fun-29','procedures','Function: Is Uppercase Letter','medium',
`Write a FUNCTION \`IsUpper(BYVAL Ch : STRING) RETURNS BOOLEAN\` that returns TRUE if the first character of Ch is an uppercase letter. INPUT a single character, OUTPUT the result.`,
[t(['A'],['TRUE']), t(['z'],['FALSE']), t(['M'],['TRUE'])],
['Compare UCASE(Ch) = Ch to check if it is already uppercase'],
PROC_SCAFFOLD),

ex('fun-30','procedures','Procedure: Input with Validation','hard',
`Write a PROCEDURE \`GetPositive(BYREF Value : INTEGER)\` that repeatedly asks the user to INPUT a positive integer until they do so. In the main program, call it and OUTPUT the value.`,
[t(['-5','0','7'],['7']), t(['3'],['3'])],
['Use a REPEAT UNTIL loop inside the procedure', 'The UNTIL condition is Value > 0'],
PROC_SCAFFOLD,
'',
requireBYREF),

ex('fun-31','procedures','Function: Count Occurrences in String','hard',
`Write a FUNCTION \`CountChar(BYVAL Text : STRING, BYVAL Target : STRING) RETURNS INTEGER\` that counts how many times Target (a single character) appears in Text. INPUT text and character, OUTPUT the count.`,
[t(['hello','l'],['2']), t(['Cambridge','a'],['1']), t(['banana','a'],['3'])],
['Loop from 1 to LENGTH(Text), extract each character with MID, compare to Target'],
PROC_SCAFFOLD),

ex('fun-32','procedures','BYVAL Does Not Modify Caller','medium',
`Write a PROCEDURE \`ShowDouble(BYVAL Num : INTEGER)\` that prints \`Num * 2\` but does NOT modify the caller\'s variable. Declare \`Num ← 5\`, call \`ShowDouble(Num)\`, then OUTPUT Num again. It should still be 5.`,
[t([],['10','5'])],
['BYVAL passes a copy — the original variable is never modified'],
PROC_SCAFFOLD),

ex('fun-33','procedures','Procedure: Print Diamond','hard',
`Write a PROCEDURE \`Diamond(BYVAL Size : INTEGER)\` that prints a diamond of asterisks. For Size=2: row 1 has 1 star, row 2 (middle) has 3 stars, row 3 has 1 star. Call it with Size=2.`,
[t([],['*','***','*'])],
['Row r (1 to 2*Size-1): stars = 2 * (Size - ABS(r - Size)) - 1... work through each case', 'For Size=2: 1 star, 3 stars, 1 star'],
PROC_SCAFFOLD),

ex('fun-34','procedures','Function: String to Integer (Manual)','hard',
`Write a FUNCTION \`ToInt(BYVAL NumStr : STRING) RETURNS INTEGER\` that converts a string of digit characters to an integer using STR_TO_NUM on each digit. Call it with "123" and OUTPUT the result.`,
[t([],['123'])],
['Loop through each character of NumStr using MID', 'Convert each digit character to an integer using STR_TO_NUM', 'Shift the accumulated result left (multiply by 10) then add the new digit each iteration'],
PROC_SCAFFOLD),

ex('fun-35','procedures','Function: Validate Email','hard',
`Write a FUNCTION \`HasAtSign(BYVAL Email : STRING) RETURNS BOOLEAN\` that returns TRUE if the string contains exactly one "@" character. INPUT an email address, OUTPUT the result.`,
[t(['user@example.com'],['TRUE']), t(['notanemail'],['FALSE']), t(['a@b@c'],['FALSE'])],
['Loop through the string counting occurrences of "@"', 'Return TRUE only if the count equals 1'],
PROC_SCAFFOLD),

// ─────────────────────────────────────────────────────────────────────────────
// ARRAYS  (19)
// ─────────────────────────────────────────────────────────────────────────────

ex('arr-01','arrays','Declare and Populate a 1D Array','easy',
`Declare an INTEGER array \`Scores : ARRAY[1:5] OF INTEGER\`. Assign values 10, 20, 30, 40, 50 to positions 1–5. OUTPUT all five elements.`,
[t([],['10','20','30','40','50'])],
['Assign each element individually using its 1-based index', 'Use a FOR loop to output all elements']),

ex('arr-02','arrays','Array: Sum and Average','medium',
`Declare \`Data : ARRAY[1:5] OF INTEGER\` with values 4, 8, 15, 16, 23. Calculate the sum and average. OUTPUT both (average as a REAL).`,
[t([],['66','13.2'])],
['Accumulate the sum using a FOR loop', 'Divide by 5 for the average']),

ex('arr-03','arrays','Array: INPUT and OUTPUT','easy',
`INPUT 4 integers into an array \`Values : ARRAY[1:4] OF INTEGER\`. OUTPUT all four.`,
[t(['3','1','4','2'],['3','1','4','2'])],
['Use a FOR loop for both INPUT and OUTPUT']),

ex('arr-04','arrays','Array: Find Maximum','medium',
`INPUT 5 integers into an array \`Data : ARRAY[1:5] OF INTEGER\`. Find and OUTPUT the maximum.`,
[t(['3','7','1','9','2'],['9']), t(['5','5','5','5','5'],['5'])],
['Start by assuming the first element is the maximum', 'Update the maximum when a larger element is found']),

ex('arr-05','arrays','Array: Reverse','medium',
`Declare \`Letters : ARRAY[1:5] OF STRING\` with values "A", "B", "C", "D", "E". OUTPUT the array in reverse order using a FOR loop with STEP -1.`,
[t([],['E','D','C','B','A'])],
['Use a FOR loop with STEP -1 to iterate backwards from the last index to the first']),

ex('arr-06','arrays','Array: Count Elements in Range','medium',
`INPUT 6 integers into an array. INPUT a lower bound \`Lo\` and upper bound \`Hi\`. Count and OUTPUT how many elements are in the range Lo to Hi (inclusive).`,
[t(['5','2','8','3','9','1','3','7'],['2']),t(['1','2','3','4','5','6','1','6'],['6'])],
['Use AND to check both bounds in a single IF condition']),

ex('arr-07','arrays','Array: Bubble Sort (Ascending)','hard',
`INPUT 5 integers into an array \`Data : ARRAY[1:5] OF INTEGER\`. Sort them ascending using bubble sort. OUTPUT all 5 values (one per line).`,
[t(['5','3','8','1','4'],['1','3','4','5','8']), t(['9','7','5','3','1'],['1','3','5','7','9'])],
['Outer loop: 1 to 4; inner loop compares adjacent elements', 'Swap adjacent elements when out of order using a Temp variable'],
'', '', requireNestedLoops),

ex('arr-08','arrays','Array: Linear Search','medium',
`Declare \`Data : ARRAY[1:6] OF INTEGER\` with values 3, 7, 1, 9, 4, 6. INPUT a target. OUTPUT its 1-based position, or -1 if not found.`,
[t(['9'],['4']), t(['7'],['2']), t(['99'],['-1'])],
['Initialise a position variable to -1 to represent "not found"', 'Update it when the target is found']),

ex('arr-09','arrays','2D Array: Fill and Display','medium',
`Declare \`Grid : ARRAY[1:3, 1:3] OF INTEGER\`. Use nested FOR loops to assign \`Grid[Row, Col] ← Row * Col\`. Then OUTPUT all 9 values row by row.`,
[t([],['1','2','3','2','4','6','3','6','9'])],
['Use nested FOR loops — outer for rows, inner for columns', 'Each element should be the product of its row and column indices'],
'', '', requireNestedLoops),

ex('arr-10','arrays','2D Array: Row Sum','hard',
`Declare \`Matrix : ARRAY[1:3, 1:3] OF INTEGER\`. Fill row 1 with 1,2,3; row 2 with 4,5,6; row 3 with 7,8,9. OUTPUT the sum of each row on separate lines.`,
[t([],['6','15','24'])],
['For each row, sum all three column values', 'OUTPUT the row sum after the inner loop'],
'', '', requireNestedLoops),

ex('arr-11','arrays','Array: Copy','medium',
`Declare \`Original : ARRAY[1:4] OF INTEGER\` with values 5, 10, 15, 20. Copy it to \`Copy : ARRAY[1:4] OF INTEGER\` using a FOR loop. Change \`Original[1] ← 99\`. OUTPUT all four elements of \`Copy\`.`,
[t([],['5','10','15','20'])],
['Copy each element in a FOR loop', 'Changing Original after copying should not affect Copy']),

ex('arr-12','arrays','Array: Count Positive/Negative/Zero','hard',
`INPUT 8 integers into an array. Count positives, negatives, and zeros. OUTPUT all three counts.`,
[t(['3','-2','0','5','-1','-3','0','7'],['3','3','2']), t(['0','0','0','0','0','0','0','0'],['0','0','8'])],
['Use three counter variables; increment the appropriate one for each element']),

ex('arr-13','arrays','Array: Remove Duplicates (Mark)','hard',
`Declare \`Data : ARRAY[1:6] OF INTEGER\` with values 3, 5, 3, 7, 5, 9. Count and OUTPUT how many unique values there are.`,
[t([],['4'])],
['For each element at position i, check if it appeared at any earlier position', 'Use a nested inner loop from 1 to i-1'],
'', '', requireNestedLoops),

ex('arr-14','arrays','Array: Frequency Count','hard',
`INPUT 10 integers (each between 1 and 5 inclusive) into an array \`Rolls\`. Count how many times each value 1–5 appears. OUTPUT the five frequencies.`,
[t(['1','2','3','1','2','1','4','5','3','2'],['3','3','2','1','1'])],
['Declare a Frequency array of size 5', 'For each element in Rolls, increment Frequency[element]']),

ex('arr-15','arrays','Array: Parallel Arrays','medium',
`Declare \`Names : ARRAY[1:4] OF STRING\` with "Alice","Bob","Charlie","Diana" and \`Marks : ARRAY[1:4] OF INTEGER\` with 85, 62, 91, 74. INPUT a name. OUTPUT the corresponding mark, or \`Not found\`.`,
[t(['Charlie'],['91']), t(['Alice'],['85']), t(['Eve'],['Not found'])],
['Loop through Names to find the matching index', 'Use that index to look up the corresponding Marks value']),

ex('arr-16','arrays','Array: Shift Left','hard',
`Declare \`Data : ARRAY[1:5] OF INTEGER\` with values 10, 20, 30, 40, 50. Shift all elements one position to the left (element 1 discarded, element 5 becomes 0). OUTPUT all 5 elements.`,
[t([],['20','30','40','50','0'])],
['Loop from position 1 to 4, copying each element from the position ahead of it', 'After the shift loop, set the last position to 0']),

ex('arr-17','arrays','2D Array: Diagonal Sum','hard',
`Declare \`Grid : ARRAY[1:4, 1:4] OF INTEGER\`. Use nested FOR loops to assign \`Grid[Row, Col] ← Row + Col\`. OUTPUT the sum of the main diagonal (where Row = Col).`,
[t([],['20'])],
['Diagonal elements: Grid[1,1]=2, Grid[2,2]=4, Grid[3,3]=6, Grid[4,4]=8; sum = 20'],
'', '', requireNestedLoops),

ex('arr-18','arrays','Array: Second Largest','hard',
`INPUT 5 integers into an array. Find and OUTPUT the second largest value (assume all values are distinct).`,
[t(['3','7','1','9','4'],['7']), t(['5','2','8','1','6'],['6'])],
['Find the maximum first', 'Then find the maximum of all elements that are not equal to the maximum']),

ex('arr-19','arrays','Array: Rotate Right','hard',
`Declare \`Data : ARRAY[1:5] OF INTEGER\` with values 1, 2, 3, 4, 5. Rotate all elements one position to the right (last element wraps to first). OUTPUT all 5 elements.`,
[t([],['5','1','2','3','4'])],
['Save the last element before it gets overwritten', 'Loop backwards, copying each element one position to the right', 'Place the saved last element at position 1']),

// ─────────────────────────────────────────────────────────────────────────────
// RECORDS  (15)
// ─────────────────────────────────────────────────────────────────────────────

ex('rec-01','records','Define and Use a Record','easy',
`Define a record type called \`StudentRecord\` with fields \`Name : STRING\` and \`Age : INTEGER\`. Declare a variable \`Student : StudentRecord\`. Assign Name ← "Alice" and Age ← 16. OUTPUT both fields on separate lines.`,
[t([],['Alice','16'])],
['Use TYPE StudentRecord ... ENDTYPE to define the record', 'Access fields with Student.Name and Student.Age']),

ex('rec-02','records','Record: Three Fields','easy',
`Define a record type \`CarRecord\` with fields \`Make : STRING\`, \`Model : STRING\`, and \`Year : INTEGER\`. Declare \`Car : CarRecord\`. Assign Make ← "Toyota", Model ← "Corolla", Year ← 2020. OUTPUT all three fields.`,
[t([],['Toyota','Corolla','2020'])],
['Define CarRecord with three DECLARE fields inside TYPE...ENDTYPE']),

ex('rec-03','records','Record: Input and Output','medium',
`Define a \`PersonRecord\` type with \`Name : STRING\` and \`Score : INTEGER\`. INPUT a name and score (with suitable prompts). Store in record variable \`Person\`. OUTPUT both fields on separate lines.`,
[t(['Bob','92'],['Bob','92'])],
['INPUT into Person.Name and Person.Score directly']),

ex('rec-04','records','Record: Calculated Field','medium',
`Define a \`RectangleRecord\` type with \`Width : REAL\` and \`Height : REAL\`. Declare \`Rect : RectangleRecord\`. Assign Width ← 5.0 and Height ← 3.0. Calculate and OUTPUT the area.`,
[t([],['15'])],
['OUTPUT Rect.Width * Rect.Height']),

ex('rec-05','records','Record: Update a Field','medium',
`Define a \`CounterRecord\` type with \`Value : INTEGER\` and \`Label : STRING\`. Declare \`Counter : CounterRecord\`. Assign Value ← 0 and Label ← "Clicks". Increment Value three times. OUTPUT Label then Value.`,
[t([],['Clicks','3'])],
['Use dot notation to increment the Value field, adding 1 to it three times', 'Two separate OUTPUT statements']),

ex('rec-06','records','Array of Records','hard',
`Define a \`StudentRecord\` type with \`Name : STRING\` and \`Mark : INTEGER\`. Declare \`Class : ARRAY[1:3] OF StudentRecord\`. Use a loop to INPUT each student's name then mark. Use a second loop to OUTPUT each entry on one line in the format \`Alice: 85\`, using \`NUM_TO_STR\` to convert the mark.`,
[
  t(['Alice','85','Bob','72','Charlie','91'],  ['Alice: 85','Bob: 72','Charlie: 91']),
  t(['Diana','90','Eve','55','Frank','78'],     ['Diana: 90','Eve: 55','Frank: 78']),
],
['Use a FOR loop to INPUT Class[i].Name then Class[i].Mark for each student', 'Use a second FOR loop to OUTPUT each entry — convert the mark with NUM_TO_STR and join with ": " using &'],
'',
'',
src => requireTwoLoops(src) ?? (/NUM_TO_STR/i.test(src) ? null : 'You must use NUM_TO_STR() to convert the Mark field when outputting it.')),

ex('rec-07','records','Array of Records: Find Highest Mark','hard',
`Using a \`StudentRecord\` type (Name : STRING, Mark : INTEGER), declare \`Class : ARRAY[1:4] OF StudentRecord\`. Populate: Alice/80, Bob/95, Charlie/67, Diana/88. Find and OUTPUT the name of the student with the highest mark.`,
[t([],['Bob'])],
['Start by treating the first student as the current best', 'Compare each student\'s mark in a FOR loop; update the best name and mark when a higher one is found']),

ex('rec-08','records','Record in a Procedure','hard',
`Define a \`PointRecord\` type with \`X : REAL\` and \`Y : REAL\`. Write a PROCEDURE \`PrintPoint(BYVAL Point : PointRecord)\` that OUTPUTs X and Y on separate lines. Declare a point at (3.5, 7.0) and call the procedure.`,
[t([],['3.5','7.0'])],
['Pass the record as BYVAL to the procedure', 'Access Point.X and Point.Y inside'],
PROC_SCAFFOLD),

ex('rec-09','records','Record with BYREF in Procedure','hard',
`Define a \`ScoreRecord\` type with \`Value : INTEGER\` and \`Bonus : INTEGER\`. Write a PROCEDURE \`AddBonus(BYREF Score : ScoreRecord, BYVAL Extra : INTEGER)\` that adds Extra to Score.Bonus. Declare a record with Value=100, Bonus=0. Call AddBonus with Extra=15. OUTPUT both fields.`,
[t([],['100','15'])],
['BYREF Score means the procedure modifies the original record', 'Use dot notation inside the procedure to update the Bonus field by adding the extra amount'],
PROC_SCAFFOLD,
'',
requireBYREF),

ex('rec-10','records','Record: Student Report','medium',
`Define a \`ReportRecord\` type with \`Name : STRING\`, \`Score : INTEGER\`, and \`Grade : STRING\`. INPUT a name and score. Set Grade to "A" (≥70), "B" (≥55), "C" (≥40), or "U". OUTPUT all three fields.`,
[t(['Alice','75'],['Alice','75','A']), t(['Bob','40'],['Bob','40','C'])],
['Use IF...ELSE IF to set the Grade field based on Score']),

ex('rec-11','records','Array of Records: Average','hard',
`Define a \`TemperatureRecord\` type with \`Day : STRING\` and \`Temp : REAL\`. Declare \`Week : ARRAY[1:5] OF TemperatureRecord\`. Assign Mon/12.5, Tue/14.0, Wed/9.5, Thu/16.0, Fri/11.0. Calculate and OUTPUT the average temperature.`,
[t([],['12.6'])],
['Sum all Temp fields using a FOR loop', 'Divide by 5 for the average']),

ex('rec-12','records','Record: Copy Fields','medium',
`Define a \`ContactRecord\` type with \`Name : STRING\` and \`Phone : STRING\`. Declare \`Contact1\` and \`Contact2\`. Assign Contact1.Name="Alice", Contact1.Phone="01234". Copy both fields to Contact2. OUTPUT Contact2\'s fields.`,
[t([],['Alice','01234'])],
['You cannot assign one record variable directly to another — copy each field separately', 'Records cannot be assigned as a whole in Cambridge pseudocode']),

ex('rec-13','records','Record: Search by Field','hard',
`Define a \`ProductRecord\` type with \`Name : STRING\` and \`Price : REAL\`. Declare \`Catalogue : ARRAY[1:4] OF ProductRecord\`. Populate with Pen/1.5, Book/12.0, Ruler/0.75, Bag/25.0. INPUT a product name. OUTPUT its price or \`Not found\`.`,
[t(['Book'],['12']), t(['Ruler'],['0.75']), t(['Mouse'],['Not found'])],
['Loop through Catalogue searching for a matching Name field']),

ex('rec-14','records','Record: Swap Two Records','hard',
`Define a \`DataRecord\` type with \`Id : INTEGER\` and \`Value : INTEGER\`. Declare \`Rec1\` (Id=1, Value=100) and \`Rec2\` (Id=2, Value=200). Swap their fields using a third record \`Temp\`. OUTPUT Id and Value of both records after swapping.`,
[t([],['2','200','1','100'])],
['Declare Temp : DataRecord', 'Copy Rec1 to Temp, Rec2 to Rec1, Temp to Rec2 — field by field']),

ex('rec-15','records','Array of Records: Sort by Field','hard',
`Define \`StudentRecord\` (Name : STRING, Mark : INTEGER). Declare \`Class : ARRAY[1:4] OF StudentRecord\`. Populate: Alice/70, Dave/85, Bob/60, Carol/90. Sort by Mark ascending using bubble sort (swap both fields when out of order). OUTPUT each name and mark.`,
[t([],['Bob','60','Alice','70','Dave','85','Carol','90'])],
['Compare Class[i].Mark and Class[i+1].Mark', 'When out of order, swap both Name and Mark fields using temporary variables'],
'', '', requireNestedLoops),

// ─────────────────────────────────────────────────────────────────────────────
// FILE HANDLING  (20)  — fil-15 moved to strings (str-26); fil-21 added
// ─────────────────────────────────────────────────────────────────────────────

ex('fil-01','files','Write then Read a File','easy',
`Use \`OPENFILE "data.txt" FOR WRITE\` to open the file. WRITEFILE the line \`"Hello, World!"\`. CLOSEFILE. Re-open FOR READ. READFILE into a variable. CLOSEFILE and OUTPUT the variable.`,
[t([],['Hello, World!'])],
['OPENFILE before reading or writing; CLOSEFILE when done', 'WRITEFILE writes a line; READFILE reads a line into a variable'],
'', '', src => fileCheck(src, 'WRITE', 'READ')),

ex('fil-02','files','Write Multiple Lines','medium',
`Open \`"test.txt"\` FOR WRITE. WRITEFILE \`"Line 1"\`, \`"Line 2"\`, \`"Line 3"\`. CLOSEFILE. Re-open FOR READ. READFILE each line and OUTPUT them. CLOSEFILE when done.`,
[t([],['Line 1','Line 2','Line 3'])],
['Write all three lines in FOR WRITE mode, then CLOSEFILE', 'Re-open FOR READ, use READFILE for each line'],
'', '', src => fileCheck(src, 'WRITE', 'READ')),

ex('fil-03','files','Read with WHILE NOT EOF','medium',
`Open \`"colours.txt"\` FOR WRITE. Write \`"red"\` and \`"green"\`. CLOSEFILE. Re-open FOR APPEND. Write \`"blue"\`. CLOSEFILE. Re-open FOR READ. Use \`WHILE NOT EOF\` to READFILE each word and OUTPUT it in uppercase. CLOSEFILE when done.`,
[t([],['RED','GREEN','BLUE'])],
['Write the first two colours in WRITE mode, then close and re-open in APPEND mode to add the third', 'APPEND adds to the end without clearing the file', 'Apply UCASE to each line read before outputting'],
'', '', src => fileCheck(src, 'WRITE', 'APPEND', 'READ')),

ex('fil-04','files','Count Lines with EOF','medium',
`Open \`"five.txt"\` FOR WRITE. Write \`"A"\`, \`"B"\`, \`"C"\`, \`"D"\`, \`"E"\`. CLOSEFILE. Re-open FOR READ. Use WHILE NOT EOF to count the lines. CLOSEFILE, then OUTPUT the count.`,
[t([],['5'])],
['Use WHILE NOT EOF("five.txt") and increment a counter each time READFILE is called'],
'', '', src => fileCheck(src, 'WRITE', 'READ')),

ex('fil-05','files','Read Until EOF and Output','medium',
`Open \`"fruit.txt"\` FOR WRITE. Write \`"Apple"\`. CLOSEFILE. Re-open FOR APPEND. Write \`"Banana"\` and \`"Cherry"\` in the same session. CLOSEFILE. Re-open FOR READ. Use WHILE NOT EOF to READFILE and OUTPUT each line. CLOSEFILE when done.`,
[t([],['Apple','Banana','Cherry'])],
['Write "Apple" in WRITE mode, then open once FOR APPEND to write both "Banana" and "Cherry" before closing', 'After all three writes, open FOR READ and use WHILE NOT EOF to read each line'],
'', '', src => fileCheck(src, 'WRITE', 'APPEND', 'READ')),

ex('fil-06','files','Append to File','hard',
`Open \`"greet.txt"\` FOR WRITE. Write \`"Hello"\`. CLOSEFILE. Re-open FOR APPEND. Write \`"World"\`. CLOSEFILE. Re-open FOR READ. OUTPUT both lines. CLOSEFILE when done.`,
[t([],['Hello','World'])],
['WRITE mode clears the file; APPEND mode adds to the end'],
'', '', src => fileCheck(src, 'WRITE', 'APPEND', 'READ')),

ex('fil-07','files','Write Input Data to File','hard',
`INPUT 3 names from the user. Open \`"names.txt"\` FOR WRITE. WRITEFILE the first two names. CLOSEFILE. Re-open FOR APPEND. WRITEFILE the third name. CLOSEFILE. Re-open FOR READ. READFILE and OUTPUT each line. CLOSEFILE when done.`,
[t(['Alice','Bob','Charlie'],['Alice','Bob','Charlie'])],
['Write the first two names in WRITE mode, then close and re-open FOR APPEND for the third', 'Read all three back using WHILE NOT EOF or three separate READFILE calls'],
'', '', src => fileCheck(src, 'WRITE', 'APPEND', 'READ')),

ex('fil-08','files','File: Largest Value','hard',
`Open \`"vals.txt"\` FOR WRITE. Write integers 7, 3, 9, 1, 5 (one per line). CLOSEFILE. Re-open FOR READ. Use WHILE NOT EOF to track the largest. CLOSEFILE, then OUTPUT the largest. Note: values read from a file are strings — use \`STR_TO_NUM()\` to convert before comparing.`,
[t([],['9'])],
['Initialise Max before the loop by reading the first value and converting it with STR_TO_NUM()', 'Each value read with READFILE is a string — convert with STR_TO_NUM() before comparing to Max'],
'', '', src => fileCheck(src, 'WRITE', 'READ') ?? (/\bSTR_TO_NUM\b/i.test(src) ? null : 'Values read from a file are strings — you must use STR_TO_NUM() to convert them before comparing.')),

ex('fil-09','files','File: Count Even Numbers','hard',
`Open \`"nums.txt"\` FOR WRITE. Write numbers 1 to 8 (one per line). CLOSEFILE. Re-open FOR READ. Use WHILE NOT EOF to count even numbers. CLOSEFILE, then OUTPUT the count. Note: values read from a file are strings — use \`STR_TO_NUM()\` to convert before arithmetic.`,
[t([],['4'])],
['Each value read with READFILE is a string — convert with STR_TO_NUM() before using MOD', 'Use MOD 2 = 0 to test whether the converted value is even'],
'', '', src => fileCheck(src, 'WRITE', 'READ') ?? (/\bSTR_TO_NUM\b/i.test(src) ? null : 'Values read from a file are strings — you must use STR_TO_NUM() to convert them before using MOD.')),

ex('fil-10','files','CSV: Write and Read a Record','hard',
`Create a comma-separated record: \`"Alice,85"\`. Open \`"scores.txt"\` FOR WRITE. WRITEFILE the string. CLOSEFILE. Re-open FOR READ. READFILE into \`Record\`. CLOSEFILE. Use MID to extract the name (first 5 chars) and the score portion. OUTPUT each on a separate line.`,
[t([],['Alice','85'])],
['Write the name and score as a single comma-separated string', '"Alice" is the first 5 characters of the line', 'The score starts 2 positions after the comma — count along the string to find the position'],
'', '', src => fileCheck(src, 'WRITE', 'READ')),

ex('fil-11','files','CSV: Write Multiple Records','hard',
`Write \`"Alice,85"\` and \`"Bob,72"\` to \`"class.txt"\` FOR WRITE. CLOSEFILE. Re-open FOR READ. Use WHILE NOT EOF to READFILE each line and OUTPUT the name portion.`,
[t([],['Alice','Bob'])],
['Write each record as a single string with a comma separator', 'For "Alice,85" the name is 5 characters; for "Bob,72" it is 3'],
'', '', src => fileCheck(src, 'WRITE', 'READ')),

ex('fil-12','files','File: Two Files','hard',
`Write \`"Hello"\` to \`file1.txt\` and \`"World"\` to \`file2.txt\`. Read both back and OUTPUT the two values joined by a space.`,
[t([],['Hello World'])],
['Open, write, and close each file separately', 'Read each into a separate variable', 'Join with & " " &'],
'', '', src => fileCheck(src, 'WRITE', 'READ')),

ex('fil-13','files','File: Reverse Lines','hard',
`Open \`"letters.txt"\` FOR WRITE. Write \`"A"\`, \`"B"\`, \`"C"\`, \`"D"\`. CLOSEFILE. Re-open FOR READ. Read all lines into an array. CLOSEFILE, then OUTPUT the lines in reverse order.`,
[t([],['D','C','B','A'])],
['Read into an array using READFILE inside a loop', 'OUTPUT with a FOR loop using STEP -1'],
'', '', src => fileCheck(src, 'WRITE', 'READ') ?? requireTwoLoops(src)),

ex('fil-14','files','File: Average from File','hard',
`Write values 10, 20, 30, 40, 50 to \`"data.txt"\` using a FOR loop with STEP 10. Read them back and OUTPUT their average. Note: values read from a file are strings — use \`STR_TO_NUM()\` to convert before arithmetic.`,
[t([],['30'])],
['Use a FOR loop with STEP 10 to generate and write the values 10 to 50', 'Each value read with READFILE is a string — convert with STR_TO_NUM() before adding to the total'],
'', '',
src => fileCheck(src, 'WRITE', 'READ') ?? (/\bFOR\b/i.test(src) && /\bSTEP\b/i.test(src) ? null : 'You must use a FOR loop with a STEP value to write the data to the file') ?? (/\bSTR_TO_NUM\b/i.test(src) ? null : 'Values read from a file are strings — you must use STR_TO_NUM() to convert them before arithmetic.')),

ex('str-26','strings','CSV: Parse Fields with MID','hard',
`Assign \`Line ← "Charlie,92,Pass"\`. Format: Name (7 chars), comma, Score (2 chars), comma, Result (4 chars). Extract and OUTPUT each field on a separate line.`,
[t([],['Charlie','92','Pass'])],
['"Charlie" is 7 characters, starting at position 1', 'The score starts after the comma that follows Charlie — count positions to find it', 'The result starts after the second comma — count positions again']),

ex('fil-16','files','File: Write Even Numbers','medium',
`Open \`"evens.txt"\` FOR WRITE. Use a FOR loop with STEP 2 to write even numbers from 2 to 10. CLOSEFILE. Re-open FOR READ. Use WHILE NOT EOF to read and OUTPUT each number. CLOSEFILE when done.`,
[t([],['2','4','6','8','10'])],
['Use STEP 2 in your FOR loop to generate only even numbers', 'In AS 9618, WHILE does not use a DO keyword'],
'', '', src => fileCheck(src, 'WRITE', 'READ')),

ex('fil-17','files','File: Filter Lines','hard',
`Open \`"words.txt"\` FOR WRITE. Write \`"Cat"\`, \`"Dog"\`, \`"Bee"\`. CLOSEFILE. Re-open FOR APPEND. Write \`"Elephant"\` and \`"Computer"\`. CLOSEFILE. Re-open FOR READ. Use WHILE NOT EOF to READFILE each word and OUTPUT only those with LENGTH > 3. CLOSEFILE when done.`,
[t([],['Elephant','Computer'])],
['Write the short words first in WRITE mode, then append the longer ones', 'Check LENGTH(Word) > 3 inside the WHILE loop before outputting'],
'', '', src => fileCheck(src, 'WRITE', 'APPEND', 'READ')),

ex('fil-18','files','File: Total from File','hard',
`Open \`"payments.txt"\` FOR WRITE. Write 25 and 50. CLOSEFILE. Re-open FOR APPEND. Write 100 and 75. CLOSEFILE. Re-open FOR READ. Read and accumulate the total. CLOSEFILE, then OUTPUT the total. Note: values read from a file are strings — use \`STR_TO_NUM()\` to convert before arithmetic.`,
[t([],['250'])],
['Write the first two payments in WRITE mode, then append the remaining two', 'Each value read with READFILE is a string — convert with STR_TO_NUM() before adding to the total'],
'', '', src => fileCheck(src, 'WRITE', 'APPEND', 'READ') ?? (/\bSTR_TO_NUM\b/i.test(src) ? null : 'Values read from a file are strings — you must use STR_TO_NUM() to convert them before arithmetic.')),

ex('fil-19','files','CSV: Write and Read Student Records','hard',
`Write three comma-separated lines to \`"students.txt"\`: \`"Alice,85"\`, \`"Bob,72"\`, \`"Carol,91"\`. Re-open FOR READ. Use WHILE NOT EOF to read each line and OUTPUT the name and score separated by \`": "\`.`,
[t([],['Alice: 85','Bob: 72','Carol: 91'])],
['Alice is 5 characters; the score starts 2 positions after the comma', 'Join the name and score with ": " between them using &'],
'', '', src => fileCheck(src, 'WRITE', 'READ')),

ex('fil-20','files','File: Write With Procedure','hard',
`Write a PROCEDURE \`WriteToFile(BYVAL FileName : STRING, BYVAL Content : STRING)\` that opens the file FOR WRITE, writes Content, and closes it. Call it to write \`"Data saved"\` to \`"output.txt"\`. Then read and OUTPUT the file content.`,
[t([],['Data saved'])],
['The procedure handles OPENFILE, WRITEFILE, CLOSEFILE', 'Read back manually: open FOR READ, READFILE, CLOSEFILE, OUTPUT'],
PROC_SCAFFOLD, '', src => fileCheck(src, 'WRITE', 'READ')),

ex('fil-21','files','File: Append to a Log','medium',
`Open \`"log.txt"\` FOR WRITE. WRITEFILE \`"Session started"\`. CLOSEFILE. Re-open FOR APPEND. WRITEFILE \`"User logged in"\`. CLOSEFILE. Re-open FOR APPEND. WRITEFILE \`"Task complete"\`. CLOSEFILE. Re-open FOR READ. Use WHILE NOT EOF to read and OUTPUT each line. CLOSEFILE when done.`,
[t([],['Session started','User logged in','Task complete'])],
['WRITE mode creates the file and writes the first entry', 'Each APPEND re-open adds a new line without clearing what is already there', 'A third OPENFILE FOR APPEND adds the final entry before you read back'],
'', '', src => fileCheck(src, 'WRITE', 'APPEND', 'READ')),

// ─────────────────────────────────────────────────────────────────────────────
// STANDARD ALGORITHMS  (13)
// ─────────────────────────────────────────────────────────────────────────────

ex('alg-01','algorithms','Linear Search: Found/Not Found','medium',
`Declare \`Data : ARRAY[1:6] OF INTEGER\` with values 3, 7, 1, 9, 4, 6. INPUT a target. Use linear search to OUTPUT \`Found\` or \`Not found\`.`,
[t(['9'],['Found']), t(['5'],['Not found']), t(['3'],['Found'])],
['Use a FOR loop to check each element against Target', 'Use a boolean flag to track whether the value was found']),

ex('alg-02','algorithms','Linear Search: Return Position','hard',
`Declare \`Data : ARRAY[1:6] OF INTEGER\` with values 10, 25, 7, 42, 19, 33. INPUT a target. OUTPUT the 1-based index if found, or \`-1\` if not.`,
[t(['42'],['4']), t(['7'],['3']), t(['99'],['-1'])],
['Initialise a position variable to -1 to represent "not found"', 'Update it when the target is found']),

ex('alg-03','algorithms','Find Highest Value','medium',
`INPUT 5 integers. Store the highest in \`Max\` and OUTPUT it.`,
[t(['3','7','1','9','2'],['9']), t(['5','5','5','5','5'],['5'])],
['Initialise Max from the first input', 'Update Max each time a larger value is found']),

ex('alg-04','algorithms','Find Lowest Value','medium',
`INPUT 5 integers. Store the lowest in \`Min\` and OUTPUT it.`,
[t(['3','7','1','9','2'],['1']), t(['5','2','8','4','6'],['2'])],
['Initialise Min from the first input', 'Update Min each time a smaller value is found']),

ex('alg-05','algorithms','Totalling and Averaging','medium',
`INPUT 5 integers. Accumulate the sum in \`Total\`, then OUTPUT the average (Total ÷ 5) rounded to 1 decimal place.`,
[t(['2','4','6','8','10'],['6.0']), t(['1','2','3','4','5'],['3.0'])],
['Accumulate into Total, then divide by 5', 'Use ROUND(Total / 5, 1) to format to 1 decimal place']),

ex('alg-06','algorithms','Counting Occurrences','medium',
`INPUT 6 integers into an array \`Data\`. Count how many are greater than 5 and OUTPUT the count.`,
[t(['3','8','1','6','2','9'],['3']), t(['1','2','3','4','5','6'],['1'])],
['Use a FOR loop and increment a counter when the element is greater than 5']),

ex('alg-07','algorithms','Bubble Sort (Ascending)','hard',
`INPUT 6 integers into an array \`Data\`. Sort them ascending using bubble sort. OUTPUT all 6 values (one per line).`,
[t(['5','3','8','1','4','7'],['1','3','4','5','7','8']), t(['9','7','5','3','2','1'],['1','2','3','5','7','9'])],
['Outer loop: 1 to 5; inner loop compares adjacent elements', 'Swap when out of order using a Temp variable'],
'', '', requireNestedLoops),

ex('alg-08','algorithms','Bubble Sort (Descending)','hard',
`INPUT 5 integers into an array \`Data\`. Sort them descending using bubble sort. OUTPUT all 5 (largest first).`,
[t(['5','3','8','1','4'],['8','5','4','3','1']), t(['1','3','5','7','9'],['9','7','5','3','1'])],
['Same structure as ascending but swap when adjacent elements are in the wrong order for descending'],
'', '', requireNestedLoops),

ex('alg-10','algorithms','Find Highest and Its Position','hard',
`INPUT 5 integers into an array. Find the highest value and its 1-based position. Use NUM_TO_STR and & to OUTPUT \`Max number: X\` then \`Position: Y\`.`,
[t(['3','7','1','9','2'],['Max number: 9','Position: 4']), t(['10','4','6','8','2'],['Max number: 10','Position: 1'])],
['Track both the maximum value and its position', 'Update both when a new maximum is found', 'Convert each integer to a string with NUM_TO_STR before joining with the label']),

ex('alg-11','algorithms','Average Excluding Zeros','hard',
`INPUT 6 integers into \`Data\`. Use \`Total\` and \`Count\` to sum and count non-zero values. OUTPUT the average rounded to 1 decimal place, or \`No data\` if all are zero.`,
[t(['0','4','6','0','2','8'],['5.0']), t(['0','0','0','0','0','0'],['No data'])],
['Only add non-zero values to Total and increment Count', 'Check Count > 0 before dividing']),

ex('alg-12','algorithms','Check Sorted Ascending','hard',
`INPUT 5 integers into \`Data\`. OUTPUT \`Sorted\` if they are already in ascending order, otherwise OUTPUT \`Not sorted\`.`,
[t(['1','2','3','4','5'],['Sorted']), t(['1','3','2','4','5'],['Not sorted']), t(['5','5','5','5','5'],['Sorted'])],
['Use a boolean flag initialised to TRUE', 'Set it to FALSE if any element is greater than the next']),

ex('alg-13','algorithms','Linear Search in Parallel Arrays','hard',
`Declare \`Names : ARRAY[1:5] OF STRING\` with "Alice","Bob","Charlie","David","Eve" and \`Ages : ARRAY[1:5] OF INTEGER\` with 14,15,13,16,15. INPUT a name. If found, OUTPUT the corresponding age. If not found, OUTPUT \`Not found\`.`,
[t(['Charlie'],['13']), t(['Alice'],['14']), t(['Zara'],['Not found'])],
['Loop through Names looking for a match', 'Use the same index to look up Ages']),

ex('alg-15','algorithms','Sort a 2D Name Array','hard',
`Declare \`Names : ARRAY[1:4, 1:2] OF STRING\` with rows: (Alice,Wong), (Bob,Smith), (Charlie,Brown), (Diana,Jones). Sort by last name (column 2) ascending using bubble sort. OUTPUT sorted full names.`,
[t([],['Charlie Brown','Diana Jones','Bob Smith','Alice Wong'])],
['Compare Names[i,2] with Names[i+1,2]', 'Swap both columns when the last name in row i > row i+1']),

// ─────────────────────────────────────────────────────────────────────────────
// EXAM QUESTIONS  (7)
// ─────────────────────────────────────────────────────────────────────────────

ex('exam-01','exam','Q1 — String Operations (AS Style)','medium',
`The function \`MID(String, Start, Length)\` returns a substring. \`LCASE()\` and \`UCASE()\` convert case. \`LENGTH()\` returns the length.

Write pseudocode to:
• store the string \`"AS Computer Science at Cambridge"\` in a variable called \`FullText\`
• extract \`"Computer Science"\` using MID and store in \`Subject\`, then OUTPUT \`Subject\`
• OUTPUT the original \`FullText\` in uppercase

[4 marks]`,
[t([],['Computer Science','AS COMPUTER SCIENCE AT CAMBRIDGE'])],
['"Computer Science" starts at position 4 — count the leading characters to verify', 'Count how many characters are in "Computer Science" to get the length argument', 'A single function call can convert the entire string to uppercase']),

ex('exam-02','exam','Q2 — BYREF Procedure','medium',
`A program needs to count how many times a procedure has been called.

Write a PROCEDURE \`Increment(BYREF Count : INTEGER)\` that adds 1 to Count.

Write a main program that:
• declares an integer \`CallCount ← 0\`
• calls Increment three times
• OUTPUTs the final value of CallCount

[5 marks]`,
[t([],['3'])],
['BYREF means changes inside the procedure affect the original variable', 'Write the CALL statement three times in sequence in the main program'],
PROC_SCAFFOLD,
'',
requireBYREF),

ex('exam-03','exam','Q3 — File Handling with CSV','hard',
`A student record system stores data as CSV lines in the format \`Name,Score\`.

Write pseudocode to:
• open \`"results.txt"\` FOR WRITE
• write \`"Alice,85"\` and \`"Bob,72"\`
• close the file
• re-open FOR READ
• use WHILE NOT EOF to read each line and output the name portion
• close the file

[6 marks]`,
[t([],['Alice','Bob'])],
['Write each CSV record as a single WRITEFILE call', 'Each name has a different length — count the characters to extract the right number', 'In AS 9618, WHILE does not use a DO keyword']),

ex('exam-04','exam','Q4 — Record Type Definition','hard',
`An airline wants to store flight information.

Write pseudocode to:
• define a record type \`FlightRecord\` with fields: \`FlightCode : STRING\`, \`Destination : STRING\`, \`Seats : INTEGER\`
• declare a variable \`Flight : FlightRecord\`
• assign: FlightCode ← "BA001", Destination ← "London", Seats ← 180
• OUTPUT all three fields

[5 marks]`,
[t([],['BA001','London','180'])],
['Record types are defined using TYPE...ENDTYPE with DECLARE statements for each field inside', 'Access and assign record fields using dot notation: RecordVariable.FieldName']),

ex('exam-05','exam','Q5 — Array Processing','medium',
`A one-dimensional array called \`Temperatures\` has 25 elements (indices 1 to 25) holding values between -20 and 100.

Write a pseudocode algorithm using a single loop to find the lowest value and output the result.

[4 marks]

*The array has been pre-loaded for you to test your solution.*`,
[t([],['-15'])],
['Set a variable to the value of the first element before the loop', 'Loop from index 1 to 25; update the minimum when a smaller value is found', 'OUTPUT after the loop, not inside it'],
`DECLARE Temperatures : ARRAY[1:25] OF INTEGER
// Assume the Temperatures array has now been populated.`,
`Temperatures[1] ← 45
Temperatures[2] ← 23
Temperatures[3] ← -15
Temperatures[4] ← 67
Temperatures[5] ← 8
Temperatures[6] ← 34
Temperatures[7] ← -3
Temperatures[8] ← 89
Temperatures[9] ← 12
Temperatures[10] ← 56
Temperatures[11] ← 78
Temperatures[12] ← -8
Temperatures[13] ← 44
Temperatures[14] ← 91
Temperatures[15] ← 33
Temperatures[16] ← 17
Temperatures[17] ← 65
Temperatures[18] ← 29
Temperatures[19] ← 83
Temperatures[20] ← 41
Temperatures[21] ← -12
Temperatures[22] ← 55
Temperatures[23] ← 72
Temperatures[24] ← 18
Temperatures[25] ← 60`),

ex('exam-06','exam','Q6 — Function with Returns','hard',
`Write a FUNCTION \`TotalNumbers() RETURNS INTEGER\` that:
• uses a count-controlled loop from 1 to 50
• asks for a number between 1 and 100 on each iteration
• totals the numbers (do not use an array)
• returns the total after the loop

After your function, write the comment \`// Main\`. Beneath this, write three pseudocode statements to:
• declare a variable \`Total\`
• assign the return value of \`TotalNumbers()\` to \`Total\`
• display the total with a suitable message

[6 marks]

*To test: enter any 50 numbers between 1 and 100. The displayed total should be their sum.*`,
[],
['Declare a running total inside the function, initialised to 0', 'Use a FOR loop from 1 to 50', 'RETURN the total after the loop']),

ex('exam-07','exam','Q7 — Validation and Type Conversion','hard',
`A program reads prices from a user as strings (e.g., "9.99").

Write pseudocode to:
• INPUT a string \`PriceStr\`
• validate that LENGTH(PriceStr) > 0
• convert to a REAL using \`STR_TO_NUM()\`
• validate that the converted value is between 0.01 and 999.99 inclusive
• if valid, OUTPUT \`"Price accepted: "\` followed by the value; if invalid, OUTPUT \`"Invalid price"\`

[5 marks]`,
[t(['9.99'],['Price accepted: 9.99']), t(['0'],['Invalid price']), t([''],['Invalid price']), t(['1500'],['Invalid price'])],
['Check LENGTH > 0 first', 'Use STR_TO_NUM to convert', 'Check the numeric value is within range']),

];

// ── Sanity check ──────────────────────────────────────────────────────────────
if (EXERCISES.length !== 227) {
  console.warn(`exercises.js: expected 227 exercises, got ${EXERCISES.length}`);
}
