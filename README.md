# AnyTitle

A Firefox extension that lets you set a custom title on any tab. Right-click a tab → **Rename Tab** → type the title you want. The custom title sticks for the lifetime of the tab, even as you navigate, until you reset it or close the tab.

## Features

- Top-level **Rename Tab** entry on the tab context menu — works on any tab, even when it's not in focus.
- Custom title persists across navigations within the same tab.
- Holds the title against pages that try to overwrite it (SPAs, dynamic title updates).
- Leave the field empty in the rename dialog to reset the tab to its original title.
- No persistence across restarts: titles live only as long as the tab does.

## Install (temporary)

1. Clone the repo.
2. Open `about:debugging#/runtime/this-firefox` in Firefox.
3. Click **Load Temporary Add-on…** and select `manifest.json`.

The extension stays loaded until Firefox restarts. For a permanent install, package and sign through [addons.mozilla.org](https://addons.mozilla.org/).

## Usage

- **Rename**: right-click any tab → **Rename Tab** → enter a title → Enter.
- **Reset**: right-click the renamed tab → **Rename Tab** → clear the field → Enter. The tab reloads to restore its original title.

## How it works

- A small popup window collects the new title (so it works even on background tabs, where `window.prompt()` can't render).
- The background script holds a `tabId → customTitle` map in memory and cleans up on `tabs.onRemoved`.
- A content script watches the `<title>` element with a `MutationObserver` and re-pins the custom title whenever the page tries to change it. On full navigations, the content script asks the background for any stored title and re-applies it.

## License

MIT — see [LICENSE](LICENSE).
