const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const generatedDirectories = new Set(['bin', 'obj', 'publish', 'node_modules']);

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return generatedDirectories.has(entry.name) ? [] : filesIn(filename);
    }
    return entry.isFile() ? [filename] : [];
  });
}

const files = ['src', 'test', 'scripts'].flatMap((directory) => filesIn(path.join(root, directory)));
const javaScriptFiles = files.filter((filename) => filename.endsWith('.js'));
for (const filename of javaScriptFiles) {
  const result = spawnSync(process.execPath, ['--check', filename], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

const jsonFiles = files.filter((filename) => filename.endsWith('.json'));
jsonFiles.push(path.join(root, 'package.json'), path.join(root, 'package-lock.json'));
for (const filename of jsonFiles) {
  JSON.parse(fs.readFileSync(filename, 'utf8'));
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
assert.equal(pkg.version, lock.version, 'Package and lockfile versions must match');
assert.equal(pkg.version, lock.packages[''].version, 'Lockfile root version must match');
for (const field of ['dependencies', 'devDependencies', 'optionalDependencies', 'engines']) {
  assert.deepEqual(pkg[field] || {}, lock.packages[''][field] || {}, `${field} must match the lockfile`);
}

console.log(`Validated ${javaScriptFiles.length} JavaScript files, ${jsonFiles.length} JSON files, and package/lockfile consistency.`);
