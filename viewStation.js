var query = parseQueryString();

if (!query.id) {
    location.replace('index.html');
}

var stationsRef = firebase.database().ref('stations/');

stationsRef.child(query.id).on('value', function(snapshot) {
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

        var table = document.getElementById('chargerTable');
        table.innerHTML = '';
        data.chargerData.forEach(function(charger, id) {
            table.appendChild(getChargerRowNode(charger, id));
        });

        doneLoading();
    }
});

var chargerRef = stationsRef.child(query.id).child('chargerData');

// chargerRef.on('child_changed')

var setChargerStatus = function(status, id) {
    var newState = {
        status: status,
        time: status===0 ? -1 : Date.now()
    };
    chargerRef.child(id).update(newState);
};

var getChargerRowNode = function(charger, id) {
    var tr = document.createElement('tr');

    tr.innerHTML = '<tr>\n' +
        '    <td>' + getChargerName(charger.type) + '</td>\n' +
        '    <td>' + getChargerStatus(charger.status) + '</td>\n' +
        '    <td>' + getChargerTime(charger.status, charger.time) + '</td>\n' +
        '    <td>' + getChargerActionButton(charger.status, id) + '</td>\n' +
        '</tr>\n';
    return tr;
};

var getChargerName = function(type) {
    switch (type) {
        case 'type1':
            return 'Type 1';
        case 'type2':
            return 'Type 2';
        case 'commando':
            return 'Commando';
    }
};

var getChargerStatus = function(status) {
    switch (status) {
        case 0:
            return 'Free';
        case 1:
            return 'Occupied';
    }
};

var getChargerActionButton = function(status, id) {
    switch (status) {
        case 0:
            return '<button type="button" class="btn btn-success btn-xs" onclick="setChargerStatus(1, ' + id + ')">Check in</button>';
        case 1:
            return '<button type="button" class="btn btn-danger btn-xs" onclick="setChargerStatus(0, ' + id + ')">Check out</button>';
    }
};

var getChargerTime = function(status, time) {
    if (status === 0 || time < 0) return '-';
    else return timeSince(time);
};

function timeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}