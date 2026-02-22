const fs = require('fs');
const path = require('path');

const walkSync = function (dir, filelist) {
    const files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
        } else if (file.endsWith('.jsx')) {
            filelist.push(path.join(dir, file));
        }
    });
    return filelist;
};

const pagesDir = path.join(__dirname, 'src', 'pages');
const compDir = path.join(__dirname, 'src', 'components');
let allFiles = [];
if (fs.existsSync(pagesDir)) allFiles = allFiles.concat(walkSync(pagesDir));
if (fs.existsSync(compDir)) allFiles = allFiles.concat(walkSync(compDir));

const replacements = [
    { match: /(?<!dark:)bg-white\/5/g, replace: 'bg-slate-50 dark:bg-white/5' },
    { match: /(?<!dark:)bg-white\/10/g, replace: 'bg-slate-100 dark:bg-white/10' },
    { match: /(?<!dark:)border-white\/10/g, replace: 'border-slate-200 dark:border-white/10' },
    { match: /(?<!dark:)border-white\/5/g, replace: 'border-slate-200 dark:border-white/5' },
    { match: /(?<!dark:)text-slate-500/g, replace: 'text-slate-600 dark:text-slate-500' },
    { match: /(?<!dark:)text-slate-400/g, replace: 'text-slate-700 dark:text-slate-400' },
    { match: /(?<!dark:)text-slate-300/g, replace: 'text-slate-800 dark:text-slate-300' },
    { match: /(?<!dark:)text-slate-200/g, replace: 'text-slate-900 dark:text-slate-200' },
    { match: /(?<!dark:)bg-slate-800/g, replace: 'bg-slate-200 dark:bg-slate-800' },
    { match: /(?<!dark:)bg-slate-900\/50/g, replace: 'bg-slate-100 dark:bg-slate-900/50' },
    { match: /(?<!dark:)border-slate-700/g, replace: 'border-slate-300 dark:border-slate-700' }
];

allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    const lines = content.split('\n');
    const newLines = lines.map(line => {
        let newLine = line;
        for (const r of replacements) {
            newLine = newLine.replace(r.match, r.replace);
        }

        // Specially handle text-white, only if it's not preceded by dark:
        // and if the line isn't obviously a colored button/badge
        if (newLine.match(/(?<!dark:)text-white/)) {
            if (!newLine.match(/bg-(primary|emerald|rose|red|blue|indigo|green|gradient)/) && !newLine.match(/from-/)) {
                newLine = newLine.replace(/(?<!dark:)text-white/g, 'text-slate-900 dark:text-white');
            }
        }
        return newLine;
    });

    content = newLines.join('\n');
    // Avoid doubling up dark:dark:
    content = content.replace(/dark:dark:/g, 'dark:');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});

console.log('Theme fix applying done.');
