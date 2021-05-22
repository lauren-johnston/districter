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
  style: "mapbox://styles/mapbox/light-v9", //color of the map -- dark-v10 or light-v9 or streets-v11
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

state = state.toLowerCase();

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

// Add zoom control for non-mobile devices
if (!window.matchMedia("only screen and (max-width: 760px)").matches) {
  map.addControl(new mapboxgl.NavigationControl()); // plus minus top right corner
}

// add a new source layer
function newSourceLayer(name, mbCode) {
  map.addSource(name, {
    type: "vector",
    url: "mapbox://" + mapbox_user_name + "." + mbCode,
  });
}

// add a new mapbox boundaries source + layer
function newBoundariesLayer(name) {
  map.addSource(name, {
    type: "vector",
    url: "mapbox://mapbox.boundaries-" + name + "-v3"
  });
  map.addLayer(
    {
      id: name + "-lines",
      type: "line",
      source: name,
      "source-layer": "boundaries_" + BOUNDARIES_ABBREV[removeLastChar(name)] + "_" + name.slice(-1),
      layout: {
        visibility: "none"
      },
      paint: {
        "line-color": BOUNDARIES_COLORS[name],
        "line-opacity": 0.7,
        "line-width": 2,
      }
    }
  );
}

var community_bounds = {};
var coidata;
var shownCois = new Set(); // Tracks the ids of the cois that are selected to be "only show"
var coidata_geojson_format;
const mxzoom = 10, tol = 3.5;
map.on("load", function () {
  var layers = map.getStyle().layers;
  // Find the index of the first symbol layer in the map style
  // only necessary for making added layers appear "beneath" the existing layers (roads, place names, etc)
  // var firstSymbolId;
  // for (var i = 0; i < layers.length; i++) {
  //   if (layers[i].type === "symbol" && layers[i] !== "road") {
  //     firstSymbolId = layers[i].id;
  //     break;
  //   }
  // }
  /****************************************************************************/
  // school districts as a data layer
  newSourceLayer("school-districts", SCHOOL_DISTR_KEY);
  map.addLayer(
    {
      id: "school-districts-lines",
      type: "line",
      source: "school-districts",
      "source-layer": "us_school_districts",
      layout: {
        visibility: "none",
      },
      paint: {
        "line-color": BOUNDARIES_COLORS["school"],
        "line-opacity": 0.7,
        "line-width": 2,
      },
    }
  );
  // tribal boundaries as a data layer
  newSourceLayer("tribal-boundaries", TRIBAL_BOUND_KEY);
  map.addLayer({
    id: "tribal-boundaries-lines",
    type: "line",
    source: "tribal-boundaries",
    "source-layer": "tl_2020_us_aiannh", //-7f7uk7
    layout: {
      visibility: "none",
    },
    paint: {
      "line-color": BOUNDARIES_COLORS["tribal"],
      "line-opacity": 0.7,
      "line-width": 2,
    },
  });
  // ward + community areas for IL
  if (state === "il") {
    newSourceLayer("chi_wards", CHI_WARD_KEY);
    newSourceLayer("chi_comm", CHI_COMM_KEY);
    map.addLayer(
      {
        id: "chi-ward-lines",
        type: "line",
        source: "chi_wards",
        "source-layer": "chi_wards",
        layout: {
          visibility: "none",
        },
        paint: {
          "line-color": BOUNDARIES_COLORS["chi-ward"],
          "line-opacity": 0.7,
          "line-width": 2,
        },
      }
    );
    map.addLayer(
      {
        id: "chi-comm-lines",
        type: "line",
        source: "chi_comm",
        "source-layer": "chi_comm",
        layout: {
          visibility: "none",
        },
        paint: {
          "line-color": BOUNDARIES_COLORS["chi-comm"],
          "line-opacity": 0.7,
          "line-width": 2,
        },
      }
    );
  }
  if (state === "ny") {
    newSourceLayer("nyc-city-council", NYC_COUNCIL_KEY);
    map.addLayer({
      id: "nyc-city-council-lines",
      type: "line",
      source: "nyc-city-council",
      "source-layer": "nyc_council-08swpg",
      layout: {
        visibility: "none",
      },
      paint: {
        "line-color": BOUNDARIES_COLORS["nyc"],
        "line-opacity": 0.7,
        "line-width": 2,
      },
    });
    newSourceLayer("nyc-state-assembly", NYC_STATE_ASSEMBLY_KEY);
    map.addLayer({
      id: "nyc-state-assembly-lines",
      type: "line",
      source: "nyc-state-assembly",
      "source-layer": "nyc_state_assembly-5gr5zo",
      layout: {
        visibility: "none",
      },
      paint: {
        "line-color": BOUNDARIES_COLORS["nyc_assembly"],
        "line-opacity": 0.7,
        "line-width": 2,
      },
    });
  }
  // leg2 : congressional district
  // leg3 : state senate district
  // leg4 : state house district
  // adm2 : counties
  // loc4 : neighborhoods
  // pos4 : 5-digit postcode area
  // sta5 : block groups
  for (var key in BOUNDARIES_LAYERS) {
    newBoundariesLayer(key);
  }

  // draw all coi's in one layer
  coidata = JSON.parse(coidata.replace(/'/g, '"'));

  coidata_geojson_format = {
    'type': 'FeatureCollection',
    'features': []
  };

  for (coi_id in coidata) {
    // set the coordinates of the outer ring to final
    final = [];
    if (coidata[coi_id][0][0].length > 2) {
      final = [coidata[coi_id][0][0]];
    } else if (coidata[coi_id][0].length > 2) {
      final = [coidata[coi_id][0]];
    } else {
      final = coidata[coi_id];
    }
    coidata[coi_id] = final

    // add info to bounds list for zooming
    var fit = new L.Polygon(final).getBounds();
    var southWest = new mapboxgl.LngLat(fit['_southWest']['lat'], fit['_southWest']['lng']);
    var northEast = new mapboxgl.LngLat(fit['_northEast']['lat'], fit['_northEast']['lng']);
    community_bounds[coi_id] = new mapboxgl.LngLatBounds(southWest, northEast)

    coidata_geojson_format.features.push({
      'type': 'Feature',
      'geometry': {
          'type': 'Polygon',
          'coordinates': final
      }
    });
  }

  // mxzoom(def 18 higher = more detail)
  // tol(def .375 higher = simpler geometry)

  map.addSource('coi_all', {
      'type': 'geojson',
      'data': coidata_geojson_format,
      'maxzoom': mxzoom,
      'tolerance': tol
  });

  map.addLayer({
      'id': 'coi_layer_fill',
      'type': 'fill',
      'source': 'coi_all',
      'paint': {
          'fill-color': 'rgb(110, 178, 181)',
          'fill-opacity': 0.15
      },
  });

  // console.log('finsihed layers');

  // hover to highlight
  $(".community-review-span").hover(function() {
      let highlight_id = this.id + "_boldline";
      let highlight_id_fill = this.id + "_fill";
      if (map.getLayer(highlight_id)) {
        map.setLayoutProperty(highlight_id, "visibility", "visible")
        map.setLayoutProperty(highlight_id_fill, "visibility", "visible")
      } else {
        map.addSource(highlight_id, {
          'type': 'geojson',
          'data': {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: coidata[this.id],
            },
          },
          'maxzoom': mxzoom, // def 18 higher = more detail
          'tolerance': tol // def .375 higher = simpler geometry
      });
      map.addLayer({
          'id': highlight_id_fill,
          'type': 'fill',
          'source': highlight_id,
          'paint': {
            'fill-color': 'rgb(110, 178, 181)',
            'fill-opacity': 0.15
          },
      });
      map.addLayer({
          'id': highlight_id,
          'type': 'line',
          'source': highlight_id,
          'paint': {
            'line-color': '#808080',
            'line-width': 2,
          },
      });
    }
  }, function () {
    let highlight_id = this.id + "_boldline";
    let highlight_id_fill = this.id + "_fill";
    map.setLayoutProperty(highlight_id, "visibility", "none")
    map.setLayoutProperty(highlight_id_fill, "visibility", "none")
  });

  // find what features are currently on view
  // multiple features are gathered that have the same source (or have the same source with 'line' added on)

  // if (state === "") {
  //   map.on("moveend", function () {
  //     var sources = [];
  //     var features = map.queryRenderedFeatures();
  //     console.log("print inside the function")
  //     for (var i = 0; i < features.length; i++) {
  //       var source = features[i].source;
  //       if (
  //         source !== "composite" &&
  //         !source.includes("line") &&
  //         !source.includes("census") &&
  //         !source.includes("lower") &&
  //         !source.includes("upper")
  //       ) {
  //         if (!sources.includes(source)) {
  //           sources.push(source);
  //         }
  //       }
  //     }
  //     // only display those on the map
  //     $(".community-review-span").each(function(i, obj) {
  //       if ($.inArray(obj.id, sources) !== -1) {
  //         $(obj).show();
  //       } else {
  //         $(obj).hide();
  //       }
  //     });
  //   });
  // }


  // loading icon
  $(".loader").delay(500).fadeOut(500);
  // fly to state if org, otherwise stay on map
  if (state !== "") {
    map.flyTo({
      center: statesLngLat[state.toUpperCase()],
      zoom: 5,
      essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });
  } else {
    map.flyTo({
      center: [-96.7026, 40.8136],
      zoom: 3,
      essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });
  }
});

// on click, zoom to community
$(".community-review-span").click(function () {
  map.fitBounds(community_bounds[this.id], {padding: 100});
});

// show more button
document.querySelectorAll(".comm-content").forEach(function (p) {
  p.querySelector("a").addEventListener("click", function (e) {
    e.stopPropagation();
    p.classList.toggle("show");
    this.textContent = p.classList.contains("show") ? "Show Less" : "Show More";
  });
});

//create a button that toggles layers based on their IDs
var toggleableLayerIds = JSON.parse(JSON.stringify(BOUNDARIES_LAYERS));
toggleableLayerIds["school-districts"] = "School Districts";
toggleableLayerIds["tribal-boundaries"] = "2010 Census Tribal Boundaries";
// add selector for chicago wards + community areas if illinois
if (state === "il") {
  toggleableLayerIds["chi-ward"] = "Chicago Wards";
  toggleableLayerIds["chi-comm"] = "Chicago Community Areas";
}
if (state === "ny") {
  toggleableLayerIds["nyc-city-council"] = "New York City Council districts";
  toggleableLayerIds["nyc-state-assembly"] = "New York City state assembly districts";
}

for (var id in toggleableLayerIds){

  var link = document.createElement("input");

  link.value = id;
  link.id = id;
  link.type = "checkbox";
  link.className = "switch_1";
  link.checked = false;

  link.onchange = function (e) {
    var txt = this.id;
    // var clickedLayers = [];
    // clickedLayers.push(txt + "-lines");
    e.preventDefault();
    e.stopPropagation();

    var visibility = map.getLayoutProperty(txt + "-lines", "visibility");

    if (visibility === "visible") {
      map.setLayoutProperty(txt + "-lines", "visibility", "none");
    } else {
      // set all other layers to not visible, uncheck the display box for all other layers
      map.setLayoutProperty(txt + "-lines", "visibility", "visible");
      for (var layerID in toggleableLayerIds) {
        if (layerID != txt) {
          map.setLayoutProperty(layerID + "-lines", "visibility", "none");
          var button = document.getElementById(layerID);
          button.checked = false;
        }
      }
    }
  };
  // in order to create the buttons
  var div = document.createElement("div");
  div.className = "switch_box box_1";
  var label = document.createElement("label");
  label.setAttribute("for", id);
  label.textContent = toggleableLayerIds[id];
  var layers = document.getElementById("outline-menu");
  div.appendChild(link);
  div.appendChild(label);
  layers.appendChild(div);
  var newline = document.createElement("br");
};

// Toggles the visibility of the selected community. If the coi_layer_fill layer (all the communities) is displayed, remove it and
// display the selected community. If the last selected community community is hidden, display the coi_layer_fill layer.
function toggleEntryVisibility(checkbox)  {
  map.setLayoutProperty('coi_layer_fill', "visibility", "none");
  if (checkbox.checked) {
    shownCois.add(checkbox.value)
    if (map.getLayer(checkbox.value)) {
      map.setLayoutProperty(checkbox.value, "visibility", "visible");
    } else {
      map.addSource(checkbox.value, {
          'type': 'geojson',
          'data': {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: coidata[checkbox.value],
            },
          },
          'maxzoom': mxzoom,
          'tolerance': tol
      });
    
      map.addLayer({
          'id': checkbox.value,
          'type': 'fill',
          'source': checkbox.value,
          'paint': {
              'fill-color': 'rgb(110, 178, 181)',
              'fill-opacity': 0.15
          },
      });
    }
  }
  else {
    map.setLayoutProperty(checkbox.value, "visibility", "none");
    shownCois.delete(checkbox.value)
    if (shownCois.size == 0) map.setLayoutProperty('coi_layer_fill', "visibility", "visible");
  }
};

