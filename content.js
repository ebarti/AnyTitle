(function () {
  if (window.top !== window) return;

  let customTitle = null;
  let titleEl = null;
  let titleObserver = null;
  let headObserver = null;

  function ensureTitleEl() {
    titleEl = document.querySelector("title");
    if (!titleEl) {
      titleEl = document.createElement("title");
      (document.head || document.documentElement).appendChild(titleEl);
    }
    return titleEl;
  }

  function applyTitle() {
    if (customTitle === null) return;
    ensureTitleEl();
    if (titleEl.textContent !== customTitle) {
      titleEl.textContent = customTitle;
    }
  }

  function startObserving() {
    stopObserving();
    ensureTitleEl();

    titleObserver = new MutationObserver(applyTitle);
    titleObserver.observe(titleEl, {
      childList: true,
      characterData: true,
      subtree: true
    });

    headObserver = new MutationObserver(() => {
      const current = document.querySelector("title");
      if (current && current !== titleEl) {
        startObserving();
        applyTitle();
      }
    });
    headObserver.observe(document.head || document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function stopObserving() {
    if (titleObserver) {
      titleObserver.disconnect();
      titleObserver = null;
    }
    if (headObserver) {
      headObserver.disconnect();
      headObserver = null;
    }
  }

  function setCustomTitle(title) {
    customTitle = title;
    if (title === null) {
      stopObserving();
    } else {
      startObserving();
      applyTitle();
    }
  }

  browser.runtime.onMessage.addListener((msg) => {
    if (!msg) return;
    if (msg.type === "setCustomTitle") {
      setCustomTitle(msg.title);
      return Promise.resolve({ ok: true });
    }
  });

  browser.runtime
    .sendMessage({ type: "getStoredTitle" })
    .then((response) => {
      if (response && response.title) {
        setCustomTitle(response.title);
      }
    })
    .catch(() => {});
})();
