const fs = require('fs');
const path = require('path');

// Path to the unctx package.json
const unctxPath = path.join(process.cwd(), 'node_modules/unctx');
const packageJsonPath = path.join(unctxPath, 'package.json');

// Check if the package exists
if (fs.existsSync(packageJsonPath)) {
  try {
    // Read the current package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    console.log('Original unctx exports:', packageJson.exports);
    
    let updated = false;
    
    // Check if ./transform exists but is missing the require field
    if (packageJson.exports && packageJson.exports['./transform'] && 
        !packageJson.exports['./transform'].require) {
      
      console.log('Found ./transform export but missing require field');
      
      // Check if transform.cjs or transform.js exists
      const transformCjs = path.join(unctxPath, 'dist/transform.cjs');
      const transformJs = path.join(unctxPath, 'dist/transform.js');
      
      if (fs.existsSync(transformCjs)) {
        packageJson.exports['./transform'].require = './dist/transform.cjs';
        updated = true;
      } else if (fs.existsSync(transformJs)) {
        packageJson.exports['./transform'].require = './dist/transform.js';
        updated = true;
      } else {
        // If neither file exists, create a simple transform.cjs file
        console.log('Creating transform.cjs file');
        
        // Check if the import file exists
        const importFile = packageJson.exports['./transform'].import;
        const importPath = path.join(unctxPath, importFile);
        
        if (fs.existsSync(importPath)) {
          // Create a CJS version that re-exports the same file
          fs.writeFileSync(path.join(unctxPath, 'dist/transform.cjs'), `
// Simple transform module that re-exports the main functionality
module.exports = require('./index.cjs');
          `);
          
          packageJson.exports['./transform'].require = './dist/transform.cjs';
          updated = true;
        } else {
          console.error(`Import file ${importFile} does not exist`);
        }
      }
    }
    
    // Add the missing ./transform export if it doesn't exist at all
    if (packageJson.exports && !packageJson.exports['./transform']) {
      // Check if the transform.js or transform.mjs file exists
      const transformJs = path.join(unctxPath, 'dist/transform.js');
      const transformMjs = path.join(unctxPath, 'dist/transform.mjs');
      const transformCjs = path.join(unctxPath, 'dist/transform.cjs');
      
      if (fs.existsSync(transformMjs)) {
        packageJson.exports['./transform'] = {
          types: './dist/transform.d.ts',
          import: './dist/transform.mjs',
          require: fs.existsSync(transformCjs) ? './dist/transform.cjs' : './dist/transform.mjs'
        };
        updated = true;
      } else if (fs.existsSync(transformJs)) {
        packageJson.exports['./transform'] = {
          types: './dist/transform.d.ts',
          import: './dist/transform.js',
          require: './dist/transform.js'
        };
        updated = true;
      } else {
        // If neither file exists, create a simple transform.js file
        const transformDir = path.join(unctxPath, 'dist');
        if (!fs.existsSync(transformDir)) {
          fs.mkdirSync(transformDir, { recursive: true });
        }
        
        // Create a basic transform.js file that exports the main functionality
        fs.writeFileSync(path.join(transformDir, 'transform.cjs'), `
// Simple transform module that re-exports the main functionality
module.exports = require('./index.cjs');
        `);
        
        packageJson.exports['./transform'] = {
          types: './dist/transform.d.ts',
          import: './dist/index.mjs',
          require: './dist/transform.cjs'
        };
        updated = true;
      }
    }
    
    // Write the updated package.json if changes were made
    if (updated) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('Updated unctx package.json with fixed ./transform export');
    } else {
      console.log('No updates needed for unctx package.json');
    }
  } catch (error) {
    console.error('Error updating unctx package.json:', error);
  }
} else {
  console.error('unctx package.json not found at', packageJsonPath);
}
