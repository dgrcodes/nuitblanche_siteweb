const map = L.map('map').setView([48.2390, -79.0227], 15);

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
  })
  .catch(function (error) {
    console.error(error.message);
  });