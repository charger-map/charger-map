var stationsRef = firebase.database().ref('stations/');

var markers = {};
var tooltips = [];

var map;

function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 2,
        center: {lat: 0, lng: 0}
    });

    var addStationTooltip = new google.maps.InfoWindow({});
    tooltips.push(addStationTooltip);

    map.addListener('click', function (event) {
        tooltips.forEach(function (tt) {tt.close()});
        if (document.getElementById('addingMode').checked) {
            addStationTooltip.setPosition(event.latLng);
            var lat = event.latLng.lat();
            var lng = event.latLng.lng();
            addStationTooltip.setContent(getAddTooltipString(lat, lng));
            addStationTooltip.open(map);
        }
    });
}

// stationsRef.on('child_added', function (data) {
//     addMarker(data.key, data.val());
// });
//
// stationsRef.on('child_changed', function (data) {
//     updateMarker(data.key, data.val());
// });
//
// stationsRef.on('child_removed', function (data) {
//     deleteMarker(data.key);
// });

var addMarker = function(id, station) {
    var marker = new google.maps.Marker({
        position: station.position,
        map: map,
        icon: getStationMarkerIcon(station)
    });
    var infowindow = new google.maps.InfoWindow({
        content: getDetailTooltipString(station, id)
    });
    tooltips.push(infowindow);
    marker.cmTooltip = infowindow;
    marker.addListener('click', function() {
        tooltips.forEach(function (tt) {tt.close()});
        infowindow.open(map, marker);
    });
    markers[id] = marker;
};

// var deleteMarker = function (id) {
//     markers[id].map = null;
//     delete markers[id];
// };
//
// var updateMarker = function (id, station) {
//     addMarker(id, station);
// };

var getStationOccupied = function(station) {
    const free = station.chargerData.reduce(function (a, v) {
        return v.status == 1 ? a : a + 1;
    }, 0);
    const total = station.chargerData.length;
    return {
        free: free,
        tot: total,
        rate: free / total
    };
};

var getStationMarkerIcon = function(station) {
    const rate = getStationOccupied(station).rate;
    if (rate == 0) return 'marker-red.png';
    else if (rate <= 0.5) return 'marker-yellow.png';
    else return 'marker-green.png';
};

var centerOn = function(id) {
    var marker = markers[id];
    map.panTo(marker.position);
    tooltips.forEach(function (tt) {tt.close()});
    marker.cmTooltip.open(map, marker);
};

var getDetailTooltipString = function(station, id) {
    return '<div style="">' +
        '<h3>' + station.name + ' <small>' + station.loc + '</small></h3>' +
        '<p>' + station.shortDesc + '</p>' +
        '<p class="pull-right">' +
        '<a class="btn btn-primary btn-xs" href="editStation.html?id=' + id +'">Edit</a> ' +
        '</p></div>'
};

var getAddTooltipString = function(lat, lng) {
    return '<p>Latitude: ' + lat + '<br>' +
        'Longitude: ' + lng + '</p>' +
    '<a href="editStation.html?lat=' + lat + '&lng=' + lng + '" class="btn btn-success btn-xs pull-right">Add station</a>'
};

var getStationListRow = function(id, station) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td class="col-xs-10">' + station.name + '<br><small>' + station.loc + '</small></td>' +
        '<td class="col-xs-1">' +
        '<a class="btn btn-default btn-sm" href="editStation.html?id=' + id +'""><span class="glyphicon glyphicon-pencil"></span></a>' +
        '</td><td class="col-xs-1">' +
        '<button type="button" class="btn btn-default btn-sm" onclick="centerOn(\'' + id + '\')"><span class="glyphicon glyphicon-screenshot"></span></button>' +
        '</td>';
    return tr;
};

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        document.getElementById('loginButton').style.display = 'none';
        document.getElementById('logoutButton').style.display = 'inline-block';
        document.getElementById('user').style.display = 'inline';
        document.getElementById('user').innerHTML = user.email;
        firebase.database().ref('users/').child(user.uid).once('value', function(snapshot) {
            var data = snapshot.val();
            if (data.owner) {
                var ctrls =  document.getElementsByClassName('ownerControls');
                for (var i = 0; i < ctrls.length; i++) {
                    ctrls[i].classList.remove('hide');
                }
            }
        });

        stationsRef.orderByChild("owner").equalTo(user.uid).once('value', function(snapshot) {
            markers = {};
            var bounds = new google.maps.LatLngBounds();
            snapshot.forEach(function(child) {
                var station = child.val();
                addMarker(child.key, station, map);
                bounds.extend(station.position);
                document.getElementById('stationList').appendChild(getStationListRow(child.key, station));
            });
            map.fitBounds(bounds);
        });

    } else {
        location.href = "index.html";
    }
});

var toggleAddingTooltip = function() {
    if (document.getElementById('addingMode').checked) {
        document.getElementById('addingTooltip').classList.remove('hide');
    } else {
        document.getElementById('addingTooltip').classList.add('hide');
    }
};