// Uncheck all communities that are currently checked and display the total community layer
function showAllCommunities() {
  $(".map-checkbox:checkbox:checked").toArray().forEach(function(coiCheckbox) {
    coiCheckbox.checked = false;
    toggleEntryVisibility(coiCheckbox);
  })
  map.setLayoutProperty('coi_layer_fill', "visibility", "visible");
}

function exportCois(url, type) {
  let coisToExport = shownCois.size > 0 ? shownCois : new Set(["all"]);
  dataToSend = {
      'cois': JSON.stringify(Array.from(coisToExport)),
      csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').attr('value'),
  }
  $.ajax({
          type: "POST",
          url: url,
          data: dataToSend,
          success:function(response){ 
            const blob = type == "geo" ? new Blob([JSON.stringify(response)], {type : 'application/json'}) : new Blob([response], {type : 'application/csv'})
            const url = window.URL.createObjectURL(blob);
            var link = type == "geo" ? document.getElementById("map-geo-link") : link = document.getElementById("map-csv-link")
            link.href = url
            link.click()
            window.URL.revokeObjectURL(url);
        }
      });
};

function showAllCommunities() {
  $(".map-checkbox:checkbox:checked").toArray().forEach(function(coiCheckbox) {
    coiCheckbox.checked = false;
    toggleEntryVisibility(coiCheckbox);
    map.setLayoutProperty('coi_layer_fill', "visibility", "visible");
  })
}
/*******************************************************************/

// remove the last char in the string
function removeLastChar(str) {
  return str.substring(0, str.length - 1);
}

// search bar filtering Communities
$(document).ready(function(){
  $("#search-comm").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#collapseThree tr").filter(function() {
      var innerText = $(this).text().toLowerCase().replace("show more", "").replace("show less", "").replace("report", "");
      $(this).toggle(innerText.indexOf(value) > -1)
    });
  });
});

/* Flips arrows on the dropdown menus upon clicking */
$("#buttonOne").click(function() {
  $("#arrowOne").toggleClass('flipY-inplace');
});
$("#buttonThree").click(function() {
  $("#arrowThree").toggleClass('flipY-inplace');
});
