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

//mock Caronte constructor.
var Caronte = function () {};
var index  = mock('../index.js', {
	'../lib/server/caronte.js': Caronte
}, require);

describe('The index file', function () {
	it('Index returns a Caronte instance', function () {
		expect(index instanceof Caronte).toBe(true);
	});
	describe('has a getCaronte method', function () {
		it('Returns a Caronte instance', function () {
			var caronte = index.getCaronte();
			expect(caronte instanceof Caronte).toBe(true);
		});
		it('when passed a different string, returns a different caronte',
				function () {
			var mark1 = index.getCaronte('foo');
			var mark2 = index.getCaronte('bar');
			expect(mark1).not.toBe(mark2);
		});
		it('when passed equal strings, returns the same caronte', function () {
			var mark1 = index.getCaronte('foo');
			var mark2 = index.getCaronte('foo');
			expect(mark1).toBe(mark2);
		});
	});
});
