const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Paths to clean
const pathsToClean = [
  '.nuxt',
  '.output',
  'node_modules/.vite'
];

console.log('Cleaning Nuxt cache directories...');
pathsToClean.forEach(dirPath => {
  const fullPath = path.resolve(__dirname, '..', dirPath);
  if (fs.existsSync(fullPath)) {
    try {
      console.log(`Removing ${dirPath}...`);
      execSync(`rm -rf ${fullPath}`);
    } catch (error) {
      console.error(`Error removing ${dirPath}:`, error.message);
    }
  }
});

console.log('Starting development server...');
try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting development server:', error.message);
}