/******************************************************************************/

// GEO Js file for handling map drawing.
/* https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-draw/ */
// Polygon Drawn By User
var user_polygon = null;

/******************************************************************************/

// Initialize the Map
/* eslint-disable */
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v11', //hosted style id
    center: [-74.65545, 40.341701], // starting position - Princeton, NJ :)
    zoom: 12 // starting zoom
});

var layerList = document.getElementById('menu');
var inputs = layerList.getElementsByTagName('input');

function switchLayer(layer) {
var layerId = layer.target.id;
map.setStyle('mapbox://styles/mapbox/' + layerId);
}

for (var i = 0; i < inputs.length; i++) {
inputs[i].onclick = switchLayer;
}

var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken
});

var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        trash: true
    }
});

map.addControl(geocoder, 'top-right');
map.addControl(draw);
map.boxZoom.disable();

/******************************************************************************/

// After the map style has loaded on the page, add a source layer and default
// styling for a single point.
map.on('load', function() {
    map.addSource('single-point', {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    });

    map.addSource("census", {
        type: "vector",
        url: "mapbox://districter-team.njblocks"
      });
    
    map.addLayer({
    "id": "census-blocks",
    "type": "fill",
    "source": "census",
    "source-layer": "NJBlocks",
    "layout": {
        "visibility": "visible"
    },
    "paint": {
        "fill-color": "rgba(200, 100, 240, 0)",
        "fill-outline-color": "rgba(200, 100, 240, 1)"
    }
    });

    map.addLayer({
        "id": "blocks-highlighted",
        "type": "fill",
        "source": "census",
        "source-layer": "NJBlocks",
        "paint": {
        "fill-outline-color": "#484896",
        "fill-color": "#6e599f",
        "fill-opacity": 0.75
        },
        "filter": ["in", "GEOID10", ""]
        }); 


    map.addLayer({
        "id": "point",
        "source": "single-point",
        "type": "circle",
        "paint": {
            "circle-radius": 10,
            "circle-color": "#007cbf"
        }
    });

    map.on('click', 'Census Blocks', function (e) {
        new mapboxgl.Popup({
            closeButton: false
        })
        .setLngLat(e.lngLat)
        .setHTML(e.features[0].properties.GEOID10)
        .addTo(map);
      });

    // Listen for the `geocoder.input` event that is triggered when a user
    // makes a selection and add a symbol that matches the result.
    geocoder.on('result', function(ev) {
        map.getSource('single-point').setData(ev.result.geometry);
        console.log(ev.result);
        var styleSpec = ev.result;
        var styleSpecBox = document.getElementById('json-response');
        var styleSpecText = JSON.stringify(styleSpec, null, 2);
        var syntaxStyleSpecText = syntaxHighlight(styleSpecText);
        styleSpecBox.innerHTML = syntaxStyleSpecText;

    });
});

var wasLoaded = false;
map.on('render', function() {
    if (!map.loaded() || wasLoaded) return;
    wasLoaded = true;
});

/******************************************************************************/

map.on('draw.create', updateCommunityEntry);
map.on('draw.delete', updateCommunityEntry);
map.on('draw.update', updateCommunityEntry);

/******************************************************************************/


