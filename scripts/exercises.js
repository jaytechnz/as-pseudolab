// ─── 207 Cambridge AS & A Level 9618 Pseudocode Exercises ──────────────────────
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

function requireBYREF(source) {
  return /\bBYREF\b/i.test(source) ? null : 'You must pass at least one parameter BYREF.';
}

// ══════════════════════════════════════════════════════════════════════════════
// CATEGORY METADATA
// ══════════════════════════════════════════════════════════════════════════════

export const CATEGORIES = [
  { id: 'basics',     label: 'Basics & Data Types',              count: 25 },
  { id: 'operators',  label: 'Operators & Type Conversion',      count: 15 },
  { id: 'selection',  label: 'Selection',                        count: 20 },
  { id: 'iteration',  label: 'Iteration',                        count: 20 },
  { id: 'strings',    label: 'String Handling',                  count: 25 },
  { id: 'procedures', label: 'Functions & Procedures',           count: 45 },
  { id: 'arrays',     label: 'Arrays',                           count: 20 },
  { id: 'records',    label: 'Records',                          count: 15 },
  { id: 'files',      label: 'File Handling',                    count: 20 },
  { id: 'algorithms', label: 'Standard Algorithms',              count: 15 },
  { id: 'exam',       label: 'Exam Questions',                   count: 7  },
];

// ══════════════════════════════════════════════════════════════════════════════
// EXERCISES
// ══════════════════════════════════════════════════════════════════════════════

