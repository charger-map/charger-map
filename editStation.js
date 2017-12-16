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

			var reader = new FileReader();
			reader.onload = function (e) {
				document.getElementById('photo-preview').setAttribute('src', e.target.result);
			};
			reader.readAsDataURL(document.getElementById('photo').files[0]);
			
        });
    });

});

var stationsRef = firebase.database().ref('stations/');
var photoRef = firebase.storage().ref('stations/');

var query = parseQueryString();

var edit = typeof query.id !== 'undefined';

if (edit) {
    document.getElementById('title').innerHTML = 'Edit station';
    document.getElementById('nav-title').innerHTML = 'Edit station';
    document.getElementById('submitAdd').style.display = 'none';

    stationsRef.child(query.id).once('value', function(snapshot) {
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

			photoRef.child(query.id).getDownloadURL().then(
				function(url) {
					document.getElementById('photo-preview').src = url;
					doneLoading();
				},
				function() {
					// no picture yet
					doneLoading();
				}
			);
        }
    });
} else {
    document.getElementById('submitDetails').style.display = 'none';
    document.getElementById('submitChargers').style.display = 'none';
    document.getElementById('submitDelete').style.display = 'none';

    if (query.hasOwnProperty('lat')) {
        document.getElementById('stationLat').value = query.lat;
    }

    if (query.hasOwnProperty('lng')) {
        document.getElementById('stationLng').value = query.lng;
    }

    doneLoading();
}

var submitDetails = function () {
	showLoading();
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
        }
    };
    stationsRef.child(query.id).update(station).then(
		function() {
			uploadPhoto('#');
		}, 
		function(err) {
			console.log(err); alert('Error')
		}
	);
};

var submitChargers = function () {
	showLoading();
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
    var chargerData = [];
    for (var i = 1; i <= station.chargers.type1; i++) {
        chargerData.push(newChargerData('type1'));
    }
    for (i = 1; i <= station.chargers.type2; i++) {
        chargerData.push(newChargerData('type2'));
    }
    for (i = 1; i <= station.chargers.commando; i++) {
        chargerData.push(newChargerData('commando'));
    }
    station.chargerData = chargerData;

    if (edit) {
        stationsRef.child(query.id).update({chargers: station.chargers, chargerData: station.chargerData}).then(
			function() {
				doneLoading();
				location.href = '#'
			}, 
			function(err) {
				console.log(err); 
				alert('Error');
			}
		);
    } else {
        var newRef = stationsRef.push();
        newRef.set(station).then(
			function() {
				uploadPhoto('manage.html');
			}, 
			function(err) {
				console.log(err); 
				alert('Error');
			}
		);
    }
};

var confirmedDelete = false;
var submitDelete = function () {
    if (!confirmedDelete) {
        document.getElementById('deleteButton').innerHTML = 'Are you sure?';
        confirmedDelete = true;
    } else {
        stationsRef.child(query.id).remove().then(
            function() {
                location.href = 'manage.html';
            },
            function(err) {
                console.log(err);
                alert('Error');
            }
        );
    }
};

var uploadPhoto = function(target) {
	var files = document.getElementById('photo').files;
	if (files.length > 0) {
		photoRef.child(query.id).put(files[0]).then(
			function() {
				doneLoading();
				location.href = target;
			},
			function(err) {
				console.log(err); alert('Error');
			}
		);
	} else {
		doneLoading();
	}
};

var newChargerData = function (type) {
    return {type: type, status: 0, time: -1};
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
    } else {
        location.href = "index.html";
    }
});