#!/bin/bash
# Ruben Wihler

echo '[+] Build en cours ...';
echo '';
./tools/build.sh

echo '';
echo '[+] Lancement du serveur ...';
echo '';

node dist/server/server.js;