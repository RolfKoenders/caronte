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

//tell jshint everything's ok
/*global describe:false, beforeEach:false, it:false, spyOn:false, expect:false, runs:false, waitsFor:false, createSpy:false, createSpyObj: false */

(function () {
	var ParametrizedUrl = require('../lib/server/parametrizedUrl');

	/**
	 * Because this object has one simple job: replace placeholders in a url,
	 * Testing subfunctions seems like a lot of time with no gain. Instead,
	 * I'd rather be able to quickly check if some complex cases, that might have
	 * failed in the past, are all parsed correctly. Hence the approach below.
	 *
	 * A parse function is provided to easily get the result of a certain url
	 * with parameters applied. The individual tests check difficult cases.
	 */
	describe('url parsing', function () {
		//Helper function, to quickly parse a url.
		var parse = function (url, params, query) {
			var parametrizedUrl = new ParametrizedUrl(url);
			return parametrizedUrl.getUrl(params, query);
		};

		it('correctly replaces placeholders in a url with parameters',
				function () {
			var url = 'http://someurl.com:4242/:foo/:bar?:ice';
			var params = {
				foo: 'fooTest',
				bar: 'barTest',
				ice: 'iceTest'
			};

			expect(parse(url, params))
				.toBe('http://someurl.com:4242/fooTest/barTest?iceTest');
		});

		it('works if there are no parameters to be placed', function () {
			//set url.
			var url = 'something.html';

			expect(parse(url)).toBe(url);
		});

		it('correclty adds query parameters', function () {
			var url = 'http://someurl.com:4242/:foo/';
			var params = {
				foo: 'fooTest'
			};
			var query = {
				bar: 'barTest',
				ice: 'iceTest'
			};

			expect(parse(url, params, query))
				.toBe('http://someurl.com:4242/fooTest/?bar=barTest&ice=iceTest');
		});
	});
}());
