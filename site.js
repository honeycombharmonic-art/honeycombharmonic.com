(() => {
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  if (button && nav) {
    document.documentElement.classList.add('js');
    button.hidden = false;
    const close = () => {
      button.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      button.querySelector('span').textContent = '+';
    };
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      button.querySelector('span').textContent = open ? '−' : '+';
    });
    nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
        close();
        button.focus();
      }
    });
    matchMedia('(min-width: 761px)').addEventListener('change', close);
  }
  const copy = document.querySelector('.copy-email');
  if (copy && navigator.clipboard) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      const status = document.querySelector('.copy-status');
      try {
        await navigator.clipboard.writeText('honeycombharmonic@gmail.com');
        status.textContent = 'Email address copied.';
      } catch {
        status.textContent = 'Copy was unavailable. Select the email address above to copy it.';
      }
    });
  }
})();

// Review tools load only through an explicit review link.
if (new URLSearchParams(location.search).get('review') === '1') {
  const styles = document.createElement('link');
  styles.rel = 'stylesheet';
  styles.href = '/review.css';
  document.head.append(styles);
  const review = document.createElement('script');
  review.src = '/review.js';
  document.body.append(review);
}
