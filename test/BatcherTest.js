'use strict';

require( 'mocha-generators' ).install();

const lolex = require( 'lolex' );
const assert = require( '../enable-power-assert' );
const Batcher = require( '../source/Batcher' );

describe( 'Batcher', function() {

	var clock;

	beforeEach( function() {

		clock = lolex.install();
	} );

	afterEach( function() {

		clock.uninstall();
	} );

	it( 'calculates time to next request correctly', function() {

		const times = {
			1: 1000,
			0.5: 2000,
			5: 200
		};

		for ( let requestsPerSecond in times ) {

			const batcher = new Batcher( {
				requestsPerSecond: requestsPerSecond,
				requestBuilder: () => {}
			} );

			assert( batcher._delayBetweenRequests === times[ requestsPerSecond ] );

			assert( batcher._delayToNextRequest() === 0 );
		}
	} );

	it( 'processes when items are added to the queue', function*() {

		const processed = {};

		const batcher = new Batcher( {
			requestsPerSecond: 1,
			requestBuilder: ( items ) => {

				items.map( item => {

					item.fulfil();
				} );
			}
		} );

		const addItem = i => {

			return batcher.send( i ).then( () => {

				processed[ i ] = true;

				return i;
			} );
		};

		assert( ( yield addItem( 0 ) ) === 0 );

		const promises = [];

		for ( let i = 1; i <= 10; i++ ) {

			promises.push( addItem( i ) );
		}

		clock.tick( 1 );

		// Should not be processed until time to next request has elapsed
		assert.deepEqual( processed, {
			0: true
		} );

		clock.tick( 1000 );

		yield promises;
	} );

	it( 'processes in chunks', function*() {

		var processedCount = 0;

		const batcher = new Batcher( {
			requestsPerSecond: 1,
			maxItemsPerRequest: 5,
			requestBuilder: ( items ) => {

				items.map( item => {

					item.fulfil();
				} );
			}
		} );

		const addItem = i => {

			return batcher.send( i ).then( () => {

				processedCount++;

				return i;
			} );
		};

		const promises = [];

		for ( let i = 0; i <= 25; i++ ) {

			promises.push( addItem( i ) );
		}

		yield promises[ 0 ];

		for ( let i = 0; i < 5; i++ ) {

			processedCount = 0;

			clock.tick( 1000 );

			yield promises.slice( 1 + i * 5, 1 + ( i + 1 ) * 5 );

			assert( processedCount === 5 );
		}

	} );


} );
