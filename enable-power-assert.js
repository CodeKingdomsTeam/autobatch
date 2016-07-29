'use strict';

const path = require( 'path' );

require( path.join( __dirname, 'node_modules/espower-loader' ) )( {
	cwd: path.join( __dirname, '..' ),
	pattern: '**/test*/**/*.js'
} );


module.exports = require( path.join( __dirname, 'node_modules/power-assert' ) );
