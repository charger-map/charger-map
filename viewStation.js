var query = parseQueryString();

if (!query.id) {
    location.replace('index.html');
}

var stationsRef = firebase.database().ref('stations/');
var photoRef = firebase.storage().ref('stations/');

var timeFields = [];

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

        timeFields = document.getElementsByName('chargeTime');

		photoRef.child(query.id).getDownloadURL().then(
			function(url) {
				document.getElementById('station-photo').src = url;
				doneLoading();
			},
			function(err) {
				doneLoading();
			}
		);
    }
});

var chargerRef = stationsRef.child(query.id).child('chargerData');

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
        '    <td class="col-xs-4">' + getChargerName(charger.type) + '</td>\n' +
        '    <td class="col-xs-3">' + getChargerStatus(charger.status) + '</td>\n' +
        '    <td class="col-xs-3" name="chargeTime" data-time="' + charger.time + '">' + getChargerTime(charger.status, charger.time) + '</td>\n' +
        '    <td class="col-xs-2">' + getChargerActionButton(charger.status, id) + '</td>\n' +
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

var timeSince = function(date) {
    if (typeof date !== 'object') {
        date = new Date(date);
    }

    var seconds = Math.floor((new Date() - date) / 1000);
    var intervalType;

    var interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        intervalType = 'year';
    } else {
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            intervalType = 'month';
        } else {
            interval = Math.floor(seconds / 86400);
            if (interval >= 1) {
                intervalType = 'day';
            } else {
                interval = Math.floor(seconds / 3600);
                if (interval >= 1) {
                    intervalType = "hour";
                } else {
                    interval = Math.floor(seconds / 60);
                    if (interval >= 1) {
                        intervalType = "minute";
                    } else {
                        interval = seconds;
                        intervalType = "second";
                    }
                }
            }
        }
    }

    if (interval > 1 || interval === 0) {
        intervalType += 's';
    }

    return interval + ' ' + intervalType;
};

var updateTime = function() {
    timeFields.forEach(function(tf) {
        var time = tf.getAttribute('data-time');
        if (time > 0) tf.innerHTML = timeSince(parseInt(time));
    });
};
setInterval(updateTime, 1000);