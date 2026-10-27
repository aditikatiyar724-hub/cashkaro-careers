// Job detail: fills job.html from CK_JOBS using ?id=
(function () {
  var id = new URLSearchParams(location.search).get("id");
  var job = CK_JOBS.filter(function (j) { return j.id === id; })[0];
  var main = document.querySelector(".job");

  if (!job) {
    main.querySelector(".job__head").hidden = true;
    main.querySelector(".job__body").hidden = true;
    main.querySelector(".job__missing").hidden = false;
    return;
  }

  function pick(key) {
    return job[key] !== undefined ? job[key] : CK_JOB_DEFAULTS[key];
  }

  function listItems(items) {
    var frag = document.createDocumentFragment();
    items.forEach(function (item) {
      var li = document.createElement("li");
      li.textContent = typeof item === "string" ? item : item.text;
      if (item.items) {
        var sub = document.createElement("ul");
        sub.appendChild(listItems(item.items));
        li.appendChild(sub);
      }
      frag.appendChild(li);
    });
    return frag;
  }

  document.title = job.title + " · Careers at CashKaro";
  main.querySelector(".job__category").textContent = job.category;
  main.querySelector(".job__head .job__title").textContent = job.title;
  main.querySelector(".job__type").textContent = job.type;
  main.querySelector(".job__location").textContent = job.location;
  main.querySelector(".job__about").textContent = pick("about");
  main.querySelector(".job__responsibilities").appendChild(listItems(pick("responsibilities")));
  main.querySelector(".job__life").appendChild(listItems(CK_LIFE));

  main.querySelectorAll(".job__apply-top, .job__apply-bottom").forEach(function (a) {
    a.href = pick("applyUrl");
  });

  // Back returns to wherever the card was clicked (home or listing, filters intact); direct visits go to the listing
  var back = main.querySelector(".jobs-back");
  back.addEventListener("click", function (e) {
    if (document.referrer.indexOf(location.origin) === 0 && history.length > 1) {
      e.preventDefault();
      history.back();
    }
  });
})();
