const path = require('path');

module.exports = {
	mode: 'development',
	devtool: 'inline-source-map',
	entry: './js/index.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, ''),
	},
};
