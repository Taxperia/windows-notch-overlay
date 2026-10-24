const path = require('node:path');
const koffi = require('koffi');

const user32 = koffi.load('user32.dll');
const kernel32 = koffi.load('kernel32.dll');
const shell32 = koffi.load('shell32.dll');
const advapi32 = koffi.load('advapi32.dll');

const DWORD = koffi.alias('DWORD', 'uint32_t');
const HANDLE = koffi.pointer('HANDLE', koffi.opaque());
const HWND = koffi.alias('HWND', HANDLE);

const PROCESS_QUERY_LIMITED_INFORMATION = 0x1000;
const KEYEVENTF_KEYUP = 0x0002;
const HWND_BROADCAST = 0xffff;
const WM_SETTINGCHANGE = 0x001a;
const SMTO_ABORTIFHUNG = 0x0002;
const MAX_WINDOW_TEXT = 512;
const MAX_PROCESS_PATH = 32768;
// HKEY_CURRENT_USER is the sign-extended 0x80000001 handle.
const HKEY_CURRENT_USER = -2147483647;
const KEY_READ = 0x20019;
const RRF_RT_REG_QWORD = 0x40;
const ERROR_SUCCESS = 0;
const MAX_REGISTRY_KEY_NAME = 256;
const CONSENT_STORE_PATH = 'Software\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore';
const CONSENT_CAPABILITIES = new Set(['webcam', 'microphone']);
const BATTERY_FLAG_CHARGING = 8;
const BATTERY_FLAG_NO_BATTERY = 128;
const BATTERY_FLAG_UNKNOWN = 255;

const GetForegroundWindow = user32.func('HWND __stdcall GetForegroundWindow()');
const GetWindowText = user32.func('int __stdcall GetWindowTextW(HWND hWnd, _Out_ char16_t *lpString, int nMaxCount)');
const GetWindowThreadProcessId = user32.func('DWORD __stdcall GetWindowThreadProcessId(HWND hWnd, _Out_ DWORD *lpdwProcessId)');
const keybdEvent = user32.func('void __stdcall keybd_event(uint8_t bVk, uint8_t bScan, DWORD dwFlags, uintptr_t dwExtraInfo)');
const SendMessageTimeout = user32.func(
  'uintptr_t __stdcall SendMessageTimeoutW(HWND hWnd, uint32_t Msg, uintptr_t wParam, const char16_t *lParam, uint32_t fuFlags, uint32_t uTimeout, _Out_ uintptr_t *lpdwResult)'
);

const OpenProcess = kernel32.func('HANDLE __stdcall OpenProcess(DWORD dwDesiredAccess, bool bInheritHandle, DWORD dwProcessId)');
const QueryFullProcessImageName = kernel32.func(
  'bool __stdcall QueryFullProcessImageNameW(HANDLE hProcess, DWORD dwFlags, _Out_ char16_t *lpExeName, _Inout_ DWORD *lpdwSize)'
);
const CloseHandle = kernel32.func('bool __stdcall CloseHandle(HANDLE hObject)');
const ShellExecute = shell32.func(
  'intptr_t __stdcall ShellExecuteW(HWND hwnd, const char16_t *lpOperation, const char16_t *lpFile, const char16_t *lpParameters, const char16_t *lpDirectory, int nShowCmd)'
);
const EnumWindowsProc = koffi.proto('bool __stdcall EnumWindowsProc(HWND hWnd, intptr_t lParam)');
const EnumWindows = user32.func('bool __stdcall EnumWindows(EnumWindowsProc *lpEnumFunc, intptr_t lParam)');
const IsWindowVisible = user32.func('bool __stdcall IsWindowVisible(HWND hWnd)');
const SYSTEM_POWER_STATUS = koffi.struct('SYSTEM_POWER_STATUS', {
  ACLineStatus: 'uint8_t',
  BatteryFlag: 'uint8_t',
  BatteryLifePercent: 'uint8_t',
  SystemStatusFlag: 'uint8_t',
  BatteryLifeTime: 'uint32_t',
  BatteryFullLifeTime: 'uint32_t'
});
const GetSystemPowerStatus = kernel32.func('bool __stdcall GetSystemPowerStatus(_Out_ SYSTEM_POWER_STATUS *lpSystemPowerStatus)');
const RegOpenKeyEx = advapi32.func(
  'int32_t __stdcall RegOpenKeyExW(intptr_t hKey, const char16_t *lpSubKey, uint32_t ulOptions, uint32_t samDesired, _Out_ intptr_t *phkResult)'
);
const RegEnumKeyEx = advapi32.func(
  'int32_t __stdcall RegEnumKeyExW(intptr_t hKey, uint32_t dwIndex, _Out_ char16_t *lpName, _Inout_ uint32_t *lpcchName, void *lpReserved, void *lpClass, void *lpcchClass, void *lpftLastWriteTime)'
);
const RegGetValue = advapi32.func(
  'int32_t __stdcall RegGetValueW(intptr_t hkey, const char16_t *lpSubKey, const char16_t *lpValue, uint32_t dwFlags, void *pdwType, void *pvData, _Inout_ uint32_t *pcbData)'
);
const RegCloseKey = advapi32.func('int32_t __stdcall RegCloseKey(intptr_t hKey)');

