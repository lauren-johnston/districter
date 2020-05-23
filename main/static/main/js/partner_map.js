/*
 * Copyright (c) 2019- Representable Team (Theodor Marcu, Lauren Johnston, Somya Arora, Kyle Barnes, Preeti Iyer).
 *
 * This file is part of Representable
 * (see http://representable.org).
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
/*------------------------------------------------------------------------*/
/* JS file from mapbox site -- display a polygon */
/* https://docs.mapbox.com/mapbox-gl-js/example/geojson-polygon/ */
var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/streets-v11", //color of the map -- dark-v10 or light-v9
  center: [-96.7026, 40.8136], // starting position - Lincoln, Nebraska (middle of country lol)
  zoom: 3, // starting zoom -- higher is closer
});

// geocoder used for a search bar -- within the map itself
var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  country: "us",
  mapboxgl: mapboxgl,
});
map.addControl(geocoder, "top-right");

// Add geolocate control to the map. -- this zooms in on the user's current location when pressed
// Q: is it too confusing ? like the symbol doesn't exactly tell you what it does
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
  })
);

map.addControl(new mapboxgl.NavigationControl()); // plus minus top right corner

// add a new source layer
function newSourceLayer(name, mbCode) {
  map.addSource(name, {
    type: "vector",
    url: "mapbox://" + mapbox_user_name + "." + mbCode,
  });
}
// add a new layer of census block data
function newCensusLayer(state, firstSymbolId) {
  map.addLayer(
    {
      id: state.toUpperCase() + " Census Blocks",
      type: "line",
      source: state + "-census",
      "source-layer": state + "census",
      minzoom: 9,
      layout: {
        visibility: "none",
      },
      paint: {
        "line-color": "rgba(106,137,204,0.3)",
        "line-width": 2,
      },
    },
    firstSymbolId
  );
}
// add a new layer of upper state legislature data
function newUpperLegislatureLayer(state) {
  map.addLayer({
    id: state.toUpperCase() + " State Legislature - Upper",
    type: "line",
    source: state + "-upper",
    "source-layer": state + "upper",
    minzoom: 5,
    layout: {
      visibility: "none",
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "rgba(106,137,204,0.7)",
      "line-width": 3,
    },
  });
}
// add a new layer of lower state legislature data
function newLowerLegislatureLayer(state) {
  map.addLayer({
    id: state.toUpperCase() + " State Legislature - Lower",
    type: "line",
    source: state + "-lower",
    "source-layer": state + "lower",
    minzoom: 5,
    layout: {
      visibility: "none",
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "rgba(106,137,204,0.7)",
      "line-width": 3,
    },
  });
}

entry_names = JSON.parse(entry_names);
entry_reasons = JSON.parse(entry_reasons);
var community_bounds = {};

map.on("load", function () {
  var layers = map.getStyle().layers;
  // Find the index of the first symbol layer in the map style
  var firstSymbolId;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === "symbol" && layers[i] !== "road") {
      firstSymbolId = layers[i].id;
      break;
    }
  }
  // this is where the census blocks are loaded, from a url to the mbtiles file uploaded to mapbox
  for (let census in CENSUS_KEYS) {
    newSourceLayer(census, CENSUS_KEYS[census]);
  }
  // upper layers
  for (let upper in UPPER_KEYS) {
    if (states[i] !== "dc") {
      newSourceLayer(upper, UPPER_KEYS[upper]);
    }
  }
  // lower layers
  for (let lower in LOWER_KEYS) {
    if (states[i] !== "dc") {
      newSourceLayer(lower, LOWER_KEYS[lower]);
    }
  }
  for (let i = 0; i < states.length; i++) {
    newCensusLayer(states[i], firstSymbolId);
    if (states[i] !== "dc") {
      newUpperLegislatureLayer(states[i]);
      newLowerLegislatureLayer(states[i]);
    }
  }

  // tags add to properties
  tags = JSON.parse(tags);
  // send elements to javascript as geojson objects and make them show on the map by
  // calling the addTo

  var outputstr = a.replace(/'/g, '"');
  a = JSON.parse(outputstr);
  var zooming = true;

  for (obj in a) {
    // check how deeply nested the outer ring of the unioned polygon is
    final = [];
    // set the coordinates of the outer ring to final
    if (a[obj][0][0].length > 2) {
      final = [a[obj][0][0]];
    } else if (a[obj][0].length > 2) {
      final = [a[obj][0]];
    } else {
      final = a[obj];
    }
    // add info to bounds list for zooming
    // ok zoomer
    var fit = new L.Polygon(final).getBounds();
    var southWest = new mapboxgl.LngLat(fit['_southWest']['lat'], fit['_southWest']['lng']);
    var northEast = new mapboxgl.LngLat(fit['_northEast']['lat'], fit['_northEast']['lng']);
    community_bounds[obj] = new mapboxgl.LngLatBounds(southWest, northEast)
    if (zooming) {
      map.fitBounds(community_bounds[obj], {padding: 100});
      zooming = false;
    }
    // draw the polygon
    map.addLayer({
      id: obj,
      type: "fill",
      source: {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: final,
          },
          properties: {
            name: entry_names[obj],
            reason: entry_reasons[obj],
          },
        },
      },
      layout: {
        visibility: "visible",
      },
      paint: {
        "fill-color": "rgba(110, 178, 181,0.15)",
      },
    });

    // this has to be a separate layer bc mapbox doesn't allow flexibility with thickness of outline of polygons
    map.addLayer({
      id: obj + "line",
      type: "line",
      source: {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: final,
          },
          properties: {
            name: entry_names[obj],
            reason: entry_reasons[obj],
          },
        },
      },
      layout: {
        visibility: "visible",
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "rgba(0, 0, 0,0.5)",
        "line-width": 2,
      },
    });
  }
  // find what features are currently on view
  // multiple features are gathered that have the same source (or have the same source with 'line' added on)
  map.on("moveend", function () {
    var sources = [];
    var features = map.queryRenderedFeatures();
    // clear the html so that we dont end up with duplicate communities
    document.getElementById("community-list").innerHTML = "";
    for (var i = 0; i < features.length; i++) {
      // through all the features which are rendered, get info abt them
      var source = features[i].source;
      if (
        source !== "composite" &&
        !source.includes("line") &&
        !source.includes("census") &&
        !source.includes("lower") &&
        !source.includes("upper")
      ) {
        if (!sources.includes(source)) {
          sources.push(source);
          var inner_content =
            "<span class='font-weight-light text-uppercase'><a style='display:inline;' href='/submission?map_id=" +
            source.slice(0, 8) +
            "'>".concat(
              features[i].properties.name,
              "</a></span><hr class='my-1'>\n",
              "<span class='font-weight-light'>Why are you submitting this community?</span> <div class='p-1 my-1 bg-info text-white text-center '>",
              features[i].properties.reason,
              "</div>"
            );
          var content =
            '<li class="list-group-item small" id=' +
            source +
            ">".concat(inner_content, "</li>");
          // put the code into the html - display!
          document
            .getElementById("community-list")
            .insertAdjacentHTML("beforeend", content);
        }
      }
    }
  });
});

