var stationsRef = firebase.database().ref('stations/');

var markers = {};
var tooltips = [];

var map;

function initMap() {
    var uluru = {lat: -25.363, lng: 131.044};

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: uluru
    });

    var addStationTooltip = new google.maps.InfoWindow({});
    tooltips.push(addStationTooltip);

    map.addListener('click', function (event) {
        tooltips.forEach(function (tt) {tt.close()});
        addStationTooltip.setPosition(event.latLng);
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        addStationTooltip.setContent(getAddTooltipString(lat, lng));
        addStationTooltip.open(map);
    });

    stationsRef.once('value', function(snapshot) {
        markers = {};
        snapshot.forEach(function(child) {
            addMarker(child.key, child.val(), map);
        });
    });
}

stationsRef.on('child_added', function (data) {
    addMarker(data.key, data.val());
});

stationsRef.on('child_changed', function (data) {
    updateMarker(data.key, data.val());
});

stationsRef.on('child_removed', function (data) {
    deleteMarker(data.key);
});

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

var deleteMarker = function (id) {
    markers[id].map = null;
    delete markers[id];
};

var updateMarker = function (id, station) {
    addMarker(id, station);
};

var getDetailTooltipString = function(station, id) {
    return '<h3>' + station.name + ' <small>' + station.loc + '</small></h3>' +
        '<p>' + station.desc + '</p>' +
        '<p class="pull-right">' +
        '<a class="btn btn-warning btn-xs" href="editStation.html?id=' + id +'">Edit</a> ' +
        '<a class="btn btn-primary btn-xs" href="viewStation.html?id=' + id +'">Details</a>' +
        '</p>'
};

var getAddTooltipString = function(lat, lng) {
    return '<p>Latitude: ' + lat + '<br>' +
        'Longitude: ' + lng + '</p>' +
    '<a href="editStation.html?lat=' + lat + '&lng=' + lng + '" class="btn btn-success btn-xs pull-right">Add station</a>'
};
