/*-------------------------------- Constants --------------------------------*/

const display         = document.querySelector('.display');
const numberButtons   = document.querySelectorAll('.button.number');
const decimalButton   = document.querySelector('.button.decimal');
const allClearButton  = document.querySelector('.button.allclear');
const clearButton     = document.querySelector('.button.clear');
const operatorButtons = document.querySelectorAll('.button.operator');
    
/*-------------------------------- Variables --------------------------------*/

let current = '';      // what is typed now
let previous = '';     // stored operand
let op = null;         // pending operator

/*-------------------------------- Functions --------------------------------*/

function updateDisplay() {
  display.textContent = current || '0';
}

  // handles dividing number by zero
function calculate(a, b, operator) {
  switch (operator) {
    case '÷': return b === 0 ? 'Error' : a / b;
    case '×': return a * b;
    case '-': return a - b;
    case '+': return a + b;
  }
}

  // b is each button element in operatorButtons nodelist, and .classList is built-in DOM property on evey Element.
function setActiveOperator(btn) {
  operatorButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

  // given a stringified number, trim/round it to ≤12 characters
  // A “stringified number”, a numeric value that’s been converted into its string form for splice & UI display.
function formatToTwelve(numberStr) {
  // if it already fits, it is returned
  if (numberStr.length <= 12) return numberStr;

  // handle scientific notation—just return it (you could also format it)
  if (numberStr.includes('e')) return numberStr;

  // split into integer + fractional parts
  const [intPart, fracPart = ''] = numberStr.split('.');

  // if the integer part alone is already >12, it is sliced
  if (intPart.length >= 12) {
    return intPart.slice(0, 12);
  }

  // otherwise we can keep some decimals
  // 12 total characters minus integer length minus the dot 
  const maxDecimals = 12 - intPart.length - 1;

  // round to max decimals, used toFixed() to round to 12 characters,
  // If the integer part alone is too big, it just cuts it off at 12 digits
  // If not, and it has a decimal, decides how many decimal places will fit (12 − integer length − 1)
  let rounded = parseFloat(numberStr).toFixed(maxDecimals);

  // strips any trailing zeros or trailing dot
  rounded = rounded.replace(/\.?0+$/, '');

  return rounded;
}

/*------------------------ Cached Element References ------------------------*/

/*----------------------------- Event Listeners -----------------------------*/

// ## AC button – clear everything and any highlight
allClearButton.addEventListener('click', () => {
  current = '';
  previous = '';
  op = null;
  operatorButtons.forEach(b => b.classList.remove('active'));
  updateDisplay();
});

// ## C button – backspace
clearButton.addEventListener('click', () => {
  current = current.slice(0, -1);
  updateDisplay();
});

// ## Number buttons
numberButtons.forEach(btn =>
  btn.addEventListener('click', () => {
    // only allow more characters if under 12
    if (current.length < 12) {
      if (current === '0') current = btn.textContent;
      else current += btn.textContent;
      updateDisplay();
    }
  })
);

// ## Decimal point button
decimalButton.addEventListener('click', () => {
    // only allow decimal if there’s room AND not already present
  if (current.length < 12 && !current.includes('.')) {
    current = current ? current + '.' : '0.';
    updateDisplay();
  }
});

// ## All operators in one listener
operatorButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const value = btn.textContent;

    // = : compute and clear highlight
    // String(x) means “take x and give me its string representation.”
    // It ensures calculated result is stored and rendered as text in the calculator’s display.
    if (value === '=') {
      if (op && previous !== '' && current !== '') {
        let result = String(
          calculate(parseFloat(previous),
                    parseFloat(current),
                    op)
        );
        // format it to ≤12 characters
        current = formatToTwelve(result);
        op = null;
        previous = '';
        updateDisplay();
      }
      operatorButtons.forEach(b => b.classList.remove('active'));
      return;
    }

    // (-) : toggle sign, clear highlight
    if (value === '(-)') {
      if (current) {
        current = current.startsWith('-')
          ? current.slice(1)
          : '-' + current;
        updateDisplay();
      }
      operatorButtons.forEach(b => b.classList.remove('active'));
      return;
    }

    // % : percentage, clear highlight
    if (value === '%') {
      if (current) {
        current = String(parseFloat(current) / 100);
        updateDisplay();
      }
      operatorButtons.forEach(b => b.classList.remove('active'));
      return;
    }

    // ÷,×,-,+ : chain or store, highlight
    if (op && previous !== '' && current !== '') {
      previous = String(calculate(
        parseFloat(previous),
        parseFloat(current),
        op
      ));
    } else if (current !== '') {
      previous = current;
    }

    op = value;
    current = '';
    setActiveOperator(btn);
  });
});

// initialise
updateDisplay();