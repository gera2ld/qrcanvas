set -e
npm run lint
NODE_ENV=production ./node_modules/.bin/gulp
cd dist
git init
git add .
git commit -m 'Auto deploy to github-pages'
git push -f git@github.com:gera2ld/qrcanvas.git master:gh-pages