export const EXERCISES = [

// ─────────────────────────────────────────────────────────────────────────────
// BASICS & DATA TYPES  (25)
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

ex('bas-04','basics','Declare a CHAR','easy',
`Declare a CHAR variable called \`Grade\`, assign it the character \`\'A\'\`, and OUTPUT it.`,
[t([],['A'])],
['CHAR holds exactly one character', 'Use single quotes for a CHAR literal: \'A\'']),

ex('bas-05','basics','Declare a BOOLEAN','easy',
`Declare a BOOLEAN variable called \`IsValid\`, assign it \`TRUE\`, and OUTPUT it.`,
[t([],['TRUE'])],
['Use DECLARE to create a BOOLEAN variable', 'Assign TRUE (no quotes) and OUTPUT it']),

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
`INPUT a name into a variable called \`Name\`. OUTPUT \`Hello, \` followed by the name.`,
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

ex('bas-17','basics','Full Name from Two Inputs','easy',
`INPUT a first name into \`FirstName\` and a last name into \`LastName\`. OUTPUT the full name with a space between them.`,
[t(['John','Smith'],['John Smith']), t(['Ada','Lovelace'],['Ada Lovelace'])],
['Join FirstName, a space string " ", and LastName using the & operator']),

ex('bas-18','basics','CHAR vs STRING','medium',
`Declare a CHAR variable \`Initial\` and assign it the first letter of the alphabet. Declare a STRING variable \`Word\` and assign it \`"Alpha"\`. OUTPUT both on separate lines.`,
[t([],['A','Alpha'])],
['CHAR uses single quotes: \'A\'', 'STRING uses double quotes: "Alpha"']),

ex('bas-19','basics','Calculate and Announce','medium',
`Declare \`Num1 ← 8\` and \`Num2 ← 7\`. Use a single OUTPUT statement to print \`Result: 56\`, combining the label and the product.`,
[t([],['Result: 56'])],
['Use OUTPUT with a comma to separate the label string "Result: " from the calculated expression Num1 * Num2']),

ex('bas-20','basics','Welcome Message','easy',
`INPUT a name into a variable called \`Name\`. OUTPUT \`Welcome, \` followed by the name, followed by \`!\`.`,
[t(['Alice'],['Welcome, Alice!']), t(['Class'],['Welcome, Class!'])],
['Join the parts of the message using the & operator']),

ex('bas-21','basics','Three Lines of Output','easy',
`OUTPUT three separate lines: \`Line 1\`, \`Line 2\`, and \`Line 3\`.`,
[t([],['Line 1','Line 2','Line 3'])],
['Write three separate OUTPUT statements, one for each line']),

ex('bas-22','basics','Sum Announcement','medium',
`Declare \`Num1 ← 15\` and \`Num2 ← 27\`. OUTPUT \`Sum: 42\`.`,
[t([],['Sum: 42'])],
['Use OUTPUT with a comma to separate the label "Sum: " from the expression Num1 + Num2']),

ex('bas-23','basics','Zero Initialisation','easy',
`Declare an INTEGER variable \`Counter\` and assign it \`0\`. OUTPUT its value.`,
[t([],['0'])],
['Initialise Counter to 0, then OUTPUT it']),

ex('bas-24','basics','Multiple Declarations on One Line','medium',
`Declare INTEGER variables \`Rows\` and \`Cols\` using a single DECLARE statement. Assign \`Rows ← 3\` and \`Cols ← 4\`. OUTPUT their product.`,
[t([],['12'])],
['In Cambridge pseudocode you can declare multiple variables of the same type: DECLARE Rows, Cols : INTEGER', 'OUTPUT Rows * Cols']),

ex('bas-25','basics','Announce a Value','medium',
`Declare \`Points ← 100\`. OUTPUT the text \`Points: 100\`.`,
[t([],['Points: 100'])],
['Use OUTPUT with comma-separated values: the label string "Points: " then the Points variable']),

// ─────────────────────────────────────────────────────────────────────────────
// OPERATORS & TYPE CONVERSION  (15)
// ─────────────────────────────────────────────────────────────────────────────

ex('ope-01','operators','Integer Division with DIV','easy',
`OUTPUT the result of \`17 DIV 5\` (integer quotient).`,
[t([],['3'])],
['DIV gives the whole-number part of a division: 17 DIV 5 = 3']),

ex('ope-02','operators','Remainder with MOD','easy',
`OUTPUT the result of \`17 MOD 5\` (remainder).`,
[t([],['2'])],
['MOD gives the remainder after integer division: 17 MOD 5 = 2']),

ex('ope-03','operators','Even or Odd','easy',
`INPUT an integer \`Number\`. OUTPUT \`Even\` if it is divisible by 2, otherwise OUTPUT \`Odd\`.`,
[t(['4'],['Even']), t(['7'],['Odd']), t(['0'],['Even'])],
['Use MOD 2 to test if the number is even (remainder is 0)']),

ex('ope-04','operators','INT Function','easy',
`Declare \`Val ← 7.9\`. Use the \`INT()\` function to truncate it to an integer and OUTPUT the result.`,
[t([],['7'])],
['INT() truncates towards zero — it removes the fractional part', 'INT(7.9) gives 7, not 8']),

ex('ope-05','operators','INT of Negative Number','medium',
`Declare \`Val ← -3.7\`. Use \`INT()\` to truncate it and OUTPUT the result.`,
[t([],['-3'])],
['INT() truncates towards zero — for a negative number this means -3.7 becomes -3, not -4']),

ex('ope-06','operators','STR_TO_NUM Conversion','easy',
`A string \`NumStr ← "42"\` stores a number as text. Use \`STR_TO_NUM()\` to convert it to an integer, add 8, and OUTPUT the result.`,
[t([],['50'])],
['STR_TO_NUM("42") converts the string to the integer 42', 'Then add 8 and OUTPUT the sum']),

ex('ope-07','operators','NUM_TO_STR Conversion','easy',
`Declare \`Score ← 95\`. Use \`NUM_TO_STR()\` to convert it to a string, then OUTPUT the text \`Score: 95\` using string concatenation only.`,
[t([],['Score: 95'])],
['NUM_TO_STR(95) produces the string "95"', 'Join "Score: " with the string result using &']),

ex('ope-08','operators','Input and Convert','medium',
`INPUT a number as a string into \`RawInput\`. Use \`STR_TO_NUM()\` to convert it, add 10, and OUTPUT the result.`,
[t(['5'],['15']), t(['20'],['30'])],
['Use STR_TO_NUM to convert the string input to an integer before adding 10']),

ex('ope-09','operators','Build a Formatted String','medium',
`INPUT an integer \`Year\`. Output a sentence like \`The year is 2025\` using NUM_TO_STR to convert the integer to a string.`,
[t(['2025'],['The year is 2025']), t(['1999'],['The year is 1999'])],
['Use NUM_TO_STR(Year) to get the string form, then join with "The year is " using &']),

ex('ope-10','operators','Arithmetic Precedence','medium',
`Declare \`Result ← 3 + 4 * 2\`. OUTPUT the result. Then OUTPUT the result of \`(3 + 4) * 2\` on a second line.`,
[t([],['11','14'])],
['Multiplication has higher precedence than addition, so 3 + 4 * 2 = 11', 'Use parentheses to force addition first: (3 + 4) * 2 = 14']),

ex('ope-11','operators','Logical AND','easy',
`INPUT two integers \`Age\` and \`Score\`. OUTPUT \`Pass\` if Age >= 16 AND Score >= 50, otherwise OUTPUT \`Fail\`.`,
[t(['18','60'],['Pass']), t(['15','80'],['Fail']), t(['16','49'],['Fail'])],
['Use AND to combine both conditions in a single IF expression']),

ex('ope-12','operators','Logical OR','easy',
`INPUT an integer \`Code\`. OUTPUT \`Special\` if Code = 0 OR Code = 999, otherwise OUTPUT \`Normal\`.`,
[t(['0'],['Special']), t(['999'],['Special']), t(['42'],['Normal'])],
['Use OR to test two alternative conditions']),

ex('ope-13','operators','NOT Operator','easy',
`INPUT a BOOLEAN \`IsComplete\`. OUTPUT \`Incomplete\` if it is NOT TRUE, otherwise OUTPUT \`Done\`.`,
[t(['FALSE'],['Incomplete']), t(['TRUE'],['Done'])],
['Use NOT to invert the boolean value in your IF condition']),

ex('ope-14','operators','Integer from Division','medium',
`INPUT two integers \`Dividend\` and \`Divisor\`. OUTPUT the integer quotient using DIV and the remainder using MOD, on separate lines.`,
[t(['13','4'],['3','1']), t(['20','6'],['3','2'])],
['Use DIV for the whole-number quotient', 'Use MOD for the remainder']),

ex('ope-15','operators','Validate and Convert','hard',
`INPUT a string \`NumStr\`. If its LENGTH is greater than 0, convert it using \`STR_TO_NUM()\` and OUTPUT the value doubled. Otherwise OUTPUT \`Empty input\`.`,
[t(['7'],['14']), t(['25'],['50']), t([''],['Empty input'])],
['Use LENGTH to check whether the input is non-empty', 'Only apply STR_TO_NUM when the string is non-empty']),

// ─────────────────────────────────────────────────────────────────────────────
// SELECTION  (20)
// ─────────────────────────────────────────────────────────────────────────────

ex('sel-01','selection','Simple IF','easy',
`INPUT an integer \`Number\`. OUTPUT \`Positive\` if it is greater than 0, otherwise OUTPUT \`Not positive\`.`,
[t(['5'],['Positive']), t(['0'],['Not positive']), t(['-3'],['Not positive'])],
['Use IF Number > 0 THEN ... ELSE ... ENDIF']),

ex('sel-02','selection','IF with Three Outcomes','medium',
`INPUT an integer \`Number\`. OUTPUT \`Positive\`, \`Negative\`, or \`Zero\` as appropriate.`,
[t(['5'],['Positive']), t(['-3'],['Negative']), t(['0'],['Zero'])],
['Use nested IF statements: check > 0 first, then < 0, else Zero']),

ex('sel-03','selection','Grade Classification','medium',
`INPUT an integer \`Mark\` (0–100). OUTPUT the grade: \`A\` (≥70), \`B\` (≥55), \`C\` (≥40), or \`U\` (below 40).`,
[t(['75'],['A']), t(['60'],['B']), t(['42'],['C']), t(['30'],['U'])],
['Test the highest threshold first', 'Use ELSE IF for subsequent grades']),

ex('sel-04','selection','Odd or Even with CASE','medium',
`INPUT an integer \`Remainder\` (0 or 1, the result of MOD 2). Use a CASE OF statement to OUTPUT \`Even\` for 0 or \`Odd\` for 1.`,
[t(['0'],['Even']), t(['1'],['Odd'])],
['CASE OF Remainder followed by 0: and 1: branches']),

ex('sel-05','selection','Day Name','medium',
`INPUT an integer \`Day\` (1–7). Use CASE OF to OUTPUT the day name: 1→Monday, 2→Tuesday, 3→Wednesday, 4→Thursday, 5→Friday, 6→Saturday, 7→Sunday. Use OTHERWISE to OUTPUT \`Invalid\`.`,
[t(['1'],['Monday']), t(['5'],['Friday']), t(['8'],['Invalid'])],
['Use CASE OF Day with a branch for each value 1 to 7', 'Add an OTHERWISE branch to handle values outside 1–7']),

ex('sel-06','selection','Validate Range','easy',
`INPUT an integer \`Score\`. OUTPUT \`Valid\` if it is between 0 and 100 inclusive, otherwise OUTPUT \`Invalid\`.`,
[t(['50'],['Valid']), t(['100'],['Valid']), t(['0'],['Valid']), t(['101'],['Invalid'])],
['Use AND to combine two conditions: Score >= 0 AND Score <= 100']),

ex('sel-07','selection','Login Attempt','medium',
`INPUT a string \`Password\`. OUTPUT \`Access granted\` if the password equals \`"Cambridge9618"\`, otherwise OUTPUT \`Access denied\`.`,
[t(['Cambridge9618'],['Access granted']), t(['password'],['Access denied'])],
['Use IF Password = "Cambridge9618" THEN ... ELSE ... ENDIF']),

ex('sel-08','selection','Ticket Price','medium',
`INPUT an integer \`Age\`. Output the ticket price: children under 12 pay \`5\`, seniors aged 65 or over pay \`7\`, everyone else pays \`12\`.`,
[t(['8'],['5']), t(['30'],['12']), t(['65'],['7']), t(['11'],['5'])],
['Check Age < 12 first, then Age >= 65, then else for 12']),

ex('sel-09','selection','Season from Month','medium',
`INPUT an integer \`Month\` (1–12). Use CASE OF to OUTPUT the season: 12,1,2→Winter; 3,4,5→Spring; 6,7,8→Summer; 9,10,11→Autumn. Use OTHERWISE for invalid.`,
[t(['1'],['Winter']), t(['7'],['Summer']), t(['11'],['Autumn']), t(['13'],['Invalid'])],
['CASE OF can match multiple values in one branch using commas: 12, 1, 2 :']),

ex('sel-10','selection','Leap Year','hard',
`INPUT an integer \`Year\`. A year is a leap year if it is divisible by 4, EXCEPT for years divisible by 100, which must also be divisible by 400. OUTPUT \`Leap year\` or \`Not a leap year\`.`,
[t(['2000'],['Leap year']), t(['1900'],['Not a leap year']), t(['2024'],['Leap year']), t(['2023'],['Not a leap year'])],
['A year is a leap year if: (Year MOD 4 = 0) AND ((Year MOD 100 <> 0) OR (Year MOD 400 = 0))']),

ex('sel-11','selection','Triangle Type','hard',
`INPUT three INTEGER side lengths \`Side1\`, \`Side2\`, \`Side3\`. OUTPUT \`Equilateral\` (all equal), \`Isosceles\` (exactly two equal), or \`Scalene\` (none equal).`,
[t(['3','3','3'],['Equilateral']), t(['3','3','5'],['Isosceles']), t(['3','4','5'],['Scalene'])],
['Check equilateral first (all three equal)', 'For isosceles, check if any two sides match using OR']),

ex('sel-12','selection','BMI Category','hard',
`INPUT a REAL \`BMI\`. OUTPUT the category: \`Underweight\` (< 18.5), \`Normal\` (< 25.0), \`Overweight\` (< 30.0), or \`Obese\` (≥ 30.0).`,
[t(['17.5'],['Underweight']), t(['22.0'],['Normal']), t(['27.3'],['Overweight']), t(['32.0'],['Obese'])],
['Test the thresholds in ascending order using ELSE IF']),

ex('sel-13','selection','Password Strength','hard',
`INPUT a string \`Password\`. OUTPUT \`Strong\` if its length is 8 or more AND it does not equal \`"password"\`, otherwise OUTPUT \`Weak\`.`,
[t(['Cambridge9618'],['Strong']), t(['short'],['Weak']), t(['password'],['Weak'])],
['Use LENGTH to check the length', 'Combine both conditions with AND']),

ex('sel-14','selection','Number Classifier','medium',
`INPUT an integer \`Number\`. OUTPUT \`Large positive\` if > 100, \`Small positive\` if > 0, \`Zero\` if = 0, or \`Negative\` if < 0.`,
[t(['150'],['Large positive']), t(['50'],['Small positive']), t(['0'],['Zero']), t(['-5'],['Negative'])],
['Test the largest positive range first to avoid overlap']),

ex('sel-15','selection','CASE with Range','hard',
`INPUT an integer \`Score\` (0–100). Use CASE OF with ranges (e.g. \`40 TO 54 :\`) to OUTPUT the grade: A (70–100), B (55–69), C (40–54), U (0–39).`,
[t(['85'],['A']), t(['62'],['B']), t(['47'],['C']), t(['25'],['U'])],
['CASE OF supports range matching: 70 TO 100 : outputs A', 'List branches from highest to lowest']),

ex('sel-16','selection','Divisibility Test','medium',
`INPUT an integer \`Number\`. OUTPUT \`Divisible by 3 and 5\` if divisible by both, \`Divisible by 3\` if only by 3, \`Divisible by 5\` if only by 5, or \`Neither\`.`,
[t(['15'],['Divisible by 3 and 5']), t(['9'],['Divisible by 3']), t(['10'],['Divisible by 5']), t(['7'],['Neither'])],
['Check the combined condition first, then individual ones']),

ex('sel-17','selection','Nested IF: Loan Decision','hard',
`INPUT an integer \`Income\` and a BOOLEAN \`HasGoodCredit\`. If Income >= 30000 AND HasGoodCredit = TRUE, OUTPUT \`Approved\`. If Income >= 30000 AND HasGoodCredit = FALSE, OUTPUT \`Review needed\`. Otherwise OUTPUT \`Declined\`.`,
[t(['35000','TRUE'],['Approved']), t(['35000','FALSE'],['Review needed']), t(['20000','TRUE'],['Declined'])],
['Test Income >= 30000 in the outer IF', 'Nest a second IF inside to check HasGoodCredit']),

ex('sel-18','selection','Traffic Light','easy',
`INPUT a string \`Light\` (\`"Red"\`, \`"Amber"\`, or \`"Green"\`). Use CASE OF to OUTPUT \`Stop\`, \`Caution\`, or \`Go\` respectively. Use OTHERWISE to OUTPUT \`Error\`.`,
[t(['Red'],['Stop']), t(['Amber'],['Caution']), t(['Green'],['Go']), t(['Blue'],['Error'])],
['CASE OF works with strings as well as integers']),

ex('sel-19','selection','Absolute Value','medium',
`INPUT a REAL number \`Number\`. OUTPUT its absolute value (positive version) without using any built-in function.`,
[t(['5.5'],['5.5']), t(['-3.2'],['-3.2'.replace('-','')]), t(['0'],['0'])],
['If Number < 0, output Number * -1, else output Number']),

ex('sel-20','selection','Max of Three','medium',
`INPUT three integers \`Num1\`, \`Num2\`, and \`Num3\`. OUTPUT the largest.`,
[t(['3','7','5'],['7']), t(['10','10','4'],['10']), t(['1','2','3'],['3'])],
['Store the max in a variable — compare Num1 and Num2 first, then compare the winner against Num3']),

// ─────────────────────────────────────────────────────────────────────────────
// ITERATION  (20)
// ─────────────────────────────────────────────────────────────────────────────

ex('ite-01','iteration','FOR Loop: Count Up','easy',
`Use a FOR loop to OUTPUT the integers 1 to 5, one per line.`,
[t([],['1','2','3','4','5'])],
['FOR Counter ← 1 TO 5', 'Use NEXT Counter to end the loop']),

ex('ite-02','iteration','FOR Loop: Count Down','easy',
`Use a FOR loop with STEP -1 to OUTPUT the integers 5 down to 1, one per line.`,
[t([],['5','4','3','2','1'])],
['FOR Counter ← 5 TO 1 STEP -1']),

ex('ite-03','iteration','FOR Loop: Sum 1 to 10','medium',
`Use a FOR loop to calculate the sum of integers 1 to 10. Store the result in \`Total\` and OUTPUT it.`,
[t([],['55'])],
['Initialise Total ← 0 before the loop', 'Add the loop variable to Total on each iteration']),

ex('ite-04','iteration','FOR Loop: Multiplication Table','medium',
`INPUT an integer \`Number\`. Use a FOR loop to OUTPUT the multiplication table for \`Number\` from 1 × to 10 ×, with each line in the format \`3 x 1 = 3\`.`,
[t(['3'],['3 x 1 = 3','3 x 2 = 6','3 x 3 = 9','3 x 4 = 12','3 x 5 = 15','3 x 6 = 18','3 x 7 = 21','3 x 8 = 24','3 x 9 = 27','3 x 10 = 30'])],
['Use a FOR loop from 1 to 10', 'Output using comma-separated values: Number, " x ", Counter, " = ", Number * Counter']),

ex('ite-05','iteration','FOR Loop: Even Numbers','easy',
`Use a FOR loop with STEP 2 to OUTPUT all even numbers from 2 to 10.`,
[t([],['2','4','6','8','10'])],
['Start at 2 and use STEP 2 to count in steps of 2']),

ex('ite-06','iteration','WHILE Loop: Countdown','medium',
`Declare an integer \`Count ← 5\`. Use a WHILE loop to OUTPUT the value of \`Count\` on each iteration, decrementing it by 1 each time, until it reaches 0.`,
[t([],['5','4','3','2','1'])],
['WHILE Count > 0 (no DO keyword in 9618 pseudocode)', 'Decrement Count by 1 inside the loop body']),

ex('ite-07','iteration','WHILE Loop: Input Validation','medium',
`Ask the user for an integer between 1 and 10 inclusive. Keep prompting until a valid value is entered, then OUTPUT the valid value.`,
[t(['15','0','7'],['7']), t(['5'],['5'])],
['Use a WHILE loop that continues as long as the input is outside the valid range', 'INPUT inside the loop to get a new value each time']),

ex('ite-08','iteration','WHILE Loop: Sum Until Zero','hard',
`Repeatedly INPUT integers. Stop when the user enters 0. OUTPUT the sum of all non-zero values entered.`,
[t(['3','5','2','0'],['10']), t(['10','0'],['10']), t(['0'],['0'])],
['Initialise Total ← 0 and read the first value before the loop', 'WHILE the value is not 0, add it to Total and read the next value']),

ex('ite-09','iteration','REPEAT UNTIL: Positive Input','medium',
`Use a REPEAT UNTIL loop to keep asking the user for a positive integer. Stop when they enter a number greater than 0. OUTPUT the value.`,
[t(['-3','0','5'],['5']), t(['1'],['1'])],
['REPEAT ... UNTIL Number > 0', 'The loop body always runs at least once']),

ex('ite-10','iteration','REPEAT UNTIL: Guessing Game','hard',
`The secret number is 7. Repeatedly INPUT a guess. OUTPUT \`Too low\` or \`Too high\` after each wrong guess, and \`Correct!\` when the user gets it right.`,
[t(['3','9','7'],['Too low','Too high','Correct!']), t(['7'],['Correct!'])],
['Use REPEAT UNTIL Guess = 7', 'Use IF inside the loop to give feedback before each UNTIL check']),

ex('ite-11','iteration','FOR Loop: Factorial','hard',
`INPUT a positive integer \`Number\`. Calculate its factorial using a FOR loop and OUTPUT the result.`,
[t(['5'],['120']), t(['1'],['1']), t(['6'],['720'])],
['Initialise Factorial ← 1 before the loop', 'Multiply Factorial by each loop counter value from 1 to Number']),

ex('ite-12','iteration','WHILE Loop: Digit Count','hard',
`INPUT a positive integer \`Number\`. Count how many digits it has using repeated division by 10. OUTPUT the count.`,
[t(['12345'],['5']), t(['7'],['1']), t(['100'],['3'])],
['Initialise Count ← 0', 'While Number > 0, divide Number by 10 using DIV and increment Count']),

ex('ite-13','iteration','FOR Loop: Stars Pattern','medium',
`INPUT an integer \`Rows\` (1–5). Use nested FOR loops to OUTPUT a right-angled triangle of asterisks, with \`Rows\` rows. Row 1 has 1 star, row 2 has 2 stars, etc.`,
[t(['3'],['*','**','***']), t(['1'],['*'])],
['Use an outer loop from 1 to Rows', 'Build each row as a string by concatenating "*" characters in an inner loop']),

ex('ite-14','iteration','Count Occurrences','medium',
`INPUT 10 integers one at a time. Count how many are greater than 50 and OUTPUT the count.`,
[t(['60','30','70','20','80','40','90','10','50','5'],['4']), t(['1','2','3','4','5','6','7','8','9','10'],['0'])],
['Use a FOR loop to read 10 inputs', 'Increment a counter variable each time the input is greater than 50']),

ex('ite-15','iteration','Running Total','medium',
`INPUT 5 integers. Output a running total after each one.`,
[t(['1','2','3','4','5'],['1','3','6','10','15']), t(['10','5','3','2','0'],['10','15','18','20','20'])],
['Maintain a running total variable that increases with each element', 'Output the running total immediately after each addition']),

ex('ite-16','iteration','FOR Loop: FizzBuzz','hard',
`OUTPUT integers 1 to 20. For multiples of 3 output \`Fizz\`, for multiples of 5 output \`Buzz\`, for multiples of both output \`FizzBuzz\`, otherwise output the number.`,
[t([],['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz','16','17','Fizz','19','Buzz'])],
['Check for divisibility by 15 (both 3 and 5) first', 'Use MOD to test divisibility']),

ex('ite-17','iteration','WHILE Loop: Collatz Sequence','hard',
`INPUT a positive integer \`Number\`. Apply the Collatz rule: if even, divide by 2; if odd, multiply by 3 and add 1. Repeat until the number equals 1. OUTPUT each value (including the starting value, but not the final 1).`,
[t(['6'],['6','3','10','5','16','8','4','2']), t(['1'],[])],
['Output Number before each step', 'Use MOD 2 = 0 to check if the number is even', 'Stop when Number = 1 (do not output 1)']),

ex('ite-18','iteration','FOR Loop: Reverse Output','easy',
`INPUT 5 integers into separate variables. OUTPUT them in reverse order.`,
[t(['1','2','3','4','5'],['5','4','3','2','1']), t(['10','20','30','40','50'],['50','40','30','20','10'])],
['INPUT five separate variables', 'OUTPUT them in reverse order — last variable first']),

ex('ite-19','iteration','WHILE Loop: GCD','hard',
`INPUT two positive integers \`Num1\` and \`Num2\`. Use the Euclidean algorithm to find their GCD. WHILE Num2 <> 0: set Temp ← Num2, Num2 ← Num1 MOD Num2, Num1 ← Temp. OUTPUT the GCD.`,
[t(['48','18'],['6']), t(['100','75'],['25']), t(['7','5'],['1'])],
['The Euclidean algorithm repeatedly replaces (a, b) with (b, a MOD b) until b = 0', 'Use a WHILE loop with condition Num2 <> 0']),

ex('ite-20','iteration','FOR Loop: Powers of 2','medium',
`Use a FOR loop to OUTPUT the first 8 powers of 2: 1, 2, 4, 8, 16, 32, 64, 128.`,
[t([],['1','2','4','8','16','32','64','128'])],
['Maintain a variable Power ← 1 before the loop', 'On each iteration output Power, then double it: Power ← Power * 2']),

// ─────────────────────────────────────────────────────────────────────────────
// STRING HANDLING  (25)
// ─────────────────────────────────────────────────────────────────────────────

ex('str-01','strings','LENGTH of a String','easy',
`INPUT a word into \`Word\`. OUTPUT its length.`,
[t(['Hello'],['5']), t(['Cambridge'],['9']), t(['AS'],['2'])],
['Use LENGTH(Word) to count the characters']),

ex('str-02','strings','UCASE and LCASE','easy',
`INPUT a string into \`Text\`. OUTPUT it in uppercase on the first line and lowercase on the second.`,
[t(['Hello'],['HELLO','hello']), t(['Cambridge'],['CAMBRIDGE','cambridge'])],
['Use UCASE(Text) for uppercase and LCASE(Text) for lowercase']),

ex('str-03','strings','MID: Extract Substring','easy',
`Assign \`Text ← "Cambridge"\`. Use \`MID()\` to extract and OUTPUT \`"bridge"\` (6 characters starting at position 4).`,
[t([],['bridge'])],
['MID(string, start, length) — start is 1-based', 'MID("Cambridge", 4, 6) starts at position 4 and takes 6 characters']),

ex('str-04','strings','MID: First Character','easy',
`INPUT a string into \`Word\`. Use \`MID()\` to OUTPUT only the first character.`,
[t(['Alice'],['A']), t(['Cambridge'],['C'])],
['MID(Word, 1, 1) extracts 1 character starting at position 1']),

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
['Use MID(Text, 2, 3) to start at position 2 and take 3 characters']),

