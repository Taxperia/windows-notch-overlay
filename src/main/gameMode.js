const KNOWN_GAMES = new Set([
  'cs2', 'csgo', 'valorant', 'valorant-win64-shipping',
  'fortniteclient-win64-shipping', 'league of legends', 'r5apex',
  'gta5', 'gta5_enhanced', 'eldenring', 'cyberpunk2077', 'witcher3',
  'dota2', 'overwatch', 'destiny2', 'minecraft', 'robloxplayerbeta',
  'rocketleague', 'tslgame', 'deadbydaylight-win64-shipping', 'helldivers2'
]);

function processKey(name) {
  return String(name || '').trim().toLowerCase().replace(/\.exe$/i, '');
}

function isGameProcess(name, customProcesses = '') {
  const key = processKey(name);
  if (!key) return false;
  // Java hosts desktop applications too; javaw can be added explicitly for Minecraft.
  return KNOWN_GAMES.has(key)
    || String(customProcesses).split(/[;,\n]/).some((item) => processKey(item) === key);
}

function nextGameState(previous, foreground, settings, ownPid) {
  if (settings?.enabled === false) return { active: false, processName: '' };
  // Our own overlay taking focus must never make a running game interactive again.
  if (foreground?.pid === ownPid) return previous;
  const active = isGameProcess(foreground?.processName, settings?.customProcesses);
  return { active, processName: active ? foreground.processName : '' };
}

module.exports = { isGameProcess, nextGameState };
