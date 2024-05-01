mapboxgl.accessToken = 'pk.eyJ1IjoibWtyaWVzYmVyZyIsImEiOiJjbHVsdTVocTgweXhzMmlwMWZoNDk2dDdhIn0.-0g7mENM-vtH3DoHLXaHKg';
    const map = new mapboxgl.Map({
        container: 'map',
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-71.07236, 42.33988],
        zoom: 10
    });
    

    map.on('load', () => {

        console.log('Loaded')
        // first argument is name of source. second argument is type. data is where the data is stored. This is where I need to put municipality boundary data
        //add data from qgis
        map.addSource("mass-municipal-borders", {
            'type': 'geojson',
            'data': "data/mass-municipal-borders.geojson",
            generateId: true
        });

        map.addLayer({
            'id': 'mass-municipal-borders-fills',
            'type': 'fill',
            'source': "mass-municipal-borders",
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
        });

        map.addLayer({
            'id': 'mass-municipal-borders-line',
            'type': 'line',
            'source': "mass-municipal-borders",
            'layout': {},
            'paint': {
                'line-color': '#000',
            }
        });

        map.addLayer({
            id: 'mass-municipal-borders-labels',
            type: 'symbol',
            source: "mass-municipal-borders",
            layout: {
                'text-field': ['get', 'TOWN'],
                'text-font': ['Arial Unicode MS Bold'],
                'text-size': 12
            },
            paint: {
                'text-color': '#000'
            }
        });


        let hoveredPolygonId = null;

        // The feature-municipality dependent fill-opacity expression will render the hover effect
        // when a feature's hover municipality is set to true. Check out mapbox style spec for help. Building number label is the layer of the map that my layers will go on top of
        
        // list all the layers on the map
        console.log(
            map.getStyle().layers
        )

        // When the user moves their mouse over the state-fill layer, we'll update the
        // feature state for the feature under the mouse.
        map.on('mousemove', 'mass-municipal-borders-fills', (e) => {
            if (e.features.length > 0) {
                if (hoveredPolygonId !== null) {
                    map.setFeatureState(
                        { source: "mass-municipal-borders", id: hoveredPolygonId },
                        { hover: false }
                    );
                }
                hoveredPolygonId = e.features[0].id;
                map.setFeatureState(
                    { source: "mass-municipal-borders", id: hoveredPolygonId },
                    { hover: true }
                );
            }
        });

        map.getCanvas().style.cursor = 'pointer'

        // When the mouse leaves the state-fill layer, update the feature state of the
        // previously hovered feature.
        map.on('mouseleave', 'mass-municipal-borders-fills', () => {
            if (hoveredPolygonId !== null) {
                map.setFeatureState(
                    { source: "mass-municipal-borders", id: hoveredPolygonId },
                    { hover: false }
                );
            }
            hoveredPolygonId = null;

            map.getCanvas().style.cursor = ''
        });

    });