const path = require('path');

module.exports = {
    entry: './src/chiffchaff.js',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'chiffchaff.js'
    },
    optimization: {
        minimize: false
    },
}
