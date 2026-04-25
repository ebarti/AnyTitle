const params = new URLSearchParams(location.search);
const tabId = parseInt(params.get("tabId"), 10);
const initial = params.get("initial") || "";

const input = document.getElementById("title-input");
input.value = initial;
input.select();

document.getElementById("ok").addEventListener("click", submit);
document.getElementById("cancel").addEventListener("click", () => window.close());
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    submit();
  } else if (e.key === "Escape") {
    e.preventDefault();
    window.close();
  }
});

async function submit() {
  if (!Number.isFinite(tabId)) {
    window.close();
    return;
  }
  try {
    await browser.runtime.sendMessage({
      type: "applyRename",
      tabId,
      title: input.value
    });
  } catch (e) {
    console.warn("AnyTitle: failed to apply rename —", e.message);
  }
  window.close();
}
