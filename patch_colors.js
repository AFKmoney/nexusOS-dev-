const fs = require('fs');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === 'dist' || file.startsWith('.')) return;
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('.');

files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');
    let original = code;
    
    // Specifically replacing cyan and blue usage that seems like primary accents
    code = code.replace(/text-cyan-[456]00/g, 'text-accent');
    code = code.replace(/text-blue-[456]00/g, 'text-accent');
    code = code.replace(/text-emerald-[456]00/g, 'text-accent');
    
    code = code.replace(/bg-cyan-[456]00\/(\d+)/g, 'bg-accent/$1');
    code = code.replace(/bg-blue-[456]00\/(\d+)/g, 'bg-accent/$1');
    code = code.replace(/bg-emerald-[456]00\/(\d+)/g, 'bg-accent/$1');
    
    code = code.replace(/bg-cyan-[456]00/g, 'bg-accent');
    code = code.replace(/bg-blue-[456]00/g, 'bg-accent');
    code = code.replace(/bg-emerald-[456]00/g, 'bg-accent');
    
    code = code.replace(/border-cyan-[456]00\/(\d+)/g, 'border-accent/$1');
    code = code.replace(/border-blue-[456]00\/(\d+)/g, 'border-accent/$1');
    code = code.replace(/border-emerald-[456]00\/(\d+)/g, 'border-accent/$1');
    
    code = code.replace(/border-cyan-[456]00/g, 'border-accent');
    code = code.replace(/border-blue-[456]00/g, 'border-accent');
    code = code.replace(/border-emerald-[456]00/g, 'border-accent');
    
    code = code.replace(/ring-cyan-[456]00\/(\d+)/g, 'ring-accent/$1');
    code = code.replace(/ring-blue-[456]00\/(\d+)/g, 'ring-accent/$1');
    code = code.replace(/ring-emerald-[456]00\/(\d+)/g, 'ring-accent/$1');
    
    code = code.replace(/ring-cyan-[456]00/g, 'ring-accent');
    code = code.replace(/ring-blue-[456]00/g, 'ring-accent');
    code = code.replace(/ring-emerald-[456]00/g, 'ring-accent');

    // Box shadows
    code = code.replace(/shadow-\[([^\]]+rgba\(34,211,238,([^\)]+)\))\]/g, 'shadow-accent'); // cyan rgb
    code = code.replace(/shadow-\[([^\]]+rgba\(59,130,246,([^\)]+)\))\]/g, 'shadow-accent'); // blue rgb
    code = code.replace(/shadow-\[([^\]]+rgba\(16,185,129,([^\)]+)\))\]/g, 'shadow-accent'); // emerald rgb

    if (code !== original) {
        fs.writeFileSync(file, code);
        console.log('patched ' + file);
    }
});
