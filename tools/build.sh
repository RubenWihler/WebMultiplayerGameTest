#!/bin/bash
# Ruben Wihler

echo '[+] Suppression des anciens fichiers ...';
rm -rf dist/*;

echo '[+] Copie de src dans dist ...';
cp -R src/client dist/client;
cp -R src/server dist/server;

echo '[+] Copie des fichiers de configuration ...';
cp .env dist/.env;

echo '[+] Suppression des fichiers inutiles ...';
find dist/ -name "*.ts" -type f -delete;

echo '[+] Compilation des fichiers TypeScript ...';
tsc --build tsconfig.json;

echo '[+] Suppression des libs inutiles ...';
sed -i '1d' dist/client/scripts/classes/game/engine/textures.js;
sed -i '1d' dist/client/scripts/classes/game/engine/components/sprite.js;
sed -i '1d' dist/client/scripts/classes/game/engine/game.js;
sed -i '1d' dist/client/scripts/classes/game/engine/game_manager.js;

echo '[+] Build termine avec succes.';