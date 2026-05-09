const path = require('node:path');
const koffi = require('koffi');

const user32 = koffi.load('user32.dll');
const kernel32 = koffi.load('kernel32.dll');
const shell32 = koffi.load('shell32.dll');

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

module.exports = {
  broadcastSettingChange,
  getActiveWindowInfo,
  getWindowsByProcessName,
  runElevated,
  sendHotkey,
  sendVirtualKey
};
