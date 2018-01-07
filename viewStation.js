var query = parseQueryString();

if (!query.id) {
    location.replace('index.html');
}

document.getElementById('loginButton').setAttribute('href', 'login.html?target=viewStation.html&id='+query.id);

var stationsRef = firebase.database().ref('stations/');
var photoRef = firebase.storage().ref('stations/');

var timeFields = [];

var uid;

stationsRef.child(query.id).on('value', function(snapshot) {
    var data = snapshot.val();
    if (!data) {
        alert('Error');
    } else {
        document.getElementById('stationName').innerHTML = data.name;
        document.getElementById('stationLoc').innerHTML = data.loc;
        document.getElementById('stationDesc').innerHTML = data.desc;
        showAmenityLabels(data.amenities);
        var state = setOpenText(data);
        if (data.nonstop) {
            document.getElementById('openMon').innerHTML = 'Nonstop';
            document.getElementById('openTue').innerHTML = 'Nonstop';
            document.getElementById('openWed').innerHTML = 'Nonstop';
            document.getElementById('openThu').innerHTML = 'Nonstop';
            document.getElementById('openFri').innerHTML = 'Nonstop';
            document.getElementById('openSat').innerHTML = 'Nonstop';
            document.getElementById('openSun').innerHTML = 'Nonstop';
        } else {
            document.getElementById('openMon').innerHTML = data.days.mon.f + ' - ' + data.days.mon.t;
            document.getElementById('openTue').innerHTML = data.days.tue.f + ' - ' + data.days.tue.t;
            document.getElementById('openWed').innerHTML = data.days.wed.f + ' - ' + data.days.wed.t;
            document.getElementById('openThu').innerHTML = data.days.thu.f + ' - ' + data.days.thu.t;
            document.getElementById('openFri').innerHTML = data.days.fri.f + ' - ' + data.days.fri.t;
            document.getElementById('openSat').innerHTML = data.days.sat.f + ' - ' + data.days.sat.t;
            document.getElementById('openSun').innerHTML = data.days.sun.f + ' - ' + data.days.sun.t;
        }

        var table = document.getElementById('chargerTable');
        table.innerHTML = '';
        data.chargerData.forEach(function(charger, id) {
            table.appendChild(getChargerRowNode(charger, id, state));
        });

        timeFields = document.getElementsByClassName('chargeTime');

		photoRef.child(query.id).getDownloadURL().then(
			function(url) {
				document.getElementById('station-photo').src = url;
				doneLoading();
			},
			function() {
				doneLoading();
			}
		);
    }
});

var chargerRef = stationsRef.child(query.id).child('chargerData');

var setChargerStatus = function(status, id) {
    var newState = {
        status: status,
        time: status===0 ? -1 : Date.now(),
        user: status===0 ? null : uid
    };
    chargerRef.child(id).update(newState);
};

var getChargerRowNode = function(charger, id, stationState) {
    var tr = document.createElement('div');

    tr.innerHTML = '<div class="row">' +
        '<div class="col-xs-12"><h4>' + charger.type + '</h4></div>' +
        '<div class="col-xs-6 col-md-4">Price: ' + charger.price + '</div>' +
        '<div class="col-xs-6 col-md-4">' + getChargerStatus(charger.status) + '' +
        '<span class="chargeTime" data-time="' + charger.time + '">' + getChargerTime(charger.status, charger.time) + '</span></div>' +
        '<div class="col-xs-12 col-md-4 text-right charger-table-btn-holder">' + getChargerActionButton(charger.status, charger.user, id, stationState) + '</div>' +
        '</div>';
    tr.classList.add('charger-table');
    return tr;
};

var getChargerStatus = function(status) {
    switch (status) {
        case 0:
            return 'Free';
        case 1:
            return 'Occupied';
    }
};

