const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const projectRoot = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

function mainJavaScript() {
  const directory = path.join(projectRoot, 'src', 'main');
  return fs.readdirSync(directory)
    .filter((name) => name.endsWith('.js'))
    .map((name) => ({ name, source: fs.readFileSync(path.join(directory, name), 'utf8') }));
}

test('privileged process launches do not use bare executable names', () => {
  const bareExecutable = /(?:execFile|execFileText|run|runDetached)\(\s*['"]([^\\/:'"]+\.exe)['"]/g;
  const bareFallbackExecutable = /runFirstAvailable\(\s*\[\s*['"]([^\\/:'"]+\.exe)['"]/g;
  const findings = [];

  for (const file of mainJavaScript()) {
    for (const pattern of [bareExecutable, bareFallbackExecutable]) {
      for (const match of file.source.matchAll(pattern)) {
        findings.push(`${file.name}: ${match[1]}`);
      }
    }
  }

  assert.deepEqual(findings, []);
});

test('renderer cannot ask the main process to open arbitrary local paths', () => {
  assert.doesNotMatch(read('src/main/index.js'), /shell\.openPath\s*\(/);
});

test('renderer CSP keeps executable and navigation capabilities closed', () => {
  for (const page of ['src/renderer/index.html', 'src/renderer/media-window.html']) {
    const html = read(page);
    for (const directive of [
      "script-src 'self'",
      "object-src 'none'",
      "base-uri 'none'",
      "form-action 'none'",
      "frame-ancestors 'none'"
    ]) {
      assert.match(html, new RegExp(directive.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${page}: ${directive}`);
    }
  }
});

test('the media window bridge only exposes media and window channels', () => {
  const preload = read('src/media-preload.js');
  const channels = [...preload.matchAll(/ipcRenderer\.(?:invoke|send|on)\('([^']+)'/g)].map((match) => match[1]);
  const subscribed = [...preload.matchAll(/subscribe\('([^']+)'/g)].map((match) => match[1]);
  for (const channel of [...channels, ...subscribed]) {
    assert.match(channel, /^(media:|media-window:|settings:get$|settings:update$)/, channel);
  }
  assert.doesNotMatch(preload, /settings:update'\s*,\s*patch|quick:action|external-app|search:web/);
});
