const pngToIco = require('png-to-ico').default || require('png-to-ico');
const fs = require('fs');

pngToIco([
  'src-tauri/icons/32x32.png',
  'src-tauri/icons/128x128.png',
  'src-tauri/icons/128x128@2x.png'
]).then(buf => {
  fs.writeFileSync('src-tauri/icons/app.ico', buf);
  console.log('Created app.ico');
});
