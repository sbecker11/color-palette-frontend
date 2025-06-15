const fs = require('fs');
const path = require('path');

// Path to the ultrahtml package.json and dist directory
const ultrahtmlPackagePath = path.resolve(
  __dirname, 
  '../node_modules/ultrahtml/package.json'
);
const ultrahtmlDistDir = path.resolve(
  __dirname,
  '../node_modules/ultrahtml/dist'
);

try {
  // Check what files actually exist in the dist directory
  console.log('Checking files in ultrahtml/dist directory...');
  const distFiles = fs.existsSync(ultrahtmlDistDir) 
    ? fs.readdirSync(ultrahtmlDistDir) 
    : [];
  
  console.log('Files in dist directory:', distFiles);
  
  // Determine if we have ESM (mjs) or CJS (js) files
  const hasEsmFile = distFiles.some(file => file.endsWith('.mjs'));
  const hasCjsFile = distFiles.some(file => file.endsWith('.js'));
  const hasIndexJs = distFiles.includes('index.js');
  const hasIndexMjs = distFiles.includes('index.mjs');
  
  console.log('ESM file exists:', hasEsmFile);
  console.log('CJS file exists:', hasCjsFile);
  console.log('index.js exists:', hasIndexJs);
  console.log('index.mjs exists:', hasIndexMjs);
  
  // Read the current package.json
  const packageJson = JSON.parse(fs.readFileSync(ultrahtmlPackagePath, 'utf8'));
  
  console.log('Original ultrahtml package.json:', {
    main: packageJson.main,
    module: packageJson.module,
    exports: packageJson.exports,
    type: packageJson.type
  });
  
  // Update the package.json based on what files actually exist
  if (hasIndexJs) {
    packageJson.main = './dist/index.js';
  }
  
  if (hasIndexMjs) {
    packageJson.module = './dist/index.mjs';
  } else if (packageJson.module && !hasEsmFile) {
    // If module field exists but no ESM file exists, remove it
    delete packageJson.module;
    console.log('Removed module field as no ESM file exists');
  }
  
  // Configure exports based on available files
  if (hasIndexJs) {
    if (hasIndexMjs) {
      // Both CJS and ESM available
      packageJson.exports = {
        ".": {
          "import": "./dist/index.mjs",
          "require": "./dist/index.js"
        },
        "./package.json": "./package.json"
      };
    } else {
      // Only CJS available
      packageJson.exports = {
        ".": {
          "require": "./dist/index.js",
          "import": "./dist/index.js" // Use CJS for both
        },
        "./package.json": "./package.json"
      };
    }
  } else {
    // No index.js found, try to find any JS file
    const mainJsFile = distFiles.find(file => file.endsWith('.js'));
    if (mainJsFile) {
      packageJson.main = `./dist/${mainJsFile}`;
      packageJson.exports = {
        ".": {
          "require": `./dist/${mainJsFile}`,
          "import": `./dist/${mainJsFile}`
        },
        "./package.json": "./package.json"
      };
    } else {
      console.error('No JavaScript files found in dist directory!');
    }
  }
  
  // Write the updated package.json
  fs.writeFileSync(
    ultrahtmlPackagePath, 
    JSON.stringify(packageJson, null, 2)
  );
  
  console.log('Successfully fixed ultrahtml package.json');
  
  // Verify the fix
  const updatedPackageJson = JSON.parse(fs.readFileSync(ultrahtmlPackagePath, 'utf8'));
  console.log('Updated ultrahtml package.json:', {
    main: updatedPackageJson.main,
    module: updatedPackageJson.module,
    exports: updatedPackageJson.exports,
    type: updatedPackageJson.type
  });
  
  // Create a symlink if needed
  if (!hasIndexMjs && packageJson.exports && packageJson.exports['.'].import) {
    const importPath = packageJson.exports['.'].import;
    if (importPath.endsWith('.mjs') && hasIndexJs) {
      // Create a symlink from index.js to index.mjs
      const srcPath = path.resolve(ultrahtmlDistDir, 'index.js');
      const destPath = path.resolve(ultrahtmlDistDir, 'index.mjs');
      
      console.log(`Creating symlink from ${srcPath} to ${destPath}`);
      
      try {
        // Remove existing file if it exists
        if (fs.existsSync(destPath)) {
          fs.unlinkSync(destPath);
        }
        
        // Create a copy instead of a symlink (more compatible)
        fs.copyFileSync(srcPath, destPath);
        console.log('Successfully created index.mjs as a copy of index.js');
      } catch (linkError) {
        console.error('Error creating symlink or copy:', linkError);
      }
    }
  }
  
} catch (error) {
  console.error('Error fixing ultrahtml package.json:', error);
  process.exit(1);
}
