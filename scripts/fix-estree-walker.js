const fs = require('fs');
const path = require('path');

// Paths
const nodeModulesPath = path.resolve('./node_modules');
const estreeWalkerPath = path.join(nodeModulesPath, 'estree-walker');
const viteCachePath = path.join(nodeModulesPath, '.vite');

console.log('Fixing estree-walker package...');

// Create .vite directory if it doesn't exist
try {
  if (!fs.existsSync(viteCachePath)) {
    fs.mkdirSync(viteCachePath);
    console.log('Created .vite directory');
  }
} catch (err) {
  console.error('Error creating .vite directory:', err);
}

// Create estree-walker.js in .vite directory
try {
  const shimContent = `
// This is a shim for estree-walker
export * from 'estree-walker/src/index.js';
export { default } from 'estree-walker/src/index.js';
`;
  fs.writeFileSync(path.join(viteCachePath, 'estree-walker.js'), shimContent);
  console.log('Created estree-walker shim in .vite directory');
} catch (err) {
  console.error('Error creating estree-walker shim:', err);
}

// Check if estree-walker exists
if (fs.existsSync(estreeWalkerPath)) {
  // Check package.json
  const pkgPath = path.join(estreeWalkerPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      console.log('Original package.json:', {
        main: pkg.main,
        module: pkg.module,
        exports: pkg.exports,
        type: pkg.type
      });
      
      // Modify package.json
      // Add main if it doesn't exist
      if (!pkg.main) {
        pkg.main = './src/index.js';
      }
      
      // Update exports to include CommonJS format
      pkg.exports = {
        '.': {
          types: './types/index.d.ts',
          import: './src/index.js',
          require: './src/index.js'
        },
        './package.json': './package.json'
      };
      
      // Write modified package.json
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      console.log('Modified package.json');
    } catch (err) {
      console.error('Error modifying package.json:', err);
    }
  }
  
  // Create dist/esm directory if it doesn't exist
  const distPath = path.join(estreeWalkerPath, 'dist');
  const esmPath = path.join(distPath, 'esm');
  
  try {
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath);
      console.log('Created dist directory');
    }
    
    if (!fs.existsSync(esmPath)) {
      fs.mkdirSync(esmPath);
      console.log('Created esm directory');
    }
    
    // Copy src/index.js to dist/esm/index.js
    const srcIndexPath = path.join(estreeWalkerPath, 'src', 'index.js');
    if (fs.existsSync(srcIndexPath)) {
      const content = fs.readFileSync(srcIndexPath, 'utf8');
      fs.writeFileSync(path.join(esmPath, 'index.js'), content);
      console.log('Copied src/index.js to dist/esm/index.js');
      
      // Also create a CJS version in dist/index.js
      const cjsContent = `
// CommonJS wrapper for estree-walker
const srcModule = require('../src/index.js');
module.exports = srcModule;
`;
      fs.writeFileSync(path.join(distPath, 'index.js'), cjsContent);
      console.log('Created CommonJS wrapper in dist/index.js');
    } else {
      console.error('src/index.js not found');
    }
  } catch (err) {
    console.error('Error creating directories or copying files:', err);
  }
  
  // Create a resolve-estree-walker.js file in the project root
  try {
    const resolverContent = `
// This is a resolver for estree-walker
export * from 'estree-walker/src/index.js';
export { default } from 'estree-walker/src/index.js';
`;
    fs.writeFileSync(path.resolve('./resolve-estree-walker.js'), resolverContent);
    console.log('Created resolve-estree-walker.js in project root');
  } catch (err) {
    console.error('Error creating resolver file:', err);
  }
} else {
  console.error('estree-walker package not found');
}

console.log('estree-walker fix completed');
