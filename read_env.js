const fs = require('fs');
try {
  console.log(fs.readFileSync('.env.local', 'utf8'));
} catch (e) {
  console.error(e);
}