// on hover, highlight the community
$("#community-list").on("mouseenter", "li", function () {
  map.setPaintProperty(this.id + "line", "line-color", "rgba(0, 0, 0, 0.8)");
  map.setPaintProperty(this.id + "line", "line-width", 3);
  map.setPaintProperty(this.id, "fill-color", "rgba(61, 114, 118,0.3)");
});
$("#community-list").on("mouseleave", "li", function () {
  map.setPaintProperty(this.id + "line", "line-color", "rgba(0, 0, 0,0.5)");
  map.setPaintProperty(this.id + "line", "line-width", 2);
  map.setPaintProperty(this.id, "fill-color", "rgba(110, 178, 181,0.15)");
});

//create a button that toggles layers based on their IDs
var toggleableLayerIds = [
  "Census Blocks",
  "State Legislature - Lower",
  "State Legislature - Upper",
];

for (var i = 0; i < toggleableLayerIds.length; i++) {
  var id = toggleableLayerIds[i];

  var link = document.createElement("input");

  link.value = id.replace(/\s+/g, "-").toLowerCase();
  link.id = id;
  link.type = "checkbox";
  link.className = "switch_1";
  link.checked = false;

  link.onchange = function (e) {
    var txt = this.id;
    var clickedLayers = [];
    for (let i = 0; i < states.length; i++) {
      if (states[i] !== "dc" || txt === "Census Blocks") {
        clickedLayers.push(states[i].toUpperCase() + " " + txt);
      }
    }
    // var clickedLayers = ["NJ " + txt, "VA " + txt, "PA " + txt, "MI " + txt];
    e.preventDefault();
    e.stopPropagation();

    for (var j = 0; j < clickedLayers.length; j++) {
      var visibility = map.getLayoutProperty(clickedLayers[j], "visibility");

      if (visibility === "visible") {
        map.setLayoutProperty(clickedLayers[j], "visibility", "none");
      } else {
        map.setLayoutProperty(clickedLayers[j], "visibility", "visible");
      }
    }
  };
  // in order to create the buttons
  var div = document.createElement("div");
  div.className = "switch_box box_1";
  var label = document.createElement("label");
  label.setAttribute("for", id.replace(/\s+/g, "-").toLowerCase());
  label.textContent = id;
  var layers = document.getElementById("outline-menu");
  div.appendChild(link);
  div.appendChild(label);
  layers.appendChild(div);
  var newline = document.createElement("br");
}

/* Loop through all dropdown buttons to toggle between hiding and showing its dropdown content -
This allows the user to have multiple dropdowns without any conflict */
var dropdown = document.getElementsByClassName("dropdown-btn");
var i;

for (i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function () {
    this.classList.toggle("active");
    var dropdownContent = this.nextElementSibling;
    if (dropdownContent.style.display === "block") {
      dropdownContent.style.display = "none";
    } else {
      dropdownContent.style.display = "block";
    }
    // add logic for polygons
    // map.setFilter('users', ['in', 'orgs', ...targetIDs]);
  });
}

// search bar function ! looks through the tags and the buttons themselves
function searchTags() {
  // go through all names and all reasons - find ones that match... wait do we even want a search bar?
}
