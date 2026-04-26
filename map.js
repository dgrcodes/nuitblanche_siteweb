const categorieColors = {
  'Diffusion':    '#bbdee9',
  'Exposition':   '#6994a1',
  'Projection':   '#e5806c',
  'Musée':        '#b1e8c9',
  'Jeux-Vidéos':  '#f4a261',
  'Litterature':  '#7d97c5',
  'Atelier':      '#2a9d8f',
  'Performance':  '#e9c46a',
  'Balado':       '#457b9d',
  'Installation': '#a8dadc'
};

function getCategorieColor(categorie) {
  return categorieColors[categorie] || '#fafbfb';
}

const INITIAL_CENTER_DESKTOP = [48.2430, -79.0227];
const INITIAL_CENTER_MOBILE = [48.2410, -79.0227];  
const INITIAL_ZOOM = 15;

function getInitialCenter() {
  return window.innerWidth <= 768 ? INITIAL_CENTER_MOBILE : INITIAL_CENTER_DESKTOP;
}

const map = L.map('map', {
  dragging: false,
  keyboard: false,
  boxZoom: false,
  touchZoom: false,
  doubleClickZoom: true,
  scrollWheelZoom: false,
  zoomControl: true
}).setView(getInitialCenter(), INITIAL_ZOOM);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
}).addTo(map);

fetch(`https://router.project-osrm.org/route/v1/foot/${-79.01706423132681},${48.24650080513203};${-79.01979},${48.23800}?overview=full&geometries=geojson`)
  .then(r => r.json())
  .then(data => {
    const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
    L.polyline(coords, {
      color: '#bbdee9',
      weight: 3,
      opacity: 0.8
    }).addTo(map);
  });

// Centre la map en tenant compte du panneau qui couvre 50% à droite
function setViewWithPanel(latlng, zoom) {
  const targetZoom = zoom || map.getZoom();
  const point = map.project(latlng, targetZoom);
  const isMobile = window.innerWidth <= 1024;
  
  if (isMobile) {
    // Panneau en bas → décale plus pour que le marker apparaisse plus haut
    const offsetY = map.getSize().yupdateMapInfo / 4.5;  // ← changé de /4 à /2
    const newCenter = map.unproject(L.point(point.x, point.y + offsetY), targetZoom);
    map.setView(newCenter, targetZoom);
  } else {
    // Panneau à droite → décale le centre vers la droite
    const offsetX = map.getSize().x / 4;
    const newCenter = map.unproject(L.point(point.x + offsetX, point.y), targetZoom);
    map.setView(newCenter, targetZoom);
  }
}

function showMapInfo() {
  document.querySelector('.bottom-row').classList.add('info-visible');
}

function hideMapInfo() {
  document.querySelector('.bottom-row').classList.remove('info-visible');
}

function resetView() {
  map.setView(getInitialCenter(), INITIAL_ZOOM);
  resetMarkerOpacity();
  hideMapInfo();
}

function resetMarkerOpacity() {
  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      layer.setOpacity(1);
      layer.setZIndexOffset(0);
    }
  });

  document.querySelectorAll('#map-legend a').forEach(function (a) {
    a.style.backgroundColor = 'transparent';
    a.style.color = a.dataset.color;
    a.style.fontWeight = 'normal';
    a.style.border = 'none';
    a.style.borderRadius = '0';
    a.style.padding = '3px 4px';
  });
}

window.resetMarkerOpacity = resetMarkerOpacity;

function buildLegendItem(lieu) {
  var li = document.createElement('li');
  var link = document.createElement('a');
  const color = getCategorieColor(lieu.categorie);

  link.href = '#';
  link.textContent = lieu.nom;
  link.style.cursor = 'pointer';
  link.style.border = 'none';
  link.style.color = color;
  link.style.borderRadius = '0';
  link.style.padding = '3px 4px';
  link.style.fontSize = '0.8rem';
  link.style.transition = 'color 0.2s';
  link.style.textTransform = 'uppercase';
  link.dataset.color = color;
  link.dataset.fontWeight = "bolder";

  link.addEventListener('click', function (event) {
    event.preventDefault();

    document.querySelectorAll('#map-legend a').forEach(function (a) {
      a.style.backgroundColor = 'transparent';
      a.style.color = a.dataset.color;
      a.style.fontWeight = 'normal';
    });

    link.style.border = '1.5px solid ' + color;
    link.style.borderRadius = '25px';
    link.style.padding = '3px 12px';
    link.style.fontWeight = '800';

    map.eachLayer(function (layer) {
      if (layer instanceof L.Marker) {
        var isMatch = layer.lieuNom === lieu.nom;
        layer.setOpacity(isMatch ? 1 : 0.15);
        layer.setZIndexOffset(isMatch ? 1000 : 0);
      }
    });

    updateMapInfo(lieu);
    setViewWithPanel([lieu.lat, lieu.lng], map.getZoom());
  });

  li.appendChild(link);
  return li;
}