ex('str-08','strings','String Concatenation','easy',
`INPUT a first name into \`FirstName\` and a last name into \`LastName\`. OUTPUT the initials — the first character of each name in uppercase, with a full stop between them (e.g. \`J.S.\`).`,
[t(['john','smith'],['J.S.']), t(['Ada','Lovelace'],['A.L.'])],
['Use MID to extract the first character of each name', 'Use UCASE to convert to uppercase', 'Join with "." using & and add a final "."']),

ex('str-09','strings','Reverse a Three-Letter Word','medium',
`INPUT a 3-letter string into \`Word\`. OUTPUT the word reversed using MID.`,
[t(['Cat'],['taC']), t(['dog'],['god'])],
['Extract each character separately with MID(Word,3,1), MID(Word,2,1), MID(Word,1,1)', 'Concatenate them in reverse order using &']),

ex('str-10','strings','Count Vowels','hard',
`INPUT a string into \`Word\`. Count how many vowels (a, e, i, o, u — case insensitive) it contains and OUTPUT the count.`,
[t(['Hello'],['2']), t(['Cambridge'],['3']), t(['rhythm'],['0'])],
['Use a FOR loop from 1 to LENGTH(Word)', 'Extract each character with MID(Word, Index, 1) and convert to lowercase with LCASE', 'Check if it equals "a", "e", "i", "o", or "u" using OR']),

ex('str-11','strings','Palindrome Check','hard',
`INPUT a string into \`Word\`. Check if it is a palindrome (same forwards and backwards). OUTPUT \`Palindrome\` or \`Not a palindrome\`. (Assume lowercase input with no spaces.)`,
[t(['racecar'],['Palindrome']), t(['level'],['Palindrome']), t(['hello'],['Not a palindrome'])],
['Build a reversed version of the string using a loop from LENGTH(Word) down to 1', 'Compare the reversed string to the original']),

ex('str-12','strings','First and Last Character','medium',
`INPUT a string \`Word\`. OUTPUT the first character and last character on separate lines.`,
[t(['Hello'],['H','o']), t(['AS'],['A','S'])],
['Use MID(Word, 1, 1) for the first character', 'Use MID(Word, LENGTH(Word), 1) for the last character']),

ex('str-13','strings','Uppercase Initial','easy',
`INPUT a full name into \`FullName\`. OUTPUT the first character converted to uppercase.`,
[t(['alice'],['A']), t(['bob'],['B'])],
['Use MID to extract the first character, then UCASE to capitalise it']),

ex('str-14','strings','Check File Extension','medium',
`INPUT a filename into \`FileName\`. OUTPUT \`CSV file\` if the last 4 characters equal \`".csv"\` (case insensitive), otherwise OUTPUT \`Other file\`.`,
[t(['data.csv'],['CSV file']), t(['DATA.CSV'],['CSV file']), t(['report.txt'],['Other file'])],
['Use RIGHT(FileName, 4) to get the last 4 characters', 'Use LCASE to convert to lowercase before comparing']),

ex('str-15','strings','MID: Parse First Word','hard',
`Assign \`Sentence ← "Cambridge 9618"\`. Use MID to extract \`"Cambridge"\` (the first 9 characters) and OUTPUT it.`,
[t([],['Cambridge'])],
['Use MID(Sentence, 1, 9) or LEFT(Sentence, 9)']),

ex('str-16','strings','String Repeat','hard',
`INPUT a CHAR \`Ch\` and an integer \`Times\`. Build and OUTPUT a string consisting of \`Ch\` repeated \`Times\` times.`,
[t(['*','5'],['*****']), t(['X','3'],['XXX'])],
['Initialise an empty string variable Result ← ""', 'Use a FOR loop to concatenate Ch to Result on each iteration']),

ex('str-17','strings','MID: Extract Token from CSV','hard',
`Assign \`Record ← "Alice,16,Computer Science"\`. The first field ends at the comma (position 6). Use MID to extract the name (positions 1 to 5) and OUTPUT it.`,
[t([],['Alice'])],
['Use MID(Record, 1, 5) to extract the 5-character name', 'Alternatively use LEFT(Record, 5)']),

ex('str-18','strings','Truncate to N Characters','medium',
`INPUT a string \`Text\` and an integer \`Limit\`. If the string is longer than Limit characters, OUTPUT only the first Limit characters followed by \`...\`. Otherwise OUTPUT the string as-is.`,
[t(['Hello World','5'],['Hello...']), t(['Hi','5'],['Hi'])],
['Use LENGTH to check if the string exceeds Limit', 'If too long, use LEFT(Text, Limit) and concatenate "..."']),

ex('str-19','strings','Username Generator','medium',
`INPUT a first name and last name. Generate a username: first 3 characters of first name (lowercase) + first 3 characters of last name (lowercase). OUTPUT it.`,
[t(['Alice','Smith'],['alismi']), t(['Bob','Jones'],['bobjOn'.toLowerCase()])],
['Use LEFT or MID to extract the first 3 characters of each name', 'Apply LCASE to convert to lowercase', 'Concatenate the two parts']),

ex('str-20','strings','Count Characters in Common','hard',
`INPUT two strings \`Str1\` and \`Str2\` of the same length. Count how many positions have the same character (case sensitive) and OUTPUT the count.`,
[t(['hello','hExlo'],['4']), t(['abc','abc'],['3']), t(['abc','xyz'],['0'])],
['Loop from 1 to LENGTH(Str1)', 'Use MID(Str1, Index, 1) and MID(Str2, Index, 1) to compare characters at each position']),

ex('str-21','strings','RIGHT: File Extension','easy',
`INPUT a filename into \`FileName\`. Use \`RIGHT()\` to OUTPUT the last 3 characters (the extension letters without the dot), e.g. for \`"data.csv"\` output \`"csv"\`.`,
[t(['data.csv'],['csv']), t(['report.txt'],['txt'])],
['RIGHT(FileName, 3) returns the last 3 characters']),

ex('str-22','strings','Case-Insensitive Comparison','medium',
`INPUT two strings \`Word1\` and \`Word2\`. OUTPUT \`Match\` if they are equal ignoring case, otherwise OUTPUT \`No match\`.`,
[t(['hello','HELLO'],['Match']), t(['Cat','cat'],['Match']), t(['dog','cat'],['No match'])],
['Convert both strings to the same case (e.g. LCASE) before comparing with =']),

ex('str-23','strings','MID in a Loop','hard',
`INPUT a string \`Text\`. Use a FOR loop and MID to OUTPUT each character on a separate line.`,
[t(['Hi'],['H','i']), t(['Cat'],['C','a','t'])],
['Loop from 1 to LENGTH(Text)', 'On each iteration, OUTPUT MID(Text, Index, 1)']),

