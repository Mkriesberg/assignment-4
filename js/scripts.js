mapboxgl.accessToken = 'pk.eyJ1IjoibWtyaWVzYmVyZyIsImEiOiJjbHVsdTVocTgweXhzMmlwMWZoNDk2dDdhIn0.-0g7mENM-vtH3DoHLXaHKg';
    const map = new mapboxgl.Map({
        container: 'map',
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-71.07236, 42.33988],
        zoom: 10
    });
    let hoveredPolygonId = null;

    map.on('load', () => {

        console.log('Loaded')
        // first argument is name of source. second argument is type. data is where the data is stored. This is where I need to put municipality boundary data
        map.addSource('municipalities', {
            'type': 'geojson',
            'data': 'https://docs.mapbox.com/mapbox-gl-js/assets/us_states.geojson'
        });

        //add data from qgis
        map.addSource('Mass Municipality Borders', {
            'type': 'geojson',
            'data': 'Mass Municipality Borders.geojson'
        })

        //add line to qgis data STOPPED HERE CHANGE FILE NAMES TO LOWER CASE
        map.addLayer({
            'id': 'Mass Municipality Borders-line',
            'type': 'line',
            'source': 'Mass Municipality Borders',
            'layout': {},
            'paint': {
                'line-color': '#000',
            }
        }, 'building-number-label');

        // The feature-municipality dependent fill-opacity expression will render the hover effect
        // when a feature's hover municipality is set to true. Check out mapbox style spec for help. Building number label is the layer of the map that my layers will go on top of
        map.addLayer({
            'id': 'municipality-fills',
            'type': 'fill',
            'source': 'municipalities',
            'layout': {},
            'paint': {
                'fill-color': '#627BC1',
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    1,
                    0.5
                ]
            }
        }, 'building-number-label');

        map.addLayer({
            'id': 'municipality-borders',
            'type': 'line',
            'source': 'municipalities',
            'layout': {},
            'paint': {
                'line-color': '#627BC1',
                'line-width': 2
            }
        }, 'building-number-label');
        // list all the layers on the map
        console.log(
            map.getStyle().layers
        )

        // When the user moves their mouse over the state-fill layer, we'll update the
        // feature state for the feature under the mouse.
        map.on('mousemove', 'municipality-fills', (e) => {
            if (e.features.length > 0) {
                if (hoveredPolygonId !== null) {
                    map.setFeatureState(
                        { source: 'municipalities', id: hoveredPolygonId },
                        { hover: false }
                    );
                }
                hoveredPolygonId = e.features[0].id;
                map.setFeatureState(
                    { source: 'municipalities', id: hoveredPolygonId },
                    { hover: true }
                );
            }
        });

        // When the mouse leaves the state-fill layer, update the feature state of the
        // previously hovered feature.
        map.on('mouseleave', 'municipality-fills', () => {
            if (hoveredPolygonId !== null) {
                map.setFeatureState(
                    { source: 'municipalities', id: hoveredPolygonId },
                    { hover: false }
                );
            }
            hoveredPolygonId = null;
        });
    });