(function () {
  "use strict";

  var buttons = Array.prototype.slice.call(document.querySelectorAll('.tab-button'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var drawerShell = document.getElementById('drawer-shell');

  function closeAll() {
    buttons.forEach(function (button) { button.setAttribute('aria-expanded', 'false'); });
    panels.forEach(function (panel) { panel.hidden = true; });
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var targetId = button.getAttribute('aria-controls');
      var panel = document.getElementById(targetId);
      var wasOpen = button.getAttribute('aria-expanded') === 'true';

      closeAll();
      if (!wasOpen && panel) {
        button.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
        window.requestAnimationFrame(function () {
          drawerShell.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
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
