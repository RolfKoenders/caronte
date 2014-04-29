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
	var Q = require('q');
	var _ = require('underscore');
	var logger = require('log4js').getLogger('caronte');
	/**
	* @class Source
	* @constructor
	* @param {Object} sourceParams
	* An object describing the source to be added.
	*/
	var Source = function (sourceParams) {
		this.sourceParams = this._proccessSourceParams(sourceParams);

		_.bindAll(this, '_mergeRequestAndSourceParams','_sendRequest',
					'_handleResponse', '_handleError');
	};

	_.extend(Source.prototype, {

		/**
		 * Makes the request and handles the response.
		 * @param {String} item
		 * The item to get from the source.
		 * @return {Promise}
		 * A promise for the item.
		 */
		request: function (requestParams) {
			return new Q(requestParams)
				.then(this._mergeRequestAndSourceParams)
				.then(this._serialize)
				.then(this._sendRequest)
				.then(this._handleResponse)
				.then(this._deserialize)
				.fail(this._handleError);
		},

		/**
		 * Proccess sourceParams, applying defaults and the like.
		 * @param {Object} [sourceParams]
		 * @return {Object} processed sourceParams
		 * @template
		 * @protected
		 */
		_proccessSourceParams: function (sourceParams) {
			return sourceParams;
		},

		/**
		 * Merge the source and request params two levels deep.
		 * Example: options.headers gets extended, not overwritten.
		 * @param {Object} [requestParams] the options to merge.
		 * @return {Object} The merged params object.
		 */
		_mergeRequestAndSourceParams: function (requestParams) {
			//First, do a simple flat merge.
			requestParams = requestParams || {};
			var sourceParams = this.sourceParams;
			var mergedParams = _.extend({}, sourceParams, requestParams);

			//Now manually merge all properties that are objects.
			_.each(mergedParams, function (option, key) {
				if (!_.isObject(option)) { return; }
				var sourceParam = sourceParams[key] || {};
				var requestParam = requestParams[key] || {};
				mergedParams[key] = _.extend(sourceParam, requestParam);
			});
			return mergedParams;
		},

		/**
		 * Process requestParams before making a request with them.
		 * @param {Object} requestParams
		 * @return {Object} requestParams
		 * Processed requestParams.
		 * @template
		 * @protected
		 */
		_serialize: function (requestParams) {
			return requestParams;
		},

		/**
		 * Perform the request
		 * @param {Object} requestParams The request requestParams.
		 * @return {Promise} A promise for the request.
		 * @template
		 * @protected
		 */
		_sendRequest: function (requestParams) {
			return new Q();
		},

		/**
		 * Handle the response from a server.
		 * @param {Mixed} response
		 * The server response.
		 * @return {Promise} a promise for the response.
		 * @template
		 * @protected
		 */
		_handleResponse: function (response) {
			return response;
		},

		/**
		 * Deserializes returned content.
		 * @param {Mixed} response The server response.
		 * @return {Object} The deserialized object.
		 * @template
		 * @protected
		 */
		_deserialize: function (response) {
			return response;
		},

		/**
		 * If an error gets in the request chain, attempt to
		 * deserialize its message.
		 * @param {Mixed} The error object.
		 * @return {Promise} A promise for the deserialized error.
		 */
		_handleError: function (error) {
			try {
				//try to deserialize
				error = this._deserialize(error);
			}
			catch (err) {}
			logger.debug('Source - _handleError', error);
			return Q.reject(error);
		}
	});

	/**
	 * @static
	 * Backbone-like extension mechanism for subclassing sources.
	 * @param {Object} [properties]
	 * Properties to extend the new source with.
	 * @return {Source}
	 * A constructor for the subclassed source.
	 */
	Source.extend = function(properties) {
		var parent = this;
		var child = function () {
			return parent.apply(this, arguments);
		};

		_.extend(child, parent);

		var Surrogate = function () {
			this.constructor = child;
		};
		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate();

		if (properties) {
			_.extend(child.prototype, properties);
		}

		child.__super__ = parent.prototype;

		return child;
	};

	module.exports = Source;
})();
