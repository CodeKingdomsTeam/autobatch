module.exports = {
	"env": {
		"node": true,
		"mocha": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"sourceType": "module"
	},
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"semi": [
			"error",
			"always"
		],
		"indent": 0,
		"no-empty": 1,
		"comma-dangle": 0,
		"no-unused-vars": 1,
		"no-use-before-define": 2
	},
	"globals": {
		"Promise": false
	}
};