function decodeUtf16(buffer, length) {
  if (!length) {
    return '';
  }

  return koffi.decode(buffer, 'char16_t', length);
}

function getWindowTitle(hwnd) {
  const buffer = Buffer.alloc(MAX_WINDOW_TEXT * 2);
  const length = GetWindowText(hwnd, buffer, MAX_WINDOW_TEXT);
  return decodeUtf16(buffer, length);
}

function getProcessPath(pid) {
  const handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid);
  if (!handle) {
    return '';
  }

  try {
    const buffer = Buffer.alloc(MAX_PROCESS_PATH * 2);
    const size = [MAX_PROCESS_PATH];
    const ok = QueryFullProcessImageName(handle, 0, buffer, size);
    return ok ? decodeUtf16(buffer, size[0]) : '';
  } finally {
    CloseHandle(handle);
  }
}

function getActiveWindowInfo() {
  const hwnd = GetForegroundWindow();
  if (!hwnd) {
    return {
      title: '',
      processName: '',
      pid: null,
      path: ''
    };
  }

  const pidOut = [0];
  const threadId = GetWindowThreadProcessId(hwnd, pidOut);
  const pid = pidOut[0] || null;
  const processPath = pid ? getProcessPath(pid) : '';

  return {
    title: getWindowTitle(hwnd),
    processName: processPath ? path.basename(processPath, path.extname(processPath)) : '',
    pid: threadId ? pid : null,
    path: processPath
  };
}

function getWindowsByProcessName(processName) {
  const expectedName = String(processName || '').toLowerCase();
  const windows = [];

  EnumWindows((hwnd) => {
    if (!IsWindowVisible(hwnd)) {
      return true;
    }

    const pidOut = [0];
    GetWindowThreadProcessId(hwnd, pidOut);
    const pid = pidOut[0] || null;
    if (!pid) {
      return true;
    }

    const processPath = getProcessPath(pid);
    const fileName = processPath ? path.basename(processPath).toLowerCase() : '';
    if (fileName !== expectedName) {
      return true;
    }

    windows.push({
      title: getWindowTitle(hwnd),
      processName: path.basename(processPath, path.extname(processPath)),
      pid,
      path: processPath
    });

    return true;
  }, 0);

  return windows;
}

function sendVirtualKey(keyCode) {
  keybdEvent(keyCode, 0, 0, 0);
  keybdEvent(keyCode, 0, KEYEVENTF_KEYUP, 0);
}

function sendHotkey(modifiers, keyCode) {
  for (const modifier of modifiers) {
    keybdEvent(modifier, 0, 0, 0);
  }

  sendVirtualKey(keyCode);

  for (const modifier of [...modifiers].reverse()) {
    keybdEvent(modifier, 0, KEYEVENTF_KEYUP, 0);
  }
}

function broadcastSettingChange(area = 'ImmersiveColorSet') {
  const result = [0];
  SendMessageTimeout(
    HWND_BROADCAST,
    WM_SETTINGCHANGE,
    0,
    area,
    SMTO_ABORTIFHUNG,
    100,
    result
  );
}

