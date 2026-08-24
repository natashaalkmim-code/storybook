(function () {
  "use strict";

  var folders = Array.prototype.slice.call(document.querySelectorAll(".folder"));

  function closeFolder(folder) {
    folder.classList.remove("open");
    folder.querySelector(".tab-button").setAttribute("aria-expanded", "false");
    folder.querySelector(".panel").inert = true;
  }

  function openFolder(folder) {
    folder.classList.add("open");
    folder.querySelector(".tab-button").setAttribute("aria-expanded", "true");
    folder.querySelector(".panel").inert = false;
  }

  folders.forEach(function (folder) {
    var btn = folder.querySelector(".tab-button");
    btn.addEventListener("click", function () {
      var isOpen = folder.classList.contains("open");
      folders.forEach(function (f) {
        if (f !== folder) closeFolder(f);
      });
      if (isOpen) {
        closeFolder(folder);
      } else {
        openFolder(folder);
        // bring the opened folder into a comfortable view
        window.requestAnimationFrame(function () {
          var rect = folder.getBoundingClientRect();
          if (rect.top < 70) {
            window.scrollBy({ top: rect.top - 90, behavior: "smooth" });
          }
        });
      }
    });
  });

  // Contact form -> mailto (no backend on this static page)
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      var subject = encodeURIComponent("Hello from " + (name || "your site"));
      var body = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
      window.location.href = "mailto:chapter@storybookstudio.com?subject=" + subject + "&body=" + body;
    });
  }
})();
