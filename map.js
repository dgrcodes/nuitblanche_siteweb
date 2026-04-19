const map = L.map('map').setView([48.2430, -79.0227], 15);
let activeCategory = null;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function buildPopupContent(lieu) {
  var title = lieu.nom || 'Lieu';
  var categorie = lieu.categorie ? '<br>Categorie: ' + lieu.categorie : '';
  var heure = lieu.heure ? '<br>Heure: ' + lieu.heure : '';
  return '<strong>' + title + '</strong>' + categorie + heure;
}

function buildLegendItem(categorie) {
  var li = document.createElement('li');
  var link = document.createElement('a');

  link.href = '#';
  link.textContent = categorie;
  link.style.cursor = 'pointer';

  link.addEventListener('click', function (event) {
    event.preventDefault();

    var isSameCategory = activeCategory === categorie;
    activeCategory = isSameCategory ? null : categorie;

    // Reset legend link styles
    document.querySelectorAll('#map-legend a').forEach(function (a) {
      a.style.color = '';
      a.style.fontWeight = 'normal';
    });

    // If no category selected, reset markers and stop
    if (!activeCategory) {
      resetMarkerOpacity();
      return;
    }

    // Highlight selected category text
    link.style.color = '#e63946';
    link.style.fontWeight = '700';

    // Highlight matching markers
    map.eachLayer(function (layer) {
      if (layer instanceof L.Marker) {
        var popup = layer.getPopup && layer.getPopup();
        var content = popup ? popup.getContent() : '';
        var isMatch = content.indexOf('Categorie: ' + activeCategory) !== -1;

        layer.setOpacity(isMatch ? 1 : 0.2);
        layer.setZIndexOffset(isMatch ? 1000 : 0);
      }
    });
  });

  li.appendChild(link);
  return li;
}

function resetMarkerOpacity() {
  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      layer.setOpacity(1);
      layer.setZIndexOffset(0);
    }
  });
}

function addLieuMarker(lieu) {
  if (typeof lieu.lat !== 'number' || typeof lieu.lng !== 'number') {
    return;
  }

  L.marker([lieu.lat, lieu.lng])
    .addTo(map)
    .bindPopup(buildPopupContent(lieu));
}

fetch('DB/locations.json')
  .then(function (response) {
    if (!response.ok) {
      throw new Error('Impossible de charger DB/locations.json');
    }
    return response.json();
  })
  .then(function (data) {
    if (!data || !Array.isArray(data.lieux)) {
      throw new Error('Format JSON invalide: lieux[] manquant');
    }

    data.lieux.forEach(addLieuMarker);
    var legend = document.getElementById('map-legend');
    var categories = new Set(data.lieux.map(l => l.categorie).filter(c => c));
    categories.forEach(c => legend.appendChild(buildLegendItem(c)));
  })
  .catch(function (error) {
    console.error(error.message);
  });