var getChargerActionButton = function(status, user, id, stationState) {
    if (!uid) return '';
    switch (status) {
        case 0:
            var disabledOnClosed = stationState === 2 ? ' disabled' : '';
            return '<button type="button" class="btn btn-success hidden-xs hidden-sm" onclick="setChargerStatus(1, ' + id + ')"' + disabledOnClosed + '>Check in</button>' +
                '<button type="button" class="btn btn-success btn-block hidden-md hidden-lg" onclick="setChargerStatus(1, ' + id + ')"' + disabledOnClosed + '>Check in</button>';
        case 1:
            if (user === uid) {
                return '<button type="button" class="btn btn-danger hidden-xs hidden-sm" onclick="setChargerStatus(0, ' + id + ')">Check out</button>' +
                    '<button type="button" class="btn btn-danger btn-block hidden-md hidden-lg" onclick="setChargerStatus(0, ' + id + ')">Check out</button>';
            } else {
                return ''
            }
    }
};

var getChargerTime = function(status, time) {
    if (status === 0 || time < 0) return '';
    else return ' (' + timeSince(time) + ')';
};

var showAmenityLabels = function (amenities) {
    if (amenities) {
        if (amenities.parking) document.getElementById('hasParking').classList.remove('hidden');
        if (amenities.hotel) document.getElementById('hasHotel').classList.remove('hidden');
        if (amenities.freeCharge) document.getElementById('hasFreeCharge').classList.remove('hidden');
        if (amenities.restaurant) document.getElementById('hasRestaurant').classList.remove('hidden');
        if (amenities.wifi) document.getElementById('hasWifi').classList.remove('hidden');
    }
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
                    intervalType = 'h';
                } else {
                    interval = Math.floor(seconds / 60);
                    if (interval >= 1) {
                        intervalType = 'm';
                    } else {
                        interval = seconds;
                        intervalType = 's';
                    }
                }
            }
        }
    }

    if ((interval > 1 || interval === 0) && intervalType.length > 1) {
        intervalType += 's';
    }

    return interval + ' ' + intervalType;
};

var getTodayOpenHours = function (days) {
    var d = new Date();
    switch (d.getDay()) {
        case 1:
            return days.mon;
        case 2:
            return days.tue;
        case 3:
            return days.wed;
        case 4:
            return days.thu;
        case 5:
            return days.fri;
        case 6:
            return days.sat;
        case 0:
            return days.sun;
    }
};

var setOpenText = function (station) {
    var ele = document.getElementById('openNonStop');

    if (station.nonstop) {
        ele.innerHTML = 'Open nonstop';
        ele.classList.add('label-success');
        return 0;
    } else {
        var today = getTodayOpenHours(station.days);
        var f = new Date(); f.setHours(today.f.split(':')[0]); f.setMinutes(today.f.split(':')[1]);
        var t = new Date(); t.setHours(today.t.split(':')[0]); t.setMinutes(today.t.split(':')[1]);
        var now = new Date();

        if (now < f) {
            var min = f.getMinutes();
            ele.innerHTML = 'Opens at ' + f.getHours() + ':' + (min < 10 ? min + '0' : min);
            ele.classList.add('label-warning');
            return 1;
        } else if (now < t) {
            var min = t.getMinutes();
            ele.innerHTML = 'Open until ' + t.getHours() + ':' + (min < 10 ? min + '0' : min);
            ele.classList.add('label-success');
            return 0;
        } else {
            ele.innerHTML = 'Closed';
            ele.classList.add('label-danger');
            return 2;
        }
    }
};

var updateTime = function() {
    for (var i = 0; i < timeFields.length; i++) {
        var tf = timeFields.item(i);
        var time = tf.getAttribute('data-time');
        if (time > 0) tf.innerHTML = getChargerTime(-1, parseInt(time));
    }
};
setInterval(updateTime, 1000);

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        uid = user.uid;
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
    } else {
        document.getElementById('loginButton').style.display = 'inline-block';
        document.getElementById('logoutButton').style.display = 'none';
        document.getElementById('user').style.display = 'none';
        document.getElementById('ownerControls').style.display = 'none';
        // location.href = "#";
    }
});