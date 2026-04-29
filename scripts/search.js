document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('prog-search-input');
  const clearBtn = document.getElementById('prog-search-clear');
  const countLabel = document.getElementById('prog-search-count');
  const noResults = document.getElementById('prog-search-noresults');
  const cards = Array.from(document.querySelectorAll('.lieu-card'));

  if (!input) return;

  function update() {
    const q = input.value.toLowerCase().trim();
    let visible = 0;

    cards.forEach(card => {
      const title = card.querySelector('.activite-titre')?.textContent || '';
      const badge = card.querySelector('.lieu-badge')?.textContent || '';
      const addr = card.querySelector('.lieu-adresse')?.textContent || '';
      const desc = card.querySelector('.activite-desc')?.textContent || '';
      const hay = (title + ' ' + badge + ' ' + addr + ' ' + desc).toLowerCase();
      const match = q === '' || hay.indexOf(q) !== -1;
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });

    // Hide time-blocks that have no visible cards
    document.querySelectorAll('.time-block').forEach(tb => {
      const anyVisible = tb.querySelectorAll('.lieu-card').length && tb.querySelectorAll('.lieu-card:not([style*="display: none"])').length;
      tb.style.display = anyVisible ? '' : 'none';
    });

    if (q === '') {
      countLabel.textContent = 'Affiche tout';
      noResults.style.display = 'none';
    } else {
      countLabel.textContent = `${visible} résultat${visible !== 1 ? 's' : ''}`;
      noResults.style.display = visible ? 'none' : '';
    }
  }

  input.addEventListener('input', update);
  clearBtn.addEventListener('click', function() { input.value = ''; update(); input.focus(); });
});