function runElevated(file, parameters = '') {
  const result = Number(ShellExecute(null, 'runas', file, parameters, null, 0));
  if (result <= 32) {
    throw new Error(`Elevated launch failed: ${result}`);
  }

  return {
    ok: true,
    result
  };
}

function getPowerStatus() {
  const status = {};
  if (!GetSystemPowerStatus(status)) {
    return { available: false };
  }

  const hasBattery = status.BatteryFlag !== BATTERY_FLAG_NO_BATTERY
    && status.BatteryFlag !== BATTERY_FLAG_UNKNOWN
    && status.BatteryLifePercent <= 100;

  return {
    available: true,
    hasBattery,
    onAc: status.ACLineStatus === 1,
    charging: hasBattery && (status.BatteryFlag & BATTERY_FLAG_CHARGING) !== 0,
    percent: hasBattery ? status.BatteryLifePercent : null
  };
}

function openRegistryKey(parent, subKey) {
  const handle = [0];
  return RegOpenKeyEx(parent, subKey, 0, KEY_READ, handle) === ERROR_SUCCESS ? handle[0] : null;
}

function listRegistrySubkeys(handle) {
  const names = [];
  const buffer = Buffer.alloc(MAX_REGISTRY_KEY_NAME * 2);

  for (let index = 0; ; index += 1) {
    const length = [MAX_REGISTRY_KEY_NAME];
    if (RegEnumKeyEx(handle, index, buffer, length, null, null, null, null) !== ERROR_SUCCESS) {
      return names;
    }
    names.push(decodeUtf16(buffer, length[0]));
  }
}

function readRegistryQword(handle, subKey, valueName) {
  const data = Buffer.alloc(8);
  const size = [8];
  if (RegGetValue(handle, subKey, valueName, RRF_RT_REG_QWORD, null, data, size) !== ERROR_SUCCESS) {
    return null;
  }
  return data.readBigUInt64LE(0);
}

function isCapabilityInUse(handle, subKey) {
  const startedAt = readRegistryQword(handle, subKey, 'LastUsedTimeStart');
  const stoppedAt = readRegistryQword(handle, subKey, 'LastUsedTimeStop');
  return startedAt !== null && startedAt > 0n && stoppedAt === 0n;
}

function packagedAppName(packageFamilyName) {
  const packageName = packageFamilyName.replace(/_[^_]+$/, '');
  return packageName.split('.').filter(Boolean).pop() || packageName;
}

function listCapabilityKeyUsers(handle, packaged) {
  const ownPath = process.execPath.toLowerCase();

  return listRegistrySubkeys(handle)
    .filter((name) => (packaged ? name !== 'NonPackaged' : true) && isCapabilityInUse(handle, name))
    .map((name) => {
      if (packaged) {
        return { id: name, name: packagedAppName(name) };
      }
      const executablePath = name.replace(/#/g, '\\');
      return {
        id: name,
        name: path.win32.basename(executablePath).replace(/\.exe$/i, ''),
        path: executablePath
      };
    })
    .filter((user) => !user.path || user.path.toLowerCase() !== ownPath);
}

function getCapabilityUsers(capability) {
  if (!CONSENT_CAPABILITIES.has(capability)) {
    throw new Error(`Unknown capability: ${capability}`);
  }

  const root = openRegistryKey(HKEY_CURRENT_USER, `${CONSENT_STORE_PATH}\\${capability}`);
  if (root === null) {
    return [];
  }

  try {
    const users = listCapabilityKeyUsers(root, true);
    const nonPackaged = openRegistryKey(root, 'NonPackaged');
    if (nonPackaged !== null) {
      try {
        users.push(...listCapabilityKeyUsers(nonPackaged, false));
      } finally {
        RegCloseKey(nonPackaged);
      }
    }
    return users;
  } finally {
    RegCloseKey(root);
  }
}

module.exports = {
  broadcastSettingChange,
  getActiveWindowInfo,
  getCapabilityUsers,
  getPowerStatus,
  getWindowsByProcessName,
  runElevated,
  sendHotkey,
  sendVirtualKey
};
