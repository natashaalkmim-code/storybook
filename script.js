(function () {
  "use strict";

  var stage = document.querySelector('.storybook-stage');
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.tab-button'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var openLayer = document.getElementById('open-layer');
  var openPaper = document.getElementById('open-paper');
  var openPaperContent = document.getElementById('open-paper-content');
  var openTitle = document.getElementById('open-title');
  var openClose = document.getElementById('open-close');
  var openFlap = document.getElementById('open-flap');
  var openFlapImage = document.getElementById('open-flap-image');

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

  function geometryFor(folder) {
    var folderRect = folder.getBoundingClientRect();
    var stageRect = stage.getBoundingClientRect();
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    var marginX = Math.max(14, Math.min(44, vw * 0.035));
    var marginY = Math.max(14, Math.min(34, vh * 0.035));

    var targetW = Math.min(vw - marginX * 2, 940);
    var targetH = Math.min(vh - marginY * 2, 920);
    var targetX = (vw - targetW) / 2;
    var targetY = (vh - targetH) / 2;

    /* The sheet starts as if it were physically tucked just behind the tab. */
    var sheetFromW = Math.min(folderRect.width * 0.80, targetW * 0.72);
    var sheetFromH = Math.max(82, Math.min(150, targetH * 0.18));
    var sheetFromX = folderRect.left + (folderRect.width - sheetFromW) / 2;
    var sheetFromY = folderRect.top + Math.max(8, folderRect.width * 0.035);

    /* The folding front stays a little wider than the final sheet, like a cover. */
    var flapToW = Math.min(targetW * 1.04, vw);
    var flapToX = (vw - flapToW) / 2;
    var flapToY = Math.min(vh - 105, targetY + targetH - Math.min(95, flapToW * 0.10));

    return {
      sheetFromX: sheetFromX,
      sheetFromY: sheetFromY,
      sheetFromW: sheetFromW,
      sheetFromH: sheetFromH,
      sheetToX: targetX,
      sheetToY: targetY,
      sheetToW: targetW,
      sheetToH: targetH,
      flapFromX: folderRect.left,
      flapFromY: folderRect.top,
      flapFromW: folderRect.width,
      flapToX: flapToX,
      flapToY: flapToY,
      flapToW: flapToW,
      stageRect: stageRect
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
    setVar('--flap-from-x', g.flapFromX + 'px');
    setVar('--flap-from-y', g.flapFromY + 'px');
    setVar('--flap-from-w', g.flapFromW + 'px');
    setVar('--flap-to-x', g.flapToX + 'px');
    setVar('--flap-to-y', g.flapToY + 'px');
    setVar('--flap-to-w', g.flapToW + 'px');
  }

  function openSection(button) {
    var targetId = button.getAttribute('aria-controls');
    var panel = document.getElementById(targetId);
    var folder = folderFor(button);
    var art = folder && folder.querySelector('.folder-art');

    if (!panel || !folder || !art || !openLayer) return;

    window.clearTimeout(closeTimer);
    activeButton = button;
    activeFolder = folder;

    buttons.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    button.setAttribute('aria-expanded', 'true');

    var geometry = geometryFor(folder);
    applyGeometry(geometry);

    openLayer.style.setProperty('--accent', sectionAccent[targetId] || '#8d69df');
    openTitle.textContent = titleFor(folder);
    openPaperContent.innerHTML = panel.innerHTML;
    openFlapImage.src = art.getAttribute('src');

    folder.classList.add('is-opening-source');
    openLayer.classList.remove('is-closing');
    openLayer.classList.add('is-mounted');
    openLayer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-open-section');

    /* First paint: everything is still in the exact clicked position. */
    void openLayer.offsetWidth;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        openLayer.classList.add('is-open');
        if (!reduceMotion) {
          window.setTimeout(function () { openClose.focus({ preventScroll: true }); }, 520);
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
      openFlapImage.removeAttribute('src');

      if (activeFolder) activeFolder.classList.remove('is-opening-source');
      if (returnFocus !== false && activeButton) activeButton.focus({ preventScroll: true });

      activeButton = null;
      activeFolder = null;
    }, reduceMotion ? 20 : 930);
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
    }, 1800);
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
    if (activeFolder && openLayer.classList.contains('is-mounted')) {
      applyGeometry(geometryFor(activeFolder));
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
