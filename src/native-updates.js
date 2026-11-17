import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { LiveUpdate } from '@capawesome/capacitor-live-update';

const MANIFEST_URL = 'https://danielgx21.github.io/Sudoklue/updates/latest.json';
const BUNDLED_VERSION = '1.0.0';
const NATIVE_FORMAT = 1;

async function checkForUpdates() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LiveUpdate.ready();
    const response = await CapacitorHttp.get({
      url: MANIFEST_URL + '?timestamp=' + Date.now(),
      connectTimeout: 8000,
      readTimeout: 8000,
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (response.status !== 200) return;
    const release = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    if (release.nativeFormat !== NATIVE_FORMAT ||
        !/^[\w.-]+$/.test(release.bundleId || '') ||
        !/^[a-f0-9]{64}$/.test(release.sha256 || '') ||
        !release.url) return;
    const url = new URL(release.url, MANIFEST_URL);
    if (url.protocol !== 'https:' || url.hostname !== 'danielgx21.github.io') return;
    const current = await LiveUpdate.getCurrentBundle();
    const queued = await LiveUpdate.getNextBundle();
    if (release.bundleId === (current.bundleId || BUNDLED_VERSION) ||
        release.bundleId === queued.bundleId) return;
    await LiveUpdate.downloadBundle({
      url: url.href,
      bundleId: release.bundleId,
      checksum: release.sha256
    });
    await LiveUpdate.setNextBundle({ bundleId: release.bundleId });
    // O jogo nunca reinicia no meio de uma fase.
    const toast = document.createElement('div');
    toast.textContent = 'Atualização preparada. Ela será aplicada na próxima abertura.';
    toast.setAttribute('role','status');
    Object.assign(toast.style, {
      position:'fixed',zIndex:'99999',bottom:'18px',left:'12px',right:'12px',
      background:'#563082',color:'#fff7db',fontWeight:'bold',
      textAlign:'center',padding:'12px 14px',borderRadius:'14px',
      boxShadow:'0 5px 18px #1b0d3970',pointerEvents:'none'
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 6000);
  } catch (err) {
    // Falha de rede ou atualizador: continuar com os arquivos locais.
    console.debug('Sudoklue: atualização indisponível', err);
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkForUpdates, { once: true });
} else {
  checkForUpdates();
}
