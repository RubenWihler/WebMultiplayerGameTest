#!/bin/bash
# Ruben Wihler

echo '[+] Suppression des anciens fichiers';
rm -rf dist/*;

echo '[+] Copie de src dans dist';
cp -R src/client dist/client;
cp -R src/server dist/server;

echo '[+] Suppression des fichiers inutiles'
find dist/ -name "*.ts" -type f -delete;

tsc --build tsconfig.json

echo '[+] OK'