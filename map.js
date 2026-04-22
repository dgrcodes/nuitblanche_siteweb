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

const infoDefault = {
  titre: "Fêter la nuit",
  adresse: "Rouyn-Noranda",
  heures: "20 h à 2 h",
  description: "La Nuit blanche de Rouyn-Noranda revient pour une troisième édition et invite le public à plonger dans une expérience unique sous le thème <b>Fêter la nuit</b>. Alors que la nuit évoque habituellement le repos et la tranquillité, elle deviendra, le temps d'un soir, <b>un véritable terrain d'exploration artistique et créatif</b>.\n\nS'inspirant de ce qui se fait dans de grandes métropoles du monde entier, la Nuit blanche est l'occasion idéale pour rassembler les communautés autour d'une célébration de la culture. <b>Le samedi 2 mai prochain, le quartier du Vieux-Noranda et du Centre-ville de Rouyn-Noranda</b> se transformeront en espaces vivants et vibrants, offrant une multitude d'activités culturelles et festives. Ce thème festif s'exprime sous diverses formes : <b>sonores, numériques, immersives, réflexives et bien plus encore</b>.",
  bus: "<i>Cet évènement est réalisé en partenariat avec la Société du 100e dans le cadre des festivités du centenaire de la Ville de Rouyn-Noranda.</i>",
  cta: "Cliquer sur la carte pour avoir plus d'informations"
};

function getCategorieColor(categorie) {
  return categorieColors[categorie] || '#fafbfb';
}

const map = L.map('map').setView([48.2430, -79.0227], 15);
let activeCategory = null;

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
}).addTo(map);

fetch(`https://router.project-osrm.org/route/v1/foot/${-79.01605676016214},${48.247322960275966};${-79.01979147365628},${48.238026654493304}?overview=full&geometries=geojson`)
  .then(r => r.json())
  .then(data => {
    const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
    L.polyline(coords, {
      color: '#bbdee9',
      weight: 3,
      opacity: 0.8
    }).addTo(map);
  });

function buildPopupContent(lieu) {
  var title = lieu.nom || 'Lieu';
  var categorie = lieu.categorie ? '<br>Categorie: ' + lieu.categorie : '';
  return '<strong>' + title + '</strong>' + categorie;
}

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
      if (a.classList.contains('reset-link')) return;
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
        var isMatch = layer.lieuCategorie === lieu.categorie;
        layer.setOpacity(isMatch ? 1 : 0.15);
        layer.setZIndexOffset(isMatch ? 1000 : 0);
      }
    });

    map.setView([lieu.lat, lieu.lng], map.getZoom());
    updateMapInfo(lieu);
  });

  li.appendChild(link);
  return li;
}

map.on('click', function (e) {
  if (!e.originalEvent._stopped) {
    resetMarkerOpacity();
map.setView([48.2430, -79.0227], 15);
  }
});

function resetMapInfo() {
  document.querySelector('#map-info h3').textContent = infoDefault.titre;
document.querySelector('#map-info .adresse').textContent = infoDefault.adresse;
  document.querySelector('#map-info .horaires').textContent = infoDefault.heures;
  

  const activitesNav = document.getElementById('activites-nav');
  activitesNav.innerHTML = `
<div class="activite-block">
  <p class="activite-titre" style="white-space: pre-line;">${infoDefault.description}</p>
</div>
    <div class="activite-block">
      <p class="activite-details">${infoDefault.bus}</p>
    </div>
    <div class="activite-block">
      <span class="activite-heure">${infoDefault.cta}</span>
    </div>
  `;

  const mapInfo = document.getElementById('map-info');
mapInfo.style.backgroundImage = "url('./assets/medias/lieux/nuit-blanche.png')";
}

function resetMarkerOpacity() {
  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      layer.setOpacity(1);
      layer.setZIndexOffset(0);
    }
  });

 document.querySelectorAll('#map-legend a:not(.reset-link)').forEach(function (a) {
  a.style.backgroundColor = 'transparent';
  a.style.color = a.dataset.color;
  a.style.fontWeight = 'normal';
  a.style.border = 'none';
  a.style.borderRadius = '0';
  a.style.padding = '3px 4px';
});

var resetLink = document.querySelector('.reset-link');
resetLink.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';

resetMapInfo();
}

window.resetMarkerOpacity = resetMarkerOpacity;

function addLieuMarker(lieu) {
  if (typeof lieu.lat !== 'number' || typeof lieu.lng !== 'number') return;

  const color = getCategorieColor(lieu.categorie);
  
  const busStops = ['petit-theatre-du-vieux-noranda', 'studio-coppercrib'];
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

  const marker = L.marker([lieu.lat, lieu.lng], { icon })
    .addTo(map)
    .bindPopup(buildPopupContent(lieu));

  marker.lieuNom = lieu.nom;

  marker.on('click', function () {
    updateMapInfo(lieu);
    map.setView([lieu.lat, lieu.lng], 17);
  });
}

function updateMapInfo(lieu) {
  // Reset légende
document.querySelectorAll('#map-legend a').forEach(function (a) {
  if (a.classList.contains('reset-link')) return;
  a.style.backgroundColor = 'transparent';
  a.style.color = a.dataset.color;
  a.style.fontWeight = 'bolder';
  a.style.border = 'none';
  a.style.borderRadius = '25px';
  a.style.padding = '3px 4px';
});

  // Highlight le bon item dans la légende
  document.querySelectorAll('#map-legend a').forEach(function (a) {
    if (a.classList.contains('reset-link')) return;
    if (a.textContent.toLowerCase() === lieu.nom.toLowerCase()) {
      a.style.backgroundColor = a.dataset.color;
      a.style.color = '#010b0f';
      a.style.fontWeight = '600';
    }
  });

  // Griser les autres marqueurs
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

    resetMapInfo();
  })
  .catch(function (error) {
    console.error(error.message);
  });