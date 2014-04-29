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

	/**
	 * @class
	 * @constructor
	 * @inheritdoc ParametrizedUrl#_setUrl
	 */
	var ParametrizedUrl = function (url) {
		this._setUrl(url);
		_.bindAll(this, '_setUrl', 'getUrl', '_insertSubstring');
	};

	_.extend(ParametrizedUrl.prototype, {
		/**
		 * Sets the url this paramatrized url object is to use.
		 * @param {String} url
		 * The url to analyze, for instance: http://test.com/:footest
		 * @private
		 */
		_setUrl: function (url) {
			var regex = /(:(?!\/).+?)(?:\/|$|\?)/;
			var paramPositions = [];
			var path = null;
			var positionOffset = null;
			var match = null;

			//We only want to find matches in path part of the url (no ports).
			url = this._splitUrl(url);
			positionOffset = url[0].length;
			path = url[1];

			while((match = regex.exec(path)) !== null) {
				var key = match[1].slice(1);
				var position = match.index;

				//Store positions in an array to keep them in order.
				paramPositions.push({
					key: key,
					position: position + positionOffset
				});

				path = path.replace(':'+key, '');
			}

			url[1] = path;
			this.paramPositions = paramPositions;
			this.url = url.join('');
		},

		/**
		 * Split a url in a host and a path part.
		 * @param {String} url The url.
		 * @return {Array} The split url.
		 * @private
		 */
		_splitUrl: function (url) {
			var hostRegex = /^(http:\/\/)?.*?\//;
			var matches = url.match(hostRegex);
			var host = null;
			var path = null;
			if (matches) {
				host = matches[0];
				path = url.replace(host, '');
			}
			else {
				host = '';
				path = url;
			}
			return [host, path];
		},

		/**
		 * Return a url using a set of parameters.
		 * @param {Object} [params]
		 * @param {Object} [query]
		 * An object with a key-value pair for each parameter.
		 */
		getUrl: function (params, query) {
			var paramPositions = this.paramPositions;
			var url = this.url;
			var insertSubstring = this._insertSubstring;
			var addedLength = 0;
			params = params || {};

			_.each(paramPositions, function (paramPosition) {
				var key = paramPosition.key;
				var param = params[key];
				var position = paramPosition.position;

				if (!param) {
					param = ':' + key;
				}
				else {
					param = encodeURIComponent(param);
				}


				position += addedLength;
				url = insertSubstring(url, param, position);
				addedLength += param.length;
			});

			if (_.isEmpty(query)) {
				return url;
			}

			var queryStrings = [];
			_.each(query, function (value, key) {
				key = encodeURIComponent(key);
				value = encodeURIComponent(value);
				queryStrings.push(key + '=' + value);
			});
			url += '?' + queryStrings.join('&');

			return url;
		},

		/**
		 * Insert a string in a substring at a certain position.
		 * @param {String} string The original string.
		 * @param {String} substring The string to insert.
		 * @param {Number} position The insert position.
		 * @return {String} The new string with inserted substring.
		 * @private
		 */
		_insertSubstring: function (string, substring, position) {
			var begin = string.slice(0, position);
			var end = string.slice(position);
			return begin + substring + end;
		}

	});

	module.exports = ParametrizedUrl;

})();
