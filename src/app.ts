// Ceci est le fichier principal de l'application. Il permet de lancer le serveur.
// Importation des modules
var express = require('express');
// Création du serveur
var app = express();
var serv = require('http').Server(app);
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));
serv.listen(2000);
