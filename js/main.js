var globeVars = window.globeVars || {};

(function rideScopeWrapper($) {
    var authToken;
    var homeCoords = JSON.parse(sessionStorage.getItem("homeCoords"));

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

    function uuidv4(a) {
        return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuidv4)
    };

    $(function onDocReady() {
        $('#toggle').click(toggleMarkers);

        $('#signout').click(function () {
            sessionStorage.clear();
            globeVars.signOut();
            alert("You have been signed out.");
            window.location = "signin.html";
        });

        $('#submit').click(saveSessionToDB);

        $('#invite').click(inviteUserToMap);
    });

    function inviteUserToMap(){
        emailUser = prompt("Insert email address of user");

        if (emailUser){
            $.ajax({
                method: 'POST',
                url: _config.api.invokeUrl + '/emailuser',
                headers: {
                    Authorization: authToken
                },
                data: JSON.stringify({
                    emailAddress: emailUser,
                    mapid: sessionStorage.getItem("activeMapID")
                }),
                contentType: 'application/json',
                success: function () {
   
                    alert("Email successful");
                },
                error: function ajaxError(jqXHR, textStatus, errorThrown) {
                    console.error('Error: ', textStatus, ', Details: ', errorThrown);
                    console.error('Response: ', jqXHR.responseText);
                }
            });
        }
    }

    function saveSessionToDB() {
        const activeMapID = sessionStorage.getItem("activeMapID");

        var markersToAdd = [];
        var markersToDelete = [];
        var markersToUpdate = [];

        var mapsToAdd = [];
        var mapsToUpdate = [];

        // get details of active markers
        globeVars.markers.forEach(marker => {
            switch (marker.DBAction()) {
                case "ADD":
                    markersToAdd.push(marker.createServerObj(activeMapID));
                    break;
                case "DELETE":
                    markersToDelete.push(marker.createServerObj(activeMapID));
                    break;
                case "UPDATE":
                    markersToUpdate.push(marker.createServerObj(activeMapID));
                    break;
            }
        });

        // get details of active map
        newMap = {
            mapid: sessionStorage.getItem("activeMapID"),
            mapname: sessionStorage.getItem("homeAddress"),
            centerlat: globeVars.maps.getCenter().lat(),
            centerlng: globeVars.maps.getCenter().lng(),
            zoom: globeVars.maps.getZoom(),
        }

        if (sessionStorage.getItem("newMap") === "true") {
            mapsToAdd.push(newMap);
        } else {
            mapsToUpdate.push(newMap);
        }

        const objToServer = {
            markers: {
                add: markersToAdd,
                delete: markersToDelete,
                update: markersToUpdate
            },
            maps: {
                add: mapsToAdd,
                update: mapsToUpdate
            }
        };

        completeSaveToServer(objToServer);
    }

    function completeSaveToServer(obj) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/savetodb',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify(obj),
            contentType: 'application/json',
            success: function () {
                var newMarkerArray = [];
                globeVars.markers.forEach(marker => {
                    if (marker.DBAction() !== "DELETE") {
                        marker.reset();
                        newMarkerArray.push(marker);
                    }
                });

                globeVars.markers = newMarkerArray;
                sessionStorage.setItem("newMap", false);

                alert("Save to database succussful");
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
            }
        });
    }

    function toggleMarkers(event) {
        globeVars.markers.forEach(element => {
            element.markerObj.setVisible(!element.markerObj.getVisible());
        });
    }

    $(document).on('click', '.amenitySearch', function (event) {
        getAmenities(event.target.id);
    })

    function getAmenities(placeType) {
        var request = {
            location: homeCoords,
            radius: '1600',
            type: _config.searchItems[placeType].googleType
        };

        service = new google.maps.places.PlacesService(globeVars.maps);
        service.nearbySearch(request, function completeGetAmenities(data, status) {
            var newMarker;
            itemsToAdd = Math.min(data.length, 8);

            for (i = 0; i < itemsToAdd; i += 1) {
                newMarker = new google.maps.Marker({
                    position: {
                        lat: data[i].geometry.location.lat(),
                        lng: data[i].geometry.location.lng()
                    },
                    map: globeVars.maps,
                    title: data[i].name,
                    icon: {
                        url: _config.searchItems[placeType].iconURL
                    }
                });

                markerObj = new Marker(newMarker, placeType, data[i].name, uuidv4(), false);

                globeVars.markers.push(markerObj);
            }
        });
    }
}(jQuery));