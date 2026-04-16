const map = L.map('map').setView([48.2390, -79.0227], 13);

L.tileLayer('https://api.maptiler.com/tiles/satellite-night/{z}/{x}/{y}.webp?key=a5wyVMXVGRpzbim7TaPr', {
    maxZoom: 19,
    attribution: '&copy; CartoDB'
}).addTo(map);

var markerVieuxTheatre = L.marker([48.2390, -79.0227]).addTo(map);
markerVieuxTheatre.on('click', function() {
    console.log('cliqué !');
    // ou ouvre un popup, modal, etc.
});