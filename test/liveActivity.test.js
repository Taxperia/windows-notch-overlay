const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const Module = require('node:module');
const test = require('node:test');

const fake = {
  endpoint: { available: true, id: 'speakers', level: 40, muted: false },
  details: { name: 'Speakers', headphones: false },
  capabilityUsers: { webcam: [], microphone: [] },
  power: { available: true, hasBattery: true, onAc: false, charging: false, percent: 80 },
  spawnCalls: 0
};
const powerMonitor = new EventEmitter();

const originalLoad = Module._load;
Module._load = function loadWithMocks(request, parent, isMain) {
  if (request === 'electron') {
    return { powerMonitor };
  }
  if (request === './coreAudio') {
    return {
      getDefaultRenderEndpoint: (options = {}) => (
        options.includeDetails === false ? { ...fake.endpoint } : { ...fake.endpoint, ...fake.details }
      )
    };
  }
  if (request === './win32') {
    return {
      getCapabilityUsers: (capability) => fake.capabilityUsers[capability],
      getPowerStatus: () => ({ ...fake.power })
    };
  }
  if (request === 'node:child_process') {
    return {
      spawn: () => {
        fake.spawnCalls += 1;
        throw new Error('spawn must not run in unit tests');
      }
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const { createLiveActivityMonitor } = require('../src/main/liveActivity');
Module._load = originalLoad;

function createMonitor(t, overrides = {}) {
  t.mock.timers.enable({ apis: ['setInterval', 'setTimeout'] });
  const events = [];
  const monitor = createLiveActivityMonitor({
    emit: (event) => events.push(event),
    supportsBrightnessEvents: async () => false,
    ...overrides
  });
  t.after(() => monitor.stop());
  return { monitor, events };
}

test('volume changes are reported after the first sample', (t) => {
  fake.endpoint = { available: true, id: 'speakers', level: 40, muted: false };
  const { monitor, events } = createMonitor(t);
  monitor.configure({ volume: true });
  assert.deepEqual(events, []);

  fake.endpoint = { ...fake.endpoint, level: 55 };
  t.mock.timers.tick(300);
  assert.deepEqual(events, [{ type: 'volume', level: 55, muted: false }]);

  t.mock.timers.tick(300);
  assert.equal(events.length, 1);
});

test('default output device changes are reported with device details', (t) => {
  fake.endpoint = { available: true, id: 'speakers', level: 40, muted: false };
  const { monitor, events } = createMonitor(t);
  monitor.configure({ volume: true, audioOutput: true });

  fake.endpoint = { available: true, id: 'jbl', level: 70, muted: false };
  fake.details = { name: 'JBL Tune 520BT', headphones: true };
  t.mock.timers.tick(300);

  assert.deepEqual(events, [{
    type: 'audio-output',
    deviceId: 'jbl',
    name: 'JBL Tune 520BT',
    headphones: true,
    level: 70,
    muted: false
  }]);
});

test('privacy indicator primes silently and announces newly started apps', (t) => {
  fake.capabilityUsers = { webcam: [], microphone: [{ id: 'discord', name: 'Discord' }] };
  const { monitor, events } = createMonitor(t);
  monitor.configure({ privacy: true });

  assert.deepEqual(events[0].started, { camera: [], microphone: [] });
  assert.deepEqual(monitor.getPrivacyState(), { camera: [], microphone: ['Discord'] });

  fake.capabilityUsers = { webcam: [{ id: 'zoom', name: 'Zoom' }], microphone: [{ id: 'discord', name: 'Discord' }] };
  t.mock.timers.tick(2000);
  assert.deepEqual(events[1].started, { camera: ['Zoom'], microphone: [] });

  monitor.configure({ privacy: false });
  assert.deepEqual(events.at(-1), { type: 'privacy', camera: [], microphone: [], started: { camera: [], microphone: [] } });
});

test('low battery warns once per threshold while discharging', (t) => {
  fake.power = { available: true, hasBattery: true, onAc: false, charging: false, percent: 19 };
  const { monitor, events } = createMonitor(t);
  monitor.configure({ power: true });
  assert.deepEqual(events, [{ type: 'battery-low', percent: 19 }]);

  t.mock.timers.tick(60 * 1000);
  assert.equal(events.length, 1);

  fake.power = { ...fake.power, percent: 9 };
  t.mock.timers.tick(60 * 1000);
  assert.deepEqual(events.at(-1), { type: 'battery-low', percent: 9 });

  fake.power = { ...fake.power, onAc: true, charging: true };
  powerMonitor.emit('on-ac');
  assert.deepEqual(events.at(-1), { type: 'power', charging: true, percent: 9 });
});

test('brightness watcher is not started when WMI brightness events are unsupported', async (t) => {
  fake.spawnCalls = 0;
  const { monitor } = createMonitor(t);
  monitor.configure({ brightness: true });
  await new Promise(setImmediate);
  await new Promise(setImmediate);
  assert.equal(fake.spawnCalls, 0);
});
