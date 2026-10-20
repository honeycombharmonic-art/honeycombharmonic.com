(() => {
  const key = 'honeycomb-launch-list-v1';
  const form = document.querySelector('#launch-form');
  if (form) {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const button = form.querySelector('[type="submit"]');
      if (button.disabled) return;
      const status = document.querySelector('#form-status');
      button.disabled = true;
      status.textContent = 'Sending your interest…';
      try {
        const response = await fetch('/', {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: new URLSearchParams(new FormData(form)).toString()
        });
        if (!response.ok) throw new Error('Submission failed');
        location.assign('/launch-thanks');
      } catch {
        status.textContent = 'Your interest could not be sent. Please try again, or use the email link below. Your details are still here.';
        button.disabled = false;
      }
    });
  }
  const filters = document.querySelector('.filters');
  if (filters) {
    filters.hidden = false;
    filters.addEventListener('click', event => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      let count = 0;
      document.querySelectorAll('.product-card').forEach(card => {
        card.hidden = button.dataset.filter !== 'All' && card.dataset.category !== button.dataset.filter;
        if (!card.hidden) count++;
      });
      filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      document.querySelector('.filter-status').textContent = `${count} ${count === 1 ? 'concept' : 'concepts'}`;
    });
  }
  fetch('/assets/store-catalog.json').then(response => {
    if (!response.ok) throw new Error('Catalog unavailable');
    return response.json();
  }).then(catalog => {
    const products = new Map(catalog.map(p => [p.id, p]));
    let selected = new Set();
    let persistent = true;
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      if (Array.isArray(saved)) selected = new Set(saved.filter(id => products.has(id)));
    } catch { persistent = false; }
    const persist = () => {
      try { localStorage.setItem(key, JSON.stringify([...selected])); }
      catch { persistent = false; }
    };
    function render() {
      document.querySelectorAll('[data-list-count]').forEach(el => { el.textContent = String(selected.size); });
      document.querySelectorAll('[data-save]').forEach(button => {
        const saved = selected.has(button.dataset.save);
        button.hidden = false;
        button.textContent = saved ? 'Saved · remove' : 'Save to launch list';
        button.setAttribute('aria-pressed', String(saved));
      });
      const target = document.querySelector('#saved-list');
      if (target) {
        target.replaceChildren();
        if (!selected.size) {
          const empty = document.createElement('p');
          empty.textContent = 'No selections yet. Explore the collection, or tell us what interests you in the form.';
          target.append(empty);
        }
        for (const id of selected) {
          const p = products.get(id);
          const row = document.createElement('div');
          row.className = 'saved-row';
          const info = document.createElement('div');
          const a = document.createElement('a');
          a.href = '/shop/' + id;
          a.textContent = p.name;
          const detail = document.createElement('p');
          detail.textContent = `$${p.price} proposed · ${p.format}`;
          const remove = document.createElement('button');
          remove.type = 'button';
          remove.textContent = 'Remove';
          remove.setAttribute('aria-label', 'Remove ' + p.name);
          remove.addEventListener('click', () => {
            selected.delete(id); persist(); render();
            document.querySelector('#saved-list button, .launch-layout .text-link')?.focus();
          });
          info.append(a, detail); row.append(info, remove); target.append(row);
        }
        const notice = document.querySelector('.storage-notice');
        notice.textContent = persistent ? 'Saved in this browser. Shared with Anson only when you submit the form.' : 'This browser cannot save your list permanently. Please include your interests in the form before leaving.';
      }
      const interests = document.querySelector('#launch-interests');
      if (interests && !interests.dataset.edited) {
        interests.value = [...selected].map(id => {
          const p = products.get(id);
          return `${p.name} — ${p.format} — $${p.price} proposed`;
        }).join('\n');
      }
    }
    document.querySelector('#launch-interests')?.addEventListener('input', event => { event.target.dataset.edited = 'true'; });
    document.querySelectorAll('[data-save]').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.save;
        if (!products.has(id)) return;
        if (selected.has(id)) selected.delete(id); else selected.add(id);
        persist(); render();
      });
    });
    window.addEventListener('storage', event => {
      if (event.key !== key) return;
      try {
        const saved = JSON.parse(event.newValue || '[]');
        selected = new Set(Array.isArray(saved) ? saved.filter(id => products.has(id)) : []);
        render();
      } catch { /* Keep the last valid selection if another tab writes malformed data. */ }
    });
    render();
  }).catch(() => {
    const notice = document.querySelector('.storage-notice');
    if (notice) notice.textContent = 'The saved list is unavailable. You can still register your interests in the form.';
  });
})();
