$(function() {

    // We can attach the `fileselect` event to all file inputs on the page
    $(document).on('change', ':file', function() {
        var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);
    });

    // We can watch for our custom `fileselect` event like this
    $(document).ready( function() {
        $(':file').on('fileselect', function(event, numFiles, label) {

            var input = $(this).parents('.input-group').find(':text'),
                log = numFiles > 1 ? numFiles + ' files selected' : label;

            if( input.length ) {
                input.val(log);
            } else {
                if( log ) alert(log);
            }

        });
    });

});

var stationsRef = firebase.database().ref('stations/');

var query = parseQueryString();

var edit = typeof query.id !== 'undefined';

if (edit) {
    document.getElementById('title').innerHTML = 'Edit station';
    document.getElementById('submitButton').innerHTML = 'Update station';

    stationsRef.child(query.id).once('value', function (snapshot) {
        var data = snapshot.val();
        if (!data) {
            alert('Error');
        } else {
            document.getElementById('stationName').value = data.name;
            document.getElementById('stationLoc').value = data.loc;
            document.getElementById('stationLat').value = data.position.lat;
            document.getElementById('stationLng').value = data.position.lng;
            document.getElementById('stationDesc').value = data.desc;
            document.getElementById('openMon').value = data.days.mon;
            document.getElementById('openTue').value = data.days.tue;
            document.getElementById('openWed').value = data.days.wed;
            document.getElementById('openThu').value = data.days.thu;
            document.getElementById('openFri').value = data.days.fri;
            document.getElementById('openSat').value = data.days.sat;
            document.getElementById('openSun').value = data.days.sun;
            document.getElementById('charger1count').value = data.chargers.type1;
            document.getElementById('charger2count').value = data.chargers.type2;
            document.getElementById('charger3count').value = data.chargers.commando;
        }
    });
} else {
    if (query.hasOwnProperty('lat')) {
        document.getElementById('stationLat').value = query.lat;
    }

    if (query.hasOwnProperty('lng')) {
        document.getElementById('stationLng').value = query.lng;
    }
}

var submitForm = function () {
    var station = {
        name: document.getElementById('stationName').value,
        loc: document.getElementById('stationLoc').value,
        position: {
            lat: parseFloat(document.getElementById('stationLat').value),
            lng: parseFloat(document.getElementById('stationLng').value)
        },
        desc: document.getElementById('stationDesc').value,
        days: {
            mon: document.getElementById('openMon').value,
            tue: document.getElementById('openTue').value,
            wed: document.getElementById('openWed').value,
            thu: document.getElementById('openThu').value,
            fri: document.getElementById('openFri').value,
            sat: document.getElementById('openSat').value,
            sun: document.getElementById('openSun').value
        },
        chargers: {
            type1: document.getElementById('charger1count').value,
            type2: document.getElementById('charger2count').value,
            commando: document.getElementById('charger3count').value
        }
    };

    if (edit) {
        stationsRef.child(query.id).update(station).then(function() {location.href = 'index.html'}, function (err) {console.log(err); alert('Error')});
    } else {
        var newRef = stationsRef.push();
        newRef.set(station).then(function() {location.href = 'index.html'}, function (err) {console.log(err); alert('Error')});
    }
};