map.on('click', function (e) {
  if (!e.originalEvent._stopped) {
    resetView();
  }
});

function addLieuMarker(lieu) {
  if (typeof lieu.lat !== 'number' || typeof lieu.lng !== 'number') return;

  const color = getCategorieColor(lieu.categorie);
  
  const busStops = ['agora-des-arts', 'studio-coppercrib'];
  const isBusStop = busStops.includes(lieu.id);
  
  const size = isBusStop ? 36 : 26;
  const anchor = size / 2;

  const busIcon = isBusStop ? `
    <i class="bi bi-bus-front-fill" style="
      color: white;
      font-size: 18px;
      line-height: 1;
    "></i>` : '';

  const icon = L.divIcon({
    className: '',
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background-color: ${color};
      border: 2px solid white;
      box-shadow: 0 0 4px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">${busIcon}</div>`,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor]
  });

  const marker = L.marker([lieu.lat, lieu.lng], { icon }).addTo(map);
  marker.lieuNom = lieu.nom;

  marker.on('click', function (e) {
    L.DomEvent.stopPropagation(e);
    updateMapInfo(lieu);
    setViewWithPanel([lieu.lat, lieu.lng], 17);
  });
}

function updateMapInfo(lieu) {
  showMapInfo();

document.querySelectorAll('#map-legend a').forEach(function (a) {
    a.style.backgroundColor = 'transparent';
    a.style.color = a.dataset.color;
    a.style.fontWeight = 'normal';  // ← ICI le bug : tous deviennent gras
    a.style.border = 'none';
    a.style.borderRadius = '25px';
    a.style.padding = '3px 4px';
})

  document.querySelectorAll('#map-legend a').forEach(function (a) {
    if (a.textContent.toLowerCase() === lieu.nom.toLowerCase()) {
      a.style.backgroundColor = a.dataset.color;
      a.style.color = '#010b0f';
      a.style.fontWeight = '600';
    }
  });

  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      var isMatch = layer.lieuNom === lieu.nom;
      layer.setOpacity(isMatch ? 1 : 0.15);
      layer.setZIndexOffset(isMatch ? 1000 : 0);
    }
  });

  document.querySelector('#map-info h3').textContent = lieu.nom;
  document.querySelector('#map-info .adresse').textContent = lieu.adresse;
  document.querySelector('#map-info .horaires').textContent = lieu.horaires;

  const mapInfo = document.getElementById('map-info');
  mapInfo.style.backgroundImage = `url('./assets/medias/lieux/${lieu.id}.jpg')`;

  const activitesNav = document.getElementById('activites-nav');
  activitesNav.innerHTML = '';

  const hasHoraires = lieu.activites.some(a => a.horaire);

  const horaireBlock = document.createElement('div');
  horaireBlock.className = 'activites-horaire-global';
  horaireBlock.textContent = lieu.horaires;
  activitesNav.appendChild(horaireBlock);

  lieu.activites.forEach(function(activite) {
    const block = document.createElement('div');
    block.className = 'activite-block';

    const titre = document.createElement('p');
    titre.className = 'activite-titre';
    titre.innerHTML = hasHoraires && activite.horaire
      ? `<span class="activite-heure">${activite.horaire}</span> ${activite.titre}`
      : activite.titre;

    block.appendChild(titre);

    if (activite.details) {
      const details = document.createElement('p');
      details.className = 'activite-details';
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      details.innerHTML = activite.details.replace(urlRegex, '<a href="$1" target="_blank" style="color: var(--bleu-pale);">$1</a>');
      block.appendChild(details);
    }

    activitesNav.appendChild(block);
  });
}

// Bouton de fermeture du panneau info
document.getElementById('map-info-close').addEventListener('click', function() {
  resetView();
});

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

    data.lieux.forEach(function(lieu) {
      const img = new Image();
      img.src = `./assets/medias/lieux/${lieu.id}.jpg`;
    });

    var legend = document.getElementById('map-legend');
    data.lieux.filter(l => l.lat && l.lng).forEach(l => legend.appendChild(buildLegendItem(l)));
  })
  .catch(function (error) {
    console.error(error.message);
  });