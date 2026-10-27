// All openings: renders the job cards, filters them by search text and team
(function () {
  var JOBS = CK_JOBS;

  var grid = document.querySelector(".jobs-grid");
  var filters = document.querySelector(".jobs-filters");
  var form = document.querySelector(".jobs-search");
  var input = document.getElementById("jobs-query");
  var count = document.querySelector(".jobs__count");
  var empty = document.querySelector(".jobs__empty");

  var activeTeam = "All";

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function cardHtml(job, i) {
    return (
      '<a class="job-card" href="job.html?id=' + encodeURIComponent(job.id) + '" style="--i: ' + i + '">' +
        '<div class="job-card__body">' +
          '<div class="job-card__head">' +
            '<p class="job-card__category">' + escapeHtml(job.category.toUpperCase()) + "</p>" +
            '<p class="job-card__title">' + escapeHtml(job.title) + "</p>" +
          "</div>" +
          '<div class="job-card__meta">' +
            "<span>" + escapeHtml(job.type) + "</span>" +
            '<img src="assets/card-divider.svg" alt="" />' +
            "<span>" + escapeHtml(job.location) + "</span>" +
          "</div>" +
        "</div>" +
      "</a>"
    );
  }

  function render(animate) {
    var query = input.value.trim().toLowerCase();
    var matches = JOBS.filter(function (job) {
      if (activeTeam !== "All" && job.category !== activeTeam) return false;
      if (!query) return true;
      return [job.title, job.category, job.location, job.type].join(" ").toLowerCase().indexOf(query) !== -1;
    });

    grid.innerHTML = matches.map(cardHtml).join("");
    // After the first paint, filtering re-deals the cards without the page-load delay
    requestAnimationFrame(function () {
      setTimeout(function () { grid.classList.add("is-settled"); }, 1500);
    });
    // Soft staggered entrance when the team changes (not on every keystroke)
    if (animate) {
      Array.prototype.forEach.call(grid.children, function (card, i) {
        card.style.animationDelay = i * 60 + "ms";
        card.classList.add("job-card--enter");
      });
    }
    count.textContent = matches.length + (matches.length === 1 ? " opening" : " openings");
    empty.hidden = matches.length > 0;
  }

  // One chip per team, in the order teams first appear
  var teams = ["All"];
  JOBS.forEach(function (job) {
    if (teams.indexOf(job.category) === -1) teams.push(job.category);
  });
  filters.innerHTML = teams
    .map(function (team) {
      return '<button type="button" aria-pressed="' + (team === activeTeam) + '">' + escapeHtml(team) + "</button>";
    })
    .join("");

  filters.addEventListener("click", function (e) {
    var chip = e.target.closest("button");
    if (!chip) return;
    activeTeam = chip.textContent;
    filters.querySelectorAll("button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b === chip));
    });
    render(true);
  });

  input.addEventListener("input", render);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    render();
    grid.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Prefill from ?q= so the home page search can hand off here
  var q = new URLSearchParams(location.search).get("q");
  if (q) input.value = q;

  render();
})();
