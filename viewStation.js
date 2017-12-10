var query = parseQueryString();

if (!query.id) {
    location.replace('index.html');
}

var stationsRef = firebase.database().ref('stations/');

stationsRef.child(query.id).once('value', function(snapshot) {
    var data = snapshot.val();
    if (!data) {
        alert('Error');
    } else {
        document.getElementById('stationName').innerHTML = data.name;
        document.getElementById('stationLoc').innerHTML = data.loc;
        document.getElementById('stationDesc').innerHTML = data.desc;
        document.getElementById('openMon').innerHTML = data.days.mon;
        document.getElementById('openTue').innerHTML = data.days.tue;
        document.getElementById('openWed').innerHTML = data.days.wed;
        document.getElementById('openThu').innerHTML = data.days.thu;
        document.getElementById('openFri').innerHTML = data.days.fri;
        document.getElementById('openSat').innerHTML = data.days.sat;
        document.getElementById('openSun').innerHTML = data.days.sun;

        doneLoading();
    }
});