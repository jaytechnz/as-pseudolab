// ─── 200 Cambridge IGCSE Pseudocode Exercises ─────────────────────────────────
// Each exercise: { id, category, title, difficulty, xp, description, tests, hints, starterCode, prelude, postlude, sourceCheck }
// tests: [{ inputs: string[], expected: string[] }]
// difficulty: 'easy' (10xp) | 'medium' (25xp) | 'hard' (50xp)
// sourceCheck(source): optional fn — returns an error string if source fails, or null if OK
// prelude: injected after DECLAREs, before student code (e.g. pre-populate an array)
// postlude: injected after all student code (e.g. overwrite randomly-filled array with fixed test data)

const XP = { easy: 10, medium: 25, hard: 50 };

const PROC_SCAFFOLD = '// Procedures and/or Functions\n\n\n\n// Main Program\n';

function ex(id, cat, title, diff, desc, tests, hints = [], starter = '', prelude = '', sourceCheck = null, postlude = '', stripRandomLoops = false, preludeTestOnly = false) {
  return { id, category: cat, title, difficulty: diff, xp: XP[diff], description: desc, tests, hints, starterCode: starter, prelude, postlude, sourceCheck, stripRandomLoops, preludeTestOnly };
}
function t(inputs, expected) { return { inputs, expected }; }