ex('str-24','strings','Sentence Statistics','hard',
`INPUT a sentence into \`Sentence\`. OUTPUT its length on line 1, the sentence in uppercase on line 2, and the first character in lowercase on line 3.`,
[t(['Hello World'],['11','HELLO WORLD','h']), t(['AS'],['2','AS','a'])],
['Use LENGTH, UCASE, and a combination of MID and LCASE for the three outputs']),

ex('str-25','strings','MID: Extract Year from Date','hard',
`Assign \`DateStr ← "2025-09-15"\`. Extract and OUTPUT: the year (first 4 characters), the month (characters 6–7), and the day (characters 9–10) each on a separate line.`,
[t([],['2025','09','15'])],
['Year: LEFT(DateStr, 4) or MID(DateStr, 1, 4)', 'Month: MID(DateStr, 6, 2)', 'Day: MID(DateStr, 9, 2)']),

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTIONS & PROCEDURES  (35)
// ─────────────────────────────────────────────────────────────────────────────

ex('pro-01','procedures','Simple Procedure','easy',
`Write a PROCEDURE called \`Greet\` with no parameters that OUTPUTs \`Hello!\`. Then CALL it once.`,
[t([],['Hello!'])],
['Define the procedure with PROCEDURE Greet() and close it with ENDPROCEDURE', 'Call it with CALL Greet()'],
PROC_SCAFFOLD),

ex('pro-02','procedures','Procedure with Parameter (BYVAL)','easy',
`Write a PROCEDURE \`SayHello(BYVAL Name : STRING)\` that OUTPUTs \`Hello, \` followed by the name. INPUT a name and CALL the procedure.`,
[t(['Alice'],['Hello, Alice']), t(['World'],['Hello, World'])],
['BYVAL means the procedure gets a copy of the argument — changes inside do not affect the caller', 'Use the Name parameter inside the procedure with &'],
PROC_SCAFFOLD),

ex('pro-03','procedures','Procedure: Print Square','easy',
`Write a PROCEDURE \`PrintSquare(BYVAL Num : INTEGER)\` that OUTPUTs \`Num * Num\`. Call it with the value 6.`,
[t([],['36'])],
['The procedure receives Num as BYVAL (a copy) and computes Num * Num', 'Call it with CALL PrintSquare(6)'],
PROC_SCAFFOLD),

ex('pro-04','procedures','Procedure Called Multiple Times','medium',
`Write a PROCEDURE \`PrintLine\` that OUTPUTs ten dashes (\`----------\`). Call it three times.`,
[t([],['----------','----------','----------'])],
['Define the procedure once, then call it three separate times'],
PROC_SCAFFOLD),

ex('pro-05','procedures','Procedure with Two Parameters','medium',
`Write a PROCEDURE \`ShowInfo(BYVAL Name : STRING, BYVAL Age : INTEGER)\` that OUTPUTs a sentence like \`Alice is 16 years old\`. INPUT a name and an age, then CALL the procedure.`,
[t(['Alice','16'],['Alice is 16 years old']), t(['Bob','14'],['Bob is 14 years old'])],
['Use OUTPUT with comma-separated values inside the procedure to combine Name, "is", Age, and "years old"'],
PROC_SCAFFOLD),

ex('pro-06','procedures','BYREF: Increment a Counter','medium',
`Write a PROCEDURE \`Increment(BYREF Count : INTEGER)\` that adds 1 to \`Count\`. Declare \`Counter ← 0\`, call \`Increment\` three times, then OUTPUT \`Counter\`.`,
[t([],['3'])],
['BYREF passes a reference — changes made inside the procedure affect the original variable', 'CALL Increment(Counter) three times'],
PROC_SCAFFOLD),

ex('pro-07','procedures','BYREF: Double a Value','medium',
`Write a PROCEDURE \`Double(BYREF Num : INTEGER)\` that multiplies \`Num\` by 2. Declare \`Value ← 5\`, call \`Double(Value)\`, then OUTPUT \`Value\`.`,
[t([],['10'])],
['BYREF means the procedure modifies the original variable', 'Inside the procedure: Num ← Num * 2'],
PROC_SCAFFOLD),

ex('pro-08','procedures','BYREF: Swap Two Values','hard',
`Write a PROCEDURE \`Swap(BYREF Num1 : INTEGER, BYREF Num2 : INTEGER)\` that swaps the values of \`Num1\` and \`Num2\` using a temporary variable. Declare \`Num1 ← 10\` and \`Num2 ← 20\`, call the procedure, then OUTPUT both.`,
[t([],['20','10'])],
['Use BYREF for both parameters so the swap affects the caller\'s variables', 'Use a DECLARE Temp inside the procedure to hold one value during the swap'],
PROC_SCAFFOLD,
'',
requireBYREF),

ex('pro-09','procedures','Procedure in a Loop','medium',
`Write a PROCEDURE \`PrintNumber(BYVAL Num : INTEGER)\` that OUTPUTs the number. Use a FOR loop to call it for numbers 1, 2, and 3.`,
[t([],['1','2','3'])],
['Use a FOR loop and pass the loop variable as the argument'],
PROC_SCAFFOLD),

ex('pro-10','procedures','Procedure: Classify Number','hard',
`Write a PROCEDURE \`Classify(BYVAL Num : INTEGER)\` that OUTPUTs \`Positive\`, \`Negative\`, or \`Zero\`. INPUT a number and CALL it.`,
[t(['7'],['Positive']), t(['-3'],['Negative']), t(['0'],['Zero'])],
['Use IF statements inside the procedure to classify the number'],
PROC_SCAFFOLD),

ex('fun-01','procedures','Function: Add Two Numbers','easy',
`Write a FUNCTION \`Add(BYVAL Num1 : INTEGER, BYVAL Num2 : INTEGER) RETURNS INTEGER\` that returns Num1 + Num2. OUTPUT the result of calling \`Add(3, 4)\`.`,
[t([],['7'])],
['Define the function with FUNCTION ... RETURNS INTEGER and close with ENDFUNCTION', 'Use RETURN inside the function body'],
PROC_SCAFFOLD),

ex('fun-02','procedures','Function: Square','easy',
`Write a FUNCTION \`Square(BYVAL Num : INTEGER) RETURNS INTEGER\` that returns Num². OUTPUT \`Square(7)\`.`,
[t([],['49'])],
['The function body has a single RETURN statement that multiplies Num by itself'],
PROC_SCAFFOLD),

ex('fun-03','procedures','Function: Max of Two','medium',
`Write a FUNCTION \`MaxOf(BYVAL Num1 : INTEGER, BYVAL Num2 : INTEGER) RETURNS INTEGER\` that returns the larger value. INPUT two integers, OUTPUT the max.`,
[t(['8','3'],['8']), t(['2','9'],['9']), t(['5','5'],['5'])],
['Use IF inside the function to compare Num1 and Num2, returning the larger value'],
PROC_SCAFFOLD),

ex('fun-04','procedures','Function: IsEven','medium',
`Write a FUNCTION \`IsEven(BYVAL Num : INTEGER) RETURNS BOOLEAN\` that returns TRUE if Num is even, FALSE otherwise. INPUT Num, OUTPUT the result.`,
[t(['4'],['TRUE']), t(['7'],['FALSE'])],
['Use MOD inside the function — if the remainder after dividing by 2 equals 0, return TRUE'],
PROC_SCAFFOLD),

ex('fun-05','procedures','Function: Absolute Value','medium',
`Write a FUNCTION \`AbsVal(BYVAL Num : REAL) RETURNS REAL\` that returns the absolute value. Test it with -5.5 and OUTPUT the result.`,
[t([],['-5.5'.replace('-','')])],
['If Num < 0 then return Num * -1, otherwise return Num'],
PROC_SCAFFOLD),

ex('fun-06','procedures','Function: String Length Check','medium',
`Write a FUNCTION \`IsLong(BYVAL Text : STRING) RETURNS BOOLEAN\` that returns TRUE if the string has more than 5 characters. INPUT a word, OUTPUT the result.`,
[t(['Hello'],['FALSE']), t(['Cambridge'],['TRUE'])],
['Use LENGTH(Text) inside the function and compare with 5'],
PROC_SCAFFOLD),

ex('fun-07','procedures','Function: InitialOf','medium',
`Write a FUNCTION \`InitialOf(BYVAL Name : STRING) RETURNS STRING\` that returns the first character of Name in uppercase. INPUT a name, OUTPUT the result.`,
[t(['alice'],['A']), t(['Bob'],['B'])],
['Use MID(Name, 1, 1) to extract the first character', 'Apply UCASE before returning'],
PROC_SCAFFOLD),

ex('fun-08','procedures','Function Calling Another Function','hard',
`Write a FUNCTION \`Min(BYVAL Num1 : INTEGER, BYVAL Num2 : INTEGER) RETURNS INTEGER\` and a FUNCTION \`MinOfThree(BYVAL Num1 : INTEGER, BYVAL Num2 : INTEGER, BYVAL Num3 : INTEGER) RETURNS INTEGER\` that uses \`Min\`. INPUT three integers, OUTPUT the smallest.`,
[t(['3','1','4'],['1']), t(['9','5','7'],['5'])],
['MinOfThree returns Min(Min(Num1, Num2), Num3)', 'Define Min first, then MinOfThree'],
PROC_SCAFFOLD),

ex('fun-09','procedures','Procedure with BYVAL and BYREF','hard',
`Write a PROCEDURE \`ScaleAndCount(BYVAL Scale : INTEGER, BYREF Counter : INTEGER)\` that adds \`Scale * 2\` to \`Counter\`. Declare \`Total ← 0\`. Call the procedure with Scale=5 twice and Scale=3 once. OUTPUT \`Total\`.`,
[t([],['26'])],
['Counter is BYREF so changes inside persist; Scale is BYVAL so the caller\'s value is unchanged', '5*2 + 5*2 + 3*2 = 10 + 10 + 6 = 26'],
PROC_SCAFFOLD,
'',
requireBYREF),

ex('fun-10','procedures','Function: Grade Letter','medium',
`Write a FUNCTION \`Grade(BYVAL Mark : INTEGER) RETURNS STRING\` that returns the grade letter: A (≥70), B (≥55), C (≥40), or U. INPUT a mark, OUTPUT the grade.`,
[t(['80'],['A']), t(['60'],['B']), t(['45'],['C']), t(['30'],['U'])],
['Use nested IF statements inside the function to determine the grade', 'Return the grade string at the appropriate branch'],
PROC_SCAFFOLD),

ex('fun-11','procedures','Function: Power','hard',
`Write a FUNCTION \`Power(BYVAL Base : INTEGER, BYVAL Exponent : INTEGER) RETURNS INTEGER\` that calculates Base raised to the power Exponent using a FOR loop. INPUT both values, OUTPUT the result.`,
[t(['2','8'],['256']), t(['3','4'],['81']), t(['5','1'],['5'])],
['Initialise Result ← 1 inside the function', 'Multiply Result by Base Exponent times using a FOR loop'],
PROC_SCAFFOLD),

ex('fun-12','procedures','Procedure: Print Table','medium',
`Write a PROCEDURE \`PrintTable(BYVAL Times : INTEGER)\` that outputs the multiplication table for Times from 1 to 5, formatted as \`3 x 1 = 3\`. INPUT a number and CALL it.`,
[t(['3'],['3 x 1 = 3','3 x 2 = 6','3 x 3 = 9','3 x 4 = 12','3 x 5 = 15'])],
['Use a FOR loop inside the procedure from 1 to 5'],
PROC_SCAFFOLD),

ex('fun-13','procedures','Function: Count Digits','hard',
`Write a FUNCTION \`CountDigits(BYVAL Num : INTEGER) RETURNS INTEGER\` that returns how many digits are in Num (assume positive). INPUT Num, OUTPUT the digit count.`,
[t(['12345'],['5']), t(['7'],['1']), t(['1000'],['4'])],
['Use a WHILE loop inside the function: while Num > 0, divide by 10 using DIV and increment count'],
PROC_SCAFFOLD),

