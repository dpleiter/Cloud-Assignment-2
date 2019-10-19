var globeVars = window.globeVars || {};

(function rideScopeWrapper($) {
    var authToken;
    const geocodeAPI = "https://maps.googleapis.com/maps/api/geocode/json?";
    const apiKey = "[REMOVED]";

    var userMaps;
    var userMarkers;

    function uuidv4(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuidv4)};

    globeVars.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = 'signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = 'signin.html';
    });

    $(function onDocReady() {
        displayMapsList();
		 $('#signout').click(function () {
            sessionStorage.clear();
            globeVars.signOut();
            alert("You have been signed out.");
            window.location = "signin.html";
        });

        google.maps.event.addListener(globeVars.createMap, 'click', function (event) {
            lat = event.latLng.lat();
            lng = event.latLng.lng();

            getAddressFromClick(lat, lng);
			
        })

        $('#request').click(handleAdressSearch);
    });

    function displayMapsList() {
        // Display all maps owned by current user
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/getmaps',
            headers: {
                Authorization: authToken
            },
            contentType: 'application/json',
            success: completeGetMaps,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                alert("Error in displaying maps");
                console.error('Error: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
            }
        });
    }

    function getMarkers() {
        // returns all markers for a given user
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/getmarkers',
            headers: {
                Authorization: authToken
            },
            contentType: 'application/json',
            success: completeGetMarkers,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                alert("Error in retrieving markers");
                console.error('Error: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
            }
        });
    }

    function completeGetMaps(result) {
        if (result.length) {
            sessionStorage.setItem("maps", JSON.stringify(result));
            userMaps = result;

            result.forEach(element => {
                var txt1 = `<li><span id='${element.mapid}', class="mapFromDB">${element.mapname}</span></li>`;
                $("#test").append(txt1);
            });

            getMarkers();
        }
    }

    function completeGetMarkers(result) {
        if (result.length) {
            sessionStorage.setItem("markers", JSON.stringify(result));
            userMarkers = result;
        }
    }

    function getAddressFromClick(lat, lng) {
        params = {
            key: apiKey,
            latlng: lat.toString() + "," + lng.toString()
        };

        url = geocodeAPI + $.param(params);

        $.get(url, function (data, status) {
            if (status === "success") {
                if (confirm("Continue with this address? \n" + data.results[0].formatted_address)) {
                    sessionStorage.setItem("activeMapID", uuidv4());
                    sessionStorage.setItem("homeAddress", data.results[0].formatted_address);
                    sessionStorage.setItem("homeCoords", JSON.stringify(data.results[0].geometry.location));
                    sessionStorage.setItem("newMap", true);

                    window.location.href = "main.html";
                };
            } else {
                alert("Error finding address");
            }
        });
    }

    function handleAdressSearch(event) {
        var addressToSearch = $('#address').val();

        var params = {
            key: apiKey,
            address: addressToSearch
        };

        url = geocodeAPI + $.param(params);

        $.get(url, handleGeocode);
    }

    function handleGeocode(data, status) {
        if (status === "success") {
            if (confirm("Continue with this address? \n" + data.results[0].formatted_address)) {
                sessionStorage.setItem("activeMapID", uuidv4());
                sessionStorage.setItem("newMap", true);
                sessionStorage.setItem("homeAddress", data.results[0].formatted_address);
                sessionStorage.setItem("homeCoords", JSON.stringify(data.results[0].geometry.location));

                window.location.href = "main.html";
            }
        } else {
            alert("Unexpected error. Please try again.");
        }
    }

    $(document).on('click', '.mapFromDB', function (event) {
        sessionStorage.setItem("activeMapID", event.currentTarget.id);

        userMaps.forEach(map => {
            if (map.mapid === event.currentTarget.id) {
                sessionStorage.setItem("activeMapCenter", JSON.stringify({
                    lat: map.centerlat,
                    lng: map.centerlng
                }))
            }
        });

        userMarkers.forEach(marker => {
            if (marker.mapid === event.currentTarget.id && marker.placetype === "Home") {
                sessionStorage.setItem("homeCoords", JSON.stringify({
                    lat: marker.placelat,
                    lng: marker.placelng
                }))
            }
        })

        sessionStorage.setItem("newMap", false);

        window.location.href = "main.html";
    })
}(jQuery));