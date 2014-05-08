<img src="./images/caronte.png" width="400px" height="250px" align="right" />

# Caronte

Current version: ** 1.0.x **

[![Build Status](https://travis-ci.org/icemobilelab/caronte.svg?branch=master)](https://travis-ci.org/icemobilelab/caronte)


# Usage

The first version of Caronte has a simple interface consisting of three methods:

- register()
- unregister()
- request()


## register(sourceName, sourceParams)
The register method is used to add a new source, specified by the sourceParams object.
It is registered under name sourceName.

The sourceParams object can takes the following form:

	{
		url: 'www.yoursite.com/:param', 					//'param' being a parameter.
		type: 'http', 				                    //One of the sourceTypes, currently only `http`
		method: 'GET',												//or `PUT` or `POST`.
		params: {},							   					//optional: default parameters.
		serializer: function (data) { return data; }, 	//optional: serializer for request.
		deserializer: function (data) { return data; }, //optional: deserializer for reponse.
		json: {},								 					//optional: contents of a request, in JSON form
		headers: {}							   					//optional: headers to add to each request.
	}

If a certain sourceName is already registered, it will be overwritten.

register() can also register multiple sources passed as an object:

	{
		sourceId: sourceOptions,
		//more sources
	}


## unregister(sourceName)
Unregisters a source.


## request(sourceName [, requestParams] [,callback])
Makes a request to the source defined by sourceName.
If it doesn't exist, callback is called with an error.

Callback is a node-style function, which takes an err and a result parameter.

requestParams is an object which takes the following form (http source):

	{
		params: { stamps: 'fooStamp' }  //optional: parameters to insert into the url.
		headers: {}					    //optional: extends headers set at register.
		json: {}						//optional: extends json set at register.
	}

## Caronte in the browser
Caronte can be used in the browser when compiled with browserify.
In this scenario, jQuery needs to be loaded in the page for Caronte to work.
