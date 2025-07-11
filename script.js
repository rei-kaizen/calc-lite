document.addEventListener('DOMContentLoaded', function() {
    const calculator = document.querySelector('.calculator');
    const result = document.querySelector('.result');
    const buttons = document.querySelectorAll('.button');
    const functions = document.querySelectorAll('.function');
    const modeDisplay = document.querySelector('.mode');
    const dateDisplay = document.querySelector('.date');
    const themeSwitch = document.querySelector('.theme-switch');
    
    let currentInput = '0';
    let currentOperation = null;
    let previousInput = null;
    let calculationCompleted = false;
    let memoryValue = 0;
    let currentBase = 'DEC';
    let darkMode = false;
    let expression = '';
    let parenthesesCount = 0;
    
    // Update display
    function updateDisplay() {
        if (currentInput.length > 9) {
            result.textContent = parseFloat(currentInput).toExponential(3);
        } else {
            result.textContent = currentInput;
        }
    }
    
    // Initialize calculator
    updateDisplay();
    dateDisplay.textContent = currentBase;
    modeDisplay.textContent = 'M: ' + memoryValue;
    
    // Toggle dark mode
    themeSwitch.addEventListener('click', function() {
        darkMode = !darkMode;
        calculator.classList.toggle('dark-mode', darkMode);
    });
    
    // Event listeners for all buttons
    buttons.forEach(button => {
        button.addEventListener('click', handleInput);
    });
    
    functions.forEach(func => {
        func.addEventListener('click', handleInput);
    });
    
    function handleInput() {
        const value = this.getAttribute('data-value');
        
        // Reset the active state of operation buttons
        if (value !== currentOperation) {
            document.querySelectorAll('.operation').forEach(op => {
                op.classList.remove('active');
            });
        }
        
        // Handle number input
        if (!isNaN(parseInt(value)) || value === '.' || value === '00') {
            if (calculationCompleted || currentInput === '0') {
                currentInput = value === '.' ? '0.' : value;
                calculationCompleted = false;
            } else {
                if (value === '.' && currentInput.includes('.')) return;
                currentInput += value;
            }
            updateDisplay();
        }
        
        // Handle plus/minus toggle
        else if (value === 'plusminus') {
            if (currentInput !== '0') {
                if (currentInput.startsWith('-')) {
                    currentInput = currentInput.substring(1);
                } else {
                    currentInput = '-' + currentInput;
                }
                updateDisplay();
            }
        }
        
        // Handle parentheses
        else if (value === 'parenthesis') {
            handleParenthesis();
        }
        
        // Handle operations
        else if (['+', '-', '×', '÷', '%'].includes(value)) {
            if (previousInput !== null && !calculationCompleted) {
                calculateResult();
            }
            previousInput = currentInput;
            currentOperation = value;
            this.classList.add('active');
            calculationCompleted = true;
        }
        
        // Handle equals
        else if (value === '=') {
            if (previousInput !== null) {
                calculateResult();
                previousInput = null;
                currentOperation = null;
                calculationCompleted = true;
            }
        }
        
        // Handle clear
        else if (value === 'c') {
            currentInput = '0';
            previousInput = null;
            currentOperation = null;
            calculationCompleted = false;
            expression = '';
            parenthesesCount = 0;
            document.querySelectorAll('.operation').forEach(op => {
                op.classList.remove('active');
            });
            updateDisplay();
        }
        
        // Handle backspace
        else if (value === 'backspace') {
            if (currentInput.length > 1) {
                // Check if we're deleting a parenthesis
                if (currentInput.endsWith('(')) {
                    parenthesesCount--;
                } else if (currentInput.endsWith(')')) {
                    parenthesesCount++;
                }
                currentInput = currentInput.slice(0, -1);
            } else {
                currentInput = '0';
            }
            updateDisplay();
        }
        
        // Handle memory operations
        else if (value === 'ms') {
            memoryValue = parseFloat(currentInput);
            modeDisplay.textContent = 'M: ' + memoryValue;
            calculationCompleted = true;
        }
        else if (value === 'mr') {
            currentInput = memoryValue.toString();
            updateDisplay();
            calculationCompleted = true;
        }
        else if (value === 'mc') {
            memoryValue = 0;
            modeDisplay.textContent = 'M: ' + memoryValue;
        }
        else if (value === 'm+') {
            memoryValue += parseFloat(currentInput);
            modeDisplay.textContent = 'M: ' + memoryValue;
            calculationCompleted = true;
        }
        else if (value === 'm-') {
            memoryValue -= parseFloat(currentInput);
            modeDisplay.textContent = 'M: ' + memoryValue;
            calculationCompleted = true;
        }
        
        // Handle number base changes
        else if (['bin', 'oct', 'hex', 'dec'].includes(value.toLowerCase())) {
            changeBase(value.toUpperCase());
        }
    }
    
    // Handle parenthesis
    function handleParenthesis() {
        // If the expression is empty or ends with an operator, add an opening parenthesis
        if (currentInput === '0' || calculationCompleted) {
            currentInput = '(';
            parenthesesCount++;
            calculationCompleted = false;
        } 
        // If we already have open parentheses, close one
        else if (parenthesesCount > 0) {
            currentInput += ')';
            parenthesesCount--;
        } 
        // Otherwise add an opening parenthesis
        else {
            currentInput += '(';
            parenthesesCount++;
        }
        updateDisplay();
    }
    
    // Calculate result based on operation
    function calculateResult() {
        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);
        let result;
        
        switch (currentOperation) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '×':
                result = prev * current;
                break;
            case '÷':
                result = prev / current;
                break;
            case '%':
                result = prev % current;
                break;
            default:
                return;
        }
        
        currentInput = result.toString();
        updateDisplay();
    }
    
    // Change number base
    function changeBase(newBase) {
        const decimalValue = convertToDecimal(currentInput, currentBase);
        currentBase = newBase;
        dateDisplay.textContent = currentBase;
        
        switch(newBase) {
            case 'BIN':
                currentInput = Math.floor(decimalValue).toString(2);
                break;
            case 'OCT':
                currentInput = Math.floor(decimalValue).toString(8);
                break;
            case 'HEX':
                currentInput = Math.floor(decimalValue).toString(16).toUpperCase();
                break;
            default: // DEC
                currentInput = decimalValue.toString();
        }
        
        updateDisplay();
    }
    
    // Convert from any base to decimal
    function convertToDecimal(value, fromBase) {
        let decimal = 0;
        
        switch(fromBase) {
            case 'BIN':
                decimal = parseInt(value, 2);
                break;
            case 'OCT':
                decimal = parseInt(value, 8);
                break;
            case 'HEX':
                decimal = parseInt(value, 16);
                break;
            default: // DEC
                decimal = parseFloat(value);
        }
        
        return decimal || 0;
    }
    
    // Handle keyboard input
    document.addEventListener('keydown', function(event) {
        const key = event.key;
        
        // Numbers
        if (/[0-9]/.test(key)) {
            document.querySelector(`.button[data-value="${key}"]`)?.click();
        }
        // Operations
        else if (key === '+') {
            document.querySelector(`.button[data-value="+"]`)?.click();
        }
        else if (key === '-') {
            document.querySelector(`.button[data-value="-"]`)?.click();
        }
        else if (key === '*') {
            document.querySelector(`.button[data-value="×"]`)?.click();
        }
        else if (key === '/') {
            document.querySelector(`.button[data-value="÷"]`)?.click();
        }
        else if (key === '%') {
            document.querySelector(`.function[data-value="%"]`)?.click();
        }
        else if (key === '.') {
            document.querySelector(`.button[data-value="."]`)?.click();
        }
        else if (key === 'Enter' || key === '=') {
            document.querySelector(`.button[data-value="="]`)?.click();
        }
        else if (key === 'Escape') {
            document.querySelector(`.button[data-value="c"]`)?.click();
        }
        else if (key === 'Backspace') {
            document.querySelector(`.button[data-value="backspace"]`)?.click();
        }
        // Plus/minus toggle with 'n' key
        else if (key === 'n') {
            document.querySelector(`.button[data-value="plusminus"]`)?.click();
        }
        // Parentheses with '(' or ')' keys
        else if (key === '(' || key === ')') {
            document.querySelector(`.button[data-value="parenthesis"]`)?.click();
        }
    });
});