// Run this script to check the structure of estree-walker
const fs = require('fs');
const path = require('path');

const estreeWalkerPath = path.resolve('./node_modules/estree-walker');
console.log('Checking estree-walker package structure:');
console.log('Package exists:', fs.existsSync(estreeWalkerPath));

if (fs.existsSync(estreeWalkerPath)) {
  const files = fs.readdirSync(estreeWalkerPath);
  console.log('Files in estree-walker:', files);
  
  // Check dist folder
  const distPath = path.join(estreeWalkerPath, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('Files in dist:', fs.readdirSync(distPath));
    
    // Check if ESM folder exists
    const esmPath = path.join(distPath, 'esm');
    if (fs.existsSync(esmPath)) {
      console.log('Files in esm:', fs.readdirSync(esmPath));
    }
  }
  
  // Check package.json
  const pkgPath = path.join(estreeWalkerPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = require(pkgPath);
    console.log('Package.json:', {
      main: pkg.main,
      module: pkg.module,
      exports: pkg.exports,
      type: pkg.type
    });
  }
}