'use strict';

const defaults = require( 'lodash.defaults' );

var Batcher = function( options ) {

	this.options = defaults( options || {}, {
		maxItemsPerRequest: 1000,
		requestsPerSecond: 0.6
	} );

	this._delayBetweenRequests = Math.round( ( 1 / this.options.requestsPerSecond ) * 1000 );

	if ( !this.options.requestBuilder ) {

		throw new Error( 'requestBuilder must be a function' );
	}

	this.queue = [];
	this._processQueue = this._processQueue.bind( this );
};

Batcher.prototype = {

	send: function( item ) {

		return new Promise( ( fulfil, reject ) => {

			this.queue.push( {
				item,
				fulfil,
				reject
			} );

			this._processQueue();

		} );

	},

	_delayToNextRequest: function() {

		if ( this._lastRequest === undefined ) {

			return 0;
		}

		const hrDiff = process.hrtime( this._lastRequest );

		return Math.max( 0, this._delayBetweenRequests - hrDiff[ 0 ] * 1000 - ( hrDiff[ 1 ] / 1e6 ) );
	},

	_processQueue: function() {

		if ( !this.queue.length || this._processing ) {

			return;
		}

		if ( this._processQueueTimeout ) {

			clearTimeout( this._processQueueTimeout );
			this._processQueueTimeout = null;
		}

		const delayToNextRequest = this._delayToNextRequest();

		if ( delayToNextRequest > 0 ) {

			this._processQueueTimeout = setTimeout( this._processQueue, delayToNextRequest );
			return;
		}

		const items = this.queue.splice( 0, this.options.maxItemsPerRequest );

		this._processing = true;
		this._lastRequest = process.hrtime();

		Promise.resolve( this.options.requestBuilder( items ) ).then( () => {

			this._processing = false;

			this._processQueue();

		} ).catch( () => {

			this._processing = false;

			this._processQueue();

		} );
	}
};

module.exports = Batcher;
