npm run build;
chmod -R 777 build;
rm -rf ./static;
yes | cp -rf build/* ./;
chmod -R 777 ./static;
