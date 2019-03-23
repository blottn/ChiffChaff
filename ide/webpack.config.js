const path = require('path');

module.exports = {
    entry: './src/chiffchaff.js',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'chiffchaff.js'
    }
}
