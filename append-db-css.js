const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');
let appendCss = fs.readFileSync('append-db.css', 'utf8');
css += '\n\n' + appendCss;
fs.writeFileSync('style.css', css);
console.log('Appended db styles');
