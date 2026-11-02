(function () {
  var root = document.documentElement;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  root.classList.add("motion-pending");
  setTimeout(function () {
    root.classList.remove("motion-pending");
  }, 3000);
})();
