var globeVars = window.globeVars || {};

function initSearch() {
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('address'), {
        bounds: {
            east: 145.5,
            west: 144.5,
            north: -37.5,
            south: -38.1
        }
    });

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: -37.8136,
            lng: 144.9631
        },
        zoom: 9
    });

    globeVars.createMap = map;
}