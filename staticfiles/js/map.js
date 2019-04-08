/* JS file from mapbox site -- display a polygon */
/* https://docs.mapbox.com/mapbox-gl-js/example/geojson-polygon/ */
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/dark-v10', //mapbox style -- dark is pretty for data visualization :o)
  center: [-74.65545, 40.341701], // starting position - Princeton, NJ :)
  zoom: 9 // starting zoom -- higher is closer
});

map.addControl(new mapboxgl.NavigationControl()); // plus minus top right corner

map.on('load', function () {
  // the stuff that happens when the map is loaded...
  /*
  var request = new XMLhttpRequest();
  request.open("GET", "../../assets/NJBlocks.json", false);
  request.send(null)
  var census_blocks = JSON.parse(request.responseText);
  alert(census_blocks.result[0]);

  map.addSource({
  'id': 'census',
  'data': census_blocks
});

map.addLayer({
'id': 'census-blocks',
'type': 'fill',
'source': 'census',
'paint': {
'fill-color': 'rgba(200, 100, 240, 0.4)',
'fill-outline-color': 'rgba(200, 100, 240, 1)'
},
});
*/

//it's just... a square...
map.addLayer({
  'id': 'dummy',
  'type': 'fill',
  'source': {
    'type': 'geojson',
    'data': {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [[[-74.0, 40.0],
        [-74.0, 40.5],
        [-74.5, 40.5],
        [-74.5, 40.0]]]
      }
    }
  },
  'layout': {},
  'paint': {
    'fill-color': 'rgba(200, 100, 240, 0.4)',
    'fill-outline-color': 'rgba(200, 100, 240, 1)'
  }
});
});

//create a button ! toggles layers based on their IDs
var toggleableLayerIds = [ 'Census Blocks', 'Districts' ];

for (var i = 0; i < toggleableLayerIds.length; i++) {
  var id = toggleableLayerIds[i];

  var link = document.createElement('a');
  link.href = '#';
  link.className = 'active';
  link.textContent = id;

  link.onclick = function (e) {
    var clickedLayer = this.textContent;
    e.preventDefault();
    e.stopPropagation();

    var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

    if (visibility === 'visible') {
      map.setLayoutProperty(clickedLayer, 'visibility', 'none');
      this.className = '';
    } else {
      this.className = 'active';
      map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
    }
  };

  var layers = document.getElementById('menu');
  layers.appendChild(link);
}