// updatePolygon responds to the user's actions and updates the polygon field
// in the form.
function updateCommunityEntry(e) {
    
    var wkt = new Wkt.Wkt();
    var data = draw.getAll();
    var user_polygon;
    var entry_polygon;
    if (data.features.length > 0) {
        // Update User Polygon with the GeoJson data.
        user_polygon = data.features[0];
        entry_polygon = JSON.stringify(user_polygon['geometry']);
        // console.log(entry_polygon);
        // var features = map.querySourceFeatures('census', entry_polygon);
        // console.log(features);
        wkt_obj = wkt.read(entry_polygon);
        entry_polygon = wkt_obj.write();

        var polygonBoundingBox = turf.bbox(user_polygon);
        console.log("entry_polygon");
        console.log(entry_polygon);
        console.log("user_polygon");
        console.log(user_polygon);
        var southWest = [polygonBoundingBox[0], polygonBoundingBox[1]];
        var northEast = [polygonBoundingBox[2], polygonBoundingBox[3]];
        var northEastPointPixel = map.project(northEast);
        var southWestPointPixel = map.project(southWest);
        var pointarray = [];
        console.log(user_polygon.geometry.coordinates[0].length);
        for (let i = 0; i < user_polygon.geometry.coordinates[0].length-1; i++) {
            let p = [user_polygon.geometry.coordinates[0][i][0], user_polygon.geometry.coordinates[0][i][1]];
            // let p = new Point(user_polygon.coordinates[0][i][0], user_polygon.coordinates[0][i][1]);
            pointarray.push(p);
        }
        console.log("printing the coordinates");
        console.log(pointarray);
        // var features = map.queryRenderedFeatures(pointarray, { layers: ["census-blocks"] });
        var features = map.queryRenderedFeatures([southWestPointPixel, northEastPointPixel], { layers: ['census-blocks'] });


        console.log("printing features");
        console.log(features);
        // debugger

        var filter = features.reduce(function(memo, feature) {
            console.log(feature);
            console.log(memo);
            console.log(user_polygon.geometry.coordinates[0]);
            let poly1 = turf.polygon(feature.geometry.coordinates);
            let poly2 = turf.polygon(user_polygon.geometry.coordinates);

            // if (! (turf.intersect(poly1, poly2)) === undefined) {
            if (! (undefined === turf.intersect(feature, user_polygon))) {

                // only add the property, if the feature intersects with the polygon drawn by the user
                // console.log("entered the loop to check how many intersected");
                // console.log(memo);
                
                // console.log(feature);
                memo.push(feature.properties.GEOID10);
            } 
            // memo.push(feature.properties.FIPS);
            // console.log(memo);
            return memo;
        }, ["in", "GEOID10"]);
        
        // var filter2 = [];
        // for (let i = 0; i < filter.length; i++) {
        //     if (filter[i] != undefined) {
        //         filter2.push(filter[i]);
        //     }
        // }
        console.log("printing out the new filter");
        // console.log(filter);
        console.log(filter);
        

        map.setFilter("blocks-highlighted", filter);

        // if (map.getSource('census') && map.isSourceLoaded('census')) {
        //     console.log('source loaded!');
        //     var features = map.querySourceFeatures('census', entry_polygon);
        //     console.log(features);
        // }

        // if (map.loaded() || wasLoaded) {
        //     var features = map.querySourceFeatures('census', entry_polygon);

        //     console.log("printing the features");
        //     console.log(entry_polygon);
        //     console.log(features);
        //     var filter = features.reduce(function(memo, feature) {
        //         memo.push(feature.properties.FIPS);
        //         return memo;
        //         }, ['in', 'FIPS']);
                
        //         map.setFilter("blocks-highlighted", filter);
        // }
        
        

    } else {
        // Update User Polygon with `null`.
        user_polygon = null;
        entry_polygon = '';
    }
    // Update form field
    document.getElementById('id_entry_polygon').value = entry_polygon;
    
}

/******************************************************************************/

// AJAX for Saving https://l.messenger.com/l.php?u=https%3A%2F%2Fsimpleisbetterthancomplex.com%2Ftutorial%2F2016%2F08%2F29%2Fhow-to-work-with-ajax-request-with-django.html&h=AT2eBJBqRwotQY98nmtDeTb6y0BYi-ydl5NuMK68-V1LIRsZY11LiFF6o6HUCLsrn0vfPqJYoJ0RsZNQGvLO9qBJPphpzlX4fkxhtRrIzAgOsHmcC6pDV2MzhaeUT-hhj4M2-iOUyg
// Dummy Button Save Listener
// document.getElementById("dummySave").onclick = saveNewEntry;

/******************************************************************************/

// Process AJAX Request
function saveNewEntry(event) {
    console.log("Dummy save button pressed!");
    // Only save if the user_polygon is not null or empty
    if (user_polygon != null && user_polygon != '') {
        console.log("[AJAX] Sending saveNewEntry to server.")
        // Need to stringify
        // https://www.webucator.com/how-to/how-send-receive-json-data-from-the-server.cfm
        var entry_features = JSON.stringify(user_polygon);
        var map_center = JSON.stringify([map.getCenter()['lng'], map.getCenter()['lat']]);
        var entry_id = JSON.stringify(user_polygon['id']);
        $.ajax({
            url: 'ajax/dummy_save/',
            data: {
                'entry_id': entry_id,
                'entry_features': entry_features,
                'map_center': map_center,
            },
            dataType: 'json',
            success: function(data) {
                if (data.worked) {
                    alert("Saved!");
                } else {
                    alert("Error.");
                }
            }
        });
    }
}

/******************************************************************************/
