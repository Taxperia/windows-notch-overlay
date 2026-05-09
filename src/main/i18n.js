const path = require('node:path');
const fs = require('node:fs/promises');

function i18nDir() {
  return path.join(__dirname, '..', 'renderer', 'i18n');
}

async function listLanguages() {
  try {
    const entries = await fs.readdir(i18nDir(), { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => entry.name);

    const languages = await Promise.all(files.map(async (file) => {
      const code = path.basename(file, '.json');
      const dictionary = await readLanguage(code);
      return {
        code,
        name: dictionary?.meta?.name || code.toUpperCase(),
        nativeName: dictionary?.meta?.nativeName || dictionary?.meta?.name || code.toUpperCase()
      };
    }));

    return languages.sort((a, b) => a.code.localeCompare(b.code));
  } catch {
    return [
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
      { code: 'en', name: 'English', nativeName: 'English' }
    ];
  }
}

async function readLanguage(code) {
  const safeCode = String(code || 'tr').replace(/[^a-z0-9_-]/gi, '');
  const target = path.join(i18nDir(), `${safeCode}.json`);
  const raw = await fs.readFile(target, 'utf8');
  return JSON.parse(raw);
}

async function getLanguage(code) {
  try {
    return await readLanguage(code);
  } catch {
    return readLanguage('tr');
  }
}

module.exports = {
  getLanguage,
  listLanguages
};
