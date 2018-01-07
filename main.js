// Initialize Firebase
var config = {
    apiKey: "AIzaSyCd-jfTz2dg-aAKVbb77aw4r9OxljS1aIE",
    authDomain: "charger-map.firebaseapp.com",
    databaseURL: "https://charger-map.firebaseio.com",
    projectId: "charger-map",
    storageBucket: "charger-map.appspot.com",
    messagingSenderId: "608629697238"
};
firebase.initializeApp(config);

var parseQueryString = function() {

    var str = window.location.search;
    var objURL = {};

    str.replace(
        new RegExp( "([^?=&]+)(=([^&]*))?", "g" ),
        function( $0, $1, $2, $3 ){
            objURL[ $1 ] = $3;
        }
    );
    return objURL;
};

var doneLoading = function () {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('content').removeAttribute('hidden');
};

var showLoading = function () {
    document.getElementById('loader').style.display = 'block';
    document.getElementById('content').setAttribute('hidden', true);
};

var logout = function () {
    firebase.auth().signOut().then(
        function() {
            location.href = 'index.html';
        }
    );
};

// init footer (on all pages)
document.getElementsByTagName('footer')[0].innerHTML='Copyright &copy; Charger Map 2017-2018';
