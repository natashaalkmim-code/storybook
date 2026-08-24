(function () {
  "use strict";

  var stage = document.querySelector('.storybook-stage');
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.tab-button'));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var openLayer = document.getElementById('open-layer');
  var openPaper = document.getElementById('open-paper');
  var openPaperContent = document.getElementById('open-paper-content');
  var openTitle = document.getElementById('open-title');
  var openClose = document.getElementById('open-close');

  var activeButton = null;
  var activeFolder = null;
  var closeTimer = null;

  var sectionAccent = {
    'panel-projects': '#8d66df',
    'panel-contact': '#b8e56f',
    'panel-about': '#6c2440',
    'panel-services': '#aaa9df',
    'panel-process': '#312c32'
  };

  function folderFor(button) {
    return button.closest('.folder');
  }

  function titleFor(folder) {
    return folder ? (folder.getAttribute('aria-label') || 'Storybook Studio') : 'Storybook Studio';
  }

  function setVar(name, value) {
    openLayer.style.setProperty(name, value);
  }

  /* The window card itself is the "from" state — no separate flap needed.
     It simply grows from its stacked position/size to fill the screen. */
  function geometryFor(button) {
    var rect = button.getBoundingClientRect();
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    var marginX = Math.max(14, Math.min(44, vw * 0.035));
    var marginY = Math.max(14, Math.min(34, vh * 0.035));

    var targetW = Math.min(vw - marginX * 2, 940);
    var targetH = Math.min(vh - marginY * 2, 920);
    var targetX = (vw - targetW) / 2;
    var targetY = (vh - targetH) / 2;

    return {
      sheetFromX: rect.left,
      sheetFromY: rect.top,
      sheetFromW: rect.width,
      sheetFromH: rect.height,
      sheetToX: targetX,
      sheetToY: targetY,
      sheetToW: targetW,
      sheetToH: targetH
    };
  }

  function applyGeometry(g) {
    setVar('--sheet-from-x', g.sheetFromX + 'px');
    setVar('--sheet-from-y', g.sheetFromY + 'px');
    setVar('--sheet-from-w', g.sheetFromW + 'px');
    setVar('--sheet-from-h', g.sheetFromH + 'px');
    setVar('--sheet-to-x', g.sheetToX + 'px');
    setVar('--sheet-to-y', g.sheetToY + 'px');
    setVar('--sheet-to-w', g.sheetToW + 'px');
    setVar('--sheet-to-h', g.sheetToH + 'px');
  }

  function openSection(button) {
    var targetId = button.getAttribute('aria-controls');
    var panel = document.getElementById(targetId);
    var folder = folderFor(button);

    if (!panel || !folder || !openLayer) return;

    window.clearTimeout(closeTimer);
    activeButton = button;
    activeFolder = folder;

    buttons.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    button.setAttribute('aria-expanded', 'true');

    applyGeometry(geometryFor(button));

    openLayer.style.setProperty('--accent', sectionAccent[targetId] || '#8d69df');
    openTitle.textContent = titleFor(folder);
    openPaperContent.innerHTML = panel.innerHTML;

    folder.classList.add('is-active');
    openLayer.classList.remove('is-closing');
    openLayer.classList.add('is-mounted');
    openLayer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-open-section');

    /* First paint: the sheet is still exactly the size/position of the card. */
    void openLayer.offsetWidth;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        openLayer.classList.add('is-open');
        if (!reduceMotion) {
          window.setTimeout(function () { openClose.focus({ preventScroll: true }); }, 780);
        } else {
          openClose.focus({ preventScroll: true });
        }
      });
    });
  }

  function closeSection(returnFocus) {
    if (!openLayer.classList.contains('is-mounted')) return;

    window.clearTimeout(closeTimer);
    openLayer.classList.remove('is-open');
    openLayer.classList.add('is-closing');

    if (activeButton) activeButton.setAttribute('aria-expanded', 'false');

    closeTimer = window.setTimeout(function () {
      openLayer.classList.remove('is-mounted', 'is-closing');
      openLayer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('has-open-section');
      openPaperContent.innerHTML = '';

      if (activeFolder) activeFolder.classList.remove('is-active');
      if (returnFocus !== false && activeButton) activeButton.focus({ preventScroll: true });

      activeButton = null;
      activeFolder = null;
    }, reduceMotion ? 20 : 1100);
  }

  /* The initial cover already exists on frame 1; it only settles physically. */
  window.addEventListener('load', function () {
    if (!stage) return;
    if (reduceMotion) {
      stage.classList.remove('is-entering');
      return;
    }
    window.setTimeout(function () {
      stage.classList.remove('is-entering');
    }, 1400);
  });

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      openSection(button);
    });
  });

  if (openClose) {
    openClose.addEventListener('click', function () { closeSection(true); });
  }

  if (openLayer) {
    openLayer.addEventListener('click', function (event) {
      if (event.target && event.target.hasAttribute('data-close-open-layer')) {
        closeSection(true);
      }
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && openLayer.classList.contains('is-mounted')) {
      closeSection(true);
    }
  });

  /* Keep the open paper correctly sized if the phone rotates / window changes. */
  window.addEventListener('resize', function () {
    if (activeButton && openLayer.classList.contains('is-mounted')) {
      applyGeometry(geometryFor(activeButton));
    }
  });

  /* Contact form can live inside the overlay because panel markup is cloned. */
  document.addEventListener('submit', function (event) {
    var form = event.target.closest('#contact-form');
    if (!form) return;
    event.preventDefault();
    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var message = form.elements.message.value.trim();
    var subject = encodeURIComponent('Hello from ' + (name || 'your site'));
    var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
    window.location.href = 'mailto:chapter@storybookstudio.com?subject=' + subject + '&body=' + body;
  });
})();
