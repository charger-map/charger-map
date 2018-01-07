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

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

var stationsRef = firebase.database().ref('stations/');
var photoRef = firebase.storage().ref('stations/');

var uid;

var query = parseQueryString();

var edit = typeof query.id !== 'undefined';

var nonstop = false;
$('#customHours').bootstrapToggle();

if (edit) {
    document.getElementById('title').innerHTML = 'Edit station';
    // document.getElementById('nav-title').innerHTML = 'Edit station';
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
            if (data.shortDesc) {
                document.getElementById('stationShortDesc').value = data.shortDesc;
            }
            if (data.amenities) {
                document.getElementById('hasParking').checked = data.amenities.parking;
                document.getElementById('hasHotel').checked = data.amenities.hotel;
                document.getElementById('hasFreeCharge').checked = data.amenities.freeCharge;
                document.getElementById('hasRestaurant').checked = data.amenities.restaurant;
                document.getElementById('hasWifi').checked = data.amenities.wifi;
            }
            if (!data.nonstop) {
                $('#customHours').bootstrapToggle('off');
            } else {
                $('#customHours').bootstrapToggle('on');
            }
            if (data.days) {
                document.getElementById('openMonFrom').value = data.days.mon.f;
                document.getElementById('openMonTo').value = data.days.mon.t;
                document.getElementById('openTueFrom').value = data.days.tue.f;
                document.getElementById('openTueTo').value = data.days.tue.t;
                document.getElementById('openWedFrom').value = data.days.wed.f;
                document.getElementById('openWedTo').value = data.days.wed.t;
                document.getElementById('openThuFrom').value = data.days.thu.f;
                document.getElementById('openThuTo').value = data.days.thu.t;
                document.getElementById('openFriFrom').value = data.days.fri.f;
                document.getElementById('openFriTo').value = data.days.fri.t;
                document.getElementById('openSatFrom').value = data.days.sat.f;
                document.getElementById('openSatTo').value = data.days.sat.t;
                document.getElementById('openSunFrom').value = data.days.sun.f;
                document.getElementById('openSunTo').value = data.days.sun.t;
            }
            try {
                document.getElementById('CHAdeMO-count').value = data.chargers['Quick Charge (CHAdeMO)'].count;
                document.getElementById('CHAdeMO-price').value = data.chargers['Quick Charge (CHAdeMO)'].price;
                document.getElementById('CCS-count').value = data.chargers['Quick Charge (CCS)'].count;
                document.getElementById('CCS-price').value = data.chargers['Quick Charge (CCS)'].price;
                document.getElementById('Supercharger-count').value = data.chargers['Tesla Supercharger'].count;
                document.getElementById('Supercharger-price').value = data.chargers['Tesla Supercharger'].price;
                document.getElementById('Mennekes-count').value = data.chargers['Mennekes (Type 2)'].count;
                document.getElementById('Mennekes-price').value = data.chargers['Mennekes (Type 2)'].price;
                document.getElementById('CEE-red-count').value = data.chargers['CEE red'].count;
                document.getElementById('CEE-red-price').value = data.chargers['CEE red'].price;
                document.getElementById('Schuko-count').value = data.chargers['Schuko (Type 3)'].count;
                document.getElementById('Schuko-price').value = data.chargers['Schuko (Type 3)'].price;
            } catch (e) {
                console.log('Incorrect charger data');
            }
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

var toggleCustomHours = function () {
    nonstop = $('#customHours').prop('checked');
    setHoursEnabled(nonstop);
};

var setHoursEnabled = function (enabled) {
    if (enabled) {
        document.getElementById('openMonFrom').setAttribute('disabled', 'true');
        document.getElementById('openMonTo').setAttribute('disabled', 'true');
        document.getElementById('openTueFrom').setAttribute('disabled', 'true');
        document.getElementById('openTueTo').setAttribute('disabled', 'true');
        document.getElementById('openWedFrom').setAttribute('disabled', 'true');
        document.getElementById('openWedTo').setAttribute('disabled', 'true');
        document.getElementById('openThuFrom').setAttribute('disabled', 'true');
        document.getElementById('openThuTo').setAttribute('disabled', 'true');
        document.getElementById('openFriFrom').setAttribute('disabled', 'true');
        document.getElementById('openFriTo').setAttribute('disabled', 'true');
        document.getElementById('openSatFrom').setAttribute('disabled', 'true');
        document.getElementById('openSatTo').setAttribute('disabled', 'true');
        document.getElementById('openSunFrom').setAttribute('disabled', 'true');
        document.getElementById('openSunTo').setAttribute('disabled', 'true');
    } else {
        document.getElementById('openMonFrom').removeAttribute('disabled');
        document.getElementById('openMonTo').removeAttribute('disabled');
        document.getElementById('openTueFrom').removeAttribute('disabled');
        document.getElementById('openTueTo').removeAttribute('disabled');
        document.getElementById('openWedFrom').removeAttribute('disabled');
        document.getElementById('openWedTo').removeAttribute('disabled');
        document.getElementById('openThuFrom').removeAttribute('disabled');
        document.getElementById('openThuTo').removeAttribute('disabled');
        document.getElementById('openFriFrom').removeAttribute('disabled');
        document.getElementById('openFriTo').removeAttribute('disabled');
        document.getElementById('openSatFrom').removeAttribute('disabled');
        document.getElementById('openSatTo').removeAttribute('disabled');
        document.getElementById('openSunFrom').removeAttribute('disabled');
        document.getElementById('openSunTo').removeAttribute('disabled');
    }
};

var getStationObject = function () {
    return {
        name: document.getElementById('stationName').value,
        loc: document.getElementById('stationLoc').value,
        position: {
            lat: parseFloat(document.getElementById('stationLat').value),
            lng: parseFloat(document.getElementById('stationLng').value)
        },
        desc: document.getElementById('stationDesc').value,
        shortDesc: document.getElementById('stationShortDesc').value,
        nonstop: nonstop,
        days: {
            mon: {
                f: document.getElementById('openMonFrom').value,
                t: document.getElementById('openMonTo').value
            },
            tue: {
                f: document.getElementById('openTueFrom').value,
                t: document.getElementById('openTueTo').value
            },
            wed: {
                f: document.getElementById('openWedFrom').value,
                t: document.getElementById('openWedTo').value
            },
            thu: {
                f: document.getElementById('openThuFrom').value,
                t: document.getElementById('openThuTo').value
            },
            fri: {
                f: document.getElementById('openFriFrom').value,
                t: document.getElementById('openFriTo').value
            },
            sat: {
                f: document.getElementById('openSatFrom').value,
                t: document.getElementById('openSatTo').value
            },
            sun: {
                f: document.getElementById('openSunFrom').value,
                t: document.getElementById('openSunTo').value
            }
        },
        amenities: {
            parking: document.getElementById('hasParking').checked,
            hotel: document.getElementById('hasHotel').checked,
            freeCharge: document.getElementById('hasFreeCharge').checked,
            restaurant: document.getElementById('hasRestaurant').checked,
            wifi: document.getElementById('hasWifi').checked
        }
    };
};

var submitDetails = function () {
	showLoading();
    var station = getStationObject();
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
    var station = getStationObject();
    station.chargers = {
        'Quick Charge (CHAdeMO)': {
            count: document.getElementById('CHAdeMO-count').value,
            price: document.getElementById('CHAdeMO-price').value
        },
        'Quick Charge (CCS)': {
            count: document.getElementById('CCS-count').value,
            price: document.getElementById('CCS-price').value
        },
        'Tesla Supercharger': {
            count: document.getElementById('Supercharger-count').value,
            price: document.getElementById('Supercharger-price').value
        },
        'Mennekes (Type 2)' : {
            count: document.getElementById('Mennekes-count').value,
            price: document.getElementById('Mennekes-price').value
        },
        'CEE red' : {
            count: document.getElementById('CEE-red-count').value,
            price: document.getElementById('CEE-red-price').value
        },
        'Schuko (Type 3)': {
            count: document.getElementById('Schuko-count').value,
            price: document.getElementById('Schuko-price').value
        }
    };
    var chargerData = [];
    for (var type in station.chargers) {
        if (station.chargers.hasOwnProperty(type)) {
            for (var i = 1; i<= station.chargers[type].count; i++) {
                chargerData.push(newChargerData(type, station.chargers[type].price));
            }
        }
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
        station.owner = uid;
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
        location.href = target;
	}
};

var newChargerData = function (type, price) {
    return {type: type, status: 0, time: -1, price: price};
};

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
        location.href = "index.html";
    }
});