ex('fun-14','procedures','BYREF: Accumulate Total','hard',
`Write a PROCEDURE \`AddToTotal(BYVAL Amount : INTEGER, BYREF RunningTotal : INTEGER)\` that adds \`Amount\` to \`RunningTotal\`. Declare \`Total ← 0\`. INPUT 5 integers and call the procedure for each. OUTPUT \`Total\`.`,
[t(['10','20','30','40','50'],['150']), t(['1','2','3','4','5'],['15'])],
['BYREF ensures each call updates the same Total variable', 'Use a FOR loop to read 5 inputs and call the procedure each time'],
PROC_SCAFFOLD,
'',
requireBYREF),

ex('fun-15','procedures','Function: Celsius to Fahrenheit','easy',
`Write a FUNCTION \`CtoF(BYVAL Celsius : REAL) RETURNS REAL\` that converts using the formula F = (C × 9/5) + 32. INPUT a temperature, OUTPUT the result.`,
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
['A prime number is greater than 1 and has no divisors other than 1 and itself', 'Use a FOR loop from 2 to Num - 1, checking if Num MOD Counter = 0'],
PROC_SCAFFOLD),

ex('fun-18','procedures','Procedure: Validate and Report','hard',
`Write a PROCEDURE \`Validate(BYVAL Score : INTEGER, BYREF IsValid : BOOLEAN)\` that sets \`IsValid\` to TRUE if 0 ≤ Score ≤ 100, otherwise FALSE. INPUT a score, call the procedure, then OUTPUT \`Valid\` or \`Invalid\`.`,
[t(['85'],['Valid']), t(['-1'],['Invalid']), t(['100'],['Valid'])],
['BYREF IsValid lets the procedure set the caller\'s variable', 'Inside the procedure: IsValid ← (Score >= 0 AND Score <= 100)'],
PROC_SCAFFOLD,
'',
requireBYREF),

ex('fun-19','procedures','Function: Sum of Digits','hard',
`Write a FUNCTION \`SumDigits(BYVAL Num : INTEGER) RETURNS INTEGER\` that returns the sum of all digits in Num (positive integers only). INPUT Num, OUTPUT the sum.`,
[t(['123'],['6']), t(['9999'],['36']), t(['5'],['5'])],
['Use a WHILE loop: while Num > 0, add Num MOD 10 to the sum, then Num ← Num DIV 10'],
PROC_SCAFFOLD),

ex('fun-20','procedures','Function: Repeat String','hard',
`Write a FUNCTION \`RepeatStr(BYVAL Str : STRING, BYVAL Times : INTEGER) RETURNS STRING\` that returns \`Str\` repeated \`Times\` times. OUTPUT \`RepeatStr("AS", 3)\`.`,
[t([],['ASASAS'])],
['Initialise Result ← "" inside the function', 'Use a FOR loop to concatenate Str to Result Times times', 'Return Result'],
PROC_SCAFFOLD),

ex('fun-21','procedures','Mixed BYVAL and BYREF Parameters','hard',
`Write a PROCEDURE \`MinMax(BYVAL Num1 : INTEGER, BYVAL Num2 : INTEGER, BYREF MinVal : INTEGER, BYREF MaxVal : INTEGER)\` that sets MinVal and MaxVal to the smaller and larger of Num1/Num2. INPUT two integers, call the procedure, OUTPUT MinVal then MaxVal.`,
[t(['8','3'],['3','8']), t(['5','5'],['5','5'])],
['Use IF inside the procedure: if Num1 <= Num2 then MinVal ← Num1, MaxVal ← Num2, else swap them'],
PROC_SCAFFOLD,
'',
requireBYREF),

ex('fun-22','procedures','Function: Factorial','hard',
`Write a FUNCTION \`Factorial(BYVAL Num : INTEGER) RETURNS INTEGER\` that returns Num!. OUTPUT \`Factorial(6)\`.`,
[t([],['720'])],
['Initialise Result ← 1 inside the function', 'Use a FOR loop from 1 to Num, multiplying Result by each counter'],
PROC_SCAFFOLD),

ex('fun-23','procedures','Function with BYREF Output Parameter','hard',
`Write a PROCEDURE \`ParseInt(BYVAL Text : STRING, BYREF Value : INTEGER, BYREF Success : BOOLEAN)\` that attempts to convert Text to an integer. If the string equals a valid number (check using STR_TO_NUM and NUM_TO_STR comparison), set Value and Success ← TRUE, else set Success ← FALSE. Test with "42" and output Value if Success is TRUE.`,
[t([],['42'])],
['Use STR_TO_NUM to get the numeric value and NUM_TO_STR to convert back', 'If NUM_TO_STR(STR_TO_NUM(Text)) = Text, the conversion succeeded'],
PROC_SCAFFOLD,
'DECLARE ParseText : STRING\nParseText ← "42"\n',
requireBYREF),

ex('fun-24','procedures','Procedure: Print Star Row','medium',
`Write a PROCEDURE \`StarRow(BYVAL Width : INTEGER)\` that outputs a row of \`Width\` asterisks as a single string. Call it with 5.`,
[t([],['*****'])],
['Build the row inside the procedure using a FOR loop and & concatenation', 'OUTPUT the completed row string at the end of the procedure'],
PROC_SCAFFOLD),

ex('fun-25','procedures','Function: String Contains Digit','hard',
`Write a FUNCTION \`ContainsDigit(BYVAL Text : STRING) RETURNS BOOLEAN\` that returns TRUE if Text contains any digit character (0–9). INPUT a string, OUTPUT the result.`,
[t(['Pass123'],['TRUE']), t(['Cambridge'],['FALSE'])],
['Use a FOR loop from 1 to LENGTH(Text)', 'Extract each character with MID(Text, Index, 1)', 'Compare it to "0","1",...,"9" using OR'],
PROC_SCAFFOLD),

ex('fun-26','procedures','Procedure: Report Card','hard',
`Write a PROCEDURE \`ReportCard(BYVAL Name : STRING, BYVAL Score : INTEGER)\` that outputs: the name, the score, and the grade (A/B/C/U using the 70/55/40 boundary). INPUT name and score, then call it.`,
[t(['Alice','75'],['Alice','75','A']), t(['Bob','45'],['Bob','45','C'])],
['Call your Grade function inside ReportCard, or use nested IF', 'Three separate OUTPUT statements inside the procedure'],
PROC_SCAFFOLD),

ex('fun-27','procedures','Function: Hypotenuse Approximation','hard',
`Write a FUNCTION \`Hypotenuse(BYVAL SideA : REAL, BYVAL SideB : REAL) RETURNS REAL\` that returns the hypotenuse using the approximation: iterate 20 times starting with \`Guess ← SideA\`, updating \`Guess ← (Guess + (SideA*SideA + SideB*SideB) / Guess) / 2\`. Return Guess rounded to 2 decimal places. Test with SideA=3, SideB=4 (expected: 5.0).`,
[t([],['5'])],
['Initialise Guess ← SideA inside the function', 'Apply the iterative update 20 times in a FOR loop', 'Use ROUND(Guess, 2) before returning'],
PROC_SCAFFOLD,
''),

ex('fun-28','procedures','BYREF: Reset Counter','medium',
`Write a PROCEDURE \`ResetCounter(BYREF Counter : INTEGER)\` that sets Counter to 0. Declare \`Score ← 99\`, call \`ResetCounter(Score)\`, then OUTPUT \`Score\`.`,
[t([],['0'])],
['BYREF means the procedure changes the original variable', 'Inside: Counter ← 0'],
PROC_SCAFFOLD,
'',
requireBYREF),

