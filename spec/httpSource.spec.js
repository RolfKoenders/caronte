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

var mock = require('mock');
var request = require('./mocks/request.mock.js');
var MockParametrizedUrl = require('./mocks/parametrizedUrl.mock.js');

var HttpSource  = mock('../lib/server/sourceTypes/http.js', {
	'request': request,
	'../lib/server/parametrizedUrl.js': MockParametrizedUrl
}, require);


// HttpSource
describe('HttpSource ', function() {
	var source = null;
	var mockOptions = null;

	beforeEach(function () {
		mockOptions = {
			url: 'http://someurl.com:4242/:foo/:bar?:ice',
			method: 'GET',
			json: { json1: 'foo', json2: 'bar' },
			headers: { header1: 'foo', header2: 'bar' },
			params: { param1: 'foo', param2: 'bar' }
		};
		source = new HttpSource(mockOptions);

		//Do not log.
		require('log4js').configure({
			appenders: [ { category: '[all]', type: 'console' } ],
			levels: { '[all]': 'OFF' }
		});
	});

	// constructor
	describe('constructor', function() {
		it('sets provided options on the source object', function () {
			var sourceParams = source.sourceParams;
			expect(sourceParams.parametrizedUrl).toBeDefined();
			expect(sourceParams.method).toBe(mockOptions.method.toLowerCase());
			expect(sourceParams.json).toBe(mockOptions.json);
			expect(sourceParams.headers).toBe(mockOptions.headers);
			expect(sourceParams.params).toBe(mockOptions.params);
		});
		it('sets default options for options not provided', function () {
			mockOptions = {
				url: 'someUrl',
				method: 'put'
			};
			source = new HttpSource(mockOptions);
			var sourceParams = source.sourceParams;
			expect(sourceParams.parametrizedUrl).toBeDefined();
			expect(sourceParams.method).toBe(mockOptions.method.toLowerCase());
			expect(sourceParams.params).toEqual({});
			expect(sourceParams.headers).toEqual({});
		});
		it('creates parametrizedUrl and stores it in options', function () {
			source = new HttpSource(mockOptions);
			expect(MockParametrizedUrl.mostRecentCall.args)
					.toEqual(['http://someurl.com:4242/:foo/:bar?:ice']);
		});
		it('overwrites sets serializer and deserializer, ' +
				'if they are provided', function () {
			mockOptions.serializer = 'serialize';
			mockOptions.deserializer = 'deserialize';
			source = new HttpSource(mockOptions);
			expect(source._serialize).toBe('serialize');
			expect(source._deserialize).toBe('deserialize');
		});

	});

	// _deserialize
	describe('- _deserialize', function() {
		var foobar = 'foobar';
		var json = {'foo': foobar};
		var jsonString = JSON.stringify(json);

		it('should return passed argument untouched ' +
			'if it is an object', function () {
			var result = source._deserialize(json);
			expect(result).toEqual(json);
		});

		it('should return json object of passed argument if this ' +
			'is a json string', function () {
			var result = source._deserialize(jsonString);
			expect(result).toEqual(json);
		});

	});


	/**
	 * ================== _handleResponse  ==================
	 */
	describe('- _handleResponse', function() {
		var errorBody = 'foo';
		var errorResponse = {
			statusCode: 500,
			body: errorBody
		};
		var successBody = 'bar';
		var successResponse = {
			statusCode: 200,
			body: successBody
		}

		it('returns a rejected promise if response has failed',
					function (done) {
			source._handleResponse([ errorResponse, errorBody ])
			.then(function () {}, function (result) {
				expect(result instanceof Error).toBe(true);
				expect(result.body).toBe(errorBody);
				expect(result.code).toBe('request.http.response.500');
				expect(result.statusCode).toBe(500);
				done();
			});
		});
		it('returns a resolved promise if response has succeeded',
					function (done) {
			source._handleResponse([ successResponse, successBody ])
			.then(function (result) {
				expect(result).toBe(successBody);
				done();
			});
		});
	});
});
