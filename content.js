(() => {
  const FOR_YOU_LABELS = new Set(["for you", "\u304a\u3059\u3059\u3081"]);
  const FOLLOWING_LABELS = new Set(["following", "\u30d5\u30a9\u30ed\u30fc\u4e2d"]);
  const TAB_SELECTOR =
    '[role="tab"], [role="tablist"] a, [role="tablist"] button';

  let scanScheduled = false;

  function normalize(value) {
    return value.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function tabFor(element) {
    return element.closest('[role="tab"]') || element;
  }

  function labelsFor(element) {
    return [
      element.getAttribute("aria-label"),
      element.getAttribute("title"),
      element.innerText,
      element.textContent,
    ]
      .filter(Boolean)
      .map(normalize);
  }

  function getTabs() {
    return [...new Set([...document.querySelectorAll(TAB_SELECTOR)].map(tabFor))];
  }

  function isSelected(tab) {
    return (
      tab.getAttribute("aria-selected") === "true" ||
      tab.getAttribute("aria-current") === "page" ||
      tab.getAttribute("aria-pressed") === "true"
    );
  }

  function hideForYouTabs() {
    let selectedForYou = false;
    let followingTab = null;

    getTabs().forEach((tab) => {
      const labels = labelsFor(tab);

      if ([...FOR_YOU_LABELS].some((label) => labels.includes(label))) {
        tab.setAttribute("data-x-for-you-hidden", "true");
        selectedForYou ||= isSelected(tab);
      } else if ([...FOLLOWING_LABELS].some((label) => labels.includes(label))) {
        followingTab = tab;
      }
    });

    if (selectedForYou && followingTab && !isSelected(followingTab)) {
      followingTab.click();
    }
  }

  function scheduleScan() {
    if (scanScheduled) return;
    scanScheduled = true;

    requestAnimationFrame(() => {
      scanScheduled = false;
      hideForYouTabs();
    });
  }

  const observer = new MutationObserver(scheduleScan);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: [
      "aria-label",
      "aria-current",
      "aria-pressed",
      "aria-selected",
      "role",
      "title",
    ],
  });

  scheduleScan();
})();
