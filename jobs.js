// All openings: renders the job cards, filters them by search text and team
(function () {
  // Placeholder roles — replace with the real openings (or fetch from the ATS)
  var JOBS = [
    { category: "Product & Growth", title: "Senior Product Manager", type: "Full time", location: "Delhi", url: "#" },
    { category: "Product & Growth", title: "Growth Marketing Manager", type: "Full time", location: "Gurugram", url: "#" },
    { category: "Engineering", title: "Senior Backend Engineer", type: "Full time", location: "Gurugram", url: "#" },
    { category: "Engineering", title: "Frontend Engineer", type: "Full time", location: "Gurugram", url: "#" },
    { category: "Design", title: "Senior Product Designer", type: "Full time", location: "Gurugram", url: "#" },
    { category: "Business", title: "Affiliate Partnerships Lead", type: "Full time", location: "Delhi", url: "#" },
    { category: "Business", title: "Category Manager", type: "Full time", location: "Gurugram", url: "#" },
    { category: "Marketing", title: "Copywriter", type: "Full time", location: "Gurugram", url: "#" },
    { category: "Marketing", title: "Social Media Manager", type: "Full time", location: "Delhi", url: "#" },
    { category: "Data & Analytics", title: "Data Analyst", type: "Full time", location: "Gurugram", url: "#" },
    { category: "Customer Experience", title: "Customer Support Lead", type: "Full time", location: "Gurugram", url: "#" },
    { category: "Finance", title: "Finance Manager", type: "Full time", location: "Gurugram", url: "#" }
  ];

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

  function cardHtml(job) {
    return (
      '<a class="job-card" href="' + escapeHtml(job.url) + '">' +
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
