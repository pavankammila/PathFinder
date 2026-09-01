const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('public/logo-full.png')
  .pipe(new PNG())
  .on('parsed', function() {
    let hasColor = false;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let idx = (this.width * y + x) << 2;
        let r = this.data[idx];
        let g = this.data[idx+1];
        let b = this.data[idx+2];
        let a = this.data[idx+3];
        if (a > 50) {
            // check if it's not white and not black/gray
            if (Math.abs(r-g) > 20 || Math.abs(g-b) > 20 || Math.abs(r-b) > 20) {
                hasColor = true;
                console.log(`Found color: ${r}, ${g}, ${b} at ${x}, ${y}`);
                break;
            }
        }
      }
      if(hasColor) break;
    }
    if(!hasColor) console.log("No color found, only white/gray/black");
  });
