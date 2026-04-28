#!/usr/bin/env node
/**
 * MineLacs — Production Build Script
 * Minifies CSS and JS, copies assets to /dist
 *
 * Usage:   node build.js
 * Prereq:  Node.js 14+
 * Deps:    Installed automatically via npx
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

// ── Helpers ──
function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function fileSize(filePath) {
    return (fs.statSync(filePath).size / 1024).toFixed(1);
}

function copyDirSync(src, dest) {
    ensureDir(dest);
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function minifyCSS(src, dest) {
    try {
        execSync(`npx -y clean-css-cli@5 "${src}" -o "${dest}"`, { cwd: ROOT, stdio: 'pipe' });
        console.log(`   ${path.relative(ROOT, src)}: ${fileSize(src)}KB → ${fileSize(dest)}KB ✅`);
        return true;
    } catch (e) {
        console.error(`   ❌ Failed: ${path.relative(ROOT, src)}, copying as-is.`);
        fs.copyFileSync(src, dest);
        return false;
    }
}

function minifyJS(src, dest) {
    try {
        execSync(`npx -y terser@5 "${src}" -o "${dest}" --compress --mangle`, { cwd: ROOT, stdio: 'pipe' });
        console.log(`   ${path.relative(ROOT, src)}: ${fileSize(src)}KB → ${fileSize(dest)}KB ✅`);
        return true;
    } catch (e) {
        console.error(`   ❌ Failed: ${path.relative(ROOT, src)}, copying as-is.`);
        fs.copyFileSync(src, dest);
        return false;
    }
}

// ── Main ──
console.log('\n📦 Building MineLacs for production...\n');

// Create dist structure
const dirs = [
    DIST,
    path.join(DIST, 'css'),
    path.join(DIST, 'js'),
    path.join(DIST, 'download'),
    path.join(DIST, 'onelauncher'),
];
dirs.forEach(ensureDir);

// 1. Minify CSS
console.log('🎨 Minifying CSS...');
const cssFiles = [
    ['css/style.css', 'css/style.css'],
    ['download/download.css', 'download/download.css'],
    ['onelauncher/launcher.css', 'onelauncher/launcher.css'],
];
cssFiles.forEach(([src, dest]) => {
    minifyCSS(path.join(ROOT, src), path.join(DIST, dest));
});
console.log('');

// 2. Minify JS
console.log('⚡ Minifying JavaScript...');
const jsFiles = [
    ['js/common.js', 'js/common.js'],
    ['js/main.js', 'js/main.js'],
    ['download/download.js', 'download/download.js'],
    ['onelauncher/launcher.js', 'onelauncher/launcher.js'],
];
jsFiles.forEach(([src, dest]) => {
    minifyJS(path.join(ROOT, src), path.join(DIST, dest));
});
console.log('');

// 3. Copy HTML files
console.log('📄 Processing HTML...');
const htmlFiles = [
    ['index.html', 'index.html'],
    ['404.html', '404.html'],
    ['download/index.html', 'download/index.html'],
    ['onelauncher/index.html', 'onelauncher/index.html'],
];
htmlFiles.forEach(([src, dest]) => {
    fs.copyFileSync(path.join(ROOT, src), path.join(DIST, dest));
    console.log(`   ${src} ✅`);
});
console.log('');

// 4. Copy images
console.log('🖼️  Copying images...');
copyDirSync(path.join(ROOT, 'images'), path.join(DIST, 'images'));
console.log('   images/ ✅\n');

// 5. Copy static files
console.log('📋 Copying static files...');
const staticFiles = ['robots.txt', 'sitemap.xml'];
staticFiles.forEach(f => {
    const src = path.join(ROOT, f);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(DIST, f));
        console.log(`   ${f} ✅`);
    }
});
console.log('');

// 6. Summary
const allSrcFiles = [
    ...cssFiles.map(f => f[0]),
    ...jsFiles.map(f => f[0]),
    ...htmlFiles.map(f => f[0]),
];
const allDistFiles = [
    ...cssFiles.map(f => f[1]),
    ...jsFiles.map(f => f[1]),
    ...htmlFiles.map(f => f[1]),
];

const totalSrc = allSrcFiles.reduce((sum, f) => {
    const p = path.join(ROOT, f);
    return sum + (fs.existsSync(p) ? fs.statSync(p).size : 0);
}, 0);

const totalDist = allDistFiles.reduce((sum, f) => {
    const p = path.join(DIST, f);
    return sum + (fs.existsSync(p) ? fs.statSync(p).size : 0);
}, 0);

console.log('━'.repeat(40));
console.log(`📊 Total text assets: ${(totalSrc / 1024).toFixed(1)}KB → ${(totalDist / 1024).toFixed(1)}KB (${((1 - totalDist / totalSrc) * 100).toFixed(0)}% reduction)`);
console.log(`📁 Output: ${DIST}`);
console.log('✅ Build complete!\n');