ex('fun-29','procedures','Function: Is Uppercase','medium',
`Write a FUNCTION \`IsUpper(BYVAL Ch : STRING) RETURNS BOOLEAN\` that returns TRUE if the first character of Ch is an uppercase letter (A–Z). INPUT a single character, OUTPUT the result.`,
[t(['A'],['TRUE']), t(['z'],['FALSE']), t(['M'],['TRUE'])],
['Compare UCASE(Ch) = Ch to check if the character is already uppercase'],
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

ex('fun-32','procedures','Procedure with Default Behaviour via BYVAL','medium',
`Write a PROCEDURE \`ShowDouble(BYVAL Num : INTEGER)\` that prints \`Num * 2\` but does NOT modify the caller\'s variable. Declare \`Num ← 5\`, call \`ShowDouble(Num)\`, then OUTPUT Num again. Num should still be 5.`,
[t([],['10','5'])],
['BYVAL passes a copy — the original variable is never modified', 'Call once to output 10, then OUTPUT Num (still 5)'],
PROC_SCAFFOLD),

ex('fun-33','procedures','Procedure: Print Diamond','hard',
`Write a PROCEDURE \`Diamond(BYVAL Size : INTEGER)\` that prints a diamond of width \`2*Size - 1\`. For Size=3, output 5 lines of spaces and asterisks. Call it with Size=2.`,
[t([],['*','***','*'])],
['Row r (1-based from 1 to 2*Size-1): asterisks = 2*abs(r-Size)+... use logic for expanding then contracting', 'Row 1: 1 star, Row 2 (middle): 3 stars, Row 3: 1 star for Size=2'],
PROC_SCAFFOLD),

ex('fun-34','procedures','Function: String to Integer (Manual)','hard',
`Write a FUNCTION \`ToInt(BYVAL NumStr : STRING) RETURNS INTEGER\` that converts a string of digit characters to an integer without using STR_TO_NUM. Use MID to extract each character and the character\'s ASCII value. Hint: use UCASE/LCASE comparison and treat "0"–"9" as 0–9 using STR_TO_NUM on single digits. Call it with "123" and OUTPUT the result.`,
[t([],['123'])],
['Loop through each character of NumStr', 'Convert each digit character to its integer value using STR_TO_NUM(MID(NumStr, Index, 1))', 'Accumulate: Result ← Result * 10 + digitValue'],
PROC_SCAFFOLD),

ex('fun-35','procedures','Function: Validate Email','hard',
`Write a FUNCTION \`HasAtSign(BYVAL Email : STRING) RETURNS BOOLEAN\` that returns TRUE if the string contains exactly one "@" character. INPUT an email address, OUTPUT the result.`,
[t(['user@example.com'],['TRUE']), t(['notanemail'],['FALSE']), t(['a@b@c'],['FALSE'])],
['Loop through the string counting occurrences of "@"', 'Return TRUE only if the count equals 1'],
PROC_SCAFFOLD),

// ─────────────────────────────────────────────────────────────────────────────
// ARRAYS  (20)
// ─────────────────────────────────────────────────────────────────────────────

ex('arr-01','arrays','Declare and Populate a 1D Array','easy',
`Declare an INTEGER array \`Scores : ARRAY[1:5] OF INTEGER\`. Assign values 10, 20, 30, 40, 50 to positions 1–5. OUTPUT all five elements.`,
[t([],['10','20','30','40','50'])],
['Use Scores[1] ← 10, Scores[2] ← 20, etc.', 'Use five separate OUTPUT statements or a FOR loop']),

ex('arr-02','arrays','Array: Sum and Average','medium',
`Declare \`Data : ARRAY[1:5] OF INTEGER\` with values 4, 8, 15, 16, 23. Calculate the sum and average. OUTPUT both (average as a REAL).`,
[t([],['66','13.2'])],
['Accumulate the sum using a FOR loop', 'Divide by 5 for the average — use REAL division not DIV']),

ex('arr-03','arrays','Array: INPUT and OUTPUT','easy',
`INPUT 4 integers into an array \`Values : ARRAY[1:4] OF INTEGER\`. OUTPUT all four.`,
[t(['3','1','4','2'],['3','1','4','2'])],
['Use a FOR loop for both INPUT and OUTPUT']),

ex('arr-04','arrays','Array: Find Maximum','medium',
`INPUT 5 integers into an array \`Data : ARRAY[1:5] OF INTEGER\`. Find and OUTPUT the maximum.`,
[t(['3','7','1','9','2'],['9']), t(['5','5','5','5','5'],['5'])],
['Initialise Max ← Data[1] before the loop', 'Update Max when a larger element is found']),

ex('arr-05','arrays','Array: Reverse','medium',
`Declare \`Letters : ARRAY[1:5] OF STRING\` with values "A", "B", "C", "D", "E". OUTPUT the array in reverse order using a FOR loop with STEP -1.`,
[t([],['E','D','C','B','A'])],
['FOR Index ← 5 TO 1 STEP -1 ... OUTPUT Letters[Index]']),

ex('arr-06','arrays','Array: Count Elements in Range','medium',
`INPUT 6 integers into an array. INPUT a lower bound \`Lo\` and upper bound \`Hi\`. Count and OUTPUT how many elements are in the range Lo to Hi (inclusive).`,
[t(['5','2','8','3','9','1','3','7'],['2']),t(['1','2','3','4','5','6','1','6'],['6'])],
['Use AND to check both the lower and upper bounds in a single IF condition']),

ex('arr-07','arrays','Array: Bubble Sort (Ascending)','hard',
`INPUT 5 integers into an array \`Data : ARRAY[1:5] OF INTEGER\`. Sort them in ascending order using bubble sort. OUTPUT all 5 values (one per line).`,
[t(['5','3','8','1','4'],['1','3','4','5','8']), t(['9','7','5','3','1'],['1','3','5','7','9'])],
['Bubble sort uses nested loops: outer from 1 to 4, inner comparing adjacent elements', 'Swap adjacent elements when out of order using a Temp variable']),

ex('arr-08','arrays','Array: Linear Search','medium',
`Declare \`Data : ARRAY[1:6] OF INTEGER\` with values 3, 7, 1, 9, 4, 6. INPUT a target. OUTPUT its 1-based position, or -1 if not found.`,
[t(['9'],['4']), t(['7'],['2']), t(['99'],['-1'])],
['Initialise Position ← -1 before the loop', 'Update Position to the current index when the target is found']),

ex('arr-09','arrays','2D Array: Fill and Display','medium',
`Declare \`Grid : ARRAY[1:3, 1:3] OF INTEGER\`. Use nested FOR loops to assign \`Grid[Row, Col] ← Row * Col\`. Then OUTPUT all 9 values row by row using nested loops.`,
[t([],['1','2','3','2','4','6','3','6','9'])],
['Use nested FOR loops — outer for rows, inner for columns', 'Grid[Row, Col] ← Row * Col gives a multiplication table']),

ex('arr-10','arrays','2D Array: Row Sum','hard',
`Declare \`Matrix : ARRAY[1:3, 1:3] OF INTEGER\`. Fill row 1 with 1,2,3; row 2 with 4,5,6; row 3 with 7,8,9. OUTPUT the sum of each row on separate lines.`,
[t([],['6','15','24'])],
['Use a nested loop: for each row, sum all three column values', 'OUTPUT the row sum after the inner loop']),

ex('arr-11','arrays','Array: Copy','medium',
`Declare \`Original : ARRAY[1:4] OF INTEGER\` with values 5, 10, 15, 20. Copy it to \`Copy : ARRAY[1:4] OF INTEGER\` using a FOR loop. Change \`Original[1] ← 99\`. OUTPUT all four elements of \`Copy\`.`,
[t([],['5','10','15','20'])],
['Copy each element individually in a FOR loop', 'Changing Original after copying should not affect Copy']),

ex('arr-12','arrays','Array: Count Positive/Negative/Zero','hard',
`INPUT 8 integers into an array. Count positives, negatives, and zeros. OUTPUT all three counts.`,
[t(['3','-2','0','5','-1','-3','0','7'],['3','3','2']), t(['0','0','0','0','0','0','0','0'],['0','0','8'])],
['Use three counter variables and increment the appropriate one for each element']),

ex('arr-13','arrays','Array: Remove Duplicates (Mark)','hard',
`Declare \`Data : ARRAY[1:6] OF INTEGER\` with values 3, 5, 3, 7, 5, 9. Count and OUTPUT how many unique values there are. (Hint: for each element, check if it appeared in any earlier position.)`,
[t([],['4'])],
['For each element at position i, use a nested inner loop from 1 to i-1 to check for earlier occurrences', 'Only count the element if no match was found in earlier positions']),

ex('arr-14','arrays','Array: Frequency Count','hard',
`INPUT 10 integers (each between 1 and 5 inclusive) into an array \`Rolls\`. Count how many times each value 1–5 appears. OUTPUT the five frequencies.`,
[t(['1','2','3','1','2','1','4','5','3','2'],['3','3','2','1','1'])],
['Declare a Frequency array of size 5', 'For each element in Rolls, increment Frequency[element]']),

ex('arr-15','arrays','Array: Parallel Arrays','medium',
`Declare \`Names : ARRAY[1:4] OF STRING\` with "Alice","Bob","Charlie","Diana" and \`Marks : ARRAY[1:4] OF INTEGER\` with 85, 62, 91, 74. INPUT a name. OUTPUT the corresponding mark, or \`Not found\`.`,
[t(['Charlie'],['91']), t(['Alice'],['85']), t(['Eve'],['Not found'])],
['Loop through Names to find the matching index', 'Use that same index to look up the corresponding Marks value']),

ex('arr-16','arrays','Array: Shift Left','hard',
`Declare \`Data : ARRAY[1:5] OF INTEGER\` with values 10, 20, 30, 40, 50. Shift all elements one position to the left (element 1 is discarded, element 5 becomes 0). OUTPUT all 5 elements.`,
[t([],['20','30','40','50','0'])],
['Use a FOR loop from 1 to 4: Data[i] ← Data[i+1]', 'After the loop, set Data[5] ← 0']),

ex('arr-17','arrays','2D Array: Diagonal Sum','hard',
`Declare \`Grid : ARRAY[1:4, 1:4] OF INTEGER\`. Use nested FOR loops to assign \`Grid[Row, Col] ← Row + Col\`. OUTPUT the sum of the main diagonal (where Row = Col).`,
[t([],['20'])],
['The diagonal elements are Grid[1,1]=2, Grid[2,2]=4, Grid[3,3]=6, Grid[4,4]=8, sum = 20']),

ex('arr-18','arrays','Array: Second Largest','hard',
`INPUT 5 integers into an array. Find and OUTPUT the second largest value (assume all values are distinct).`,
[t(['3','7','1','9','4'],['7']), t(['5','2','8','1','6'],['6'])],
['Find the maximum first', 'Then find the maximum of all remaining elements (those not equal to the maximum)']),

ex('arr-19','arrays','Array: Rotate Right','hard',
`Declare \`Data : ARRAY[1:5] OF INTEGER\` with values 1, 2, 3, 4, 5. Rotate all elements one position to the right (last element wraps to first). OUTPUT all 5 elements.`,
[t([],['5','1','2','3','4'])],
['Save Data[5] into a Temp variable', 'Shift elements right: for i from 5 down to 2, Data[i] ← Data[i-1]', 'Set Data[1] ← Temp']),

ex('arr-20','arrays','Array: Binary Search','hard',
`Declare a sorted array \`Data : ARRAY[1:8] OF INTEGER\` with values 2, 5, 8, 12, 16, 23, 38, 56. INPUT a target. Use binary search to OUTPUT the 1-based position, or -1 if not found.`,
[t(['12'],['4']), t(['2'],['1']), t(['99'],['-1']), t(['56'],['8'])],
['Initialise Low ← 1, High ← 8, Position ← -1', 'Repeat: Mid ← (Low + High) DIV 2; compare Data[Mid] to Target; narrow the range', 'Stop when Low > High']),

// ─────────────────────────────────────────────────────────────────────────────
// RECORDS  (15)
// ─────────────────────────────────────────────────────────────────────────────

ex('rec-01','records','Define and Use a Record','easy',
`Define a record type called \`StudentRecord\` with fields \`Name : STRING\` and \`Age : INTEGER\`. Declare a variable \`Student : StudentRecord\`. Assign Name ← "Alice" and Age ← 16. OUTPUT both fields on separate lines.`,
[t([],['Alice','16'])],
['Use TYPE StudentRecord ... ENDTYPE to define the record', 'Access fields with the dot notation: Student.Name ← "Alice"']),

ex('rec-02','records','Record: Three Fields','easy',
`Define a record type \`CarRecord\` with fields \`Make : STRING\`, \`Model : STRING\`, and \`Year : INTEGER\`. Declare \`Car : CarRecord\`. Assign Make ← "Toyota", Model ← "Corolla", Year ← 2020. OUTPUT all three fields.`,
[t([],['Toyota','Corolla','2020'])],
['Define CarRecord with three DECLARE fields inside TYPE...ENDTYPE', 'Access each field with Car.Make, Car.Model, Car.Year']),

ex('rec-03','records','Record: Input and Output','medium',
`Define a \`PersonRecord\` type with \`Name : STRING\` and \`Score : INTEGER\`. INPUT a name and score from the user. Store them in a record variable \`Person\`. OUTPUT the name and score.`,
[t(['Bob','92'],['Bob','92'])],
['INPUT into Person.Name and Person.Score directly', 'OUTPUT Person.Name and Person.Score']),

ex('rec-04','records','Record: Calculated Field','medium',
`Define a \`RectangleRecord\` type with \`Width : REAL\` and \`Height : REAL\`. Declare \`Rect : RectangleRecord\`. Assign Width ← 5.0 and Height ← 3.0. Calculate the area and OUTPUT it.`,
[t([],['15'])],
['Access the fields with Rect.Width and Rect.Height', 'OUTPUT Rect.Width * Rect.Height']),

ex('rec-05','records','Record: Update a Field','medium',
`Define a \`CounterRecord\` type with \`Value : INTEGER\` and \`Label : STRING\`. Declare \`Counter : CounterRecord\`. Assign Value ← 0 and Label ← "Clicks". Increment Value three times. OUTPUT Label then Value.`,
[t([],['Clicks','3'])],
['Each increment: Counter.Value ← Counter.Value + 1', 'OUTPUT Counter.Label then Counter.Value separately']),

ex('rec-06','records','Array of Records','hard',
`Define a \`StudentRecord\` type with \`Name : STRING\` and \`Mark : INTEGER\`. Declare \`Class : ARRAY[1:3] OF StudentRecord\`. Assign: Class[1].Name="Alice",Mark=85; Class[2].Name="Bob",Mark=72; Class[3].Name="Charlie",Mark=91. OUTPUT all names and marks.`,
[t([],['Alice','85','Bob','72','Charlie','91'])],
['Access array-of-record fields as: Class[Index].Name and Class[Index].Mark', 'Use a FOR loop to output all entries']),

ex('rec-07','records','Array of Records: Find Highest Mark','hard',
`Using the \`StudentRecord\` type (Name : STRING, Mark : INTEGER) from the previous exercise, declare an array \`Class : ARRAY[1:4] OF StudentRecord\`. Populate it with Alice/80, Bob/95, Charlie/67, Diana/88. Find and OUTPUT the name of the student with the highest mark.`,
[t([],['Bob'])],
['Initialise BestName ← Class[1].Name and BestMark ← Class[1].Mark', 'Compare each Class[i].Mark in a FOR loop; update BestName and BestMark when a higher mark is found']),

ex('rec-08','records','Record in a Procedure','hard',
`Define a \`PointRecord\` type with \`X : REAL\` and \`Y : REAL\`. Write a PROCEDURE \`PrintPoint(BYVAL Point : PointRecord)\` that OUTPUTs X and Y on separate lines. Declare a point at (3.5, 7.0) and call the procedure.`,
[t([],['3.5','7.0'])],
['Pass the record as BYVAL to the procedure', 'Inside the procedure, access Point.X and Point.Y'],
PROC_SCAFFOLD),

ex('rec-09','records','Record with BYREF in Procedure','hard',
`Define a \`ScoreRecord\` type with \`Value : INTEGER\` and \`Bonus : INTEGER\`. Write a PROCEDURE \`AddBonus(BYREF Score : ScoreRecord, BYVAL Extra : INTEGER)\` that adds Extra to Score.Bonus. Declare a record with Value=100, Bonus=0. Call AddBonus with Extra=15. OUTPUT both fields.`,
[t([],['100','15'])],
['BYREF means the procedure modifies the original record', 'Inside: Score.Bonus ← Score.Bonus + Extra'],
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
`Define a \`ContactRecord\` type with \`Name : STRING\` and \`Phone : STRING\`. Declare two variables \`Contact1\` and \`Contact2\`. Assign Contact1.Name="Alice", Contact1.Phone="01234". Copy both fields to Contact2. OUTPUT Contact2\'s fields.`,
[t([],['Alice','01234'])],
['Copy fields individually: Contact2.Name ← Contact1.Name', 'Records cannot be assigned as a whole — copy each field separately']),

ex('rec-13','records','Record: Search by Field','hard',
`Define a \`ProductRecord\` type with \`Name : STRING\` and \`Price : REAL\`. Declare \`Catalogue : ARRAY[1:4] OF ProductRecord\`. Populate with Pen/1.5, Book/12.0, Ruler/0.75, Bag/25.0. INPUT a product name. OUTPUT its price or \`Not found\`.`,
[t(['Book'],['12']), t(['Ruler'],['0.75']), t(['Mouse'],['Not found'])],
['Loop through Catalogue searching for a matching Name field', 'If found, OUTPUT the Price field; if the loop ends without a match, OUTPUT "Not found"']),

ex('rec-14','records','Record: Swap Two Records','hard',
`Define a \`DataRecord\` type with \`Id : INTEGER\` and \`Value : INTEGER\`. Declare two records: \`Rec1\` (Id=1, Value=100) and \`Rec2\` (Id=2, Value=200). Swap their fields using a third record \`Temp\`. OUTPUT Id and Value of both records after swapping.`,
[t([],['2','200','1','100'])],
['Declare Temp : DataRecord', 'Copy Rec1\'s fields to Temp, then Rec2\'s to Rec1, then Temp\'s to Rec2']),

ex('rec-15','records','Array of Records: Sort by Field','hard',
`Define a \`StudentRecord\` type with \`Name : STRING\` and \`Mark : INTEGER\`. Declare \`Class : ARRAY[1:4] OF StudentRecord\`. Populate with Alice/70, Dave/85, Bob/60, Carol/90. Sort by Mark ascending using bubble sort on the array (swap both fields when out of order). OUTPUT each name and mark after sorting.`,
[t([],['Bob','60','Alice','70','Dave','85','Carol','90'])],
['Bubble sort: compare Class[i].Mark and Class[i+1].Mark', 'When out of order, swap both the Name and Mark fields using a temporary record or two temporary variables']),

// ─────────────────────────────────────────────────────────────────────────────
// FILE HANDLING  (20)
// ─────────────────────────────────────────────────────────────────────────────

ex('fil-01','files','Write then Read a File','easy',
`Use \`OPENFILE "data.txt" FOR WRITE\` to open the file. Use \`WRITEFILE\` to write the line \`"Hello, World!"\`. Use \`CLOSEFILE\` to close it. Re-open the file using \`OPENFILE "data.txt" FOR READ\`. Use \`READFILE\` to read the line into a variable, then \`CLOSEFILE\` it and OUTPUT the variable.`,
[t([],['Hello, World!'])],
['OPENFILE before reading or writing; CLOSEFILE when done', 'WRITEFILE writes a line; READFILE reads a line into a variable']),

ex('fil-02','files','Write Multiple Lines','medium',
`Open \`"test.txt"\` for WRITE. Use \`WRITEFILE\` to write \`"Line 1"\`, \`"Line 2"\`, \`"Line 3"\`. CLOSEFILE. Re-open FOR READ. Use \`READFILE\` to read each line and OUTPUT them. CLOSEFILE when done.`,
[t([],['Line 1','Line 2','Line 3'])],
['Write all three lines in FOR WRITE mode, then CLOSEFILE', 'Re-open FOR READ, use READFILE for each line']),

ex('fil-03','files','Read with WHILE NOT EOF','medium',
`Open \`"colours.txt"\` FOR WRITE. Write \`"red"\`, \`"green"\`, \`"blue"\` (one per line). CLOSEFILE. Re-open FOR READ. Use a \`WHILE NOT EOF\` loop to READFILE each word and OUTPUT it in uppercase. CLOSEFILE when done.`,
[t([],['RED','GREEN','BLUE'])],
['WHILE NOT EOF("colours.txt") (no DO keyword in AS 9618)', 'Apply UCASE() to each string read before outputting']),

ex('fil-04','files','Count Lines with EOF','medium',
`Open \`"five.txt"\` FOR WRITE. Write \`"A"\`, \`"B"\`, \`"C"\`, \`"D"\`, \`"E"\`. CLOSEFILE. Re-open FOR READ. Use a WHILE NOT EOF loop to count the lines. CLOSEFILE, then OUTPUT the count.`,
[t([],['5'])],
['Use WHILE NOT EOF("five.txt") and increment a counter each time READFILE is called']),

ex('fil-05','files','Read Until EOF and Output','medium',
`Open \`"fruit.txt"\` FOR WRITE. Write \`"Apple"\`, \`"Banana"\`, \`"Cherry"\`. CLOSEFILE. Re-open FOR READ. Use WHILE NOT EOF to READFILE and OUTPUT each line. CLOSEFILE when done.`,
[t([],['Apple','Banana','Cherry'])],
['Use a WHILE loop — read one line per iteration and output it immediately']),

ex('fil-06','files','Append to File','hard',
`Open \`"greet.txt"\` FOR WRITE. Write \`"Hello"\`. CLOSEFILE. Re-open FOR APPEND. Write \`"World"\`. CLOSEFILE. Re-open FOR READ. OUTPUT both lines. CLOSEFILE when done.`,
[t([],['Hello','World'])],
['WRITE mode clears the file; APPEND mode adds to the end', 'Re-open FOR READ to output both lines']),

ex('fil-07','files','Write Input Data to File','hard',
`INPUT 3 strings from the user. Open \`"names.txt"\` FOR WRITE and WRITEFILE each string. CLOSEFILE. Re-open FOR READ. READFILE and OUTPUT each line. CLOSEFILE when done.`,
[t(['Alice','Bob','Charlie'],['Alice','Bob','Charlie'])],
['Use a FOR loop to INPUT and WRITEFILE each string', 'CLOSEFILE, then re-open FOR READ and READFILE each line']),

ex('fil-08','files','File: Largest Value','hard',
`Open \`"vals.txt"\` FOR WRITE. Write integers 7, 3, 9, 1, 5 (one per line). CLOSEFILE. Re-open FOR READ. Use WHILE NOT EOF to READFILE each value and track the largest. CLOSEFILE, then OUTPUT the largest.`,
[t([],['9'])],
['Initialise Max before the loop — set it when reading the first value or initialise to a very small number', 'Update Max inside the loop when a larger value is found']),

ex('fil-09','files','File: Count Even Numbers','hard',
`Open \`"nums.txt"\` FOR WRITE. Write the numbers 1 to 8 (one per line). CLOSEFILE. Re-open FOR READ. Use WHILE NOT EOF to READFILE each number and count how many are even. CLOSEFILE, then OUTPUT the count.`,
[t([],['4'])],
['Use MOD 2 = 0 to test if each value is even', 'Output the count after CLOSEFILE']),

ex('fil-10','files','CSV: Write and Read a Record','hard',
`Create a CSV record by concatenating a name, a comma, and a score: \`"Alice,85"\`. Open \`"scores.csv"\` FOR WRITE. WRITEFILE the combined string. CLOSEFILE. Re-open FOR READ. READFILE into \`Record\`. CLOSEFILE. Use MID to extract the name (first 5 chars) and output it. Then output the score portion.`,
[t([],['Alice','85'])],
['Write the combined string "Alice,85" to the file as one line', 'Read it back into Record', 'Name: LEFT(Record, 5) or MID(Record, 1, 5)', 'Score: MID(Record, 7, 2) (after the comma at position 6)']),

ex('fil-11','files','CSV: Write Multiple Records','hard',
`Declare two strings: \`"Alice,85"\` and \`"Bob,72"\`. Open \`"class.csv"\` FOR WRITE. WRITEFILE both. CLOSEFILE. Re-open FOR READ. Use WHILE NOT EOF to READFILE each line and OUTPUT the name portion (characters before the comma — 5 chars for Alice, 3 for Bob).`,
[t([],['Alice','Bob'])],
['Write each record as a single string with a comma separator', 'When reading back, use MID or LEFT to extract the name', 'For "Alice,85" the name is 5 characters; use LENGTH to find the comma if needed']),

ex('fil-12','files','File: Two Files','hard',
`Write the string \`"Hello"\` to \`file1.txt\` and the string \`"World"\` to \`file2.txt\`. Read the contents back from both files and OUTPUT the two values joined by a space.`,
[t([],['Hello World'])],
['Open, write, and close each file separately', 'Read each file into separate variables using READFILE', 'Join the two values with & " " & for the final output']),

ex('fil-13','files','File: Reverse Lines','hard',
`Open \`"letters.txt"\` FOR WRITE. Write \`"A"\`, \`"B"\`, \`"C"\`, \`"D"\`. CLOSEFILE. Re-open FOR READ. Read all lines into an array. CLOSEFILE, then OUTPUT the lines in reverse order.`,
[t([],['D','C','B','A'])],
['Read all lines into an array using READFILE inside a loop', 'OUTPUT using a FOR loop with STEP -1 to reverse the order']),

ex('fil-14','files','File: Average from File','hard',
`Write values 10, 20, 30, 40, 50 to \`"data.txt"\` using a FOR loop with STEP 10. Read them back and OUTPUT their average.`,
[t([],['30'])],
['Use FOR Value ← 10 TO 50 STEP 10 to write values', 'Use WHILE NOT EOF to accumulate the sum and count lines for the average'],
'', '',
src => /\bFOR\b/i.test(src) && /\bSTEP\b/i.test(src) ? null : 'You must use a FOR loop with a STEP value to write the data to the file'),

ex('fil-15','files','CSV: Parse Fields with MID','hard',
`Assign \`Line ← "Charlie,92,Pass"\`. The format is Name (7 chars), comma, Score (2 chars), comma, Result (4 chars). Extract and OUTPUT each field on a separate line.`,
[t([],['Charlie','92','Pass'])],
['Name: MID(Line, 1, 7)', 'Score: MID(Line, 9, 2) (after the comma at position 8)', 'Result: MID(Line, 12, 4)']),

ex('fil-16','files','File: Write Even Numbers','medium',
`Open \`"evens.txt"\` FOR WRITE. Use a FOR loop with STEP 2 to write even numbers from 2 to 10. CLOSEFILE. Re-open FOR READ. Use WHILE NOT EOF to read and OUTPUT each number. CLOSEFILE when done.`,
[t([],['2','4','6','8','10'])],
['FOR Number ← 2 TO 10 STEP 2', 'WHILE NOT EOF to read back — no DO keyword in AS pseudocode']),

ex('fil-17','files','File: Filter Lines','hard',
`Open \`"words.txt"\` FOR WRITE. Write \`"Cat"\`, \`"Elephant"\`, \`"Dog"\`, \`"Computer"\`, \`"Bee"\`. CLOSEFILE. Re-open FOR READ. Use WHILE NOT EOF to READFILE each word and OUTPUT only those with length > 3. CLOSEFILE when done.`,
[t([],['Elephant','Computer'])],
['Check LENGTH(Word) > 3 inside the WHILE loop before outputting']),

ex('fil-18','files','File: Total from File','hard',
`Open \`"payments.txt"\` FOR WRITE. Write 25, 50, 100, 75 (one per line). CLOSEFILE. Re-open FOR READ. Read each value into a REAL variable and accumulate the total. CLOSEFILE, then OUTPUT the total.`,
[t([],['250'])],
['Use WHILE NOT EOF to read and accumulate', 'READFILE stores a string — the interpreter will auto-convert to a number for arithmetic']),

ex('fil-19','files','CSV: Write and Read Student Records','hard',
`Write three CSV lines to \`"students.csv"\`: \`"Alice,85"\`, \`"Bob,72"\`, \`"Carol,91"\`. Re-open FOR READ. Use WHILE NOT EOF to read each line and OUTPUT the name (first field) and score (second field) on the same line separated by ": ".`,
[t([],['Alice: 85','Bob: 72','Carol: 91'])],
['Each line is "Name,Score"', 'For "Alice,85": name is LEFT(Line, 5), score is MID(Line, 7, 2)', 'Output with & ": " & between them']),

ex('fil-20','files','File: Write With Procedure','hard',
`Write a PROCEDURE \`WriteToFile(BYVAL FileName : STRING, BYVAL Content : STRING)\` that opens the named file for WRITE, writes Content, and closes it. Call it to write \`"Data saved"\` to \`"output.txt"\`. Then read and OUTPUT the file content.`,
[t([],['Data saved'])],
['The procedure handles all three steps: OPENFILE, WRITEFILE, CLOSEFILE', 'After calling it, open the file for READ manually to verify the content'],
PROC_SCAFFOLD),

// ─────────────────────────────────────────────────────────────────────────────
// STANDARD ALGORITHMS  (15)
// ─────────────────────────────────────────────────────────────────────────────

ex('alg-01','algorithms','Linear Search: Found/Not Found','medium',
`Declare \`Data : ARRAY[1:6] OF INTEGER\` with values 3, 7, 1, 9, 4, 6. INPUT a target. Use linear search to OUTPUT \`Found\` or \`Not found\`.`,
[t(['9'],['Found']), t(['5'],['Not found']), t(['3'],['Found'])],
['Use a FOR loop to check each element of Data against Target', 'Use a boolean flag variable to track whether the value was found']),

ex('alg-02','algorithms','Linear Search: Return Position','hard',
`Declare \`Data : ARRAY[1:6] OF INTEGER\` with values 10, 25, 7, 42, 19, 33. INPUT a target. OUTPUT the 1-based index if found, or \`-1\` if not.`,
[t(['42'],['4']), t(['7'],['3']), t(['99'],['-1'])],
['Initialise Position ← -1 before the loop', 'Update Position when the target is found']),

ex('alg-03','algorithms','Find Highest Value','medium',
`INPUT 5 integers. Store the highest value in a variable called \`Max\` and OUTPUT it.`,
[t(['3','7','1','9','2'],['9']), t(['5','5','5','5','5'],['5'])],
['Initialise Max from the first input before the loop', 'Update Max each time a larger value is found']),

ex('alg-04','algorithms','Find Lowest Value','medium',
`INPUT 5 integers. Store the lowest value in a variable called \`Min\` and OUTPUT it.`,
[t(['3','7','1','9','2'],['1']), t(['5','2','8','4','6'],['2'])],
['Initialise Min from the first input before the loop', 'Update Min each time a smaller value is found']),

ex('alg-05','algorithms','Totalling and Averaging','medium',
`INPUT 5 integers. Calculate the sum in a variable called \`Total\`, then OUTPUT the average (Total ÷ 5) rounded to 1 decimal place.`,
[t(['2','4','6','8','10'],['6.0']), t(['1','2','3','4','5'],['3.0'])],
['Accumulate all inputs into Total, then divide by 5 for the average', 'Use ROUND(Total / 5, 1) to format to 1 decimal place']),

ex('alg-06','algorithms','Counting Occurrences','medium',
`INPUT 6 integers into an array called \`Data\`. Count how many are greater than 5 and OUTPUT the count.`,
[t(['3','8','1','6','2','9'],['3']), t(['1','2','3','4','5','6'],['1'])],
['Use a FOR loop to examine each element', 'Increment a counter when the element is greater than 5']),

ex('alg-07','algorithms','Bubble Sort (Ascending)','hard',
`INPUT 6 integers into an array called \`Data\`. Sort them in ascending order using bubble sort. OUTPUT all 6 values (one per line).`,
[t(['5','3','8','1','4','7'],['1','3','4','5','7','8']), t(['9','7','5','3','2','1'],['1','2','3','5','7','9'])],
['Outer loop: 1 to 5 (n-1 passes)', 'Inner loop: compare adjacent elements and swap if out of order']),

ex('alg-08','algorithms','Bubble Sort (Descending)','hard',
`INPUT 5 integers into an array called \`Data\`. Sort them in descending order using bubble sort. OUTPUT all 5 (largest first).`,
[t(['5','3','8','1','4'],['8','5','4','3','1']), t(['1','3','5','7','9'],['9','7','5','3','1'])],
['Same structure as ascending bubble sort but swap when adjacent elements are in the wrong order for descending']),

ex('alg-09','algorithms','Binary Search','hard',
`Declare a pre-sorted array \`Data : ARRAY[1:8] OF INTEGER\` with values 4, 8, 15, 16, 23, 42, 56, 73. INPUT a target. Use binary search to OUTPUT the 1-based position, or \`-1\` if not found.`,
[t(['23'],['5']), t(['4'],['1']), t(['99'],['-1']), t(['73'],['8'])],
['Initialise Low ← 1, High ← 8, Position ← -1', 'Repeat: Mid ← (Low + High) DIV 2; compare; narrow Low or High', 'Stop WHILE Low <= High']),

ex('alg-10','algorithms','Find Highest and Its Position','hard',
`INPUT 5 integers into an array. Find the highest value and its 1-based position. OUTPUT \`Max number: X\` then \`Position: Y\`.`,
[t(['3','7','1','9','2'],['Max number: 9','Position: 4']), t(['10','4','6','8','2'],['Max number: 10','Position: 1'])],
['Track both the maximum value and its position in separate variables', 'Update both when a new maximum is found']),

ex('alg-11','algorithms','Average Excluding Zeros','hard',
`INPUT 6 integers into an array called \`Data\`. Use variables \`Total\` and \`Count\` to sum and count non-zero values. OUTPUT the average rounded to 1 decimal place, or \`No data\` if all are zero.`,
[t(['0','4','6','0','2','8'],['5.0']), t(['0','0','0','0','0','0'],['No data'])],
['Only add non-zero values to Total and increment Count for each', 'Check Count > 0 before dividing to avoid division by zero']),

ex('alg-12','algorithms','Check Sorted Ascending','hard',
`INPUT 5 integers into an array called \`Data\`. OUTPUT \`Sorted\` if they are already in ascending order, otherwise OUTPUT \`Not sorted\`.`,
[t(['1','2','3','4','5'],['Sorted']), t(['1','3','2','4','5'],['Not sorted']), t(['5','5','5','5','5'],['Sorted'])],
['Use a boolean flag variable initialised to TRUE', 'Set the flag to FALSE inside the loop if any element is greater than the next']),

ex('alg-13','algorithms','Linear Search in Parallel Arrays','hard',
`Declare parallel arrays: \`Names : ARRAY[1:5] OF STRING\` with "Alice","Bob","Charlie","David","Eve" and \`Ages : ARRAY[1:5] OF INTEGER\` with 14,15,13,16,15. INPUT a name. If found, OUTPUT the corresponding age. If not found, OUTPUT \`Not found\`.`,
[t(['Charlie'],['13']), t(['Alice'],['14']), t(['Zara'],['Not found'])],
['Loop through the Names array looking for a match', 'When found, output the value at the same index in the Ages array']),

ex('alg-14','algorithms','Binary Search in Function','hard',
`Write a FUNCTION \`BinarySearch(BYVAL Target : INTEGER) RETURNS INTEGER\` that searches the sorted array \`Nums : ARRAY[1:8] OF INTEGER\` (pre-loaded with 2,5,8,12,16,23,38,56) and returns the 1-based position or -1. INPUT a target, OUTPUT the result.`,
[t(['23'],['6']), t(['2'],['1']), t(['50'],['-1'])],
['Declare Nums inside your function or in the main program before calling', 'Return Position from inside the function after the WHILE loop'],
PROC_SCAFFOLD,
`DECLARE Nums : ARRAY[1:8] OF INTEGER
Nums[1] ← 2
Nums[2] ← 5
Nums[3] ← 8
Nums[4] ← 12
Nums[5] ← 16
Nums[6] ← 23
Nums[7] ← 38
Nums[8] ← 56
`),

ex('alg-15','algorithms','Sort a 2D Name Array','hard',
`Declare a 2D array \`Names : ARRAY[1:4, 1:2] OF STRING\` with rows: (Alice,Wong), (Bob,Smith), (Charlie,Brown), (Diana,Jones). Sort by last name (column 2) ascending using bubble sort, swapping entire rows. OUTPUT the sorted full names.`,
[t([],['Charlie Brown','Diana Jones','Bob Smith','Alice Wong'])],
['Outer bubble sort loop: 1 to 3; inner loop compares Names[i,2] with Names[i+1,2]', 'Swap both columns when the last name in row i is greater than in row i+1', 'Use two STRING temp variables to hold values during the swap']),

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
['Count from position 1 — "Computer Science" starts at position 4 and is 16 characters long', 'MID(FullText, 4, 16) extracts the subject', 'UCASE(FullText) converts the whole string to uppercase']),

