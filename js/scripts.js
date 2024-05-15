mapboxgl.accessToken = 'pk.eyJ1IjoibWtyaWVzYmVyZyIsImEiOiJjbHVsdTVocTgweXhzMmlwMWZoNDk2dDdhIn0.-0g7mENM-vtH3DoHLXaHKg';

var CenterStart = [-71.12556, 42.31758]; // Replace with your initial longitude and latitude
var ZoomStart = 10.6; // Replace with your initial zoom level    

const map = new mapboxgl.Map({
        container: 'map',
        // Pull mapbox style and set center point and zoom
        style: 'mapbox://styles/mapbox/streets-v12',
        center: CenterStart,
        zoom: ZoomStart
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
                'fill-opacity': .75
            }
        });
        
        //add layer that creates border line for non rapid transit communities
        map.addLayer({
            'id': 'non-rapid-transit-borders-line',
            'type': 'line',
            'source': "non-rapid-transit-borders",
            'layout': {},
            'paint': {
                'line-color': '#707070',
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
                   stops: [[8, 7], [10.6, 8.5], [11.5,14], [12.3,15]]
                }
            },
            paint: {
                'text-color': '#000'
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

        map.on('click', 'rapid-transit-borders-fills', (e) => {
            
            const clickedFeature = e.features[0]
            console.log(clickedFeature)
            const townName = clickedFeature.properties.TOWN;
            const status = clickedFeature.properties.Status;
            const zoneCapacity = clickedFeature.properties.ZoneCapacity;
            const planningDept = clickedFeature.properties.DeptLink
            
            $("#compliance-status").html(`As of May, 2024, ${townName} is <strong>${status}`)
            $("#zone-capacity").html(`The new zoning district must have a minimum zoning capacity of <strong>${zoneCapacity} units`)
            $("#planning-department").html(`To learn more about the new district, visit the planning department website <strong><a href="${planningDept}" target="_blank">here</a>`)
        });

        //added fly to feature
        map.on('click', 'mass-municipal-borders-labels', (e) => {
            
            map.flyTo({
                center: e.features[0].geometry.coordinates,
                zoom: 12.3 
            });

        //change to pointer when on the town name
        map.on('mouseenter', 'mass-municipal-borders-labels', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'mass-municipal-borders-labels', () => {
            map.getCanvas().style.cursor = '';
        });

        document.querySelector('.reset-button').addEventListener('click', function() {
            map.flyTo({
                center: CenterStart,
                zoom: ZoomStart,
                essential: true // this animation is considered essential with respect to prefers-reduced-motion
            });

            // Clear the text in the law-requirement sidebar
            document.getElementById('compliance-status').innerHTML = '';
            document.getElementById('zone-capacity').innerHTML = '';
            document.getElementById('planning-department').innerHTML = '';

    })})});