const customTitles = new Map();

browser.menus.removeAll().then(() => {
  browser.menus.create({
    id: "rename-tab",
    title: "Rename Tab",
    contexts: ["tab"]
  });
});

browser.menus.onClicked.addListener(async (info, tab) => {
  if (!tab) return;
  if (info.menuItemId === "rename-tab") {
    await renameTab(tab);
  }
});

async function renameTab(tab) {
  const initial = customTitles.get(tab.id) || tab.title || "";
  const url =
    browser.runtime.getURL("rename.html") +
    `?tabId=${tab.id}` +
    `&initial=${encodeURIComponent(initial)}`;

  await browser.windows.create({
    url,
    type: "popup",
    width: 420,
    height: 170,
    allowScriptsToClose: true
  });
}

async function applyRename(tabId, title) {
  try {
    await browser.tabs.get(tabId);
  } catch (e) {
    return { ok: false };
  }

  const trimmed = title == null ? "" : String(title).trim();

  if (trimmed === "") {
    if (!customTitles.has(tabId)) return { ok: true };
    customTitles.delete(tabId);
    try {
      await browser.tabs.sendMessage(tabId, {
        type: "setCustomTitle",
        title: null
      });
    } catch (e) {}
    try {
      await browser.tabs.reload(tabId);
    } catch (e) {}
    return { ok: true };
  }

  customTitles.set(tabId, trimmed);
  try {
    await browser.tabs.sendMessage(tabId, {
      type: "setCustomTitle",
      title: trimmed
    });
  } catch (e) {
    console.warn("AnyTitle: failed to apply title —", e.message);
  }
  return { ok: true };
}

browser.runtime.onMessage.addListener((msg, sender) => {
  if (!msg) return;
  if (msg.type === "getStoredTitle" && sender.tab) {
    return Promise.resolve({ title: customTitles.get(sender.tab.id) || null });
  }
  if (msg.type === "applyRename") {
    return applyRename(msg.tabId, msg.title);
  }
});

browser.tabs.onRemoved.addListener((tabId) => {
  customTitles.delete(tabId);
});