ex('exam-02','exam','Q2 — BYREF Procedure','medium',
`A program needs to count how many times a procedure has been called.

Write a PROCEDURE \`Increment(BYREF Count : INTEGER)\` that adds 1 to Count.

Write a main program that:
• declares an integer \`CallCount ← 0\`
• calls Increment three times
• OUTPUTs the final value of CallCount

[5 marks]`,
[t([],['3'])],
['BYREF means changes inside the procedure affect the caller\'s variable', 'Call CALL Increment(CallCount) three times'],
PROC_SCAFFOLD,
'',
requireBYREF),

ex('exam-03','exam','Q3 — File Handling with CSV','hard',
`A student record system stores data as CSV lines in the format \`Name,Score\`.

Write pseudocode to:
• open a file \`"results.txt"\` for WRITE
• write the two records \`"Alice,85"\` and \`"Bob,72"\`
• close the file
• re-open for READ
• use WHILE NOT EOF to read each line and output the name (characters 1 to 5 for Alice, 1 to 3 for Bob)
• close the file

[6 marks]`,
[t([],['Alice','Bob'])],
['Write each CSV string as a single WRITEFILE call', 'When reading: for "Alice,85" use LEFT(Line, 5); for "Bob,72" use LEFT(Line, 3)', 'Use LENGTH to find how many characters the name is, or hardcode lengths for this exercise']),

