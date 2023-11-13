mapboxgl.accessToken = 'pk.eyJ1IjoibHVjaWZlcnllbGxvdyIsImEiOiJja2V1bWJkd2MxcHozMnltcmVzajE0NWs3In0.LjpvVCLIKvcCpSLqE4P-5Q';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/luciferyellow/cloxbca2j00pb01ntez8jbgx7',
  center: [-79.37, 43.73], // starting position //[-79.37, 43.73][-79.3832, 43.653239]
  //pitch: 16, // pitch in degrees
  //bearing: -17.2, // bearing in degrees
  zoom: 10
});

map.on('load', function () {

  // combine time and type filter
  var filterHmcYear = ['==', ['number', ['get', 'OCC_YEAR']], 2016];
  var filterHmc = ['!=', ['string', ['get', 'HOMICIDE_TYPE']], 'placeholder'];

  map.getCanvas().style.cursor = 'default';  
  map.fitBounds([[-79.11319221830604, 43.857310847120004], [-79.64111539940615, 43.580518219783386]]);
  map.setBearing(-17);
  map.setZoom(10.6);


  // add source and layer for neighbourhoods
  map.addSource('nbdata-8ov2bh', {
    type: 'vector',
    url: 'mapbox://luciferyellow.7pmak70e'
  });
  // Black population layer

  map.addLayer({
    'id': 'Black',
    'type': 'fill',
    'source': 'nbdata-8ov2bh',
    'layout': {
      // make layer visible by default
      'visibility': 'none',
    },
    'paint': {
      'fill-color': ["interpolate",
                     ["linear"],
                     ["get", "BLK"],
                     0, '#fef5da', 7, '#ffdb78', 13, '#ffc216', 19, '#b38400', 25, '#513c00', 32, '#201800'],
      'fill-opacity': 0.8,
      'fill-outline-color': '#000000'
    },
    'source-layer': 'nbdata-8ov2bh'
  },
              );


  // add source and layer for homicides
  map.addSource('Homicides_Open_Data_ASR_RC_TB-ay390n', {
    type: 'vector',
    url: 'mapbox://luciferyellow.6w1g1aqw'
  });
  // homicide layer
  map.addLayer({
    'id': 'Homicides',
    'type': 'circle',
    'source': 'Homicides_Open_Data_ASR_RC_TB-ay390n', //updated Feb 3, 2022
    'layout': {
      // make layer visible by default
      'visibility': 'none'
    },
    'paint': {
      'circle-radius': 4,
      'circle-color': '#e72323'
    },
    'source-layer': 'Homicides_Open_Data_ASR_RC_TB-ay390n',
    'filter': ['all', filterHmcYear, filterHmc]
  });

  // interactive time slider for homicide
  document.getElementById('slider').addEventListener('input', function(e) {
    var year = parseInt(e.target.value);
    // update the map
    filterHmcYear = ['==', ['number', ['get', 'OCC_YEAR']], year];
    map.setFilter('Homicides', ['all', filterHmcYear, filterHmc]);

    // 
    // var ampm = year !== 2016;
    var year2016 = year - 2016;

    // update text in the UI
    document.getElementById('occurrence-year').innerText = 2016 + year2016;
  });

  //radio button crime type filter
  // Homicide type
  document.getElementById('filters hmc').addEventListener('change', function(e) {
    var hmc = e.target.value;
    // update the map filter
    if (hmc === 'all') {
      filterHmc = ['!=', ['string', ['get', 'HOMICIDE_TYPE']], 'placeholder'];
    } else if (hmc === 'Shooting') {
      filterHmc = ['match', ['get', 'HOMICIDE_TYPE'], ['Shooting'], true, false];
    } else if (hmc === 'Stabbing') {
      filterHmc = ['match', ['get', 'HOMICIDE_TYPE'], ['Stabbing'], true, false];
    } else if (hmc === 'Other') {
      filterHmc = ['match', ['get', 'HOMICIDE_TYPE'], ['Other'], true, false];
    } else {
      console.log('error');
    }
    map.setFilter('Homicides', ['all', filterHmcYear,filterHmc]);
  });


  // homicide survivor support source and layer, symbol layer
  map.loadImage(
    'https://i.ibb.co/fCkd76k/blackhand.png',
    function (error, image) {
      if (error) throw error;
      map.addImage('blackhand', image);
      map.addSource('Resource_Assest_Map_-_Toronto', {
        type: 'vector',
        url: 'mapbox://luciferyellow.ckevyqoo002p12bpc75c37wed-2cjy7'
      });
      map.addLayer({
        'id': 'Survivor Support',
        'type': 'symbol',
        'source': 'Resource_Assest_Map_-_Toronto',
        'layout': {
          // make layer visible by default
          'visibility': 'none',
          'icon-image': 'blackhand',
          'icon-size': 0.05,
          'text-field': ['get', 'Name_of_Organization'],
          'text-font': [
            'Open Sans ExtraBold',
            'Arial Unicode MS Bold'
          ],
          'text-size': 10,
          'text-offset': [0, 0],
          'text-anchor': 'top'
        },
        'paint': {
          'text-color': '#fce8d0',
          'text-halo-color': '#212b2c',
          'text-halo-width': 1,
        },
        'source-layer': 'Resource_Assest_Map_-_Toronto'
      });
    }
  )

  // When a click event occurs on a feature in the survivor support layer, open a popup at the
  // location of the feature, with description HTML from its properties.
  map.on('click', 'Survivor Support', function (e) {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = '<strong>' + e.features[0].properties.Name_of_Organization + '</strong><p>' + e.features[0].properties.Supports;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);
  });

  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on('mouseenter', 'Survivor Support', function () {
    map.getCanvas().style.cursor = 'pointer';
  });

  // Change it back to a pointer when it leaves.
  map.on('mouseleave', 'Survivor Support', function () {
    map.getCanvas().style.cursor = 'default';
  });


  // hover information window
  map.on('mousemove', function(e) {
    var nbhs = map.queryRenderedFeatures(e.point, {
      layers: ['nbdata']
    });

    if (nbhs.length > 0) {
      document.getElementById('pd').innerHTML = '<h3><strong>' + nbhs[0].properties.AREA_NAME + 
        '</strong></h3><p><strong><em>' + nbhs[0].properties.BLK + '</strong>% Black population. Median: 5.69%</em></p>' + 
        '</strong></h3><p><strong><em>' + nbhs[0].properties.UNEMP + '</strong>% Unemployment rate. Median: 8.2%</em></p>' + 
        '</strong></h3><p><strong><em>' + nbhs[0].properties.LOW_INCOME + '</strong>% Low income prevalence (LIM-AT). Median: 18.6%</em></p>' + 
        '</strong></h3><p><strong><em>' + nbhs[0].properties.NO_CERT + '</strong>% No certificate, diploma or degree. Median: 16.42%</em></p>' + 
        '</strong></h3><p><small><em>Source: <a href="https://open.toronto.ca/dataset/neighbourhood-profiles/">2016 Census Neighbourhood Profiles</small></em></a></p>'; 
    } else {
      document.getElementById('pd').innerHTML = '<p>Hover over a neighbourhood!</p><br><br><br><br><br><br><br>' + 
        '<p><small><em>Source: <a href="https://open.toronto.ca/dataset/neighbourhood-profiles/">2016 Census Neighbourhood Profiles</small></em></a></p>';
    }       
  });


}); //map.on end here

// enumerate ids of the layers
var toggleableLayerIds = ['Black', 'Homicides','Survivor Support'];

// set up the corresponding toggle button for each layer
for (var i = 0; i < toggleableLayerIds.length; i++) {
  var id = toggleableLayerIds[i];

  var link = document.createElement('a');
  link.href = '#';
  link.className = '';
  link.textContent = id;

  link.onclick = function (e) {
    var clickedLayer = this.textContent;
    e.preventDefault();
    e.stopPropagation();

    var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

    // toggle layer visibility by changing the layout object's visibility property
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
