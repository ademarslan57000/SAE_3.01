window.toggleSidebar = function () {
  const sidebar = document.getElementById("sidebar");
  const map = document.getElementById("map");
  const btn = document.getElementById("toggleSidebarBtn");

  sidebar.classList.toggle("open");

  const isOpen = sidebar.classList.contains("open");
  const isDesktop = window.innerWidth >= 769;

  if (isDesktop) {
    map.style.marginLeft = isOpen ? "350px" : "0";
    map.style.width = isOpen ? "calc(100% - 350px)" : "100%";
  }

  btn.textContent = isOpen ? "◀" : "▶";
  map.invalidateSize?.();
};

window.addEventListener("load", () => {
  if (window.innerWidth >= 769) {
    const sidebar = document.getElementById("sidebar");
    const map = document.getElementById("map");
    const btn = document.getElementById("toggleSidebarBtn");

    sidebar.classList.add("open");
    map.style.marginLeft = "350px";
    map.style.width = "calc(100% - 350px)";
    btn.textContent = "◀";
  }
});