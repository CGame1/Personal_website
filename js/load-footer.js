// Load Font Awesome (if not already present) and shared footer from includes/footer.html
(function ensureFontAwesome(){
  const existing = document.querySelector('link[data-fa="true"]');
  if(!existing){
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    link.setAttribute('data-fa','true');
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
})();

document.addEventListener('DOMContentLoaded', function(){
  const el = document.getElementById('site-footer');
  if(!el) return;
  fetch('includes/footer.html')
    .then(r => {
      if(!r.ok) throw new Error('Failed to load footer');
      return r.text();
    })
    .then(html => { el.innerHTML = html; })
    .catch(() => {
      // Fallback minimal footer if include fails
      el.innerHTML = '<footer><div class="container"><p>&copy; ' + new Date().getFullYear() + ' Chloe Game</p></div></footer>';
    });
});
