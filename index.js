var stationsRef = firebase.database().ref('stations/');

var markers = {};
var tooltips = [];

var map;

function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 2,
        center: {lat: 0, lng: 0}
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(initialLocation);
            map.setZoom(10);
        });
    }

    map.addListener('click', function () {
        tooltips.forEach(function (tt) {tt.close()});
    });

    stationsRef.once('value', function(snapshot) {
        markers = {};
        snapshot.forEach(function(child) {
            var station = child.val();
            if (!station.deleted) addMarker(child.key, station, map);
        });
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
        map: map
    });
    var infowindow = new google.maps.InfoWindow({
        content: getDetailTooltipString(station, id)
    });
    tooltips.push(infowindow);
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

var getDetailTooltipString = function(station, id) {
    return '<div style="">' +
        '<h3>' + station.name + ' <small>' + station.loc + '</small></h3>' +
        '<p>' + station.desc + '</p>' +
        '<p class="pull-right">' +
        '<a class="btn btn-primary btn-xs" href="viewStation.html?id=' + id +'">Details</a>' +
        '</p></div>'
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
                document.getElementById('ownerControls').style.display = 'inline';
            }
        });
    } else {
        document.getElementById('loginButton').style.display = 'inline-block';
        document.getElementById('logoutButton').style.display = 'none';
        document.getElementById('user').style.display = 'none';
        document.getElementById('ownerControls').style.display = 'none';
    }
});
