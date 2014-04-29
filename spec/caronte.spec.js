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
var SourceMock = require('./mocks/Source.mock.js');
var ParametrizedUrlMock = require('./mocks/parametrizedUrl.mock.js');

//this.require = require = require('./mockRequire.js');
var Caronte  = mock('../lib/server/caronte.js', {
		'../lib/server/parametrizedUrl': ParametrizedUrlMock
	}, require);


/**
 * Caronte
 */
describe('Caronte ', function() {
	var caronte = null;
	beforeEach(function() {
		var configuration = {
			log4js: {
				appenders: [ { category: '[all]', type: 'console' } ],
				levels: { '[all]': 'OFF' }
			}
		};
		caronte = new Caronte(configuration);
		caronte.sourceTypes = {
			'http': SourceMock
		};
	});

	//register
	describe('- register', function() {
		var id = 'foo';
		var options = {
			id: id
		};

		it('should call Source Constructor with passed options', function() {
			caronte.register(id, options);
			expect(SourceMock).toHaveBeenCalled();
			expect(SourceMock)
				.toHaveBeenCalledWith(options);
		});
		it('should save the returned new Source object' +
					'inside _sources, referenced by options.id', function() {
			caronte.register(id, options);
			expect(caronte._sources[id]).toBeDefined();
			expect(caronte._sources[id]).toBe(new SourceMock(options));
		});
	});

	//unregister
	describe('- unregister', function() {
		var id = 'foo';
		var options = {
			id: id
		};

		it('should remove object from _sources referenced by id', function() {
			caronte._sources[id] = options;
			//just to be sure
			expect(caronte._sources[id]).toBeDefined();
			caronte.unregister(id);
			expect(caronte._sources[id]).toBeUndefined();
		});
	});

	//request
	describe('- request', function() {
		var source = null;

		beforeEach(function () {
			source = new SourceMock();
			caronte._sources = {
				'test': source
			};
		});

		it('if passed id does not reference a source in ' +
					'caronte._sources, it should pass an Error object ' +
					'to passed callback', function (done) {

			var callback = function (error, success) {
				expect(typeof error).toBe('object');
				expect(Error.prototype.isPrototypeOf(error)).toBeTruthy();
				done();
			};
			caronte.request('unexistingId', null, callback);
		});
		it('if passed id references a source in caronte._sources, ' +
					'it should call source.request with item and call ' +
					'callback with result', function (done) {

			var callback = function (error, success) {
				expect(source.request).toHaveBeenCalledWith('testItem');
				expect(arguments).toEqual([null, 'testResult']);
				done();
			};

			//call fake promise when request is called
			source.request.andReturn(Q('testResult'));

			caronte.request('test', 'testItem', callback);
		});
		it('works if the item arg is skipped.', function (done) {
			var callback = function (error, success) {
				expect(source.request.mostRecentCall.args)
						.toEqual([ null ]);
				expect(arguments).toEqual([null, 'testResult']);
				done();
			};

			//call fake promise when request is called
			source.request.andReturn(Q('testResult'));

			caronte.request('test', callback);
		});
	});

});
