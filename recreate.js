const fs = require('fs');
let content = fs.readFileSync('appShellConstants.ts', 'utf8');

// I will clean up the file to just export DESKTOP_DIR_FALLBACK_USER, PROCEDURAL_WALLPAPERS, isWallpaperHtmlDocument, getDesktopPath.

// find the start of PROCEDURAL_WALLPAPERS
let startIdx = content.indexOf('export const PROCEDURAL_WALLPAPERS');
// find the end by looking for "// Detect both nexus://"
let endIdx = content.indexOf('// Detect both nexus://');

let before = content.slice(0, startIdx);
let after = content.slice(endIdx);

const wps1 = require('./generate_wallpapers.js');
// wait I can't require it because it wasn't exporting. 