/** Enforce that a keyword is used in function-call form, e.g. MOD(a,b) not a MOD b */
function requireFunctionForm(name) {
  return (source) => {
    const hasCall = new RegExp(`\\b${name}\\s*\\(`, 'i').test(source);
    const hasOp   = new RegExp(`(?<![A-Za-z0-9_(])${name}\\b(?!\\s*\\()`, 'i').test(source);
    if (!hasCall) return `You must use \`${name}()\` as a function call (e.g. \`${name}(a, b)\`), not the \`${name}\` operator.`;
    if (hasOp)    return `Remove the \`${name}\` operator — this exercise requires the \`${name}()\` function form only.`;
    return null;
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// CATEGORY METADATA
// ══════════════════════════════════════════════════════════════════════════════

export const CATEGORIES = [
  { id: 'basics',     label: 'Basics',                              count: 30 },
  { id: 'operators',  label: 'Operators',                           count: 20 },
  { id: 'selection',  label: 'Selection',                           count: 25 },
  { id: 'iteration',  label: 'Iteration',                           count: 25 },
  { id: 'library',    label: 'Library Routines & String Handling',  count: 20 },
  { id: 'procedures', label: 'Functions & Procedures',              count: 25 },
  { id: 'arrays',     label: 'Arrays',                              count: 25 },
  { id: 'files',      label: 'File Handling',                       count: 15 },
  { id: 'algorithms', label: 'Standard Algorithms',                 count: 15 },
  { id: 'exam',       label: 'Exam Questions',                      count: 7  },
];

// ══════════════════════════════════════════════════════════════════════════════
// EXERCISES
// ══════════════════════════════════════════════════════════════════════════════

export const EXERCISES = [

// ─────────────────────────────────────────────────────────────────────────────
// BASICS  (30)
// ─────────────────────────────────────────────────────────────────────────────

ex('bas-01','basics','Declare and Output an Integer','easy',
`Declare an INTEGER variable called \`Count\`, assign it the value \`42\`, and OUTPUT it.`,
[t([],['42'])],
['Use DECLARE to create an INTEGER variable called Count', 'Assign the value 42, then OUTPUT the variable']),

ex('bas-02','basics','Declare and Output a Real Number','easy',
`Declare a REAL variable called \`Price\`, assign it the value \`9.99\`, and OUTPUT it.`,
[t([],['9.99'])],
['Use DECLARE to create a REAL variable', 'Assign 9.99 and OUTPUT it']),

ex('bas-03','basics','Declare and Output a String','easy',
`Declare a STRING variable called \`Message\`, assign it \`"Hello"\`, and OUTPUT it.`,
[t([],['Hello'])],
['Use DECLARE to create a STRING variable', 'Assign the string value and OUTPUT it']),

ex('bas-04','basics','Declare and Output TRUE','easy',
`Declare a BOOLEAN variable called \`IsReady\`, assign it \`TRUE\`, and OUTPUT it.`,
[t([],['TRUE'])],
['Use DECLARE to create a BOOLEAN variable', 'Assign TRUE and OUTPUT it']),

ex('bas-05','basics','Declare and Output FALSE','easy',
`Declare a BOOLEAN variable called \`IsFinished\`, assign it \`FALSE\`, and OUTPUT it.`,
[t([],['FALSE'])],
['Use DECLARE to create a BOOLEAN variable', 'Assign FALSE and OUTPUT it']),

ex('bas-06','basics','Integer Constant','easy',
`Declare a CONSTANT called \`MAX_SIZE\` with value \`100\`, and OUTPUT it.`,
[t([],['100'])],
['Use the CONSTANT keyword, the name, an equals sign, and the value', 'OUTPUT the constant name directly']),

ex('bas-07','basics','Real Constant','easy',
`Declare a CONSTANT called \`PI\` with value \`3.14159\`, and OUTPUT it.`,
[t([],['3.14159'])],
['Use the CONSTANT keyword to declare a named constant', 'OUTPUT it directly by name']),

ex('bas-08','basics','Reassign a Variable','easy',
`Declare an INTEGER variable \`Score\`, assign it \`5\`, then reassign it to \`20\`. OUTPUT the final value.`,
[t([],['20'])],
['Assign Score the value 5 first, then reassign it to 20', 'The OUTPUT statement runs after the second assignment, so it prints 20']),

ex('bas-09','basics','Two Variables','easy',
`Declare two INTEGER variables \`Num1\` and \`Num2\`. Assign \`Num1 ← 10\` and \`Num2 ← 20\`. OUTPUT \`Num1\` then \`Num2\` on separate lines.`,
[t([],['10','20'])],
['You need two separate OUTPUT statements, one for each variable']),

ex('bas-10','basics','Swap Two Variables','medium',
`Declare INTEGER variables \`Num1 ← 10\` and \`Num2 ← 20\`. Swap their values using a third variable \`Temp\`. OUTPUT \`Num1\` then \`Num2\`.`,
[t([],['20','10'])],
['Declare a third INTEGER variable called Temp to hold one value during the swap', 'Copy Num1 into Temp, then Num2 into Num1, then Temp into Num2']),

ex('bas-11','basics','Input and Output an Integer','easy',
`INPUT an integer into a variable \`Number\` and immediately OUTPUT it.`,
[t(['7'],['7']), t(['42'],['42'])],
['Use INPUT to read the value into Number, then OUTPUT it']),

ex('bas-12','basics','Input and Output a String','easy',
`INPUT a name into a STRING variable \`Name\` and OUTPUT it.`,
[t(['Alice'],['Alice']), t(['Bob'],['Bob'])],
['Use DECLARE to create a STRING variable, then INPUT and OUTPUT it']),

ex('bas-13','basics','Reverse Two Inputs','medium',
`INPUT two integers \`Num1\` and \`Num2\` (in that order). OUTPUT \`Num2\` first, then \`Num1\`.`,
[t(['3','5'],['5','3']), t(['10','99'],['99','10'])],
['INPUT Num1 first and Num2 second', 'OUTPUT them in the opposite order: Num2 before Num1']),

ex('bas-14','basics','Personalised Greeting','easy',
`INPUT a name into a variable called \`Name\`. OUTPUT \`Hello, \` followed by the name (no space after the comma — it is already there).`,
[t(['Alice'],['Hello, Alice']), t(['World'],['Hello, World'])],
['Use the & operator to join the string "Hello, " with the Name variable']),

ex('bas-15','basics','Double an Input','easy',
`INPUT an integer \`Number\`. OUTPUT the value doubled.`,
[t(['6'],['12']), t(['5'],['10'])],
['Multiply the input by 2 inside the OUTPUT statement']),

ex('bas-16','basics','Concatenate Two Strings','easy',
`Assign \`First ← "Hello"\` and \`Last ← "World"\`. OUTPUT them joined together with no space.`,
[t([],['HelloWorld'])],
['Use the & operator to join the two string variables']),

ex('bas-17','basics','Concatenate with a Space','easy',
`Assign \`First ← "Hello"\` and \`Last ← "World"\`. OUTPUT them with a single space between.`,
[t([],['Hello World'])],
['Join the two strings with a space string " " between them using &']),

ex('bas-18','basics','Concatenate String and Number','medium',
`Declare \`Age ← 16\`. Use a single OUTPUT statement with comma-separated values to print \`Age: 16\`.`,
[t([],['Age: 16'])],
['Use OUTPUT with a comma to separate the string label "Age: " and the Age variable on one line']),

ex('bas-19','basics','Full Name from Two Inputs','easy',
`INPUT a first name into \`FirstName\` and a last name into \`LastName\`. OUTPUT the full name with a space between them.`,
[t(['John','Smith'],['John Smith']), t(['Ada','Lovelace'],['Ada Lovelace'])],
['Join FirstName, a space string " ", and LastName using the & operator']),

ex('bas-20','basics','Calculate and Announce','medium',
`Declare \`Num1 ← 8\` and \`Num2 ← 7\`. Use a single OUTPUT statement to print \`Result: 56\`, combining the label and the product.`,
[t([],['Result: 56'])],
['Use OUTPUT with a comma to separate the label string "Result: " from the calculated expression Num1 * Num2']),

ex('bas-21','basics','Welcome Message','easy',
`INPUT a name into a variable called \`Name\`. OUTPUT \`Welcome, \` followed by the name, followed by \`!\`.`,
[t(['Alice'],['Welcome, Alice!']), t(['Class'],['Welcome, Class!'])],
['Join the parts of the message using the & operator']),

ex('bas-22','basics','Announce a Value','medium',
`Declare \`Points ← 100\`. OUTPUT the text \`Points: 100\`.`,
[t([],['Points: 100'])],
['Use OUTPUT with comma-separated values: the label string "Points: " then the Points variable']),

ex('bas-23','basics','Three Lines of Output','easy',
`OUTPUT three separate lines: \`Line 1\`, \`Line 2\`, and \`Line 3\`.`,
[t([],['Line 1','Line 2','Line 3'])],
['Write three separate OUTPUT statements, one for each line']),

ex('bas-24','basics','Sum Announcement','medium',
`Declare \`Num1 ← 15\` and \`Num2 ← 27\`. OUTPUT \`Sum: 42\`.`,
[t([],['Sum: 42'])],
['Use OUTPUT with a comma to separate the label "Sum: " from the expression Num1 + Num2']),

ex('bas-25','basics','Zero Initialisation','easy',
`Declare an INTEGER variable \`Counter\` and assign it \`0\`. OUTPUT its value.`,
[t([],['0'])],
['Initialise Counter to 0, then OUTPUT it']),

ex('bas-26','basics','Age Statement','medium',
`INPUT an integer \`Age\`. Use a single OUTPUT statement to display: **You are [Age] years old** (no full stop). Example: if Age is 15, output exactly \`You are 15 years old\`.`,
[t(['15'],['You are 15 years old']), t(['18'],['You are 18 years old'])],
['Use OUTPUT with comma-separated values: the opening string, the Age variable, then the closing string']),

ex('bas-27','basics','Two Strings on One Line','medium',
`INPUT two words \`Word1\` and \`Word2\`. OUTPUT them on one line separated by a space.`,
[t(['Hello','World'],['Hello World']), t(['Good','Morning'],['Good Morning'])],
['Use the & operator to join Word1, a space " ", and Word2']),

ex('bas-28','basics','Char Variable','easy',
`Declare a CHAR variable \`Grade\`, assign it \`'A'\`, and OUTPUT it.`,
[t([],['A'])],
['Use DECLARE to create a CHAR variable', "Assign the single character 'A' using single quotes and OUTPUT it"]),

ex('bas-29','basics','Constant Greeting','medium',
`Declare CONSTANT \`GREETING = "Hello"\`. OUTPUT \`Hello, World!\` by using the constant.`,
[t([],['Hello, World!'])],
['Use the GREETING constant and join it with the rest of the string using &']),

ex('bas-30','basics','Three Inputs Three Outputs','easy',
`Use INPUT to read three integers from the user into \`Num1\`, \`Num2\`, and \`Num3\`. Then OUTPUT each on its own line. Your solution must use INPUT statements — the tests supply different values each time.`,
[t(['1','2','3'],['1','2','3']), t(['10','20','30'],['10','20','30'])],
['Use three INPUT statements followed by three OUTPUT statements']),

// ─────────────────────────────────────────────────────────────────────────────
// OPERATORS  (20)
// ─────────────────────────────────────────────────────────────────────────────

ex('ops-01','operators','Addition','easy',
`Declare \`Num1 ← 12\` and \`Num2 ← 8\`. OUTPUT their sum.`,
[t([],['20'])],
['Add Num1 and Num2 together inside the OUTPUT statement']),

ex('ops-02','operators','Subtraction','easy',
`Declare \`Num1 ← 15\` and \`Num2 ← 6\`. OUTPUT \`Num1 - Num2\`.`,
[t([],['9'])],
['Subtract Num2 from Num1 inside the OUTPUT statement']),

ex('ops-03','operators','Multiplication','easy',
`Declare \`Num1 ← 6\` and \`Num2 ← 7\`. OUTPUT \`Num1 * Num2\`.`,
[t([],['42'])],
['Multiply Num1 by Num2 inside the OUTPUT statement']),

ex('ops-04','operators','Real Division','easy',
`Declare a REAL variable \`Result\`. Assign it \`7 / 2\`. OUTPUT \`Result\`.`,
[t([],['3.5'])],
['Declare Result as a REAL variable', 'Dividing 7 by 2 gives 3.5 as a real number result']),

ex('ops-05','operators','Integer Division - DIV','medium',
`INPUT two integers \`Num1\` and \`Num2\`. OUTPUT the integer quotient using the \`DIV\` **operator** — write it between the two operands: \`Num1 DIV Num2\`. Do **not** use the library routine \`DIV()\`.`,
[t(['17','5'],['3']), t(['10','3'],['3'])],
['DIV is an infix operator, not a function — write Num1 DIV Num2, not DIV(Num1, Num2)', 'It returns the whole-number part of the division, discarding any remainder']),

ex('ops-06','operators','Modulus Division - MOD','medium',
`INPUT two integers \`Num1\` and \`Num2\`. OUTPUT the remainder using the \`MOD\` **operator** — write it between the two operands: \`Num1 MOD Num2\`. Do **not** use the library routine \`MOD()\`.`,
[t(['17','5'],['2']), t(['10','3'],['1'])],
['MOD is an infix operator, not a function — write Num1 MOD Num2, not MOD(Num1, Num2)', 'It returns the remainder after integer division']),

ex('ops-07','operators','Sum of Two Inputs','easy',
`INPUT two integers \`Num1\` and \`Num2\`. OUTPUT their sum.`,
[t(['12','8'],['20']), t(['3','7'],['10'])],
['Add the two input variables together inside the OUTPUT statement']),

ex('ops-08','operators','Product of Two Inputs','easy',
`INPUT two integers \`Num1\` and \`Num2\`. OUTPUT their product.`,
[t(['6','7'],['42']), t(['4','5'],['20'])],
['Multiply the two input variables together inside the OUTPUT statement']),

ex('ops-09','operators','Greater Than','easy',
`Declare \`Num1 ← 5\` and \`Num2 ← 3\`. Declare BOOLEAN \`Result ← Num1 > Num2\`. OUTPUT \`Result\`.`,
[t([],['TRUE'])],
['Declare Result as BOOLEAN', 'Assign the comparison Num1 > Num2 directly to the variable and OUTPUT it']),

ex('ops-10','operators','Less Than','easy',
`Declare three variables: \`Num1\` and \`Num2\` as integers, and \`Result\` as Boolean. Assign \`Num1\` the value 3 and \`Num2\` the value 5. Assign to \`Result\` the outcome of checking whether \`Num1\` is less than \`Num2\`, then OUTPUT \`Result\`.`,
[t([],['TRUE'])],
['Use DECLARE for all three variables before assigning values', 'Assign the comparison Num1 < Num2 to Result — this evaluates to TRUE since 3 is less than 5']),

ex('ops-11','operators','Equal To','easy',
`Declare an integer variable \`Number\` and a Boolean variable \`Result\`. Assign \`Number\` the hardcoded value 7. Assign \`Result\` the outcome of comparing \`Number\` with 7. OUTPUT the contents of \`Result\`.`,
[t([],['TRUE'])],
['Use DECLARE for both variables before assigning values', 'In pseudocode, = is used for equality comparison as well as assignment', 'Comparing 7 = 7 evaluates to TRUE']),

ex('ops-12','operators','Not Equal To','easy',
`Declare \`Num1 ← 5\`. Declare BOOLEAN \`Result ← Num1 <> 5\`. OUTPUT \`Result\`.`,
[t([],['FALSE'])],
['The <> operator means "not equal to"']),

ex('ops-13','operators','Greater Than or Equal','medium',
`INPUT an integer \`Number\`. OUTPUT whether \`Number >= 10\` is TRUE or FALSE.`,
[t(['10'],['TRUE']), t(['9'],['FALSE']), t(['15'],['TRUE'])],
['Assign the result of the comparison Number >= 10 to a BOOLEAN variable and OUTPUT it']),

ex('ops-14','operators','Less Than or Equal','medium',
`INPUT an integer \`Number\`. OUTPUT whether \`Number <= 5\` is TRUE or FALSE.`,
[t(['5'],['TRUE']), t(['6'],['FALSE']), t(['3'],['TRUE'])],
['Assign the result of Number <= 5 to a BOOLEAN variable and OUTPUT it']),

ex('ops-15','operators','Compare Two Inputs','medium',
`INPUT two integers \`Num1\` and \`Num2\`. OUTPUT TRUE if \`Num1\` is greater than \`Num2\`, otherwise FALSE.`,
[t(['8','3'],['TRUE']), t(['2','9'],['FALSE']), t(['5','5'],['FALSE'])],
['OUTPUT the result of the > comparison directly — it evaluates to TRUE or FALSE']),

ex('ops-16','operators','AND Operator','easy',
`Declare \`P ← TRUE\` and \`Q ← TRUE\`. OUTPUT \`P AND Q\`.`,
[t([],['TRUE'])],
['OUTPUT the result of P AND Q directly']),

ex('ops-17','operators','AND with False','easy',
`Declare \`P ← TRUE\` and \`Q ← FALSE\`. OUTPUT \`P AND Q\`.`,
[t([],['FALSE'])],
['TRUE AND FALSE evaluates to FALSE']),

ex('ops-18','operators','OR Operator','easy',
`Declare \`P ← FALSE\` and \`Q ← TRUE\`. OUTPUT \`P OR Q\`.`,
[t([],['TRUE'])],
['OUTPUT the result of P OR Q directly']),

ex('ops-19','operators','NOT Operator','easy',
`Declare \`P ← TRUE\`. OUTPUT \`NOT P\`.`,
[t([],['FALSE'])],
['NOT reverses the boolean value — NOT TRUE gives FALSE']),

ex('ops-20','operators','Combined Boolean Expression','hard',
`INPUT two integers \`Num1\` and \`Num2\`. OUTPUT whether the expression \`(Num1 > 0) AND (Num2 > 0)\` is TRUE or FALSE.`,
[t(['5','3'],['TRUE']), t(['-1','3'],['FALSE']), t(['5','-2'],['FALSE'])],
['Combine two separate comparisons using the AND operator', 'Both conditions must be true for the result to be TRUE']),

// ─────────────────────────────────────────────────────────────────────────────
// SELECTION  (25)
// ─────────────────────────────────────────────────────────────────────────────

ex('sel-01','selection','Positive or Negative','easy',
`INPUT an integer \`Number\`. If \`Number > 0\`, OUTPUT \`Positive\`; otherwise OUTPUT \`Negative\`.`,
[t(['5'],['Positive']), t(['-3'],['Negative'])],
['Use an IF statement with a THEN branch for "Positive" and an ELSE branch for "Negative"']),

ex('sel-02','selection','Zero Check','easy',
`INPUT an integer \`Number\`. If \`Number = 0\`, OUTPUT \`Zero\`; otherwise OUTPUT \`Not zero\`.`,
[t(['0'],['Zero']), t(['5'],['Not zero'])],
['Use IF with = to test for zero, and an ELSE branch for the other case']),

ex('sel-03','selection','IF Without ELSE','easy',
`INPUT an integer \`Number\`. If \`Number > 10\`, OUTPUT \`Big\`. If \`Number\` is not greater than 10, output nothing.`,
[t(['15'],['Big']), t(['5'],[])],
['Use an IF statement without an ELSE clause — nothing is output when the condition is false']),

ex('sel-04','selection','Pass or Fail','easy',
`INPUT a mark (integer) into a variable called \`Mark\`. If the mark is 50 or above, OUTPUT \`Pass\`; otherwise OUTPUT \`Fail\`.`,
[t(['75'],['Pass']), t(['49'],['Fail']), t(['50'],['Pass'])],
['Use IF with >= 50 in the condition, THEN for "Pass" and ELSE for "Fail"']),

ex('sel-05','selection','Positive, Negative, or Zero','medium',
`INPUT an integer \`Number\`. OUTPUT \`Positive\`, \`Negative\`, or \`Zero\` as appropriate.`,
[t(['7'],['Positive']), t(['-4'],['Negative']), t(['0'],['Zero'])],
['Use a nested IF inside the ELSE branch to distinguish between negative and zero']),

ex('sel-06','selection','Grade Boundaries (A/B/C)','medium',
`INPUT a mark. If 90 or above OUTPUT \`A\`. If 70–89 OUTPUT \`B\`. Otherwise OUTPUT \`C\`.`,
[t(['95'],['A']), t(['75'],['B']), t(['60'],['C'])],
['Use nested IF statements, checking the highest boundary first', 'Check >= 90 first, then >= 70, with a final ELSE for everything below']),

ex('sel-07','selection','Maximum of Two','medium',
`INPUT two integers \`Num1\` and \`Num2\`. OUTPUT the larger value.`,
[t(['8','3'],['8']), t(['2','9'],['9']), t(['5','5'],['5'])],
['Use IF to compare the two values, outputting the larger one in each branch']),

ex('sel-08','selection','Even or Odd','easy',
`INPUT an integer \`Number\`. OUTPUT \`Even\` if divisible by 2, otherwise \`Odd\`.`,
[t(['4'],['Even']), t(['7'],['Odd']), t(['0'],['Even'])],
['Use MOD to test divisibility by 2 — a remainder of 0 means even']),

ex('sel-09','selection','Absolute Value','medium',
`INPUT an integer \`Number\`. OUTPUT its absolute value (always non-negative).`,
[t(['-5'],['5']), t(['3'],['3']), t(['0'],['0'])],
['If the number is negative, output its negation; otherwise output it as-is']),

ex('sel-10','selection','Password Check','easy',
`INPUT a password string \`Password\`. If it equals \`"secret"\`, OUTPUT \`Access granted\`; otherwise OUTPUT \`Access denied\`.`,
[t(['secret'],['Access granted']), t(['wrong'],['Access denied'])],
['Use IF to compare the input string to "secret" using =']),

ex('sel-11','selection','Triangle Type','hard',
`INPUT three integer side lengths \`Side1\`, \`Side2\`, \`Side3\`. OUTPUT \`Equilateral\` if all equal, \`Isosceles\` if exactly two are equal, otherwise \`Scalene\`.`,
[t(['5','5','5'],['Equilateral']), t(['5','5','3'],['Isosceles']), t(['3','4','5'],['Scalene'])],
['Check all three sides equal for equilateral first', 'Then check if any two sides are equal for isosceles using OR']),

ex('sel-12','selection','Leap Year','hard',
`INPUT a year. OUTPUT \`Leap year\` or \`Not a leap year\`. A year is a leap year if divisible by 400, OR divisible by 4 but NOT by 100.`,
[t(['2000'],['Leap year']), t(['1900'],['Not a leap year']), t(['2024'],['Leap year']), t(['2023'],['Not a leap year'])],
['A year divisible by 400 is always a leap year', 'A year divisible by 4 but NOT by 100 is also a leap year', 'Use MOD to test each condition']),

ex('sel-13','selection','CASE: Grade Letter','medium',
`INPUT a single grade letter (\`A\`, \`B\`, or \`C\`). Use a CASE statement to output \`Excellent\`, \`Good\`, or \`Average\` respectively. If none match, OUTPUT \`Unknown\`.`,
[t(['A'],['Excellent']), t(['B'],['Good']), t(['C'],['Average']), t(['D'],['Unknown'])],
['Use a CASE statement with each grade letter as a separate option', 'Use OTHERWISE for any unrecognised input']),

ex('sel-14','selection','CASE: Day of Week','medium',
`INPUT a number 1–7. Use CASE to output the day name (1=Monday … 7=Sunday). For any other number, OUTPUT \`Invalid\`.`,
[t(['1'],['Monday']), t(['5'],['Friday']), t(['7'],['Sunday']), t(['8'],['Invalid'])],
['Use a CASE statement with integer values 1 to 7', 'Use OTHERWISE for any number outside that range']),

ex('sel-15','selection','CASE: Menu Choice','medium',
`INPUT a menu choice (1, 2, or 3). OUTPUT \`New game\`, \`Load game\`, or \`Quit\` respectively. For anything else OUTPUT \`Invalid choice\`.`,
[t(['1'],['New game']), t(['2'],['Load game']), t(['3'],['Quit']), t(['4'],['Invalid choice'])],
['Use a CASE statement with three options and an OTHERWISE clause']),

ex('sel-16','selection','CASE: Traffic Light','easy',
`INPUT a traffic light colour (\`Red\`, \`Amber\`, or \`Green\`). Output the instruction: \`Stop\`, \`Get ready\`, or \`Go\`. Otherwise OUTPUT \`Unknown signal\`.`,
[t(['Red'],['Stop']), t(['Green'],['Go']), t(['Amber'],['Get ready']), t(['Blue'],['Unknown signal'])],
['Use a CASE statement with the colour string as the selector']),

ex('sel-17','selection','CASE: Season','easy',
`INPUT a month number (1–12). OUTPUT the season: months 3–5 → \`Spring\`, 6–8 → \`Summer\`, 9–11 → \`Autumn\`, 12, 1, 2 → \`Winter\`.`,
[t(['4'],['Spring']), t(['7'],['Summer']), t(['10'],['Autumn']), t(['1'],['Winter'])],
['Use a CASE statement — you can list multiple values for one option separated by commas']),

ex('sel-18','selection','Maximum of Three','hard',
`INPUT three integers \`Num1\`, \`Num2\`, \`Num3\`. OUTPUT the largest.`,
[t(['3','7','5'],['7']), t(['9','2','4'],['9']), t(['1','1','1'],['1'])],
['Find the larger of Num1 and Num2 first using IF, then compare that result with Num3']),

ex('sel-19','selection','Adult with ID','medium',
`INPUT an integer \`Age\` and a string \`HasID\` (\`Yes\` or \`No\`). OUTPUT \`Entry allowed\` if age >= 18 AND HasID = "Yes", otherwise OUTPUT \`Entry refused\`.`,
[t(['20','Yes'],['Entry allowed']), t(['16','Yes'],['Entry refused']), t(['20','No'],['Entry refused'])],
['Use AND to combine both conditions in a single IF statement']),

ex('sel-20','selection','Number Range Check','medium',
`INPUT an integer \`Number\`. OUTPUT \`In range\` if \`1 <= Number\` AND \`Number <= 100\`, otherwise OUTPUT \`Out of range\`.`,
[t(['50'],['In range']), t(['0'],['Out of range']), t(['100'],['In range']), t(['101'],['Out of range'])],
['Combine two comparisons using AND to check both boundaries at once']),

ex('sel-21','selection','Full Grade Report','hard',
`INPUT a mark (0–100). OUTPUT the letter grade (\`A\`, \`B\`, \`C\`, \`D\`, or \`F\`) and then a comment on a second line: \`Distinction\` (A), \`Merit\` (B), \`Pass\` (C/D), or \`Fail\` (F). Boundaries: A>=80, B>=65, C>=50, D>=40, F<40.`,
[t(['85'],['A','Distinction']), t(['70'],['B','Merit']), t(['55'],['C','Pass']), t(['42'],['D','Pass']), t(['30'],['F','Fail'])],
['Use CASE Mark OF with TO ranges to match each grade boundary', 'Under each case, OUTPUT the grade letter on one line and the comment on the next']),

ex('sel-22','selection','FizzBuzz (Single Number)','medium',
`INPUT an integer \`Number\`. If divisible by both 3 and 5, OUTPUT \`FizzBuzz\`. If divisible by 3 only, OUTPUT \`Fizz\`. If divisible by 5 only, OUTPUT \`Buzz\`. Otherwise OUTPUT the number itself.`,
[t(['15'],['FizzBuzz']), t(['9'],['Fizz']), t(['10'],['Buzz']), t(['7'],['7'])],
['Check divisibility by both 3 and 5 first (the AND condition), before checking each individually', 'Use MOD to test divisibility']),

ex('sel-23','selection','Simple Calculator','hard',
`INPUT two integers \`Num1\` and \`Num2\`, then INPUT an operator string (\`+\`, \`-\`, \`*\`, or \`/\`). OUTPUT the result. If operator is unknown, OUTPUT \`Error\`.`,
[t(['10','3','+'],['13']), t(['10','3','-'],['7']), t(['4','5','*'],['20']), t(['10','4','/'],['2.5']), t(['5','2','%'],['Error'])],
['Use a CASE statement on the operator string', 'Add an OTHERWISE branch to output "Error" for unrecognised operators']),

ex('sel-24','selection','Discount Calculator','medium',
`INPUT a purchase amount (REAL). If amount >= 100, apply 10% discount; if >= 50, apply 5%; otherwise no discount. OUTPUT the discounted amount with a \`$\` symbol and to 2 decimal places, e.g. \`$108.00\`.`,
[t(['120'],['$108.00']), t(['60'],['$57.00']), t(['30'],['$30.00'])],
['Check the highest threshold first (>= 100), then >= 50, with ELSE for no discount', 'Multiply by 0.9 for 10% off, 0.95 for 5% off', 'Use & to join the "$" symbol with the result of TO_STRING(ROUND(Amount, 2))']),

ex('sel-25','selection','Nested CASE','hard',
`INPUT a category (\`A\` or \`B\`) and a level number (1 or 2). OUTPUT: A1→\`Beginner Alpha\`, A2→\`Advanced Alpha\`, B1→\`Beginner Beta\`, B2→\`Advanced Beta\`. Otherwise OUTPUT \`Unknown\`.`,
[t(['A','1'],['Beginner Alpha']), t(['A','2'],['Advanced Alpha']), t(['B','1'],['Beginner Beta']), t(['B','2'],['Advanced Beta']), t(['C','1'],['Unknown'])],
['Use IF to check the category first, then a nested IF or CASE inside to check the level number']),

// ─────────────────────────────────────────────────────────────────────────────
// ITERATION  (25)
// ─────────────────────────────────────────────────────────────────────────────

ex('itr-01','iteration','Count to Five (FOR)','easy',
`Use a FOR loop to OUTPUT the numbers 1 to 5, one per line.`,
[t([],['1','2','3','4','5'])],
['Use a FOR loop from 1 TO 5, outputting the loop variable on each iteration']),

ex('itr-02','iteration','Even Numbers (FOR)','easy',
`Use a FOR loop to OUTPUT the first five even numbers (2, 4, 6, 8, 10), one per line.`,
[t([],['2','4','6','8','10'])],
['Output I * 2 on each iteration, or use STEP 2 to count by twos directly']),

ex('itr-03','iteration','Repeated Message (FOR)','easy',
`Use a FOR loop to concatenate the word \`Hello\` exactly 3 times into a string variable named \`Repeats\`. Output the concatenated string's value.`,
[t([],['HelloHelloHello'])],
['Inside a FOR loop, concatenate (join) the word Hello to the end of the string stored in Repeats. After the loop, output the value in Repeats']),

ex('itr-04','iteration','Countdown (FOR STEP)','medium',
`Use a FOR loop with a STEP of -1 to OUTPUT the numbers 5 down to 1, one per line.`,
[t([],['5','4','3','2','1'])],
['Use a FOR loop with a negative STEP value to count downwards']),

ex('itr-05','iteration','Sum 1 to 10 (FOR)','medium',
`Use a FOR loop and an accumulator variable called \`Total\` to calculate the sum of integers 1 to 10. OUTPUT \`Total\`.`,
[t([],['55'])],
['Initialise Total to 0 before the loop', 'Add the loop variable to Total on each iteration']),

ex('itr-06','iteration','Count to N (FOR)','medium',
`INPUT an integer \`Limit\`. Use a FOR loop to OUTPUT the numbers 1 to Limit, one per line.`,
[t(['3'],['1','2','3']), t(['5'],['1','2','3','4','5'])],
['Use Limit as the upper bound of your FOR loop']),

ex('itr-07','iteration','Odd Numbers (FOR STEP)','medium',
`Use a FOR loop with STEP 2 to OUTPUT the odd numbers from 1 to 9, one per line.`,
[t([],['1','3','5','7','9'])],
['Use a FOR loop starting at 1 with a STEP of 2']),

ex('itr-08','iteration','Times Table (FOR)','medium',
`INPUT an integer \`TableNum\` (1–12). Use a FOR loop to OUTPUT the full times table: each line formatted as, e.g., \`3 x 1 = 3\`.`,
[t(['3'],['3 x 1 = 3','3 x 2 = 6','3 x 3 = 9','3 x 4 = 12','3 x 5 = 15','3 x 6 = 18','3 x 7 = 21','3 x 8 = 24','3 x 9 = 27','3 x 10 = 30','3 x 11 = 33','3 x 12 = 36'])],
['Use OUTPUT with comma-separated values to print TableNum, " x ", I, " = ", and the product on one line', 'The loop runs from 1 TO 12']),

ex('itr-09','iteration','WHILE: Halve Until Small','medium',
`Declare \`Number ← 64\`. Use a WHILE loop: while \`Number > 1\`, halve \`Number\` and OUTPUT it each time.`,
[t([],['32','16','8','4','2','1'])],
['Use a WHILE loop with the condition Number > 1', 'Halve Number on each iteration using DIV or regular division']),

ex('itr-10','iteration','WHILE: Read Until Zero','medium',
`INPUT integers one at a time until the user enters 0. OUTPUT each non-zero number. (Do NOT output the 0.)`,
[t(['5','3','7','0'],['5','3','7']), t(['0'],[])],
['Read the first value before the loop starts', 'Inside the loop, output the value then read the next one']),

ex('itr-11','iteration','WHILE: Sum Until Sentinel','medium',
`INPUT integers. Stop when the user enters \`-1\` (sentinel). Accumulate the sum in a variable called \`Total\`. OUTPUT \`Total\`.`,
[t(['5','3','2','-1'],['10']), t(['10','-1'],['10']), t(['-1'],['0'])],
['Read the first value before the loop', 'Only add to Total when the value is not the sentinel -1']),

ex('itr-12','iteration','WHILE: Countdown','easy',
`INPUT a positive integer \`Number\`. Use a WHILE loop to OUTPUT Number, Number-1, … 1, then OUTPUT \`Blastoff!\`.`,
[t(['3'],['3','2','1','Blastoff!']), t(['1'],['1','Blastoff!'])],
['Use a WHILE loop that continues while Number > 0', 'Decrease Number by 1 on each iteration', 'Output "Blastoff!" after the loop ends']),

ex('itr-13','iteration','WHILE: Digit Count','hard',
`INPUT a positive integer \`Number\`. Use a variable called \`Count\` to count how many digits it has (using repeated integer division by 10). OUTPUT \`Count\`.`,
[t(['9'],['1']), t(['42'],['2']), t(['100'],['3']), t(['9999'],['4'])],
['Divide Number by 10 repeatedly using DIV, incrementing Count each time', 'Stop when Number reaches 0']),

ex('itr-14','iteration','REPEAT: Count to Five','easy',
`Use a REPEAT...UNTIL loop to OUTPUT the numbers 1 to 5, one per line.`,
[t([],['1','2','3','4','5'])],
['Use a counter variable starting at 1', 'The UNTIL condition should stop the loop after outputting 5']),

ex('itr-15','iteration','REPEAT: Input Validation','medium',
`INPUT a number. If it is not between 1 and 10 (inclusive), ask again. Keep asking until a valid number is entered. OUTPUT the valid number.`,
[t(['15','5'],['5']), t(['7'],['7']), t(['0','3'],['3'])],
['Use REPEAT to keep asking until the input is within the valid range', 'The UNTIL condition checks both boundaries using AND']),

ex('itr-16','iteration','REPEAT: Accumulate Over 100','medium',
`Start with \`Total ← 0\`. Use a REPEAT loop: INPUT a positive integer and add it to \`Total\`. Stop when \`Total > 100\`. OUTPUT \`Total\`.`,
[t(['30','40','50'],['120']), t(['200'],['200'])],
['Use REPEAT to keep adding inputs to Total', 'The UNTIL condition checks whether Total has exceeded 100']),

ex('itr-17','iteration','REPEAT: Menu Until Quit','medium',
`INPUT a command string. If it is not \`"quit"\`, OUTPUT \`Command: \` followed by the command, then INPUT again. Stop when \`"quit"\` is entered. Do not output anything for \`"quit"\`.`,
[t(['run','debug','quit'],['Command: run','Command: debug']), t(['quit'],[])],
['Use REPEAT to read commands repeatedly', 'Only output the command if it is not "quit"', 'The UNTIL condition stops the loop when "quit" is entered']),

ex('itr-18','iteration','Nested FOR: Multiplication Table Block','hard',
`Use two nested FOR loops to OUTPUT the products 1×1, 1×2, 1×3, then 2×1, 2×2, 2×3, then 3×1, 3×2, 3×3 — one value per line.`,
[t([],['1','2','3','2','4','6','3','6','9'])],
['Use two nested FOR loops — one for rows (1 to 3) and one for columns (1 to 3)', 'Output the product of the row and column loop variables on each inner iteration']),

ex('itr-19','iteration','FOR + IF: Count Evens','medium',
`Use a FOR loop from 1 to 20. Count how many numbers are even in a variable called \`Count\`, and OUTPUT \`Count\`.`,
[t([],['10'])],
['Use MOD to check if each number is divisible by 2', 'Increment Count inside an IF statement when the remainder is 0']),

ex('itr-20','iteration','FOR + IF: Sum Multiples of 3','medium',
`Use a FOR loop from 1 to 30. Accumulate all multiples of 3 in a variable called \`Total\`, and OUTPUT \`Total\`.`,
[t([],['165'])],
['Use MOD to check if each number is divisible by 3', 'Add the number to Total when the condition is true']),

ex('itr-21','iteration','WHILE + IF: Sum Positives','medium',
`INPUT integers until 0 is entered (sentinel). Accumulate the sum of positive numbers in a variable called \`Total\`. OUTPUT \`Total\`.`,
[t(['3','5','-2','4','0'],['12']), t(['-1','-3','0'],['0'])],
['Use a WHILE loop with a sentinel value of 0', 'Only add a value to Total if it is greater than 0']),

ex('itr-22','iteration','FOR: Find Largest of N Numbers','hard',
`INPUT an integer \`Count\`, then INPUT \`Count\` integers one at a time. Track the largest in a variable called \`Largest\` and OUTPUT it.`,
[t(['4','3','7','1','5'],['7']), t(['3','10','2','8'],['10'])],
['Initialise Largest to the first value before the loop starts', 'Update Largest whenever a new value is greater than the current Largest']),

ex('itr-23','iteration','FOR: Fibonacci Sequence','hard',
`INPUT an integer \`N\` (N ≥ 2). OUTPUT the first \`N\` terms of the Fibonacci sequence (starting 1, 1, 2, 3, 5, …), one per line.`,
[t(['5'],['1','1','2','3','5']), t(['7'],['1','1','2','3','5','8','13'])],
['Start by outputting the first two terms (both 1)', 'Each new term is the sum of the previous two — use variables to track the previous and current term']),

ex('itr-24','iteration','WHILE: Power of 2','medium',
`OUTPUT all powers of 2 that are less than or equal to 1000, starting from 1. Powers of 2 are numbers you get by repeatedly doubling: 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, …`,
[t([],['1','2','4','8','16','32','64','128','256','512'])],
['Use a WHILE loop that continues while the current power is within the limit', 'Multiply by 2 on each iteration']),

ex('itr-25','iteration','REPEAT: Guessing Game','hard',
`Set a secret number \`Secret ← 42\`. INPUT guesses one at a time. For each wrong guess, OUTPUT \`Too low\` if the guess is less than Secret, or \`Too high\` if greater. When correct, OUTPUT \`Correct!\`. Stop after the correct guess.`,
[t(['10','50','42'],['Too low','Too high','Correct!']), t(['42'],['Correct!'])],
['Use a REPEAT loop that continues until the guess equals the secret number', 'Use an IF statement inside the loop to output "Too low" or "Too high" for wrong guesses']),

// ─────────────────────────────────────────────────────────────────────────────
// LIBRARY ROUTINES & STRING HANDLING  (20)
// ─────────────────────────────────────────────────────────────────────────────

ex('lib-01','library','LENGTH of a String','easy',
`Declare \`Word ← "Hello"\`. OUTPUT the length of the string using \`LENGTH\`.`,
[t([],['5'])],
['Pass the string variable as the argument to the LENGTH function']),

ex('lib-02','library','LCASE','easy',
`Declare \`Text ← "HELLO WORLD"\`. OUTPUT the lowercase version using \`LCASE\`.`,
[t([],['hello world'])],
['Pass the string variable to LCASE — it converts all characters to lowercase']),

ex('lib-03','library','UCASE','easy',
`Declare \`Text ← "hello world"\`. OUTPUT the uppercase version using \`UCASE\`.`,
[t([],['HELLO WORLD'])],
['Pass the string variable to UCASE — it converts all characters to uppercase']),

ex('lib-04','library','SUBSTRING: First Three Characters','easy',
`Declare \`Word ← "Cambridge"\`. OUTPUT the first three characters using \`SUBSTRING\`.`,
[t([],['Cam'])],
['SUBSTRING takes three arguments: the string, the start position, and the number of characters to extract', 'Positions are 1-based']),

ex('lib-05','library','SUBSTRING: Middle Extract','medium',
`Declare \`Text ← "Computer"\`. OUTPUT characters 2 to 4 (i.e., positions 2, 3, 4) using \`SUBSTRING\`.`,
[t([],['omp'])],
['Use SUBSTRING starting at position 2, extracting 3 characters']),

ex('lib-06','library','Extract Last Character','easy',
`INPUT a word into a variable called \`Word\`. Use \`LENGTH\` and \`SUBSTRING\` to extract and OUTPUT the last character.`,
[t(['Hello'],['o']), t(['Cambridge'],['e']), t(['Cat'],['t'])],
['Use LENGTH to find how many characters the word contains', 'Use SUBSTRING with the last position and a length of 1 to extract that character']),

ex('lib-07','library','Short or Long','easy',
`INPUT a word into a variable called \`Word\`. If the word has more than 5 characters, OUTPUT \`Long\`; otherwise OUTPUT \`Short\`.`,
[t(['Hello'],['Short']), t(['Cambridge'],['Long']), t(['Code'],['Short'])],
['Use LENGTH to find how many characters the word has', 'Use an IF statement to compare the length to 5']),

ex('lib-08','library','Round to Different Places','easy',
`Declare \`Val ← 3.14159\`. OUTPUT it rounded to 0 decimal places, then 1, then 2 (three separate output lines).`,
[t([],['3','3.1','3.14'])],
['ROUND takes two arguments: the value, and the number of decimal places', 'Call ROUND three times with second arguments 0, 1, and 2']),

ex('lib-09','library','ROUND to 2 Decimal Places','medium',
`Declare \`Val ← 3.567\`. OUTPUT the value rounded to 2 decimal places.`,
[t([],['3.57'])],
['ROUND takes two arguments: the value and the number of decimal places to keep']),

ex('lib-10','library','ROUND to Nearest Integer','easy',
`Declare \`Val ← 3.7\`. OUTPUT the value rounded to the nearest whole number.`,
[t([],['4'])],
['Use 0 as the second argument to ROUND to round to the nearest whole number']),

ex('lib-11','library','MOD Function','easy',
`OUTPUT the remainder when 17 is divided by 5 using the \`MOD()\` **library routine** — write it as a function call: \`MOD(17, 5)\`. Do **not** use the \`MOD\` operator.`,
[t([],['2'])],
['MOD() is a library routine called as a function: MOD(17, 5) gives the remainder when 17 is divided by 5', 'Do not write 17 MOD 5 — that is the operator form, not the library routine'],
'','',requireFunctionForm('MOD')),

ex('lib-12','library','DIV Function','easy',
`OUTPUT the integer quotient of 17 divided by 5 using the \`DIV()\` **library routine** — write it as a function call: \`DIV(17, 5)\`. Do **not** use the \`DIV\` operator.`,
[t([],['3'])],
['DIV() is a library routine called as a function: DIV(17, 5) gives the whole-number quotient when 17 is divided by 5', 'Do not write 17 DIV 5 — that is the operator form, not the library routine'],
'','',requireFunctionForm('DIV')),

ex('lib-13','library','Length of User Input','easy',
`Ask the user to INPUT a string, which will be stored in a variable called \`Text\`. OUTPUT \`There are <n> characters in the text <the user's string input>.\`\n\nFor example, if the user types \`Hello\`, the output should be: \`There are 5 characters in the text Hello.\``,
[t(['Hello'],['There are 5 characters in the text Hello.']), t(['Cambridge'],['There are 9 characters in the text Cambridge.'])],
['Use the LENGTH function to find the number of characters in Text', 'Build the output string using & to join the parts together']),

ex('lib-14','library','Uppercase User Input','easy',
`INPUT a string into a variable called \`Text\`. OUTPUT it in uppercase.`,
[t(['hello'],['HELLO']), t(['World'],['WORLD'])],
['Pass your input variable to UCASE']),

ex('lib-15','library','First Character','medium',
`INPUT a string into a variable called \`Text\`. OUTPUT only the first character.`,
[t(['Alice'],['A']), t(['Bob'],['B'])],
['Use SUBSTRING with start position 1 and length 1 to extract just the first character']),

ex('lib-16','library','Uppercase and Length','easy',
`INPUT a string into a variable called \`Text\`. OUTPUT the string in uppercase on the first line, then OUTPUT its length on a second line.`,
[t(['hello'],['HELLO','5']), t(['Cambridge'],['CAMBRIDGE','9'])],
['Use UCASE to convert the string to uppercase for the first output', 'Use LENGTH to count the number of characters for the second output']),

ex('lib-17','library','Even or Odd with MOD','easy',
`INPUT an integer \`Number\`. Use \`MOD(Number, 2)\` to OUTPUT \`Even\` or \`Odd\`.`,
[t(['6'],['Even']), t(['7'],['Odd'])],
['Use MOD() as a function call: MOD(Number, 2) returns 0 for even numbers', 'Then use IF to choose between outputting Even or Odd'],
'','',requireFunctionForm('MOD')),

ex('lib-18','library','First and Last Match','medium',
`INPUT a word into a variable called \`Word\`. If the first character equals the last character, OUTPUT \`Match\`; otherwise OUTPUT \`No match\`. Use \`SUBSTRING\` to extract both characters.`,
[t(['level'],['Match']), t(['hello'],['No match']), t(['racecar'],['Match'])],
['Use SUBSTRING with position 1 and length 1 to get the first character', 'Use LENGTH to find the last position, then SUBSTRING with length 1 to get the last character', 'Compare the two with =']),

ex('lib-19','library','Chained String Functions','hard',
`INPUT a string into a variable called \`Text\`. OUTPUT the first three characters converted to uppercase.`,
[t(['hello'],['HEL']), t(['cambridge'],['CAM']), t(['Python'],['PYT'])],
['You can nest function calls — pass the result of SUBSTRING directly as the argument to UCASE']),

ex('lib-20','library','Build Initials','hard',
`INPUT a first name into \`FirstName\` and a last name into \`LastName\`. Extract the first character of each, convert both to uppercase, join them together, and OUTPUT the initials.`,
[t(['alice','smith'],['AS']), t(['John','doe'],['JD']), t(['emma','watson'],['EW'])],
['Use SUBSTRING with position 1 and length 1 to extract the first character of each name', 'Pass each result directly to UCASE', 'Join the two uppercase initials using &']),

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTIONS & PROCEDURES  (25)
// ─────────────────────────────────────────────────────────────────────────────

ex('pro-01','procedures','Simple Procedure','easy',
`Write a PROCEDURE called \`Greet\` with no parameters that OUTPUTs \`Hello!\`. Then CALL it once.`,
[t([],['Hello!'])],
['Define the procedure with PROCEDURE Greet() and close it with ENDPROCEDURE', 'Call it with CALL Greet()'],
PROC_SCAFFOLD),

ex('pro-02','procedures','Procedure with Parameter','easy',
`Write a PROCEDURE \`SayHello(Name : STRING)\` that OUTPUTs \`Hello, \` followed by the name. INPUT a name and CALL the procedure.`,
[t(['Alice'],['Hello, Alice']), t(['World'],['Hello, World'])],
['Define the procedure with a STRING parameter', 'Use the parameter inside the procedure body to build the output with &'],
PROC_SCAFFOLD),

ex('pro-03','procedures','Procedure: Print Square','easy',
`Write a PROCEDURE \`PrintSquare(N : INTEGER)\` that OUTPUTs \`N * N\`. Call it with the value 5.`,
[t([],['25'])],
['The procedure receives N as a parameter and computes N * N', 'Call it with 5 as the argument'],
PROC_SCAFFOLD),

ex('pro-04','procedures','Procedure Called Multiple Times','medium',
`Write a PROCEDURE \`PrintLine\` that OUTPUTs ten dashes (\`----------\`). Call it three times.`,
[t([],['----------','----------','----------'])],
['Define the procedure once, then call it three separate times'],
PROC_SCAFFOLD),

ex('pro-05','procedures','Procedure with Two Parameters','medium',
`Write a PROCEDURE \`ShowInfo(Name : STRING, Age : INTEGER)\` that OUTPUTs a sentence like \`Alice is 16 years old\`. INPUT a name and an age, then CALL the procedure.`,
[t(['Alice','16'],['Alice is 16 years old']), t(['Bob','14'],['Bob is 14 years old'])],
['Use OUTPUT with comma-separated values inside the procedure to combine Name, the word "is", Age, and "years old"'],
PROC_SCAFFOLD),

ex('pro-06','procedures','Procedure in a Loop','medium',
`Write a PROCEDURE \`PrintNumber(N : INTEGER)\` that OUTPUTs the number. Use a FOR loop to call it for numbers 1, 2, and 3.`,
[t([],['1','2','3'])],
['Use a FOR loop and pass the loop variable as the argument when calling the procedure'],
PROC_SCAFFOLD),

ex('pro-07','procedures','Two Procedures in Sequence','medium',
`Write two procedures: \`Header\` (OUTPUTs \`=== Report ===\`) and \`Footer\` (OUTPUTs \`=== End ===\`). Call both in order.`,
[t([],['=== Report ===','=== End ==='])],
['Define both procedures separately, then call them in the correct order'],
PROC_SCAFFOLD),

ex('pro-08','procedures','Procedure: Classify Number','hard',
`Write a PROCEDURE \`Classify(N : INTEGER)\` that OUTPUTs \`Positive\`, \`Negative\`, or \`Zero\`. INPUT a number and CALL it.`,
[t(['7'],['Positive']), t(['-3'],['Negative']), t(['0'],['Zero'])],
['Use nested IF statements inside the procedure to classify the number'],
PROC_SCAFFOLD),

ex('fun-01','procedures','Function: Add Two Numbers','easy',
`Write a FUNCTION \`Add(Num1 : INTEGER, Num2 : INTEGER) RETURNS INTEGER\` that returns Num1 + Num2. OUTPUT the result of calling \`Add(3, 4)\`.`,
[t([],['7'])],
['Define the function with FUNCTION ... RETURNS INTEGER and close with ENDFUNCTION', 'Use RETURN inside the function body to send back the result'],
PROC_SCAFFOLD),

ex('fun-02','procedures','Function: Square','easy',
`Write a FUNCTION \`Square(N : INTEGER) RETURNS INTEGER\` that returns N². OUTPUT \`Square(7)\`.`,
[t([],['49'])],
['The function body has a single RETURN statement that multiplies N by itself'],
PROC_SCAFFOLD),

ex('fun-03','procedures','Function: Max of Two','medium',
`Write a FUNCTION \`MaxOf(Num1 : INTEGER, Num2 : INTEGER) RETURNS INTEGER\` that returns the larger value. INPUT two integers, OUTPUT the max.`,
[t(['8','3'],['8']), t(['2','9'],['9']), t(['5','5'],['5'])],
['Use IF inside the function to compare Num1 and Num2, returning the larger value in each branch'],
PROC_SCAFFOLD),

ex('fun-04','procedures','Function: IsEven','medium',
`Write a FUNCTION \`IsEven(N : INTEGER) RETURNS BOOLEAN\` that returns TRUE if N is even, FALSE otherwise. INPUT N, OUTPUT the result.`,
[t(['4'],['TRUE']), t(['7'],['FALSE'])],
['Use MOD inside the function — if the remainder after dividing by 2 equals 0, return TRUE'],
PROC_SCAFFOLD),

ex('fun-05','procedures','Function: Factorial','hard',
`Write a FUNCTION \`Factorial(N : INTEGER) RETURNS INTEGER\` that returns N! using a loop. OUTPUT \`Factorial(5)\`. The factorial of a number is the product of all integers from 1 up to that number — for example, 5! = 1 × 2 × 3 × 4 × 5 = 120.`,
[t([],['120'])],
['Initialise an accumulator to 1 inside the function', 'Use a FOR loop from 2 to N, multiplying the accumulator on each step', 'Return the accumulated result'],
PROC_SCAFFOLD),

ex('fun-06','procedures','Function: Area of Rectangle','easy',
`Write a FUNCTION \`Area(SideLength : INTEGER, Width : INTEGER) RETURNS INTEGER\` that returns SideLength × Width. INPUT two integers, OUTPUT the area.`,
[t(['4','5'],['20']), t(['6','3'],['18'])],
['The function body is a single RETURN statement that multiplies SideLength by Width'],
PROC_SCAFFOLD),

ex('fun-07','procedures','Function: Greeting String','medium',
`Write a FUNCTION \`MakeGreeting()\` that takes one STRING parameter, \`Name\`, and returns \`"Hello, <Name>!"\` — \`<Name>\` should be replaced with the argument passed to the function, using concatenation. INPUT a name, OUTPUT the greeting.`,
[t(['Alice'],['Hello, Alice!']), t(['World'],['Hello, World!'])],
['The RETURN statement joins the string parts using &'],
PROC_SCAFFOLD),

ex('fun-08','procedures','Function: Absolute Value','medium',
`Write a FUNCTION \`AbsVal(N : INTEGER) RETURNS INTEGER\` that returns the absolute value of N. INPUT a number, OUTPUT its absolute value.`,
[t(['-5'],['5']), t(['3'],['3']), t(['0'],['0'])],
['Use IF inside the function — if N is negative, return its negation; otherwise return N as-is'],
PROC_SCAFFOLD),

ex('fun-09','procedures','Function: Celsius to Fahrenheit','medium',
`Write a FUNCTION \`ToFahrenheit(Celsius : REAL) RETURNS REAL\` that converts Celsius to Fahrenheit using the formula \`(Celsius * 9 / 5) + 32\`. INPUT degrees Cel, OUTPUT degrees fahrenheit.`,
[t(['100'],['212']), t(['0'],['32']), t(['37'],['98.6'])],
['Use the formula (Celsius * 9 / 5) + 32 in the RETURN statement'],
PROC_SCAFFOLD),

ex('fun-10','procedures','Function: Min of Three','hard',
`Write a FUNCTION \`MinOf3(Num1 : INTEGER, Num2 : INTEGER, Num3 : INTEGER) RETURNS INTEGER\` that returns the smallest. INPUT three numbers, OUTPUT the minimum.`,
[t(['3','7','5'],['3']), t(['9','2','4'],['2']), t(['1','1','1'],['1'])],
['Find the smaller of Num1 and Num2 first, then compare that result with Num3'],
PROC_SCAFFOLD),

ex('fun-11','procedures','Function in Expression','medium',
`Write a FUNCTION \`Double(N : INTEGER) RETURNS INTEGER\` that returns N * 2. Use it in an expression: OUTPUT \`Double(5) + Double(3)\`.`,
[t([],['16'])],
['Call Double() twice inside one OUTPUT statement and add the results together'],
PROC_SCAFFOLD),

ex('fun-12','procedures','Function: Initial Letter','medium',
`Write a FUNCTION \`Initial(Name : STRING) RETURNS STRING\` that returns the first character of the name in uppercase. INPUT a name, OUTPUT its initial.`,
[t(['alice'],['A']), t(['Bob'],['B'])],
['Nest the SUBSTRING call inside UCASE — pass SUBSTRING(Name, 1, 1) as the argument to UCASE'],
PROC_SCAFFOLD),

ex('fun-13','procedures','Procedure Calls a Function','hard',
`Write a FUNCTION \`Square(N : INTEGER) RETURNS INTEGER\` returning N². Write a PROCEDURE \`PrintSquared(N : INTEGER)\` that OUTPUTs \`N squared = \` followed by the square. INPUT a number and call the procedure.`,
[t(['4'],['4 squared = 16']), t(['7'],['7 squared = 49'])],
['Inside the procedure, use OUTPUT with comma-separated values: N, " squared = ", and the result of calling Square(N)'],
PROC_SCAFFOLD),

ex('fun-14','procedures','Function: IsDivisible','medium',
`Write a FUNCTION \`IsDivisible(N : INTEGER, Divisor : INTEGER) RETURNS BOOLEAN\` that returns TRUE if N is exactly divisible by Divisor. Test it: INPUT N and Divisor, OUTPUT TRUE or FALSE.`,
[t(['12','4'],['TRUE']), t(['10','3'],['FALSE']), t(['15','5'],['TRUE'])],
['Use MOD inside the function — if the remainder is 0, return TRUE'],
PROC_SCAFFOLD),

ex('fun-15','procedures','Function: Sum 1 to N','hard',
`Write a FUNCTION \`SumToN(N : INTEGER) RETURNS INTEGER\` that returns the sum of 1 + 2 + … + N using a loop. INPUT N, OUTPUT the sum.`,
[t(['10'],['55']), t(['5'],['15']), t(['1'],['1'])],
['Use an accumulator initialised to 0 and a FOR loop inside the function', 'Return the accumulated total'],
PROC_SCAFFOLD),

ex('fun-16','procedures','Function: String Reverse Check','hard',
`Write a FUNCTION \`IsPalindrome(Word : STRING) RETURNS BOOLEAN\` that checks if a word reads the same forwards and backwards (build reversed string using SUBSTRING in a FOR loop). INPUT a word, OUTPUT TRUE or FALSE.`,
[t(['racecar'],['TRUE']), t(['hello'],['FALSE']), t(['level'],['TRUE'])],
['Build a reversed string by looping from the last character position down to 1, extracting one character at a time with SUBSTRING', 'Compare the reversed string to the original using ='],
PROC_SCAFFOLD),

ex('fun-17','procedures','Procedure: Star Row','medium',
`Write a PROCEDURE \`StarRow(N : INTEGER)\` that OUTPUTs a row of N asterisks on one line by building a string in a loop. INPUT N, call the procedure.`,
[t(['5'],['*****']), t(['3'],['***'])],
['Start with an empty string inside the procedure', 'Concatenate one asterisk per loop iteration, then OUTPUT the completed string'],
PROC_SCAFFOLD),

// ─────────────────────────────────────────────────────────────────────────────
// ARRAYS  (25)
// ─────────────────────────────────────────────────────────────────────────────

ex('arr-01','arrays','Declare and Access Array Element','easy',
`Declare an INTEGER array \`Numbers\` of size 3 (index 1 to 3). Assign \`Numbers[1] ← 10\`, \`Numbers[2] ← 20\`, \`Numbers[3] ← 30\`. OUTPUT the value 20 from the array.`,
[t([],['20'])],
['Use DECLARE with ARRAY[1:3] OF INTEGER', 'Access an element using the array name and its index in square brackets']),

ex('arr-02','arrays','Output All Array Elements','easy',
`Declare \`Scores : ARRAY[1:4] OF INTEGER\`. Assign 5, 10, 15, 20 to indices 1–4. Use a FOR loop to OUTPUT all four values.`,
[t([],['5','10','15','20'])],
['Use a FOR loop from 1 to 4, using the loop variable as the array index']),

ex('arr-03','arrays','Fill Array with FOR Loop','medium',
`Declare \`Nums : ARRAY[1:5] OF INTEGER\`. Use a FOR loop to populate each element with \`i * 3\`. Then OUTPUT all five values.`,
[t([],['3','6','9','12','15'])],
['Use one FOR loop to fill the array and output its contents']),

ex('arr-04','arrays','Sum of Array Elements','medium',
`Declare \`Data : ARRAY[1:5] OF INTEGER\` and assign values 4, 8, 2, 6, 10. Sum all elements in a FOR loop and OUTPUT the total.`,
[t([],['30'])],
['Use a FOR loop to visit each element and add it to an accumulator variable initialised to 0']),

ex('arr-05','arrays','Input Array from User','medium',
`INPUT 4 integers one at a time and store them in an array \`Values : ARRAY[1:4] OF INTEGER\`. Then OUTPUT all four values.`,
[t(['10','20','30','40'],['10','20','30','40'])],
['Use a FOR loop to input each element, using the loop variable as the index']),

ex('arr-06','arrays','Reverse Output of Array','medium',
`Declare \`Nums : ARRAY[1:5] OF INTEGER\` and assign 1–5. Use a FOR loop counting downwards to OUTPUT them in reverse.`,
[t([],['5','4','3','2','1'])],
['Use a FOR loop with a negative STEP to iterate from the last index down to 1']),

ex('arr-07','arrays','Count Values Above Threshold','medium',
`Declare \`Marks : ARRAY[1:6] OF INTEGER\` with values 45, 72, 61, 88, 53, 91. Count how many are 60 or above and OUTPUT the count.`,
[t([],['4'])],
['Use an IF statement inside the FOR loop to check each element against the threshold', 'Increment a counter variable when the condition is true']),

ex('arr-08','arrays','Find Maximum in Array','hard',
`INPUT 5 integers into an array. Find and OUTPUT the largest value.`,
[t(['3','7','1','9','2'],['9']), t(['10','4','6','8','2'],['10'])],
['Initialise a Max variable to the first element before the loop', 'Update Max whenever a larger value is found']),

ex('arr-09','arrays','Find Minimum in Array','hard',
`INPUT 5 integers into an array. Find and OUTPUT the smallest value.`,
[t(['3','7','1','9','2'],['1']), t(['10','4','6','8','2'],['2'])],
['Initialise a Min variable to the first element before the loop', 'Update Min whenever a smaller value is found']),

ex('arr-10','arrays','Array Average','hard',
`INPUT 4 integers into an array. OUTPUT the average as a REAL value rounded to 1 decimal place.`,
[t(['4','8','6','2'],['5.0']), t(['1','2','3','4'],['2.5'])],
['Sum all four elements and divide by 4 to get the average', 'Use ROUND to format the result to 1 decimal place']),

ex('arr-11','arrays','String Array','medium',
`Declare \`Names : ARRAY[1:3] OF STRING\` and assign \`"Alice"\`, \`"Bob"\`, \`"Charlie"\`. Use a FOR loop to OUTPUT a greeting for each: \`Hello, Alice\`, etc.`,
[t([],['Hello, Alice','Hello, Bob','Hello, Charlie'])],
['Use a FOR loop and join the greeting prefix with the array element using &']),

ex('arr-12','arrays','Parallel Arrays','hard',
`Declare two arrays of size 3: \`Students : ARRAY[1:3] OF STRING\` and \`Scores : ARRAY[1:3] OF INTEGER\`. Assign names (Alice, Bob, Charlie) and scores (85, 72, 91). OUTPUT each student with their score: e.g. \`Alice: 85\`.`,
[t([],['Alice: 85','Bob: 72','Charlie: 91'])],
['Use a FOR loop and OUTPUT with comma-separated values: the student name, ": ", and the score']),

ex('arr-13','arrays','Count Occurrences','hard',
`INPUT 6 integers into an array. INPUT a target integer. Count and OUTPUT how many times the target appears in the array.`,
[t(['3','1','4','1','5','1','1'],['3']), t(['5','5','5','5','5','5','9'],['0'])],
['Use a FOR loop and an IF statement to count how many elements equal the target value']),

ex('arr-14','arrays','2D Array: Assign and Access','medium',
`Declare a 2×2 INTEGER array \`Grid\`. Assign: [1,1]=1, [1,2]=2, [2,1]=3, [2,2]=4. OUTPUT \`Grid[2,1]\`.`,
[t([],['3'])],
['Use DECLARE with ARRAY[1:2,1:2] for a 2D array', 'Access a specific element using two indices, e.g. Grid[2,1]']),

ex('arr-15','arrays','2D Array: Output All Elements','hard',
`Declare a 2×3 INTEGER array. Fill it so \`Grid[Row,Col] ← Row * Col\`. Output all 6 values row by row (rows 1 to 2, columns 1 to 3).`,
[t([],['1','2','3','2','4','6'])],
['Use two nested FOR loops — outer for rows (1 to 2), inner for columns (1 to 3)', 'Assign Row * Col to each element, then output it'],
`DECLARE Grid : ARRAY[1:2,1:3] OF INTEGER
DECLARE Row, Col : INTEGER

FOR Row ← 1 TO 2
   FOR Col ← 1 TO 3
      Grid[Row,Col] ← Row * Col
   NEXT Col
NEXT Row

FOR Row ← 1 TO 2
   FOR Col ← 1 TO 3
      OUTPUT Grid[Row,Col]
   NEXT Col
NEXT Row`),

ex('arr-16','arrays','2D Array: Row Sum','hard',
`Declare a 2×4 INTEGER array. Assign row 1 values: 1,2,3,4 and row 2 values: 5,6,7,8. OUTPUT the sum of each row on a separate line.`,
[t([],['10','26'])],
['Use nested FOR loops with an inner accumulator that resets to 0 at the start of each row']),

ex('arr-17','arrays','Input into Array Then Reverse','hard',
`INPUT 4 integers. Store in an array. OUTPUT them in reverse order.`,
[t(['10','20','30','40'],['40','30','20','10']), t(['1','2','3','4'],['4','3','2','1'])],
['Store all four inputs first using a FOR loop', 'Then use a second FOR loop with STEP -1 to output them in reverse']),

ex('arr-18','arrays','Array: Output Only Positive Values','hard',
`INPUT 5 integers into an array. Use a FOR loop to OUTPUT only the positive values (> 0).`,
[t(['3','-2','5','-1','4'],['3','5','4']), t(['-1','-2','3','0','5'],['3','5'])],
['Use an IF statement inside the FOR loop to check if each element is greater than 0 before outputting']),

ex('arr-19','arrays','Array: Sum and Count','hard',
`INPUT 5 integers into an array. OUTPUT the sum and the count of even numbers, on separate lines.`,
[t(['2','5','4','1','6'],['18','3']),t(['1','3','5','7','9'],['25','0'])],
['Use two separate accumulator variables: one for the total sum, one for the count of even numbers']),

ex('arr-20','arrays','Array: Mark Highest Index','hard',
`INPUT 5 integers into an array. Find the index (position) of the largest value. OUTPUT the index (1-based).`,
[t(['3','7','1','9','2'],['4']), t(['10','4','6','8','2'],['1'])],
['Track both the maximum value and its index in separate variables', 'Update both whenever a new maximum is found']),

ex('arr-21','arrays','UCASE Every Element','medium',
`Declare \`Words : ARRAY[1:3] OF STRING\` and assign \`"hello"\`, \`"world"\`, \`"cambridge"\`. Use a FOR loop to OUTPUT each word in uppercase.`,
[t([],['HELLO','WORLD','CAMBRIDGE'])],
['Pass each array element to UCASE inside the OUTPUT statement']),

ex('arr-22','arrays','Array: Longest String','hard',
`Declare \`Names : ARRAY[1:4] OF STRING\` with values \`"Ali"\`, \`"Charlotte"\`, \`"Bob"\`, \`"Sam"\`. Find and OUTPUT the longest name.`,
[t([],['Charlotte'])],
['Track the longest name found so far in a variable', 'Use LENGTH to compare each element and update when a longer name is found']),

ex('arr-23','arrays','2D Array: Diagonal Sum','hard',
`Declare a 3×3 INTEGER array \`Grid\`. Use nested FOR loops (rows 1 to 3, columns 1 to 3) to fill every element so that \`Grid[Row,Col] ← Row + Col\`. Then calculate and OUTPUT the sum of the three main diagonal elements: \`Grid[1,1]\`, \`Grid[2,2]\` and \`Grid[3,3]\`.`,
[t([],['12'])],
['The diagonal elements are Grid[1,1]=2, Grid[2,2]=4, Grid[3,3]=6, giving a sum of 12']),

ex('arr-24','arrays','Array: Count Elements in Range','hard',
`INPUT 6 integers into an array. INPUT a lower bound \`Lo\` and upper bound \`Hi\`. Count and OUTPUT how many elements are in the range Lo to Hi (inclusive).`,
[t(['5','2','8','3','9','1','3','7'],['2']),t(['1','2','3','4','5','6','1','6'],['6'])],
['Use AND to check both the lower and upper bounds in a single IF condition']),

ex('arr-25','arrays','Array: Running Total','hard',
`INPUT 5 integers. Store them in an array. For each position, OUTPUT the running total (cumulative sum) up to that index.`,
[t(['1','2','3','4','5'],['1','3','6','10','15']), t(['10','5','3','2','0'],['10','15','18','20','20'])],
['Maintain a running total variable that increases with each element', 'Output the running total immediately after each addition']),

// ─────────────────────────────────────────────────────────────────────────────
// FILE HANDLING  (15)
// ─────────────────────────────────────────────────────────────────────────────

ex('fil-01','files','Write then Read a File','easy',
`Use \`OPENFILE "data.txt" FOR WRITE\` to open the file. Use \`WRITEFILE\` to write the line \`"Hello, World!"\`. Use \`CLOSEFILE\` to close it. Re-open the file using \`OPENFILE "data.txt" FOR READ\`. Use \`READFILE\` to read the line into a variable, then \`CLOSEFILE\` it and OUTPUT the variable.`,
[t([],['Hello, World!'])],
['You must OPENFILE before reading or writing, and CLOSEFILE when done', 'OPENFILE "data.txt" FOR WRITE, then WRITEFILE, then CLOSEFILE', 'OPENFILE "data.txt" FOR READ, then READFILE into a variable, then CLOSEFILE, then OUTPUT']),

ex('fil-02','files','Write Multiple Lines','medium',
`Use \`OPENFILE "test.txt" FOR WRITE\` to open the file. Use \`WRITEFILE\` to write three lines: \`"Line 1"\`, \`"Line 2"\`, \`"Line 3"\`. Use \`CLOSEFILE\` to close it. Re-open using \`OPENFILE "test.txt" FOR READ\`. Use \`READFILE\` to read each line and OUTPUT them. Use \`CLOSEFILE\` when done.`,
[t([],['Line 1','Line 2','Line 3'])],
['You must OPENFILE before reading or writing, and CLOSEFILE when done', 'Write all three lines in FOR WRITE mode, then CLOSEFILE', 'Re-open FOR READ, use READFILE to read each line, CLOSEFILE when finished']),

ex('fil-03','files','Uppercase Lines from File','medium',
`Use \`OPENFILE "colours.txt" FOR WRITE\` to open the file. Use \`WRITEFILE\` to write three words — \`"red"\`, \`"green"\`, \`"blue"\` — one per line. Use \`CLOSEFILE\` to close it. Re-open using \`OPENFILE "colours.txt" FOR READ\`. Use a \`WHILE NOT EOF\` loop to READFILE each word and OUTPUT it in uppercase. Use \`CLOSEFILE\` when done.`,
[t([],['RED','GREEN','BLUE'])],
['You must OPENFILE before reading or writing, and CLOSEFILE when done', 'Use UCASE() on each string read from the file before outputting it', 'The WHILE loop condition should be: WHILE NOT EOF("colours.txt") DO']),

ex('fil-04','files','Count Lines with EOF','medium',
`Use \`OPENFILE "five.txt" FOR WRITE\` to open the file. Use \`WRITEFILE\` to write five lines: \`"A"\`, \`"B"\`, \`"C"\`, \`"D"\`, \`"E"\`. Use \`CLOSEFILE\` to close it. Re-open using \`OPENFILE "five.txt" FOR READ\`. Use a \`WHILE NOT EOF\` loop to count the lines. Use \`CLOSEFILE\` when done, then OUTPUT the count.`,
[t([],['5'])],
['You must OPENFILE before reading or writing, and CLOSEFILE when done', 'Use a WHILE NOT EOF("five.txt") DO loop, incrementing a counter and using READFILE on each iteration', 'OUTPUT the count after CLOSEFILE']),

ex('fil-05','files','Read Until EOF and Output','medium',
`Use \`OPENFILE "fruit.txt" FOR WRITE\` to open the file. Use \`WRITEFILE\` to write three lines: \`"Apple"\`, \`"Banana"\`, \`"Cherry"\`. Use \`CLOSEFILE\` to close it. Re-open using \`OPENFILE "fruit.txt" FOR READ\`. Use a \`WHILE NOT EOF\` loop to READFILE and OUTPUT each line. Use \`CLOSEFILE\` when done.`,
[t([],['Apple','Banana','Cherry'])],
['You must OPENFILE before reading or writing, and CLOSEFILE when done', 'Use a WHILE NOT EOF("fruit.txt") DO loop, reading one line per iteration with READFILE and outputting it immediately']),

ex('fil-06','files','Append to File','hard',
`Use \`OPENFILE "greet.txt" FOR WRITE\` to open the file. Use \`WRITEFILE\` to write \`"Hello"\`. Use \`CLOSEFILE\` to close it. Re-open using \`OPENFILE "greet.txt" FOR APPEND\` and use \`WRITEFILE\` to write \`"World"\`. Use \`CLOSEFILE\` to close it. Re-open using \`OPENFILE "greet.txt" FOR READ\` and OUTPUT both lines. Use \`CLOSEFILE\` when done.`,
[t([],['Hello','World'])],
['You must OPENFILE before reading or writing, and CLOSEFILE when done', 'Write the first line in FOR WRITE mode, then CLOSEFILE', 'Re-open FOR APPEND to add the second line, then CLOSEFILE', 'Re-open FOR READ to OUTPUT both lines, then CLOSEFILE']),

ex('fil-07','files','Write INPUT Data to File','hard',
`INPUT 3 strings from the user. Use \`OPENFILE "names.txt" FOR WRITE\` to open the file and use \`WRITEFILE\` to write each string. Use \`CLOSEFILE\` to close it. Re-open using \`OPENFILE "names.txt" FOR READ\`. Use \`READFILE\` to read and OUTPUT each line. Use \`CLOSEFILE\` when done.`,
[t(['Alice','Bob','Charlie'],['Alice','Bob','Charlie'])],
['You must OPENFILE before reading or writing, and CLOSEFILE when done', 'Use a FOR loop to INPUT and WRITEFILE each string', 'CLOSEFILE, then re-open FOR READ and use READFILE to OUTPUT each line, then CLOSEFILE again']),

ex('fil-08','files','Read Specific Lines from File','hard',
`Use \`OPENFILE "scores.txt" FOR WRITE\` to open the file. Use \`WRITEFILE\` to write the values 10, 20, 30, 40 one per line. Use \`CLOSEFILE\` to close it. Re-open using \`OPENFILE "scores.txt" FOR READ\`. Use a \`WHILE NOT EOF\` loop to READFILE each line. OUTPUT only the 1st and 3rd values read. Use \`CLOSEFILE\` when done.`,
[t([],['10','30'])],
['Use a counter variable to track which line you are on', 'Use an IF statement inside the loop to OUTPUT only when the counter equals 1 or 3']),

ex('fil-09','files','File: Largest Value','hard',
`Use \`OPENFILE "vals.txt" FOR WRITE\` to open the file. Use \`WRITEFILE\` to write five values: 7, 3, 9, 1, 5 one per line. Use \`CLOSEFILE\` to close it. Re-open using \`OPENFILE "vals.txt" FOR READ\`. Use a \`WHILE NOT EOF\` loop to READFILE each value and track the largest. Use \`CLOSEFILE\` when done, then OUTPUT the largest value.`,
[t([],['9'])],
['You must OPENFILE before reading or writing, and CLOSEFILE when done', 'Initialise a Max variable to the first value before the loop', 'Update Max with READFILE whenever a larger value is found, OUTPUT after CLOSEFILE']),

ex('fil-10','files','File: Count Even Numbers','hard',
`Use \`OPENFILE "nums.txt" FOR WRITE\` to open the file. Use \`WRITEFILE\` to write the numbers 1 to 8, one per line. Use \`CLOSEFILE\` to close it. Re-open using \`OPENFILE "nums.txt" FOR READ\`. Use a \`WHILE NOT EOF\` loop to READFILE each number and count how many are even. Use \`CLOSEFILE\` when done, then OUTPUT the count.`,
[t([],['4'])],
['You must OPENFILE before reading or writing, and CLOSEFILE when done', 'Use MOD to test whether each value read with READFILE is divisible by 2', 'OUTPUT the count after CLOSEFILE']),

ex('fil-11','files','File: Write and Read Formatted Data','hard',
`INPUT a name and a score (integer) from the user. Use \`OPENFILE "record.txt" FOR WRITE\` to open the file. Use \`WRITEFILE\` to write the name and then the score on separate lines. Use \`CLOSEFILE\` to close it. Re-open using \`OPENFILE "record.txt" FOR READ\`. Use two \`READFILE\` calls to read them back. Use \`CLOSEFILE\` when done, then OUTPUT in the format: \`Name: Alice, Score: 95\` on separate lines.`,
[t(['Alice','95'],['Name: Alice','Score: 95'])],
['You must OPENFILE before reading or writing, and CLOSEFILE when done', 'Use two separate WRITEFILE calls — one for the name, one for the score', 'Use two READFILE calls to read them back, then OUTPUT after CLOSEFILE']),

ex('fil-12','files','File: Two Files','hard',
`Write the string \`"Hello"\` to a file called \`file1.txt\` and the string \`"World"\` to a file called \`file2.txt\`. Read the contents back from both files and OUTPUT the two values joined by a space.`,
[t([],['Hello World'])],
['You must OPENFILE before reading or writing, and CLOSEFILE when done — for both files', 'Read from each file separately into two STRING variables using READFILE', 'OUTPUT after both files are closed, joining the two values with & " " &']),

ex('fil-13','files','File: Reverse Lines','hard',
`Use \`OPENFILE "letters.txt" FOR WRITE\` to open the file. Use \`WRITEFILE\` to write 4 lines: \`"A"\`, \`"B"\`, \`"C"\`, \`"D"\`. Use \`CLOSEFILE\` to close it. Re-open using \`OPENFILE "letters.txt" FOR READ\`. Use READFILE to read all lines into an array. Use \`CLOSEFILE\` when done, then OUTPUT the lines in reverse order.`,
[t([],['D','C','B','A'])],
['You must OPENFILE before reading or writing, and CLOSEFILE when done', 'Read all lines into an array using READFILE inside a loop', 'OUTPUT after CLOSEFILE using a FOR loop with STEP -1 to reverse the order']),

ex('fil-14','files','File: Average from File','hard',
`Write the values 10, 20, 30, 40, 50 to a file called \`"data.txt"\` using a FOR loop, one value per line. Read them back from the file and OUTPUT their average.`,
[t([],['30'])],
['Use a FOR loop with a suitable step to generate and write the 5 values — think about what sequence produces an average of 30', 'Use a WHILE NOT EOF loop to read the values back and accumulate a total', 'Divide the total by 5 after closing the file'],
'', '',
src => /\bFOR\b/i.test(src) && /\bSTEP\b/i.test(src) ? null : 'You must use a FOR loop with a STEP value to write the data to the file'),

ex('fil-15','files','File: Count Words Longer Than 4 Characters','hard',
`Use \`OPENFILE "words.txt" FOR WRITE\` to open the file. Use \`WRITEFILE\` to write five words: \`"Cat"\`, \`"Elephant"\`, \`"Dog"\`, \`"Computer"\`, \`"Bee"\` one per line. Use \`CLOSEFILE\` to close it. Re-open using \`OPENFILE "words.txt" FOR READ\`. Use a \`WHILE NOT EOF\` loop to READFILE each word and count how many have length greater than 4. Use \`CLOSEFILE\` when done, then OUTPUT the count.`,
[t([],['2'])],
['You must OPENFILE before reading or writing, and CLOSEFILE when done', 'Use LENGTH() on each word read with READFILE to check its length', 'Increment a counter when LENGTH > 4, then OUTPUT after CLOSEFILE'],
'', '',
src => {
  const required = ['Cat','Elephant','Dog','Computer','Bee'];
  const missing = required.filter(w => !src.includes(`"${w}"`));
  return missing.length ? `The following required words are missing or misspelled: ${missing.map(w => `"${w}"`).join(', ')}` : null;
}),

// ─────────────────────────────────────────────────────────────────────────────
// STANDARD ALGORITHMS  (16)
// ─────────────────────────────────────────────────────────────────────────────

ex('alg-01','algorithms','Linear Search: Found/Not Found','medium',
`Declare an array called \`Data\` of 6 integers: 3, 7, 1, 9, 4, 6. INPUT a target integer into \`Target\`. Use a linear search to OUTPUT \`Found\` or \`Not found\`.`,
[t(['9'],['Found']), t(['5'],['Not found']), t(['3'],['Found'])],
['Use a FOR loop to check each element of Data against Target', 'Use a boolean flag variable to track whether the value was found']),

ex('alg-02','algorithms','Linear Search: Return Position','hard',
`Declare an array called \`Data\` of 6 integers: 10, 25, 7, 42, 19, 33. INPUT a target into \`Target\`. Track the result in a variable called \`Position\`. OUTPUT \`Position\` (1-based index if found, or \`-1\` if not).`,
[t(['42'],['4']), t(['7'],['3']), t(['99'],['-1'])],
['Initialise Position to -1 before the loop', 'Update Position to the current index when Target is found']),

ex('alg-03','algorithms','Find Highest Value','medium',
`INPUT 5 integers. Store the highest value in a variable called \`Max\` and OUTPUT it.`,
[t(['3','7','1','9','2'],['9']), t(['5','5','5','5','5'],['5'])],
['Initialise Max to the first input before the loop', 'Update Max each time a larger value is found']),

ex('alg-04','algorithms','Find Lowest Value','medium',
`INPUT 5 integers. Store the lowest value in a variable called \`Min\` and OUTPUT it.`,
[t(['3','7','1','9','2'],['1']), t(['5','2','8','4','6'],['2'])],
['Initialise Min to the first input before the loop', 'Update Min each time a smaller value is found']),

ex('alg-05','algorithms','Calculate Average','medium',
`INPUT 5 integers. Calculate the sum in a variable called \`Total\`, then OUTPUT the average (Total ÷ 5) rounded to 1 decimal place.`,
[t(['2','4','6','8','10'],['6.0']), t(['1','2','3','4','5'],['3.0'])],
['Accumulate all inputs into Total, then divide by 5 for the average', 'Use ROUND to format the result to 1 decimal place']),

ex('alg-06','algorithms','Counting','medium',
`INPUT 6 integers into an array called \`Data\`. Use a variable called \`Count\` to count how many are greater than 5, and OUTPUT \`Count\`.`,
[t(['3','8','1','6','2','9'],['3']), t(['1','2','3','4','5','6'],['1'])],
['Use a FOR loop to examine each element of Data', 'Increment Count inside an IF when the element is greater than 5']),

ex('alg-07','algorithms','Totalling','easy',
`INPUT 5 integers. Accumulate the sum in a variable called \`Total\` and OUTPUT it.`,
[t(['10','20','30','40','50'],['150']), t(['1','1','1','1','1'],['5'])],
['Use a loop to read each input and add it to Total']),

ex('alg-08','algorithms','Bubble Sort (Ascending)','hard',
`INPUT 5 integers into an array called \`Data\`. Sort them in ascending order using bubble sort. OUTPUT all 5 values (one per line, sorted).`,
[t(['5','3','8','1','4'],['1','3','4','5','8']), t(['9','7','5','3','1'],['1','3','5','7','9'])],
['Bubble sort uses nested loops: an outer pass loop and an inner comparison loop', 'Swap adjacent elements when they are in the wrong order using a temporary variable']),

ex('alg-09','algorithms','Bubble Sort (Descending)','hard',
`INPUT 5 integers into an array called \`Data\`. Sort them in descending order using bubble sort. OUTPUT all 5 (sorted, largest first).`,
[t(['5','3','8','1','4'],['8','5','4','3','1']), t(['1','3','5','7','9'],['9','7','5','3','1'])],
['Use the same bubble sort structure as ascending, but swap when adjacent elements are in the wrong order for descending']),

ex('alg-10','algorithms','Find Highest and Its Position','hard',
`INPUT 5 integers into an array. Find the highest value and store it in \`Max\`, and its 1-based index in \`MaxPos\`. OUTPUT \`Max number: \` and \`Max\` on one line, then \`Position: \` and \`MaxPos\` on the next, using concatenation with a comma.`,
[t(['3','7','1','9','2'],['Max number: 9','Position: 4']), t(['10','4','6','8','2'],['Max number: 10','Position: 1'])],
['Track both the maximum value and its position in separate variables', 'Update both whenever a new maximum is found']),

ex('alg-11','algorithms','Find Lowest and Its Position','hard',
`INPUT 5 integers into an array. Find the lowest value and store it in \`Min\`, and its 1-based index in \`MinPos\`. OUTPUT \`Min number: \` and \`Min\` on one line, then \`Position: \` and \`MinPos\` on the next, using concatenation with a comma.`,
[t(['3','7','1','9','2'],['Min number: 1','Position: 3']), t(['5','2','8','4','6'],['Min number: 2','Position: 2'])],
['Track both the minimum value and its position in separate variables']),

ex('alg-12','algorithms','Count Occurrences','medium',
`Declare an array called \`Data\` with 10 elements. Use a FOR loop to populate it with random integers between 1 and 10 inclusive using \`RANDOM()\`. INPUT a target value into \`Target\` (between 1 and 10). Use a variable called \`Count\` to count how many times \`Target\` appears in \`Data\`, and OUTPUT \`Count\`.`,
[],
['Use the ROUND() function to set the random number generated to zero decimal places', 'Use a second FOR loop with an IF statement to count matches against Target'],
'', '',
src => /\bRANDOM\b/i.test(src) && /\bFOR\b/i.test(src) && /\bCount\b/i.test(src) ? null : 'Your solution must use RANDOM(), a FOR loop to populate the array, and a Count variable'),

ex('alg-13','algorithms','Average Excluding Zeros','hard',
`INPUT 6 integers into an array called \`Data\`. Use variables \`Total\` and \`Count\` to sum and count the non-zero values. OUTPUT the average rounded to 1 decimal place, or \`No data\` if all values are zero.`,
[t(['0','4','6','0','2','8'],['5.0']), t(['0','0','0','0','0','0'],['No data'])],
['Only add non-zero values to Total and increment Count for each one', 'Check Count > 0 before dividing to avoid division by zero']),

ex('alg-14','algorithms','Check Sorted Ascending','hard',
`INPUT 5 integers into an array called \`Data\`. OUTPUT \`Sorted\` if they are already in ascending order (each value ≤ next), otherwise OUTPUT \`Not sorted\`.`,
[t(['1','2','3','4','5'],['Sorted']), t(['1','3','2','4','5'],['Not sorted']), t(['5','5','5','5','5'],['Sorted'])],
['Use a boolean flag variable initialised to TRUE', 'Set the flag to FALSE inside the loop if any element is greater than the next']),

ex('alg-15','algorithms','Linear Search in Parallel Arrays','hard',
`Declare parallel arrays: \`Names : ARRAY[1:5] OF STRING\` with \`"Alice","Bob","Charlie","David","Eve"\` and \`Ages : ARRAY[1:5] OF INTEGER\` with \`14,15,13,16,15\`. INPUT a name to search for. If found, OUTPUT the corresponding age. If not found, OUTPUT \`Not found\`.`,
[t(['Charlie'],['13']), t(['Alice'],['14']), t(['Zara'],['Not found'])],
['Loop through the Names array looking for a match with the input', 'When found, output the value at the same index in the Ages array']),

ex('alg-16','algorithms','Sort a 2D Name Array','hard',
`Declare a 2D array \`Names : ARRAY[1:5, 1:2] OF STRING\` and fill it with these values (row, column 1 = first name, column 2 = last name): row 1: "Alice","Wong" · row 2: "Bob","Smith" · row 3: "Charlie","Brown" · row 4: "David","Jones" · row 5: "Eve","Adams". Write a procedure \`DisplayNames()\` that outputs each person's first name followed by a space and their last name, one per line. Write a procedure \`SortNames()\` that performs a bubble sort on the array by last name (column 2), swapping entire rows, then calls \`DisplayNames()\`. Call \`SortNames()\`.`,

[t([],['Eve Adams','Charlie Brown','David Jones','Bob Smith','Alice Wong'])],
['Declare temporary STRING variables to hold values during a row swap', 'The outer bubble sort loop runs from 1 to 4; the inner loop compares adjacent last names using >', 'Swap both columns when Names[Index,2] > Names[Index+1,2]', 'At the end of SortNames, call DisplayNames to print the sorted result']),

// ─────────────────────────────────────────────────────────────────────────────
// EXAM QUESTIONS  (6)
// ─────────────────────────────────────────────────────────────────────────────

ex('exam-01a','exam','Q1(a) — String Operations','medium',
`The string operation \`SUBSTRING(FullText, X, Y)\` returns a string from \`FullText\` beginning at position \`X\` that is \`Y\` characters long. The first character is at position 1.

Write pseudocode to:
• store the string \`"IGCSE Computer Science at Cambridge"\` in a variable called \`FullText\`
• extract the words \`"Computer Science"\` and store them in a variable called \`Subject\`, then OUTPUT \`Subject\`
• OUTPUT the original string \`FullText\` in upper case

[4 marks]`,
[t([],['Computer Science','IGCSE COMPUTER SCIENCE AT CAMBRIDGE'])],
['Count carefully from position 1 — "Computer Science" starts at position 7 and is 16 characters long', 'Apply the upper-case library function to the entire FullText string']),

ex('exam-01b','exam','Q1(b) — File Handling','medium',
`Using the variable \`Subject\` from Q1(a), write pseudocode to:
• open a text file named \`"Subjects.txt"\` for writing
• write the contents of \`Subject\` to the file
• close the file

[3 marks]

Check your solution worked by clicking the **Files** tab at the bottom of the screen — \`"Subjects.txt"\` should contain \`Computer Science\`.`,
[],
['Build on your Q1(a) solution — Subject should already be set', 'Open the file for writing, write the Subject variable to it, then close the file']),

ex('exam-02','exam','Q2 — Rope Cost Calculator','medium',
`A programmer is designing an algorithm to calculate the cost of a length of rope.

The program requirements are:
• INPUT two values: the length of rope in metres \`RopeLength\` and the cost of one metre \`Cost\`
• perform a validation check on \`RopeLength\` to ensure the value is between \`0.5\` and \`6.0\` inclusive — keep asking for input until a valid value is entered
• calculate \`Price\`
• OUTPUT \`Price\` rounded to two decimal places

Use the variable names \`RopeLength\`, \`Cost\`, and \`Price\`.

[6 marks]`,
[t(['2.0','3.14'],['6.28']), t(['7.0','2.0','3.14'],['6.28'])],
['Use a WHILE loop to keep asking for Length as long as the value is outside the valid range', 'Invalid input is anything below 0.5 or above 6.0', 'Price is calculated by multiplying RopeLength by Cost', 'Round Price to 2 decimal places inside the OUTPUT statement using the rounding library function']),

ex('exam-03','exam','Q3 — String Extraction','medium',
`The string operation \`SUBSTRING(Quote, Start, Number)\` returns a string from \`Quote\` beginning at position \`Start\` that is \`Number\` characters long. The first character in \`Quote\` is in position 1.

Write pseudocode statements to:
• store the string \`"Learning Never Exhausts The Mind"\` in \`Quote\`
• extract and display the words \`"The Mind"\` from the string
• OUTPUT the original string in lower case

[5 marks]`,
[t([],['The Mind','learning never exhausts the mind'])],
['Count carefully from position 1 — "The Mind" starts at position 25 and is 8 characters long', 'Apply the lower-case library function to the entire Quote string']),

ex('exam-04','exam','Q4 — Lowest Temperature','medium',
`A one-dimensional (1D) array called \`Temperatures\` has 25 elements beginning at index 1. It holds values that range between -20 and 100 inclusive.

Write a pseudocode algorithm using a single loop to find the lowest value in this array and output the result only once. You do not need to declare or populate the array.

[4 marks]

*The array has been pre-loaded in the simulator for you to test your solution.*`,
[t([],['-15'])],
['Set a variable to the value of the first element before the loop begins', 'Loop from index 1 to 25, comparing each element to your current lowest', 'Only update your lowest variable when a smaller value is found', 'OUTPUT the result after the loop ends, not inside it'],
`DECLARE Temperatures : ARRAY[1:25] OF INTEGER
// Assume the Temperatures array has now been populated with 25 values.`,
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

ex('exam-05','exam','Q5 — Write Password to File','easy',
`A program accepts a password and stores it in a variable \`Password\`. This value is to be written to a file \`MyPassword.txt\`.

Write pseudocode to:
• open the file
• write the accepted password to the file
• close the file

You do not need to declare or populate the \`Password\` variable. You may assume that this has already been done.

[3 marks]

*\`Password\` has been pre-loaded in the simulator. Check your solution worked by clicking the **Files** tab — \`MyPassword.txt\` should contain the password.*`,
[],
['Open the file in write mode', 'Write the Password variable to the file', 'Always close the file after writing'],
`DECLARE Password : STRING
Password <- "SecurePass123"
`),

ex('exam-06','exam','Q6 — TotalNumbers() Function','hard',
`An algorithm needs to total 50 numbers between 1 and 100 inclusive.

Write a function \`TotalNumbers()\` that:
• uses a count-controlled loop from 1 to 50
• uses an appropriate prompt to ask for a number between 1 and 100
• totals the numbers as they are entered (do not use an array)
• returns the total after the loop has completed

After your function, write the comment \`// Main\`. Beneath this, write three pseudocode statements to:
• declare a variable \`Total\`
• assign the return value of \`TotalNumbers()\` to \`Total\`
• display the total with a suitable message

[6 marks]

*To test your solution in the simulator, enter any 50 numbers between 1 and 100 when prompted. The displayed total should be their sum.*`,
[],
['Declare a running total variable inside the function and initialise it to 0 before the loop', 'Use a count-controlled loop from 1 to 50, prompting for input each iteration', 'Add each number entered to the running total inside the loop', 'Return the running total after the loop has finished — not inside it', 'In the main section, declare an integer variable, call the function, and assign the return value to it']),

];

// ── Sanity check (development aid, remove in production if needed) ─────────────
if (EXERCISES.length !== 207) {
  console.warn(`exercises.js: expected 207 exercises, got ${EXERCISES.length}`);
}
