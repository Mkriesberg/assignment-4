mapboxgl.accessToken = 'pk.eyJ1IjoibWtyaWVzYmVyZyIsImEiOiJjbHVsdTVocTgweXhzMmlwMWZoNDk2dDdhIn0.-0g7mENM-vtH3DoHLXaHKg';
    const map = new mapboxgl.Map({
        container: 'map',
        // Pull mapbox style and set center point and zoom
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-71.12556, 42.31758],
        zoom: 10.6
    });
    
        map.on('load', () => {

        console.log('Loaded')
        
        //remove extra labels from mapbox map
        map.removeLayer('settlement-major-label')
        map.removeLayer('settlement-minor-label')
        map.removeLayer('settlement-subdivision-label')
        
        //Add town center point source data
        map.addSource('mass-municipal-town-centroids', {
            type: 'geojson',
            data: "data/mass-municipal-town-centroids.geojson"
        });     
        
        //create variable that filters to rapid transit communities
        var RapidTransitFeatures = massMunicipalBorders.features.filter(function(feature) {
            return feature.properties.Requirement === 'Rapid Transit Community';
        });

        //create variable that filters to non-rapid transit communities
        var nonRapidTransitFeatures = massMunicipalBorders.features.filter(function(feature) {
            return feature.properties.Requirement !== 'Rapid Transit Community';
        });

        //add source for rapid transit communities borders
        map.addSource('rapid-transit-borders', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: RapidTransitFeatures
            }
        });
        

        //add source for non rapid transit communities borders
        map.addSource('non-rapid-transit-borders', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: nonRapidTransitFeatures
            }
        });
        
        //add layer that fills polygons in rapid transit communities 
        map.addLayer({
            'id': 'rapid-transit-borders-fills',
            'type': 'fill',
            'source': "rapid-transit-borders",
            'layout': {},
            'paint': {
                'fill-color': '#627BC1',
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    1,
                    .5
                ]
            }
        });
        
        //add layer that creates border line for rapid transit communities
        map.addLayer({
            'id': 'rapid-transit-borders-line',
            'type': 'line',
            'source': "rapid-transit-borders",
            'layout': {},
            'paint': {
                'line-color': '#000',
                'line-width': {
                    stops: [[8, .5], [10.6, 1], [15,5]]
                }
            }
        });

        //add layer that creates border line for non rapid transit communities
        map.addLayer({
            'id': 'non-rapid-transit-borders-line',
            'type': 'line',
            'source': "non-rapid-transit-borders",
            'layout': {},
            'paint': {
                'line-color': '#000',
                'line-width': {
                    stops: [[8, .5], [10.6, 1], [15,5]]
                }
            }
        });

        //add layer that creates town labels
        map.addLayer({
            id: 'mass-municipal-borders-labels',
            type: 'symbol',
            source: "mass-municipal-town-centroids",
            layout: {
                'text-field': ['get', 'TOWN'],
                'text-font': ['Arial Unicode MS Bold'],
                'text-size': {
                   stops: [[8, 7], [10.6, 9], [15,15]]
                }
            },
            paint: {
                'text-color': '#000'
            }
        });


        let hoveredPolygonId = null;

        // The feature-municipality dependent fill-opacity expression will render the hover effect
        // when a feature's hover municipality is set to true. 
        // list all the layers on the map
        console.log(
            map.getStyle().layers
        )

        // When the user moves their mouse over the municipal-fill layer, we'll update the
        // feature state for the feature under the mouse.
        map.on('mousemove', 'rapid-transit-borders-fills', (e) => {
            if (e.features.length > 0) {
                if (hoveredPolygonId !== null) {
                    map.setFeatureState(
                        { source: "rapid-transit-borders", id: hoveredPolygonId },
                        { hover: false }
                    );
                }
                hoveredPolygonId = e.features[0].id;
                map.setFeatureState(
                    { source: "rapid-transit-borders", id: hoveredPolygonId },
                    { hover: true }
                );
            }
        });

        map.getCanvas().style.cursor = 'pointer'

        // When the mouse leaves the municipal-fill layer, update the feature state of the
        // previously hovered feature.
        map.on('mouseleave', 'rapid-transit-borders-fills', () => {
            if (hoveredPolygonId !== null) {
                map.setFeatureState(
                    { source: "rapid-transit-borders", id: hoveredPolygonId },
                    { hover: false }
                );
            }
            hoveredPolygonId = null;

            map.getCanvas().style.cursor = ''
        });

        map.on('click', 'rapid-transit-borders-fills', (e) => {
            
            const clickedFeature = e.features[0]
            console.log(clickedFeature)
            const townName = clickedFeature.properties.TOWN;
            const status = clickedFeature.properties.Status;
            const zoneCapacity = clickedFeature.properties.ZoneCapacity;
            const planningDept = clickedFeature.properties.DeptLink
            
            $("#compliance-status").text('As of May, 2024, ${townName} is ${status}')
            $("#zone-capacity").text('The new zoning district must have a minimum zoning capacity of ${zoneCapacity} units')
            $("#planning-department").text('To find out more information the new district, visit the planning department website <a href= ${planningDept}>here</a>')
        });
    

    });