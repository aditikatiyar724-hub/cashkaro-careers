// Second card row: plays its appear animation once it scrolls into view.
(function () {
  var row = document.querySelector(".job-row");
  if (!row) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    row.classList.add("is-visible");
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    row.classList.add("is-visible");
    observer.disconnect();
  }, { threshold: 0.25 });

  observer.observe(row);
})();
