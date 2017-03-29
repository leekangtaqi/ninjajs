var webpack = require('webpack');
var path = require('path');
let env = process.env.NODE_ENV;

let baseConfig = {
	module: {
		rules: [
			{
				test: /\.tag$/,
				use: [
					'html-loader'
				]
			},
			{
				test: /\.jsx|js$/,
				exclude: [/node_modules/],
				use: { 
					loader: 'babel-loader',
					options: {
						compact: true,
						presets: ["es2015", "stage-0"],
						plugins: ['transform-decorators-legacy', 'transform-decorators', ["transform-react-jsx", { "pragma":"h" }]]
					} 
				},
			}
		]
	},
	node: {
		net: 'mock',
		dns: 'mock',
		fs: 'empty'
	}
};

let proConfig = {
	entry: {
		bundle: ['babel-regenerator-runtime', './src/index.js'],
		testbundle: ['babel-regenerator-runtime', './example/test.js']
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			compress: { warnings: false },
			comments: false,
			sourceMap: false,
			mangle: true,
			minimize: true
		}),
	],
	output: {
		path: path.resolve(__dirname, './dist/'),
		filename: '[name].js'
	}
}

let devConfig = {
	entry: {
		bundle: [
			'babel-regenerator-runtime', 
			'webpack-dev-server/client?http:localhost:8080',
			'./src/index.js'
		],
		testbundle: [
			'babel-regenerator-runtime', 
			'./example/test.js'
		]
	},
	devtool: 'eval',
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: '[name].js',
		publicPath: '/dist/'
	},
	devServer: {
		contentBase: path.join(__dirname, "example/"),
		compress: true,
		port: 8080
	}
}

let envMap = {
	production: proConfig,
	development: devConfig
}

module.exports = merge(baseConfig, envMap[env]);
/**
 * Helper functions
 */
function merge(t, s) {
	for (let p in s) {
		if (t.hasOwnProperty(p)) {
			if (Array.isArray(t[p])) {
				t[p] = [...s[p], ...t[p]];
			} else if(typeof t[p] === 'object') {
				merge(t[p], s[p])
			}
		} else {
			t[p] = s[p];
		}
	}
	return t;
}
