var query = parseQueryString();

var loginEP = function(email, pass) {
    firebase.auth().signInWithEmailAndPassword(email, pass).catch(function() {
        document.getElementById('badlogin').removeAttribute('hidden');
    })
};

var login = function() {
    var email = document.getElementById('email').value;
    var pass = document.getElementById('password').value;

    loginEP(email, pass);
};

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        if (query.target) {
            var targetQuery = '';
            var first = true;
            for (var key in query) {
                if (!query.hasOwnProperty(key) || key === 'target') continue;
                if (first) targetQuery += '?';
                else targetQuery += '&';
                targetQuery += key + '=' + query[key];
            }
            location.href = query.target + targetQuery;
        } else {
            location.href = 'index.html';
        }
    }
});