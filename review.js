(() => {
  'use strict';
  const storageKey = 'honeycomb-website-review-v1';
  const path = location.pathname;
  const namespace = 'http://www.w3.org/2000/svg';
  let pages = {}, marks = [], mode = 'browse', drawing = null, pending = null, editingId = null;
  let undo = [], storageAvailable = true;
  try {
    pages = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (!pages || typeof pages !== 'object' || Array.isArray(pages)) pages = {};
    marks = Array.isArray(pages[path]?.marks) ? pages[path].marks : [];
  } catch { storageAvailable = false; }

  const root = document.createElement('div');
  root.id = 'hh-review';
  root.innerHTML = `
    <svg class="review-layer" aria-hidden="true"></svg>
    <section class="review-bar" aria-label="Website review">
      <div class="review-tools" role="group" aria-label="Review tools">
        <button type="button" data-tool="browse" aria-pressed="true">Browse</button>
        <button type="button" data-tool="circle" aria-pressed="false">Circle</button>
        <button type="button" data-tool="arrow" aria-pressed="false">Arrow</button>
        <button type="button" data-tool="pen" aria-pressed="false">Pen</button>
        <button type="button" data-tool="note" aria-pressed="false">Point + note</button>
      </div>
      <div class="review-actions">
        <button type="button" data-action="undo" disabled>Undo</button>
        <button type="button" data-action="notes">Notes (0)</button>
        <button type="button" data-action="copy" class="review-primary">Copy feedback</button>
        <button type="button" data-action="close" aria-label="Close review mode">Close</button>
      </div>
      <p class="review-hint" role="status" aria-live="polite">Browse and scroll, then choose a tool to mark the page.</p>
    </section>
    <dialog class="review-editor" aria-labelledby="review-editor-title">
      <h2 id="review-editor-title">Add a note</h2>
      <form method="dialog">
        <label for="review-note">What would you like changed?</label>
        <textarea id="review-note" maxlength="2000" placeholder="For example: make this bee a little larger."></textarea>
        <div class="review-dialog-actions">
          <button type="button" data-action="cancel">Cancel</button>
          <button type="submit" class="review-primary">Save mark</button>
        </div>
      </form>
    </dialog>
    <dialog class="review-notes" aria-labelledby="review-notes-title">
      <h2 id="review-notes-title">Your marks on this page</h2>
      <ol class="review-list"></ol>
      <div class="review-dialog-actions"><button type="button" data-action="done">Done</button></div>
    </dialog>
    <dialog class="review-export" aria-labelledby="review-export-title">
      <h2 id="review-export-title">Feedback ready to copy</h2>
      <p class="review-copy-result">Paste this feedback into our chat. The text includes your notes and exact marked locations.</p>
      <p class="review-feedback-summary"></p>
      <textarea aria-label="Marked website feedback" readonly hidden></textarea>
      <div class="review-dialog-actions"><button type="button" data-action="select-feedback">Select text</button><button type="button" data-action="export-done">Done</button></div>
    </dialog>`;
  document.body.append(root);
  document.body.classList.add('hh-review-active');
  const layer = root.querySelector('.review-layer');
  const hint = root.querySelector('.review-hint');
  const editor = root.querySelector('.review-editor');
  const note = root.querySelector('#review-note');
  const notesDialog = root.querySelector('.review-notes');
  const exportDialog = root.querySelector('.review-export');
  const status = text => { hint.textContent = text; };
  const round = value => Math.round(value * 10000) / 10000;
  const snapshot = () => { undo.push(JSON.stringify(marks)); if (undo.length > 30) undo.shift(); };
  function persist() {
    pages[path] = { url: location.origin + path, title: document.title, marks };
    try { localStorage.setItem(storageKey, JSON.stringify(pages)); }
    catch { storageAvailable = false; status('Storage is unavailable. Copy your feedback before leaving this page.'); }
    root.querySelector('[data-action="notes"]').textContent = `Notes (${marks.length})`;
    root.querySelector('[data-action="undo"]').disabled = undo.length === 0;
    render();
  }
  function selectTool(tool) {
    mode = tool;
    drawing = null;
    root.classList.toggle('is-drawing', mode !== 'browse');
    root.querySelectorAll('[data-tool]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tool === mode)));
    const instructions = { browse: 'Browse and scroll, then choose a tool to mark the page.', circle: 'Drag a circle around what you mean. Scroll anytime.', arrow: 'Drag an arrow toward what you mean. Scroll anytime.', pen: 'Draw freely, then add a note. Scroll anytime.', note: 'Click the exact spot, then tell me what to change.' };
    status(instructions[mode]);
    render();
  }
  function selectorFor(element) {
    const parts = [];
    for (let el = element; el && el !== document.body; el = el.parentElement) {
      if (el.id) { parts.unshift('#' + CSS.escape(el.id)); break; }
      const siblings = [...el.parentElement.children].filter(sibling => sibling.tagName === el.tagName);
      parts.unshift(el.tagName.toLowerCase() + (siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(el) + 1})` : ''));
    }
    return parts.join(' > ') || 'body';
  }
  function targetAt(x, y) {
    const el = document.elementsFromPoint(x, y).find(element => !root.contains(element) && element !== document.documentElement) || document.body;
    const rect = el.getBoundingClientRect();
    return { selector: selectorFor(el), text: (el.getAttribute('alt') || el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 180), image: el.currentSrc || undefined, rect };
  }
  function anchorMark(mark) {
    const points = mark.points;
    const targetPoint = mark.tool === 'arrow' || mark.tool === 'note' ? points[points.length - 1] : [(points[0][0] + points[points.length - 1][0]) / 2, (points[0][1] + points[points.length - 1][1]) / 2];
    const target = targetAt(targetPoint[0], targetPoint[1]);
    const box = target.rect;
    return {
      id: crypto.randomUUID(), tool: mark.tool, note: '', selector: target.selector, target: target.text, image: target.image,
      points: points.map(([x, y]) => [round((x - box.left) / (box.width || 1)), round((y - box.top) / (box.height || 1))]),
      originalPoints: points.map(([x, y]) => [Math.round(x + scrollX), Math.round(y + scrollY)]),
      viewport: { width: innerWidth, height: innerHeight, scrollY: Math.round(scrollY) },
      createdAt: new Date().toISOString()
    };
  }
  function resolveTarget(mark) {
    let el;
    try { el = document.querySelector(mark.selector); } catch { /* Older drafts may refer to removed elements. */ }
    // Keep image notes attached when a layout adds a frame or moves a figure.
    if (mark.image) {
      const images = [...document.querySelectorAll('main img')];
      const byDescription = images.filter(image => image.alt.trim() === mark.target);
      if (byDescription.length === 1) return byDescription[0];
      const bySource = images.filter(image => image.currentSrc === mark.image || image.src === mark.image);
      if (bySource.length === 1) return bySource[0];
      if (el?.tagName !== 'IMG' || (el.alt.trim() !== mark.target && el.currentSrc !== mark.image && el.src !== mark.image)) return null;
    }
    return el;
  }
  function screenPoints(mark) {
    const el = resolveTarget(mark);
    if (el) {
      const box = el.getBoundingClientRect();
      return mark.points.map(([x, y]) => [box.left + x * box.width, box.top + y * box.height]);
    }
    return mark.originalPoints.map(([x, y]) => [x - scrollX, y - scrollY]);
  }
  function svg(tag, attributes, parent = layer) {
    const node = document.createElementNS(namespace, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    parent.append(node);
    return node;
  }
  function paint(tool, points, number) {
    if (!points.length) return;
    const first = points[0], last = points[points.length - 1];
    const group = svg('g', { fill: 'none', stroke: '#ffab73', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    if (tool === 'circle') svg('ellipse', { cx: (first[0] + last[0]) / 2, cy: (first[1] + last[1]) / 2, rx: Math.abs(last[0] - first[0]) / 2, ry: Math.abs(last[1] - first[1]) / 2 }, group);
    if (tool === 'pen') svg('polyline', { points: points.map(point => point.join(',')).join(' ') }, group);
    if (tool === 'arrow') {
      svg('line', { x1: first[0], y1: first[1], x2: last[0], y2: last[1] }, group);
      const angle = Math.atan2(last[1] - first[1], last[0] - first[0]);
      const tip = sign => [last[0] - 14 * Math.cos(angle + sign * .5), last[1] - 14 * Math.sin(angle + sign * .5)].join(',');
      svg('polyline', { points: `${tip(-1)} ${last.join(',')} ${tip(1)}` }, group);
    }
    const badge = tool === 'note' ? last : first;
    svg('circle', { cx: badge[0], cy: badge[1], r: 12, fill: '#ffab73', stroke: '#111811', 'stroke-width': 1 }, group);
    const text = svg('text', { x: badge[0], y: badge[1] + 4, fill: '#111811', stroke: 'none', 'text-anchor': 'middle', 'font-size': 12, 'font-family': 'sans-serif', 'font-weight': 700 }, group);
    text.textContent = number;
  }
  function render() {
    layer.replaceChildren();
    marks.forEach((mark, index) => paint(mark.tool, screenPoints(mark), index + 1));
    if (pending && !editingId) paint(pending.tool, screenPoints(pending), marks.length + 1);
    if (drawing) paint(drawing.tool, drawing.points, marks.length + 1);
  }
  function openEditor(mark, edit = false) {
    pending = mark;
    editingId = edit ? mark.id : null;
    note.value = mark.note || '';
    editor.querySelector('h2').textContent = edit ? 'Edit your note' : 'Add a note';
    editor.showModal();
    note.focus();
    render();
  }
  layer.addEventListener('pointerdown', event => {
    if (event.button !== 0 || marks.length >= 60) { if (marks.length >= 60) status('This page has 60 marks. Copy feedback or remove a mark before adding more.'); return; }
    drawing = { tool: mode, points: [[event.clientX, event.clientY]] };
    layer.setPointerCapture(event.pointerId);
    event.preventDefault();
    render();
  });
  layer.addEventListener('pointermove', event => {
    if (!drawing) return;
    const point = [event.clientX, event.clientY];
    if (mode === 'pen') {
      if (drawing.points.length >= 240) drawing.points = drawing.points.filter((_, index) => index % 2 === 0);
      drawing.points.push(point);
    } else drawing.points[1] = point;
    render();
  });
  layer.addEventListener('pointerup', event => {
    if (!drawing) return;
    const draft = drawing;
    drawing = null;
    if (layer.hasPointerCapture(event.pointerId)) layer.releasePointerCapture(event.pointerId);
    if (draft.tool === 'note') draft.points = [[event.clientX, event.clientY]];
    else if (draft.points.length < 2 || !draft.points.some(point => Math.hypot(draft.points[0][0] - point[0], draft.points[0][1] - point[1]) >= 5)) { render(); return; }
    openEditor(anchorMark(draft));
  });
  layer.addEventListener('pointercancel', () => { drawing = null; render(); });
  editor.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    if (!pending) return;
    snapshot();
    const saved = { ...pending, note: note.value.trim() };
    if (editingId) marks = marks.map(mark => mark.id === editingId ? saved : mark);
    else marks.push(saved);
    pending = null;
    editingId = null;
    editor.close();
    persist();
    selectTool('browse');
    status(storageAvailable ? 'Mark saved in this browser. Keep browsing, or copy feedback into our chat.' : 'Mark added. Copy feedback before leaving this page; browser storage is unavailable.');
  });
  editor.addEventListener('close', () => { pending = null; editingId = null; selectTool('browse'); root.querySelector('[data-tool="browse"]').focus({ preventScroll: true }); });
  function showNotes() {
    const list = root.querySelector('.review-list');
    list.replaceChildren();
    if (!marks.length) {
      const empty = document.createElement('p');
      empty.className = 'review-empty';
      empty.textContent = 'No marks yet. Choose Circle, Arrow, Pen, or Point + note.';
      list.append(empty);
    }
    marks.forEach((mark, index) => {
      const item = document.createElement('li');
      const title = document.createElement('strong');
      title.textContent = `${index + 1}. ${mark.tool === 'note' ? 'Point' : mark.tool[0].toUpperCase() + mark.tool.slice(1)}`;
      const text = document.createElement('p');
      text.textContent = mark.note || 'Mark saved without a note.';
      item.append(title, text);
      for (const [action, label] of [['locate', 'Go to mark'], ['edit', 'Edit'], ['remove', 'Remove']]) {
        const button = document.createElement('button');
        button.type = 'button'; button.textContent = label; button.dataset.markAction = action; button.dataset.id = mark.id;
        item.append(button);
      }
      list.append(item);
    });
    if (!notesDialog.open) notesDialog.showModal();
  }
  function feedbackText() {
    pages[path] = { url: location.origin + path, title: document.title, marks };
    const reviewed = Object.values(pages).filter(page => Array.isArray(page.marks) && page.marks.length);
    if (!reviewed.length) return null;
    return 'Honeycomb Harmonic website feedback\nPlease use the notes and exact marked locations below.\n\n' + reviewed.map(page => `${page.url}\n${page.marks.map((mark, index) => `${index + 1}. ${mark.note || '(' + mark.tool + ' mark; no note)'}${mark.target ? '\n   At: ' + mark.target : ''}`).join('\n')}`).join('\n\n') + '\n\nMarked locations (element-relative points, with original page coordinates as fallback):\n' + JSON.stringify({ version: 1, pages: reviewed });
  }
  root.addEventListener('click', async event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.tool) { selectTool(button.dataset.tool); return; }
    const action = button.dataset.action;
    if (action === 'undo' && undo.length) { marks = JSON.parse(undo.pop()); persist(); status('Undone.'); }
    if (action === 'notes') showNotes();
    if (action === 'done') notesDialog.close();
    if (action === 'cancel') editor.close();
    if (action === 'export-done') exportDialog.close();
    if (action === 'select-feedback') { exportDialog.querySelector('textarea').hidden = false; exportDialog.querySelector('textarea').focus(); exportDialog.querySelector('textarea').select(); }
    if (action === 'close') { const url = new URL(location.href); url.searchParams.delete('review'); location.assign(url.href); }
    if (action === 'copy') {
      const text = feedbackText();
      if (!text) { status('Add a mark first, then copy your feedback.'); return; }
      exportDialog.querySelector('textarea').value = text;
      exportDialog.querySelector('textarea').hidden = true;
      const pageCount = Object.values(pages).filter(page => page.marks?.length).length;
      const markCount = Object.values(pages).reduce((total, page) => total + (page.marks?.length || 0), 0);
      exportDialog.querySelector('.review-feedback-summary').textContent = `${markCount} ${markCount === 1 ? 'mark' : 'marks'} across ${pageCount} ${pageCount === 1 ? 'page' : 'pages'}, with your notes attached.`;
      exportDialog.showModal();
      try {
        await navigator.clipboard.writeText(text);
        exportDialog.querySelector('.review-copy-result').textContent = 'Copied. Paste into our chat. You can also select and copy the text below.';
        status('Feedback ready. Paste it into our chat so I can make the changes.');
      } catch {
        exportDialog.querySelector('.review-copy-result').textContent = 'Select and copy the text below, then paste it into our chat.';
        exportDialog.querySelector('textarea').hidden = false;
        exportDialog.querySelector('textarea').select();
      }
    }
    const mark = marks.find(item => item.id === button.dataset.id);
    if (!mark) return;
    if (button.dataset.markAction === 'edit') { notesDialog.close(); openEditor(mark, true); }
    if (button.dataset.markAction === 'remove') { snapshot(); marks = marks.filter(item => item.id !== mark.id); persist(); showNotes(); }
    if (button.dataset.markAction === 'locate') {
      notesDialog.close(); selectTool('browse');
      const element = resolveTarget(mark);
      if (element) element.scrollIntoView({ block: 'center', behavior: 'instant' });
      else scrollTo({ top: Math.max(0, mark.originalPoints[0][1] - innerHeight / 2), behavior: 'instant' });
      render();
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !editor.open && !notesDialog.open && !exportDialog.open) selectTool('browse');
  });
  // Stay in review mode as the reviewer follows internal site links.
  function keepReviewLink(link) {
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && !url.pathname.startsWith('/assets/') && !link.hasAttribute('download')) {
      url.searchParams.set('review', '1'); link.href = url.href;
    }
  }
  document.querySelectorAll('a[href]').forEach(keepReviewLink);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (link) keepReviewLink(link);
  }, true);
  let frame;
  const scheduleRender = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(render); };
  addEventListener('scroll', scheduleRender, { passive: true });
  addEventListener('resize', scheduleRender);
  document.addEventListener('load', scheduleRender, true);
  new ResizeObserver(scheduleRender).observe(document.body);
  persist();
})();
