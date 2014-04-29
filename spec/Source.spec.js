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

var Q = require('q');
var mock = require('mock');
var request = require('./mocks/request.mock.js');
var MockParametrizedUrl = require('./mocks/parametrizedUrl.mock.js');

var Source  = mock('../lib/server/source.js', {
		'request': request,
		'../lib/server/parametrizedUrl.js': MockParametrizedUrl
	},
	require);


// Source
describe('Source ', function () {
	var source = null;

	beforeEach(function () {
		source = new Source('options');
	});

	// request
	describe('request', function () {
		beforeEach(function () {
			spyOn(source, '_mergeRequestAndSourceParams').andReturn('foo');
			spyOn(source, '_serialize').andReturn('bar');
			spyOn(source, '_sendRequest').andReturn('ice');
			spyOn(source, '_handleResponse').andReturn('mobile');
			spyOn(source, '_deserialize').andReturn('done');
		});

		it('calls request methods in order and passes through a result',
					function (done) {
			source.request('test')
			.then(function (result) {
				expect(source._mergeRequestAndSourceParams)
					.toHaveBeenCalledWith('test');
				expect(source._serialize)
					.toHaveBeenCalledWith('foo');
				expect(source._sendRequest)
					.toHaveBeenCalledWith('bar');
				expect(source._handleResponse)
					.toHaveBeenCalledWith('ice');
				expect(source._deserialize)
					.toHaveBeenCalledWith('mobile');
				expect(result).toBe('done');
				done();
			});
		});
	});


	// _mergeRequestAndSourceParams
	describe('_mergeRequestAndSourceParams', function () {
		var requestParams = null;

		beforeEach(function () {
			source.sourceParams = {
				foo: 'foo',
				ice: 'ice',
				bar: {
					test: 'test',
					test2: 'test2'
				}
			};
			requestParams = {
				ice: 'iceReplaced',
				mobile: 'mobile',
				bar: {
					test2: 'testReplaced',
					test3: 'test3'
				}
			};

		});

		it('correctly merges two levels deep', function () {
			expect(source._mergeRequestAndSourceParams(requestParams))
						.toEqual({
				foo: 'foo',
				ice: 'iceReplaced',
				mobile: 'mobile',
				bar: {
					test: 'test',
					test2: 'testReplaced',
					test3: 'test3'
				}
			});
		});


	});

});
