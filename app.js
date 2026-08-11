// Sage Knowledge Base - nav highlight + live search
(function () {
 var here = (location.pathname.split("/").pop() || "index.html");
 document.querySelectorAll(".site-nav a").forEach(function (a) {
 var href = a.getAttribute("href").split("#")[0] || "index.html";
 if (href === here) a.classList.add("current");
 });

 var input = document.getElementById("kb-search");
 var results = document.getElementById("kb-search-results");
 if (!input || !results || typeof SEARCH_INDEX === "undefined") return;

 function escapeHtml(s) {
 return s.replace(/[&<>"']/g, function (c) {
 return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
 });
 }

 function scoreEntry(entry, terms) {
 var hay = (entry.title + " " + entry.page + " " + entry.keywords + " " + entry.snippet).toLowerCase();
 var score = 0;
 for (var i = 0; i < terms.length; i++) {
 var t = terms[i];
 if (!t) continue;
 if (entry.title.toLowerCase().indexOf(t) !== -1) score += 5;
 if (entry.keywords.toLowerCase().indexOf(t) !== -1) score += 3;
 if (entry.snippet.toLowerCase().indexOf(t) !== -1) score += 1;
 if (hay.indexOf(t) === -1) return -1;
 }
 return score;
 }

 function render(list, query) {
 if (!list.length) {
 results.innerHTML = '<div class="search-empty">No matches for "' + escapeHtml(query) + '". Try a different word.</div>';
 results.classList.add("open");
 return;
 }
 results.innerHTML = list.slice(0, 12).map(function (e) {
 return '<a href="' + e.page + '#' + e.anchor + '">' +
 '<span class="r-title">' + escapeHtml(e.title) + '</span> ' +
 '<span class="r-page"> - ' + escapeHtml(e.pageTitle) + '</span>' +
 '<div class="r-snippet">' + escapeHtml(e.snippet) + '</div>' +
 '</a>';
 }).join("");
 results.classList.add("open");
 }

 function doSearch() {
 var q = input.value.trim().toLowerCase();
 if (!q) { results.classList.remove("open"); results.innerHTML = ""; return; }
 var terms = q.split(/\s+/);
 var scored = SEARCH_INDEX.map(function (e) { return { e: e, s: scoreEntry(e, terms) }; })
 .filter(function (r) { return r.s >= 0; })
 .sort(function (a, b) { return b.s - a.s; })
 .map(function (r) { return r.e; });
 render(scored, q);
 }

 input.addEventListener("input", doSearch);
 input.addEventListener("focus", function () { if (input.value.trim()) doSearch(); });
 document.addEventListener("click", function (e) {
 if (!e.target.closest(".search-wrap")) results.classList.remove("open");
 });
 input.addEventListener("keydown", function (e) {
 if (e.key === "Escape") { results.classList.remove("open"); input.blur(); }
 if (e.key === "Enter") {
 var first = results.querySelector("a");
 if (first) location.href = first.getAttribute("href");
 }
 });
})();

// Sage Knowledge Base - scroll-reveal animation system
(function () {
 var GROW_SELECTOR = ".zone-bar";
 var FADE_SELECTOR = [
 ".card-grid > .card", ".stat-row > .stat", ".letter-flow > .letter-tile",
 ".letter-flow > .letter-arrow", ".flowchart .fc-box", ".flowchart .fc-arrow-down",
 ".flowchart .fc-branch-col", ".dial-row > .dial", "ol.stepper > li",
 ".issue-list > .issue-card", ".table-wrap", ".callout", ".schematic-wrap",
 "details.section"
 ].join(", ");

 if (!("IntersectionObserver" in window)) { return; }

 function tagGroup(list, cls) {
 var groups = {};
 list.forEach(function (el) {
 var parent = el.parentElement;
 var key = parent ? (parent.getAttribute("data-reveal-id") || String(Math.random())) : "root";
 if (parent && !parent.getAttribute("data-reveal-id")) parent.setAttribute("data-reveal-id", key);
 groups[key] = groups[key] || 0;
 el.style.setProperty("--i", groups[key]);
 groups[key]++;
 el.classList.add(cls);
 });
 }

 var fadeEls = Array.prototype.slice.call(document.querySelectorAll(FADE_SELECTOR));
 var growEls = Array.prototype.slice.call(document.querySelectorAll(GROW_SELECTOR));
 tagGroup(fadeEls, "reveal");
 tagGroup(growEls, "reveal-grow");

 var io = new IntersectionObserver(function (entries) {
 entries.forEach(function (entry) {
 if (entry.isIntersecting) {
 entry.target.classList.add("in-view");
 io.unobserve(entry.target);
 }
 });
 }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

 fadeEls.concat(growEls).forEach(function (el) { io.observe(el); });
})();
