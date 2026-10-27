// Why CashKaro: once the section scrolls into view the store photo slowly settles back from a zoom while the cards rise in.
(function () {
  var why = document.querySelector(".why");
  if (!why) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

  why.classList.add("why--zoom");

  var observer = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    why.classList.add("is-visible");
    observer.disconnect();
  }, { threshold: 0.25 });

  observer.observe(why);
})();
