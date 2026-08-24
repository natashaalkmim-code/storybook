(function () {
  "use strict";

  var stage = document.querySelector('.storybook-stage');
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.tab-button'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var settleTimer = null;

  function folderFor(button) {
    return button.closest('.folder');
  }

  function closeAll() {
    buttons.forEach(function (button) {
      button.setAttribute('aria-expanded', 'false');
      var folder = folderFor(button);
      if (folder) folder.classList.remove('is-active');
    });
    panels.forEach(function (panel) { panel.hidden = true; });
    if (stage) stage.classList.remove('has-active');
  }

  function settleStack() {
    if (!stage || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    window.clearTimeout(settleTimer);
    stage.classList.remove('is-settling');
    void stage.offsetWidth; // restart the physical settling transition
    stage.classList.add('is-settling');
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        stage.classList.remove('is-settling');
      });
    });
    settleTimer = window.setTimeout(function () {
      stage.classList.remove('is-settling');
    }, 900);
  }

  // Initial little 3D settling, like loose sheets falling into the dividers.
  window.addEventListener('load', function () {
    window.setTimeout(settleStack, 140);
  });

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var targetId = button.getAttribute('aria-controls');
      var panel = document.getElementById(targetId);
      var folder = folderFor(button);
      var wasOpen = button.getAttribute('aria-expanded') === 'true';

      closeAll();

      if (!wasOpen && panel && folder) {
        button.setAttribute('aria-expanded', 'true');
        folder.classList.add('is-active');
        if (stage) stage.classList.add('has-active');
        panel.hidden = false;
        settleStack();
      } else {
        settleStack();
      }
      // Intentionally no automatic scroll: the stack stays on screen while it animates.
    });
  });

  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();
      var subject = encodeURIComponent('Hello from ' + (name || 'your site'));
      var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
      window.location.href = 'mailto:chapter@storybookstudio.com?subject=' + subject + '&body=' + body;
    });
  }
})();
