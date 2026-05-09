const { execFile } = require('node:child_process');
const os = require('node:os');
const { getActiveWindowInfo } = require('./win32');

const KNOWN_GAME_PROCESSES = new Set([
  'cs2',
  'csgo',
  'valorant',
  'valorant-win64-shipping',
  'fortniteclient-win64-shipping',
  'leagueclient',
  'league of legends',
  'r5apex',
  'gta5',
  'eldenring',
  'cyberpunk2077',
  'witcher3',
  'dota2',
  'overwatch',
  'destiny2',
  'minecraft',
  'robloxplayerbeta'
]);

let previousCpuTimes = readCpuTimes();

function round(value, digits = 0) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function readCpuTimes() {
  return os.cpus().reduce(
    (accumulator, cpu) => {
      const total = Object.values(cpu.times).reduce((sum, value) => sum + value, 0);
      return {
        idle: accumulator.idle + cpu.times.idle,
        total: accumulator.total + total
      };
    },
    { idle: 0, total: 0 }
  );
}

function getCpuUsage() {
  const current = readCpuTimes();
  const idleDelta = current.idle - previousCpuTimes.idle;
  const totalDelta = current.total - previousCpuTimes.total;
  previousCpuTimes = current;

  if (totalDelta <= 0) {
    return null;
  }

  return (1 - idleDelta / totalDelta) * 100;
}

function getMemoryStats() {
  const total = os.totalmem();
  const used = total - os.freemem();

  return {
    used,
    total,
    usage: total ? (used / total) * 100 : null
  };
}

function runExecutable(command, args, timeoutMs = 2200) {
  return new Promise((resolve, reject) => {
    execFile(
      command,
      args,
      { windowsHide: true, timeout: timeoutMs, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
          return;
        }

        resolve(stdout.trim());
      }
    );
  });
}

async function runFirstAvailable(commands, args, timeoutMs = 2200) {
  let lastError;

  for (const command of commands) {
    try {
      return await runExecutable(command, args, timeoutMs);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function getActiveWindow() {
  try {
    return getActiveWindowInfo();
  } catch {
    return {
      title: '',
      processName: '',
      pid: null,
      path: ''
    };
  }
}

async function getNvidiaGpuStats() {
  try {
    const output = await runFirstAvailable(
      [
        'nvidia-smi.exe',
        'C:\\Windows\\System32\\nvidia-smi.exe',
        'C:\\Program Files\\NVIDIA Corporation\\NVSMI\\nvidia-smi.exe'
      ],
      [
        '--query-gpu=name,utilization.gpu,temperature.gpu,memory.total',
        '--format=csv,noheader,nounits'
      ]
    );
    const firstLine = output.split(/\r?\n/).find(Boolean);
    if (!firstLine) {
      return { name: null, usage: null, temp: null, vram: null };
    }

    const [name, usage, temp, vram] = firstLine.split(',').map((value) => value.trim());
    return {
      name: name || null,
      usage: Number.isFinite(Number(usage)) ? Number(usage) : null,
      temp: Number.isFinite(Number(temp)) ? Number(temp) : null,
      vram: Number.isFinite(Number(vram)) ? Number(vram) / 1024 : null
    };
  } catch {
    return { name: null, usage: null, temp: null, vram: null };
  }
}

async function getGpuStats() {
  const nvidia = await getNvidiaGpuStats();
  if (nvidia.usage !== null || nvidia.temp !== null) {
    return nvidia;
  }

  return {
    name: null,
    usage: null,
    temp: null,
    vram: null
  };
}

async function getGameFps() {
  return null;
}

function isGameProcess(processName) {
  return KNOWN_GAME_PROCESSES.has(String(processName || '').toLowerCase());
}

async function getSystemSnapshot() {
  const [activeWindow, gpuStats, fps] = await Promise.all([
    getActiveWindow(),
    getGpuStats(),
    getGameFps()
  ]);

  const cpuUsage = getCpuUsage();
  const mem = getMemoryStats();
  const activeProcess = activeWindow.processName || '';
  const gameDetected = isGameProcess(activeProcess);

  return {
    updatedAt: new Date().toISOString(),
    cpu: {
      usage: round(cpuUsage, 0),
      temp: null
    },
    memory: {
      used: round(mem.used / 1024 / 1024 / 1024, 1),
      total: round(mem.total / 1024 / 1024 / 1024, 1),
      usage: round((mem.used / mem.total) * 100, 0)
    },
    gpu: {
      name: gpuStats.name || 'GPU',
      usage: round(gpuStats.usage, 0),
      temp: round(gpuStats.temp, 0),
      vram: round(gpuStats.vram, 1)
    },
    activeWindow: {
      title: activeWindow.title || '',
      processName: activeProcess,
      pid: activeWindow.pid
    },
    game: {
      detected: gameDetected,
      processName: gameDetected ? activeProcess : '',
      fps
    }
  };
}

module.exports = {
  getSystemSnapshot
};
