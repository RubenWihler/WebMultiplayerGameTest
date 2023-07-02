#!/bin/bash
# Ruben Wihler

echo '[+] Suppression des anciens fichiers ...';
rm -rf dist/*;

echo '[+] Copie de src dans dist ...';
cp -R src/client dist/client;
cp -R src/server dist/server;

echo '[+] Suppression des fichiers inutiles ...';
find dist/ -name "*.ts" -type f -delete;

echo '[+] Compilation des fichiers TypeScript ...';
tsc --build tsconfig.json;

echo '[+] Build termine avec succes.';