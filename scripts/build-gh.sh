set -e
npm run lint
rm -rf demo
cp -r scripts/demo .
npm run build
cp -r lib demo
cd demo
git init
git config user.name Gerald
git config user.email gera2ld@163.com
git add .
git commit -m 'Auto deploy to github-pages'
git push -f git@github.com:gera2ld/qrcanvas.git master:gh-pages
