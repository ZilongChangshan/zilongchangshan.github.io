const fs = require('fs');
const js = fs.readFileSync('nongchang/script.js', 'utf8');

try {
    // Attempt to parse by creating a new Function
    new Function(js);
    console.log("No syntax errors according to new Function.");
} catch (e) {
    console.log("Syntax Error:", e.message);
    // V8 doesn't always give line numbers for `new Function` if it's a redeclaration inside a block without strict mode eval.
}

// Write a temp file and execute it with node directly to get stack trace
fs.writeFileSync('temp_check.js', js);
