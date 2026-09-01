const fs = require('fs');
const buffer = fs.readFileSync('public/logo-full.png');
// We just want to know if there's any non-white/non-transparent pixels
// Let's use a simpler approach: encode to base64, write a tiny html file and serve it, no I'll just check if there's a specific string.
