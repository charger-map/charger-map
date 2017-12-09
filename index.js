function initMap() {
    var uluru = {lat: -25.363, lng: 131.044};

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: uluru
    });

    var marker = new google.maps.Marker({
        position: uluru,
        map: map
    });

    var sampleStation = {
        name: 'Powerpark',
        loc: 'Uluru',
        desc: 'The best charging station in 100 miles!'
    }

    var getTooltipString = function(station) {
        return '<h3>' + station.name + ' <small>' + station.loc + '</small></h3>' +
            '<p>' + station.desc + '</p>' +
            '<p>Available chargers 2/5</p>' +
            '<a class="btn btn-primary btn-xs pull-right" href="viewStation.html">Details</a>'
    }

    var infowindow = new google.maps.InfoWindow({
       content: getTooltipString(sampleStation)
    });

    marker.addListener('click', function() {
        // window.location.href="viewStation.html";
        infowindow.open(map, marker);
    });
}