const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// The corrupted text starts at: /*   - - -   Teacher Dashboard Styles
// Let's find the original Teacher Dashboard Styles text or the corrupt one.
let idx = css.indexOf('/ *   - - -   T e a c h e r');
if (idx === -1) {
    idx = css.indexOf('/* --- Teacher Dashboard');
}
if (idx === -1) {
    // If not found, just try to find where we should cut.
    idx = css.indexOf('.pdf-exporting .chart-title {');
    if (idx !== -1) {
        idx = css.indexOf('}', idx) + 1; // cut right after this block closes
    }
}

if (idx !== -1) {
    css = css.substring(0, idx).trim() + '\n\n';
} else {
    css += '\n\n';
}

const appendCss = fs.readFileSync('append.css', 'utf8');
css += appendCss;

fs.writeFileSync('style.css', css);
console.log('Successfully fixed and appended style.css');
