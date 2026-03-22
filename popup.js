document.getElementById('inject').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const status = document.getElementById('status');

  if (!tab?.url?.includes('realfeed.lol')) {
    status.textContent = 'Error: Open realfeed.lol first';
    status.style.color = '#ef4444';
    return;
  }

  status.textContent = 'Injecting...';
  status.style.color = '#10b981';

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectPanel
    });
    status.textContent = 'Injected! Check bottom-right on the page';
  } catch (err) {
    status.textContent = 'Injection failed: ' + err.message;
    status.style.color = '#ef4444';
    console.error(err);
  }
});

// This function runs in the context of realfeed.lol tab
function injectPanel() {
  if (document.getElementById('rf-tool-panel')) {
    console.log('[Tool] Already injected');
    return;
  }

  // Try to guess username from page (adjust selectors if needed)
  let username = 'unknown';
  const userEl = document.querySelector('a[href^="/@"], span.font-bold, [data-username], .profile-name');
  if (userEl) username = userEl.textContent.trim().replace(/^@/, '');

  const panel = document.createElement('div');
  panel.id = 'rf-tool-panel';
  panel.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; width: 360px; max-height: 80vh;
    background: #111827; border: 1px solid #4b5563; border-radius: 12px;
    z-index: 999999; box-shadow: 0 10px 30px rgba(0,0,0,0.7); color: #e5e7eb;
    font-family: system-ui, sans-serif; overflow-y: auto;
  `;

  panel.innerHTML = `
    <div style="background: #1f2937; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #374151;">
      <div style="font-weight: 600;">RealFeed Tools</div>
      <button onclick="this.closest('#rf-tool-panel').remove()" style="background:none; border:none; color:#9ca3af; cursor:pointer; font-size:18px; padding:0;">×</button>
    </div>
    <div style="padding: 16px;">
      <div style="margin-bottom: 16px; font-size: 13px; color: #9ca3af;">
        Logged in as <strong>@${username}</strong>
      </div>
      <button style="background:#10b981; color:white; border:none; padding:10px; border-radius:6px; width:100%; margin-bottom:10px; cursor:pointer; font-weight:500;">
        ❤️ Like All Visible
      </button>
      <button style="background:#3b82f6; color:white; border:none; padding:10px; border-radius:6px; width:100%; margin-bottom:10px; cursor:pointer; font-weight:500;">
        👥 Follow Visible Users
      </button>
      <button style="background:#ef4444; color:white; border:none; padding:10px; border-radius:6px; width:100%; margin-bottom:10px; cursor:pointer; font-weight:500;">
        🗑️ Clear DMs (Danger)
      </button>
      <div style="margin-top: 20px; font-size: 11px; color: #6b7280; text-align: center;">
        Customize buttons here later
      </div>
    </div>
  `;

  document.body.appendChild(panel);
  console.log('[RealFeed Tool] Panel injected');
}
