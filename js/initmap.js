var globeVars = window.globeVars || {};

markers = [];
const homeIcon = "http://maps.google.com/mapfiles/kml/pal5/icon11.png";

function initMap() {
    if (!sessionStorage.getItem("activeMapID")) {
        window.location.href = 'createmap.html'
    };

    function uuidv4(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuidv4)};

    globeVars.deleteMarker = function (markerID) {
        globeVars.markers.forEach(marker => {
            if (markerID === marker.placeName) {
                marker.toDelete();
            }
        });
    }

    const activeMapID = sessionStorage.getItem("activeMapID");
    var activeMap;
    var map;

    userMaps = JSON.parse(sessionStorage.getItem("maps"));

    const markersToLoad = JSON.parse(sessionStorage.getItem("markers"));

    if (sessionStorage.getItem("newMap") === "true") {
        const homeCoords = JSON.parse(sessionStorage.getItem("homeCoords"));

        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: homeCoords
        });

        homeMarker = new google.maps.Marker({
            position: homeCoords,
            map: map,
            title: "Home",
            icon: {
                url: homeIcon
            }
        });

        markerToAdd = new Marker(homeMarker, "Home", sessionStorage.getItem("homeAddress"), uuidv4(), false);

        markers.push(markerToAdd);
    } else {
        userMaps.forEach(map => {
            if (map.mapid === activeMapID) {
                activeMap = map;

                sessionStorage.setItem("homeAddress", map.mapname);
            }
        });

        map = new google.maps.Map(document.getElementById('map'), {
            zoom: activeMap.zoom,
            center: {
                lat: activeMap.centerlat,
                lng: activeMap.centerlng
            }
        });

        markersToLoad.forEach(element => {
            if (element.mapid === activeMapID) {
                newMarker = new google.maps.Marker({
                    position: {
                        lat: element.placelat,
                        lng: element.placelng
                    },
                    map: map,
                    title: element.placename,
                    icon: {
                        url: element.iconurl
                    }
                });

                markerObj = new Marker(newMarker, element.placetype, element.placename, element.markerid, true);
                markerObj.init();
                markers.push(markerObj);
            }
        });
    }

    globeVars.markers = markers;
    globeVars.maps = map;
}