ex('exam-04','exam','Q4 — Record Type Definition','hard',
`An airline wants to store flight information.

Write pseudocode to:
• define a record type \`FlightRecord\` with fields: \`FlightCode : STRING\`, \`Destination : STRING\`, \`Seats : INTEGER\`
• declare a variable \`Flight : FlightRecord\`
• assign: FlightCode ← "BA001", Destination ← "London", Seats ← 180
• OUTPUT all three fields

[5 marks]`,
[t([],['BA001','London','180'])],
['Use TYPE FlightRecord ... ENDTYPE to define the record', 'Access fields with Flight.FlightCode, Flight.Destination, Flight.Seats']),

ex('exam-05','exam','Q5 — Array Processing','medium',
`A one-dimensional array called \`Temperatures\` has 25 elements (indices 1 to 25) holding values between -20 and 100.

Write a pseudocode algorithm using a single loop to find the lowest value and output the result.

[4 marks]

*The array has been pre-loaded for you to test your solution.*`,
[t([],['-15'])],
['Set a variable to the value of the first element before the loop', 'Loop from index 1 to 25, updating the minimum when a smaller value is found', 'OUTPUT after the loop ends, not inside it'],
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
['Declare a running total variable inside the function and initialise it to 0 before the loop', 'Use a FOR loop from 1 to 50', 'RETURN the total after the loop']),

ex('exam-07','exam','Q7 — Validation and Type Conversion','hard',
`A program reads prices from a user as strings (e.g., "9.99").

Write pseudocode to:
• INPUT a string \`PriceStr\`
• validate that LENGTH(PriceStr) > 0
• convert to a REAL value using \`STR_TO_NUM()\`
• validate that the converted value is between 0.01 and 999.99 inclusive
• if valid, OUTPUT \`"Price accepted: "\` followed by the value; if invalid, OUTPUT \`"Invalid price"\`

[5 marks]`,
[t(['9.99'],['Price accepted: 9.99']), t(['0'],['Invalid price']), t([''],['Invalid price']), t(['1500'],['Invalid price'])],
['Check LENGTH > 0 first before attempting conversion', 'Use STR_TO_NUM to convert the string to a number', 'Check the numeric value is within range before outputting']),

];

// ── Sanity check (development aid, remove in production if needed) ─────────────
if (EXERCISES.length !== 227) {
  console.warn(`exercises.js: expected 227 exercises, got ${EXERCISES.length}`);
}
