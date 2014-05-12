// Copyright (C) 2014 IceMobile Agency B.V.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

(function () {
	var _ = require('underscore');
	var log4js = require('log4js');
	var logger = log4js.getLogger('caronte');
	var fs = require('fs');
	var Path = require('path');

	/**
	 * @class Caronte
	 */
	var Caronte = function () {
		this._sources = {};
		this.register = this.register.bind(this);
		this.unregister = this.unregister.bind(this);
		this.request = this.request.bind(this);
		this.sourceTypes = this._loadTypes();
	};

	Caronte.prototype = {
		/**
		 * @method configure
		 * Configure caronte.
		 * @param {Object} configuration
		 * The configuration that should be loaded.
		 * @param {Object} configuration.log4js
		 * The configuration of the logger.
		 */
		configure: function (configuration) {
			log4js.configure(configuration.log4js);
		},
		/**
		 * @method register
		 * Register a sources.
		 * @param {String} sourceName
		 * The name of this source.
		 * @param {Object} sourceParams
		 * These sourceParams will be used to create a new source:
		 * @param {'http'} [sourceParams.type=http]
		 * The type of source to create. Options: {@link HttpSource http}
		 */
		register: function (sourceName, sourceParams) {
			if (!sourceName) {
				throw new Error('Caronte - register: ' +
						'no parameters provided.');
			}
			if (!sourceParams) {
				throw new Error('Caronte - register: ' +
						'no sourceParams provided.');
			}
			var type = sourceParams.type || 'http';
			if (!type) {
				throw new Error('Caronte - register: ' +
						'not a valsourceName source type: ' + type);
			}

			logger.debug('Caronte - Registering new source: ' + sourceName);
			var Source = this.sourceTypes[type];
			this._sources[sourceName] = new Source(sourceParams);
		},

		/**
		 * @method registerWsdl
		 * Register a wsdl with mark corley to create sources for its soap actions.
		 * @param {Array} methods
		 * An array of soap methods to create sources for.
		 * @param {Object} options
         * @param {String} options.wsdlPath Path to the wsdl to load.
         * @param {Object} [options.headers] Http headers to add to each request.
         * @param {Object} [options.security]
         * @param {String} [options.security.username]
         * @param {String} [options.security.password]
		 * @param {String} [options.endpoint] Alternative endpoint for requests.
		 * An endpoint to connect to.
		 */
		registerWsdl: function(methods, options) {
			var SoapSource = this.sourceTypes.soap;
			methods.forEach(function(soapMethod) {
				var sourceParams = _.clone(options);
				sourceParams.soapMethod = soapMethod;
				this._sources[soapMethod] = new SoapSource(sourceParams);
			}, this);
		},

		/**
		 * Unregisters a source.
		 * @param {String} sourceName
		 * The sourceName of the source to be unregistered.
		 */
		unregister: function (sourceName) {
			logger.debug('Caronte - Unregistering source: ' + sourceName);
			delete this._sources[sourceName];
		},

		/**
		 * Make a data request.
		 * @param {String} sourceName
		 * The sourceName of the source to request data from.
		 * @param {String} [requestParams]
		 * The parameters of the request. These extend parameters of the source.
		 * @param {Function} [callback]
		 * The callback function to call when data is returned.
		 * @param {Mixed} callback.error	Error value if request fails.
		 * @param {Mixed} callback.success  The server response.
		 */
		request: function (sourceName, requestParams, callback) {
			var source = this._sources[sourceName];
			var error = null;

			// Item is an optional argument
			if (_.isFunction(requestParams)) {
				callback = requestParams;
				requestParams = null;
			}

			// Callback is an optional argument
			callback = callback || function () {};

			if (!source) {
				error = new Error('Caronte - request: source with sourceName: ' +
						sourceName + ' is not known to Caronte.');
				callback(error);
				return;
			}

			logger.info('Caronte - Making request for source: ' + sourceName);
			source.request(requestParams)
				.then(function (result) {
					logger.info('Caronte - Response from source: ' + sourceName);
					callback(null, result);
				}, function (error) {
					callback(error);
				})
				.done();
		},

		/**
		 * Load all source types from the file system.
		 * @return {Object}
		 * The sourcetypes as key, value pairs:
		 *
		 *     typeName: typeConstructor
		 *
		 * @private
		 */
		_loadTypes: function () {
			var sourceTypesPath = Path.resolve(__dirname, './sourceTypes');
			var sourceTypes = fs.readdirSync(sourceTypesPath);
			var types =  {};

			_.each(sourceTypes, function (fileName) {
				var match = (/(.+)\.js$/).exec(fileName);
				if (!match) { return; }
				var typeName = match[1];
				var typePath = Path.resolve(sourceTypesPath, fileName);
				types[typeName] = require(typePath);
			});

			return types;
		}
	};

	module.exports = Caronte;
})();
