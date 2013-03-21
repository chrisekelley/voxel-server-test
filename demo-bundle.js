;(function(e,t,n,r){function i(r){if(!n[r]){if(!t[r]){if(e)return e(r);throw new Error("Cannot find module '"+r+"'")}var s=n[r]={exports:{}};t[r][0](function(e){var n=t[r][1][e];return i(n?n:e)},s,s.exports)}return n[r].exports}for(var s=0;s<r.length;s++)i(r[s]);return i})(typeof require!=="undefined"&&require,{1:[function(require,module,exports){

var io = require('socket.io-client');
var elstreamo = require('el-streamo')
var elstream = elstreamo.writable('#messages')
var socket = io.connect('ws://localhost:8080');
socket.on('id', function (data) {
    console.log("id" + data);
    elstream.write("Received id:" + data)
    socket.emit('test', { my: 'data' });
});


},{"socket.io-client":2,"el-streamo":3}],2:[function(require,module,exports){
(function(global){/*! Socket.IO.js build:0.9.11, development. Copyright(c) 2011 LearnBoost <dev@learnboost.com> MIT Licensed */

var io = ('undefined' === typeof module ? {} : module.exports);
(function() {

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, global) {

  /**
   * IO namespace.
   *
   * @namespace
   */

  var io = exports;

  /**
   * Socket.IO version
   *
   * @api public
   */

  io.version = '0.9.11';

  /**
   * Protocol implemented.
   *
   * @api public
   */

  io.protocol = 1;

  /**
   * Available transports, these will be populated with the available transports
   *
   * @api public
   */

  io.transports = [];

  /**
   * Keep track of jsonp callbacks.
   *
   * @api private
   */

  io.j = [];

  /**
   * Keep track of our io.Sockets
   *
   * @api private
   */
  io.sockets = {};


  /**
   * Manages connections to hosts.
   *
   * @param {String} uri
   * @Param {Boolean} force creation of new socket (defaults to false)
   * @api public
   */

  io.connect = function (host, details) {
    var uri = io.util.parseUri(host)
      , uuri
      , socket;

    if (global && global.location) {
      uri.protocol = uri.protocol || global.location.protocol.slice(0, -1);
      uri.host = uri.host || (global.document
        ? global.document.domain : global.location.hostname);
      uri.port = uri.port || global.location.port;
    }

    uuri = io.util.uniqueUri(uri);

    var options = {
        host: uri.host
      , secure: 'https' == uri.protocol
      , port: uri.port || ('https' == uri.protocol ? 443 : 80)
      , query: uri.query || ''
    };

    io.util.merge(options, details);

    if (options['force new connection'] || !io.sockets[uuri]) {
      socket = new io.Socket(options);
    }

    if (!options['force new connection'] && socket) {
      io.sockets[uuri] = socket;
    }

    socket = socket || io.sockets[uuri];

    // if path is different from '' or /
    return socket.of(uri.path.length > 1 ? uri.path : '');
  };

})('object' === typeof module ? module.exports : (this.io = {}), this);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, global) {

  /**
   * Utilities namespace.
   *
   * @namespace
   */

  var util = exports.util = {};

  /**
   * Parses an URI
   *
   * @author Steven Levithan <stevenlevithan.com> (MIT license)
   * @api public
   */

  var re = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

  var parts = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password',
               'host', 'port', 'relative', 'path', 'directory', 'file', 'query',
               'anchor'];

  util.parseUri = function (str) {
    var m = re.exec(str || '')
      , uri = {}
      , i = 14;

    while (i--) {
      uri[parts[i]] = m[i] || '';
    }

    return uri;
  };

  /**
   * Produces a unique url that identifies a Socket.IO connection.
   *
   * @param {Object} uri
   * @api public
   */

  util.uniqueUri = function (uri) {
    var protocol = uri.protocol
      , host = uri.host
      , port = uri.port;

    if ('document' in global) {
      host = host || document.domain;
      port = port || (protocol == 'https'
        && document.location.protocol !== 'https:' ? 443 : document.location.port);
    } else {
      host = host || 'localhost';

      if (!port && protocol == 'https') {
        port = 443;
      }
    }

    return (protocol || 'http') + '://' + host + ':' + (port || 80);
  };

  /**
   * Mergest 2 query strings in to once unique query string
   *
   * @param {String} base
   * @param {String} addition
   * @api public
   */

  util.query = function (base, addition) {
    var query = util.chunkQuery(base || '')
      , components = [];

    util.merge(query, util.chunkQuery(addition || ''));
    for (var part in query) {
      if (query.hasOwnProperty(part)) {
        components.push(part + '=' + query[part]);
      }
    }

    return components.length ? '?' + components.join('&') : '';
  };

  /**
   * Transforms a querystring in to an object
   *
   * @param {String} qs
   * @api public
   */

  util.chunkQuery = function (qs) {
    var query = {}
      , params = qs.split('&')
      , i = 0
      , l = params.length
      , kv;

    for (; i < l; ++i) {
      kv = params[i].split('=');
      if (kv[0]) {
        query[kv[0]] = kv[1];
      }
    }

    return query;
  };

  /**
   * Executes the given function when the page is loaded.
   *
   *     io.util.load(function () { console.log('page loaded'); });
   *
   * @param {Function} fn
   * @api public
   */

  var pageLoaded = false;

  util.load = function (fn) {
    if ('document' in global && document.readyState === 'complete' || pageLoaded) {
      return fn();
    }

    util.on(global, 'load', fn, false);
  };

  /**
   * Adds an event.
   *
   * @api private
   */

  util.on = function (element, event, fn, capture) {
    if (element.attachEvent) {
      element.attachEvent('on' + event, fn);
    } else if (element.addEventListener) {
      element.addEventListener(event, fn, capture);
    }
  };

  /**
   * Generates the correct `XMLHttpRequest` for regular and cross domain requests.
   *
   * @param {Boolean} [xdomain] Create a request that can be used cross domain.
   * @returns {XMLHttpRequest|false} If we can create a XMLHttpRequest.
   * @api private
   */

  util.request = function (xdomain) {

    if (xdomain && 'undefined' != typeof XDomainRequest && !util.ua.hasCORS) {
      return new XDomainRequest();
    }

    if ('undefined' != typeof XMLHttpRequest && (!xdomain || util.ua.hasCORS)) {
      return new XMLHttpRequest();
    }

    if (!xdomain) {
      try {
        return new window[(['Active'].concat('Object').join('X'))]('Microsoft.XMLHTTP');
      } catch(e) { }
    }

    return null;
  };

  /**
   * XHR based transport constructor.
   *
   * @constructor
   * @api public
   */

  /**
   * Change the internal pageLoaded value.
   */

  if ('undefined' != typeof window) {
    util.load(function () {
      pageLoaded = true;
    });
  }

  /**
   * Defers a function to ensure a spinner is not displayed by the browser
   *
   * @param {Function} fn
   * @api public
   */

  util.defer = function (fn) {
    if (!util.ua.webkit || 'undefined' != typeof importScripts) {
      return fn();
    }

    util.load(function () {
      setTimeout(fn, 100);
    });
  };

  /**
   * Merges two objects.
   *
   * @api public
   */

  util.merge = function merge (target, additional, deep, lastseen) {
    var seen = lastseen || []
      , depth = typeof deep == 'undefined' ? 2 : deep
      , prop;

    for (prop in additional) {
      if (additional.hasOwnProperty(prop) && util.indexOf(seen, prop) < 0) {
        if (typeof target[prop] !== 'object' || !depth) {
          target[prop] = additional[prop];
          seen.push(additional[prop]);
        } else {
          util.merge(target[prop], additional[prop], depth - 1, seen);
        }
      }
    }

    return target;
  };

  /**
   * Merges prototypes from objects
   *
   * @api public
   */

  util.mixin = function (ctor, ctor2) {
    util.merge(ctor.prototype, ctor2.prototype);
  };

  /**
   * Shortcut for prototypical and static inheritance.
   *
   * @api private
   */

  util.inherit = function (ctor, ctor2) {
    function f() {};
    f.prototype = ctor2.prototype;
    ctor.prototype = new f;
  };

  /**
   * Checks if the given object is an Array.
   *
   *     io.util.isArray([]); // true
   *     io.util.isArray({}); // false
   *
   * @param Object obj
   * @api public
   */

  util.isArray = Array.isArray || function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  /**
   * Intersects values of two arrays into a third
   *
   * @api public
   */

  util.intersect = function (arr, arr2) {
    var ret = []
      , longest = arr.length > arr2.length ? arr : arr2
      , shortest = arr.length > arr2.length ? arr2 : arr;

    for (var i = 0, l = shortest.length; i < l; i++) {
      if (~util.indexOf(longest, shortest[i]))
        ret.push(shortest[i]);
    }

    return ret;
  };

  /**
   * Array indexOf compatibility.
   *
   * @see bit.ly/a5Dxa2
   * @api public
   */

  util.indexOf = function (arr, o, i) {

    for (var j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0;
         i < j && arr[i] !== o; i++) {}

    return j <= i ? -1 : i;
  };

  /**
   * Converts enumerables to array.
   *
   * @api public
   */

  util.toArray = function (enu) {
    var arr = [];

    for (var i = 0, l = enu.length; i < l; i++)
      arr.push(enu[i]);

    return arr;
  };

  /**
   * UA / engines detection namespace.
   *
   * @namespace
   */

  util.ua = {};

  /**
   * Whether the UA supports CORS for XHR.
   *
   * @api public
   */

  util.ua.hasCORS = 'undefined' != typeof XMLHttpRequest && (function () {
    try {
      var a = new XMLHttpRequest();
    } catch (e) {
      return false;
    }

    return a.withCredentials != undefined;
  })();

  /**
   * Detect webkit.
   *
   * @api public
   */

  util.ua.webkit = 'undefined' != typeof navigator
    && /webkit/i.test(navigator.userAgent);

   /**
   * Detect iPad/iPhone/iPod.
   *
   * @api public
   */

  util.ua.iDevice = 'undefined' != typeof navigator
      && /iPad|iPhone|iPod/i.test(navigator.userAgent);

})('undefined' != typeof io ? io : module.exports, this);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.EventEmitter = EventEmitter;

  /**
   * Event emitter constructor.
   *
   * @api public.
   */

  function EventEmitter () {};

  /**
   * Adds a listener
   *
   * @api public
   */

  EventEmitter.prototype.on = function (name, fn) {
    if (!this.$events) {
      this.$events = {};
    }

    if (!this.$events[name]) {
      this.$events[name] = fn;
    } else if (io.util.isArray(this.$events[name])) {
      this.$events[name].push(fn);
    } else {
      this.$events[name] = [this.$events[name], fn];
    }

    return this;
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  /**
   * Adds a volatile listener.
   *
   * @api public
   */

  EventEmitter.prototype.once = function (name, fn) {
    var self = this;

    function on () {
      self.removeListener(name, on);
      fn.apply(this, arguments);
    };

    on.listener = fn;
    this.on(name, on);

    return this;
  };

  /**
   * Removes a listener.
   *
   * @api public
   */

  EventEmitter.prototype.removeListener = function (name, fn) {
    if (this.$events && this.$events[name]) {
      var list = this.$events[name];

      if (io.util.isArray(list)) {
        var pos = -1;

        for (var i = 0, l = list.length; i < l; i++) {
          if (list[i] === fn || (list[i].listener && list[i].listener === fn)) {
            pos = i;
            break;
          }
        }

        if (pos < 0) {
          return this;
        }

        list.splice(pos, 1);

        if (!list.length) {
          delete this.$events[name];
        }
      } else if (list === fn || (list.listener && list.listener === fn)) {
        delete this.$events[name];
      }
    }

    return this;
  };

  /**
   * Removes all listeners for an event.
   *
   * @api public
   */

  EventEmitter.prototype.removeAllListeners = function (name) {
    if (name === undefined) {
      this.$events = {};
      return this;
    }

    if (this.$events && this.$events[name]) {
      this.$events[name] = null;
    }

    return this;
  };

  /**
   * Gets all listeners for a certain event.
   *
   * @api publci
   */

  EventEmitter.prototype.listeners = function (name) {
    if (!this.$events) {
      this.$events = {};
    }

    if (!this.$events[name]) {
      this.$events[name] = [];
    }

    if (!io.util.isArray(this.$events[name])) {
      this.$events[name] = [this.$events[name]];
    }

    return this.$events[name];
  };

  /**
   * Emits an event.
   *
   * @api public
   */

  EventEmitter.prototype.emit = function (name) {
    if (!this.$events) {
      return false;
    }

    var handler = this.$events[name];

    if (!handler) {
      return false;
    }

    var args = Array.prototype.slice.call(arguments, 1);

    if ('function' == typeof handler) {
      handler.apply(this, args);
    } else if (io.util.isArray(handler)) {
      var listeners = handler.slice();

      for (var i = 0, l = listeners.length; i < l; i++) {
        listeners[i].apply(this, args);
      }
    } else {
      return false;
    }

    return true;
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Based on JSON2 (http://www.JSON.org/js.html).
 */

(function (exports, nativeJSON) {
  "use strict";

  // use native JSON if it's available
  if (nativeJSON && nativeJSON.parse){
    return exports.JSON = {
      parse: nativeJSON.parse
    , stringify: nativeJSON.stringify
    };
  }

  var JSON = exports.JSON = {};

  function f(n) {
      // Format integers to have at least two digits.
      return n < 10 ? '0' + n : n;
  }

  function date(d, key) {
    return isFinite(d.valueOf()) ?
        d.getUTCFullYear()     + '-' +
        f(d.getUTCMonth() + 1) + '-' +
        f(d.getUTCDate())      + 'T' +
        f(d.getUTCHours())     + ':' +
        f(d.getUTCMinutes())   + ':' +
        f(d.getUTCSeconds())   + 'Z' : null;
  };

  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      gap,
      indent,
      meta = {    // table of character substitutions
          '\b': '\\b',
          '\t': '\\t',
          '\n': '\\n',
          '\f': '\\f',
          '\r': '\\r',
          '"' : '\\"',
          '\\': '\\\\'
      },
      rep;


  function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

      escapable.lastIndex = 0;
      return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
          var c = meta[a];
          return typeof c === 'string' ? c :
              '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      }) + '"' : '"' + string + '"';
  }


  function str(key, holder) {

// Produce a string from holder[key].

      var i,          // The loop counter.
          k,          // The member key.
          v,          // The member value.
          length,
          mind = gap,
          partial,
          value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

      if (value instanceof Date) {
          value = date(key);
      }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

      if (typeof rep === 'function') {
          value = rep.call(holder, key, value);
      }

// What happens next depends on the value's type.

      switch (typeof value) {
      case 'string':
          return quote(value);

      case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

          return isFinite(value) ? String(value) : 'null';

      case 'boolean':
      case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

          return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

      case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

          if (!value) {
              return 'null';
          }

// Make an array to hold the partial results of stringifying this object value.

          gap += indent;
          partial = [];

// Is the value an array?

          if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

              length = value.length;
              for (i = 0; i < length; i += 1) {
                  partial[i] = str(i, value) || 'null';
              }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

              v = partial.length === 0 ? '[]' : gap ?
                  '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                  '[' + partial.join(',') + ']';
              gap = mind;
              return v;
          }

// If the replacer is an array, use it to select the members to be stringified.

          if (rep && typeof rep === 'object') {
              length = rep.length;
              for (i = 0; i < length; i += 1) {
                  if (typeof rep[i] === 'string') {
                      k = rep[i];
                      v = str(k, value);
                      if (v) {
                          partial.push(quote(k) + (gap ? ': ' : ':') + v);
                      }
                  }
              }
          } else {

// Otherwise, iterate through all of the keys in the object.

              for (k in value) {
                  if (Object.prototype.hasOwnProperty.call(value, k)) {
                      v = str(k, value);
                      if (v) {
                          partial.push(quote(k) + (gap ? ': ' : ':') + v);
                      }
                  }
              }
          }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

          v = partial.length === 0 ? '{}' : gap ?
              '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
              '{' + partial.join(',') + '}';
          gap = mind;
          return v;
      }
  }

// If the JSON object does not yet have a stringify method, give it one.

  JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

      var i;
      gap = '';
      indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

      if (typeof space === 'number') {
          for (i = 0; i < space; i += 1) {
              indent += ' ';
          }

// If the space parameter is a string, it will be used as the indent string.

      } else if (typeof space === 'string') {
          indent = space;
      }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

      rep = replacer;
      if (replacer && typeof replacer !== 'function' &&
              (typeof replacer !== 'object' ||
              typeof replacer.length !== 'number')) {
          throw new Error('JSON.stringify');
      }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

      return str('', {'': value});
  };

// If the JSON object does not yet have a parse method, give it one.

  JSON.parse = function (text, reviver) {
  // The parse method takes a text and an optional reviver function, and returns
  // a JavaScript value if the text is a valid JSON text.

      var j;

      function walk(holder, key) {

  // The walk method is used to recursively walk the resulting structure so
  // that modifications can be made.

          var k, v, value = holder[key];
          if (value && typeof value === 'object') {
              for (k in value) {
                  if (Object.prototype.hasOwnProperty.call(value, k)) {
                      v = walk(value, k);
                      if (v !== undefined) {
                          value[k] = v;
                      } else {
                          delete value[k];
                      }
                  }
              }
          }
          return reviver.call(holder, key, value);
      }


  // Parsing happens in four stages. In the first stage, we replace certain
  // Unicode characters with escape sequences. JavaScript handles many characters
  // incorrectly, either silently deleting them, or treating them as line endings.

      text = String(text);
      cx.lastIndex = 0;
      if (cx.test(text)) {
          text = text.replace(cx, function (a) {
              return '\\u' +
                  ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          });
      }

  // In the second stage, we run the text against regular expressions that look
  // for non-JSON patterns. We are especially concerned with '()' and 'new'
  // because they can cause invocation, and '=' because it can cause mutation.
  // But just to be safe, we want to reject all unexpected forms.

  // We split the second stage into 4 regexp operations in order to work around
  // crippling inefficiencies in IE's and Safari's regexp engines. First we
  // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
  // replace all simple value tokens with ']' characters. Third, we delete all
  // open brackets that follow a colon or comma or that begin the text. Finally,
  // we look to see that the remaining characters are only whitespace or ']' or
  // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

      if (/^[\],:{}\s]*$/
              .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                  .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                  .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

  // In the third stage we use the eval function to compile the text into a
  // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
  // in JavaScript: it can begin a block or an object literal. We wrap the text
  // in parens to eliminate the ambiguity.

          j = eval('(' + text + ')');

  // In the optional fourth stage, we recursively walk the new structure, passing
  // each name/value pair to a reviver function for possible transformation.

          return typeof reviver === 'function' ?
              walk({'': j}, '') : j;
      }

  // If the text is not JSON parseable, then a SyntaxError is thrown.

      throw new SyntaxError('JSON.parse');
  };

})(
    'undefined' != typeof io ? io : module.exports
  , typeof JSON !== 'undefined' ? JSON : undefined
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Parser namespace.
   *
   * @namespace
   */

  var parser = exports.parser = {};

  /**
   * Packet types.
   */

  var packets = parser.packets = [
      'disconnect'
    , 'connect'
    , 'heartbeat'
    , 'message'
    , 'json'
    , 'event'
    , 'ack'
    , 'error'
    , 'noop'
  ];

  /**
   * Errors reasons.
   */

  var reasons = parser.reasons = [
      'transport not supported'
    , 'client not handshaken'
    , 'unauthorized'
  ];

  /**
   * Errors advice.
   */

  var advice = parser.advice = [
      'reconnect'
  ];

  /**
   * Shortcuts.
   */

  var JSON = io.JSON
    , indexOf = io.util.indexOf;

  /**
   * Encodes a packet.
   *
   * @api private
   */

  parser.encodePacket = function (packet) {
    var type = indexOf(packets, packet.type)
      , id = packet.id || ''
      , endpoint = packet.endpoint || ''
      , ack = packet.ack
      , data = null;

    switch (packet.type) {
      case 'error':
        var reason = packet.reason ? indexOf(reasons, packet.reason) : ''
          , adv = packet.advice ? indexOf(advice, packet.advice) : '';

        if (reason !== '' || adv !== '')
          data = reason + (adv !== '' ? ('+' + adv) : '');

        break;

      case 'message':
        if (packet.data !== '')
          data = packet.data;
        break;

      case 'event':
        var ev = { name: packet.name };

        if (packet.args && packet.args.length) {
          ev.args = packet.args;
        }

        data = JSON.stringify(ev);
        break;

      case 'json':
        data = JSON.stringify(packet.data);
        break;

      case 'connect':
        if (packet.qs)
          data = packet.qs;
        break;

      case 'ack':
        data = packet.ackId
          + (packet.args && packet.args.length
              ? '+' + JSON.stringify(packet.args) : '');
        break;
    }

    // construct packet with required fragments
    var encoded = [
        type
      , id + (ack == 'data' ? '+' : '')
      , endpoint
    ];

    // data fragment is optional
    if (data !== null && data !== undefined)
      encoded.push(data);

    return encoded.join(':');
  };

  /**
   * Encodes multiple messages (payload).
   *
   * @param {Array} messages
   * @api private
   */

  parser.encodePayload = function (packets) {
    var decoded = '';

    if (packets.length == 1)
      return packets[0];

    for (var i = 0, l = packets.length; i < l; i++) {
      var packet = packets[i];
      decoded += '\ufffd' + packet.length + '\ufffd' + packets[i];
    }

    return decoded;
  };

  /**
   * Decodes a packet
   *
   * @api private
   */

  var regexp = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;

  parser.decodePacket = function (data) {
    var pieces = data.match(regexp);

    if (!pieces) return {};

    var id = pieces[2] || ''
      , data = pieces[5] || ''
      , packet = {
            type: packets[pieces[1]]
          , endpoint: pieces[4] || ''
        };

    // whether we need to acknowledge the packet
    if (id) {
      packet.id = id;
      if (pieces[3])
        packet.ack = 'data';
      else
        packet.ack = true;
    }

    // handle different packet types
    switch (packet.type) {
      case 'error':
        var pieces = data.split('+');
        packet.reason = reasons[pieces[0]] || '';
        packet.advice = advice[pieces[1]] || '';
        break;

      case 'message':
        packet.data = data || '';
        break;

      case 'event':
        try {
          var opts = JSON.parse(data);
          packet.name = opts.name;
          packet.args = opts.args;
        } catch (e) { }

        packet.args = packet.args || [];
        break;

      case 'json':
        try {
          packet.data = JSON.parse(data);
        } catch (e) { }
        break;

      case 'connect':
        packet.qs = data || '';
        break;

      case 'ack':
        var pieces = data.match(/^([0-9]+)(\+)?(.*)/);
        if (pieces) {
          packet.ackId = pieces[1];
          packet.args = [];

          if (pieces[3]) {
            try {
              packet.args = pieces[3] ? JSON.parse(pieces[3]) : [];
            } catch (e) { }
          }
        }
        break;

      case 'disconnect':
      case 'heartbeat':
        break;
    };

    return packet;
  };

  /**
   * Decodes data payload. Detects multiple messages
   *
   * @return {Array} messages
   * @api public
   */

  parser.decodePayload = function (data) {
    // IE doesn't like data[i] for unicode chars, charAt works fine
    if (data.charAt(0) == '\ufffd') {
      var ret = [];

      for (var i = 1, length = ''; i < data.length; i++) {
        if (data.charAt(i) == '\ufffd') {
          ret.push(parser.decodePacket(data.substr(i + 1).substr(0, length)));
          i += Number(length) + 1;
          length = '';
        } else {
          length += data.charAt(i);
        }
      }

      return ret;
    } else {
      return [parser.decodePacket(data)];
    }
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.Transport = Transport;

  /**
   * This is the transport template for all supported transport methods.
   *
   * @constructor
   * @api public
   */

  function Transport (socket, sessid) {
    this.socket = socket;
    this.sessid = sessid;
  };

  /**
   * Apply EventEmitter mixin.
   */

  io.util.mixin(Transport, io.EventEmitter);


  /**
   * Indicates whether heartbeats is enabled for this transport
   *
   * @api private
   */

  Transport.prototype.heartbeats = function () {
    return true;
  };

  /**
   * Handles the response from the server. When a new response is received
   * it will automatically update the timeout, decode the message and
   * forwards the response to the onMessage function for further processing.
   *
   * @param {String} data Response from the server.
   * @api private
   */

  Transport.prototype.onData = function (data) {
    this.clearCloseTimeout();

    // If the connection in currently open (or in a reopening state) reset the close
    // timeout since we have just received data. This check is necessary so
    // that we don't reset the timeout on an explicitly disconnected connection.
    if (this.socket.connected || this.socket.connecting || this.socket.reconnecting) {
      this.setCloseTimeout();
    }

    if (data !== '') {
      // todo: we should only do decodePayload for xhr transports
      var msgs = io.parser.decodePayload(data);

      if (msgs && msgs.length) {
        for (var i = 0, l = msgs.length; i < l; i++) {
          this.onPacket(msgs[i]);
        }
      }
    }

    return this;
  };

  /**
   * Handles packets.
   *
   * @api private
   */

  Transport.prototype.onPacket = function (packet) {
    this.socket.setHeartbeatTimeout();

    if (packet.type == 'heartbeat') {
      return this.onHeartbeat();
    }

    if (packet.type == 'connect' && packet.endpoint == '') {
      this.onConnect();
    }

    if (packet.type == 'error' && packet.advice == 'reconnect') {
      this.isOpen = false;
    }

    this.socket.onPacket(packet);

    return this;
  };

  /**
   * Sets close timeout
   *
   * @api private
   */

  Transport.prototype.setCloseTimeout = function () {
    if (!this.closeTimeout) {
      var self = this;

      this.closeTimeout = setTimeout(function () {
        self.onDisconnect();
      }, this.socket.closeTimeout);
    }
  };

  /**
   * Called when transport disconnects.
   *
   * @api private
   */

  Transport.prototype.onDisconnect = function () {
    if (this.isOpen) this.close();
    this.clearTimeouts();
    this.socket.onDisconnect();
    return this;
  };

  /**
   * Called when transport connects
   *
   * @api private
   */

  Transport.prototype.onConnect = function () {
    this.socket.onConnect();
    return this;
  };

  /**
   * Clears close timeout
   *
   * @api private
   */

  Transport.prototype.clearCloseTimeout = function () {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
  };

  /**
   * Clear timeouts
   *
   * @api private
   */

  Transport.prototype.clearTimeouts = function () {
    this.clearCloseTimeout();

    if (this.reopenTimeout) {
      clearTimeout(this.reopenTimeout);
    }
  };

  /**
   * Sends a packet
   *
   * @param {Object} packet object.
   * @api private
   */

  Transport.prototype.packet = function (packet) {
    this.send(io.parser.encodePacket(packet));
  };

  /**
   * Send the received heartbeat message back to server. So the server
   * knows we are still connected.
   *
   * @param {String} heartbeat Heartbeat response from the server.
   * @api private
   */

  Transport.prototype.onHeartbeat = function (heartbeat) {
    this.packet({ type: 'heartbeat' });
  };

  /**
   * Called when the transport opens.
   *
   * @api private
   */

  Transport.prototype.onOpen = function () {
    this.isOpen = true;
    this.clearCloseTimeout();
    this.socket.onOpen();
  };

  /**
   * Notifies the base when the connection with the Socket.IO server
   * has been disconnected.
   *
   * @api private
   */

  Transport.prototype.onClose = function () {
    var self = this;

    /* FIXME: reopen delay causing a infinit loop
    this.reopenTimeout = setTimeout(function () {
      self.open();
    }, this.socket.options['reopen delay']);*/

    this.isOpen = false;
    this.socket.onClose();
    this.onDisconnect();
  };

  /**
   * Generates a connection url based on the Socket.IO URL Protocol.
   * See <https://github.com/learnboost/socket.io-node/> for more details.
   *
   * @returns {String} Connection url
   * @api private
   */

  Transport.prototype.prepareUrl = function () {
    var options = this.socket.options;

    return this.scheme() + '://'
      + options.host + ':' + options.port + '/'
      + options.resource + '/' + io.protocol
      + '/' + this.name + '/' + this.sessid;
  };

  /**
   * Checks if the transport is ready to start a connection.
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  Transport.prototype.ready = function (socket, fn) {
    fn.call(this);
  };
})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   */

  exports.Socket = Socket;

  /**
   * Create a new `Socket.IO client` which can establish a persistent
   * connection with a Socket.IO enabled server.
   *
   * @api public
   */

  function Socket (options) {
    this.options = {
        port: 80
      , secure: false
      , document: 'document' in global ? document : false
      , resource: 'socket.io'
      , transports: io.transports
      , 'connect timeout': 10000
      , 'try multiple transports': true
      , 'reconnect': true
      , 'reconnection delay': 500
      , 'reconnection limit': Infinity
      , 'reopen delay': 3000
      , 'max reconnection attempts': 10
      , 'sync disconnect on unload': false
      , 'auto connect': true
      , 'flash policy port': 10843
      , 'manualFlush': false
    };

    io.util.merge(this.options, options);

    this.connected = false;
    this.open = false;
    this.connecting = false;
    this.reconnecting = false;
    this.namespaces = {};
    this.buffer = [];
    this.doBuffer = false;

    if (this.options['sync disconnect on unload'] &&
        (!this.isXDomain() || io.util.ua.hasCORS)) {
      var self = this;
      io.util.on(global, 'beforeunload', function () {
        self.disconnectSync();
      }, false);
    }

    if (this.options['auto connect']) {
      this.connect();
    }
};

  /**
   * Apply EventEmitter mixin.
   */

  io.util.mixin(Socket, io.EventEmitter);

  /**
   * Returns a namespace listener/emitter for this socket
   *
   * @api public
   */

  Socket.prototype.of = function (name) {
    if (!this.namespaces[name]) {
      this.namespaces[name] = new io.SocketNamespace(this, name);

      if (name !== '') {
        this.namespaces[name].packet({ type: 'connect' });
      }
    }

    return this.namespaces[name];
  };

  /**
   * Emits the given event to the Socket and all namespaces
   *
   * @api private
   */

  Socket.prototype.publish = function () {
    this.emit.apply(this, arguments);

    var nsp;

    for (var i in this.namespaces) {
      if (this.namespaces.hasOwnProperty(i)) {
        nsp = this.of(i);
        nsp.$emit.apply(nsp, arguments);
      }
    }
  };

  /**
   * Performs the handshake
   *
   * @api private
   */

  function empty () { };

  Socket.prototype.handshake = function (fn) {
    var self = this
      , options = this.options;

    function complete (data) {
      if (data instanceof Error) {
        self.connecting = false;
        self.onError(data.message);
      } else {
        fn.apply(null, data.split(':'));
      }
    };

    var url = [
          'http' + (options.secure ? 's' : '') + ':/'
        , options.host + ':' + options.port
        , options.resource
        , io.protocol
        , io.util.query(this.options.query, 't=' + +new Date)
      ].join('/');

    if (this.isXDomain() && !io.util.ua.hasCORS) {
      var insertAt = document.getElementsByTagName('script')[0]
        , script = document.createElement('script');

      script.src = url + '&jsonp=' + io.j.length;
      insertAt.parentNode.insertBefore(script, insertAt);

      io.j.push(function (data) {
        complete(data);
        script.parentNode.removeChild(script);
      });
    } else {
      var xhr = io.util.request();

      xhr.open('GET', url, true);
      if (this.isXDomain()) {
        xhr.withCredentials = true;
      }
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          xhr.onreadystatechange = empty;

          if (xhr.status == 200) {
            complete(xhr.responseText);
          } else if (xhr.status == 403) {
            self.onError(xhr.responseText);
          } else {
            self.connecting = false;            
            !self.reconnecting && self.onError(xhr.responseText);
          }
        }
      };
      xhr.send(null);
    }
  };

  /**
   * Find an available transport based on the options supplied in the constructor.
   *
   * @api private
   */

  Socket.prototype.getTransport = function (override) {
    var transports = override || this.transports, match;

    for (var i = 0, transport; transport = transports[i]; i++) {
      if (io.Transport[transport]
        && io.Transport[transport].check(this)
        && (!this.isXDomain() || io.Transport[transport].xdomainCheck(this))) {
        return new io.Transport[transport](this, this.sessionid);
      }
    }

    return null;
  };

  /**
   * Connects to the server.
   *
   * @param {Function} [fn] Callback.
   * @returns {io.Socket}
   * @api public
   */

  Socket.prototype.connect = function (fn) {
    if (this.connecting) {
      return this;
    }

    var self = this;
    self.connecting = true;
    
    this.handshake(function (sid, heartbeat, close, transports) {
      self.sessionid = sid;
      self.closeTimeout = close * 1000;
      self.heartbeatTimeout = heartbeat * 1000;
      if(!self.transports)
          self.transports = self.origTransports = (transports ? io.util.intersect(
              transports.split(',')
            , self.options.transports
          ) : self.options.transports);

      self.setHeartbeatTimeout();

      function connect (transports){
        if (self.transport) self.transport.clearTimeouts();

        self.transport = self.getTransport(transports);
        if (!self.transport) return self.publish('connect_failed');

        // once the transport is ready
        self.transport.ready(self, function () {
          self.connecting = true;
          self.publish('connecting', self.transport.name);
          self.transport.open();

          if (self.options['connect timeout']) {
            self.connectTimeoutTimer = setTimeout(function () {
              if (!self.connected) {
                self.connecting = false;

                if (self.options['try multiple transports']) {
                  var remaining = self.transports;

                  while (remaining.length > 0 && remaining.splice(0,1)[0] !=
                         self.transport.name) {}

                    if (remaining.length){
                      connect(remaining);
                    } else {
                      self.publish('connect_failed');
                    }
                }
              }
            }, self.options['connect timeout']);
          }
        });
      }

      connect(self.transports);

      self.once('connect', function (){
        clearTimeout(self.connectTimeoutTimer);

        fn && typeof fn == 'function' && fn();
      });
    });

    return this;
  };

  /**
   * Clears and sets a new heartbeat timeout using the value given by the
   * server during the handshake.
   *
   * @api private
   */

  Socket.prototype.setHeartbeatTimeout = function () {
    clearTimeout(this.heartbeatTimeoutTimer);
    if(this.transport && !this.transport.heartbeats()) return;

    var self = this;
    this.heartbeatTimeoutTimer = setTimeout(function () {
      self.transport.onClose();
    }, this.heartbeatTimeout);
  };

  /**
   * Sends a message.
   *
   * @param {Object} data packet.
   * @returns {io.Socket}
   * @api public
   */

  Socket.prototype.packet = function (data) {
    if (this.connected && !this.doBuffer) {
      this.transport.packet(data);
    } else {
      this.buffer.push(data);
    }

    return this;
  };

  /**
   * Sets buffer state
   *
   * @api private
   */

  Socket.prototype.setBuffer = function (v) {
    this.doBuffer = v;

    if (!v && this.connected && this.buffer.length) {
      if (!this.options['manualFlush']) {
        this.flushBuffer();
      }
    }
  };

  /**
   * Flushes the buffer data over the wire.
   * To be invoked manually when 'manualFlush' is set to true.
   *
   * @api public
   */

  Socket.prototype.flushBuffer = function() {
    this.transport.payload(this.buffer);
    this.buffer = [];
  };
  

  /**
   * Disconnect the established connect.
   *
   * @returns {io.Socket}
   * @api public
   */

  Socket.prototype.disconnect = function () {
    if (this.connected || this.connecting) {
      if (this.open) {
        this.of('').packet({ type: 'disconnect' });
      }

      // handle disconnection immediately
      this.onDisconnect('booted');
    }

    return this;
  };

  /**
   * Disconnects the socket with a sync XHR.
   *
   * @api private
   */

  Socket.prototype.disconnectSync = function () {
    // ensure disconnection
    var xhr = io.util.request();
    var uri = [
        'http' + (this.options.secure ? 's' : '') + ':/'
      , this.options.host + ':' + this.options.port
      , this.options.resource
      , io.protocol
      , ''
      , this.sessionid
    ].join('/') + '/?disconnect=1';

    xhr.open('GET', uri, false);
    xhr.send(null);

    // handle disconnection immediately
    this.onDisconnect('booted');
  };

  /**
   * Check if we need to use cross domain enabled transports. Cross domain would
   * be a different port or different domain name.
   *
   * @returns {Boolean}
   * @api private
   */

  Socket.prototype.isXDomain = function () {

    var port = global.location.port ||
      ('https:' == global.location.protocol ? 443 : 80);

    return this.options.host !== global.location.hostname 
      || this.options.port != port;
  };

  /**
   * Called upon handshake.
   *
   * @api private
   */

  Socket.prototype.onConnect = function () {
    if (!this.connected) {
      this.connected = true;
      this.connecting = false;
      if (!this.doBuffer) {
        // make sure to flush the buffer
        this.setBuffer(false);
      }
      this.emit('connect');
    }
  };

  /**
   * Called when the transport opens
   *
   * @api private
   */

  Socket.prototype.onOpen = function () {
    this.open = true;
  };

  /**
   * Called when the transport closes.
   *
   * @api private
   */

  Socket.prototype.onClose = function () {
    this.open = false;
    clearTimeout(this.heartbeatTimeoutTimer);
  };

  /**
   * Called when the transport first opens a connection
   *
   * @param text
   */

  Socket.prototype.onPacket = function (packet) {
    this.of(packet.endpoint).onPacket(packet);
  };

  /**
   * Handles an error.
   *
   * @api private
   */

  Socket.prototype.onError = function (err) {
    if (err && err.advice) {
      if (err.advice === 'reconnect' && (this.connected || this.connecting)) {
        this.disconnect();
        if (this.options.reconnect) {
          this.reconnect();
        }
      }
    }

    this.publish('error', err && err.reason ? err.reason : err);
  };

  /**
   * Called when the transport disconnects.
   *
   * @api private
   */

  Socket.prototype.onDisconnect = function (reason) {
    var wasConnected = this.connected
      , wasConnecting = this.connecting;

    this.connected = false;
    this.connecting = false;
    this.open = false;

    if (wasConnected || wasConnecting) {
      this.transport.close();
      this.transport.clearTimeouts();
      if (wasConnected) {
        this.publish('disconnect', reason);

        if ('booted' != reason && this.options.reconnect && !this.reconnecting) {
          this.reconnect();
        }
      }
    }
  };

  /**
   * Called upon reconnection.
   *
   * @api private
   */

  Socket.prototype.reconnect = function () {
    this.reconnecting = true;
    this.reconnectionAttempts = 0;
    this.reconnectionDelay = this.options['reconnection delay'];

    var self = this
      , maxAttempts = this.options['max reconnection attempts']
      , tryMultiple = this.options['try multiple transports']
      , limit = this.options['reconnection limit'];

    function reset () {
      if (self.connected) {
        for (var i in self.namespaces) {
          if (self.namespaces.hasOwnProperty(i) && '' !== i) {
              self.namespaces[i].packet({ type: 'connect' });
          }
        }
        self.publish('reconnect', self.transport.name, self.reconnectionAttempts);
      }

      clearTimeout(self.reconnectionTimer);

      self.removeListener('connect_failed', maybeReconnect);
      self.removeListener('connect', maybeReconnect);

      self.reconnecting = false;

      delete self.reconnectionAttempts;
      delete self.reconnectionDelay;
      delete self.reconnectionTimer;
      delete self.redoTransports;

      self.options['try multiple transports'] = tryMultiple;
    };

    function maybeReconnect () {
      if (!self.reconnecting) {
        return;
      }

      if (self.connected) {
        return reset();
      };

      if (self.connecting && self.reconnecting) {
        return self.reconnectionTimer = setTimeout(maybeReconnect, 1000);
      }

      if (self.reconnectionAttempts++ >= maxAttempts) {
        if (!self.redoTransports) {
          self.on('connect_failed', maybeReconnect);
          self.options['try multiple transports'] = true;
          self.transports = self.origTransports;
          self.transport = self.getTransport();
          self.redoTransports = true;
          self.connect();
        } else {
          self.publish('reconnect_failed');
          reset();
        }
      } else {
        if (self.reconnectionDelay < limit) {
          self.reconnectionDelay *= 2; // exponential back off
        }

        self.connect();
        self.publish('reconnecting', self.reconnectionDelay, self.reconnectionAttempts);
        self.reconnectionTimer = setTimeout(maybeReconnect, self.reconnectionDelay);
      }
    };

    this.options['try multiple transports'] = false;
    this.reconnectionTimer = setTimeout(maybeReconnect, this.reconnectionDelay);

    this.on('connect', maybeReconnect);
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.SocketNamespace = SocketNamespace;

  /**
   * Socket namespace constructor.
   *
   * @constructor
   * @api public
   */

  function SocketNamespace (socket, name) {
    this.socket = socket;
    this.name = name || '';
    this.flags = {};
    this.json = new Flag(this, 'json');
    this.ackPackets = 0;
    this.acks = {};
  };

  /**
   * Apply EventEmitter mixin.
   */

  io.util.mixin(SocketNamespace, io.EventEmitter);

  /**
   * Copies emit since we override it
   *
   * @api private
   */

  SocketNamespace.prototype.$emit = io.EventEmitter.prototype.emit;

  /**
   * Creates a new namespace, by proxying the request to the socket. This
   * allows us to use the synax as we do on the server.
   *
   * @api public
   */

  SocketNamespace.prototype.of = function () {
    return this.socket.of.apply(this.socket, arguments);
  };

  /**
   * Sends a packet.
   *
   * @api private
   */

  SocketNamespace.prototype.packet = function (packet) {
    packet.endpoint = this.name;
    this.socket.packet(packet);
    this.flags = {};
    return this;
  };

  /**
   * Sends a message
   *
   * @api public
   */

  SocketNamespace.prototype.send = function (data, fn) {
    var packet = {
        type: this.flags.json ? 'json' : 'message'
      , data: data
    };

    if ('function' == typeof fn) {
      packet.id = ++this.ackPackets;
      packet.ack = true;
      this.acks[packet.id] = fn;
    }

    return this.packet(packet);
  };

  /**
   * Emits an event
   *
   * @api public
   */
  
  SocketNamespace.prototype.emit = function (name) {
    var args = Array.prototype.slice.call(arguments, 1)
      , lastArg = args[args.length - 1]
      , packet = {
            type: 'event'
          , name: name
        };

    if ('function' == typeof lastArg) {
      packet.id = ++this.ackPackets;
      packet.ack = 'data';
      this.acks[packet.id] = lastArg;
      args = args.slice(0, args.length - 1);
    }

    packet.args = args;

    return this.packet(packet);
  };

  /**
   * Disconnects the namespace
   *
   * @api private
   */

  SocketNamespace.prototype.disconnect = function () {
    if (this.name === '') {
      this.socket.disconnect();
    } else {
      this.packet({ type: 'disconnect' });
      this.$emit('disconnect');
    }

    return this;
  };

  /**
   * Handles a packet
   *
   * @api private
   */

  SocketNamespace.prototype.onPacket = function (packet) {
    var self = this;

    function ack () {
      self.packet({
          type: 'ack'
        , args: io.util.toArray(arguments)
        , ackId: packet.id
      });
    };

    switch (packet.type) {
      case 'connect':
        this.$emit('connect');
        break;

      case 'disconnect':
        if (this.name === '') {
          this.socket.onDisconnect(packet.reason || 'booted');
        } else {
          this.$emit('disconnect', packet.reason);
        }
        break;

      case 'message':
      case 'json':
        var params = ['message', packet.data];

        if (packet.ack == 'data') {
          params.push(ack);
        } else if (packet.ack) {
          this.packet({ type: 'ack', ackId: packet.id });
        }

        this.$emit.apply(this, params);
        break;

      case 'event':
        var params = [packet.name].concat(packet.args);

        if (packet.ack == 'data')
          params.push(ack);

        this.$emit.apply(this, params);
        break;

      case 'ack':
        if (this.acks[packet.ackId]) {
          this.acks[packet.ackId].apply(this, packet.args);
          delete this.acks[packet.ackId];
        }
        break;

      case 'error':
        if (packet.advice){
          this.socket.onError(packet);
        } else {
          if (packet.reason == 'unauthorized') {
            this.$emit('connect_failed', packet.reason);
          } else {
            this.$emit('error', packet.reason);
          }
        }
        break;
    }
  };

  /**
   * Flag interface.
   *
   * @api private
   */

  function Flag (nsp, name) {
    this.namespace = nsp;
    this.name = name;
  };

  /**
   * Send a message
   *
   * @api public
   */

  Flag.prototype.send = function () {
    this.namespace.flags[this.name] = true;
    this.namespace.send.apply(this.namespace, arguments);
  };

  /**
   * Emit an event
   *
   * @api public
   */

  Flag.prototype.emit = function () {
    this.namespace.flags[this.name] = true;
    this.namespace.emit.apply(this.namespace, arguments);
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   */

  exports.websocket = WS;

  /**
   * The WebSocket transport uses the HTML5 WebSocket API to establish an
   * persistent connection with the Socket.IO server. This transport will also
   * be inherited by the FlashSocket fallback as it provides a API compatible
   * polyfill for the WebSockets.
   *
   * @constructor
   * @extends {io.Transport}
   * @api public
   */

  function WS (socket) {
    io.Transport.apply(this, arguments);
  };

  /**
   * Inherits from Transport.
   */

  io.util.inherit(WS, io.Transport);

  /**
   * Transport name
   *
   * @api public
   */

  WS.prototype.name = 'websocket';

  /**
   * Initializes a new `WebSocket` connection with the Socket.IO server. We attach
   * all the appropriate listeners to handle the responses from the server.
   *
   * @returns {Transport}
   * @api public
   */

  WS.prototype.open = function () {
    var query = io.util.query(this.socket.options.query)
      , self = this
      , Socket


    if (!Socket) {
      Socket = global.MozWebSocket || global.WebSocket;
    }

    this.websocket = new Socket(this.prepareUrl() + query);

    this.websocket.onopen = function () {
      self.onOpen();
      self.socket.setBuffer(false);
    };
    this.websocket.onmessage = function (ev) {
      self.onData(ev.data);
    };
    this.websocket.onclose = function () {
      self.onClose();
      self.socket.setBuffer(true);
    };
    this.websocket.onerror = function (e) {
      self.onError(e);
    };

    return this;
  };

  /**
   * Send a message to the Socket.IO server. The message will automatically be
   * encoded in the correct message format.
   *
   * @returns {Transport}
   * @api public
   */

  // Do to a bug in the current IDevices browser, we need to wrap the send in a 
  // setTimeout, when they resume from sleeping the browser will crash if 
  // we don't allow the browser time to detect the socket has been closed
  if (io.util.ua.iDevice) {
    WS.prototype.send = function (data) {
      var self = this;
      setTimeout(function() {
         self.websocket.send(data);
      },0);
      return this;
    };
  } else {
    WS.prototype.send = function (data) {
      this.websocket.send(data);
      return this;
    };
  }

  /**
   * Payload
   *
   * @api private
   */

  WS.prototype.payload = function (arr) {
    for (var i = 0, l = arr.length; i < l; i++) {
      this.packet(arr[i]);
    }
    return this;
  };

  /**
   * Disconnect the established `WebSocket` connection.
   *
   * @returns {Transport}
   * @api public
   */

  WS.prototype.close = function () {
    this.websocket.close();
    return this;
  };

  /**
   * Handle the errors that `WebSocket` might be giving when we
   * are attempting to connect or send messages.
   *
   * @param {Error} e The error.
   * @api private
   */

  WS.prototype.onError = function (e) {
    this.socket.onError(e);
  };

  /**
   * Returns the appropriate scheme for the URI generation.
   *
   * @api private
   */
  WS.prototype.scheme = function () {
    return this.socket.options.secure ? 'wss' : 'ws';
  };

  /**
   * Checks if the browser has support for native `WebSockets` and that
   * it's not the polyfill created for the FlashSocket transport.
   *
   * @return {Boolean}
   * @api public
   */

  WS.check = function () {
    return ('WebSocket' in global && !('__addTask' in WebSocket))
          || 'MozWebSocket' in global;
  };

  /**
   * Check if the `WebSocket` transport support cross domain communications.
   *
   * @returns {Boolean}
   * @api public
   */

  WS.xdomainCheck = function () {
    return true;
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('websocket');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.flashsocket = Flashsocket;

  /**
   * The FlashSocket transport. This is a API wrapper for the HTML5 WebSocket
   * specification. It uses a .swf file to communicate with the server. If you want
   * to serve the .swf file from a other server than where the Socket.IO script is
   * coming from you need to use the insecure version of the .swf. More information
   * about this can be found on the github page.
   *
   * @constructor
   * @extends {io.Transport.websocket}
   * @api public
   */

  function Flashsocket () {
    io.Transport.websocket.apply(this, arguments);
  };

  /**
   * Inherits from Transport.
   */

  io.util.inherit(Flashsocket, io.Transport.websocket);

  /**
   * Transport name
   *
   * @api public
   */

  Flashsocket.prototype.name = 'flashsocket';

  /**
   * Disconnect the established `FlashSocket` connection. This is done by adding a 
   * new task to the FlashSocket. The rest will be handled off by the `WebSocket` 
   * transport.
   *
   * @returns {Transport}
   * @api public
   */

  Flashsocket.prototype.open = function () {
    var self = this
      , args = arguments;

    WebSocket.__addTask(function () {
      io.Transport.websocket.prototype.open.apply(self, args);
    });
    return this;
  };
  
  /**
   * Sends a message to the Socket.IO server. This is done by adding a new
   * task to the FlashSocket. The rest will be handled off by the `WebSocket` 
   * transport.
   *
   * @returns {Transport}
   * @api public
   */

  Flashsocket.prototype.send = function () {
    var self = this, args = arguments;
    WebSocket.__addTask(function () {
      io.Transport.websocket.prototype.send.apply(self, args);
    });
    return this;
  };

  /**
   * Disconnects the established `FlashSocket` connection.
   *
   * @returns {Transport}
   * @api public
   */

  Flashsocket.prototype.close = function () {
    WebSocket.__tasks.length = 0;
    io.Transport.websocket.prototype.close.call(this);
    return this;
  };

  /**
   * The WebSocket fall back needs to append the flash container to the body
   * element, so we need to make sure we have access to it. Or defer the call
   * until we are sure there is a body element.
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  Flashsocket.prototype.ready = function (socket, fn) {
    function init () {
      var options = socket.options
        , port = options['flash policy port']
        , path = [
              'http' + (options.secure ? 's' : '') + ':/'
            , options.host + ':' + options.port
            , options.resource
            , 'static/flashsocket'
            , 'WebSocketMain' + (socket.isXDomain() ? 'Insecure' : '') + '.swf'
          ];

      // Only start downloading the swf file when the checked that this browser
      // actually supports it
      if (!Flashsocket.loaded) {
        if (typeof WEB_SOCKET_SWF_LOCATION === 'undefined') {
          // Set the correct file based on the XDomain settings
          WEB_SOCKET_SWF_LOCATION = path.join('/');
        }

        if (port !== 843) {
          WebSocket.loadFlashPolicyFile('xmlsocket://' + options.host + ':' + port);
        }

        WebSocket.__initialize();
        Flashsocket.loaded = true;
      }

      fn.call(self);
    }

    var self = this;
    if (document.body) return init();

    io.util.load(init);
  };

  /**
   * Check if the FlashSocket transport is supported as it requires that the Adobe
   * Flash Player plug-in version `10.0.0` or greater is installed. And also check if
   * the polyfill is correctly loaded.
   *
   * @returns {Boolean}
   * @api public
   */

  Flashsocket.check = function () {
    if (
        typeof WebSocket == 'undefined'
      || !('__initialize' in WebSocket) || !swfobject
    ) return false;

    return swfobject.getFlashPlayerVersion().major >= 10;
  };

  /**
   * Check if the FlashSocket transport can be used as cross domain / cross origin 
   * transport. Because we can't see which type (secure or insecure) of .swf is used
   * we will just return true.
   *
   * @returns {Boolean}
   * @api public
   */

  Flashsocket.xdomainCheck = function () {
    return true;
  };

  /**
   * Disable AUTO_INITIALIZATION
   */

  if (typeof window != 'undefined') {
    WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = true;
  }

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('flashsocket');
})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);
/*	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
if ('undefined' != typeof window) {
var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O[(['Active'].concat('Object').join('X'))]!=D){try{var ad=new window[(['Active'].concat('Object').join('X'))](W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?(['Active'].concat('').join('X')):"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();
}
// Copyright: Hiroshi Ichikawa <http://gimite.net/en/>
// License: New BSD License
// Reference: http://dev.w3.org/html5/websockets/
// Reference: http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol

(function() {
  
  if ('undefined' == typeof window || window.WebSocket) return;

  var console = window.console;
  if (!console || !console.log || !console.error) {
    console = {log: function(){ }, error: function(){ }};
  }
  
  if (!swfobject.hasFlashPlayerVersion("10.0.0")) {
    console.error("Flash Player >= 10.0.0 is required.");
    return;
  }
  if (location.protocol == "file:") {
    console.error(
      "WARNING: web-socket-js doesn't work in file:///... URL " +
      "unless you set Flash Security Settings properly. " +
      "Open the page via Web server i.e. http://...");
  }

  /**
   * This class represents a faux web socket.
   * @param {string} url
   * @param {array or string} protocols
   * @param {string} proxyHost
   * @param {int} proxyPort
   * @param {string} headers
   */
  WebSocket = function(url, protocols, proxyHost, proxyPort, headers) {
    var self = this;
    self.__id = WebSocket.__nextId++;
    WebSocket.__instances[self.__id] = self;
    self.readyState = WebSocket.CONNECTING;
    self.bufferedAmount = 0;
    self.__events = {};
    if (!protocols) {
      protocols = [];
    } else if (typeof protocols == "string") {
      protocols = [protocols];
    }
    // Uses setTimeout() to make sure __createFlash() runs after the caller sets ws.onopen etc.
    // Otherwise, when onopen fires immediately, onopen is called before it is set.
    setTimeout(function() {
      WebSocket.__addTask(function() {
        WebSocket.__flash.create(
            self.__id, url, protocols, proxyHost || null, proxyPort || 0, headers || null);
      });
    }, 0);
  };

  /**
   * Send data to the web socket.
   * @param {string} data  The data to send to the socket.
   * @return {boolean}  True for success, false for failure.
   */
  WebSocket.prototype.send = function(data) {
    if (this.readyState == WebSocket.CONNECTING) {
      throw "INVALID_STATE_ERR: Web Socket connection has not been established";
    }
    // We use encodeURIComponent() here, because FABridge doesn't work if
    // the argument includes some characters. We don't use escape() here
    // because of this:
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Functions#escape_and_unescape_Functions
    // But it looks decodeURIComponent(encodeURIComponent(s)) doesn't
    // preserve all Unicode characters either e.g. "\uffff" in Firefox.
    // Note by wtritch: Hopefully this will not be necessary using ExternalInterface.  Will require
    // additional testing.
    var result = WebSocket.__flash.send(this.__id, encodeURIComponent(data));
    if (result < 0) { // success
      return true;
    } else {
      this.bufferedAmount += result;
      return false;
    }
  };

  /**
   * Close this web socket gracefully.
   */
  WebSocket.prototype.close = function() {
    if (this.readyState == WebSocket.CLOSED || this.readyState == WebSocket.CLOSING) {
      return;
    }
    this.readyState = WebSocket.CLOSING;
    WebSocket.__flash.close(this.__id);
  };

  /**
   * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
   *
   * @param {string} type
   * @param {function} listener
   * @param {boolean} useCapture
   * @return void
   */
  WebSocket.prototype.addEventListener = function(type, listener, useCapture) {
    if (!(type in this.__events)) {
      this.__events[type] = [];
    }
    this.__events[type].push(listener);
  };

  /**
   * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
   *
   * @param {string} type
   * @param {function} listener
   * @param {boolean} useCapture
   * @return void
   */
  WebSocket.prototype.removeEventListener = function(type, listener, useCapture) {
    if (!(type in this.__events)) return;
    var events = this.__events[type];
    for (var i = events.length - 1; i >= 0; --i) {
      if (events[i] === listener) {
        events.splice(i, 1);
        break;
      }
    }
  };

  /**
   * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
   *
   * @param {Event} event
   * @return void
   */
  WebSocket.prototype.dispatchEvent = function(event) {
    var events = this.__events[event.type] || [];
    for (var i = 0; i < events.length; ++i) {
      events[i](event);
    }
    var handler = this["on" + event.type];
    if (handler) handler(event);
  };

  /**
   * Handles an event from Flash.
   * @param {Object} flashEvent
   */
  WebSocket.prototype.__handleEvent = function(flashEvent) {
    if ("readyState" in flashEvent) {
      this.readyState = flashEvent.readyState;
    }
    if ("protocol" in flashEvent) {
      this.protocol = flashEvent.protocol;
    }
    
    var jsEvent;
    if (flashEvent.type == "open" || flashEvent.type == "error") {
      jsEvent = this.__createSimpleEvent(flashEvent.type);
    } else if (flashEvent.type == "close") {
      // TODO implement jsEvent.wasClean
      jsEvent = this.__createSimpleEvent("close");
    } else if (flashEvent.type == "message") {
      var data = decodeURIComponent(flashEvent.message);
      jsEvent = this.__createMessageEvent("message", data);
    } else {
      throw "unknown event type: " + flashEvent.type;
    }
    
    this.dispatchEvent(jsEvent);
  };
  
  WebSocket.prototype.__createSimpleEvent = function(type) {
    if (document.createEvent && window.Event) {
      var event = document.createEvent("Event");
      event.initEvent(type, false, false);
      return event;
    } else {
      return {type: type, bubbles: false, cancelable: false};
    }
  };
  
  WebSocket.prototype.__createMessageEvent = function(type, data) {
    if (document.createEvent && window.MessageEvent && !window.opera) {
      var event = document.createEvent("MessageEvent");
      event.initMessageEvent("message", false, false, data, null, null, window, null);
      return event;
    } else {
      // IE and Opera, the latter one truncates the data parameter after any 0x00 bytes.
      return {type: type, data: data, bubbles: false, cancelable: false};
    }
  };
  
  /**
   * Define the WebSocket readyState enumeration.
   */
  WebSocket.CONNECTING = 0;
  WebSocket.OPEN = 1;
  WebSocket.CLOSING = 2;
  WebSocket.CLOSED = 3;

  WebSocket.__flash = null;
  WebSocket.__instances = {};
  WebSocket.__tasks = [];
  WebSocket.__nextId = 0;
  
  /**
   * Load a new flash security policy file.
   * @param {string} url
   */
  WebSocket.loadFlashPolicyFile = function(url){
    WebSocket.__addTask(function() {
      WebSocket.__flash.loadManualPolicyFile(url);
    });
  };

  /**
   * Loads WebSocketMain.swf and creates WebSocketMain object in Flash.
   */
  WebSocket.__initialize = function() {
    if (WebSocket.__flash) return;
    
    if (WebSocket.__swfLocation) {
      // For backword compatibility.
      window.WEB_SOCKET_SWF_LOCATION = WebSocket.__swfLocation;
    }
    if (!window.WEB_SOCKET_SWF_LOCATION) {
      console.error("[WebSocket] set WEB_SOCKET_SWF_LOCATION to location of WebSocketMain.swf");
      return;
    }
    var container = document.createElement("div");
    container.id = "webSocketContainer";
    // Hides Flash box. We cannot use display: none or visibility: hidden because it prevents
    // Flash from loading at least in IE. So we move it out of the screen at (-100, -100).
    // But this even doesn't work with Flash Lite (e.g. in Droid Incredible). So with Flash
    // Lite, we put it at (0, 0). This shows 1x1 box visible at left-top corner but this is
    // the best we can do as far as we know now.
    container.style.position = "absolute";
    if (WebSocket.__isFlashLite()) {
      container.style.left = "0px";
      container.style.top = "0px";
    } else {
      container.style.left = "-100px";
      container.style.top = "-100px";
    }
    var holder = document.createElement("div");
    holder.id = "webSocketFlash";
    container.appendChild(holder);
    document.body.appendChild(container);
    // See this article for hasPriority:
    // http://help.adobe.com/en_US/as3/mobile/WS4bebcd66a74275c36cfb8137124318eebc6-7ffd.html
    swfobject.embedSWF(
      WEB_SOCKET_SWF_LOCATION,
      "webSocketFlash",
      "1" /* width */,
      "1" /* height */,
      "10.0.0" /* SWF version */,
      null,
      null,
      {hasPriority: true, swliveconnect : true, allowScriptAccess: "always"},
      null,
      function(e) {
        if (!e.success) {
          console.error("[WebSocket] swfobject.embedSWF failed");
        }
      });
  };
  
  /**
   * Called by Flash to notify JS that it's fully loaded and ready
   * for communication.
   */
  WebSocket.__onFlashInitialized = function() {
    // We need to set a timeout here to avoid round-trip calls
    // to flash during the initialization process.
    setTimeout(function() {
      WebSocket.__flash = document.getElementById("webSocketFlash");
      WebSocket.__flash.setCallerUrl(location.href);
      WebSocket.__flash.setDebug(!!window.WEB_SOCKET_DEBUG);
      for (var i = 0; i < WebSocket.__tasks.length; ++i) {
        WebSocket.__tasks[i]();
      }
      WebSocket.__tasks = [];
    }, 0);
  };
  
  /**
   * Called by Flash to notify WebSockets events are fired.
   */
  WebSocket.__onFlashEvent = function() {
    setTimeout(function() {
      try {
        // Gets events using receiveEvents() instead of getting it from event object
        // of Flash event. This is to make sure to keep message order.
        // It seems sometimes Flash events don't arrive in the same order as they are sent.
        var events = WebSocket.__flash.receiveEvents();
        for (var i = 0; i < events.length; ++i) {
          WebSocket.__instances[events[i].webSocketId].__handleEvent(events[i]);
        }
      } catch (e) {
        console.error(e);
      }
    }, 0);
    return true;
  };
  
  // Called by Flash.
  WebSocket.__log = function(message) {
    console.log(decodeURIComponent(message));
  };
  
  // Called by Flash.
  WebSocket.__error = function(message) {
    console.error(decodeURIComponent(message));
  };
  
  WebSocket.__addTask = function(task) {
    if (WebSocket.__flash) {
      task();
    } else {
      WebSocket.__tasks.push(task);
    }
  };
  
  /**
   * Test if the browser is running flash lite.
   * @return {boolean} True if flash lite is running, false otherwise.
   */
  WebSocket.__isFlashLite = function() {
    if (!window.navigator || !window.navigator.mimeTypes) {
      return false;
    }
    var mimeType = window.navigator.mimeTypes["application/x-shockwave-flash"];
    if (!mimeType || !mimeType.enabledPlugin || !mimeType.enabledPlugin.filename) {
      return false;
    }
    return mimeType.enabledPlugin.filename.match(/flashlite/i) ? true : false;
  };
  
  if (!window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION) {
    if (window.addEventListener) {
      window.addEventListener("load", function(){
        WebSocket.__initialize();
      }, false);
    } else {
      window.attachEvent("onload", function(){
        WebSocket.__initialize();
      });
    }
  }
  
})();

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   *
   * @api public
   */

  exports.XHR = XHR;

  /**
   * XHR constructor
   *
   * @costructor
   * @api public
   */

  function XHR (socket) {
    if (!socket) return;

    io.Transport.apply(this, arguments);
    this.sendBuffer = [];
  };

  /**
   * Inherits from Transport.
   */

  io.util.inherit(XHR, io.Transport);

  /**
   * Establish a connection
   *
   * @returns {Transport}
   * @api public
   */

  XHR.prototype.open = function () {
    this.socket.setBuffer(false);
    this.onOpen();
    this.get();

    // we need to make sure the request succeeds since we have no indication
    // whether the request opened or not until it succeeded.
    this.setCloseTimeout();

    return this;
  };

  /**
   * Check if we need to send data to the Socket.IO server, if we have data in our
   * buffer we encode it and forward it to the `post` method.
   *
   * @api private
   */

  XHR.prototype.payload = function (payload) {
    var msgs = [];

    for (var i = 0, l = payload.length; i < l; i++) {
      msgs.push(io.parser.encodePacket(payload[i]));
    }

    this.send(io.parser.encodePayload(msgs));
  };

  /**
   * Send data to the Socket.IO server.
   *
   * @param data The message
   * @returns {Transport}
   * @api public
   */

  XHR.prototype.send = function (data) {
    this.post(data);
    return this;
  };

  /**
   * Posts a encoded message to the Socket.IO server.
   *
   * @param {String} data A encoded message.
   * @api private
   */

  function empty () { };

  XHR.prototype.post = function (data) {
    var self = this;
    this.socket.setBuffer(true);

    function stateChange () {
      if (this.readyState == 4) {
        this.onreadystatechange = empty;
        self.posting = false;

        if (this.status == 200){
          self.socket.setBuffer(false);
        } else {
          self.onClose();
        }
      }
    }

    function onload () {
      this.onload = empty;
      self.socket.setBuffer(false);
    };

    this.sendXHR = this.request('POST');

    if (global.XDomainRequest && this.sendXHR instanceof XDomainRequest) {
      this.sendXHR.onload = this.sendXHR.onerror = onload;
    } else {
      this.sendXHR.onreadystatechange = stateChange;
    }

    this.sendXHR.send(data);
  };

  /**
   * Disconnects the established `XHR` connection.
   *
   * @returns {Transport}
   * @api public
   */

  XHR.prototype.close = function () {
    this.onClose();
    return this;
  };

  /**
   * Generates a configured XHR request
   *
   * @param {String} url The url that needs to be requested.
   * @param {String} method The method the request should use.
   * @returns {XMLHttpRequest}
   * @api private
   */

  XHR.prototype.request = function (method) {
    var req = io.util.request(this.socket.isXDomain())
      , query = io.util.query(this.socket.options.query, 't=' + +new Date);

    req.open(method || 'GET', this.prepareUrl() + query, true);

    if (method == 'POST') {
      try {
        if (req.setRequestHeader) {
          req.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        } else {
          // XDomainRequest
          req.contentType = 'text/plain';
        }
      } catch (e) {}
    }

    return req;
  };

  /**
   * Returns the scheme to use for the transport URLs.
   *
   * @api private
   */

  XHR.prototype.scheme = function () {
    return this.socket.options.secure ? 'https' : 'http';
  };

  /**
   * Check if the XHR transports are supported
   *
   * @param {Boolean} xdomain Check if we support cross domain requests.
   * @returns {Boolean}
   * @api public
   */

  XHR.check = function (socket, xdomain) {
    try {
      var request = io.util.request(xdomain),
          usesXDomReq = (global.XDomainRequest && request instanceof XDomainRequest),
          socketProtocol = (socket && socket.options && socket.options.secure ? 'https:' : 'http:'),
          isXProtocol = (global.location && socketProtocol != global.location.protocol);
      if (request && !(usesXDomReq && isXProtocol)) {
        return true;
      }
    } catch(e) {}

    return false;
  };

  /**
   * Check if the XHR transport supports cross domain requests.
   *
   * @returns {Boolean}
   * @api public
   */

  XHR.xdomainCheck = function (socket) {
    return XHR.check(socket, true);
  };

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.htmlfile = HTMLFile;

  /**
   * The HTMLFile transport creates a `forever iframe` based transport
   * for Internet Explorer. Regular forever iframe implementations will 
   * continuously trigger the browsers buzy indicators. If the forever iframe
   * is created inside a `htmlfile` these indicators will not be trigged.
   *
   * @constructor
   * @extends {io.Transport.XHR}
   * @api public
   */

  function HTMLFile (socket) {
    io.Transport.XHR.apply(this, arguments);
  };

  /**
   * Inherits from XHR transport.
   */

  io.util.inherit(HTMLFile, io.Transport.XHR);

  /**
   * Transport name
   *
   * @api public
   */

  HTMLFile.prototype.name = 'htmlfile';

  /**
   * Creates a new Ac...eX `htmlfile` with a forever loading iframe
   * that can be used to listen to messages. Inside the generated
   * `htmlfile` a reference will be made to the HTMLFile transport.
   *
   * @api private
   */

  HTMLFile.prototype.get = function () {
    this.doc = new window[(['Active'].concat('Object').join('X'))]('htmlfile');
    this.doc.open();
    this.doc.write('<html></html>');
    this.doc.close();
    this.doc.parentWindow.s = this;

    var iframeC = this.doc.createElement('div');
    iframeC.className = 'socketio';

    this.doc.body.appendChild(iframeC);
    this.iframe = this.doc.createElement('iframe');

    iframeC.appendChild(this.iframe);

    var self = this
      , query = io.util.query(this.socket.options.query, 't='+ +new Date);

    this.iframe.src = this.prepareUrl() + query;

    io.util.on(window, 'unload', function () {
      self.destroy();
    });
  };

  /**
   * The Socket.IO server will write script tags inside the forever
   * iframe, this function will be used as callback for the incoming
   * information.
   *
   * @param {String} data The message
   * @param {document} doc Reference to the context
   * @api private
   */

  HTMLFile.prototype._ = function (data, doc) {
    this.onData(data);
    try {
      var script = doc.getElementsByTagName('script')[0];
      script.parentNode.removeChild(script);
    } catch (e) { }
  };

  /**
   * Destroy the established connection, iframe and `htmlfile`.
   * And calls the `CollectGarbage` function of Internet Explorer
   * to release the memory.
   *
   * @api private
   */

  HTMLFile.prototype.destroy = function () {
    if (this.iframe){
      try {
        this.iframe.src = 'about:blank';
      } catch(e){}

      this.doc = null;
      this.iframe.parentNode.removeChild(this.iframe);
      this.iframe = null;

      CollectGarbage();
    }
  };

  /**
   * Disconnects the established connection.
   *
   * @returns {Transport} Chaining.
   * @api public
   */

  HTMLFile.prototype.close = function () {
    this.destroy();
    return io.Transport.XHR.prototype.close.call(this);
  };

  /**
   * Checks if the browser supports this transport. The browser
   * must have an `Ac...eXObject` implementation.
   *
   * @return {Boolean}
   * @api public
   */

  HTMLFile.check = function (socket) {
    if (typeof window != "undefined" && (['Active'].concat('Object').join('X')) in window){
      try {
        var a = new window[(['Active'].concat('Object').join('X'))]('htmlfile');
        return a && io.Transport.XHR.check(socket);
      } catch(e){}
    }
    return false;
  };

  /**
   * Check if cross domain requests are supported.
   *
   * @returns {Boolean}
   * @api public
   */

  HTMLFile.xdomainCheck = function () {
    // we can probably do handling for sub-domains, we should
    // test that it's cross domain but a subdomain here
    return false;
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('htmlfile');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   */

  exports['xhr-polling'] = XHRPolling;

  /**
   * The XHR-polling transport uses long polling XHR requests to create a
   * "persistent" connection with the server.
   *
   * @constructor
   * @api public
   */

  function XHRPolling () {
    io.Transport.XHR.apply(this, arguments);
  };

  /**
   * Inherits from XHR transport.
   */

  io.util.inherit(XHRPolling, io.Transport.XHR);

  /**
   * Merge the properties from XHR transport
   */

  io.util.merge(XHRPolling, io.Transport.XHR);

  /**
   * Transport name
   *
   * @api public
   */

  XHRPolling.prototype.name = 'xhr-polling';

  /**
   * Indicates whether heartbeats is enabled for this transport
   *
   * @api private
   */

  XHRPolling.prototype.heartbeats = function () {
    return false;
  };

  /** 
   * Establish a connection, for iPhone and Android this will be done once the page
   * is loaded.
   *
   * @returns {Transport} Chaining.
   * @api public
   */

  XHRPolling.prototype.open = function () {
    var self = this;

    io.Transport.XHR.prototype.open.call(self);
    return false;
  };

  /**
   * Starts a XHR request to wait for incoming messages.
   *
   * @api private
   */

  function empty () {};

  XHRPolling.prototype.get = function () {
    if (!this.isOpen) return;

    var self = this;

    function stateChange () {
      if (this.readyState == 4) {
        this.onreadystatechange = empty;

        if (this.status == 200) {
          self.onData(this.responseText);
          self.get();
        } else {
          self.onClose();
        }
      }
    };

    function onload () {
      this.onload = empty;
      this.onerror = empty;
      self.retryCounter = 1;
      self.onData(this.responseText);
      self.get();
    };

    function onerror () {
      self.retryCounter ++;
      if(!self.retryCounter || self.retryCounter > 3) {
        self.onClose();  
      } else {
        self.get();
      }
    };

    this.xhr = this.request();

    if (global.XDomainRequest && this.xhr instanceof XDomainRequest) {
      this.xhr.onload = onload;
      this.xhr.onerror = onerror;
    } else {
      this.xhr.onreadystatechange = stateChange;
    }

    this.xhr.send(null);
  };

  /**
   * Handle the unclean close behavior.
   *
   * @api private
   */

  XHRPolling.prototype.onClose = function () {
    io.Transport.XHR.prototype.onClose.call(this);

    if (this.xhr) {
      this.xhr.onreadystatechange = this.xhr.onload = this.xhr.onerror = empty;
      try {
        this.xhr.abort();
      } catch(e){}
      this.xhr = null;
    }
  };

  /**
   * Webkit based browsers show a infinit spinner when you start a XHR request
   * before the browsers onload event is called so we need to defer opening of
   * the transport until the onload event is called. Wrapping the cb in our
   * defer method solve this.
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  XHRPolling.prototype.ready = function (socket, fn) {
    var self = this;

    io.util.defer(function () {
      fn.call(self);
    });
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('xhr-polling');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {
  /**
   * There is a way to hide the loading indicator in Firefox. If you create and
   * remove a iframe it will stop showing the current loading indicator.
   * Unfortunately we can't feature detect that and UA sniffing is evil.
   *
   * @api private
   */

  var indicator = global.document && "MozAppearance" in
    global.document.documentElement.style;

  /**
   * Expose constructor.
   */

  exports['jsonp-polling'] = JSONPPolling;

  /**
   * The JSONP transport creates an persistent connection by dynamically
   * inserting a script tag in the page. This script tag will receive the
   * information of the Socket.IO server. When new information is received
   * it creates a new script tag for the new data stream.
   *
   * @constructor
   * @extends {io.Transport.xhr-polling}
   * @api public
   */

  function JSONPPolling (socket) {
    io.Transport['xhr-polling'].apply(this, arguments);

    this.index = io.j.length;

    var self = this;

    io.j.push(function (msg) {
      self._(msg);
    });
  };

  /**
   * Inherits from XHR polling transport.
   */

  io.util.inherit(JSONPPolling, io.Transport['xhr-polling']);

  /**
   * Transport name
   *
   * @api public
   */

  JSONPPolling.prototype.name = 'jsonp-polling';

  /**
   * Posts a encoded message to the Socket.IO server using an iframe.
   * The iframe is used because script tags can create POST based requests.
   * The iframe is positioned outside of the view so the user does not
   * notice it's existence.
   *
   * @param {String} data A encoded message.
   * @api private
   */

  JSONPPolling.prototype.post = function (data) {
    var self = this
      , query = io.util.query(
             this.socket.options.query
          , 't='+ (+new Date) + '&i=' + this.index
        );

    if (!this.form) {
      var form = document.createElement('form')
        , area = document.createElement('textarea')
        , id = this.iframeId = 'socketio_iframe_' + this.index
        , iframe;

      form.className = 'socketio';
      form.style.position = 'absolute';
      form.style.top = '0px';
      form.style.left = '0px';
      form.style.display = 'none';
      form.target = id;
      form.method = 'POST';
      form.setAttribute('accept-charset', 'utf-8');
      area.name = 'd';
      form.appendChild(area);
      document.body.appendChild(form);

      this.form = form;
      this.area = area;
    }

    this.form.action = this.prepareUrl() + query;

    function complete () {
      initIframe();
      self.socket.setBuffer(false);
    };

    function initIframe () {
      if (self.iframe) {
        self.form.removeChild(self.iframe);
      }

      try {
        // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
        iframe = document.createElement('<iframe name="'+ self.iframeId +'">');
      } catch (e) {
        iframe = document.createElement('iframe');
        iframe.name = self.iframeId;
      }

      iframe.id = self.iframeId;

      self.form.appendChild(iframe);
      self.iframe = iframe;
    };

    initIframe();

    // we temporarily stringify until we figure out how to prevent
    // browsers from turning `\n` into `\r\n` in form inputs
    this.area.value = io.JSON.stringify(data);

    try {
      this.form.submit();
    } catch(e) {}

    if (this.iframe.attachEvent) {
      iframe.onreadystatechange = function () {
        if (self.iframe.readyState == 'complete') {
          complete();
        }
      };
    } else {
      this.iframe.onload = complete;
    }

    this.socket.setBuffer(true);
  };

  /**
   * Creates a new JSONP poll that can be used to listen
   * for messages from the Socket.IO server.
   *
   * @api private
   */

  JSONPPolling.prototype.get = function () {
    var self = this
      , script = document.createElement('script')
      , query = io.util.query(
             this.socket.options.query
          , 't='+ (+new Date) + '&i=' + this.index
        );

    if (this.script) {
      this.script.parentNode.removeChild(this.script);
      this.script = null;
    }

    script.async = true;
    script.src = this.prepareUrl() + query;
    script.onerror = function () {
      self.onClose();
    };

    var insertAt = document.getElementsByTagName('script')[0];
    insertAt.parentNode.insertBefore(script, insertAt);
    this.script = script;

    if (indicator) {
      setTimeout(function () {
        var iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        document.body.removeChild(iframe);
      }, 100);
    }
  };

  /**
   * Callback function for the incoming message stream from the Socket.IO server.
   *
   * @param {String} data The message
   * @api private
   */

  JSONPPolling.prototype._ = function (msg) {
    this.onData(msg);
    if (this.isOpen) {
      this.get();
    }
    return this;
  };

  /**
   * The indicator hack only works after onload
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  JSONPPolling.prototype.ready = function (socket, fn) {
    var self = this;
    if (!indicator) return fn.call(this);

    io.util.load(function () {
      fn.call(self);
    });
  };

  /**
   * Checks if browser supports this transport.
   *
   * @return {Boolean}
   * @api public
   */

  JSONPPolling.check = function () {
    return 'document' in global;
  };

  /**
   * Check if cross domain requests are supported
   *
   * @returns {Boolean}
   * @api public
   */

  JSONPPolling.xdomainCheck = function () {
    return true;
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('jsonp-polling');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);

if (typeof define === "function" && define.amd) {
  define([], function () { return io; });
}
})();
})(window)
},{}],3:[function(require,module,exports){
var through = require('through')

function getElement(el) {
  if ('string' === typeof el)
    return document.querySelector(el)
  return el
}

//for things like CRDT, we want this to read from elements that already exist,
//OR are emitted.
// var write = es.write.bind(es); seq.each(write); es.on('update', write);
// ^ works like that

exports.read = 
exports.reader =
exports.readable = function (el, events) {
  el = getElement(el)

  var ts = through()
  ts.writable = false
  ts.write = null
  var listeners = {}

  function add(event, listener) {
    listener = listeners[event] = listener 
      ? listener.bind(ts)
      : function (e) {
        ts.queue(e);
      }
    el.addEventListener(event, listener, false)
  }

  //also allow events to be a single stream, etc.
  for(var k in events)
    add(k, events[k])

  ts.on('close', function () {
    for(var k in listeners) 
    el.removeEventListener(k, listeners[k])
  })

  return ts
}

function get (data, key) {
  return 'function' == typeof data.get
    ? data.get(key)
    : data[key]
}

var defaults = {
  id: function (data) {
    return get(data,'id') || 'id_'+(''+Math.random()).substring(2)
  },
  sort: function (a, b) {
    return get(a, '_sort') - get(b, '_sort')
  },
  delete: function (data) {
    return get(data, '_delete')
  },
  template: function (data) {
    var el = document.createElement('pre')
    el.innerText = JSON.stringify(data)
    return el
  },
  clear: function (data) {
    return data === 'CLEAR'
  }
}

function merge (o, d) {
  var r = {}
  for (var k in d)
    r[k] = o[k] || d[k]
  return r
}

function getById (el, id) {
  return el.querySelector 
    ? el.querySelector('#'+id)
    : document.getElementById(id)
}

exports.write = 
exports.writer = 
exports.writable = function (el, opts) {
  el = getElement(el)
  opts = opts || {}
  
  var t = 'function' === typeof opts 
    ? {template: opts}
    : opts

  t = merge(t, defaults)
  var objects = {}

  function orderedInsert(el, ch) {
    var length = el.childElementCount
    var c = 0

    function insert (parent, el, i) {
      if(i == parent.childElementCount)
        parent.appendChild(el)
      else
        parent.insertBefore(el, parent.children[i])
    }

    function cmp(k) {
      var _id = el.children[k].id
      return opts.sort(objects[ch.id], objects[_id])
    }

    function between (i, j) {
      if(c ++ > 20)
        return
      if(i > j) throw new Error('broken:'+i+','+j)
      if(i === j)
        return insert(el, ch, j)
      //select index to split on
      var k = ~~((i + j) / 2)
    
      if(cmp(k) > 0)
        between(k + 1, j)
      else
        between(i, k)
      return
    }
    if(length === 0) {
      insert(el, ch, 0)
    } else
      between(0, length)
  }

  var ts = through (function (data) {
    if(t.clear(data))
      return ts.clear()

    //see if an element already exists with this id.
    var id = t.id(data)
    var _ch = id && getById(el, id)

    //returning false indicates to remove the item.
    if(t.delete(data) && _ch) {
      delete objects[id]
      return el.removeChild(_ch)
    }

    //create update
    var ch = t.template.call(_ch, data)
    //if the template did not add a id,

    //the template just updated the element, do not replace it.
    if(ch === _ch) return

    //set the id.
    if(ch && !ch.id && id) ch.id = id
    //check if there is an old element with the same id.
    if(!_ch && ch.id) _ch = getById(id)
    objects[id] = data

    //replace needs to check if the sort has changed...
    //just remove the old child, and insert new one.

    if(!opts.sort) {
      if(ch && _ch && ch !== _ch)
        el.replaceChild(ch, _ch)
      else
        el.appendChild(ch)
    } else {
      if(ch && _ch)
        return el.removeChild(_ch), orderedInsert(el, ch)
      else
        orderedInsert(el, ch)
    }
    ts.queue(ch)
  }, function () {
    ts.queue(null)
  })

  ts.sort = function (cmp) {
    opts.sort = cmp
    var a = []
    // remove all elements and add them back.
    // there is probably a better way to do this, 
    // only removing items which are out of order.
    // what is the best algorithm to sort a linked list?
    while(el.childElementCount > 1)
      a.push(el.firstChild), el.removeChild(el.firstChild)
    a.forEach(function (ch) {
      orderedInsert(el, ch)
    })
  }

  ts.clear = function () {
    el.textContent = ""
    bottom = null
    objects = {}
    this.resume()
    return
  }
  return ts
}

//DO SOMETHING WITH THIS STUFF!

function getMax() {
  return window.scrollY + window.innerHeight
}

function getBottom(ch) {
  return ch.offsetTop + ch.clientHeight
}

function pause () {
  // make a stream that just 
  // pauses when something is written off the screen.
}

// TODO, make this sort items!
// 

/*
  //make this a separate stream...
  //that will be important when playing
  //tracks off services with loads of stuff
  //such as youtube.
  var  max = getMax(), bottom = null, ts
  window.addEventListener('scroll', function () {
    max = getMax()
    if(bottom && max > getBottom(bottom) - 1)
      ts.resume()
  })
  window.addEventListener('resize', function () {
    max = getMax()
    if(bottom && max > getBottom(bottom) - 1)
      ts.resume()
  })
*/


},{"through":4}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(require,module,exports){
(function(process){var Stream = require('stream')

// through
//
// a stream that does nothing but re-emit the input.
// useful for aggregating a series of changing but not ending streams into one stream)



exports = module.exports = through
through.through = through

//create a readable writable stream.

function through (write, end) {
  write = write || function (data) { this.emit('data', data) }
  end = end || function () { this.emit('end') }

  var ended = false, destroyed = false
  var stream = new Stream(), buffer = []
  stream.buffer = buffer
  stream.readable = stream.writable = true
  stream.paused = false
  stream.write = function (data) {
    write.call(this, data)
    return !stream.paused
  }

  function drain() {
    while(buffer.length && !stream.paused) {
      var data = buffer.shift()
      if(null === data)
        return stream.emit('end')
      else
        stream.emit('data', data)
    }
  }

  stream.queue = function (data) {
    buffer.push(data)
    drain()
  }

  //this will be registered as the first 'end' listener
  //must call destroy next tick, to make sure we're after any
  //stream piped from here.
  //this is only a problem if end is not emitted synchronously.
  //a nicer way to do this is to make sure this is the last listener for 'end'

  stream.on('end', function () {
    stream.readable = false
    if(!stream.writable)
      process.nextTick(function () {
        stream.destroy()
      })
  })

  function _end () {
    stream.writable = false
    end.call(stream)
    if(!stream.readable)
      stream.destroy()
  }

  stream.end = function (data) {
    if(ended) return
    ended = true
    if(arguments.length) stream.write(data)
    _end() // will emit or queue
  }

  stream.destroy = function () {
    if(destroyed) return
    destroyed = true
    ended = true
    buffer.length = 0
    stream.writable = stream.readable = false
    stream.emit('close')
  }

  stream.pause = function () {
    if(stream.paused) return
    stream.paused = true
    stream.emit('pause')
  }
  stream.resume = function () {
    if(stream.paused) {
      stream.paused = false
    }
    drain()
    //may have become paused again,
    //as drain emits 'data'.
    if(!stream.paused)
      stream.emit('drain')
  }
  return stream
}


})(require("__browserify_process"))
},{"stream":6,"__browserify_process":5}],6:[function(require,module,exports){
var events = require('events');
var util = require('util');

function Stream() {
  events.EventEmitter.call(this);
}
util.inherits(Stream, events.EventEmitter);
module.exports = Stream;
// Backwards-compat with node 0.4.x
Stream.Stream = Stream;

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once, and
  // only when all sources have ended.
  if (!dest._isStdio && (!options || options.end !== false)) {
    dest._pipeCount = dest._pipeCount || 0;
    dest._pipeCount++;

    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest._pipeCount--;

    // remove the listeners
    cleanup();

    if (dest._pipeCount > 0) {
      // waiting for other incoming streams to end.
      return;
    }

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest._pipeCount--;

    // remove the listeners
    cleanup();

    if (dest._pipeCount > 0) {
      // waiting for other incoming streams to end.
      return;
    }

    dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (this.listeners('error').length === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('end', cleanup);
    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('end', cleanup);
  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":7,"util":8}],7:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":5}],8:[function(require,module,exports){
var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
}


function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

},{"events":7}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXNrL3NvdXJjZS92b3hlbC1zZXJ2ZXItdGVzdC9pbmRleC5qcyIsIi9Vc2Vycy9jaHJpc2svc291cmNlL3ZveGVsLXNlcnZlci10ZXN0L25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L2Rpc3Qvc29ja2V0LmlvLmpzIiwiL1VzZXJzL2Nocmlzay9zb3VyY2Uvdm94ZWwtc2VydmVyLXRlc3Qvbm9kZV9tb2R1bGVzL2VsLXN0cmVhbW8vaW5kZXguanMiLCIvVXNlcnMvY2hyaXNrL25wbS9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL1VzZXJzL2Nocmlzay9zb3VyY2Uvdm94ZWwtc2VydmVyLXRlc3Qvbm9kZV9tb2R1bGVzL2VsLXN0cmVhbW8vbm9kZV9tb2R1bGVzL3Rocm91Z2gvaW5kZXguanMiLCIvVXNlcnMvY2hyaXNrL25wbS9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9idWlsdGluL3N0cmVhbS5qcyIsIi9Vc2Vycy9jaHJpc2svbnBtL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2J1aWx0aW4vZXZlbnRzLmpzIiwiL1VzZXJzL2Nocmlzay9ucG0vbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXJlc29sdmUvYnVpbHRpbi91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMveEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJcbnZhciBpbyA9IHJlcXVpcmUoJ3NvY2tldC5pby1jbGllbnQnKTtcbnZhciBlbHN0cmVhbW8gPSByZXF1aXJlKCdlbC1zdHJlYW1vJylcbnZhciBlbHN0cmVhbSA9IGVsc3RyZWFtby53cml0YWJsZSgnI21lc3NhZ2VzJylcbnZhciBzb2NrZXQgPSBpby5jb25uZWN0KCd3czovL2xvY2FsaG9zdDo4MDgwJyk7XG5zb2NrZXQub24oJ2lkJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcImlkXCIgKyBkYXRhKTtcbiAgICBlbHN0cmVhbS53cml0ZShcIlJlY2VpdmVkIGlkOlwiICsgZGF0YSlcbiAgICBzb2NrZXQuZW1pdCgndGVzdCcsIHsgbXk6ICdkYXRhJyB9KTtcbn0pO1xuXG4iLCIoZnVuY3Rpb24oZ2xvYmFsKXsvKiEgU29ja2V0LklPLmpzIGJ1aWxkOjAuOS4xMSwgZGV2ZWxvcG1lbnQuIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT4gTUlUIExpY2Vuc2VkICovXG5cbnZhciBpbyA9ICgndW5kZWZpbmVkJyA9PT0gdHlwZW9mIG1vZHVsZSA/IHt9IDogbW9kdWxlLmV4cG9ydHMpO1xuKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBnbG9iYWwpIHtcblxuICAvKipcbiAgICogSU8gbmFtZXNwYWNlLlxuICAgKlxuICAgKiBAbmFtZXNwYWNlXG4gICAqL1xuXG4gIHZhciBpbyA9IGV4cG9ydHM7XG5cbiAgLyoqXG4gICAqIFNvY2tldC5JTyB2ZXJzaW9uXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGlvLnZlcnNpb24gPSAnMC45LjExJztcblxuICAvKipcbiAgICogUHJvdG9jb2wgaW1wbGVtZW50ZWQuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGlvLnByb3RvY29sID0gMTtcblxuICAvKipcbiAgICogQXZhaWxhYmxlIHRyYW5zcG9ydHMsIHRoZXNlIHdpbGwgYmUgcG9wdWxhdGVkIHdpdGggdGhlIGF2YWlsYWJsZSB0cmFuc3BvcnRzXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGlvLnRyYW5zcG9ydHMgPSBbXTtcblxuICAvKipcbiAgICogS2VlcCB0cmFjayBvZiBqc29ucCBjYWxsYmFja3MuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBpby5qID0gW107XG5cbiAgLyoqXG4gICAqIEtlZXAgdHJhY2sgb2Ygb3VyIGlvLlNvY2tldHNcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuICBpby5zb2NrZXRzID0ge307XG5cblxuICAvKipcbiAgICogTWFuYWdlcyBjb25uZWN0aW9ucyB0byBob3N0cy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHVyaVxuICAgKiBAUGFyYW0ge0Jvb2xlYW59IGZvcmNlIGNyZWF0aW9uIG9mIG5ldyBzb2NrZXQgKGRlZmF1bHRzIHRvIGZhbHNlKVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBpby5jb25uZWN0ID0gZnVuY3Rpb24gKGhvc3QsIGRldGFpbHMpIHtcbiAgICB2YXIgdXJpID0gaW8udXRpbC5wYXJzZVVyaShob3N0KVxuICAgICAgLCB1dXJpXG4gICAgICAsIHNvY2tldDtcblxuICAgIGlmIChnbG9iYWwgJiYgZ2xvYmFsLmxvY2F0aW9uKSB7XG4gICAgICB1cmkucHJvdG9jb2wgPSB1cmkucHJvdG9jb2wgfHwgZ2xvYmFsLmxvY2F0aW9uLnByb3RvY29sLnNsaWNlKDAsIC0xKTtcbiAgICAgIHVyaS5ob3N0ID0gdXJpLmhvc3QgfHwgKGdsb2JhbC5kb2N1bWVudFxuICAgICAgICA/IGdsb2JhbC5kb2N1bWVudC5kb21haW4gOiBnbG9iYWwubG9jYXRpb24uaG9zdG5hbWUpO1xuICAgICAgdXJpLnBvcnQgPSB1cmkucG9ydCB8fCBnbG9iYWwubG9jYXRpb24ucG9ydDtcbiAgICB9XG5cbiAgICB1dXJpID0gaW8udXRpbC51bmlxdWVVcmkodXJpKTtcblxuICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICBob3N0OiB1cmkuaG9zdFxuICAgICAgLCBzZWN1cmU6ICdodHRwcycgPT0gdXJpLnByb3RvY29sXG4gICAgICAsIHBvcnQ6IHVyaS5wb3J0IHx8ICgnaHR0cHMnID09IHVyaS5wcm90b2NvbCA/IDQ0MyA6IDgwKVxuICAgICAgLCBxdWVyeTogdXJpLnF1ZXJ5IHx8ICcnXG4gICAgfTtcblxuICAgIGlvLnV0aWwubWVyZ2Uob3B0aW9ucywgZGV0YWlscyk7XG5cbiAgICBpZiAob3B0aW9uc1snZm9yY2UgbmV3IGNvbm5lY3Rpb24nXSB8fCAhaW8uc29ja2V0c1t1dXJpXSkge1xuICAgICAgc29ja2V0ID0gbmV3IGlvLlNvY2tldChvcHRpb25zKTtcbiAgICB9XG5cbiAgICBpZiAoIW9wdGlvbnNbJ2ZvcmNlIG5ldyBjb25uZWN0aW9uJ10gJiYgc29ja2V0KSB7XG4gICAgICBpby5zb2NrZXRzW3V1cmldID0gc29ja2V0O1xuICAgIH1cblxuICAgIHNvY2tldCA9IHNvY2tldCB8fCBpby5zb2NrZXRzW3V1cmldO1xuXG4gICAgLy8gaWYgcGF0aCBpcyBkaWZmZXJlbnQgZnJvbSAnJyBvciAvXG4gICAgcmV0dXJuIHNvY2tldC5vZih1cmkucGF0aC5sZW5ndGggPiAxID8gdXJpLnBhdGggOiAnJyk7XG4gIH07XG5cbn0pKCdvYmplY3QnID09PSB0eXBlb2YgbW9kdWxlID8gbW9kdWxlLmV4cG9ydHMgOiAodGhpcy5pbyA9IHt9KSwgdGhpcyk7XG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBnbG9iYWwpIHtcblxuICAvKipcbiAgICogVXRpbGl0aWVzIG5hbWVzcGFjZS5cbiAgICpcbiAgICogQG5hbWVzcGFjZVxuICAgKi9cblxuICB2YXIgdXRpbCA9IGV4cG9ydHMudXRpbCA9IHt9O1xuXG4gIC8qKlxuICAgKiBQYXJzZXMgYW4gVVJJXG4gICAqXG4gICAqIEBhdXRob3IgU3RldmVuIExldml0aGFuIDxzdGV2ZW5sZXZpdGhhbi5jb20+IChNSVQgbGljZW5zZSlcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdmFyIHJlID0gL14oPzooPyFbXjpAXSs6W146QFxcL10qQCkoW146XFwvPyMuXSspOik/KD86XFwvXFwvKT8oKD86KChbXjpAXSopKD86OihbXjpAXSopKT8pP0ApPyhbXjpcXC8/I10qKSg/OjooXFxkKikpPykoKChcXC8oPzpbXj8jXSg/IVtePyNcXC9dKlxcLltePyNcXC8uXSsoPzpbPyNdfCQpKSkqXFwvPyk/KFtePyNcXC9dKikpKD86XFw/KFteI10qKSk/KD86IyguKikpPykvO1xuXG4gIHZhciBwYXJ0cyA9IFsnc291cmNlJywgJ3Byb3RvY29sJywgJ2F1dGhvcml0eScsICd1c2VySW5mbycsICd1c2VyJywgJ3Bhc3N3b3JkJyxcbiAgICAgICAgICAgICAgICdob3N0JywgJ3BvcnQnLCAncmVsYXRpdmUnLCAncGF0aCcsICdkaXJlY3RvcnknLCAnZmlsZScsICdxdWVyeScsXG4gICAgICAgICAgICAgICAnYW5jaG9yJ107XG5cbiAgdXRpbC5wYXJzZVVyaSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICB2YXIgbSA9IHJlLmV4ZWMoc3RyIHx8ICcnKVxuICAgICAgLCB1cmkgPSB7fVxuICAgICAgLCBpID0gMTQ7XG5cbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICB1cmlbcGFydHNbaV1dID0gbVtpXSB8fCAnJztcbiAgICB9XG5cbiAgICByZXR1cm4gdXJpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQcm9kdWNlcyBhIHVuaXF1ZSB1cmwgdGhhdCBpZGVudGlmaWVzIGEgU29ja2V0LklPIGNvbm5lY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB1cmlcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC51bmlxdWVVcmkgPSBmdW5jdGlvbiAodXJpKSB7XG4gICAgdmFyIHByb3RvY29sID0gdXJpLnByb3RvY29sXG4gICAgICAsIGhvc3QgPSB1cmkuaG9zdFxuICAgICAgLCBwb3J0ID0gdXJpLnBvcnQ7XG5cbiAgICBpZiAoJ2RvY3VtZW50JyBpbiBnbG9iYWwpIHtcbiAgICAgIGhvc3QgPSBob3N0IHx8IGRvY3VtZW50LmRvbWFpbjtcbiAgICAgIHBvcnQgPSBwb3J0IHx8IChwcm90b2NvbCA9PSAnaHR0cHMnXG4gICAgICAgICYmIGRvY3VtZW50LmxvY2F0aW9uLnByb3RvY29sICE9PSAnaHR0cHM6JyA/IDQ0MyA6IGRvY3VtZW50LmxvY2F0aW9uLnBvcnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBob3N0ID0gaG9zdCB8fCAnbG9jYWxob3N0JztcblxuICAgICAgaWYgKCFwb3J0ICYmIHByb3RvY29sID09ICdodHRwcycpIHtcbiAgICAgICAgcG9ydCA9IDQ0MztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gKHByb3RvY29sIHx8ICdodHRwJykgKyAnOi8vJyArIGhvc3QgKyAnOicgKyAocG9ydCB8fCA4MCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIE1lcmdlc3QgMiBxdWVyeSBzdHJpbmdzIGluIHRvIG9uY2UgdW5pcXVlIHF1ZXJ5IHN0cmluZ1xuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gYmFzZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gYWRkaXRpb25cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC5xdWVyeSA9IGZ1bmN0aW9uIChiYXNlLCBhZGRpdGlvbikge1xuICAgIHZhciBxdWVyeSA9IHV0aWwuY2h1bmtRdWVyeShiYXNlIHx8ICcnKVxuICAgICAgLCBjb21wb25lbnRzID0gW107XG5cbiAgICB1dGlsLm1lcmdlKHF1ZXJ5LCB1dGlsLmNodW5rUXVlcnkoYWRkaXRpb24gfHwgJycpKTtcbiAgICBmb3IgKHZhciBwYXJ0IGluIHF1ZXJ5KSB7XG4gICAgICBpZiAocXVlcnkuaGFzT3duUHJvcGVydHkocGFydCkpIHtcbiAgICAgICAgY29tcG9uZW50cy5wdXNoKHBhcnQgKyAnPScgKyBxdWVyeVtwYXJ0XSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbXBvbmVudHMubGVuZ3RoID8gJz8nICsgY29tcG9uZW50cy5qb2luKCcmJykgOiAnJztcbiAgfTtcblxuICAvKipcbiAgICogVHJhbnNmb3JtcyBhIHF1ZXJ5c3RyaW5nIGluIHRvIGFuIG9iamVjdFxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcXNcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC5jaHVua1F1ZXJ5ID0gZnVuY3Rpb24gKHFzKSB7XG4gICAgdmFyIHF1ZXJ5ID0ge31cbiAgICAgICwgcGFyYW1zID0gcXMuc3BsaXQoJyYnKVxuICAgICAgLCBpID0gMFxuICAgICAgLCBsID0gcGFyYW1zLmxlbmd0aFxuICAgICAgLCBrdjtcblxuICAgIGZvciAoOyBpIDwgbDsgKytpKSB7XG4gICAgICBrdiA9IHBhcmFtc1tpXS5zcGxpdCgnPScpO1xuICAgICAgaWYgKGt2WzBdKSB7XG4gICAgICAgIHF1ZXJ5W2t2WzBdXSA9IGt2WzFdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBxdWVyeTtcbiAgfTtcblxuICAvKipcbiAgICogRXhlY3V0ZXMgdGhlIGdpdmVuIGZ1bmN0aW9uIHdoZW4gdGhlIHBhZ2UgaXMgbG9hZGVkLlxuICAgKlxuICAgKiAgICAgaW8udXRpbC5sb2FkKGZ1bmN0aW9uICgpIHsgY29uc29sZS5sb2coJ3BhZ2UgbG9hZGVkJyk7IH0pO1xuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB2YXIgcGFnZUxvYWRlZCA9IGZhbHNlO1xuXG4gIHV0aWwubG9hZCA9IGZ1bmN0aW9uIChmbikge1xuICAgIGlmICgnZG9jdW1lbnQnIGluIGdsb2JhbCAmJiBkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnIHx8IHBhZ2VMb2FkZWQpIHtcbiAgICAgIHJldHVybiBmbigpO1xuICAgIH1cblxuICAgIHV0aWwub24oZ2xvYmFsLCAnbG9hZCcsIGZuLCBmYWxzZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZHMgYW4gZXZlbnQuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICB1dGlsLm9uID0gZnVuY3Rpb24gKGVsZW1lbnQsIGV2ZW50LCBmbiwgY2FwdHVyZSkge1xuICAgIGlmIChlbGVtZW50LmF0dGFjaEV2ZW50KSB7XG4gICAgICBlbGVtZW50LmF0dGFjaEV2ZW50KCdvbicgKyBldmVudCwgZm4pO1xuICAgIH0gZWxzZSBpZiAoZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGZuLCBjYXB0dXJlKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlcyB0aGUgY29ycmVjdCBgWE1MSHR0cFJlcXVlc3RgIGZvciByZWd1bGFyIGFuZCBjcm9zcyBkb21haW4gcmVxdWVzdHMuXG4gICAqXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3hkb21haW5dIENyZWF0ZSBhIHJlcXVlc3QgdGhhdCBjYW4gYmUgdXNlZCBjcm9zcyBkb21haW4uXG4gICAqIEByZXR1cm5zIHtYTUxIdHRwUmVxdWVzdHxmYWxzZX0gSWYgd2UgY2FuIGNyZWF0ZSBhIFhNTEh0dHBSZXF1ZXN0LlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgdXRpbC5yZXF1ZXN0ID0gZnVuY3Rpb24gKHhkb21haW4pIHtcblxuICAgIGlmICh4ZG9tYWluICYmICd1bmRlZmluZWQnICE9IHR5cGVvZiBYRG9tYWluUmVxdWVzdCAmJiAhdXRpbC51YS5oYXNDT1JTKSB7XG4gICAgICByZXR1cm4gbmV3IFhEb21haW5SZXF1ZXN0KCk7XG4gICAgfVxuXG4gICAgaWYgKCd1bmRlZmluZWQnICE9IHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAmJiAoIXhkb21haW4gfHwgdXRpbC51YS5oYXNDT1JTKSkge1xuICAgICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIH1cblxuICAgIGlmICgheGRvbWFpbikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIG5ldyB3aW5kb3dbKFsnQWN0aXZlJ10uY29uY2F0KCdPYmplY3QnKS5qb2luKCdYJykpXSgnTWljcm9zb2Z0LlhNTEhUVFAnKTtcbiAgICAgIH0gY2F0Y2goZSkgeyB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgLyoqXG4gICAqIFhIUiBiYXNlZCB0cmFuc3BvcnQgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICAvKipcbiAgICogQ2hhbmdlIHRoZSBpbnRlcm5hbCBwYWdlTG9hZGVkIHZhbHVlLlxuICAgKi9cblxuICBpZiAoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIHdpbmRvdykge1xuICAgIHV0aWwubG9hZChmdW5jdGlvbiAoKSB7XG4gICAgICBwYWdlTG9hZGVkID0gdHJ1ZTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWZlcnMgYSBmdW5jdGlvbiB0byBlbnN1cmUgYSBzcGlubmVyIGlzIG5vdCBkaXNwbGF5ZWQgYnkgdGhlIGJyb3dzZXJcbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC5kZWZlciA9IGZ1bmN0aW9uIChmbikge1xuICAgIGlmICghdXRpbC51YS53ZWJraXQgfHwgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGltcG9ydFNjcmlwdHMpIHtcbiAgICAgIHJldHVybiBmbigpO1xuICAgIH1cblxuICAgIHV0aWwubG9hZChmdW5jdGlvbiAoKSB7XG4gICAgICBzZXRUaW1lb3V0KGZuLCAxMDApO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBNZXJnZXMgdHdvIG9iamVjdHMuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwubWVyZ2UgPSBmdW5jdGlvbiBtZXJnZSAodGFyZ2V0LCBhZGRpdGlvbmFsLCBkZWVwLCBsYXN0c2Vlbikge1xuICAgIHZhciBzZWVuID0gbGFzdHNlZW4gfHwgW11cbiAgICAgICwgZGVwdGggPSB0eXBlb2YgZGVlcCA9PSAndW5kZWZpbmVkJyA/IDIgOiBkZWVwXG4gICAgICAsIHByb3A7XG5cbiAgICBmb3IgKHByb3AgaW4gYWRkaXRpb25hbCkge1xuICAgICAgaWYgKGFkZGl0aW9uYWwuaGFzT3duUHJvcGVydHkocHJvcCkgJiYgdXRpbC5pbmRleE9mKHNlZW4sIHByb3ApIDwgMCkge1xuICAgICAgICBpZiAodHlwZW9mIHRhcmdldFtwcm9wXSAhPT0gJ29iamVjdCcgfHwgIWRlcHRoKSB7XG4gICAgICAgICAgdGFyZ2V0W3Byb3BdID0gYWRkaXRpb25hbFtwcm9wXTtcbiAgICAgICAgICBzZWVuLnB1c2goYWRkaXRpb25hbFtwcm9wXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdXRpbC5tZXJnZSh0YXJnZXRbcHJvcF0sIGFkZGl0aW9uYWxbcHJvcF0sIGRlcHRoIC0gMSwgc2Vlbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9O1xuXG4gIC8qKlxuICAgKiBNZXJnZXMgcHJvdG90eXBlcyBmcm9tIG9iamVjdHNcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC5taXhpbiA9IGZ1bmN0aW9uIChjdG9yLCBjdG9yMikge1xuICAgIHV0aWwubWVyZ2UoY3Rvci5wcm90b3R5cGUsIGN0b3IyLnByb3RvdHlwZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNob3J0Y3V0IGZvciBwcm90b3R5cGljYWwgYW5kIHN0YXRpYyBpbmhlcml0YW5jZS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIHV0aWwuaW5oZXJpdCA9IGZ1bmN0aW9uIChjdG9yLCBjdG9yMikge1xuICAgIGZ1bmN0aW9uIGYoKSB7fTtcbiAgICBmLnByb3RvdHlwZSA9IGN0b3IyLnByb3RvdHlwZTtcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBmO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIGdpdmVuIG9iamVjdCBpcyBhbiBBcnJheS5cbiAgICpcbiAgICogICAgIGlvLnV0aWwuaXNBcnJheShbXSk7IC8vIHRydWVcbiAgICogICAgIGlvLnV0aWwuaXNBcnJheSh7fSk7IC8vIGZhbHNlXG4gICAqXG4gICAqIEBwYXJhbSBPYmplY3Qgb2JqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwuaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcblxuICAvKipcbiAgICogSW50ZXJzZWN0cyB2YWx1ZXMgb2YgdHdvIGFycmF5cyBpbnRvIGEgdGhpcmRcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC5pbnRlcnNlY3QgPSBmdW5jdGlvbiAoYXJyLCBhcnIyKSB7XG4gICAgdmFyIHJldCA9IFtdXG4gICAgICAsIGxvbmdlc3QgPSBhcnIubGVuZ3RoID4gYXJyMi5sZW5ndGggPyBhcnIgOiBhcnIyXG4gICAgICAsIHNob3J0ZXN0ID0gYXJyLmxlbmd0aCA+IGFycjIubGVuZ3RoID8gYXJyMiA6IGFycjtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gc2hvcnRlc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAofnV0aWwuaW5kZXhPZihsb25nZXN0LCBzaG9ydGVzdFtpXSkpXG4gICAgICAgIHJldC5wdXNoKHNob3J0ZXN0W2ldKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xuICB9O1xuXG4gIC8qKlxuICAgKiBBcnJheSBpbmRleE9mIGNvbXBhdGliaWxpdHkuXG4gICAqXG4gICAqIEBzZWUgYml0Lmx5L2E1RHhhMlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB1dGlsLmluZGV4T2YgPSBmdW5jdGlvbiAoYXJyLCBvLCBpKSB7XG5cbiAgICBmb3IgKHZhciBqID0gYXJyLmxlbmd0aCwgaSA9IGkgPCAwID8gaSArIGogPCAwID8gMCA6IGkgKyBqIDogaSB8fCAwO1xuICAgICAgICAgaSA8IGogJiYgYXJyW2ldICE9PSBvOyBpKyspIHt9XG5cbiAgICByZXR1cm4gaiA8PSBpID8gLTEgOiBpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBlbnVtZXJhYmxlcyB0byBhcnJheS5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC50b0FycmF5ID0gZnVuY3Rpb24gKGVudSkge1xuICAgIHZhciBhcnIgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gZW51Lmxlbmd0aDsgaSA8IGw7IGkrKylcbiAgICAgIGFyci5wdXNoKGVudVtpXSk7XG5cbiAgICByZXR1cm4gYXJyO1xuICB9O1xuXG4gIC8qKlxuICAgKiBVQSAvIGVuZ2luZXMgZGV0ZWN0aW9uIG5hbWVzcGFjZS5cbiAgICpcbiAgICogQG5hbWVzcGFjZVxuICAgKi9cblxuICB1dGlsLnVhID0ge307XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIFVBIHN1cHBvcnRzIENPUlMgZm9yIFhIUi5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC51YS5oYXNDT1JTID0gJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICYmIChmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBhID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBhLndpdGhDcmVkZW50aWFscyAhPSB1bmRlZmluZWQ7XG4gIH0pKCk7XG5cbiAgLyoqXG4gICAqIERldGVjdCB3ZWJraXQuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwudWEud2Via2l0ID0gJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIG5hdmlnYXRvclxuICAgICYmIC93ZWJraXQvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG4gICAvKipcbiAgICogRGV0ZWN0IGlQYWQvaVBob25lL2lQb2QuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwudWEuaURldmljZSA9ICd1bmRlZmluZWQnICE9IHR5cGVvZiBuYXZpZ2F0b3JcbiAgICAgICYmIC9pUGFkfGlQaG9uZXxpUG9kL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcblxufSkoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUuZXhwb3J0cywgdGhpcyk7XG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBpbykge1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY29uc3RydWN0b3IuXG4gICAqL1xuXG4gIGV4cG9ydHMuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG4gIC8qKlxuICAgKiBFdmVudCBlbWl0dGVyIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpYy5cbiAgICovXG5cbiAgZnVuY3Rpb24gRXZlbnRFbWl0dGVyICgpIHt9O1xuXG4gIC8qKlxuICAgKiBBZGRzIGEgbGlzdGVuZXJcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChuYW1lLCBmbikge1xuICAgIGlmICghdGhpcy4kZXZlbnRzKSB7XG4gICAgICB0aGlzLiRldmVudHMgPSB7fTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuJGV2ZW50c1tuYW1lXSkge1xuICAgICAgdGhpcy4kZXZlbnRzW25hbWVdID0gZm47XG4gICAgfSBlbHNlIGlmIChpby51dGlsLmlzQXJyYXkodGhpcy4kZXZlbnRzW25hbWVdKSkge1xuICAgICAgdGhpcy4kZXZlbnRzW25hbWVdLnB1c2goZm4pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLiRldmVudHNbbmFtZV0gPSBbdGhpcy4kZXZlbnRzW25hbWVdLCBmbl07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XG5cbiAgLyoqXG4gICAqIEFkZHMgYSB2b2xhdGlsZSBsaXN0ZW5lci5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gKG5hbWUsIGZuKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gb24gKCkge1xuICAgICAgc2VsZi5yZW1vdmVMaXN0ZW5lcihuYW1lLCBvbik7XG4gICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBvbi5saXN0ZW5lciA9IGZuO1xuICAgIHRoaXMub24obmFtZSwgb24pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBsaXN0ZW5lci5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIChuYW1lLCBmbikge1xuICAgIGlmICh0aGlzLiRldmVudHMgJiYgdGhpcy4kZXZlbnRzW25hbWVdKSB7XG4gICAgICB2YXIgbGlzdCA9IHRoaXMuJGV2ZW50c1tuYW1lXTtcblxuICAgICAgaWYgKGlvLnV0aWwuaXNBcnJheShsaXN0KSkge1xuICAgICAgICB2YXIgcG9zID0gLTE7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGlmIChsaXN0W2ldID09PSBmbiB8fCAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBmbikpIHtcbiAgICAgICAgICAgIHBvcyA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zIDwgMCkge1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgbGlzdC5zcGxpY2UocG9zLCAxKTtcblxuICAgICAgICBpZiAoIWxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuJGV2ZW50c1tuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChsaXN0ID09PSBmbiB8fCAobGlzdC5saXN0ZW5lciAmJiBsaXN0Lmxpc3RlbmVyID09PSBmbikpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuJGV2ZW50c1tuYW1lXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogUmVtb3ZlcyBhbGwgbGlzdGVuZXJzIGZvciBhbiBldmVudC5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIGlmIChuYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuJGV2ZW50cyA9IHt9O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuJGV2ZW50cyAmJiB0aGlzLiRldmVudHNbbmFtZV0pIHtcbiAgICAgIHRoaXMuJGV2ZW50c1tuYW1lXSA9IG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldHMgYWxsIGxpc3RlbmVycyBmb3IgYSBjZXJ0YWluIGV2ZW50LlxuICAgKlxuICAgKiBAYXBpIHB1YmxjaVxuICAgKi9cblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYgKCF0aGlzLiRldmVudHMpIHtcbiAgICAgIHRoaXMuJGV2ZW50cyA9IHt9O1xuICAgIH1cblxuICAgIGlmICghdGhpcy4kZXZlbnRzW25hbWVdKSB7XG4gICAgICB0aGlzLiRldmVudHNbbmFtZV0gPSBbXTtcbiAgICB9XG5cbiAgICBpZiAoIWlvLnV0aWwuaXNBcnJheSh0aGlzLiRldmVudHNbbmFtZV0pKSB7XG4gICAgICB0aGlzLiRldmVudHNbbmFtZV0gPSBbdGhpcy4kZXZlbnRzW25hbWVdXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy4kZXZlbnRzW25hbWVdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBFbWl0cyBhbiBldmVudC5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBpZiAoIXRoaXMuJGV2ZW50cykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBoYW5kbGVyID0gdGhpcy4kZXZlbnRzW25hbWVdO1xuXG4gICAgaWYgKCFoYW5kbGVyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGhhbmRsZXIpIHtcbiAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfSBlbHNlIGlmIChpby51dGlsLmlzQXJyYXkoaGFuZGxlcikpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4pO1xuXG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuLyoqXG4gKiBCYXNlZCBvbiBKU09OMiAoaHR0cDovL3d3dy5KU09OLm9yZy9qcy5odG1sKS5cbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIG5hdGl2ZUpTT04pIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gdXNlIG5hdGl2ZSBKU09OIGlmIGl0J3MgYXZhaWxhYmxlXG4gIGlmIChuYXRpdmVKU09OICYmIG5hdGl2ZUpTT04ucGFyc2Upe1xuICAgIHJldHVybiBleHBvcnRzLkpTT04gPSB7XG4gICAgICBwYXJzZTogbmF0aXZlSlNPTi5wYXJzZVxuICAgICwgc3RyaW5naWZ5OiBuYXRpdmVKU09OLnN0cmluZ2lmeVxuICAgIH07XG4gIH1cblxuICB2YXIgSlNPTiA9IGV4cG9ydHMuSlNPTiA9IHt9O1xuXG4gIGZ1bmN0aW9uIGYobikge1xuICAgICAgLy8gRm9ybWF0IGludGVnZXJzIHRvIGhhdmUgYXQgbGVhc3QgdHdvIGRpZ2l0cy5cbiAgICAgIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuIDogbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRhdGUoZCwga2V5KSB7XG4gICAgcmV0dXJuIGlzRmluaXRlKGQudmFsdWVPZigpKSA/XG4gICAgICAgIGQuZ2V0VVRDRnVsbFllYXIoKSAgICAgKyAnLScgK1xuICAgICAgICBmKGQuZ2V0VVRDTW9udGgoKSArIDEpICsgJy0nICtcbiAgICAgICAgZihkLmdldFVUQ0RhdGUoKSkgICAgICArICdUJyArXG4gICAgICAgIGYoZC5nZXRVVENIb3VycygpKSAgICAgKyAnOicgK1xuICAgICAgICBmKGQuZ2V0VVRDTWludXRlcygpKSAgICsgJzonICtcbiAgICAgICAgZihkLmdldFVUQ1NlY29uZHMoKSkgICArICdaJyA6IG51bGw7XG4gIH07XG5cbiAgdmFyIGN4ID0gL1tcXHUwMDAwXFx1MDBhZFxcdTA2MDAtXFx1MDYwNFxcdTA3MGZcXHUxN2I0XFx1MTdiNVxcdTIwMGMtXFx1MjAwZlxcdTIwMjgtXFx1MjAyZlxcdTIwNjAtXFx1MjA2ZlxcdWZlZmZcXHVmZmYwLVxcdWZmZmZdL2csXG4gICAgICBlc2NhcGFibGUgPSAvW1xcXFxcXFwiXFx4MDAtXFx4MWZcXHg3Zi1cXHg5ZlxcdTAwYWRcXHUwNjAwLVxcdTA2MDRcXHUwNzBmXFx1MTdiNFxcdTE3YjVcXHUyMDBjLVxcdTIwMGZcXHUyMDI4LVxcdTIwMmZcXHUyMDYwLVxcdTIwNmZcXHVmZWZmXFx1ZmZmMC1cXHVmZmZmXS9nLFxuICAgICAgZ2FwLFxuICAgICAgaW5kZW50LFxuICAgICAgbWV0YSA9IHsgICAgLy8gdGFibGUgb2YgY2hhcmFjdGVyIHN1YnN0aXR1dGlvbnNcbiAgICAgICAgICAnXFxiJzogJ1xcXFxiJyxcbiAgICAgICAgICAnXFx0JzogJ1xcXFx0JyxcbiAgICAgICAgICAnXFxuJzogJ1xcXFxuJyxcbiAgICAgICAgICAnXFxmJzogJ1xcXFxmJyxcbiAgICAgICAgICAnXFxyJzogJ1xcXFxyJyxcbiAgICAgICAgICAnXCInIDogJ1xcXFxcIicsXG4gICAgICAgICAgJ1xcXFwnOiAnXFxcXFxcXFwnXG4gICAgICB9LFxuICAgICAgcmVwO1xuXG5cbiAgZnVuY3Rpb24gcXVvdGUoc3RyaW5nKSB7XG5cbi8vIElmIHRoZSBzdHJpbmcgY29udGFpbnMgbm8gY29udHJvbCBjaGFyYWN0ZXJzLCBubyBxdW90ZSBjaGFyYWN0ZXJzLCBhbmQgbm9cbi8vIGJhY2tzbGFzaCBjaGFyYWN0ZXJzLCB0aGVuIHdlIGNhbiBzYWZlbHkgc2xhcCBzb21lIHF1b3RlcyBhcm91bmQgaXQuXG4vLyBPdGhlcndpc2Ugd2UgbXVzdCBhbHNvIHJlcGxhY2UgdGhlIG9mZmVuZGluZyBjaGFyYWN0ZXJzIHdpdGggc2FmZSBlc2NhcGVcbi8vIHNlcXVlbmNlcy5cblxuICAgICAgZXNjYXBhYmxlLmxhc3RJbmRleCA9IDA7XG4gICAgICByZXR1cm4gZXNjYXBhYmxlLnRlc3Qoc3RyaW5nKSA/ICdcIicgKyBzdHJpbmcucmVwbGFjZShlc2NhcGFibGUsIGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgdmFyIGMgPSBtZXRhW2FdO1xuICAgICAgICAgIHJldHVybiB0eXBlb2YgYyA9PT0gJ3N0cmluZycgPyBjIDpcbiAgICAgICAgICAgICAgJ1xcXFx1JyArICgnMDAwMCcgKyBhLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpKS5zbGljZSgtNCk7XG4gICAgICB9KSArICdcIicgOiAnXCInICsgc3RyaW5nICsgJ1wiJztcbiAgfVxuXG5cbiAgZnVuY3Rpb24gc3RyKGtleSwgaG9sZGVyKSB7XG5cbi8vIFByb2R1Y2UgYSBzdHJpbmcgZnJvbSBob2xkZXJba2V5XS5cblxuICAgICAgdmFyIGksICAgICAgICAgIC8vIFRoZSBsb29wIGNvdW50ZXIuXG4gICAgICAgICAgaywgICAgICAgICAgLy8gVGhlIG1lbWJlciBrZXkuXG4gICAgICAgICAgdiwgICAgICAgICAgLy8gVGhlIG1lbWJlciB2YWx1ZS5cbiAgICAgICAgICBsZW5ndGgsXG4gICAgICAgICAgbWluZCA9IGdhcCxcbiAgICAgICAgICBwYXJ0aWFsLFxuICAgICAgICAgIHZhbHVlID0gaG9sZGVyW2tleV07XG5cbi8vIElmIHRoZSB2YWx1ZSBoYXMgYSB0b0pTT04gbWV0aG9kLCBjYWxsIGl0IHRvIG9idGFpbiBhIHJlcGxhY2VtZW50IHZhbHVlLlxuXG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgICAgdmFsdWUgPSBkYXRlKGtleSk7XG4gICAgICB9XG5cbi8vIElmIHdlIHdlcmUgY2FsbGVkIHdpdGggYSByZXBsYWNlciBmdW5jdGlvbiwgdGhlbiBjYWxsIHRoZSByZXBsYWNlciB0b1xuLy8gb2J0YWluIGEgcmVwbGFjZW1lbnQgdmFsdWUuXG5cbiAgICAgIGlmICh0eXBlb2YgcmVwID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdmFsdWUgPSByZXAuY2FsbChob2xkZXIsIGtleSwgdmFsdWUpO1xuICAgICAgfVxuXG4vLyBXaGF0IGhhcHBlbnMgbmV4dCBkZXBlbmRzIG9uIHRoZSB2YWx1ZSdzIHR5cGUuXG5cbiAgICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgIHJldHVybiBxdW90ZSh2YWx1ZSk7XG5cbiAgICAgIGNhc2UgJ251bWJlcic6XG5cbi8vIEpTT04gbnVtYmVycyBtdXN0IGJlIGZpbml0ZS4gRW5jb2RlIG5vbi1maW5pdGUgbnVtYmVycyBhcyBudWxsLlxuXG4gICAgICAgICAgcmV0dXJuIGlzRmluaXRlKHZhbHVlKSA/IFN0cmluZyh2YWx1ZSkgOiAnbnVsbCc7XG5cbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgY2FzZSAnbnVsbCc6XG5cbi8vIElmIHRoZSB2YWx1ZSBpcyBhIGJvb2xlYW4gb3IgbnVsbCwgY29udmVydCBpdCB0byBhIHN0cmluZy4gTm90ZTpcbi8vIHR5cGVvZiBudWxsIGRvZXMgbm90IHByb2R1Y2UgJ251bGwnLiBUaGUgY2FzZSBpcyBpbmNsdWRlZCBoZXJlIGluXG4vLyB0aGUgcmVtb3RlIGNoYW5jZSB0aGF0IHRoaXMgZ2V0cyBmaXhlZCBzb21lZGF5LlxuXG4gICAgICAgICAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XG5cbi8vIElmIHRoZSB0eXBlIGlzICdvYmplY3QnLCB3ZSBtaWdodCBiZSBkZWFsaW5nIHdpdGggYW4gb2JqZWN0IG9yIGFuIGFycmF5IG9yXG4vLyBudWxsLlxuXG4gICAgICBjYXNlICdvYmplY3QnOlxuXG4vLyBEdWUgdG8gYSBzcGVjaWZpY2F0aW9uIGJsdW5kZXIgaW4gRUNNQVNjcmlwdCwgdHlwZW9mIG51bGwgaXMgJ29iamVjdCcsXG4vLyBzbyB3YXRjaCBvdXQgZm9yIHRoYXQgY2FzZS5cblxuICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdudWxsJztcbiAgICAgICAgICB9XG5cbi8vIE1ha2UgYW4gYXJyYXkgdG8gaG9sZCB0aGUgcGFydGlhbCByZXN1bHRzIG9mIHN0cmluZ2lmeWluZyB0aGlzIG9iamVjdCB2YWx1ZS5cblxuICAgICAgICAgIGdhcCArPSBpbmRlbnQ7XG4gICAgICAgICAgcGFydGlhbCA9IFtdO1xuXG4vLyBJcyB0aGUgdmFsdWUgYW4gYXJyYXk/XG5cbiAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5hcHBseSh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcblxuLy8gVGhlIHZhbHVlIGlzIGFuIGFycmF5LiBTdHJpbmdpZnkgZXZlcnkgZWxlbWVudC4gVXNlIG51bGwgYXMgYSBwbGFjZWhvbGRlclxuLy8gZm9yIG5vbi1KU09OIHZhbHVlcy5cblxuICAgICAgICAgICAgICBsZW5ndGggPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgcGFydGlhbFtpXSA9IHN0cihpLCB2YWx1ZSkgfHwgJ251bGwnO1xuICAgICAgICAgICAgICB9XG5cbi8vIEpvaW4gYWxsIG9mIHRoZSBlbGVtZW50cyB0b2dldGhlciwgc2VwYXJhdGVkIHdpdGggY29tbWFzLCBhbmQgd3JhcCB0aGVtIGluXG4vLyBicmFja2V0cy5cblxuICAgICAgICAgICAgICB2ID0gcGFydGlhbC5sZW5ndGggPT09IDAgPyAnW10nIDogZ2FwID9cbiAgICAgICAgICAgICAgICAgICdbXFxuJyArIGdhcCArIHBhcnRpYWwuam9pbignLFxcbicgKyBnYXApICsgJ1xcbicgKyBtaW5kICsgJ10nIDpcbiAgICAgICAgICAgICAgICAgICdbJyArIHBhcnRpYWwuam9pbignLCcpICsgJ10nO1xuICAgICAgICAgICAgICBnYXAgPSBtaW5kO1xuICAgICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgICB9XG5cbi8vIElmIHRoZSByZXBsYWNlciBpcyBhbiBhcnJheSwgdXNlIGl0IHRvIHNlbGVjdCB0aGUgbWVtYmVycyB0byBiZSBzdHJpbmdpZmllZC5cblxuICAgICAgICAgIGlmIChyZXAgJiYgdHlwZW9mIHJlcCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgbGVuZ3RoID0gcmVwLmxlbmd0aDtcbiAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcFtpXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICBrID0gcmVwW2ldO1xuICAgICAgICAgICAgICAgICAgICAgIHYgPSBzdHIoaywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpYWwucHVzaChxdW90ZShrKSArIChnYXAgPyAnOiAnIDogJzonKSArIHYpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG5cbi8vIE90aGVyd2lzZSwgaXRlcmF0ZSB0aHJvdWdoIGFsbCBvZiB0aGUga2V5cyBpbiB0aGUgb2JqZWN0LlxuXG4gICAgICAgICAgICAgIGZvciAoayBpbiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgaykpIHtcbiAgICAgICAgICAgICAgICAgICAgICB2ID0gc3RyKGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWFsLnB1c2gocXVvdGUoaykgKyAoZ2FwID8gJzogJyA6ICc6JykgKyB2KTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbi8vIEpvaW4gYWxsIG9mIHRoZSBtZW1iZXIgdGV4dHMgdG9nZXRoZXIsIHNlcGFyYXRlZCB3aXRoIGNvbW1hcyxcbi8vIGFuZCB3cmFwIHRoZW0gaW4gYnJhY2VzLlxuXG4gICAgICAgICAgdiA9IHBhcnRpYWwubGVuZ3RoID09PSAwID8gJ3t9JyA6IGdhcCA/XG4gICAgICAgICAgICAgICd7XFxuJyArIGdhcCArIHBhcnRpYWwuam9pbignLFxcbicgKyBnYXApICsgJ1xcbicgKyBtaW5kICsgJ30nIDpcbiAgICAgICAgICAgICAgJ3snICsgcGFydGlhbC5qb2luKCcsJykgKyAnfSc7XG4gICAgICAgICAgZ2FwID0gbWluZDtcbiAgICAgICAgICByZXR1cm4gdjtcbiAgICAgIH1cbiAgfVxuXG4vLyBJZiB0aGUgSlNPTiBvYmplY3QgZG9lcyBub3QgeWV0IGhhdmUgYSBzdHJpbmdpZnkgbWV0aG9kLCBnaXZlIGl0IG9uZS5cblxuICBKU09OLnN0cmluZ2lmeSA9IGZ1bmN0aW9uICh2YWx1ZSwgcmVwbGFjZXIsIHNwYWNlKSB7XG5cbi8vIFRoZSBzdHJpbmdpZnkgbWV0aG9kIHRha2VzIGEgdmFsdWUgYW5kIGFuIG9wdGlvbmFsIHJlcGxhY2VyLCBhbmQgYW4gb3B0aW9uYWxcbi8vIHNwYWNlIHBhcmFtZXRlciwgYW5kIHJldHVybnMgYSBKU09OIHRleHQuIFRoZSByZXBsYWNlciBjYW4gYmUgYSBmdW5jdGlvblxuLy8gdGhhdCBjYW4gcmVwbGFjZSB2YWx1ZXMsIG9yIGFuIGFycmF5IG9mIHN0cmluZ3MgdGhhdCB3aWxsIHNlbGVjdCB0aGUga2V5cy5cbi8vIEEgZGVmYXVsdCByZXBsYWNlciBtZXRob2QgY2FuIGJlIHByb3ZpZGVkLiBVc2Ugb2YgdGhlIHNwYWNlIHBhcmFtZXRlciBjYW5cbi8vIHByb2R1Y2UgdGV4dCB0aGF0IGlzIG1vcmUgZWFzaWx5IHJlYWRhYmxlLlxuXG4gICAgICB2YXIgaTtcbiAgICAgIGdhcCA9ICcnO1xuICAgICAgaW5kZW50ID0gJyc7XG5cbi8vIElmIHRoZSBzcGFjZSBwYXJhbWV0ZXIgaXMgYSBudW1iZXIsIG1ha2UgYW4gaW5kZW50IHN0cmluZyBjb250YWluaW5nIHRoYXRcbi8vIG1hbnkgc3BhY2VzLlxuXG4gICAgICBpZiAodHlwZW9mIHNwYWNlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBzcGFjZTsgaSArPSAxKSB7XG4gICAgICAgICAgICAgIGluZGVudCArPSAnICc7XG4gICAgICAgICAgfVxuXG4vLyBJZiB0aGUgc3BhY2UgcGFyYW1ldGVyIGlzIGEgc3RyaW5nLCBpdCB3aWxsIGJlIHVzZWQgYXMgdGhlIGluZGVudCBzdHJpbmcuXG5cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNwYWNlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGluZGVudCA9IHNwYWNlO1xuICAgICAgfVxuXG4vLyBJZiB0aGVyZSBpcyBhIHJlcGxhY2VyLCBpdCBtdXN0IGJlIGEgZnVuY3Rpb24gb3IgYW4gYXJyYXkuXG4vLyBPdGhlcndpc2UsIHRocm93IGFuIGVycm9yLlxuXG4gICAgICByZXAgPSByZXBsYWNlcjtcbiAgICAgIGlmIChyZXBsYWNlciAmJiB0eXBlb2YgcmVwbGFjZXIgIT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgICAgICAgKHR5cGVvZiByZXBsYWNlciAhPT0gJ29iamVjdCcgfHxcbiAgICAgICAgICAgICAgdHlwZW9mIHJlcGxhY2VyLmxlbmd0aCAhPT0gJ251bWJlcicpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdKU09OLnN0cmluZ2lmeScpO1xuICAgICAgfVxuXG4vLyBNYWtlIGEgZmFrZSByb290IG9iamVjdCBjb250YWluaW5nIG91ciB2YWx1ZSB1bmRlciB0aGUga2V5IG9mICcnLlxuLy8gUmV0dXJuIHRoZSByZXN1bHQgb2Ygc3RyaW5naWZ5aW5nIHRoZSB2YWx1ZS5cblxuICAgICAgcmV0dXJuIHN0cignJywgeycnOiB2YWx1ZX0pO1xuICB9O1xuXG4vLyBJZiB0aGUgSlNPTiBvYmplY3QgZG9lcyBub3QgeWV0IGhhdmUgYSBwYXJzZSBtZXRob2QsIGdpdmUgaXQgb25lLlxuXG4gIEpTT04ucGFyc2UgPSBmdW5jdGlvbiAodGV4dCwgcmV2aXZlcikge1xuICAvLyBUaGUgcGFyc2UgbWV0aG9kIHRha2VzIGEgdGV4dCBhbmQgYW4gb3B0aW9uYWwgcmV2aXZlciBmdW5jdGlvbiwgYW5kIHJldHVybnNcbiAgLy8gYSBKYXZhU2NyaXB0IHZhbHVlIGlmIHRoZSB0ZXh0IGlzIGEgdmFsaWQgSlNPTiB0ZXh0LlxuXG4gICAgICB2YXIgajtcblxuICAgICAgZnVuY3Rpb24gd2Fsayhob2xkZXIsIGtleSkge1xuXG4gIC8vIFRoZSB3YWxrIG1ldGhvZCBpcyB1c2VkIHRvIHJlY3Vyc2l2ZWx5IHdhbGsgdGhlIHJlc3VsdGluZyBzdHJ1Y3R1cmUgc29cbiAgLy8gdGhhdCBtb2RpZmljYXRpb25zIGNhbiBiZSBtYWRlLlxuXG4gICAgICAgICAgdmFyIGssIHYsIHZhbHVlID0gaG9sZGVyW2tleV07XG4gICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgZm9yIChrIGluIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrKSkge1xuICAgICAgICAgICAgICAgICAgICAgIHYgPSB3YWxrKHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlW2tdID0gdjtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdmFsdWVba107XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXZpdmVyLmNhbGwoaG9sZGVyLCBrZXksIHZhbHVlKTtcbiAgICAgIH1cblxuXG4gIC8vIFBhcnNpbmcgaGFwcGVucyBpbiBmb3VyIHN0YWdlcy4gSW4gdGhlIGZpcnN0IHN0YWdlLCB3ZSByZXBsYWNlIGNlcnRhaW5cbiAgLy8gVW5pY29kZSBjaGFyYWN0ZXJzIHdpdGggZXNjYXBlIHNlcXVlbmNlcy4gSmF2YVNjcmlwdCBoYW5kbGVzIG1hbnkgY2hhcmFjdGVyc1xuICAvLyBpbmNvcnJlY3RseSwgZWl0aGVyIHNpbGVudGx5IGRlbGV0aW5nIHRoZW0sIG9yIHRyZWF0aW5nIHRoZW0gYXMgbGluZSBlbmRpbmdzLlxuXG4gICAgICB0ZXh0ID0gU3RyaW5nKHRleHQpO1xuICAgICAgY3gubGFzdEluZGV4ID0gMDtcbiAgICAgIGlmIChjeC50ZXN0KHRleHQpKSB7XG4gICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShjeCwgZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdcXFxcdScgK1xuICAgICAgICAgICAgICAgICAgKCcwMDAwJyArIGEuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikpLnNsaWNlKC00KTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cblxuICAvLyBJbiB0aGUgc2Vjb25kIHN0YWdlLCB3ZSBydW4gdGhlIHRleHQgYWdhaW5zdCByZWd1bGFyIGV4cHJlc3Npb25zIHRoYXQgbG9va1xuICAvLyBmb3Igbm9uLUpTT04gcGF0dGVybnMuIFdlIGFyZSBlc3BlY2lhbGx5IGNvbmNlcm5lZCB3aXRoICcoKScgYW5kICduZXcnXG4gIC8vIGJlY2F1c2UgdGhleSBjYW4gY2F1c2UgaW52b2NhdGlvbiwgYW5kICc9JyBiZWNhdXNlIGl0IGNhbiBjYXVzZSBtdXRhdGlvbi5cbiAgLy8gQnV0IGp1c3QgdG8gYmUgc2FmZSwgd2Ugd2FudCB0byByZWplY3QgYWxsIHVuZXhwZWN0ZWQgZm9ybXMuXG5cbiAgLy8gV2Ugc3BsaXQgdGhlIHNlY29uZCBzdGFnZSBpbnRvIDQgcmVnZXhwIG9wZXJhdGlvbnMgaW4gb3JkZXIgdG8gd29yayBhcm91bmRcbiAgLy8gY3JpcHBsaW5nIGluZWZmaWNpZW5jaWVzIGluIElFJ3MgYW5kIFNhZmFyaSdzIHJlZ2V4cCBlbmdpbmVzLiBGaXJzdCB3ZVxuICAvLyByZXBsYWNlIHRoZSBKU09OIGJhY2tzbGFzaCBwYWlycyB3aXRoICdAJyAoYSBub24tSlNPTiBjaGFyYWN0ZXIpLiBTZWNvbmQsIHdlXG4gIC8vIHJlcGxhY2UgYWxsIHNpbXBsZSB2YWx1ZSB0b2tlbnMgd2l0aCAnXScgY2hhcmFjdGVycy4gVGhpcmQsIHdlIGRlbGV0ZSBhbGxcbiAgLy8gb3BlbiBicmFja2V0cyB0aGF0IGZvbGxvdyBhIGNvbG9uIG9yIGNvbW1hIG9yIHRoYXQgYmVnaW4gdGhlIHRleHQuIEZpbmFsbHksXG4gIC8vIHdlIGxvb2sgdG8gc2VlIHRoYXQgdGhlIHJlbWFpbmluZyBjaGFyYWN0ZXJzIGFyZSBvbmx5IHdoaXRlc3BhY2Ugb3IgJ10nIG9yXG4gIC8vICcsJyBvciAnOicgb3IgJ3snIG9yICd9Jy4gSWYgdGhhdCBpcyBzbywgdGhlbiB0aGUgdGV4dCBpcyBzYWZlIGZvciBldmFsLlxuXG4gICAgICBpZiAoL15bXFxdLDp7fVxcc10qJC9cbiAgICAgICAgICAgICAgLnRlc3QodGV4dC5yZXBsYWNlKC9cXFxcKD86W1wiXFxcXFxcL2JmbnJ0XXx1WzAtOWEtZkEtRl17NH0pL2csICdAJylcbiAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cIlteXCJcXFxcXFxuXFxyXSpcInx0cnVlfGZhbHNlfG51bGx8LT9cXGQrKD86XFwuXFxkKik/KD86W2VFXVsrXFwtXT9cXGQrKT8vZywgJ10nKVxuICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyg/Ol58OnwsKSg/OlxccypcXFspKy9nLCAnJykpKSB7XG5cbiAgLy8gSW4gdGhlIHRoaXJkIHN0YWdlIHdlIHVzZSB0aGUgZXZhbCBmdW5jdGlvbiB0byBjb21waWxlIHRoZSB0ZXh0IGludG8gYVxuICAvLyBKYXZhU2NyaXB0IHN0cnVjdHVyZS4gVGhlICd7JyBvcGVyYXRvciBpcyBzdWJqZWN0IHRvIGEgc3ludGFjdGljIGFtYmlndWl0eVxuICAvLyBpbiBKYXZhU2NyaXB0OiBpdCBjYW4gYmVnaW4gYSBibG9jayBvciBhbiBvYmplY3QgbGl0ZXJhbC4gV2Ugd3JhcCB0aGUgdGV4dFxuICAvLyBpbiBwYXJlbnMgdG8gZWxpbWluYXRlIHRoZSBhbWJpZ3VpdHkuXG5cbiAgICAgICAgICBqID0gZXZhbCgnKCcgKyB0ZXh0ICsgJyknKTtcblxuICAvLyBJbiB0aGUgb3B0aW9uYWwgZm91cnRoIHN0YWdlLCB3ZSByZWN1cnNpdmVseSB3YWxrIHRoZSBuZXcgc3RydWN0dXJlLCBwYXNzaW5nXG4gIC8vIGVhY2ggbmFtZS92YWx1ZSBwYWlyIHRvIGEgcmV2aXZlciBmdW5jdGlvbiBmb3IgcG9zc2libGUgdHJhbnNmb3JtYXRpb24uXG5cbiAgICAgICAgICByZXR1cm4gdHlwZW9mIHJldml2ZXIgPT09ICdmdW5jdGlvbicgP1xuICAgICAgICAgICAgICB3YWxrKHsnJzogan0sICcnKSA6IGo7XG4gICAgICB9XG5cbiAgLy8gSWYgdGhlIHRleHQgaXMgbm90IEpTT04gcGFyc2VhYmxlLCB0aGVuIGEgU3ludGF4RXJyb3IgaXMgdGhyb3duLlxuXG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ0pTT04ucGFyc2UnKTtcbiAgfTtcblxufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUuZXhwb3J0c1xuICAsIHR5cGVvZiBKU09OICE9PSAndW5kZWZpbmVkJyA/IEpTT04gOiB1bmRlZmluZWRcbik7XG5cbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGlvKSB7XG5cbiAgLyoqXG4gICAqIFBhcnNlciBuYW1lc3BhY2UuXG4gICAqXG4gICAqIEBuYW1lc3BhY2VcbiAgICovXG5cbiAgdmFyIHBhcnNlciA9IGV4cG9ydHMucGFyc2VyID0ge307XG5cbiAgLyoqXG4gICAqIFBhY2tldCB0eXBlcy5cbiAgICovXG5cbiAgdmFyIHBhY2tldHMgPSBwYXJzZXIucGFja2V0cyA9IFtcbiAgICAgICdkaXNjb25uZWN0J1xuICAgICwgJ2Nvbm5lY3QnXG4gICAgLCAnaGVhcnRiZWF0J1xuICAgICwgJ21lc3NhZ2UnXG4gICAgLCAnanNvbidcbiAgICAsICdldmVudCdcbiAgICAsICdhY2snXG4gICAgLCAnZXJyb3InXG4gICAgLCAnbm9vcCdcbiAgXTtcblxuICAvKipcbiAgICogRXJyb3JzIHJlYXNvbnMuXG4gICAqL1xuXG4gIHZhciByZWFzb25zID0gcGFyc2VyLnJlYXNvbnMgPSBbXG4gICAgICAndHJhbnNwb3J0IG5vdCBzdXBwb3J0ZWQnXG4gICAgLCAnY2xpZW50IG5vdCBoYW5kc2hha2VuJ1xuICAgICwgJ3VuYXV0aG9yaXplZCdcbiAgXTtcblxuICAvKipcbiAgICogRXJyb3JzIGFkdmljZS5cbiAgICovXG5cbiAgdmFyIGFkdmljZSA9IHBhcnNlci5hZHZpY2UgPSBbXG4gICAgICAncmVjb25uZWN0J1xuICBdO1xuXG4gIC8qKlxuICAgKiBTaG9ydGN1dHMuXG4gICAqL1xuXG4gIHZhciBKU09OID0gaW8uSlNPTlxuICAgICwgaW5kZXhPZiA9IGlvLnV0aWwuaW5kZXhPZjtcblxuICAvKipcbiAgICogRW5jb2RlcyBhIHBhY2tldC5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIHBhcnNlci5lbmNvZGVQYWNrZXQgPSBmdW5jdGlvbiAocGFja2V0KSB7XG4gICAgdmFyIHR5cGUgPSBpbmRleE9mKHBhY2tldHMsIHBhY2tldC50eXBlKVxuICAgICAgLCBpZCA9IHBhY2tldC5pZCB8fCAnJ1xuICAgICAgLCBlbmRwb2ludCA9IHBhY2tldC5lbmRwb2ludCB8fCAnJ1xuICAgICAgLCBhY2sgPSBwYWNrZXQuYWNrXG4gICAgICAsIGRhdGEgPSBudWxsO1xuXG4gICAgc3dpdGNoIChwYWNrZXQudHlwZSkge1xuICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICB2YXIgcmVhc29uID0gcGFja2V0LnJlYXNvbiA/IGluZGV4T2YocmVhc29ucywgcGFja2V0LnJlYXNvbikgOiAnJ1xuICAgICAgICAgICwgYWR2ID0gcGFja2V0LmFkdmljZSA/IGluZGV4T2YoYWR2aWNlLCBwYWNrZXQuYWR2aWNlKSA6ICcnO1xuXG4gICAgICAgIGlmIChyZWFzb24gIT09ICcnIHx8IGFkdiAhPT0gJycpXG4gICAgICAgICAgZGF0YSA9IHJlYXNvbiArIChhZHYgIT09ICcnID8gKCcrJyArIGFkdikgOiAnJyk7XG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ21lc3NhZ2UnOlxuICAgICAgICBpZiAocGFja2V0LmRhdGEgIT09ICcnKVxuICAgICAgICAgIGRhdGEgPSBwYWNrZXQuZGF0YTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2V2ZW50JzpcbiAgICAgICAgdmFyIGV2ID0geyBuYW1lOiBwYWNrZXQubmFtZSB9O1xuXG4gICAgICAgIGlmIChwYWNrZXQuYXJncyAmJiBwYWNrZXQuYXJncy5sZW5ndGgpIHtcbiAgICAgICAgICBldi5hcmdzID0gcGFja2V0LmFyZ3M7XG4gICAgICAgIH1cblxuICAgICAgICBkYXRhID0gSlNPTi5zdHJpbmdpZnkoZXYpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnanNvbic6XG4gICAgICAgIGRhdGEgPSBKU09OLnN0cmluZ2lmeShwYWNrZXQuZGF0YSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdjb25uZWN0JzpcbiAgICAgICAgaWYgKHBhY2tldC5xcylcbiAgICAgICAgICBkYXRhID0gcGFja2V0LnFzO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnYWNrJzpcbiAgICAgICAgZGF0YSA9IHBhY2tldC5hY2tJZFxuICAgICAgICAgICsgKHBhY2tldC5hcmdzICYmIHBhY2tldC5hcmdzLmxlbmd0aFxuICAgICAgICAgICAgICA/ICcrJyArIEpTT04uc3RyaW5naWZ5KHBhY2tldC5hcmdzKSA6ICcnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gY29uc3RydWN0IHBhY2tldCB3aXRoIHJlcXVpcmVkIGZyYWdtZW50c1xuICAgIHZhciBlbmNvZGVkID0gW1xuICAgICAgICB0eXBlXG4gICAgICAsIGlkICsgKGFjayA9PSAnZGF0YScgPyAnKycgOiAnJylcbiAgICAgICwgZW5kcG9pbnRcbiAgICBdO1xuXG4gICAgLy8gZGF0YSBmcmFnbWVudCBpcyBvcHRpb25hbFxuICAgIGlmIChkYXRhICE9PSBudWxsICYmIGRhdGEgIT09IHVuZGVmaW5lZClcbiAgICAgIGVuY29kZWQucHVzaChkYXRhKTtcblxuICAgIHJldHVybiBlbmNvZGVkLmpvaW4oJzonKTtcbiAgfTtcblxuICAvKipcbiAgICogRW5jb2RlcyBtdWx0aXBsZSBtZXNzYWdlcyAocGF5bG9hZCkuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXl9IG1lc3NhZ2VzXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBwYXJzZXIuZW5jb2RlUGF5bG9hZCA9IGZ1bmN0aW9uIChwYWNrZXRzKSB7XG4gICAgdmFyIGRlY29kZWQgPSAnJztcblxuICAgIGlmIChwYWNrZXRzLmxlbmd0aCA9PSAxKVxuICAgICAgcmV0dXJuIHBhY2tldHNbMF07XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHBhY2tldHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgcGFja2V0ID0gcGFja2V0c1tpXTtcbiAgICAgIGRlY29kZWQgKz0gJ1xcdWZmZmQnICsgcGFja2V0Lmxlbmd0aCArICdcXHVmZmZkJyArIHBhY2tldHNbaV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlY29kZWQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIERlY29kZXMgYSBwYWNrZXRcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIHZhciByZWdleHAgPSAvKFteOl0rKTooWzAtOV0rKT8oXFwrKT86KFteOl0rKT86PyhbXFxzXFxTXSopPy87XG5cbiAgcGFyc2VyLmRlY29kZVBhY2tldCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyIHBpZWNlcyA9IGRhdGEubWF0Y2gocmVnZXhwKTtcblxuICAgIGlmICghcGllY2VzKSByZXR1cm4ge307XG5cbiAgICB2YXIgaWQgPSBwaWVjZXNbMl0gfHwgJydcbiAgICAgICwgZGF0YSA9IHBpZWNlc1s1XSB8fCAnJ1xuICAgICAgLCBwYWNrZXQgPSB7XG4gICAgICAgICAgICB0eXBlOiBwYWNrZXRzW3BpZWNlc1sxXV1cbiAgICAgICAgICAsIGVuZHBvaW50OiBwaWVjZXNbNF0gfHwgJydcbiAgICAgICAgfTtcblxuICAgIC8vIHdoZXRoZXIgd2UgbmVlZCB0byBhY2tub3dsZWRnZSB0aGUgcGFja2V0XG4gICAgaWYgKGlkKSB7XG4gICAgICBwYWNrZXQuaWQgPSBpZDtcbiAgICAgIGlmIChwaWVjZXNbM10pXG4gICAgICAgIHBhY2tldC5hY2sgPSAnZGF0YSc7XG4gICAgICBlbHNlXG4gICAgICAgIHBhY2tldC5hY2sgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIGhhbmRsZSBkaWZmZXJlbnQgcGFja2V0IHR5cGVzXG4gICAgc3dpdGNoIChwYWNrZXQudHlwZSkge1xuICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICB2YXIgcGllY2VzID0gZGF0YS5zcGxpdCgnKycpO1xuICAgICAgICBwYWNrZXQucmVhc29uID0gcmVhc29uc1twaWVjZXNbMF1dIHx8ICcnO1xuICAgICAgICBwYWNrZXQuYWR2aWNlID0gYWR2aWNlW3BpZWNlc1sxXV0gfHwgJyc7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdtZXNzYWdlJzpcbiAgICAgICAgcGFja2V0LmRhdGEgPSBkYXRhIHx8ICcnO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZXZlbnQnOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHZhciBvcHRzID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgICBwYWNrZXQubmFtZSA9IG9wdHMubmFtZTtcbiAgICAgICAgICBwYWNrZXQuYXJncyA9IG9wdHMuYXJncztcbiAgICAgICAgfSBjYXRjaCAoZSkgeyB9XG5cbiAgICAgICAgcGFja2V0LmFyZ3MgPSBwYWNrZXQuYXJncyB8fCBbXTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2pzb24nOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHBhY2tldC5kYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZSkgeyB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdjb25uZWN0JzpcbiAgICAgICAgcGFja2V0LnFzID0gZGF0YSB8fCAnJztcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Fjayc6XG4gICAgICAgIHZhciBwaWVjZXMgPSBkYXRhLm1hdGNoKC9eKFswLTldKykoXFwrKT8oLiopLyk7XG4gICAgICAgIGlmIChwaWVjZXMpIHtcbiAgICAgICAgICBwYWNrZXQuYWNrSWQgPSBwaWVjZXNbMV07XG4gICAgICAgICAgcGFja2V0LmFyZ3MgPSBbXTtcblxuICAgICAgICAgIGlmIChwaWVjZXNbM10pIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIHBhY2tldC5hcmdzID0gcGllY2VzWzNdID8gSlNPTi5wYXJzZShwaWVjZXNbM10pIDogW107XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7IH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Rpc2Nvbm5lY3QnOlxuICAgICAgY2FzZSAnaGVhcnRiZWF0JzpcbiAgICAgICAgYnJlYWs7XG4gICAgfTtcblxuICAgIHJldHVybiBwYWNrZXQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIERlY29kZXMgZGF0YSBwYXlsb2FkLiBEZXRlY3RzIG11bHRpcGxlIG1lc3NhZ2VzXG4gICAqXG4gICAqIEByZXR1cm4ge0FycmF5fSBtZXNzYWdlc1xuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBwYXJzZXIuZGVjb2RlUGF5bG9hZCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgLy8gSUUgZG9lc24ndCBsaWtlIGRhdGFbaV0gZm9yIHVuaWNvZGUgY2hhcnMsIGNoYXJBdCB3b3JrcyBmaW5lXG4gICAgaWYgKGRhdGEuY2hhckF0KDApID09ICdcXHVmZmZkJykge1xuICAgICAgdmFyIHJldCA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMSwgbGVuZ3RoID0gJyc7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChkYXRhLmNoYXJBdChpKSA9PSAnXFx1ZmZmZCcpIHtcbiAgICAgICAgICByZXQucHVzaChwYXJzZXIuZGVjb2RlUGFja2V0KGRhdGEuc3Vic3RyKGkgKyAxKS5zdWJzdHIoMCwgbGVuZ3RoKSkpO1xuICAgICAgICAgIGkgKz0gTnVtYmVyKGxlbmd0aCkgKyAxO1xuICAgICAgICAgIGxlbmd0aCA9ICcnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxlbmd0aCArPSBkYXRhLmNoYXJBdChpKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW3BhcnNlci5kZWNvZGVQYWNrZXQoZGF0YSldO1xuICAgIH1cbiAgfTtcblxufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4pO1xuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgaW8pIHtcblxuICAvKipcbiAgICogRXhwb3NlIGNvbnN0cnVjdG9yLlxuICAgKi9cblxuICBleHBvcnRzLlRyYW5zcG9ydCA9IFRyYW5zcG9ydDtcblxuICAvKipcbiAgICogVGhpcyBpcyB0aGUgdHJhbnNwb3J0IHRlbXBsYXRlIGZvciBhbGwgc3VwcG9ydGVkIHRyYW5zcG9ydCBtZXRob2RzLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gVHJhbnNwb3J0IChzb2NrZXQsIHNlc3NpZCkge1xuICAgIHRoaXMuc29ja2V0ID0gc29ja2V0O1xuICAgIHRoaXMuc2Vzc2lkID0gc2Vzc2lkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBcHBseSBFdmVudEVtaXR0ZXIgbWl4aW4uXG4gICAqL1xuXG4gIGlvLnV0aWwubWl4aW4oVHJhbnNwb3J0LCBpby5FdmVudEVtaXR0ZXIpO1xuXG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB3aGV0aGVyIGhlYXJ0YmVhdHMgaXMgZW5hYmxlZCBmb3IgdGhpcyB0cmFuc3BvcnRcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUuaGVhcnRiZWF0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgcmVzcG9uc2UgZnJvbSB0aGUgc2VydmVyLiBXaGVuIGEgbmV3IHJlc3BvbnNlIGlzIHJlY2VpdmVkXG4gICAqIGl0IHdpbGwgYXV0b21hdGljYWxseSB1cGRhdGUgdGhlIHRpbWVvdXQsIGRlY29kZSB0aGUgbWVzc2FnZSBhbmRcbiAgICogZm9yd2FyZHMgdGhlIHJlc3BvbnNlIHRvIHRoZSBvbk1lc3NhZ2UgZnVuY3Rpb24gZm9yIGZ1cnRoZXIgcHJvY2Vzc2luZy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRhdGEgUmVzcG9uc2UgZnJvbSB0aGUgc2VydmVyLlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5vbkRhdGEgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHRoaXMuY2xlYXJDbG9zZVRpbWVvdXQoKTtcblxuICAgIC8vIElmIHRoZSBjb25uZWN0aW9uIGluIGN1cnJlbnRseSBvcGVuIChvciBpbiBhIHJlb3BlbmluZyBzdGF0ZSkgcmVzZXQgdGhlIGNsb3NlXG4gICAgLy8gdGltZW91dCBzaW5jZSB3ZSBoYXZlIGp1c3QgcmVjZWl2ZWQgZGF0YS4gVGhpcyBjaGVjayBpcyBuZWNlc3Nhcnkgc29cbiAgICAvLyB0aGF0IHdlIGRvbid0IHJlc2V0IHRoZSB0aW1lb3V0IG9uIGFuIGV4cGxpY2l0bHkgZGlzY29ubmVjdGVkIGNvbm5lY3Rpb24uXG4gICAgaWYgKHRoaXMuc29ja2V0LmNvbm5lY3RlZCB8fCB0aGlzLnNvY2tldC5jb25uZWN0aW5nIHx8IHRoaXMuc29ja2V0LnJlY29ubmVjdGluZykge1xuICAgICAgdGhpcy5zZXRDbG9zZVRpbWVvdXQoKTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YSAhPT0gJycpIHtcbiAgICAgIC8vIHRvZG86IHdlIHNob3VsZCBvbmx5IGRvIGRlY29kZVBheWxvYWQgZm9yIHhociB0cmFuc3BvcnRzXG4gICAgICB2YXIgbXNncyA9IGlvLnBhcnNlci5kZWNvZGVQYXlsb2FkKGRhdGEpO1xuXG4gICAgICBpZiAobXNncyAmJiBtc2dzLmxlbmd0aCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG1zZ3MubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgdGhpcy5vblBhY2tldChtc2dzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHBhY2tldHMuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLm9uUGFja2V0ID0gZnVuY3Rpb24gKHBhY2tldCkge1xuICAgIHRoaXMuc29ja2V0LnNldEhlYXJ0YmVhdFRpbWVvdXQoKTtcblxuICAgIGlmIChwYWNrZXQudHlwZSA9PSAnaGVhcnRiZWF0Jykge1xuICAgICAgcmV0dXJuIHRoaXMub25IZWFydGJlYXQoKTtcbiAgICB9XG5cbiAgICBpZiAocGFja2V0LnR5cGUgPT0gJ2Nvbm5lY3QnICYmIHBhY2tldC5lbmRwb2ludCA9PSAnJykge1xuICAgICAgdGhpcy5vbkNvbm5lY3QoKTtcbiAgICB9XG5cbiAgICBpZiAocGFja2V0LnR5cGUgPT0gJ2Vycm9yJyAmJiBwYWNrZXQuYWR2aWNlID09ICdyZWNvbm5lY3QnKSB7XG4gICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuc29ja2V0Lm9uUGFja2V0KHBhY2tldCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogU2V0cyBjbG9zZSB0aW1lb3V0XG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLnNldENsb3NlVGltZW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuY2xvc2VUaW1lb3V0KSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHRoaXMuY2xvc2VUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYub25EaXNjb25uZWN0KCk7XG4gICAgICB9LCB0aGlzLnNvY2tldC5jbG9zZVRpbWVvdXQpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdHJhbnNwb3J0IGRpc2Nvbm5lY3RzLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5vbkRpc2Nvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuaXNPcGVuKSB0aGlzLmNsb3NlKCk7XG4gICAgdGhpcy5jbGVhclRpbWVvdXRzKCk7XG4gICAgdGhpcy5zb2NrZXQub25EaXNjb25uZWN0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRyYW5zcG9ydCBjb25uZWN0c1xuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5vbkNvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zb2NrZXQub25Db25uZWN0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIENsZWFycyBjbG9zZSB0aW1lb3V0XG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLmNsZWFyQ2xvc2VUaW1lb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmNsb3NlVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuY2xvc2VUaW1lb3V0KTtcbiAgICAgIHRoaXMuY2xvc2VUaW1lb3V0ID0gbnVsbDtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENsZWFyIHRpbWVvdXRzXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLmNsZWFyVGltZW91dHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jbGVhckNsb3NlVGltZW91dCgpO1xuXG4gICAgaWYgKHRoaXMucmVvcGVuVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMucmVvcGVuVGltZW91dCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBTZW5kcyBhIHBhY2tldFxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGFja2V0IG9iamVjdC5cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUucGFja2V0ID0gZnVuY3Rpb24gKHBhY2tldCkge1xuICAgIHRoaXMuc2VuZChpby5wYXJzZXIuZW5jb2RlUGFja2V0KHBhY2tldCkpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZW5kIHRoZSByZWNlaXZlZCBoZWFydGJlYXQgbWVzc2FnZSBiYWNrIHRvIHNlcnZlci4gU28gdGhlIHNlcnZlclxuICAgKiBrbm93cyB3ZSBhcmUgc3RpbGwgY29ubmVjdGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gaGVhcnRiZWF0IEhlYXJ0YmVhdCByZXNwb25zZSBmcm9tIHRoZSBzZXJ2ZXIuXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLm9uSGVhcnRiZWF0ID0gZnVuY3Rpb24gKGhlYXJ0YmVhdCkge1xuICAgIHRoaXMucGFja2V0KHsgdHlwZTogJ2hlYXJ0YmVhdCcgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSB0cmFuc3BvcnQgb3BlbnMuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLm9uT3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzT3BlbiA9IHRydWU7XG4gICAgdGhpcy5jbGVhckNsb3NlVGltZW91dCgpO1xuICAgIHRoaXMuc29ja2V0Lm9uT3BlbigpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBOb3RpZmllcyB0aGUgYmFzZSB3aGVuIHRoZSBjb25uZWN0aW9uIHdpdGggdGhlIFNvY2tldC5JTyBzZXJ2ZXJcbiAgICogaGFzIGJlZW4gZGlzY29ubmVjdGVkLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5vbkNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8qIEZJWE1FOiByZW9wZW4gZGVsYXkgY2F1c2luZyBhIGluZmluaXQgbG9vcFxuICAgIHRoaXMucmVvcGVuVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5vcGVuKCk7XG4gICAgfSwgdGhpcy5zb2NrZXQub3B0aW9uc1sncmVvcGVuIGRlbGF5J10pOyovXG5cbiAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xuICAgIHRoaXMuc29ja2V0Lm9uQ2xvc2UoKTtcbiAgICB0aGlzLm9uRGlzY29ubmVjdCgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYSBjb25uZWN0aW9uIHVybCBiYXNlZCBvbiB0aGUgU29ja2V0LklPIFVSTCBQcm90b2NvbC5cbiAgICogU2VlIDxodHRwczovL2dpdGh1Yi5jb20vbGVhcm5ib29zdC9zb2NrZXQuaW8tbm9kZS8+IGZvciBtb3JlIGRldGFpbHMuXG4gICAqXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IENvbm5lY3Rpb24gdXJsXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLnByZXBhcmVVcmwgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLnNvY2tldC5vcHRpb25zO1xuXG4gICAgcmV0dXJuIHRoaXMuc2NoZW1lKCkgKyAnOi8vJ1xuICAgICAgKyBvcHRpb25zLmhvc3QgKyAnOicgKyBvcHRpb25zLnBvcnQgKyAnLydcbiAgICAgICsgb3B0aW9ucy5yZXNvdXJjZSArICcvJyArIGlvLnByb3RvY29sXG4gICAgICArICcvJyArIHRoaXMubmFtZSArICcvJyArIHRoaXMuc2Vzc2lkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHRyYW5zcG9ydCBpcyByZWFkeSB0byBzdGFydCBhIGNvbm5lY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7U29ja2V0fSBzb2NrZXQgVGhlIHNvY2tldCBpbnN0YW5jZSB0aGF0IG5lZWRzIGEgdHJhbnNwb3J0XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFja1xuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uIChzb2NrZXQsIGZuKSB7XG4gICAgZm4uY2FsbCh0aGlzKTtcbiAgfTtcbn0pKFxuICAgICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLmV4cG9ydHNcbiAgLCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5wYXJlbnQuZXhwb3J0c1xuKTtcbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGlvLCBnbG9iYWwpIHtcblxuICAvKipcbiAgICogRXhwb3NlIGNvbnN0cnVjdG9yLlxuICAgKi9cblxuICBleHBvcnRzLlNvY2tldCA9IFNvY2tldDtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBTb2NrZXQuSU8gY2xpZW50YCB3aGljaCBjYW4gZXN0YWJsaXNoIGEgcGVyc2lzdGVudFxuICAgKiBjb25uZWN0aW9uIHdpdGggYSBTb2NrZXQuSU8gZW5hYmxlZCBzZXJ2ZXIuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFNvY2tldCAob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgICAgcG9ydDogODBcbiAgICAgICwgc2VjdXJlOiBmYWxzZVxuICAgICAgLCBkb2N1bWVudDogJ2RvY3VtZW50JyBpbiBnbG9iYWwgPyBkb2N1bWVudCA6IGZhbHNlXG4gICAgICAsIHJlc291cmNlOiAnc29ja2V0LmlvJ1xuICAgICAgLCB0cmFuc3BvcnRzOiBpby50cmFuc3BvcnRzXG4gICAgICAsICdjb25uZWN0IHRpbWVvdXQnOiAxMDAwMFxuICAgICAgLCAndHJ5IG11bHRpcGxlIHRyYW5zcG9ydHMnOiB0cnVlXG4gICAgICAsICdyZWNvbm5lY3QnOiB0cnVlXG4gICAgICAsICdyZWNvbm5lY3Rpb24gZGVsYXknOiA1MDBcbiAgICAgICwgJ3JlY29ubmVjdGlvbiBsaW1pdCc6IEluZmluaXR5XG4gICAgICAsICdyZW9wZW4gZGVsYXknOiAzMDAwXG4gICAgICAsICdtYXggcmVjb25uZWN0aW9uIGF0dGVtcHRzJzogMTBcbiAgICAgICwgJ3N5bmMgZGlzY29ubmVjdCBvbiB1bmxvYWQnOiBmYWxzZVxuICAgICAgLCAnYXV0byBjb25uZWN0JzogdHJ1ZVxuICAgICAgLCAnZmxhc2ggcG9saWN5IHBvcnQnOiAxMDg0M1xuICAgICAgLCAnbWFudWFsRmx1c2gnOiBmYWxzZVxuICAgIH07XG5cbiAgICBpby51dGlsLm1lcmdlKHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgIHRoaXMuY29ubmVjdGluZyA9IGZhbHNlO1xuICAgIHRoaXMucmVjb25uZWN0aW5nID0gZmFsc2U7XG4gICAgdGhpcy5uYW1lc3BhY2VzID0ge307XG4gICAgdGhpcy5idWZmZXIgPSBbXTtcbiAgICB0aGlzLmRvQnVmZmVyID0gZmFsc2U7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zWydzeW5jIGRpc2Nvbm5lY3Qgb24gdW5sb2FkJ10gJiZcbiAgICAgICAgKCF0aGlzLmlzWERvbWFpbigpIHx8IGlvLnV0aWwudWEuaGFzQ09SUykpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIGlvLnV0aWwub24oZ2xvYmFsLCAnYmVmb3JldW5sb2FkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLmRpc2Nvbm5lY3RTeW5jKCk7XG4gICAgICB9LCBmYWxzZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9uc1snYXV0byBjb25uZWN0J10pIHtcbiAgICAgIHRoaXMuY29ubmVjdCgpO1xuICAgIH1cbn07XG5cbiAgLyoqXG4gICAqIEFwcGx5IEV2ZW50RW1pdHRlciBtaXhpbi5cbiAgICovXG5cbiAgaW8udXRpbC5taXhpbihTb2NrZXQsIGlvLkV2ZW50RW1pdHRlcik7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuYW1lc3BhY2UgbGlzdGVuZXIvZW1pdHRlciBmb3IgdGhpcyBzb2NrZXRcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5vZiA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYgKCF0aGlzLm5hbWVzcGFjZXNbbmFtZV0pIHtcbiAgICAgIHRoaXMubmFtZXNwYWNlc1tuYW1lXSA9IG5ldyBpby5Tb2NrZXROYW1lc3BhY2UodGhpcywgbmFtZSk7XG5cbiAgICAgIGlmIChuYW1lICE9PSAnJykge1xuICAgICAgICB0aGlzLm5hbWVzcGFjZXNbbmFtZV0ucGFja2V0KHsgdHlwZTogJ2Nvbm5lY3QnIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm5hbWVzcGFjZXNbbmFtZV07XG4gIH07XG5cbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBnaXZlbiBldmVudCB0byB0aGUgU29ja2V0IGFuZCBhbGwgbmFtZXNwYWNlc1xuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5wdWJsaXNoID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZW1pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgdmFyIG5zcDtcblxuICAgIGZvciAodmFyIGkgaW4gdGhpcy5uYW1lc3BhY2VzKSB7XG4gICAgICBpZiAodGhpcy5uYW1lc3BhY2VzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIG5zcCA9IHRoaXMub2YoaSk7XG4gICAgICAgIG5zcC4kZW1pdC5hcHBseShuc3AsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyB0aGUgaGFuZHNoYWtlXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBmdW5jdGlvbiBlbXB0eSAoKSB7IH07XG5cbiAgU29ja2V0LnByb3RvdHlwZS5oYW5kc2hha2UgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICAgIGZ1bmN0aW9uIGNvbXBsZXRlIChkYXRhKSB7XG4gICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHNlbGYuY29ubmVjdGluZyA9IGZhbHNlO1xuICAgICAgICBzZWxmLm9uRXJyb3IoZGF0YS5tZXNzYWdlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZuLmFwcGx5KG51bGwsIGRhdGEuc3BsaXQoJzonKSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciB1cmwgPSBbXG4gICAgICAgICAgJ2h0dHAnICsgKG9wdGlvbnMuc2VjdXJlID8gJ3MnIDogJycpICsgJzovJ1xuICAgICAgICAsIG9wdGlvbnMuaG9zdCArICc6JyArIG9wdGlvbnMucG9ydFxuICAgICAgICAsIG9wdGlvbnMucmVzb3VyY2VcbiAgICAgICAgLCBpby5wcm90b2NvbFxuICAgICAgICAsIGlvLnV0aWwucXVlcnkodGhpcy5vcHRpb25zLnF1ZXJ5LCAndD0nICsgK25ldyBEYXRlKVxuICAgICAgXS5qb2luKCcvJyk7XG5cbiAgICBpZiAodGhpcy5pc1hEb21haW4oKSAmJiAhaW8udXRpbC51YS5oYXNDT1JTKSB7XG4gICAgICB2YXIgaW5zZXJ0QXQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF1cbiAgICAgICAgLCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcblxuICAgICAgc2NyaXB0LnNyYyA9IHVybCArICcmanNvbnA9JyArIGlvLmoubGVuZ3RoO1xuICAgICAgaW5zZXJ0QXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc2NyaXB0LCBpbnNlcnRBdCk7XG5cbiAgICAgIGlvLmoucHVzaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBjb21wbGV0ZShkYXRhKTtcbiAgICAgICAgc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgeGhyID0gaW8udXRpbC5yZXF1ZXN0KCk7XG5cbiAgICAgIHhoci5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICAgICAgaWYgKHRoaXMuaXNYRG9tYWluKCkpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gICAgICB9XG4gICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT0gNCkge1xuICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBlbXB0eTtcblxuICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09IDIwMCkge1xuICAgICAgICAgICAgY29tcGxldGUoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgfSBlbHNlIGlmICh4aHIuc3RhdHVzID09IDQwMykge1xuICAgICAgICAgICAgc2VsZi5vbkVycm9yKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLmNvbm5lY3RpbmcgPSBmYWxzZTsgICAgICAgICAgICBcbiAgICAgICAgICAgICFzZWxmLnJlY29ubmVjdGluZyAmJiBzZWxmLm9uRXJyb3IoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgeGhyLnNlbmQobnVsbCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBGaW5kIGFuIGF2YWlsYWJsZSB0cmFuc3BvcnQgYmFzZWQgb24gdGhlIG9wdGlvbnMgc3VwcGxpZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5nZXRUcmFuc3BvcnQgPSBmdW5jdGlvbiAob3ZlcnJpZGUpIHtcbiAgICB2YXIgdHJhbnNwb3J0cyA9IG92ZXJyaWRlIHx8IHRoaXMudHJhbnNwb3J0cywgbWF0Y2g7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgdHJhbnNwb3J0OyB0cmFuc3BvcnQgPSB0cmFuc3BvcnRzW2ldOyBpKyspIHtcbiAgICAgIGlmIChpby5UcmFuc3BvcnRbdHJhbnNwb3J0XVxuICAgICAgICAmJiBpby5UcmFuc3BvcnRbdHJhbnNwb3J0XS5jaGVjayh0aGlzKVxuICAgICAgICAmJiAoIXRoaXMuaXNYRG9tYWluKCkgfHwgaW8uVHJhbnNwb3J0W3RyYW5zcG9ydF0ueGRvbWFpbkNoZWNrKHRoaXMpKSkge1xuICAgICAgICByZXR1cm4gbmV3IGlvLlRyYW5zcG9ydFt0cmFuc3BvcnRdKHRoaXMsIHRoaXMuc2Vzc2lvbmlkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICAvKipcbiAgICogQ29ubmVjdHMgdG8gdGhlIHNlcnZlci5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXSBDYWxsYmFjay5cbiAgICogQHJldHVybnMge2lvLlNvY2tldH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgaWYgKHRoaXMuY29ubmVjdGluZykge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuY29ubmVjdGluZyA9IHRydWU7XG4gICAgXG4gICAgdGhpcy5oYW5kc2hha2UoZnVuY3Rpb24gKHNpZCwgaGVhcnRiZWF0LCBjbG9zZSwgdHJhbnNwb3J0cykge1xuICAgICAgc2VsZi5zZXNzaW9uaWQgPSBzaWQ7XG4gICAgICBzZWxmLmNsb3NlVGltZW91dCA9IGNsb3NlICogMTAwMDtcbiAgICAgIHNlbGYuaGVhcnRiZWF0VGltZW91dCA9IGhlYXJ0YmVhdCAqIDEwMDA7XG4gICAgICBpZighc2VsZi50cmFuc3BvcnRzKVxuICAgICAgICAgIHNlbGYudHJhbnNwb3J0cyA9IHNlbGYub3JpZ1RyYW5zcG9ydHMgPSAodHJhbnNwb3J0cyA/IGlvLnV0aWwuaW50ZXJzZWN0KFxuICAgICAgICAgICAgICB0cmFuc3BvcnRzLnNwbGl0KCcsJylcbiAgICAgICAgICAgICwgc2VsZi5vcHRpb25zLnRyYW5zcG9ydHNcbiAgICAgICAgICApIDogc2VsZi5vcHRpb25zLnRyYW5zcG9ydHMpO1xuXG4gICAgICBzZWxmLnNldEhlYXJ0YmVhdFRpbWVvdXQoKTtcblxuICAgICAgZnVuY3Rpb24gY29ubmVjdCAodHJhbnNwb3J0cyl7XG4gICAgICAgIGlmIChzZWxmLnRyYW5zcG9ydCkgc2VsZi50cmFuc3BvcnQuY2xlYXJUaW1lb3V0cygpO1xuXG4gICAgICAgIHNlbGYudHJhbnNwb3J0ID0gc2VsZi5nZXRUcmFuc3BvcnQodHJhbnNwb3J0cyk7XG4gICAgICAgIGlmICghc2VsZi50cmFuc3BvcnQpIHJldHVybiBzZWxmLnB1Ymxpc2goJ2Nvbm5lY3RfZmFpbGVkJyk7XG5cbiAgICAgICAgLy8gb25jZSB0aGUgdHJhbnNwb3J0IGlzIHJlYWR5XG4gICAgICAgIHNlbGYudHJhbnNwb3J0LnJlYWR5KHNlbGYsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzZWxmLmNvbm5lY3RpbmcgPSB0cnVlO1xuICAgICAgICAgIHNlbGYucHVibGlzaCgnY29ubmVjdGluZycsIHNlbGYudHJhbnNwb3J0Lm5hbWUpO1xuICAgICAgICAgIHNlbGYudHJhbnNwb3J0Lm9wZW4oKTtcblxuICAgICAgICAgIGlmIChzZWxmLm9wdGlvbnNbJ2Nvbm5lY3QgdGltZW91dCddKSB7XG4gICAgICAgICAgICBzZWxmLmNvbm5lY3RUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgaWYgKCFzZWxmLmNvbm5lY3RlZCkge1xuICAgICAgICAgICAgICAgIHNlbGYuY29ubmVjdGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYub3B0aW9uc1sndHJ5IG11bHRpcGxlIHRyYW5zcG9ydHMnXSkge1xuICAgICAgICAgICAgICAgICAgdmFyIHJlbWFpbmluZyA9IHNlbGYudHJhbnNwb3J0cztcblxuICAgICAgICAgICAgICAgICAgd2hpbGUgKHJlbWFpbmluZy5sZW5ndGggPiAwICYmIHJlbWFpbmluZy5zcGxpY2UoMCwxKVswXSAhPVxuICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0Lm5hbWUpIHt9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbWFpbmluZy5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgIGNvbm5lY3QocmVtYWluaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBzZWxmLnB1Ymxpc2goJ2Nvbm5lY3RfZmFpbGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHNlbGYub3B0aW9uc1snY29ubmVjdCB0aW1lb3V0J10pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGNvbm5lY3Qoc2VsZi50cmFuc3BvcnRzKTtcblxuICAgICAgc2VsZi5vbmNlKCdjb25uZWN0JywgZnVuY3Rpb24gKCl7XG4gICAgICAgIGNsZWFyVGltZW91dChzZWxmLmNvbm5lY3RUaW1lb3V0VGltZXIpO1xuXG4gICAgICAgIGZuICYmIHR5cGVvZiBmbiA9PSAnZnVuY3Rpb24nICYmIGZuKCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDbGVhcnMgYW5kIHNldHMgYSBuZXcgaGVhcnRiZWF0IHRpbWVvdXQgdXNpbmcgdGhlIHZhbHVlIGdpdmVuIGJ5IHRoZVxuICAgKiBzZXJ2ZXIgZHVyaW5nIHRoZSBoYW5kc2hha2UuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLnNldEhlYXJ0YmVhdFRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuaGVhcnRiZWF0VGltZW91dFRpbWVyKTtcbiAgICBpZih0aGlzLnRyYW5zcG9ydCAmJiAhdGhpcy50cmFuc3BvcnQuaGVhcnRiZWF0cygpKSByZXR1cm47XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5oZWFydGJlYXRUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYudHJhbnNwb3J0Lm9uQ2xvc2UoKTtcbiAgICB9LCB0aGlzLmhlYXJ0YmVhdFRpbWVvdXQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZW5kcyBhIG1lc3NhZ2UuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIHBhY2tldC5cbiAgICogQHJldHVybnMge2lvLlNvY2tldH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5wYWNrZXQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGlmICh0aGlzLmNvbm5lY3RlZCAmJiAhdGhpcy5kb0J1ZmZlcikge1xuICAgICAgdGhpcy50cmFuc3BvcnQucGFja2V0KGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJ1ZmZlci5wdXNoKGRhdGEpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZXRzIGJ1ZmZlciBzdGF0ZVxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5zZXRCdWZmZXIgPSBmdW5jdGlvbiAodikge1xuICAgIHRoaXMuZG9CdWZmZXIgPSB2O1xuXG4gICAgaWYgKCF2ICYmIHRoaXMuY29ubmVjdGVkICYmIHRoaXMuYnVmZmVyLmxlbmd0aCkge1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnNbJ21hbnVhbEZsdXNoJ10pIHtcbiAgICAgICAgdGhpcy5mbHVzaEJ1ZmZlcigpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogRmx1c2hlcyB0aGUgYnVmZmVyIGRhdGEgb3ZlciB0aGUgd2lyZS5cbiAgICogVG8gYmUgaW52b2tlZCBtYW51YWxseSB3aGVuICdtYW51YWxGbHVzaCcgaXMgc2V0IHRvIHRydWUuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUuZmx1c2hCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRyYW5zcG9ydC5wYXlsb2FkKHRoaXMuYnVmZmVyKTtcbiAgICB0aGlzLmJ1ZmZlciA9IFtdO1xuICB9O1xuICBcblxuICAvKipcbiAgICogRGlzY29ubmVjdCB0aGUgZXN0YWJsaXNoZWQgY29ubmVjdC5cbiAgICpcbiAgICogQHJldHVybnMge2lvLlNvY2tldH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmNvbm5lY3RlZCB8fCB0aGlzLmNvbm5lY3RpbmcpIHtcbiAgICAgIGlmICh0aGlzLm9wZW4pIHtcbiAgICAgICAgdGhpcy5vZignJykucGFja2V0KHsgdHlwZTogJ2Rpc2Nvbm5lY3QnIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBoYW5kbGUgZGlzY29ubmVjdGlvbiBpbW1lZGlhdGVseVxuICAgICAgdGhpcy5vbkRpc2Nvbm5lY3QoJ2Jvb3RlZCcpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0cyB0aGUgc29ja2V0IHdpdGggYSBzeW5jIFhIUi5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUuZGlzY29ubmVjdFN5bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gZW5zdXJlIGRpc2Nvbm5lY3Rpb25cbiAgICB2YXIgeGhyID0gaW8udXRpbC5yZXF1ZXN0KCk7XG4gICAgdmFyIHVyaSA9IFtcbiAgICAgICAgJ2h0dHAnICsgKHRoaXMub3B0aW9ucy5zZWN1cmUgPyAncycgOiAnJykgKyAnOi8nXG4gICAgICAsIHRoaXMub3B0aW9ucy5ob3N0ICsgJzonICsgdGhpcy5vcHRpb25zLnBvcnRcbiAgICAgICwgdGhpcy5vcHRpb25zLnJlc291cmNlXG4gICAgICAsIGlvLnByb3RvY29sXG4gICAgICAsICcnXG4gICAgICAsIHRoaXMuc2Vzc2lvbmlkXG4gICAgXS5qb2luKCcvJykgKyAnLz9kaXNjb25uZWN0PTEnO1xuXG4gICAgeGhyLm9wZW4oJ0dFVCcsIHVyaSwgZmFsc2UpO1xuICAgIHhoci5zZW5kKG51bGwpO1xuXG4gICAgLy8gaGFuZGxlIGRpc2Nvbm5lY3Rpb24gaW1tZWRpYXRlbHlcbiAgICB0aGlzLm9uRGlzY29ubmVjdCgnYm9vdGVkJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHdlIG5lZWQgdG8gdXNlIGNyb3NzIGRvbWFpbiBlbmFibGVkIHRyYW5zcG9ydHMuIENyb3NzIGRvbWFpbiB3b3VsZFxuICAgKiBiZSBhIGRpZmZlcmVudCBwb3J0IG9yIGRpZmZlcmVudCBkb21haW4gbmFtZS5cbiAgICpcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLmlzWERvbWFpbiA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBwb3J0ID0gZ2xvYmFsLmxvY2F0aW9uLnBvcnQgfHxcbiAgICAgICgnaHR0cHM6JyA9PSBnbG9iYWwubG9jYXRpb24ucHJvdG9jb2wgPyA0NDMgOiA4MCk7XG5cbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmhvc3QgIT09IGdsb2JhbC5sb2NhdGlvbi5ob3N0bmFtZSBcbiAgICAgIHx8IHRoaXMub3B0aW9ucy5wb3J0ICE9IHBvcnQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxlZCB1cG9uIGhhbmRzaGFrZS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUub25Db25uZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5jb25uZWN0ZWQpIHtcbiAgICAgIHRoaXMuY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuY29ubmVjdGluZyA9IGZhbHNlO1xuICAgICAgaWYgKCF0aGlzLmRvQnVmZmVyKSB7XG4gICAgICAgIC8vIG1ha2Ugc3VyZSB0byBmbHVzaCB0aGUgYnVmZmVyXG4gICAgICAgIHRoaXMuc2V0QnVmZmVyKGZhbHNlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZW1pdCgnY29ubmVjdCcpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHRyYW5zcG9ydCBvcGVuc1xuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5vbk9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5vcGVuID0gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHRyYW5zcG9ydCBjbG9zZXMuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLm9uQ2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuaGVhcnRiZWF0VGltZW91dFRpbWVyKTtcbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHRyYW5zcG9ydCBmaXJzdCBvcGVucyBhIGNvbm5lY3Rpb25cbiAgICpcbiAgICogQHBhcmFtIHRleHRcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5vblBhY2tldCA9IGZ1bmN0aW9uIChwYWNrZXQpIHtcbiAgICB0aGlzLm9mKHBhY2tldC5lbmRwb2ludCkub25QYWNrZXQocGFja2V0KTtcbiAgfTtcblxuICAvKipcbiAgICogSGFuZGxlcyBhbiBlcnJvci5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUub25FcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICBpZiAoZXJyICYmIGVyci5hZHZpY2UpIHtcbiAgICAgIGlmIChlcnIuYWR2aWNlID09PSAncmVjb25uZWN0JyAmJiAodGhpcy5jb25uZWN0ZWQgfHwgdGhpcy5jb25uZWN0aW5nKSkge1xuICAgICAgICB0aGlzLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yZWNvbm5lY3QpIHtcbiAgICAgICAgICB0aGlzLnJlY29ubmVjdCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5wdWJsaXNoKCdlcnJvcicsIGVyciAmJiBlcnIucmVhc29uID8gZXJyLnJlYXNvbiA6IGVycik7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSB0cmFuc3BvcnQgZGlzY29ubmVjdHMuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLm9uRGlzY29ubmVjdCA9IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICB2YXIgd2FzQ29ubmVjdGVkID0gdGhpcy5jb25uZWN0ZWRcbiAgICAgICwgd2FzQ29ubmVjdGluZyA9IHRoaXMuY29ubmVjdGluZztcblxuICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5jb25uZWN0aW5nID0gZmFsc2U7XG4gICAgdGhpcy5vcGVuID0gZmFsc2U7XG5cbiAgICBpZiAod2FzQ29ubmVjdGVkIHx8IHdhc0Nvbm5lY3RpbmcpIHtcbiAgICAgIHRoaXMudHJhbnNwb3J0LmNsb3NlKCk7XG4gICAgICB0aGlzLnRyYW5zcG9ydC5jbGVhclRpbWVvdXRzKCk7XG4gICAgICBpZiAod2FzQ29ubmVjdGVkKSB7XG4gICAgICAgIHRoaXMucHVibGlzaCgnZGlzY29ubmVjdCcsIHJlYXNvbik7XG5cbiAgICAgICAgaWYgKCdib290ZWQnICE9IHJlYXNvbiAmJiB0aGlzLm9wdGlvbnMucmVjb25uZWN0ICYmICF0aGlzLnJlY29ubmVjdGluZykge1xuICAgICAgICAgIHRoaXMucmVjb25uZWN0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxlZCB1cG9uIHJlY29ubmVjdGlvbi5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUucmVjb25uZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucmVjb25uZWN0aW5nID0gdHJ1ZTtcbiAgICB0aGlzLnJlY29ubmVjdGlvbkF0dGVtcHRzID0gMDtcbiAgICB0aGlzLnJlY29ubmVjdGlvbkRlbGF5ID0gdGhpcy5vcHRpb25zWydyZWNvbm5lY3Rpb24gZGVsYXknXTtcblxuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCBtYXhBdHRlbXB0cyA9IHRoaXMub3B0aW9uc1snbWF4IHJlY29ubmVjdGlvbiBhdHRlbXB0cyddXG4gICAgICAsIHRyeU11bHRpcGxlID0gdGhpcy5vcHRpb25zWyd0cnkgbXVsdGlwbGUgdHJhbnNwb3J0cyddXG4gICAgICAsIGxpbWl0ID0gdGhpcy5vcHRpb25zWydyZWNvbm5lY3Rpb24gbGltaXQnXTtcblxuICAgIGZ1bmN0aW9uIHJlc2V0ICgpIHtcbiAgICAgIGlmIChzZWxmLmNvbm5lY3RlZCkge1xuICAgICAgICBmb3IgKHZhciBpIGluIHNlbGYubmFtZXNwYWNlcykge1xuICAgICAgICAgIGlmIChzZWxmLm5hbWVzcGFjZXMuaGFzT3duUHJvcGVydHkoaSkgJiYgJycgIT09IGkpIHtcbiAgICAgICAgICAgICAgc2VsZi5uYW1lc3BhY2VzW2ldLnBhY2tldCh7IHR5cGU6ICdjb25uZWN0JyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5wdWJsaXNoKCdyZWNvbm5lY3QnLCBzZWxmLnRyYW5zcG9ydC5uYW1lLCBzZWxmLnJlY29ubmVjdGlvbkF0dGVtcHRzKTtcbiAgICAgIH1cblxuICAgICAgY2xlYXJUaW1lb3V0KHNlbGYucmVjb25uZWN0aW9uVGltZXIpO1xuXG4gICAgICBzZWxmLnJlbW92ZUxpc3RlbmVyKCdjb25uZWN0X2ZhaWxlZCcsIG1heWJlUmVjb25uZWN0KTtcbiAgICAgIHNlbGYucmVtb3ZlTGlzdGVuZXIoJ2Nvbm5lY3QnLCBtYXliZVJlY29ubmVjdCk7XG5cbiAgICAgIHNlbGYucmVjb25uZWN0aW5nID0gZmFsc2U7XG5cbiAgICAgIGRlbGV0ZSBzZWxmLnJlY29ubmVjdGlvbkF0dGVtcHRzO1xuICAgICAgZGVsZXRlIHNlbGYucmVjb25uZWN0aW9uRGVsYXk7XG4gICAgICBkZWxldGUgc2VsZi5yZWNvbm5lY3Rpb25UaW1lcjtcbiAgICAgIGRlbGV0ZSBzZWxmLnJlZG9UcmFuc3BvcnRzO1xuXG4gICAgICBzZWxmLm9wdGlvbnNbJ3RyeSBtdWx0aXBsZSB0cmFuc3BvcnRzJ10gPSB0cnlNdWx0aXBsZTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gbWF5YmVSZWNvbm5lY3QgKCkge1xuICAgICAgaWYgKCFzZWxmLnJlY29ubmVjdGluZykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChzZWxmLmNvbm5lY3RlZCkge1xuICAgICAgICByZXR1cm4gcmVzZXQoKTtcbiAgICAgIH07XG5cbiAgICAgIGlmIChzZWxmLmNvbm5lY3RpbmcgJiYgc2VsZi5yZWNvbm5lY3RpbmcpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYucmVjb25uZWN0aW9uVGltZXIgPSBzZXRUaW1lb3V0KG1heWJlUmVjb25uZWN0LCAxMDAwKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNlbGYucmVjb25uZWN0aW9uQXR0ZW1wdHMrKyA+PSBtYXhBdHRlbXB0cykge1xuICAgICAgICBpZiAoIXNlbGYucmVkb1RyYW5zcG9ydHMpIHtcbiAgICAgICAgICBzZWxmLm9uKCdjb25uZWN0X2ZhaWxlZCcsIG1heWJlUmVjb25uZWN0KTtcbiAgICAgICAgICBzZWxmLm9wdGlvbnNbJ3RyeSBtdWx0aXBsZSB0cmFuc3BvcnRzJ10gPSB0cnVlO1xuICAgICAgICAgIHNlbGYudHJhbnNwb3J0cyA9IHNlbGYub3JpZ1RyYW5zcG9ydHM7XG4gICAgICAgICAgc2VsZi50cmFuc3BvcnQgPSBzZWxmLmdldFRyYW5zcG9ydCgpO1xuICAgICAgICAgIHNlbGYucmVkb1RyYW5zcG9ydHMgPSB0cnVlO1xuICAgICAgICAgIHNlbGYuY29ubmVjdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYucHVibGlzaCgncmVjb25uZWN0X2ZhaWxlZCcpO1xuICAgICAgICAgIHJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzZWxmLnJlY29ubmVjdGlvbkRlbGF5IDwgbGltaXQpIHtcbiAgICAgICAgICBzZWxmLnJlY29ubmVjdGlvbkRlbGF5ICo9IDI7IC8vIGV4cG9uZW50aWFsIGJhY2sgb2ZmXG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLmNvbm5lY3QoKTtcbiAgICAgICAgc2VsZi5wdWJsaXNoKCdyZWNvbm5lY3RpbmcnLCBzZWxmLnJlY29ubmVjdGlvbkRlbGF5LCBzZWxmLnJlY29ubmVjdGlvbkF0dGVtcHRzKTtcbiAgICAgICAgc2VsZi5yZWNvbm5lY3Rpb25UaW1lciA9IHNldFRpbWVvdXQobWF5YmVSZWNvbm5lY3QsIHNlbGYucmVjb25uZWN0aW9uRGVsYXkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLm9wdGlvbnNbJ3RyeSBtdWx0aXBsZSB0cmFuc3BvcnRzJ10gPSBmYWxzZTtcbiAgICB0aGlzLnJlY29ubmVjdGlvblRpbWVyID0gc2V0VGltZW91dChtYXliZVJlY29ubmVjdCwgdGhpcy5yZWNvbm5lY3Rpb25EZWxheSk7XG5cbiAgICB0aGlzLm9uKCdjb25uZWN0JywgbWF5YmVSZWNvbm5lY3QpO1xuICB9O1xuXG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5leHBvcnRzXG4gICwgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUucGFyZW50LmV4cG9ydHNcbiAgLCB0aGlzXG4pO1xuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgaW8pIHtcblxuICAvKipcbiAgICogRXhwb3NlIGNvbnN0cnVjdG9yLlxuICAgKi9cblxuICBleHBvcnRzLlNvY2tldE5hbWVzcGFjZSA9IFNvY2tldE5hbWVzcGFjZTtcblxuICAvKipcbiAgICogU29ja2V0IG5hbWVzcGFjZSBjb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFNvY2tldE5hbWVzcGFjZSAoc29ja2V0LCBuYW1lKSB7XG4gICAgdGhpcy5zb2NrZXQgPSBzb2NrZXQ7XG4gICAgdGhpcy5uYW1lID0gbmFtZSB8fCAnJztcbiAgICB0aGlzLmZsYWdzID0ge307XG4gICAgdGhpcy5qc29uID0gbmV3IEZsYWcodGhpcywgJ2pzb24nKTtcbiAgICB0aGlzLmFja1BhY2tldHMgPSAwO1xuICAgIHRoaXMuYWNrcyA9IHt9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBBcHBseSBFdmVudEVtaXR0ZXIgbWl4aW4uXG4gICAqL1xuXG4gIGlvLnV0aWwubWl4aW4oU29ja2V0TmFtZXNwYWNlLCBpby5FdmVudEVtaXR0ZXIpO1xuXG4gIC8qKlxuICAgKiBDb3BpZXMgZW1pdCBzaW5jZSB3ZSBvdmVycmlkZSBpdFxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0TmFtZXNwYWNlLnByb3RvdHlwZS4kZW1pdCA9IGlvLkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdDtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBuYW1lc3BhY2UsIGJ5IHByb3h5aW5nIHRoZSByZXF1ZXN0IHRvIHRoZSBzb2NrZXQuIFRoaXNcbiAgICogYWxsb3dzIHVzIHRvIHVzZSB0aGUgc3luYXggYXMgd2UgZG8gb24gdGhlIHNlcnZlci5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgU29ja2V0TmFtZXNwYWNlLnByb3RvdHlwZS5vZiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5zb2NrZXQub2YuYXBwbHkodGhpcy5zb2NrZXQsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNlbmRzIGEgcGFja2V0LlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0TmFtZXNwYWNlLnByb3RvdHlwZS5wYWNrZXQgPSBmdW5jdGlvbiAocGFja2V0KSB7XG4gICAgcGFja2V0LmVuZHBvaW50ID0gdGhpcy5uYW1lO1xuICAgIHRoaXMuc29ja2V0LnBhY2tldChwYWNrZXQpO1xuICAgIHRoaXMuZmxhZ3MgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogU2VuZHMgYSBtZXNzYWdlXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFNvY2tldE5hbWVzcGFjZS5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uIChkYXRhLCBmbikge1xuICAgIHZhciBwYWNrZXQgPSB7XG4gICAgICAgIHR5cGU6IHRoaXMuZmxhZ3MuanNvbiA/ICdqc29uJyA6ICdtZXNzYWdlJ1xuICAgICAgLCBkYXRhOiBkYXRhXG4gICAgfTtcblxuICAgIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBmbikge1xuICAgICAgcGFja2V0LmlkID0gKyt0aGlzLmFja1BhY2tldHM7XG4gICAgICBwYWNrZXQuYWNrID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWNrc1twYWNrZXQuaWRdID0gZm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucGFja2V0KHBhY2tldCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEVtaXRzIGFuIGV2ZW50XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBcbiAgU29ja2V0TmFtZXNwYWNlLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgICAgICwgbGFzdEFyZyA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXVxuICAgICAgLCBwYWNrZXQgPSB7XG4gICAgICAgICAgICB0eXBlOiAnZXZlbnQnXG4gICAgICAgICAgLCBuYW1lOiBuYW1lXG4gICAgICAgIH07XG5cbiAgICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgbGFzdEFyZykge1xuICAgICAgcGFja2V0LmlkID0gKyt0aGlzLmFja1BhY2tldHM7XG4gICAgICBwYWNrZXQuYWNrID0gJ2RhdGEnO1xuICAgICAgdGhpcy5hY2tzW3BhY2tldC5pZF0gPSBsYXN0QXJnO1xuICAgICAgYXJncyA9IGFyZ3Muc2xpY2UoMCwgYXJncy5sZW5ndGggLSAxKTtcbiAgICB9XG5cbiAgICBwYWNrZXQuYXJncyA9IGFyZ3M7XG5cbiAgICByZXR1cm4gdGhpcy5wYWNrZXQocGFja2V0KTtcbiAgfTtcblxuICAvKipcbiAgICogRGlzY29ubmVjdHMgdGhlIG5hbWVzcGFjZVxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0TmFtZXNwYWNlLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLm5hbWUgPT09ICcnKSB7XG4gICAgICB0aGlzLnNvY2tldC5kaXNjb25uZWN0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGFja2V0KHsgdHlwZTogJ2Rpc2Nvbm5lY3QnIH0pO1xuICAgICAgdGhpcy4kZW1pdCgnZGlzY29ubmVjdCcpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGEgcGFja2V0XG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXROYW1lc3BhY2UucHJvdG90eXBlLm9uUGFja2V0ID0gZnVuY3Rpb24gKHBhY2tldCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIGFjayAoKSB7XG4gICAgICBzZWxmLnBhY2tldCh7XG4gICAgICAgICAgdHlwZTogJ2FjaydcbiAgICAgICAgLCBhcmdzOiBpby51dGlsLnRvQXJyYXkoYXJndW1lbnRzKVxuICAgICAgICAsIGFja0lkOiBwYWNrZXQuaWRcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBzd2l0Y2ggKHBhY2tldC50eXBlKSB7XG4gICAgICBjYXNlICdjb25uZWN0JzpcbiAgICAgICAgdGhpcy4kZW1pdCgnY29ubmVjdCcpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZGlzY29ubmVjdCc6XG4gICAgICAgIGlmICh0aGlzLm5hbWUgPT09ICcnKSB7XG4gICAgICAgICAgdGhpcy5zb2NrZXQub25EaXNjb25uZWN0KHBhY2tldC5yZWFzb24gfHwgJ2Jvb3RlZCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuJGVtaXQoJ2Rpc2Nvbm5lY3QnLCBwYWNrZXQucmVhc29uKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnbWVzc2FnZSc6XG4gICAgICBjYXNlICdqc29uJzpcbiAgICAgICAgdmFyIHBhcmFtcyA9IFsnbWVzc2FnZScsIHBhY2tldC5kYXRhXTtcblxuICAgICAgICBpZiAocGFja2V0LmFjayA9PSAnZGF0YScpIHtcbiAgICAgICAgICBwYXJhbXMucHVzaChhY2spO1xuICAgICAgICB9IGVsc2UgaWYgKHBhY2tldC5hY2spIHtcbiAgICAgICAgICB0aGlzLnBhY2tldCh7IHR5cGU6ICdhY2snLCBhY2tJZDogcGFja2V0LmlkIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy4kZW1pdC5hcHBseSh0aGlzLCBwYXJhbXMpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZXZlbnQnOlxuICAgICAgICB2YXIgcGFyYW1zID0gW3BhY2tldC5uYW1lXS5jb25jYXQocGFja2V0LmFyZ3MpO1xuXG4gICAgICAgIGlmIChwYWNrZXQuYWNrID09ICdkYXRhJylcbiAgICAgICAgICBwYXJhbXMucHVzaChhY2spO1xuXG4gICAgICAgIHRoaXMuJGVtaXQuYXBwbHkodGhpcywgcGFyYW1zKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Fjayc6XG4gICAgICAgIGlmICh0aGlzLmFja3NbcGFja2V0LmFja0lkXSkge1xuICAgICAgICAgIHRoaXMuYWNrc1twYWNrZXQuYWNrSWRdLmFwcGx5KHRoaXMsIHBhY2tldC5hcmdzKTtcbiAgICAgICAgICBkZWxldGUgdGhpcy5hY2tzW3BhY2tldC5hY2tJZF07XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgaWYgKHBhY2tldC5hZHZpY2Upe1xuICAgICAgICAgIHRoaXMuc29ja2V0Lm9uRXJyb3IocGFja2V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAocGFja2V0LnJlYXNvbiA9PSAndW5hdXRob3JpemVkJykge1xuICAgICAgICAgICAgdGhpcy4kZW1pdCgnY29ubmVjdF9mYWlsZWQnLCBwYWNrZXQucmVhc29uKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy4kZW1pdCgnZXJyb3InLCBwYWNrZXQucmVhc29uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBGbGFnIGludGVyZmFjZS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIEZsYWcgKG5zcCwgbmFtZSkge1xuICAgIHRoaXMubmFtZXNwYWNlID0gbnNwO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNlbmQgYSBtZXNzYWdlXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEZsYWcucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5uYW1lc3BhY2UuZmxhZ3NbdGhpcy5uYW1lXSA9IHRydWU7XG4gICAgdGhpcy5uYW1lc3BhY2Uuc2VuZC5hcHBseSh0aGlzLm5hbWVzcGFjZSwgYXJndW1lbnRzKTtcbiAgfTtcblxuICAvKipcbiAgICogRW1pdCBhbiBldmVudFxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBGbGFnLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMubmFtZXNwYWNlLmZsYWdzW3RoaXMubmFtZV0gPSB0cnVlO1xuICAgIHRoaXMubmFtZXNwYWNlLmVtaXQuYXBwbHkodGhpcy5uYW1lc3BhY2UsIGFyZ3VtZW50cyk7XG4gIH07XG5cbn0pKFxuICAgICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLmV4cG9ydHNcbiAgLCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5wYXJlbnQuZXhwb3J0c1xuKTtcblxuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgaW8sIGdsb2JhbCkge1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY29uc3RydWN0b3IuXG4gICAqL1xuXG4gIGV4cG9ydHMud2Vic29ja2V0ID0gV1M7XG5cbiAgLyoqXG4gICAqIFRoZSBXZWJTb2NrZXQgdHJhbnNwb3J0IHVzZXMgdGhlIEhUTUw1IFdlYlNvY2tldCBBUEkgdG8gZXN0YWJsaXNoIGFuXG4gICAqIHBlcnNpc3RlbnQgY29ubmVjdGlvbiB3aXRoIHRoZSBTb2NrZXQuSU8gc2VydmVyLiBUaGlzIHRyYW5zcG9ydCB3aWxsIGFsc29cbiAgICogYmUgaW5oZXJpdGVkIGJ5IHRoZSBGbGFzaFNvY2tldCBmYWxsYmFjayBhcyBpdCBwcm92aWRlcyBhIEFQSSBjb21wYXRpYmxlXG4gICAqIHBvbHlmaWxsIGZvciB0aGUgV2ViU29ja2V0cy5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBleHRlbmRzIHtpby5UcmFuc3BvcnR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFdTIChzb2NrZXQpIHtcbiAgICBpby5UcmFuc3BvcnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcblxuICAvKipcbiAgICogSW5oZXJpdHMgZnJvbSBUcmFuc3BvcnQuXG4gICAqL1xuXG4gIGlvLnV0aWwuaW5oZXJpdChXUywgaW8uVHJhbnNwb3J0KTtcblxuICAvKipcbiAgICogVHJhbnNwb3J0IG5hbWVcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgV1MucHJvdG90eXBlLm5hbWUgPSAnd2Vic29ja2V0JztcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgYSBuZXcgYFdlYlNvY2tldGAgY29ubmVjdGlvbiB3aXRoIHRoZSBTb2NrZXQuSU8gc2VydmVyLiBXZSBhdHRhY2hcbiAgICogYWxsIHRoZSBhcHByb3ByaWF0ZSBsaXN0ZW5lcnMgdG8gaGFuZGxlIHRoZSByZXNwb25zZXMgZnJvbSB0aGUgc2VydmVyLlxuICAgKlxuICAgKiBAcmV0dXJucyB7VHJhbnNwb3J0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBXUy5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcXVlcnkgPSBpby51dGlsLnF1ZXJ5KHRoaXMuc29ja2V0Lm9wdGlvbnMucXVlcnkpXG4gICAgICAsIHNlbGYgPSB0aGlzXG4gICAgICAsIFNvY2tldFxuXG5cbiAgICBpZiAoIVNvY2tldCkge1xuICAgICAgU29ja2V0ID0gZ2xvYmFsLk1veldlYlNvY2tldCB8fCBnbG9iYWwuV2ViU29ja2V0O1xuICAgIH1cblxuICAgIHRoaXMud2Vic29ja2V0ID0gbmV3IFNvY2tldCh0aGlzLnByZXBhcmVVcmwoKSArIHF1ZXJ5KTtcblxuICAgIHRoaXMud2Vic29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYub25PcGVuKCk7XG4gICAgICBzZWxmLnNvY2tldC5zZXRCdWZmZXIoZmFsc2UpO1xuICAgIH07XG4gICAgdGhpcy53ZWJzb2NrZXQub25tZXNzYWdlID0gZnVuY3Rpb24gKGV2KSB7XG4gICAgICBzZWxmLm9uRGF0YShldi5kYXRhKTtcbiAgICB9O1xuICAgIHRoaXMud2Vic29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLm9uQ2xvc2UoKTtcbiAgICAgIHNlbGYuc29ja2V0LnNldEJ1ZmZlcih0cnVlKTtcbiAgICB9O1xuICAgIHRoaXMud2Vic29ja2V0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgc2VsZi5vbkVycm9yKGUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogU2VuZCBhIG1lc3NhZ2UgdG8gdGhlIFNvY2tldC5JTyBzZXJ2ZXIuIFRoZSBtZXNzYWdlIHdpbGwgYXV0b21hdGljYWxseSBiZVxuICAgKiBlbmNvZGVkIGluIHRoZSBjb3JyZWN0IG1lc3NhZ2UgZm9ybWF0LlxuICAgKlxuICAgKiBAcmV0dXJucyB7VHJhbnNwb3J0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICAvLyBEbyB0byBhIGJ1ZyBpbiB0aGUgY3VycmVudCBJRGV2aWNlcyBicm93c2VyLCB3ZSBuZWVkIHRvIHdyYXAgdGhlIHNlbmQgaW4gYSBcbiAgLy8gc2V0VGltZW91dCwgd2hlbiB0aGV5IHJlc3VtZSBmcm9tIHNsZWVwaW5nIHRoZSBicm93c2VyIHdpbGwgY3Jhc2ggaWYgXG4gIC8vIHdlIGRvbid0IGFsbG93IHRoZSBicm93c2VyIHRpbWUgdG8gZGV0ZWN0IHRoZSBzb2NrZXQgaGFzIGJlZW4gY2xvc2VkXG4gIGlmIChpby51dGlsLnVhLmlEZXZpY2UpIHtcbiAgICBXUy5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgc2VsZi53ZWJzb2NrZXQuc2VuZChkYXRhKTtcbiAgICAgIH0sMCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIFdTLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIHRoaXMud2Vic29ja2V0LnNlbmQoZGF0YSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFBheWxvYWRcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFdTLnByb3RvdHlwZS5wYXlsb2FkID0gZnVuY3Rpb24gKGFycikge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXJyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdGhpcy5wYWNrZXQoYXJyW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIERpc2Nvbm5lY3QgdGhlIGVzdGFibGlzaGVkIGBXZWJTb2NrZXRgIGNvbm5lY3Rpb24uXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFdTLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLndlYnNvY2tldC5jbG9zZSgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIYW5kbGUgdGhlIGVycm9ycyB0aGF0IGBXZWJTb2NrZXRgIG1pZ2h0IGJlIGdpdmluZyB3aGVuIHdlXG4gICAqIGFyZSBhdHRlbXB0aW5nIHRvIGNvbm5lY3Qgb3Igc2VuZCBtZXNzYWdlcy5cbiAgICpcbiAgICogQHBhcmFtIHtFcnJvcn0gZSBUaGUgZXJyb3IuXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBXUy5wcm90b3R5cGUub25FcnJvciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgdGhpcy5zb2NrZXQub25FcnJvcihlKTtcbiAgfTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYXBwcm9wcmlhdGUgc2NoZW1lIGZvciB0aGUgVVJJIGdlbmVyYXRpb24uXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cbiAgV1MucHJvdG90eXBlLnNjaGVtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5zb2NrZXQub3B0aW9ucy5zZWN1cmUgPyAnd3NzJyA6ICd3cyc7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgYnJvd3NlciBoYXMgc3VwcG9ydCBmb3IgbmF0aXZlIGBXZWJTb2NrZXRzYCBhbmQgdGhhdFxuICAgKiBpdCdzIG5vdCB0aGUgcG9seWZpbGwgY3JlYXRlZCBmb3IgdGhlIEZsYXNoU29ja2V0IHRyYW5zcG9ydC5cbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgV1MuY2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICgnV2ViU29ja2V0JyBpbiBnbG9iYWwgJiYgISgnX19hZGRUYXNrJyBpbiBXZWJTb2NrZXQpKVxuICAgICAgICAgIHx8ICdNb3pXZWJTb2NrZXQnIGluIGdsb2JhbDtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIGBXZWJTb2NrZXRgIHRyYW5zcG9ydCBzdXBwb3J0IGNyb3NzIGRvbWFpbiBjb21tdW5pY2F0aW9ucy5cbiAgICpcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFdTLnhkb21haW5DaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkIHRoZSB0cmFuc3BvcnQgdG8geW91ciBwdWJsaWMgaW8udHJhbnNwb3J0cyBhcnJheS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGlvLnRyYW5zcG9ydHMucHVzaCgnd2Vic29ja2V0Jyk7XG5cbn0pKFxuICAgICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvLlRyYW5zcG9ydCA6IG1vZHVsZS5leHBvcnRzXG4gICwgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUucGFyZW50LmV4cG9ydHNcbiAgLCB0aGlzXG4pO1xuXG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBpbykge1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY29uc3RydWN0b3IuXG4gICAqL1xuXG4gIGV4cG9ydHMuZmxhc2hzb2NrZXQgPSBGbGFzaHNvY2tldDtcblxuICAvKipcbiAgICogVGhlIEZsYXNoU29ja2V0IHRyYW5zcG9ydC4gVGhpcyBpcyBhIEFQSSB3cmFwcGVyIGZvciB0aGUgSFRNTDUgV2ViU29ja2V0XG4gICAqIHNwZWNpZmljYXRpb24uIEl0IHVzZXMgYSAuc3dmIGZpbGUgdG8gY29tbXVuaWNhdGUgd2l0aCB0aGUgc2VydmVyLiBJZiB5b3Ugd2FudFxuICAgKiB0byBzZXJ2ZSB0aGUgLnN3ZiBmaWxlIGZyb20gYSBvdGhlciBzZXJ2ZXIgdGhhbiB3aGVyZSB0aGUgU29ja2V0LklPIHNjcmlwdCBpc1xuICAgKiBjb21pbmcgZnJvbSB5b3UgbmVlZCB0byB1c2UgdGhlIGluc2VjdXJlIHZlcnNpb24gb2YgdGhlIC5zd2YuIE1vcmUgaW5mb3JtYXRpb25cbiAgICogYWJvdXQgdGhpcyBjYW4gYmUgZm91bmQgb24gdGhlIGdpdGh1YiBwYWdlLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQGV4dGVuZHMge2lvLlRyYW5zcG9ydC53ZWJzb2NrZXR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIEZsYXNoc29ja2V0ICgpIHtcbiAgICBpby5UcmFuc3BvcnQud2Vic29ja2V0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaGVyaXRzIGZyb20gVHJhbnNwb3J0LlxuICAgKi9cblxuICBpby51dGlsLmluaGVyaXQoRmxhc2hzb2NrZXQsIGlvLlRyYW5zcG9ydC53ZWJzb2NrZXQpO1xuXG4gIC8qKlxuICAgKiBUcmFuc3BvcnQgbmFtZVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBGbGFzaHNvY2tldC5wcm90b3R5cGUubmFtZSA9ICdmbGFzaHNvY2tldCc7XG5cbiAgLyoqXG4gICAqIERpc2Nvbm5lY3QgdGhlIGVzdGFibGlzaGVkIGBGbGFzaFNvY2tldGAgY29ubmVjdGlvbi4gVGhpcyBpcyBkb25lIGJ5IGFkZGluZyBhIFxuICAgKiBuZXcgdGFzayB0byB0aGUgRmxhc2hTb2NrZXQuIFRoZSByZXN0IHdpbGwgYmUgaGFuZGxlZCBvZmYgYnkgdGhlIGBXZWJTb2NrZXRgIFxuICAgKiB0cmFuc3BvcnQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEZsYXNoc29ja2V0LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgV2ViU29ja2V0Ll9fYWRkVGFzayhmdW5jdGlvbiAoKSB7XG4gICAgICBpby5UcmFuc3BvcnQud2Vic29ja2V0LnByb3RvdHlwZS5vcGVuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBcbiAgLyoqXG4gICAqIFNlbmRzIGEgbWVzc2FnZSB0byB0aGUgU29ja2V0LklPIHNlcnZlci4gVGhpcyBpcyBkb25lIGJ5IGFkZGluZyBhIG5ld1xuICAgKiB0YXNrIHRvIHRoZSBGbGFzaFNvY2tldC4gVGhlIHJlc3Qgd2lsbCBiZSBoYW5kbGVkIG9mZiBieSB0aGUgYFdlYlNvY2tldGAgXG4gICAqIHRyYW5zcG9ydC5cbiAgICpcbiAgICogQHJldHVybnMge1RyYW5zcG9ydH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRmxhc2hzb2NrZXQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuICAgIFdlYlNvY2tldC5fX2FkZFRhc2soZnVuY3Rpb24gKCkge1xuICAgICAgaW8uVHJhbnNwb3J0LndlYnNvY2tldC5wcm90b3R5cGUuc2VuZC5hcHBseShzZWxmLCBhcmdzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogRGlzY29ubmVjdHMgdGhlIGVzdGFibGlzaGVkIGBGbGFzaFNvY2tldGAgY29ubmVjdGlvbi5cbiAgICpcbiAgICogQHJldHVybnMge1RyYW5zcG9ydH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRmxhc2hzb2NrZXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIFdlYlNvY2tldC5fX3Rhc2tzLmxlbmd0aCA9IDA7XG4gICAgaW8uVHJhbnNwb3J0LndlYnNvY2tldC5wcm90b3R5cGUuY2xvc2UuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogVGhlIFdlYlNvY2tldCBmYWxsIGJhY2sgbmVlZHMgdG8gYXBwZW5kIHRoZSBmbGFzaCBjb250YWluZXIgdG8gdGhlIGJvZHlcbiAgICogZWxlbWVudCwgc28gd2UgbmVlZCB0byBtYWtlIHN1cmUgd2UgaGF2ZSBhY2Nlc3MgdG8gaXQuIE9yIGRlZmVyIHRoZSBjYWxsXG4gICAqIHVudGlsIHdlIGFyZSBzdXJlIHRoZXJlIGlzIGEgYm9keSBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge1NvY2tldH0gc29ja2V0IFRoZSBzb2NrZXQgaW5zdGFuY2UgdGhhdCBuZWVkcyBhIHRyYW5zcG9ydFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2tcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIEZsYXNoc29ja2V0LnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uIChzb2NrZXQsIGZuKSB7XG4gICAgZnVuY3Rpb24gaW5pdCAoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHNvY2tldC5vcHRpb25zXG4gICAgICAgICwgcG9ydCA9IG9wdGlvbnNbJ2ZsYXNoIHBvbGljeSBwb3J0J11cbiAgICAgICAgLCBwYXRoID0gW1xuICAgICAgICAgICAgICAnaHR0cCcgKyAob3B0aW9ucy5zZWN1cmUgPyAncycgOiAnJykgKyAnOi8nXG4gICAgICAgICAgICAsIG9wdGlvbnMuaG9zdCArICc6JyArIG9wdGlvbnMucG9ydFxuICAgICAgICAgICAgLCBvcHRpb25zLnJlc291cmNlXG4gICAgICAgICAgICAsICdzdGF0aWMvZmxhc2hzb2NrZXQnXG4gICAgICAgICAgICAsICdXZWJTb2NrZXRNYWluJyArIChzb2NrZXQuaXNYRG9tYWluKCkgPyAnSW5zZWN1cmUnIDogJycpICsgJy5zd2YnXG4gICAgICAgICAgXTtcblxuICAgICAgLy8gT25seSBzdGFydCBkb3dubG9hZGluZyB0aGUgc3dmIGZpbGUgd2hlbiB0aGUgY2hlY2tlZCB0aGF0IHRoaXMgYnJvd3NlclxuICAgICAgLy8gYWN0dWFsbHkgc3VwcG9ydHMgaXRcbiAgICAgIGlmICghRmxhc2hzb2NrZXQubG9hZGVkKSB7XG4gICAgICAgIGlmICh0eXBlb2YgV0VCX1NPQ0tFVF9TV0ZfTE9DQVRJT04gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgLy8gU2V0IHRoZSBjb3JyZWN0IGZpbGUgYmFzZWQgb24gdGhlIFhEb21haW4gc2V0dGluZ3NcbiAgICAgICAgICBXRUJfU09DS0VUX1NXRl9MT0NBVElPTiA9IHBhdGguam9pbignLycpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvcnQgIT09IDg0Mykge1xuICAgICAgICAgIFdlYlNvY2tldC5sb2FkRmxhc2hQb2xpY3lGaWxlKCd4bWxzb2NrZXQ6Ly8nICsgb3B0aW9ucy5ob3N0ICsgJzonICsgcG9ydCk7XG4gICAgICAgIH1cblxuICAgICAgICBXZWJTb2NrZXQuX19pbml0aWFsaXplKCk7XG4gICAgICAgIEZsYXNoc29ja2V0LmxvYWRlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGZuLmNhbGwoc2VsZik7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChkb2N1bWVudC5ib2R5KSByZXR1cm4gaW5pdCgpO1xuXG4gICAgaW8udXRpbC5sb2FkKGluaXQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgRmxhc2hTb2NrZXQgdHJhbnNwb3J0IGlzIHN1cHBvcnRlZCBhcyBpdCByZXF1aXJlcyB0aGF0IHRoZSBBZG9iZVxuICAgKiBGbGFzaCBQbGF5ZXIgcGx1Zy1pbiB2ZXJzaW9uIGAxMC4wLjBgIG9yIGdyZWF0ZXIgaXMgaW5zdGFsbGVkLiBBbmQgYWxzbyBjaGVjayBpZlxuICAgKiB0aGUgcG9seWZpbGwgaXMgY29ycmVjdGx5IGxvYWRlZC5cbiAgICpcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEZsYXNoc29ja2V0LmNoZWNrID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChcbiAgICAgICAgdHlwZW9mIFdlYlNvY2tldCA9PSAndW5kZWZpbmVkJ1xuICAgICAgfHwgISgnX19pbml0aWFsaXplJyBpbiBXZWJTb2NrZXQpIHx8ICFzd2ZvYmplY3RcbiAgICApIHJldHVybiBmYWxzZTtcblxuICAgIHJldHVybiBzd2ZvYmplY3QuZ2V0Rmxhc2hQbGF5ZXJWZXJzaW9uKCkubWFqb3IgPj0gMTA7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBGbGFzaFNvY2tldCB0cmFuc3BvcnQgY2FuIGJlIHVzZWQgYXMgY3Jvc3MgZG9tYWluIC8gY3Jvc3Mgb3JpZ2luIFxuICAgKiB0cmFuc3BvcnQuIEJlY2F1c2Ugd2UgY2FuJ3Qgc2VlIHdoaWNoIHR5cGUgKHNlY3VyZSBvciBpbnNlY3VyZSkgb2YgLnN3ZiBpcyB1c2VkXG4gICAqIHdlIHdpbGwganVzdCByZXR1cm4gdHJ1ZS5cbiAgICpcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEZsYXNoc29ja2V0Lnhkb21haW5DaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogRGlzYWJsZSBBVVRPX0lOSVRJQUxJWkFUSU9OXG4gICAqL1xuXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnKSB7XG4gICAgV0VCX1NPQ0tFVF9ESVNBQkxFX0FVVE9fSU5JVElBTElaQVRJT04gPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgdHJhbnNwb3J0IHRvIHlvdXIgcHVibGljIGlvLnRyYW5zcG9ydHMgYXJyYXkuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBpby50cmFuc3BvcnRzLnB1c2goJ2ZsYXNoc29ja2V0Jyk7XG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpby5UcmFuc3BvcnQgOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4pO1xuLypcdFNXRk9iamVjdCB2Mi4yIDxodHRwOi8vY29kZS5nb29nbGUuY29tL3Avc3dmb2JqZWN0Lz4gXG5cdGlzIHJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSA8aHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHA+IFxuKi9cbmlmICgndW5kZWZpbmVkJyAhPSB0eXBlb2Ygd2luZG93KSB7XG52YXIgc3dmb2JqZWN0PWZ1bmN0aW9uKCl7dmFyIEQ9XCJ1bmRlZmluZWRcIixyPVwib2JqZWN0XCIsUz1cIlNob2Nrd2F2ZSBGbGFzaFwiLFc9XCJTaG9ja3dhdmVGbGFzaC5TaG9ja3dhdmVGbGFzaFwiLHE9XCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiLFI9XCJTV0ZPYmplY3RFeHBySW5zdFwiLHg9XCJvbnJlYWR5c3RhdGVjaGFuZ2VcIixPPXdpbmRvdyxqPWRvY3VtZW50LHQ9bmF2aWdhdG9yLFQ9ZmFsc2UsVT1baF0sbz1bXSxOPVtdLEk9W10sbCxRLEUsQixKPWZhbHNlLGE9ZmFsc2UsbixHLG09dHJ1ZSxNPWZ1bmN0aW9uKCl7dmFyIGFhPXR5cGVvZiBqLmdldEVsZW1lbnRCeUlkIT1EJiZ0eXBlb2Ygai5nZXRFbGVtZW50c0J5VGFnTmFtZSE9RCYmdHlwZW9mIGouY3JlYXRlRWxlbWVudCE9RCxhaD10LnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLFk9dC5wbGF0Zm9ybS50b0xvd2VyQ2FzZSgpLGFlPVk/L3dpbi8udGVzdChZKTovd2luLy50ZXN0KGFoKSxhYz1ZPy9tYWMvLnRlc3QoWSk6L21hYy8udGVzdChhaCksYWY9L3dlYmtpdC8udGVzdChhaCk/cGFyc2VGbG9hdChhaC5yZXBsYWNlKC9eLip3ZWJraXRcXC8oXFxkKyhcXC5cXGQrKT8pLiokLyxcIiQxXCIpKTpmYWxzZSxYPSErXCJcXHYxXCIsYWc9WzAsMCwwXSxhYj1udWxsO2lmKHR5cGVvZiB0LnBsdWdpbnMhPUQmJnR5cGVvZiB0LnBsdWdpbnNbU109PXIpe2FiPXQucGx1Z2luc1tTXS5kZXNjcmlwdGlvbjtpZihhYiYmISh0eXBlb2YgdC5taW1lVHlwZXMhPUQmJnQubWltZVR5cGVzW3FdJiYhdC5taW1lVHlwZXNbcV0uZW5hYmxlZFBsdWdpbikpe1Q9dHJ1ZTtYPWZhbHNlO2FiPWFiLnJlcGxhY2UoL14uKlxccysoXFxTK1xccytcXFMrJCkvLFwiJDFcIik7YWdbMF09cGFyc2VJbnQoYWIucmVwbGFjZSgvXiguKilcXC4uKiQvLFwiJDFcIiksMTApO2FnWzFdPXBhcnNlSW50KGFiLnJlcGxhY2UoL14uKlxcLiguKilcXHMuKiQvLFwiJDFcIiksMTApO2FnWzJdPS9bYS16QS1aXS8udGVzdChhYik/cGFyc2VJbnQoYWIucmVwbGFjZSgvXi4qW2EtekEtWl0rKC4qKSQvLFwiJDFcIiksMTApOjB9fWVsc2V7aWYodHlwZW9mIE9bKFsnQWN0aXZlJ10uY29uY2F0KCdPYmplY3QnKS5qb2luKCdYJykpXSE9RCl7dHJ5e3ZhciBhZD1uZXcgd2luZG93WyhbJ0FjdGl2ZSddLmNvbmNhdCgnT2JqZWN0Jykuam9pbignWCcpKV0oVyk7aWYoYWQpe2FiPWFkLkdldFZhcmlhYmxlKFwiJHZlcnNpb25cIik7aWYoYWIpe1g9dHJ1ZTthYj1hYi5zcGxpdChcIiBcIilbMV0uc3BsaXQoXCIsXCIpO2FnPVtwYXJzZUludChhYlswXSwxMCkscGFyc2VJbnQoYWJbMV0sMTApLHBhcnNlSW50KGFiWzJdLDEwKV19fX1jYXRjaChaKXt9fX1yZXR1cm57dzM6YWEscHY6YWcsd2s6YWYsaWU6WCx3aW46YWUsbWFjOmFjfX0oKSxrPWZ1bmN0aW9uKCl7aWYoIU0udzMpe3JldHVybn1pZigodHlwZW9mIGoucmVhZHlTdGF0ZSE9RCYmai5yZWFkeVN0YXRlPT1cImNvbXBsZXRlXCIpfHwodHlwZW9mIGoucmVhZHlTdGF0ZT09RCYmKGouZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdfHxqLmJvZHkpKSl7ZigpfWlmKCFKKXtpZih0eXBlb2Ygai5hZGRFdmVudExpc3RlbmVyIT1EKXtqLmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsZixmYWxzZSl9aWYoTS5pZSYmTS53aW4pe2ouYXR0YWNoRXZlbnQoeCxmdW5jdGlvbigpe2lmKGoucmVhZHlTdGF0ZT09XCJjb21wbGV0ZVwiKXtqLmRldGFjaEV2ZW50KHgsYXJndW1lbnRzLmNhbGxlZSk7ZigpfX0pO2lmKE89PXRvcCl7KGZ1bmN0aW9uKCl7aWYoSil7cmV0dXJufXRyeXtqLmRvY3VtZW50RWxlbWVudC5kb1Njcm9sbChcImxlZnRcIil9Y2F0Y2goWCl7c2V0VGltZW91dChhcmd1bWVudHMuY2FsbGVlLDApO3JldHVybn1mKCl9KSgpfX1pZihNLndrKXsoZnVuY3Rpb24oKXtpZihKKXtyZXR1cm59aWYoIS9sb2FkZWR8Y29tcGxldGUvLnRlc3Qoai5yZWFkeVN0YXRlKSl7c2V0VGltZW91dChhcmd1bWVudHMuY2FsbGVlLDApO3JldHVybn1mKCl9KSgpfXMoZil9fSgpO2Z1bmN0aW9uIGYoKXtpZihKKXtyZXR1cm59dHJ5e3ZhciBaPWouZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdLmFwcGVuZENoaWxkKEMoXCJzcGFuXCIpKTtaLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoWil9Y2F0Y2goYWEpe3JldHVybn1KPXRydWU7dmFyIFg9VS5sZW5ndGg7Zm9yKHZhciBZPTA7WTxYO1krKyl7VVtZXSgpfX1mdW5jdGlvbiBLKFgpe2lmKEope1goKX1lbHNle1VbVS5sZW5ndGhdPVh9fWZ1bmN0aW9uIHMoWSl7aWYodHlwZW9mIE8uYWRkRXZlbnRMaXN0ZW5lciE9RCl7Ty5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLFksZmFsc2UpfWVsc2V7aWYodHlwZW9mIGouYWRkRXZlbnRMaXN0ZW5lciE9RCl7ai5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLFksZmFsc2UpfWVsc2V7aWYodHlwZW9mIE8uYXR0YWNoRXZlbnQhPUQpe2koTyxcIm9ubG9hZFwiLFkpfWVsc2V7aWYodHlwZW9mIE8ub25sb2FkPT1cImZ1bmN0aW9uXCIpe3ZhciBYPU8ub25sb2FkO08ub25sb2FkPWZ1bmN0aW9uKCl7WCgpO1koKX19ZWxzZXtPLm9ubG9hZD1ZfX19fX1mdW5jdGlvbiBoKCl7aWYoVCl7VigpfWVsc2V7SCgpfX1mdW5jdGlvbiBWKCl7dmFyIFg9ai5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF07dmFyIGFhPUMocik7YWEuc2V0QXR0cmlidXRlKFwidHlwZVwiLHEpO3ZhciBaPVguYXBwZW5kQ2hpbGQoYWEpO2lmKFope3ZhciBZPTA7KGZ1bmN0aW9uKCl7aWYodHlwZW9mIFouR2V0VmFyaWFibGUhPUQpe3ZhciBhYj1aLkdldFZhcmlhYmxlKFwiJHZlcnNpb25cIik7aWYoYWIpe2FiPWFiLnNwbGl0KFwiIFwiKVsxXS5zcGxpdChcIixcIik7TS5wdj1bcGFyc2VJbnQoYWJbMF0sMTApLHBhcnNlSW50KGFiWzFdLDEwKSxwYXJzZUludChhYlsyXSwxMCldfX1lbHNle2lmKFk8MTApe1krKztzZXRUaW1lb3V0KGFyZ3VtZW50cy5jYWxsZWUsMTApO3JldHVybn19WC5yZW1vdmVDaGlsZChhYSk7Wj1udWxsO0goKX0pKCl9ZWxzZXtIKCl9fWZ1bmN0aW9uIEgoKXt2YXIgYWc9by5sZW5ndGg7aWYoYWc+MCl7Zm9yKHZhciBhZj0wO2FmPGFnO2FmKyspe3ZhciBZPW9bYWZdLmlkO3ZhciBhYj1vW2FmXS5jYWxsYmFja0ZuO3ZhciBhYT17c3VjY2VzczpmYWxzZSxpZDpZfTtpZihNLnB2WzBdPjApe3ZhciBhZT1jKFkpO2lmKGFlKXtpZihGKG9bYWZdLnN3ZlZlcnNpb24pJiYhKE0ud2smJk0ud2s8MzEyKSl7dyhZLHRydWUpO2lmKGFiKXthYS5zdWNjZXNzPXRydWU7YWEucmVmPXooWSk7YWIoYWEpfX1lbHNle2lmKG9bYWZdLmV4cHJlc3NJbnN0YWxsJiZBKCkpe3ZhciBhaT17fTthaS5kYXRhPW9bYWZdLmV4cHJlc3NJbnN0YWxsO2FpLndpZHRoPWFlLmdldEF0dHJpYnV0ZShcIndpZHRoXCIpfHxcIjBcIjthaS5oZWlnaHQ9YWUuZ2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIpfHxcIjBcIjtpZihhZS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSl7YWkuc3R5bGVjbGFzcz1hZS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKX1pZihhZS5nZXRBdHRyaWJ1dGUoXCJhbGlnblwiKSl7YWkuYWxpZ249YWUuZ2V0QXR0cmlidXRlKFwiYWxpZ25cIil9dmFyIGFoPXt9O3ZhciBYPWFlLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwicGFyYW1cIik7dmFyIGFjPVgubGVuZ3RoO2Zvcih2YXIgYWQ9MDthZDxhYzthZCsrKXtpZihYW2FkXS5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpLnRvTG93ZXJDYXNlKCkhPVwibW92aWVcIil7YWhbWFthZF0uZ2V0QXR0cmlidXRlKFwibmFtZVwiKV09WFthZF0uZ2V0QXR0cmlidXRlKFwidmFsdWVcIil9fVAoYWksYWgsWSxhYil9ZWxzZXtwKGFlKTtpZihhYil7YWIoYWEpfX19fX1lbHNle3coWSx0cnVlKTtpZihhYil7dmFyIFo9eihZKTtpZihaJiZ0eXBlb2YgWi5TZXRWYXJpYWJsZSE9RCl7YWEuc3VjY2Vzcz10cnVlO2FhLnJlZj1afWFiKGFhKX19fX19ZnVuY3Rpb24geihhYSl7dmFyIFg9bnVsbDt2YXIgWT1jKGFhKTtpZihZJiZZLm5vZGVOYW1lPT1cIk9CSkVDVFwiKXtpZih0eXBlb2YgWS5TZXRWYXJpYWJsZSE9RCl7WD1ZfWVsc2V7dmFyIFo9WS5nZXRFbGVtZW50c0J5VGFnTmFtZShyKVswXTtpZihaKXtYPVp9fX1yZXR1cm4gWH1mdW5jdGlvbiBBKCl7cmV0dXJuICFhJiZGKFwiNi4wLjY1XCIpJiYoTS53aW58fE0ubWFjKSYmIShNLndrJiZNLndrPDMxMil9ZnVuY3Rpb24gUChhYSxhYixYLFope2E9dHJ1ZTtFPVp8fG51bGw7Qj17c3VjY2VzczpmYWxzZSxpZDpYfTt2YXIgYWU9YyhYKTtpZihhZSl7aWYoYWUubm9kZU5hbWU9PVwiT0JKRUNUXCIpe2w9ZyhhZSk7UT1udWxsfWVsc2V7bD1hZTtRPVh9YWEuaWQ9UjtpZih0eXBlb2YgYWEud2lkdGg9PUR8fCghLyUkLy50ZXN0KGFhLndpZHRoKSYmcGFyc2VJbnQoYWEud2lkdGgsMTApPDMxMCkpe2FhLndpZHRoPVwiMzEwXCJ9aWYodHlwZW9mIGFhLmhlaWdodD09RHx8KCEvJSQvLnRlc3QoYWEuaGVpZ2h0KSYmcGFyc2VJbnQoYWEuaGVpZ2h0LDEwKTwxMzcpKXthYS5oZWlnaHQ9XCIxMzdcIn1qLnRpdGxlPWoudGl0bGUuc2xpY2UoMCw0NykrXCIgLSBGbGFzaCBQbGF5ZXIgSW5zdGFsbGF0aW9uXCI7dmFyIGFkPU0uaWUmJk0ud2luPyhbJ0FjdGl2ZSddLmNvbmNhdCgnJykuam9pbignWCcpKTpcIlBsdWdJblwiLGFjPVwiTU1yZWRpcmVjdFVSTD1cIitPLmxvY2F0aW9uLnRvU3RyaW5nKCkucmVwbGFjZSgvJi9nLFwiJTI2XCIpK1wiJk1NcGxheWVyVHlwZT1cIithZCtcIiZNTWRvY3RpdGxlPVwiK2oudGl0bGU7aWYodHlwZW9mIGFiLmZsYXNodmFycyE9RCl7YWIuZmxhc2h2YXJzKz1cIiZcIithY31lbHNle2FiLmZsYXNodmFycz1hY31pZihNLmllJiZNLndpbiYmYWUucmVhZHlTdGF0ZSE9NCl7dmFyIFk9QyhcImRpdlwiKTtYKz1cIlNXRk9iamVjdE5ld1wiO1kuc2V0QXR0cmlidXRlKFwiaWRcIixYKTthZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShZLGFlKTthZS5zdHlsZS5kaXNwbGF5PVwibm9uZVwiOyhmdW5jdGlvbigpe2lmKGFlLnJlYWR5U3RhdGU9PTQpe2FlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoYWUpfWVsc2V7c2V0VGltZW91dChhcmd1bWVudHMuY2FsbGVlLDEwKX19KSgpfXUoYWEsYWIsWCl9fWZ1bmN0aW9uIHAoWSl7aWYoTS5pZSYmTS53aW4mJlkucmVhZHlTdGF0ZSE9NCl7dmFyIFg9QyhcImRpdlwiKTtZLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKFgsWSk7WC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChnKFkpLFgpO1kuc3R5bGUuZGlzcGxheT1cIm5vbmVcIjsoZnVuY3Rpb24oKXtpZihZLnJlYWR5U3RhdGU9PTQpe1kucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChZKX1lbHNle3NldFRpbWVvdXQoYXJndW1lbnRzLmNhbGxlZSwxMCl9fSkoKX1lbHNle1kucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoZyhZKSxZKX19ZnVuY3Rpb24gZyhhYil7dmFyIGFhPUMoXCJkaXZcIik7aWYoTS53aW4mJk0uaWUpe2FhLmlubmVySFRNTD1hYi5pbm5lckhUTUx9ZWxzZXt2YXIgWT1hYi5nZXRFbGVtZW50c0J5VGFnTmFtZShyKVswXTtpZihZKXt2YXIgYWQ9WS5jaGlsZE5vZGVzO2lmKGFkKXt2YXIgWD1hZC5sZW5ndGg7Zm9yKHZhciBaPTA7WjxYO1orKyl7aWYoIShhZFtaXS5ub2RlVHlwZT09MSYmYWRbWl0ubm9kZU5hbWU9PVwiUEFSQU1cIikmJiEoYWRbWl0ubm9kZVR5cGU9PTgpKXthYS5hcHBlbmRDaGlsZChhZFtaXS5jbG9uZU5vZGUodHJ1ZSkpfX19fX1yZXR1cm4gYWF9ZnVuY3Rpb24gdShhaSxhZyxZKXt2YXIgWCxhYT1jKFkpO2lmKE0ud2smJk0ud2s8MzEyKXtyZXR1cm4gWH1pZihhYSl7aWYodHlwZW9mIGFpLmlkPT1EKXthaS5pZD1ZfWlmKE0uaWUmJk0ud2luKXt2YXIgYWg9XCJcIjtmb3IodmFyIGFlIGluIGFpKXtpZihhaVthZV0hPU9iamVjdC5wcm90b3R5cGVbYWVdKXtpZihhZS50b0xvd2VyQ2FzZSgpPT1cImRhdGFcIil7YWcubW92aWU9YWlbYWVdfWVsc2V7aWYoYWUudG9Mb3dlckNhc2UoKT09XCJzdHlsZWNsYXNzXCIpe2FoKz0nIGNsYXNzPVwiJythaVthZV0rJ1wiJ31lbHNle2lmKGFlLnRvTG93ZXJDYXNlKCkhPVwiY2xhc3NpZFwiKXthaCs9XCIgXCIrYWUrJz1cIicrYWlbYWVdKydcIid9fX19fXZhciBhZj1cIlwiO2Zvcih2YXIgYWQgaW4gYWcpe2lmKGFnW2FkXSE9T2JqZWN0LnByb3RvdHlwZVthZF0pe2FmKz0nPHBhcmFtIG5hbWU9XCInK2FkKydcIiB2YWx1ZT1cIicrYWdbYWRdKydcIiAvPid9fWFhLm91dGVySFRNTD0nPG9iamVjdCBjbGFzc2lkPVwiY2xzaWQ6RDI3Q0RCNkUtQUU2RC0xMWNmLTk2QjgtNDQ0NTUzNTQwMDAwXCInK2FoK1wiPlwiK2FmK1wiPC9vYmplY3Q+XCI7TltOLmxlbmd0aF09YWkuaWQ7WD1jKGFpLmlkKX1lbHNle3ZhciBaPUMocik7Wi5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIscSk7Zm9yKHZhciBhYyBpbiBhaSl7aWYoYWlbYWNdIT1PYmplY3QucHJvdG90eXBlW2FjXSl7aWYoYWMudG9Mb3dlckNhc2UoKT09XCJzdHlsZWNsYXNzXCIpe1ouc2V0QXR0cmlidXRlKFwiY2xhc3NcIixhaVthY10pfWVsc2V7aWYoYWMudG9Mb3dlckNhc2UoKSE9XCJjbGFzc2lkXCIpe1ouc2V0QXR0cmlidXRlKGFjLGFpW2FjXSl9fX19Zm9yKHZhciBhYiBpbiBhZyl7aWYoYWdbYWJdIT1PYmplY3QucHJvdG90eXBlW2FiXSYmYWIudG9Mb3dlckNhc2UoKSE9XCJtb3ZpZVwiKXtlKFosYWIsYWdbYWJdKX19YWEucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoWixhYSk7WD1afX1yZXR1cm4gWH1mdW5jdGlvbiBlKFosWCxZKXt2YXIgYWE9QyhcInBhcmFtXCIpO2FhLnNldEF0dHJpYnV0ZShcIm5hbWVcIixYKTthYS5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLFkpO1ouYXBwZW5kQ2hpbGQoYWEpfWZ1bmN0aW9uIHkoWSl7dmFyIFg9YyhZKTtpZihYJiZYLm5vZGVOYW1lPT1cIk9CSkVDVFwiKXtpZihNLmllJiZNLndpbil7WC5zdHlsZS5kaXNwbGF5PVwibm9uZVwiOyhmdW5jdGlvbigpe2lmKFgucmVhZHlTdGF0ZT09NCl7YihZKX1lbHNle3NldFRpbWVvdXQoYXJndW1lbnRzLmNhbGxlZSwxMCl9fSkoKX1lbHNle1gucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChYKX19fWZ1bmN0aW9uIGIoWil7dmFyIFk9YyhaKTtpZihZKXtmb3IodmFyIFggaW4gWSl7aWYodHlwZW9mIFlbWF09PVwiZnVuY3Rpb25cIil7WVtYXT1udWxsfX1ZLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoWSl9fWZ1bmN0aW9uIGMoWil7dmFyIFg9bnVsbDt0cnl7WD1qLmdldEVsZW1lbnRCeUlkKFopfWNhdGNoKFkpe31yZXR1cm4gWH1mdW5jdGlvbiBDKFgpe3JldHVybiBqLmNyZWF0ZUVsZW1lbnQoWCl9ZnVuY3Rpb24gaShaLFgsWSl7Wi5hdHRhY2hFdmVudChYLFkpO0lbSS5sZW5ndGhdPVtaLFgsWV19ZnVuY3Rpb24gRihaKXt2YXIgWT1NLnB2LFg9Wi5zcGxpdChcIi5cIik7WFswXT1wYXJzZUludChYWzBdLDEwKTtYWzFdPXBhcnNlSW50KFhbMV0sMTApfHwwO1hbMl09cGFyc2VJbnQoWFsyXSwxMCl8fDA7cmV0dXJuKFlbMF0+WFswXXx8KFlbMF09PVhbMF0mJllbMV0+WFsxXSl8fChZWzBdPT1YWzBdJiZZWzFdPT1YWzFdJiZZWzJdPj1YWzJdKSk/dHJ1ZTpmYWxzZX1mdW5jdGlvbiB2KGFjLFksYWQsYWIpe2lmKE0uaWUmJk0ubWFjKXtyZXR1cm59dmFyIGFhPWouZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdO2lmKCFhYSl7cmV0dXJufXZhciBYPShhZCYmdHlwZW9mIGFkPT1cInN0cmluZ1wiKT9hZDpcInNjcmVlblwiO2lmKGFiKXtuPW51bGw7Rz1udWxsfWlmKCFufHxHIT1YKXt2YXIgWj1DKFwic3R5bGVcIik7Wi5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsXCJ0ZXh0L2Nzc1wiKTtaLnNldEF0dHJpYnV0ZShcIm1lZGlhXCIsWCk7bj1hYS5hcHBlbmRDaGlsZChaKTtpZihNLmllJiZNLndpbiYmdHlwZW9mIGouc3R5bGVTaGVldHMhPUQmJmouc3R5bGVTaGVldHMubGVuZ3RoPjApe249ai5zdHlsZVNoZWV0c1tqLnN0eWxlU2hlZXRzLmxlbmd0aC0xXX1HPVh9aWYoTS5pZSYmTS53aW4pe2lmKG4mJnR5cGVvZiBuLmFkZFJ1bGU9PXIpe24uYWRkUnVsZShhYyxZKX19ZWxzZXtpZihuJiZ0eXBlb2Ygai5jcmVhdGVUZXh0Tm9kZSE9RCl7bi5hcHBlbmRDaGlsZChqLmNyZWF0ZVRleHROb2RlKGFjK1wiIHtcIitZK1wifVwiKSl9fX1mdW5jdGlvbiB3KFosWCl7aWYoIW0pe3JldHVybn12YXIgWT1YP1widmlzaWJsZVwiOlwiaGlkZGVuXCI7aWYoSiYmYyhaKSl7YyhaKS5zdHlsZS52aXNpYmlsaXR5PVl9ZWxzZXt2KFwiI1wiK1osXCJ2aXNpYmlsaXR5OlwiK1kpfX1mdW5jdGlvbiBMKFkpe3ZhciBaPS9bXFxcXFxcXCI8PlxcLjtdLzt2YXIgWD1aLmV4ZWMoWSkhPW51bGw7cmV0dXJuIFgmJnR5cGVvZiBlbmNvZGVVUklDb21wb25lbnQhPUQ/ZW5jb2RlVVJJQ29tcG9uZW50KFkpOll9dmFyIGQ9ZnVuY3Rpb24oKXtpZihNLmllJiZNLndpbil7d2luZG93LmF0dGFjaEV2ZW50KFwib251bmxvYWRcIixmdW5jdGlvbigpe3ZhciBhYz1JLmxlbmd0aDtmb3IodmFyIGFiPTA7YWI8YWM7YWIrKyl7SVthYl1bMF0uZGV0YWNoRXZlbnQoSVthYl1bMV0sSVthYl1bMl0pfXZhciBaPU4ubGVuZ3RoO2Zvcih2YXIgYWE9MDthYTxaO2FhKyspe3koTlthYV0pfWZvcih2YXIgWSBpbiBNKXtNW1ldPW51bGx9TT1udWxsO2Zvcih2YXIgWCBpbiBzd2ZvYmplY3Qpe3N3Zm9iamVjdFtYXT1udWxsfXN3Zm9iamVjdD1udWxsfSl9fSgpO3JldHVybntyZWdpc3Rlck9iamVjdDpmdW5jdGlvbihhYixYLGFhLFope2lmKE0udzMmJmFiJiZYKXt2YXIgWT17fTtZLmlkPWFiO1kuc3dmVmVyc2lvbj1YO1kuZXhwcmVzc0luc3RhbGw9YWE7WS5jYWxsYmFja0ZuPVo7b1tvLmxlbmd0aF09WTt3KGFiLGZhbHNlKX1lbHNle2lmKFope1ooe3N1Y2Nlc3M6ZmFsc2UsaWQ6YWJ9KX19fSxnZXRPYmplY3RCeUlkOmZ1bmN0aW9uKFgpe2lmKE0udzMpe3JldHVybiB6KFgpfX0sZW1iZWRTV0Y6ZnVuY3Rpb24oYWIsYWgsYWUsYWcsWSxhYSxaLGFkLGFmLGFjKXt2YXIgWD17c3VjY2VzczpmYWxzZSxpZDphaH07aWYoTS53MyYmIShNLndrJiZNLndrPDMxMikmJmFiJiZhaCYmYWUmJmFnJiZZKXt3KGFoLGZhbHNlKTtLKGZ1bmN0aW9uKCl7YWUrPVwiXCI7YWcrPVwiXCI7dmFyIGFqPXt9O2lmKGFmJiZ0eXBlb2YgYWY9PT1yKXtmb3IodmFyIGFsIGluIGFmKXthalthbF09YWZbYWxdfX1hai5kYXRhPWFiO2FqLndpZHRoPWFlO2FqLmhlaWdodD1hZzt2YXIgYW09e307aWYoYWQmJnR5cGVvZiBhZD09PXIpe2Zvcih2YXIgYWsgaW4gYWQpe2FtW2FrXT1hZFtha119fWlmKFomJnR5cGVvZiBaPT09cil7Zm9yKHZhciBhaSBpbiBaKXtpZih0eXBlb2YgYW0uZmxhc2h2YXJzIT1EKXthbS5mbGFzaHZhcnMrPVwiJlwiK2FpK1wiPVwiK1pbYWldfWVsc2V7YW0uZmxhc2h2YXJzPWFpK1wiPVwiK1pbYWldfX19aWYoRihZKSl7dmFyIGFuPXUoYWosYW0sYWgpO2lmKGFqLmlkPT1haCl7dyhhaCx0cnVlKX1YLnN1Y2Nlc3M9dHJ1ZTtYLnJlZj1hbn1lbHNle2lmKGFhJiZBKCkpe2FqLmRhdGE9YWE7UChhaixhbSxhaCxhYyk7cmV0dXJufWVsc2V7dyhhaCx0cnVlKX19aWYoYWMpe2FjKFgpfX0pfWVsc2V7aWYoYWMpe2FjKFgpfX19LHN3aXRjaE9mZkF1dG9IaWRlU2hvdzpmdW5jdGlvbigpe209ZmFsc2V9LHVhOk0sZ2V0Rmxhc2hQbGF5ZXJWZXJzaW9uOmZ1bmN0aW9uKCl7cmV0dXJue21ham9yOk0ucHZbMF0sbWlub3I6TS5wdlsxXSxyZWxlYXNlOk0ucHZbMl19fSxoYXNGbGFzaFBsYXllclZlcnNpb246RixjcmVhdGVTV0Y6ZnVuY3Rpb24oWixZLFgpe2lmKE0udzMpe3JldHVybiB1KFosWSxYKX1lbHNle3JldHVybiB1bmRlZmluZWR9fSxzaG93RXhwcmVzc0luc3RhbGw6ZnVuY3Rpb24oWixhYSxYLFkpe2lmKE0udzMmJkEoKSl7UChaLGFhLFgsWSl9fSxyZW1vdmVTV0Y6ZnVuY3Rpb24oWCl7aWYoTS53Myl7eShYKX19LGNyZWF0ZUNTUzpmdW5jdGlvbihhYSxaLFksWCl7aWYoTS53Myl7dihhYSxaLFksWCl9fSxhZGREb21Mb2FkRXZlbnQ6SyxhZGRMb2FkRXZlbnQ6cyxnZXRRdWVyeVBhcmFtVmFsdWU6ZnVuY3Rpb24oYWEpe3ZhciBaPWoubG9jYXRpb24uc2VhcmNofHxqLmxvY2F0aW9uLmhhc2g7aWYoWil7aWYoL1xcPy8udGVzdChaKSl7Wj1aLnNwbGl0KFwiP1wiKVsxXX1pZihhYT09bnVsbCl7cmV0dXJuIEwoWil9dmFyIFk9Wi5zcGxpdChcIiZcIik7Zm9yKHZhciBYPTA7WDxZLmxlbmd0aDtYKyspe2lmKFlbWF0uc3Vic3RyaW5nKDAsWVtYXS5pbmRleE9mKFwiPVwiKSk9PWFhKXtyZXR1cm4gTChZW1hdLnN1YnN0cmluZygoWVtYXS5pbmRleE9mKFwiPVwiKSsxKSkpfX19cmV0dXJuXCJcIn0sZXhwcmVzc0luc3RhbGxDYWxsYmFjazpmdW5jdGlvbigpe2lmKGEpe3ZhciBYPWMoUik7aWYoWCYmbCl7WC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChsLFgpO2lmKFEpe3coUSx0cnVlKTtpZihNLmllJiZNLndpbil7bC5zdHlsZS5kaXNwbGF5PVwiYmxvY2tcIn19aWYoRSl7RShCKX19YT1mYWxzZX19fX0oKTtcbn1cbi8vIENvcHlyaWdodDogSGlyb3NoaSBJY2hpa2F3YSA8aHR0cDovL2dpbWl0ZS5uZXQvZW4vPlxuLy8gTGljZW5zZTogTmV3IEJTRCBMaWNlbnNlXG4vLyBSZWZlcmVuY2U6IGh0dHA6Ly9kZXYudzMub3JnL2h0bWw1L3dlYnNvY2tldHMvXG4vLyBSZWZlcmVuY2U6IGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL2RyYWZ0LWhpeGllLXRoZXdlYnNvY2tldHByb3RvY29sXG5cbihmdW5jdGlvbigpIHtcbiAgXG4gIGlmICgndW5kZWZpbmVkJyA9PSB0eXBlb2Ygd2luZG93IHx8IHdpbmRvdy5XZWJTb2NrZXQpIHJldHVybjtcblxuICB2YXIgY29uc29sZSA9IHdpbmRvdy5jb25zb2xlO1xuICBpZiAoIWNvbnNvbGUgfHwgIWNvbnNvbGUubG9nIHx8ICFjb25zb2xlLmVycm9yKSB7XG4gICAgY29uc29sZSA9IHtsb2c6IGZ1bmN0aW9uKCl7IH0sIGVycm9yOiBmdW5jdGlvbigpeyB9fTtcbiAgfVxuICBcbiAgaWYgKCFzd2ZvYmplY3QuaGFzRmxhc2hQbGF5ZXJWZXJzaW9uKFwiMTAuMC4wXCIpKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkZsYXNoIFBsYXllciA+PSAxMC4wLjAgaXMgcmVxdWlyZWQuXCIpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAobG9jYXRpb24ucHJvdG9jb2wgPT0gXCJmaWxlOlwiKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgIFwiV0FSTklORzogd2ViLXNvY2tldC1qcyBkb2Vzbid0IHdvcmsgaW4gZmlsZTovLy8uLi4gVVJMIFwiICtcbiAgICAgIFwidW5sZXNzIHlvdSBzZXQgRmxhc2ggU2VjdXJpdHkgU2V0dGluZ3MgcHJvcGVybHkuIFwiICtcbiAgICAgIFwiT3BlbiB0aGUgcGFnZSB2aWEgV2ViIHNlcnZlciBpLmUuIGh0dHA6Ly8uLi5cIik7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBjbGFzcyByZXByZXNlbnRzIGEgZmF1eCB3ZWIgc29ja2V0LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAqIEBwYXJhbSB7YXJyYXkgb3Igc3RyaW5nfSBwcm90b2NvbHNcbiAgICogQHBhcmFtIHtzdHJpbmd9IHByb3h5SG9zdFxuICAgKiBAcGFyYW0ge2ludH0gcHJveHlQb3J0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBoZWFkZXJzXG4gICAqL1xuICBXZWJTb2NrZXQgPSBmdW5jdGlvbih1cmwsIHByb3RvY29scywgcHJveHlIb3N0LCBwcm94eVBvcnQsIGhlYWRlcnMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5fX2lkID0gV2ViU29ja2V0Ll9fbmV4dElkKys7XG4gICAgV2ViU29ja2V0Ll9faW5zdGFuY2VzW3NlbGYuX19pZF0gPSBzZWxmO1xuICAgIHNlbGYucmVhZHlTdGF0ZSA9IFdlYlNvY2tldC5DT05ORUNUSU5HO1xuICAgIHNlbGYuYnVmZmVyZWRBbW91bnQgPSAwO1xuICAgIHNlbGYuX19ldmVudHMgPSB7fTtcbiAgICBpZiAoIXByb3RvY29scykge1xuICAgICAgcHJvdG9jb2xzID0gW107XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcHJvdG9jb2xzID09IFwic3RyaW5nXCIpIHtcbiAgICAgIHByb3RvY29scyA9IFtwcm90b2NvbHNdO1xuICAgIH1cbiAgICAvLyBVc2VzIHNldFRpbWVvdXQoKSB0byBtYWtlIHN1cmUgX19jcmVhdGVGbGFzaCgpIHJ1bnMgYWZ0ZXIgdGhlIGNhbGxlciBzZXRzIHdzLm9ub3BlbiBldGMuXG4gICAgLy8gT3RoZXJ3aXNlLCB3aGVuIG9ub3BlbiBmaXJlcyBpbW1lZGlhdGVseSwgb25vcGVuIGlzIGNhbGxlZCBiZWZvcmUgaXQgaXMgc2V0LlxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBXZWJTb2NrZXQuX19hZGRUYXNrKGZ1bmN0aW9uKCkge1xuICAgICAgICBXZWJTb2NrZXQuX19mbGFzaC5jcmVhdGUoXG4gICAgICAgICAgICBzZWxmLl9faWQsIHVybCwgcHJvdG9jb2xzLCBwcm94eUhvc3QgfHwgbnVsbCwgcHJveHlQb3J0IHx8IDAsIGhlYWRlcnMgfHwgbnVsbCk7XG4gICAgICB9KTtcbiAgICB9LCAwKTtcbiAgfTtcblxuICAvKipcbiAgICogU2VuZCBkYXRhIHRvIHRoZSB3ZWIgc29ja2V0LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAgVGhlIGRhdGEgdG8gc2VuZCB0byB0aGUgc29ja2V0LlxuICAgKiBAcmV0dXJuIHtib29sZWFufSAgVHJ1ZSBmb3Igc3VjY2VzcywgZmFsc2UgZm9yIGZhaWx1cmUuXG4gICAqL1xuICBXZWJTb2NrZXQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PSBXZWJTb2NrZXQuQ09OTkVDVElORykge1xuICAgICAgdGhyb3cgXCJJTlZBTElEX1NUQVRFX0VSUjogV2ViIFNvY2tldCBjb25uZWN0aW9uIGhhcyBub3QgYmVlbiBlc3RhYmxpc2hlZFwiO1xuICAgIH1cbiAgICAvLyBXZSB1c2UgZW5jb2RlVVJJQ29tcG9uZW50KCkgaGVyZSwgYmVjYXVzZSBGQUJyaWRnZSBkb2Vzbid0IHdvcmsgaWZcbiAgICAvLyB0aGUgYXJndW1lbnQgaW5jbHVkZXMgc29tZSBjaGFyYWN0ZXJzLiBXZSBkb24ndCB1c2UgZXNjYXBlKCkgaGVyZVxuICAgIC8vIGJlY2F1c2Ugb2YgdGhpczpcbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9Db3JlX0phdmFTY3JpcHRfMS41X0d1aWRlL0Z1bmN0aW9ucyNlc2NhcGVfYW5kX3VuZXNjYXBlX0Z1bmN0aW9uc1xuICAgIC8vIEJ1dCBpdCBsb29rcyBkZWNvZGVVUklDb21wb25lbnQoZW5jb2RlVVJJQ29tcG9uZW50KHMpKSBkb2Vzbid0XG4gICAgLy8gcHJlc2VydmUgYWxsIFVuaWNvZGUgY2hhcmFjdGVycyBlaXRoZXIgZS5nLiBcIlxcdWZmZmZcIiBpbiBGaXJlZm94LlxuICAgIC8vIE5vdGUgYnkgd3RyaXRjaDogSG9wZWZ1bGx5IHRoaXMgd2lsbCBub3QgYmUgbmVjZXNzYXJ5IHVzaW5nIEV4dGVybmFsSW50ZXJmYWNlLiAgV2lsbCByZXF1aXJlXG4gICAgLy8gYWRkaXRpb25hbCB0ZXN0aW5nLlxuICAgIHZhciByZXN1bHQgPSBXZWJTb2NrZXQuX19mbGFzaC5zZW5kKHRoaXMuX19pZCwgZW5jb2RlVVJJQ29tcG9uZW50KGRhdGEpKTtcbiAgICBpZiAocmVzdWx0IDwgMCkgeyAvLyBzdWNjZXNzXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5idWZmZXJlZEFtb3VudCArPSByZXN1bHQ7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBDbG9zZSB0aGlzIHdlYiBzb2NrZXQgZ3JhY2VmdWxseS5cbiAgICovXG4gIFdlYlNvY2tldC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09IFdlYlNvY2tldC5DTE9TRUQgfHwgdGhpcy5yZWFkeVN0YXRlID09IFdlYlNvY2tldC5DTE9TSU5HKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFdlYlNvY2tldC5DTE9TSU5HO1xuICAgIFdlYlNvY2tldC5fX2ZsYXNoLmNsb3NlKHRoaXMuX19pZCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGF0aW9uIG9mIHtAbGluayA8YSBocmVmPVwiaHR0cDovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTItRXZlbnRzL2V2ZW50cy5odG1sI0V2ZW50cy1yZWdpc3RyYXRpb25cIj5ET00gMiBFdmVudFRhcmdldCBJbnRlcmZhY2U8L2E+fVxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBsaXN0ZW5lclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHVzZUNhcHR1cmVcbiAgICogQHJldHVybiB2b2lkXG4gICAqL1xuICBXZWJTb2NrZXQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSkge1xuICAgIGlmICghKHR5cGUgaW4gdGhpcy5fX2V2ZW50cykpIHtcbiAgICAgIHRoaXMuX19ldmVudHNbdHlwZV0gPSBbXTtcbiAgICB9XG4gICAgdGhpcy5fX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgfTtcblxuICAvKipcbiAgICogSW1wbGVtZW50YXRpb24gb2Yge0BsaW5rIDxhIGhyZWY9XCJodHRwOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMi1FdmVudHMvZXZlbnRzLmh0bWwjRXZlbnRzLXJlZ2lzdHJhdGlvblwiPkRPTSAyIEV2ZW50VGFyZ2V0IEludGVyZmFjZTwvYT59XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdXNlQ2FwdHVyZVxuICAgKiBAcmV0dXJuIHZvaWRcbiAgICovXG4gIFdlYlNvY2tldC5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKSB7XG4gICAgaWYgKCEodHlwZSBpbiB0aGlzLl9fZXZlbnRzKSkgcmV0dXJuO1xuICAgIHZhciBldmVudHMgPSB0aGlzLl9fZXZlbnRzW3R5cGVdO1xuICAgIGZvciAodmFyIGkgPSBldmVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIGlmIChldmVudHNbaV0gPT09IGxpc3RlbmVyKSB7XG4gICAgICAgIGV2ZW50cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogSW1wbGVtZW50YXRpb24gb2Yge0BsaW5rIDxhIGhyZWY9XCJodHRwOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMi1FdmVudHMvZXZlbnRzLmh0bWwjRXZlbnRzLXJlZ2lzdHJhdGlvblwiPkRPTSAyIEV2ZW50VGFyZ2V0IEludGVyZmFjZTwvYT59XG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gICAqIEByZXR1cm4gdm9pZFxuICAgKi9cbiAgV2ViU29ja2V0LnByb3RvdHlwZS5kaXNwYXRjaEV2ZW50ID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgZXZlbnRzID0gdGhpcy5fX2V2ZW50c1tldmVudC50eXBlXSB8fCBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgZXZlbnRzW2ldKGV2ZW50KTtcbiAgICB9XG4gICAgdmFyIGhhbmRsZXIgPSB0aGlzW1wib25cIiArIGV2ZW50LnR5cGVdO1xuICAgIGlmIChoYW5kbGVyKSBoYW5kbGVyKGV2ZW50KTtcbiAgfTtcblxuICAvKipcbiAgICogSGFuZGxlcyBhbiBldmVudCBmcm9tIEZsYXNoLlxuICAgKiBAcGFyYW0ge09iamVjdH0gZmxhc2hFdmVudFxuICAgKi9cbiAgV2ViU29ja2V0LnByb3RvdHlwZS5fX2hhbmRsZUV2ZW50ID0gZnVuY3Rpb24oZmxhc2hFdmVudCkge1xuICAgIGlmIChcInJlYWR5U3RhdGVcIiBpbiBmbGFzaEV2ZW50KSB7XG4gICAgICB0aGlzLnJlYWR5U3RhdGUgPSBmbGFzaEV2ZW50LnJlYWR5U3RhdGU7XG4gICAgfVxuICAgIGlmIChcInByb3RvY29sXCIgaW4gZmxhc2hFdmVudCkge1xuICAgICAgdGhpcy5wcm90b2NvbCA9IGZsYXNoRXZlbnQucHJvdG9jb2w7XG4gICAgfVxuICAgIFxuICAgIHZhciBqc0V2ZW50O1xuICAgIGlmIChmbGFzaEV2ZW50LnR5cGUgPT0gXCJvcGVuXCIgfHwgZmxhc2hFdmVudC50eXBlID09IFwiZXJyb3JcIikge1xuICAgICAganNFdmVudCA9IHRoaXMuX19jcmVhdGVTaW1wbGVFdmVudChmbGFzaEV2ZW50LnR5cGUpO1xuICAgIH0gZWxzZSBpZiAoZmxhc2hFdmVudC50eXBlID09IFwiY2xvc2VcIikge1xuICAgICAgLy8gVE9ETyBpbXBsZW1lbnQganNFdmVudC53YXNDbGVhblxuICAgICAganNFdmVudCA9IHRoaXMuX19jcmVhdGVTaW1wbGVFdmVudChcImNsb3NlXCIpO1xuICAgIH0gZWxzZSBpZiAoZmxhc2hFdmVudC50eXBlID09IFwibWVzc2FnZVwiKSB7XG4gICAgICB2YXIgZGF0YSA9IGRlY29kZVVSSUNvbXBvbmVudChmbGFzaEV2ZW50Lm1lc3NhZ2UpO1xuICAgICAganNFdmVudCA9IHRoaXMuX19jcmVhdGVNZXNzYWdlRXZlbnQoXCJtZXNzYWdlXCIsIGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBcInVua25vd24gZXZlbnQgdHlwZTogXCIgKyBmbGFzaEV2ZW50LnR5cGU7XG4gICAgfVxuICAgIFxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudChqc0V2ZW50KTtcbiAgfTtcbiAgXG4gIFdlYlNvY2tldC5wcm90b3R5cGUuX19jcmVhdGVTaW1wbGVFdmVudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnQgJiYgd2luZG93LkV2ZW50KSB7XG4gICAgICB2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudChcIkV2ZW50XCIpO1xuICAgICAgZXZlbnQuaW5pdEV2ZW50KHR5cGUsIGZhbHNlLCBmYWxzZSk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7dHlwZTogdHlwZSwgYnViYmxlczogZmFsc2UsIGNhbmNlbGFibGU6IGZhbHNlfTtcbiAgICB9XG4gIH07XG4gIFxuICBXZWJTb2NrZXQucHJvdG90eXBlLl9fY3JlYXRlTWVzc2FnZUV2ZW50ID0gZnVuY3Rpb24odHlwZSwgZGF0YSkge1xuICAgIGlmIChkb2N1bWVudC5jcmVhdGVFdmVudCAmJiB3aW5kb3cuTWVzc2FnZUV2ZW50ICYmICF3aW5kb3cub3BlcmEpIHtcbiAgICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiTWVzc2FnZUV2ZW50XCIpO1xuICAgICAgZXZlbnQuaW5pdE1lc3NhZ2VFdmVudChcIm1lc3NhZ2VcIiwgZmFsc2UsIGZhbHNlLCBkYXRhLCBudWxsLCBudWxsLCB3aW5kb3csIG51bGwpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJRSBhbmQgT3BlcmEsIHRoZSBsYXR0ZXIgb25lIHRydW5jYXRlcyB0aGUgZGF0YSBwYXJhbWV0ZXIgYWZ0ZXIgYW55IDB4MDAgYnl0ZXMuXG4gICAgICByZXR1cm4ge3R5cGU6IHR5cGUsIGRhdGE6IGRhdGEsIGJ1YmJsZXM6IGZhbHNlLCBjYW5jZWxhYmxlOiBmYWxzZX07XG4gICAgfVxuICB9O1xuICBcbiAgLyoqXG4gICAqIERlZmluZSB0aGUgV2ViU29ja2V0IHJlYWR5U3RhdGUgZW51bWVyYXRpb24uXG4gICAqL1xuICBXZWJTb2NrZXQuQ09OTkVDVElORyA9IDA7XG4gIFdlYlNvY2tldC5PUEVOID0gMTtcbiAgV2ViU29ja2V0LkNMT1NJTkcgPSAyO1xuICBXZWJTb2NrZXQuQ0xPU0VEID0gMztcblxuICBXZWJTb2NrZXQuX19mbGFzaCA9IG51bGw7XG4gIFdlYlNvY2tldC5fX2luc3RhbmNlcyA9IHt9O1xuICBXZWJTb2NrZXQuX190YXNrcyA9IFtdO1xuICBXZWJTb2NrZXQuX19uZXh0SWQgPSAwO1xuICBcbiAgLyoqXG4gICAqIExvYWQgYSBuZXcgZmxhc2ggc2VjdXJpdHkgcG9saWN5IGZpbGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICovXG4gIFdlYlNvY2tldC5sb2FkRmxhc2hQb2xpY3lGaWxlID0gZnVuY3Rpb24odXJsKXtcbiAgICBXZWJTb2NrZXQuX19hZGRUYXNrKGZ1bmN0aW9uKCkge1xuICAgICAgV2ViU29ja2V0Ll9fZmxhc2gubG9hZE1hbnVhbFBvbGljeUZpbGUodXJsKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogTG9hZHMgV2ViU29ja2V0TWFpbi5zd2YgYW5kIGNyZWF0ZXMgV2ViU29ja2V0TWFpbiBvYmplY3QgaW4gRmxhc2guXG4gICAqL1xuICBXZWJTb2NrZXQuX19pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKFdlYlNvY2tldC5fX2ZsYXNoKSByZXR1cm47XG4gICAgXG4gICAgaWYgKFdlYlNvY2tldC5fX3N3ZkxvY2F0aW9uKSB7XG4gICAgICAvLyBGb3IgYmFja3dvcmQgY29tcGF0aWJpbGl0eS5cbiAgICAgIHdpbmRvdy5XRUJfU09DS0VUX1NXRl9MT0NBVElPTiA9IFdlYlNvY2tldC5fX3N3ZkxvY2F0aW9uO1xuICAgIH1cbiAgICBpZiAoIXdpbmRvdy5XRUJfU09DS0VUX1NXRl9MT0NBVElPTikge1xuICAgICAgY29uc29sZS5lcnJvcihcIltXZWJTb2NrZXRdIHNldCBXRUJfU09DS0VUX1NXRl9MT0NBVElPTiB0byBsb2NhdGlvbiBvZiBXZWJTb2NrZXRNYWluLnN3ZlwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgY29udGFpbmVyLmlkID0gXCJ3ZWJTb2NrZXRDb250YWluZXJcIjtcbiAgICAvLyBIaWRlcyBGbGFzaCBib3guIFdlIGNhbm5vdCB1c2UgZGlzcGxheTogbm9uZSBvciB2aXNpYmlsaXR5OiBoaWRkZW4gYmVjYXVzZSBpdCBwcmV2ZW50c1xuICAgIC8vIEZsYXNoIGZyb20gbG9hZGluZyBhdCBsZWFzdCBpbiBJRS4gU28gd2UgbW92ZSBpdCBvdXQgb2YgdGhlIHNjcmVlbiBhdCAoLTEwMCwgLTEwMCkuXG4gICAgLy8gQnV0IHRoaXMgZXZlbiBkb2Vzbid0IHdvcmsgd2l0aCBGbGFzaCBMaXRlIChlLmcuIGluIERyb2lkIEluY3JlZGlibGUpLiBTbyB3aXRoIEZsYXNoXG4gICAgLy8gTGl0ZSwgd2UgcHV0IGl0IGF0ICgwLCAwKS4gVGhpcyBzaG93cyAxeDEgYm94IHZpc2libGUgYXQgbGVmdC10b3AgY29ybmVyIGJ1dCB0aGlzIGlzXG4gICAgLy8gdGhlIGJlc3Qgd2UgY2FuIGRvIGFzIGZhciBhcyB3ZSBrbm93IG5vdy5cbiAgICBjb250YWluZXIuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgaWYgKFdlYlNvY2tldC5fX2lzRmxhc2hMaXRlKCkpIHtcbiAgICAgIGNvbnRhaW5lci5zdHlsZS5sZWZ0ID0gXCIwcHhcIjtcbiAgICAgIGNvbnRhaW5lci5zdHlsZS50b3AgPSBcIjBweFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250YWluZXIuc3R5bGUubGVmdCA9IFwiLTEwMHB4XCI7XG4gICAgICBjb250YWluZXIuc3R5bGUudG9wID0gXCItMTAwcHhcIjtcbiAgICB9XG4gICAgdmFyIGhvbGRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgaG9sZGVyLmlkID0gXCJ3ZWJTb2NrZXRGbGFzaFwiO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChob2xkZXIpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcbiAgICAvLyBTZWUgdGhpcyBhcnRpY2xlIGZvciBoYXNQcmlvcml0eTpcbiAgICAvLyBodHRwOi8vaGVscC5hZG9iZS5jb20vZW5fVVMvYXMzL21vYmlsZS9XUzRiZWJjZDY2YTc0Mjc1YzM2Y2ZiODEzNzEyNDMxOGVlYmM2LTdmZmQuaHRtbFxuICAgIHN3Zm9iamVjdC5lbWJlZFNXRihcbiAgICAgIFdFQl9TT0NLRVRfU1dGX0xPQ0FUSU9OLFxuICAgICAgXCJ3ZWJTb2NrZXRGbGFzaFwiLFxuICAgICAgXCIxXCIgLyogd2lkdGggKi8sXG4gICAgICBcIjFcIiAvKiBoZWlnaHQgKi8sXG4gICAgICBcIjEwLjAuMFwiIC8qIFNXRiB2ZXJzaW9uICovLFxuICAgICAgbnVsbCxcbiAgICAgIG51bGwsXG4gICAgICB7aGFzUHJpb3JpdHk6IHRydWUsIHN3bGl2ZWNvbm5lY3QgOiB0cnVlLCBhbGxvd1NjcmlwdEFjY2VzczogXCJhbHdheXNcIn0sXG4gICAgICBudWxsLFxuICAgICAgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoIWUuc3VjY2Vzcykge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJbV2ViU29ja2V0XSBzd2ZvYmplY3QuZW1iZWRTV0YgZmFpbGVkXCIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfTtcbiAgXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgRmxhc2ggdG8gbm90aWZ5IEpTIHRoYXQgaXQncyBmdWxseSBsb2FkZWQgYW5kIHJlYWR5XG4gICAqIGZvciBjb21tdW5pY2F0aW9uLlxuICAgKi9cbiAgV2ViU29ja2V0Ll9fb25GbGFzaEluaXRpYWxpemVkID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gV2UgbmVlZCB0byBzZXQgYSB0aW1lb3V0IGhlcmUgdG8gYXZvaWQgcm91bmQtdHJpcCBjYWxsc1xuICAgIC8vIHRvIGZsYXNoIGR1cmluZyB0aGUgaW5pdGlhbGl6YXRpb24gcHJvY2Vzcy5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgV2ViU29ja2V0Ll9fZmxhc2ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIndlYlNvY2tldEZsYXNoXCIpO1xuICAgICAgV2ViU29ja2V0Ll9fZmxhc2guc2V0Q2FsbGVyVXJsKGxvY2F0aW9uLmhyZWYpO1xuICAgICAgV2ViU29ja2V0Ll9fZmxhc2guc2V0RGVidWcoISF3aW5kb3cuV0VCX1NPQ0tFVF9ERUJVRyk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IFdlYlNvY2tldC5fX3Rhc2tzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIFdlYlNvY2tldC5fX3Rhc2tzW2ldKCk7XG4gICAgICB9XG4gICAgICBXZWJTb2NrZXQuX190YXNrcyA9IFtdO1xuICAgIH0sIDApO1xuICB9O1xuICBcbiAgLyoqXG4gICAqIENhbGxlZCBieSBGbGFzaCB0byBub3RpZnkgV2ViU29ja2V0cyBldmVudHMgYXJlIGZpcmVkLlxuICAgKi9cbiAgV2ViU29ja2V0Ll9fb25GbGFzaEV2ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEdldHMgZXZlbnRzIHVzaW5nIHJlY2VpdmVFdmVudHMoKSBpbnN0ZWFkIG9mIGdldHRpbmcgaXQgZnJvbSBldmVudCBvYmplY3RcbiAgICAgICAgLy8gb2YgRmxhc2ggZXZlbnQuIFRoaXMgaXMgdG8gbWFrZSBzdXJlIHRvIGtlZXAgbWVzc2FnZSBvcmRlci5cbiAgICAgICAgLy8gSXQgc2VlbXMgc29tZXRpbWVzIEZsYXNoIGV2ZW50cyBkb24ndCBhcnJpdmUgaW4gdGhlIHNhbWUgb3JkZXIgYXMgdGhleSBhcmUgc2VudC5cbiAgICAgICAgdmFyIGV2ZW50cyA9IFdlYlNvY2tldC5fX2ZsYXNoLnJlY2VpdmVFdmVudHMoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICBXZWJTb2NrZXQuX19pbnN0YW5jZXNbZXZlbnRzW2ldLndlYlNvY2tldElkXS5fX2hhbmRsZUV2ZW50KGV2ZW50c1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgIH1cbiAgICB9LCAwKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgXG4gIC8vIENhbGxlZCBieSBGbGFzaC5cbiAgV2ViU29ja2V0Ll9fbG9nID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICAgIGNvbnNvbGUubG9nKGRlY29kZVVSSUNvbXBvbmVudChtZXNzYWdlKSk7XG4gIH07XG4gIFxuICAvLyBDYWxsZWQgYnkgRmxhc2guXG4gIFdlYlNvY2tldC5fX2Vycm9yID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZGVjb2RlVVJJQ29tcG9uZW50KG1lc3NhZ2UpKTtcbiAgfTtcbiAgXG4gIFdlYlNvY2tldC5fX2FkZFRhc2sgPSBmdW5jdGlvbih0YXNrKSB7XG4gICAgaWYgKFdlYlNvY2tldC5fX2ZsYXNoKSB7XG4gICAgICB0YXNrKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIFdlYlNvY2tldC5fX3Rhc2tzLnB1c2godGFzayk7XG4gICAgfVxuICB9O1xuICBcbiAgLyoqXG4gICAqIFRlc3QgaWYgdGhlIGJyb3dzZXIgaXMgcnVubmluZyBmbGFzaCBsaXRlLlxuICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIGZsYXNoIGxpdGUgaXMgcnVubmluZywgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKi9cbiAgV2ViU29ja2V0Ll9faXNGbGFzaExpdGUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXdpbmRvdy5uYXZpZ2F0b3IgfHwgIXdpbmRvdy5uYXZpZ2F0b3IubWltZVR5cGVzKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBtaW1lVHlwZSA9IHdpbmRvdy5uYXZpZ2F0b3IubWltZVR5cGVzW1wiYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2hcIl07XG4gICAgaWYgKCFtaW1lVHlwZSB8fCAhbWltZVR5cGUuZW5hYmxlZFBsdWdpbiB8fCAhbWltZVR5cGUuZW5hYmxlZFBsdWdpbi5maWxlbmFtZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gbWltZVR5cGUuZW5hYmxlZFBsdWdpbi5maWxlbmFtZS5tYXRjaCgvZmxhc2hsaXRlL2kpID8gdHJ1ZSA6IGZhbHNlO1xuICB9O1xuICBcbiAgaWYgKCF3aW5kb3cuV0VCX1NPQ0tFVF9ESVNBQkxFX0FVVE9fSU5JVElBTElaQVRJT04pIHtcbiAgICBpZiAod2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbigpe1xuICAgICAgICBXZWJTb2NrZXQuX19pbml0aWFsaXplKCk7XG4gICAgICB9LCBmYWxzZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbmRvdy5hdHRhY2hFdmVudChcIm9ubG9hZFwiLCBmdW5jdGlvbigpe1xuICAgICAgICBXZWJTb2NrZXQuX19pbml0aWFsaXplKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgXG59KSgpO1xuXG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBpbywgZ2xvYmFsKSB7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBjb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZXhwb3J0cy5YSFIgPSBYSFI7XG5cbiAgLyoqXG4gICAqIFhIUiBjb25zdHJ1Y3RvclxuICAgKlxuICAgKiBAY29zdHJ1Y3RvclxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBYSFIgKHNvY2tldCkge1xuICAgIGlmICghc29ja2V0KSByZXR1cm47XG5cbiAgICBpby5UcmFuc3BvcnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnNlbmRCdWZmZXIgPSBbXTtcbiAgfTtcblxuICAvKipcbiAgICogSW5oZXJpdHMgZnJvbSBUcmFuc3BvcnQuXG4gICAqL1xuXG4gIGlvLnV0aWwuaW5oZXJpdChYSFIsIGlvLlRyYW5zcG9ydCk7XG5cbiAgLyoqXG4gICAqIEVzdGFibGlzaCBhIGNvbm5lY3Rpb25cbiAgICpcbiAgICogQHJldHVybnMge1RyYW5zcG9ydH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgWEhSLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc29ja2V0LnNldEJ1ZmZlcihmYWxzZSk7XG4gICAgdGhpcy5vbk9wZW4oKTtcbiAgICB0aGlzLmdldCgpO1xuXG4gICAgLy8gd2UgbmVlZCB0byBtYWtlIHN1cmUgdGhlIHJlcXVlc3Qgc3VjY2VlZHMgc2luY2Ugd2UgaGF2ZSBubyBpbmRpY2F0aW9uXG4gICAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBvcGVuZWQgb3Igbm90IHVudGlsIGl0IHN1Y2NlZWRlZC5cbiAgICB0aGlzLnNldENsb3NlVGltZW91dCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHdlIG5lZWQgdG8gc2VuZCBkYXRhIHRvIHRoZSBTb2NrZXQuSU8gc2VydmVyLCBpZiB3ZSBoYXZlIGRhdGEgaW4gb3VyXG4gICAqIGJ1ZmZlciB3ZSBlbmNvZGUgaXQgYW5kIGZvcndhcmQgaXQgdG8gdGhlIGBwb3N0YCBtZXRob2QuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBYSFIucHJvdG90eXBlLnBheWxvYWQgPSBmdW5jdGlvbiAocGF5bG9hZCkge1xuICAgIHZhciBtc2dzID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHBheWxvYWQubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBtc2dzLnB1c2goaW8ucGFyc2VyLmVuY29kZVBhY2tldChwYXlsb2FkW2ldKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZW5kKGlvLnBhcnNlci5lbmNvZGVQYXlsb2FkKG1zZ3MpKTtcbiAgfTtcblxuICAvKipcbiAgICogU2VuZCBkYXRhIHRvIHRoZSBTb2NrZXQuSU8gc2VydmVyLlxuICAgKlxuICAgKiBAcGFyYW0gZGF0YSBUaGUgbWVzc2FnZVxuICAgKiBAcmV0dXJucyB7VHJhbnNwb3J0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBYSFIucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHRoaXMucG9zdChkYXRhKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogUG9zdHMgYSBlbmNvZGVkIG1lc3NhZ2UgdG8gdGhlIFNvY2tldC5JTyBzZXJ2ZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhIEEgZW5jb2RlZCBtZXNzYWdlLlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gZW1wdHkgKCkgeyB9O1xuXG4gIFhIUi5wcm90b3R5cGUucG9zdCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuc29ja2V0LnNldEJ1ZmZlcih0cnVlKTtcblxuICAgIGZ1bmN0aW9uIHN0YXRlQ2hhbmdlICgpIHtcbiAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT0gNCkge1xuICAgICAgICB0aGlzLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGVtcHR5O1xuICAgICAgICBzZWxmLnBvc3RpbmcgPSBmYWxzZTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gMjAwKXtcbiAgICAgICAgICBzZWxmLnNvY2tldC5zZXRCdWZmZXIoZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYub25DbG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25sb2FkICgpIHtcbiAgICAgIHRoaXMub25sb2FkID0gZW1wdHk7XG4gICAgICBzZWxmLnNvY2tldC5zZXRCdWZmZXIoZmFsc2UpO1xuICAgIH07XG5cbiAgICB0aGlzLnNlbmRYSFIgPSB0aGlzLnJlcXVlc3QoJ1BPU1QnKTtcblxuICAgIGlmIChnbG9iYWwuWERvbWFpblJlcXVlc3QgJiYgdGhpcy5zZW5kWEhSIGluc3RhbmNlb2YgWERvbWFpblJlcXVlc3QpIHtcbiAgICAgIHRoaXMuc2VuZFhIUi5vbmxvYWQgPSB0aGlzLnNlbmRYSFIub25lcnJvciA9IG9ubG9hZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZW5kWEhSLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IHN0YXRlQ2hhbmdlO1xuICAgIH1cblxuICAgIHRoaXMuc2VuZFhIUi5zZW5kKGRhdGEpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0cyB0aGUgZXN0YWJsaXNoZWQgYFhIUmAgY29ubmVjdGlvbi5cbiAgICpcbiAgICogQHJldHVybnMge1RyYW5zcG9ydH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgWEhSLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9uQ2xvc2UoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogR2VuZXJhdGVzIGEgY29uZmlndXJlZCBYSFIgcmVxdWVzdFxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSB1cmwgdGhhdCBuZWVkcyB0byBiZSByZXF1ZXN0ZWQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2QgVGhlIG1ldGhvZCB0aGUgcmVxdWVzdCBzaG91bGQgdXNlLlxuICAgKiBAcmV0dXJucyB7WE1MSHR0cFJlcXVlc3R9XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBYSFIucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiAobWV0aG9kKSB7XG4gICAgdmFyIHJlcSA9IGlvLnV0aWwucmVxdWVzdCh0aGlzLnNvY2tldC5pc1hEb21haW4oKSlcbiAgICAgICwgcXVlcnkgPSBpby51dGlsLnF1ZXJ5KHRoaXMuc29ja2V0Lm9wdGlvbnMucXVlcnksICd0PScgKyArbmV3IERhdGUpO1xuXG4gICAgcmVxLm9wZW4obWV0aG9kIHx8ICdHRVQnLCB0aGlzLnByZXBhcmVVcmwoKSArIHF1ZXJ5LCB0cnVlKTtcblxuICAgIGlmIChtZXRob2QgPT0gJ1BPU1QnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAocmVxLnNldFJlcXVlc3RIZWFkZXIpIHtcbiAgICAgICAgICByZXEuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ3RleHQvcGxhaW47Y2hhcnNldD1VVEYtOCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFhEb21haW5SZXF1ZXN0XG4gICAgICAgICAgcmVxLmNvbnRlbnRUeXBlID0gJ3RleHQvcGxhaW4nO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH1cblxuICAgIHJldHVybiByZXE7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHNjaGVtZSB0byB1c2UgZm9yIHRoZSB0cmFuc3BvcnQgVVJMcy5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFhIUi5wcm90b3R5cGUuc2NoZW1lID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnNvY2tldC5vcHRpb25zLnNlY3VyZSA/ICdodHRwcycgOiAnaHR0cCc7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBYSFIgdHJhbnNwb3J0cyBhcmUgc3VwcG9ydGVkXG4gICAqXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0geGRvbWFpbiBDaGVjayBpZiB3ZSBzdXBwb3J0IGNyb3NzIGRvbWFpbiByZXF1ZXN0cy5cbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFhIUi5jaGVjayA9IGZ1bmN0aW9uIChzb2NrZXQsIHhkb21haW4pIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHJlcXVlc3QgPSBpby51dGlsLnJlcXVlc3QoeGRvbWFpbiksXG4gICAgICAgICAgdXNlc1hEb21SZXEgPSAoZ2xvYmFsLlhEb21haW5SZXF1ZXN0ICYmIHJlcXVlc3QgaW5zdGFuY2VvZiBYRG9tYWluUmVxdWVzdCksXG4gICAgICAgICAgc29ja2V0UHJvdG9jb2wgPSAoc29ja2V0ICYmIHNvY2tldC5vcHRpb25zICYmIHNvY2tldC5vcHRpb25zLnNlY3VyZSA/ICdodHRwczonIDogJ2h0dHA6JyksXG4gICAgICAgICAgaXNYUHJvdG9jb2wgPSAoZ2xvYmFsLmxvY2F0aW9uICYmIHNvY2tldFByb3RvY29sICE9IGdsb2JhbC5sb2NhdGlvbi5wcm90b2NvbCk7XG4gICAgICBpZiAocmVxdWVzdCAmJiAhKHVzZXNYRG9tUmVxICYmIGlzWFByb3RvY29sKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoKGUpIHt9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBYSFIgdHJhbnNwb3J0IHN1cHBvcnRzIGNyb3NzIGRvbWFpbiByZXF1ZXN0cy5cbiAgICpcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFhIUi54ZG9tYWluQ2hlY2sgPSBmdW5jdGlvbiAoc29ja2V0KSB7XG4gICAgcmV0dXJuIFhIUi5jaGVjayhzb2NrZXQsIHRydWUpO1xuICB9O1xuXG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpby5UcmFuc3BvcnQgOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4gICwgdGhpc1xuKTtcbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGlvKSB7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBjb25zdHJ1Y3Rvci5cbiAgICovXG5cbiAgZXhwb3J0cy5odG1sZmlsZSA9IEhUTUxGaWxlO1xuXG4gIC8qKlxuICAgKiBUaGUgSFRNTEZpbGUgdHJhbnNwb3J0IGNyZWF0ZXMgYSBgZm9yZXZlciBpZnJhbWVgIGJhc2VkIHRyYW5zcG9ydFxuICAgKiBmb3IgSW50ZXJuZXQgRXhwbG9yZXIuIFJlZ3VsYXIgZm9yZXZlciBpZnJhbWUgaW1wbGVtZW50YXRpb25zIHdpbGwgXG4gICAqIGNvbnRpbnVvdXNseSB0cmlnZ2VyIHRoZSBicm93c2VycyBidXp5IGluZGljYXRvcnMuIElmIHRoZSBmb3JldmVyIGlmcmFtZVxuICAgKiBpcyBjcmVhdGVkIGluc2lkZSBhIGBodG1sZmlsZWAgdGhlc2UgaW5kaWNhdG9ycyB3aWxsIG5vdCBiZSB0cmlnZ2VkLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQGV4dGVuZHMge2lvLlRyYW5zcG9ydC5YSFJ9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIEhUTUxGaWxlIChzb2NrZXQpIHtcbiAgICBpby5UcmFuc3BvcnQuWEhSLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaGVyaXRzIGZyb20gWEhSIHRyYW5zcG9ydC5cbiAgICovXG5cbiAgaW8udXRpbC5pbmhlcml0KEhUTUxGaWxlLCBpby5UcmFuc3BvcnQuWEhSKTtcblxuICAvKipcbiAgICogVHJhbnNwb3J0IG5hbWVcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgSFRNTEZpbGUucHJvdG90eXBlLm5hbWUgPSAnaHRtbGZpbGUnO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IEFjLi4uZVggYGh0bWxmaWxlYCB3aXRoIGEgZm9yZXZlciBsb2FkaW5nIGlmcmFtZVxuICAgKiB0aGF0IGNhbiBiZSB1c2VkIHRvIGxpc3RlbiB0byBtZXNzYWdlcy4gSW5zaWRlIHRoZSBnZW5lcmF0ZWRcbiAgICogYGh0bWxmaWxlYCBhIHJlZmVyZW5jZSB3aWxsIGJlIG1hZGUgdG8gdGhlIEhUTUxGaWxlIHRyYW5zcG9ydC5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIEhUTUxGaWxlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5kb2MgPSBuZXcgd2luZG93WyhbJ0FjdGl2ZSddLmNvbmNhdCgnT2JqZWN0Jykuam9pbignWCcpKV0oJ2h0bWxmaWxlJyk7XG4gICAgdGhpcy5kb2Mub3BlbigpO1xuICAgIHRoaXMuZG9jLndyaXRlKCc8aHRtbD48L2h0bWw+Jyk7XG4gICAgdGhpcy5kb2MuY2xvc2UoKTtcbiAgICB0aGlzLmRvYy5wYXJlbnRXaW5kb3cucyA9IHRoaXM7XG5cbiAgICB2YXIgaWZyYW1lQyA9IHRoaXMuZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGlmcmFtZUMuY2xhc3NOYW1lID0gJ3NvY2tldGlvJztcblxuICAgIHRoaXMuZG9jLmJvZHkuYXBwZW5kQ2hpbGQoaWZyYW1lQyk7XG4gICAgdGhpcy5pZnJhbWUgPSB0aGlzLmRvYy5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcblxuICAgIGlmcmFtZUMuYXBwZW5kQ2hpbGQodGhpcy5pZnJhbWUpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAsIHF1ZXJ5ID0gaW8udXRpbC5xdWVyeSh0aGlzLnNvY2tldC5vcHRpb25zLnF1ZXJ5LCAndD0nKyArbmV3IERhdGUpO1xuXG4gICAgdGhpcy5pZnJhbWUuc3JjID0gdGhpcy5wcmVwYXJlVXJsKCkgKyBxdWVyeTtcblxuICAgIGlvLnV0aWwub24od2luZG93LCAndW5sb2FkJywgZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRoZSBTb2NrZXQuSU8gc2VydmVyIHdpbGwgd3JpdGUgc2NyaXB0IHRhZ3MgaW5zaWRlIHRoZSBmb3JldmVyXG4gICAqIGlmcmFtZSwgdGhpcyBmdW5jdGlvbiB3aWxsIGJlIHVzZWQgYXMgY2FsbGJhY2sgZm9yIHRoZSBpbmNvbWluZ1xuICAgKiBpbmZvcm1hdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRhdGEgVGhlIG1lc3NhZ2VcbiAgICogQHBhcmFtIHtkb2N1bWVudH0gZG9jIFJlZmVyZW5jZSB0byB0aGUgY29udGV4dFxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgSFRNTEZpbGUucHJvdG90eXBlLl8gPSBmdW5jdGlvbiAoZGF0YSwgZG9jKSB7XG4gICAgdGhpcy5vbkRhdGEoZGF0YSk7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBzY3JpcHQgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpWzBdO1xuICAgICAgc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcbiAgICB9IGNhdGNoIChlKSB7IH1cbiAgfTtcblxuICAvKipcbiAgICogRGVzdHJveSB0aGUgZXN0YWJsaXNoZWQgY29ubmVjdGlvbiwgaWZyYW1lIGFuZCBgaHRtbGZpbGVgLlxuICAgKiBBbmQgY2FsbHMgdGhlIGBDb2xsZWN0R2FyYmFnZWAgZnVuY3Rpb24gb2YgSW50ZXJuZXQgRXhwbG9yZXJcbiAgICogdG8gcmVsZWFzZSB0aGUgbWVtb3J5LlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgSFRNTEZpbGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuaWZyYW1lKXtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuaWZyYW1lLnNyYyA9ICdhYm91dDpibGFuayc7XG4gICAgICB9IGNhdGNoKGUpe31cblxuICAgICAgdGhpcy5kb2MgPSBudWxsO1xuICAgICAgdGhpcy5pZnJhbWUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmlmcmFtZSk7XG4gICAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG5cbiAgICAgIENvbGxlY3RHYXJiYWdlKCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0cyB0aGUgZXN0YWJsaXNoZWQgY29ubmVjdGlvbi5cbiAgICpcbiAgICogQHJldHVybnMge1RyYW5zcG9ydH0gQ2hhaW5pbmcuXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEhUTUxGaWxlLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICByZXR1cm4gaW8uVHJhbnNwb3J0LlhIUi5wcm90b3R5cGUuY2xvc2UuY2FsbCh0aGlzKTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBicm93c2VyIHN1cHBvcnRzIHRoaXMgdHJhbnNwb3J0LiBUaGUgYnJvd3NlclxuICAgKiBtdXN0IGhhdmUgYW4gYEFjLi4uZVhPYmplY3RgIGltcGxlbWVudGF0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBIVE1MRmlsZS5jaGVjayA9IGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPSBcInVuZGVmaW5lZFwiICYmIChbJ0FjdGl2ZSddLmNvbmNhdCgnT2JqZWN0Jykuam9pbignWCcpKSBpbiB3aW5kb3cpe1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGEgPSBuZXcgd2luZG93WyhbJ0FjdGl2ZSddLmNvbmNhdCgnT2JqZWN0Jykuam9pbignWCcpKV0oJ2h0bWxmaWxlJyk7XG4gICAgICAgIHJldHVybiBhICYmIGlvLlRyYW5zcG9ydC5YSFIuY2hlY2soc29ja2V0KTtcbiAgICAgIH0gY2F0Y2goZSl7fVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGNyb3NzIGRvbWFpbiByZXF1ZXN0cyBhcmUgc3VwcG9ydGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgSFRNTEZpbGUueGRvbWFpbkNoZWNrID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIHdlIGNhbiBwcm9iYWJseSBkbyBoYW5kbGluZyBmb3Igc3ViLWRvbWFpbnMsIHdlIHNob3VsZFxuICAgIC8vIHRlc3QgdGhhdCBpdCdzIGNyb3NzIGRvbWFpbiBidXQgYSBzdWJkb21haW4gaGVyZVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkIHRoZSB0cmFuc3BvcnQgdG8geW91ciBwdWJsaWMgaW8udHJhbnNwb3J0cyBhcnJheS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGlvLnRyYW5zcG9ydHMucHVzaCgnaHRtbGZpbGUnKTtcblxufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8uVHJhbnNwb3J0IDogbW9kdWxlLmV4cG9ydHNcbiAgLCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5wYXJlbnQuZXhwb3J0c1xuKTtcblxuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgaW8sIGdsb2JhbCkge1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY29uc3RydWN0b3IuXG4gICAqL1xuXG4gIGV4cG9ydHNbJ3hoci1wb2xsaW5nJ10gPSBYSFJQb2xsaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgWEhSLXBvbGxpbmcgdHJhbnNwb3J0IHVzZXMgbG9uZyBwb2xsaW5nIFhIUiByZXF1ZXN0cyB0byBjcmVhdGUgYVxuICAgKiBcInBlcnNpc3RlbnRcIiBjb25uZWN0aW9uIHdpdGggdGhlIHNlcnZlci5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFhIUlBvbGxpbmcgKCkge1xuICAgIGlvLlRyYW5zcG9ydC5YSFIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcblxuICAvKipcbiAgICogSW5oZXJpdHMgZnJvbSBYSFIgdHJhbnNwb3J0LlxuICAgKi9cblxuICBpby51dGlsLmluaGVyaXQoWEhSUG9sbGluZywgaW8uVHJhbnNwb3J0LlhIUik7XG5cbiAgLyoqXG4gICAqIE1lcmdlIHRoZSBwcm9wZXJ0aWVzIGZyb20gWEhSIHRyYW5zcG9ydFxuICAgKi9cblxuICBpby51dGlsLm1lcmdlKFhIUlBvbGxpbmcsIGlvLlRyYW5zcG9ydC5YSFIpO1xuXG4gIC8qKlxuICAgKiBUcmFuc3BvcnQgbmFtZVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBYSFJQb2xsaW5nLnByb3RvdHlwZS5uYW1lID0gJ3hoci1wb2xsaW5nJztcblxuICAvKipcbiAgICogSW5kaWNhdGVzIHdoZXRoZXIgaGVhcnRiZWF0cyBpcyBlbmFibGVkIGZvciB0aGlzIHRyYW5zcG9ydFxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgWEhSUG9sbGluZy5wcm90b3R5cGUuaGVhcnRiZWF0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgLyoqIFxuICAgKiBFc3RhYmxpc2ggYSBjb25uZWN0aW9uLCBmb3IgaVBob25lIGFuZCBBbmRyb2lkIHRoaXMgd2lsbCBiZSBkb25lIG9uY2UgdGhlIHBhZ2VcbiAgICogaXMgbG9hZGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7VHJhbnNwb3J0fSBDaGFpbmluZy5cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgWEhSUG9sbGluZy5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpby5UcmFuc3BvcnQuWEhSLnByb3RvdHlwZS5vcGVuLmNhbGwoc2VsZik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTdGFydHMgYSBYSFIgcmVxdWVzdCB0byB3YWl0IGZvciBpbmNvbWluZyBtZXNzYWdlcy5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGVtcHR5ICgpIHt9O1xuXG4gIFhIUlBvbGxpbmcucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuaXNPcGVuKSByZXR1cm47XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBmdW5jdGlvbiBzdGF0ZUNoYW5nZSAoKSB7XG4gICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09IDQpIHtcbiAgICAgICAgdGhpcy5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBlbXB0eTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICAgICAgc2VsZi5vbkRhdGEodGhpcy5yZXNwb25zZVRleHQpO1xuICAgICAgICAgIHNlbGYuZ2V0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5vbkNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gb25sb2FkICgpIHtcbiAgICAgIHRoaXMub25sb2FkID0gZW1wdHk7XG4gICAgICB0aGlzLm9uZXJyb3IgPSBlbXB0eTtcbiAgICAgIHNlbGYucmV0cnlDb3VudGVyID0gMTtcbiAgICAgIHNlbGYub25EYXRhKHRoaXMucmVzcG9uc2VUZXh0KTtcbiAgICAgIHNlbGYuZ2V0KCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIG9uZXJyb3IgKCkge1xuICAgICAgc2VsZi5yZXRyeUNvdW50ZXIgKys7XG4gICAgICBpZighc2VsZi5yZXRyeUNvdW50ZXIgfHwgc2VsZi5yZXRyeUNvdW50ZXIgPiAzKSB7XG4gICAgICAgIHNlbGYub25DbG9zZSgpOyAgXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmLmdldCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLnhociA9IHRoaXMucmVxdWVzdCgpO1xuXG4gICAgaWYgKGdsb2JhbC5YRG9tYWluUmVxdWVzdCAmJiB0aGlzLnhociBpbnN0YW5jZW9mIFhEb21haW5SZXF1ZXN0KSB7XG4gICAgICB0aGlzLnhoci5vbmxvYWQgPSBvbmxvYWQ7XG4gICAgICB0aGlzLnhoci5vbmVycm9yID0gb25lcnJvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy54aHIub25yZWFkeXN0YXRlY2hhbmdlID0gc3RhdGVDaGFuZ2U7XG4gICAgfVxuXG4gICAgdGhpcy54aHIuc2VuZChudWxsKTtcbiAgfTtcblxuICAvKipcbiAgICogSGFuZGxlIHRoZSB1bmNsZWFuIGNsb3NlIGJlaGF2aW9yLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgWEhSUG9sbGluZy5wcm90b3R5cGUub25DbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpby5UcmFuc3BvcnQuWEhSLnByb3RvdHlwZS5vbkNsb3NlLmNhbGwodGhpcyk7XG5cbiAgICBpZiAodGhpcy54aHIpIHtcbiAgICAgIHRoaXMueGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IHRoaXMueGhyLm9ubG9hZCA9IHRoaXMueGhyLm9uZXJyb3IgPSBlbXB0eTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMueGhyLmFib3J0KCk7XG4gICAgICB9IGNhdGNoKGUpe31cbiAgICAgIHRoaXMueGhyID0gbnVsbDtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFdlYmtpdCBiYXNlZCBicm93c2VycyBzaG93IGEgaW5maW5pdCBzcGlubmVyIHdoZW4geW91IHN0YXJ0IGEgWEhSIHJlcXVlc3RcbiAgICogYmVmb3JlIHRoZSBicm93c2VycyBvbmxvYWQgZXZlbnQgaXMgY2FsbGVkIHNvIHdlIG5lZWQgdG8gZGVmZXIgb3BlbmluZyBvZlxuICAgKiB0aGUgdHJhbnNwb3J0IHVudGlsIHRoZSBvbmxvYWQgZXZlbnQgaXMgY2FsbGVkLiBXcmFwcGluZyB0aGUgY2IgaW4gb3VyXG4gICAqIGRlZmVyIG1ldGhvZCBzb2x2ZSB0aGlzLlxuICAgKlxuICAgKiBAcGFyYW0ge1NvY2tldH0gc29ja2V0IFRoZSBzb2NrZXQgaW5zdGFuY2UgdGhhdCBuZWVkcyBhIHRyYW5zcG9ydFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2tcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFhIUlBvbGxpbmcucHJvdG90eXBlLnJlYWR5ID0gZnVuY3Rpb24gKHNvY2tldCwgZm4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpby51dGlsLmRlZmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgIGZuLmNhbGwoc2VsZik7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgdHJhbnNwb3J0IHRvIHlvdXIgcHVibGljIGlvLnRyYW5zcG9ydHMgYXJyYXkuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBpby50cmFuc3BvcnRzLnB1c2goJ3hoci1wb2xsaW5nJyk7XG5cbn0pKFxuICAgICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvLlRyYW5zcG9ydCA6IG1vZHVsZS5leHBvcnRzXG4gICwgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUucGFyZW50LmV4cG9ydHNcbiAgLCB0aGlzXG4pO1xuXG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBpbywgZ2xvYmFsKSB7XG4gIC8qKlxuICAgKiBUaGVyZSBpcyBhIHdheSB0byBoaWRlIHRoZSBsb2FkaW5nIGluZGljYXRvciBpbiBGaXJlZm94LiBJZiB5b3UgY3JlYXRlIGFuZFxuICAgKiByZW1vdmUgYSBpZnJhbWUgaXQgd2lsbCBzdG9wIHNob3dpbmcgdGhlIGN1cnJlbnQgbG9hZGluZyBpbmRpY2F0b3IuXG4gICAqIFVuZm9ydHVuYXRlbHkgd2UgY2FuJ3QgZmVhdHVyZSBkZXRlY3QgdGhhdCBhbmQgVUEgc25pZmZpbmcgaXMgZXZpbC5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIHZhciBpbmRpY2F0b3IgPSBnbG9iYWwuZG9jdW1lbnQgJiYgXCJNb3pBcHBlYXJhbmNlXCIgaW5cbiAgICBnbG9iYWwuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlO1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY29uc3RydWN0b3IuXG4gICAqL1xuXG4gIGV4cG9ydHNbJ2pzb25wLXBvbGxpbmcnXSA9IEpTT05QUG9sbGluZztcblxuICAvKipcbiAgICogVGhlIEpTT05QIHRyYW5zcG9ydCBjcmVhdGVzIGFuIHBlcnNpc3RlbnQgY29ubmVjdGlvbiBieSBkeW5hbWljYWxseVxuICAgKiBpbnNlcnRpbmcgYSBzY3JpcHQgdGFnIGluIHRoZSBwYWdlLiBUaGlzIHNjcmlwdCB0YWcgd2lsbCByZWNlaXZlIHRoZVxuICAgKiBpbmZvcm1hdGlvbiBvZiB0aGUgU29ja2V0LklPIHNlcnZlci4gV2hlbiBuZXcgaW5mb3JtYXRpb24gaXMgcmVjZWl2ZWRcbiAgICogaXQgY3JlYXRlcyBhIG5ldyBzY3JpcHQgdGFnIGZvciB0aGUgbmV3IGRhdGEgc3RyZWFtLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQGV4dGVuZHMge2lvLlRyYW5zcG9ydC54aHItcG9sbGluZ31cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gSlNPTlBQb2xsaW5nIChzb2NrZXQpIHtcbiAgICBpby5UcmFuc3BvcnRbJ3hoci1wb2xsaW5nJ10uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIHRoaXMuaW5kZXggPSBpby5qLmxlbmd0aDtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlvLmoucHVzaChmdW5jdGlvbiAobXNnKSB7XG4gICAgICBzZWxmLl8obXNnKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogSW5oZXJpdHMgZnJvbSBYSFIgcG9sbGluZyB0cmFuc3BvcnQuXG4gICAqL1xuXG4gIGlvLnV0aWwuaW5oZXJpdChKU09OUFBvbGxpbmcsIGlvLlRyYW5zcG9ydFsneGhyLXBvbGxpbmcnXSk7XG5cbiAgLyoqXG4gICAqIFRyYW5zcG9ydCBuYW1lXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEpTT05QUG9sbGluZy5wcm90b3R5cGUubmFtZSA9ICdqc29ucC1wb2xsaW5nJztcblxuICAvKipcbiAgICogUG9zdHMgYSBlbmNvZGVkIG1lc3NhZ2UgdG8gdGhlIFNvY2tldC5JTyBzZXJ2ZXIgdXNpbmcgYW4gaWZyYW1lLlxuICAgKiBUaGUgaWZyYW1lIGlzIHVzZWQgYmVjYXVzZSBzY3JpcHQgdGFncyBjYW4gY3JlYXRlIFBPU1QgYmFzZWQgcmVxdWVzdHMuXG4gICAqIFRoZSBpZnJhbWUgaXMgcG9zaXRpb25lZCBvdXRzaWRlIG9mIHRoZSB2aWV3IHNvIHRoZSB1c2VyIGRvZXMgbm90XG4gICAqIG5vdGljZSBpdCdzIGV4aXN0ZW5jZS5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRhdGEgQSBlbmNvZGVkIG1lc3NhZ2UuXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBKU09OUFBvbGxpbmcucHJvdG90eXBlLnBvc3QgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCBxdWVyeSA9IGlvLnV0aWwucXVlcnkoXG4gICAgICAgICAgICAgdGhpcy5zb2NrZXQub3B0aW9ucy5xdWVyeVxuICAgICAgICAgICwgJ3Q9JysgKCtuZXcgRGF0ZSkgKyAnJmk9JyArIHRoaXMuaW5kZXhcbiAgICAgICAgKTtcblxuICAgIGlmICghdGhpcy5mb3JtKSB7XG4gICAgICB2YXIgZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKVxuICAgICAgICAsIGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpXG4gICAgICAgICwgaWQgPSB0aGlzLmlmcmFtZUlkID0gJ3NvY2tldGlvX2lmcmFtZV8nICsgdGhpcy5pbmRleFxuICAgICAgICAsIGlmcmFtZTtcblxuICAgICAgZm9ybS5jbGFzc05hbWUgPSAnc29ja2V0aW8nO1xuICAgICAgZm9ybS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICBmb3JtLnN0eWxlLnRvcCA9ICcwcHgnO1xuICAgICAgZm9ybS5zdHlsZS5sZWZ0ID0gJzBweCc7XG4gICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICBmb3JtLnRhcmdldCA9IGlkO1xuICAgICAgZm9ybS5tZXRob2QgPSAnUE9TVCc7XG4gICAgICBmb3JtLnNldEF0dHJpYnV0ZSgnYWNjZXB0LWNoYXJzZXQnLCAndXRmLTgnKTtcbiAgICAgIGFyZWEubmFtZSA9ICdkJztcbiAgICAgIGZvcm0uYXBwZW5kQ2hpbGQoYXJlYSk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGZvcm0pO1xuXG4gICAgICB0aGlzLmZvcm0gPSBmb3JtO1xuICAgICAgdGhpcy5hcmVhID0gYXJlYTtcbiAgICB9XG5cbiAgICB0aGlzLmZvcm0uYWN0aW9uID0gdGhpcy5wcmVwYXJlVXJsKCkgKyBxdWVyeTtcblxuICAgIGZ1bmN0aW9uIGNvbXBsZXRlICgpIHtcbiAgICAgIGluaXRJZnJhbWUoKTtcbiAgICAgIHNlbGYuc29ja2V0LnNldEJ1ZmZlcihmYWxzZSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGluaXRJZnJhbWUgKCkge1xuICAgICAgaWYgKHNlbGYuaWZyYW1lKSB7XG4gICAgICAgIHNlbGYuZm9ybS5yZW1vdmVDaGlsZChzZWxmLmlmcmFtZSk7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIGllNiBkeW5hbWljIGlmcmFtZXMgd2l0aCB0YXJnZXQ9XCJcIiBzdXBwb3J0ICh0aGFua3MgQ2hyaXMgTGFtYmFjaGVyKVxuICAgICAgICBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCc8aWZyYW1lIG5hbWU9XCInKyBzZWxmLmlmcmFtZUlkICsnXCI+Jyk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgICAgICBpZnJhbWUubmFtZSA9IHNlbGYuaWZyYW1lSWQ7XG4gICAgICB9XG5cbiAgICAgIGlmcmFtZS5pZCA9IHNlbGYuaWZyYW1lSWQ7XG5cbiAgICAgIHNlbGYuZm9ybS5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICAgICAgc2VsZi5pZnJhbWUgPSBpZnJhbWU7XG4gICAgfTtcblxuICAgIGluaXRJZnJhbWUoKTtcblxuICAgIC8vIHdlIHRlbXBvcmFyaWx5IHN0cmluZ2lmeSB1bnRpbCB3ZSBmaWd1cmUgb3V0IGhvdyB0byBwcmV2ZW50XG4gICAgLy8gYnJvd3NlcnMgZnJvbSB0dXJuaW5nIGBcXG5gIGludG8gYFxcclxcbmAgaW4gZm9ybSBpbnB1dHNcbiAgICB0aGlzLmFyZWEudmFsdWUgPSBpby5KU09OLnN0cmluZ2lmeShkYXRhKTtcblxuICAgIHRyeSB7XG4gICAgICB0aGlzLmZvcm0uc3VibWl0KCk7XG4gICAgfSBjYXRjaChlKSB7fVxuXG4gICAgaWYgKHRoaXMuaWZyYW1lLmF0dGFjaEV2ZW50KSB7XG4gICAgICBpZnJhbWUub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoc2VsZi5pZnJhbWUucmVhZHlTdGF0ZSA9PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pZnJhbWUub25sb2FkID0gY29tcGxldGU7XG4gICAgfVxuXG4gICAgdGhpcy5zb2NrZXQuc2V0QnVmZmVyKHRydWUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IEpTT05QIHBvbGwgdGhhdCBjYW4gYmUgdXNlZCB0byBsaXN0ZW5cbiAgICogZm9yIG1lc3NhZ2VzIGZyb20gdGhlIFNvY2tldC5JTyBzZXJ2ZXIuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBKU09OUFBvbGxpbmcucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcbiAgICAgICwgcXVlcnkgPSBpby51dGlsLnF1ZXJ5KFxuICAgICAgICAgICAgIHRoaXMuc29ja2V0Lm9wdGlvbnMucXVlcnlcbiAgICAgICAgICAsICd0PScrICgrbmV3IERhdGUpICsgJyZpPScgKyB0aGlzLmluZGV4XG4gICAgICAgICk7XG5cbiAgICBpZiAodGhpcy5zY3JpcHQpIHtcbiAgICAgIHRoaXMuc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5zY3JpcHQpO1xuICAgICAgdGhpcy5zY3JpcHQgPSBudWxsO1xuICAgIH1cblxuICAgIHNjcmlwdC5hc3luYyA9IHRydWU7XG4gICAgc2NyaXB0LnNyYyA9IHRoaXMucHJlcGFyZVVybCgpICsgcXVlcnk7XG4gICAgc2NyaXB0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLm9uQ2xvc2UoKTtcbiAgICB9O1xuXG4gICAgdmFyIGluc2VydEF0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpWzBdO1xuICAgIGluc2VydEF0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHNjcmlwdCwgaW5zZXJ0QXQpO1xuICAgIHRoaXMuc2NyaXB0ID0gc2NyaXB0O1xuXG4gICAgaWYgKGluZGljYXRvcikge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGlmcmFtZSk7XG4gICAgICB9LCAxMDApO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGJhY2sgZnVuY3Rpb24gZm9yIHRoZSBpbmNvbWluZyBtZXNzYWdlIHN0cmVhbSBmcm9tIHRoZSBTb2NrZXQuSU8gc2VydmVyLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGF0YSBUaGUgbWVzc2FnZVxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgSlNPTlBQb2xsaW5nLnByb3RvdHlwZS5fID0gZnVuY3Rpb24gKG1zZykge1xuICAgIHRoaXMub25EYXRhKG1zZyk7XG4gICAgaWYgKHRoaXMuaXNPcGVuKSB7XG4gICAgICB0aGlzLmdldCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogVGhlIGluZGljYXRvciBoYWNrIG9ubHkgd29ya3MgYWZ0ZXIgb25sb2FkXG4gICAqXG4gICAqIEBwYXJhbSB7U29ja2V0fSBzb2NrZXQgVGhlIHNvY2tldCBpbnN0YW5jZSB0aGF0IG5lZWRzIGEgdHJhbnNwb3J0XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFja1xuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgSlNPTlBQb2xsaW5nLnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uIChzb2NrZXQsIGZuKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICghaW5kaWNhdG9yKSByZXR1cm4gZm4uY2FsbCh0aGlzKTtcblxuICAgIGlvLnV0aWwubG9hZChmdW5jdGlvbiAoKSB7XG4gICAgICBmbi5jYWxsKHNlbGYpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgYnJvd3NlciBzdXBwb3J0cyB0aGlzIHRyYW5zcG9ydC5cbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgSlNPTlBQb2xsaW5nLmNoZWNrID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnZG9jdW1lbnQnIGluIGdsb2JhbDtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgY3Jvc3MgZG9tYWluIHJlcXVlc3RzIGFyZSBzdXBwb3J0ZWRcbiAgICpcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEpTT05QUG9sbGluZy54ZG9tYWluQ2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgdHJhbnNwb3J0IHRvIHlvdXIgcHVibGljIGlvLnRyYW5zcG9ydHMgYXJyYXkuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBpby50cmFuc3BvcnRzLnB1c2goJ2pzb25wLXBvbGxpbmcnKTtcblxufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8uVHJhbnNwb3J0IDogbW9kdWxlLmV4cG9ydHNcbiAgLCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5wYXJlbnQuZXhwb3J0c1xuICAsIHRoaXNcbik7XG5cbmlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoW10sIGZ1bmN0aW9uICgpIHsgcmV0dXJuIGlvOyB9KTtcbn1cbn0pKCk7XG59KSh3aW5kb3cpIiwidmFyIHRocm91Z2ggPSByZXF1aXJlKCd0aHJvdWdoJylcblxuZnVuY3Rpb24gZ2V0RWxlbWVudChlbCkge1xuICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBlbClcbiAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbClcbiAgcmV0dXJuIGVsXG59XG5cbi8vZm9yIHRoaW5ncyBsaWtlIENSRFQsIHdlIHdhbnQgdGhpcyB0byByZWFkIGZyb20gZWxlbWVudHMgdGhhdCBhbHJlYWR5IGV4aXN0LFxuLy9PUiBhcmUgZW1pdHRlZC5cbi8vIHZhciB3cml0ZSA9IGVzLndyaXRlLmJpbmQoZXMpOyBzZXEuZWFjaCh3cml0ZSk7IGVzLm9uKCd1cGRhdGUnLCB3cml0ZSk7XG4vLyBeIHdvcmtzIGxpa2UgdGhhdFxuXG5leHBvcnRzLnJlYWQgPSBcbmV4cG9ydHMucmVhZGVyID1cbmV4cG9ydHMucmVhZGFibGUgPSBmdW5jdGlvbiAoZWwsIGV2ZW50cykge1xuICBlbCA9IGdldEVsZW1lbnQoZWwpXG5cbiAgdmFyIHRzID0gdGhyb3VnaCgpXG4gIHRzLndyaXRhYmxlID0gZmFsc2VcbiAgdHMud3JpdGUgPSBudWxsXG4gIHZhciBsaXN0ZW5lcnMgPSB7fVxuXG4gIGZ1bmN0aW9uIGFkZChldmVudCwgbGlzdGVuZXIpIHtcbiAgICBsaXN0ZW5lciA9IGxpc3RlbmVyc1tldmVudF0gPSBsaXN0ZW5lciBcbiAgICAgID8gbGlzdGVuZXIuYmluZCh0cylcbiAgICAgIDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdHMucXVldWUoZSk7XG4gICAgICB9XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIsIGZhbHNlKVxuICB9XG5cbiAgLy9hbHNvIGFsbG93IGV2ZW50cyB0byBiZSBhIHNpbmdsZSBzdHJlYW0sIGV0Yy5cbiAgZm9yKHZhciBrIGluIGV2ZW50cylcbiAgICBhZGQoaywgZXZlbnRzW2tdKVxuXG4gIHRzLm9uKCdjbG9zZScsIGZ1bmN0aW9uICgpIHtcbiAgICBmb3IodmFyIGsgaW4gbGlzdGVuZXJzKSBcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGssIGxpc3RlbmVyc1trXSlcbiAgfSlcblxuICByZXR1cm4gdHNcbn1cblxuZnVuY3Rpb24gZ2V0IChkYXRhLCBrZXkpIHtcbiAgcmV0dXJuICdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEuZ2V0XG4gICAgPyBkYXRhLmdldChrZXkpXG4gICAgOiBkYXRhW2tleV1cbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICBpZDogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICByZXR1cm4gZ2V0KGRhdGEsJ2lkJykgfHwgJ2lkXycrKCcnK01hdGgucmFuZG9tKCkpLnN1YnN0cmluZygyKVxuICB9LFxuICBzb3J0OiBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBnZXQoYSwgJ19zb3J0JykgLSBnZXQoYiwgJ19zb3J0JylcbiAgfSxcbiAgZGVsZXRlOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHJldHVybiBnZXQoZGF0YSwgJ19kZWxldGUnKVxuICB9LFxuICB0ZW1wbGF0ZTogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcmUnKVxuICAgIGVsLmlubmVyVGV4dCA9IEpTT04uc3RyaW5naWZ5KGRhdGEpXG4gICAgcmV0dXJuIGVsXG4gIH0sXG4gIGNsZWFyOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHJldHVybiBkYXRhID09PSAnQ0xFQVInXG4gIH1cbn1cblxuZnVuY3Rpb24gbWVyZ2UgKG8sIGQpIHtcbiAgdmFyIHIgPSB7fVxuICBmb3IgKHZhciBrIGluIGQpXG4gICAgcltrXSA9IG9ba10gfHwgZFtrXVxuICByZXR1cm4gclxufVxuXG5mdW5jdGlvbiBnZXRCeUlkIChlbCwgaWQpIHtcbiAgcmV0dXJuIGVsLnF1ZXJ5U2VsZWN0b3IgXG4gICAgPyBlbC5xdWVyeVNlbGVjdG9yKCcjJytpZClcbiAgICA6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxufVxuXG5leHBvcnRzLndyaXRlID0gXG5leHBvcnRzLndyaXRlciA9IFxuZXhwb3J0cy53cml0YWJsZSA9IGZ1bmN0aW9uIChlbCwgb3B0cykge1xuICBlbCA9IGdldEVsZW1lbnQoZWwpXG4gIG9wdHMgPSBvcHRzIHx8IHt9XG4gIFxuICB2YXIgdCA9ICdmdW5jdGlvbicgPT09IHR5cGVvZiBvcHRzIFxuICAgID8ge3RlbXBsYXRlOiBvcHRzfVxuICAgIDogb3B0c1xuXG4gIHQgPSBtZXJnZSh0LCBkZWZhdWx0cylcbiAgdmFyIG9iamVjdHMgPSB7fVxuXG4gIGZ1bmN0aW9uIG9yZGVyZWRJbnNlcnQoZWwsIGNoKSB7XG4gICAgdmFyIGxlbmd0aCA9IGVsLmNoaWxkRWxlbWVudENvdW50XG4gICAgdmFyIGMgPSAwXG5cbiAgICBmdW5jdGlvbiBpbnNlcnQgKHBhcmVudCwgZWwsIGkpIHtcbiAgICAgIGlmKGkgPT0gcGFyZW50LmNoaWxkRWxlbWVudENvdW50KVxuICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoZWwpXG4gICAgICBlbHNlXG4gICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoZWwsIHBhcmVudC5jaGlsZHJlbltpXSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbXAoaykge1xuICAgICAgdmFyIF9pZCA9IGVsLmNoaWxkcmVuW2tdLmlkXG4gICAgICByZXR1cm4gb3B0cy5zb3J0KG9iamVjdHNbY2guaWRdLCBvYmplY3RzW19pZF0pXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYmV0d2VlbiAoaSwgaikge1xuICAgICAgaWYoYyArKyA+IDIwKVxuICAgICAgICByZXR1cm5cbiAgICAgIGlmKGkgPiBqKSB0aHJvdyBuZXcgRXJyb3IoJ2Jyb2tlbjonK2krJywnK2opXG4gICAgICBpZihpID09PSBqKVxuICAgICAgICByZXR1cm4gaW5zZXJ0KGVsLCBjaCwgailcbiAgICAgIC8vc2VsZWN0IGluZGV4IHRvIHNwbGl0IG9uXG4gICAgICB2YXIgayA9IH5+KChpICsgaikgLyAyKVxuICAgIFxuICAgICAgaWYoY21wKGspID4gMClcbiAgICAgICAgYmV0d2VlbihrICsgMSwgailcbiAgICAgIGVsc2VcbiAgICAgICAgYmV0d2VlbihpLCBrKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmKGxlbmd0aCA9PT0gMCkge1xuICAgICAgaW5zZXJ0KGVsLCBjaCwgMClcbiAgICB9IGVsc2VcbiAgICAgIGJldHdlZW4oMCwgbGVuZ3RoKVxuICB9XG5cbiAgdmFyIHRzID0gdGhyb3VnaCAoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBpZih0LmNsZWFyKGRhdGEpKVxuICAgICAgcmV0dXJuIHRzLmNsZWFyKClcblxuICAgIC8vc2VlIGlmIGFuIGVsZW1lbnQgYWxyZWFkeSBleGlzdHMgd2l0aCB0aGlzIGlkLlxuICAgIHZhciBpZCA9IHQuaWQoZGF0YSlcbiAgICB2YXIgX2NoID0gaWQgJiYgZ2V0QnlJZChlbCwgaWQpXG5cbiAgICAvL3JldHVybmluZyBmYWxzZSBpbmRpY2F0ZXMgdG8gcmVtb3ZlIHRoZSBpdGVtLlxuICAgIGlmKHQuZGVsZXRlKGRhdGEpICYmIF9jaCkge1xuICAgICAgZGVsZXRlIG9iamVjdHNbaWRdXG4gICAgICByZXR1cm4gZWwucmVtb3ZlQ2hpbGQoX2NoKVxuICAgIH1cblxuICAgIC8vY3JlYXRlIHVwZGF0ZVxuICAgIHZhciBjaCA9IHQudGVtcGxhdGUuY2FsbChfY2gsIGRhdGEpXG4gICAgLy9pZiB0aGUgdGVtcGxhdGUgZGlkIG5vdCBhZGQgYSBpZCxcblxuICAgIC8vdGhlIHRlbXBsYXRlIGp1c3QgdXBkYXRlZCB0aGUgZWxlbWVudCwgZG8gbm90IHJlcGxhY2UgaXQuXG4gICAgaWYoY2ggPT09IF9jaCkgcmV0dXJuXG5cbiAgICAvL3NldCB0aGUgaWQuXG4gICAgaWYoY2ggJiYgIWNoLmlkICYmIGlkKSBjaC5pZCA9IGlkXG4gICAgLy9jaGVjayBpZiB0aGVyZSBpcyBhbiBvbGQgZWxlbWVudCB3aXRoIHRoZSBzYW1lIGlkLlxuICAgIGlmKCFfY2ggJiYgY2guaWQpIF9jaCA9IGdldEJ5SWQoaWQpXG4gICAgb2JqZWN0c1tpZF0gPSBkYXRhXG5cbiAgICAvL3JlcGxhY2UgbmVlZHMgdG8gY2hlY2sgaWYgdGhlIHNvcnQgaGFzIGNoYW5nZWQuLi5cbiAgICAvL2p1c3QgcmVtb3ZlIHRoZSBvbGQgY2hpbGQsIGFuZCBpbnNlcnQgbmV3IG9uZS5cblxuICAgIGlmKCFvcHRzLnNvcnQpIHtcbiAgICAgIGlmKGNoICYmIF9jaCAmJiBjaCAhPT0gX2NoKVxuICAgICAgICBlbC5yZXBsYWNlQ2hpbGQoY2gsIF9jaClcbiAgICAgIGVsc2VcbiAgICAgICAgZWwuYXBwZW5kQ2hpbGQoY2gpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKGNoICYmIF9jaClcbiAgICAgICAgcmV0dXJuIGVsLnJlbW92ZUNoaWxkKF9jaCksIG9yZGVyZWRJbnNlcnQoZWwsIGNoKVxuICAgICAgZWxzZVxuICAgICAgICBvcmRlcmVkSW5zZXJ0KGVsLCBjaClcbiAgICB9XG4gICAgdHMucXVldWUoY2gpXG4gIH0sIGZ1bmN0aW9uICgpIHtcbiAgICB0cy5xdWV1ZShudWxsKVxuICB9KVxuXG4gIHRzLnNvcnQgPSBmdW5jdGlvbiAoY21wKSB7XG4gICAgb3B0cy5zb3J0ID0gY21wXG4gICAgdmFyIGEgPSBbXVxuICAgIC8vIHJlbW92ZSBhbGwgZWxlbWVudHMgYW5kIGFkZCB0aGVtIGJhY2suXG4gICAgLy8gdGhlcmUgaXMgcHJvYmFibHkgYSBiZXR0ZXIgd2F5IHRvIGRvIHRoaXMsIFxuICAgIC8vIG9ubHkgcmVtb3ZpbmcgaXRlbXMgd2hpY2ggYXJlIG91dCBvZiBvcmRlci5cbiAgICAvLyB3aGF0IGlzIHRoZSBiZXN0IGFsZ29yaXRobSB0byBzb3J0IGEgbGlua2VkIGxpc3Q/XG4gICAgd2hpbGUoZWwuY2hpbGRFbGVtZW50Q291bnQgPiAxKVxuICAgICAgYS5wdXNoKGVsLmZpcnN0Q2hpbGQpLCBlbC5yZW1vdmVDaGlsZChlbC5maXJzdENoaWxkKVxuICAgIGEuZm9yRWFjaChmdW5jdGlvbiAoY2gpIHtcbiAgICAgIG9yZGVyZWRJbnNlcnQoZWwsIGNoKVxuICAgIH0pXG4gIH1cblxuICB0cy5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICBlbC50ZXh0Q29udGVudCA9IFwiXCJcbiAgICBib3R0b20gPSBudWxsXG4gICAgb2JqZWN0cyA9IHt9XG4gICAgdGhpcy5yZXN1bWUoKVxuICAgIHJldHVyblxuICB9XG4gIHJldHVybiB0c1xufVxuXG4vL0RPIFNPTUVUSElORyBXSVRIIFRISVMgU1RVRkYhXG5cbmZ1bmN0aW9uIGdldE1heCgpIHtcbiAgcmV0dXJuIHdpbmRvdy5zY3JvbGxZICsgd2luZG93LmlubmVySGVpZ2h0XG59XG5cbmZ1bmN0aW9uIGdldEJvdHRvbShjaCkge1xuICByZXR1cm4gY2gub2Zmc2V0VG9wICsgY2guY2xpZW50SGVpZ2h0XG59XG5cbmZ1bmN0aW9uIHBhdXNlICgpIHtcbiAgLy8gbWFrZSBhIHN0cmVhbSB0aGF0IGp1c3QgXG4gIC8vIHBhdXNlcyB3aGVuIHNvbWV0aGluZyBpcyB3cml0dGVuIG9mZiB0aGUgc2NyZWVuLlxufVxuXG4vLyBUT0RPLCBtYWtlIHRoaXMgc29ydCBpdGVtcyFcbi8vIFxuXG4vKlxuICAvL21ha2UgdGhpcyBhIHNlcGFyYXRlIHN0cmVhbS4uLlxuICAvL3RoYXQgd2lsbCBiZSBpbXBvcnRhbnQgd2hlbiBwbGF5aW5nXG4gIC8vdHJhY2tzIG9mZiBzZXJ2aWNlcyB3aXRoIGxvYWRzIG9mIHN0dWZmXG4gIC8vc3VjaCBhcyB5b3V0dWJlLlxuICB2YXIgIG1heCA9IGdldE1heCgpLCBib3R0b20gPSBudWxsLCB0c1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZnVuY3Rpb24gKCkge1xuICAgIG1heCA9IGdldE1heCgpXG4gICAgaWYoYm90dG9tICYmIG1heCA+IGdldEJvdHRvbShib3R0b20pIC0gMSlcbiAgICAgIHRzLnJlc3VtZSgpXG4gIH0pXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgbWF4ID0gZ2V0TWF4KClcbiAgICBpZihib3R0b20gJiYgbWF4ID4gZ2V0Qm90dG9tKGJvdHRvbSkgLSAxKVxuICAgICAgdHMucmVzdW1lKClcbiAgfSlcbiovXG5cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICBpZiAoZXYuc291cmNlID09PSB3aW5kb3cgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwiKGZ1bmN0aW9uKHByb2Nlc3Mpe3ZhciBTdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKVxuXG4vLyB0aHJvdWdoXG4vL1xuLy8gYSBzdHJlYW0gdGhhdCBkb2VzIG5vdGhpbmcgYnV0IHJlLWVtaXQgdGhlIGlucHV0LlxuLy8gdXNlZnVsIGZvciBhZ2dyZWdhdGluZyBhIHNlcmllcyBvZiBjaGFuZ2luZyBidXQgbm90IGVuZGluZyBzdHJlYW1zIGludG8gb25lIHN0cmVhbSlcblxuXG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHRocm91Z2hcbnRocm91Z2gudGhyb3VnaCA9IHRocm91Z2hcblxuLy9jcmVhdGUgYSByZWFkYWJsZSB3cml0YWJsZSBzdHJlYW0uXG5cbmZ1bmN0aW9uIHRocm91Z2ggKHdyaXRlLCBlbmQpIHtcbiAgd3JpdGUgPSB3cml0ZSB8fCBmdW5jdGlvbiAoZGF0YSkgeyB0aGlzLmVtaXQoJ2RhdGEnLCBkYXRhKSB9XG4gIGVuZCA9IGVuZCB8fCBmdW5jdGlvbiAoKSB7IHRoaXMuZW1pdCgnZW5kJykgfVxuXG4gIHZhciBlbmRlZCA9IGZhbHNlLCBkZXN0cm95ZWQgPSBmYWxzZVxuICB2YXIgc3RyZWFtID0gbmV3IFN0cmVhbSgpLCBidWZmZXIgPSBbXVxuICBzdHJlYW0uYnVmZmVyID0gYnVmZmVyXG4gIHN0cmVhbS5yZWFkYWJsZSA9IHN0cmVhbS53cml0YWJsZSA9IHRydWVcbiAgc3RyZWFtLnBhdXNlZCA9IGZhbHNlXG4gIHN0cmVhbS53cml0ZSA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgd3JpdGUuY2FsbCh0aGlzLCBkYXRhKVxuICAgIHJldHVybiAhc3RyZWFtLnBhdXNlZFxuICB9XG5cbiAgZnVuY3Rpb24gZHJhaW4oKSB7XG4gICAgd2hpbGUoYnVmZmVyLmxlbmd0aCAmJiAhc3RyZWFtLnBhdXNlZCkge1xuICAgICAgdmFyIGRhdGEgPSBidWZmZXIuc2hpZnQoKVxuICAgICAgaWYobnVsbCA9PT0gZGF0YSlcbiAgICAgICAgcmV0dXJuIHN0cmVhbS5lbWl0KCdlbmQnKVxuICAgICAgZWxzZVxuICAgICAgICBzdHJlYW0uZW1pdCgnZGF0YScsIGRhdGEpXG4gICAgfVxuICB9XG5cbiAgc3RyZWFtLnF1ZXVlID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBidWZmZXIucHVzaChkYXRhKVxuICAgIGRyYWluKClcbiAgfVxuXG4gIC8vdGhpcyB3aWxsIGJlIHJlZ2lzdGVyZWQgYXMgdGhlIGZpcnN0ICdlbmQnIGxpc3RlbmVyXG4gIC8vbXVzdCBjYWxsIGRlc3Ryb3kgbmV4dCB0aWNrLCB0byBtYWtlIHN1cmUgd2UncmUgYWZ0ZXIgYW55XG4gIC8vc3RyZWFtIHBpcGVkIGZyb20gaGVyZS5cbiAgLy90aGlzIGlzIG9ubHkgYSBwcm9ibGVtIGlmIGVuZCBpcyBub3QgZW1pdHRlZCBzeW5jaHJvbm91c2x5LlxuICAvL2EgbmljZXIgd2F5IHRvIGRvIHRoaXMgaXMgdG8gbWFrZSBzdXJlIHRoaXMgaXMgdGhlIGxhc3QgbGlzdGVuZXIgZm9yICdlbmQnXG5cbiAgc3RyZWFtLm9uKCdlbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgc3RyZWFtLnJlYWRhYmxlID0gZmFsc2VcbiAgICBpZighc3RyZWFtLndyaXRhYmxlKVxuICAgICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0cmVhbS5kZXN0cm95KClcbiAgICAgIH0pXG4gIH0pXG5cbiAgZnVuY3Rpb24gX2VuZCAoKSB7XG4gICAgc3RyZWFtLndyaXRhYmxlID0gZmFsc2VcbiAgICBlbmQuY2FsbChzdHJlYW0pXG4gICAgaWYoIXN0cmVhbS5yZWFkYWJsZSlcbiAgICAgIHN0cmVhbS5kZXN0cm95KClcbiAgfVxuXG4gIHN0cmVhbS5lbmQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGlmKGVuZGVkKSByZXR1cm5cbiAgICBlbmRlZCA9IHRydWVcbiAgICBpZihhcmd1bWVudHMubGVuZ3RoKSBzdHJlYW0ud3JpdGUoZGF0YSlcbiAgICBfZW5kKCkgLy8gd2lsbCBlbWl0IG9yIHF1ZXVlXG4gIH1cblxuICBzdHJlYW0uZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZihkZXN0cm95ZWQpIHJldHVyblxuICAgIGRlc3Ryb3llZCA9IHRydWVcbiAgICBlbmRlZCA9IHRydWVcbiAgICBidWZmZXIubGVuZ3RoID0gMFxuICAgIHN0cmVhbS53cml0YWJsZSA9IHN0cmVhbS5yZWFkYWJsZSA9IGZhbHNlXG4gICAgc3RyZWFtLmVtaXQoJ2Nsb3NlJylcbiAgfVxuXG4gIHN0cmVhbS5wYXVzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZihzdHJlYW0ucGF1c2VkKSByZXR1cm5cbiAgICBzdHJlYW0ucGF1c2VkID0gdHJ1ZVxuICAgIHN0cmVhbS5lbWl0KCdwYXVzZScpXG4gIH1cbiAgc3RyZWFtLnJlc3VtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZihzdHJlYW0ucGF1c2VkKSB7XG4gICAgICBzdHJlYW0ucGF1c2VkID0gZmFsc2VcbiAgICB9XG4gICAgZHJhaW4oKVxuICAgIC8vbWF5IGhhdmUgYmVjb21lIHBhdXNlZCBhZ2FpbixcbiAgICAvL2FzIGRyYWluIGVtaXRzICdkYXRhJy5cbiAgICBpZighc3RyZWFtLnBhdXNlZClcbiAgICAgIHN0cmVhbS5lbWl0KCdkcmFpbicpXG4gIH1cbiAgcmV0dXJuIHN0cmVhbVxufVxuXG5cbn0pKHJlcXVpcmUoXCJfX2Jyb3dzZXJpZnlfcHJvY2Vzc1wiKSkiLCJ2YXIgZXZlbnRzID0gcmVxdWlyZSgnZXZlbnRzJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxuZnVuY3Rpb24gU3RyZWFtKCkge1xuICBldmVudHMuRXZlbnRFbWl0dGVyLmNhbGwodGhpcyk7XG59XG51dGlsLmluaGVyaXRzKFN0cmVhbSwgZXZlbnRzLkV2ZW50RW1pdHRlcik7XG5tb2R1bGUuZXhwb3J0cyA9IFN0cmVhbTtcbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuNC54XG5TdHJlYW0uU3RyZWFtID0gU3RyZWFtO1xuXG5TdHJlYW0ucHJvdG90eXBlLnBpcGUgPSBmdW5jdGlvbihkZXN0LCBvcHRpb25zKSB7XG4gIHZhciBzb3VyY2UgPSB0aGlzO1xuXG4gIGZ1bmN0aW9uIG9uZGF0YShjaHVuaykge1xuICAgIGlmIChkZXN0LndyaXRhYmxlKSB7XG4gICAgICBpZiAoZmFsc2UgPT09IGRlc3Qud3JpdGUoY2h1bmspICYmIHNvdXJjZS5wYXVzZSkge1xuICAgICAgICBzb3VyY2UucGF1c2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzb3VyY2Uub24oJ2RhdGEnLCBvbmRhdGEpO1xuXG4gIGZ1bmN0aW9uIG9uZHJhaW4oKSB7XG4gICAgaWYgKHNvdXJjZS5yZWFkYWJsZSAmJiBzb3VyY2UucmVzdW1lKSB7XG4gICAgICBzb3VyY2UucmVzdW1lKCk7XG4gICAgfVxuICB9XG5cbiAgZGVzdC5vbignZHJhaW4nLCBvbmRyYWluKTtcblxuICAvLyBJZiB0aGUgJ2VuZCcgb3B0aW9uIGlzIG5vdCBzdXBwbGllZCwgZGVzdC5lbmQoKSB3aWxsIGJlIGNhbGxlZCB3aGVuXG4gIC8vIHNvdXJjZSBnZXRzIHRoZSAnZW5kJyBvciAnY2xvc2UnIGV2ZW50cy4gIE9ubHkgZGVzdC5lbmQoKSBvbmNlLCBhbmRcbiAgLy8gb25seSB3aGVuIGFsbCBzb3VyY2VzIGhhdmUgZW5kZWQuXG4gIGlmICghZGVzdC5faXNTdGRpbyAmJiAoIW9wdGlvbnMgfHwgb3B0aW9ucy5lbmQgIT09IGZhbHNlKSkge1xuICAgIGRlc3QuX3BpcGVDb3VudCA9IGRlc3QuX3BpcGVDb3VudCB8fCAwO1xuICAgIGRlc3QuX3BpcGVDb3VudCsrO1xuXG4gICAgc291cmNlLm9uKCdlbmQnLCBvbmVuZCk7XG4gICAgc291cmNlLm9uKCdjbG9zZScsIG9uY2xvc2UpO1xuICB9XG5cbiAgdmFyIGRpZE9uRW5kID0gZmFsc2U7XG4gIGZ1bmN0aW9uIG9uZW5kKCkge1xuICAgIGlmIChkaWRPbkVuZCkgcmV0dXJuO1xuICAgIGRpZE9uRW5kID0gdHJ1ZTtcblxuICAgIGRlc3QuX3BpcGVDb3VudC0tO1xuXG4gICAgLy8gcmVtb3ZlIHRoZSBsaXN0ZW5lcnNcbiAgICBjbGVhbnVwKCk7XG5cbiAgICBpZiAoZGVzdC5fcGlwZUNvdW50ID4gMCkge1xuICAgICAgLy8gd2FpdGluZyBmb3Igb3RoZXIgaW5jb21pbmcgc3RyZWFtcyB0byBlbmQuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZGVzdC5lbmQoKTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gb25jbG9zZSgpIHtcbiAgICBpZiAoZGlkT25FbmQpIHJldHVybjtcbiAgICBkaWRPbkVuZCA9IHRydWU7XG5cbiAgICBkZXN0Ll9waXBlQ291bnQtLTtcblxuICAgIC8vIHJlbW92ZSB0aGUgbGlzdGVuZXJzXG4gICAgY2xlYW51cCgpO1xuXG4gICAgaWYgKGRlc3QuX3BpcGVDb3VudCA+IDApIHtcbiAgICAgIC8vIHdhaXRpbmcgZm9yIG90aGVyIGluY29taW5nIHN0cmVhbXMgdG8gZW5kLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGRlc3QuZGVzdHJveSgpO1xuICB9XG5cbiAgLy8gZG9uJ3QgbGVhdmUgZGFuZ2xpbmcgcGlwZXMgd2hlbiB0aGVyZSBhcmUgZXJyb3JzLlxuICBmdW5jdGlvbiBvbmVycm9yKGVyKSB7XG4gICAgY2xlYW51cCgpO1xuICAgIGlmICh0aGlzLmxpc3RlbmVycygnZXJyb3InKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgc3RyZWFtIGVycm9yIGluIHBpcGUuXG4gICAgfVxuICB9XG5cbiAgc291cmNlLm9uKCdlcnJvcicsIG9uZXJyb3IpO1xuICBkZXN0Lm9uKCdlcnJvcicsIG9uZXJyb3IpO1xuXG4gIC8vIHJlbW92ZSBhbGwgdGhlIGV2ZW50IGxpc3RlbmVycyB0aGF0IHdlcmUgYWRkZWQuXG4gIGZ1bmN0aW9uIGNsZWFudXAoKSB7XG4gICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKCdkYXRhJywgb25kYXRhKTtcbiAgICBkZXN0LnJlbW92ZUxpc3RlbmVyKCdkcmFpbicsIG9uZHJhaW4pO1xuXG4gICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKCdlbmQnLCBvbmVuZCk7XG4gICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsIG9uY2xvc2UpO1xuXG4gICAgc291cmNlLnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIG9uZXJyb3IpO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgb25lcnJvcik7XG5cbiAgICBzb3VyY2UucmVtb3ZlTGlzdGVuZXIoJ2VuZCcsIGNsZWFudXApO1xuICAgIHNvdXJjZS5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBjbGVhbnVwKTtcblxuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2VuZCcsIGNsZWFudXApO1xuICAgIGRlc3QucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJywgY2xlYW51cCk7XG4gIH1cblxuICBzb3VyY2Uub24oJ2VuZCcsIGNsZWFudXApO1xuICBzb3VyY2Uub24oJ2Nsb3NlJywgY2xlYW51cCk7XG5cbiAgZGVzdC5vbignZW5kJywgY2xlYW51cCk7XG4gIGRlc3Qub24oJ2Nsb3NlJywgY2xlYW51cCk7XG5cbiAgZGVzdC5lbWl0KCdwaXBlJywgc291cmNlKTtcblxuICAvLyBBbGxvdyBmb3IgdW5peC1saWtlIHVzYWdlOiBBLnBpcGUoQikucGlwZShDKVxuICByZXR1cm4gZGVzdDtcbn07XG4iLCIoZnVuY3Rpb24ocHJvY2Vzcyl7aWYgKCFwcm9jZXNzLkV2ZW50RW1pdHRlcikgcHJvY2Vzcy5FdmVudEVtaXR0ZXIgPSBmdW5jdGlvbiAoKSB7fTtcblxudmFyIEV2ZW50RW1pdHRlciA9IGV4cG9ydHMuRXZlbnRFbWl0dGVyID0gcHJvY2Vzcy5FdmVudEVtaXR0ZXI7XG52YXIgaXNBcnJheSA9IHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nXG4gICAgPyBBcnJheS5pc0FycmF5XG4gICAgOiBmdW5jdGlvbiAoeHMpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgICB9XG47XG5mdW5jdGlvbiBpbmRleE9mICh4cywgeCkge1xuICAgIGlmICh4cy5pbmRleE9mKSByZXR1cm4geHMuaW5kZXhPZih4KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh4ID09PSB4c1tpXSkgcmV0dXJuIGk7XG4gICAgfVxuICAgIHJldHVybiAtMTtcbn1cblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhblxuLy8gMTAgbGlzdGVuZXJzIGFyZSBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoXG4vLyBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbi8vXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxudmFyIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0ge307XG4gIHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnMgPSBuO1xufTtcblxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc0FycmF5KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKVxuICAgIHtcbiAgICAgIGlmIChhcmd1bWVudHNbMV0gaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBhcmd1bWVudHNbMV07IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmNhdWdodCwgdW5zcGVjaWZpZWQgJ2Vycm9yJyBldmVudC5cIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiBmYWxzZTtcbiAgdmFyIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGlmICghaGFuZGxlcikgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICh0eXBlb2YgaGFuZGxlciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG5cbiAgfSBlbHNlIGlmIChpc0FycmF5KGhhbmRsZXIpKSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgdmFyIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG5cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbi8vIEV2ZW50RW1pdHRlciBpcyBkZWZpbmVkIGluIHNyYy9ub2RlX2V2ZW50cy5jY1xuLy8gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0KCkgaXMgYWxzbyBkZWZpbmVkIHRoZXJlLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICgnZnVuY3Rpb24nICE9PSB0eXBlb2YgbGlzdGVuZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2FkZExpc3RlbmVyIG9ubHkgdGFrZXMgaW5zdGFuY2VzIG9mIEZ1bmN0aW9uJyk7XG4gIH1cblxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PSBcIm5ld0xpc3RlbmVyc1wiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lcnNcIi5cbiAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSkge1xuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICB9IGVsc2UgaWYgKGlzQXJyYXkodGhpcy5fZXZlbnRzW3R5cGVdKSkge1xuXG4gICAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICAgIHZhciBtO1xuICAgICAgaWYgKHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBtID0gdGhpcy5fZXZlbnRzLm1heExpc3RlbmVycztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG0gPSBkZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgICAgfVxuXG4gICAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICB9IGVsc2Uge1xuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5vbih0eXBlLCBmdW5jdGlvbiBnKCkge1xuICAgIHNlbGYucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG4gICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCdmdW5jdGlvbicgIT09IHR5cGVvZiBsaXN0ZW5lcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVtb3ZlTGlzdGVuZXIgb25seSB0YWtlcyBpbnN0YW5jZXMgb2YgRnVuY3Rpb24nKTtcbiAgfVxuXG4gIC8vIGRvZXMgbm90IHVzZSBsaXN0ZW5lcnMoKSwgc28gbm8gc2lkZSBlZmZlY3Qgb2YgY3JlYXRpbmcgX2V2ZW50c1t0eXBlXVxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKSByZXR1cm4gdGhpcztcblxuICB2YXIgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNBcnJheShsaXN0KSkge1xuICAgIHZhciBpID0gaW5kZXhPZihsaXN0LCBsaXN0ZW5lcik7XG4gICAgaWYgKGkgPCAwKSByZXR1cm4gdGhpcztcbiAgICBsaXN0LnNwbGljZShpLCAxKTtcbiAgICBpZiAobGlzdC5sZW5ndGggPT0gMClcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIH0gZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdID09PSBsaXN0ZW5lcikge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZG9lcyBub3QgdXNlIGxpc3RlbmVycygpLCBzbyBubyBzaWRlIGVmZmVjdCBvZiBjcmVhdGluZyBfZXZlbnRzW3R5cGVdXG4gIGlmICh0eXBlICYmIHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbdHlwZV0pIHRoaXMuX2V2ZW50c1t0eXBlXSA9IG51bGw7XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSB7fTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFtdO1xuICBpZiAoIWlzQXJyYXkodGhpcy5fZXZlbnRzW3R5cGVdKSkge1xuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICB9XG4gIHJldHVybiB0aGlzLl9ldmVudHNbdHlwZV07XG59O1xuXG59KShyZXF1aXJlKFwiX19icm93c2VyaWZ5X3Byb2Nlc3NcIikpIiwidmFyIGV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuXG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuZXhwb3J0cy5pc0RhdGUgPSBmdW5jdGlvbihvYmope3JldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgRGF0ZV0nfTtcbmV4cG9ydHMuaXNSZWdFeHAgPSBmdW5jdGlvbihvYmope3JldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSd9O1xuXG5cbmV4cG9ydHMucHJpbnQgPSBmdW5jdGlvbiAoKSB7fTtcbmV4cG9ydHMucHV0cyA9IGZ1bmN0aW9uICgpIHt9O1xuZXhwb3J0cy5kZWJ1ZyA9IGZ1bmN0aW9uKCkge307XG5cbmV4cG9ydHMuaW5zcGVjdCA9IGZ1bmN0aW9uKG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycykge1xuICB2YXIgc2VlbiA9IFtdO1xuXG4gIHZhciBzdHlsaXplID0gZnVuY3Rpb24oc3RyLCBzdHlsZVR5cGUpIHtcbiAgICAvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3NcbiAgICB2YXIgc3R5bGVzID1cbiAgICAgICAgeyAnYm9sZCcgOiBbMSwgMjJdLFxuICAgICAgICAgICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgICAgICAgICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICAgICAgICAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgICAgICAgICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICAgICAgICAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICAgICAgICAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAgICAgICAgICdibHVlJyA6IFszNCwgMzldLFxuICAgICAgICAgICdjeWFuJyA6IFszNiwgMzldLFxuICAgICAgICAgICdncmVlbicgOiBbMzIsIDM5XSxcbiAgICAgICAgICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgICAgICAgICAncmVkJyA6IFszMSwgMzldLFxuICAgICAgICAgICd5ZWxsb3cnIDogWzMzLCAzOV0gfTtcblxuICAgIHZhciBzdHlsZSA9XG4gICAgICAgIHsgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICAgICAgICAgJ251bWJlcic6ICdibHVlJyxcbiAgICAgICAgICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAgICAgICAgICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICAgICAgICAgJ251bGwnOiAnYm9sZCcsXG4gICAgICAgICAgJ3N0cmluZyc6ICdncmVlbicsXG4gICAgICAgICAgJ2RhdGUnOiAnbWFnZW50YScsXG4gICAgICAgICAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgICAgICAgICAncmVnZXhwJzogJ3JlZCcgfVtzdHlsZVR5cGVdO1xuXG4gICAgaWYgKHN0eWxlKSB7XG4gICAgICByZXR1cm4gJ1xcMDMzWycgKyBzdHlsZXNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgICAnXFwwMzNbJyArIHN0eWxlc1tzdHlsZV1bMV0gKyAnbSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICB9O1xuICBpZiAoISBjb2xvcnMpIHtcbiAgICBzdHlsaXplID0gZnVuY3Rpb24oc3RyLCBzdHlsZVR5cGUpIHsgcmV0dXJuIHN0cjsgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdCh2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gICAgLy8gUHJvdmlkZSBhIGhvb2sgZm9yIHVzZXItc3BlY2lmaWVkIGluc3BlY3QgZnVuY3Rpb25zLlxuICAgIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUuaW5zcGVjdCA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgICAgdmFsdWUgIT09IGV4cG9ydHMgJiZcbiAgICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB2YWx1ZS5pbnNwZWN0KHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuXG4gICAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuICAgICAgY2FzZSAndW5kZWZpbmVkJzpcbiAgICAgICAgcmV0dXJuIHN0eWxpemUoJ3VuZGVmaW5lZCcsICd1bmRlZmluZWQnKTtcblxuICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICAgICAgcmV0dXJuIHN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG5cbiAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICAgIHJldHVybiBzdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcblxuICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgIHJldHVybiBzdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gICAgfVxuICAgIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBzdHlsaXplKCdudWxsJywgJ251bGwnKTtcbiAgICB9XG5cbiAgICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gICAgdmFyIHZpc2libGVfa2V5cyA9IE9iamVjdF9rZXlzKHZhbHVlKTtcbiAgICB2YXIga2V5cyA9IHNob3dIaWRkZW4gPyBPYmplY3RfZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSkgOiB2aXNpYmxlX2tleXM7XG5cbiAgICAvLyBGdW5jdGlvbnMgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICYmIGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBzdHlsaXplKCcnICsgdmFsdWUsICdyZWdleHAnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICAgIHJldHVybiBzdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEYXRlcyB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkXG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkgJiYga2V5cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBzdHlsaXplKHZhbHVlLnRvVVRDU3RyaW5nKCksICdkYXRlJyk7XG4gICAgfVxuXG4gICAgdmFyIGJhc2UsIHR5cGUsIGJyYWNlcztcbiAgICAvLyBEZXRlcm1pbmUgdGhlIG9iamVjdCB0eXBlXG4gICAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICB0eXBlID0gJ0FycmF5JztcbiAgICAgIGJyYWNlcyA9IFsnWycsICddJ107XG4gICAgfSBlbHNlIHtcbiAgICAgIHR5cGUgPSAnT2JqZWN0JztcbiAgICAgIGJyYWNlcyA9IFsneycsICd9J107XG4gICAgfVxuXG4gICAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdmFyIG4gPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgIGJhc2UgPSAoaXNSZWdFeHAodmFsdWUpKSA/ICcgJyArIHZhbHVlIDogJyBbRnVuY3Rpb24nICsgbiArICddJztcbiAgICB9IGVsc2Uge1xuICAgICAgYmFzZSA9ICcnO1xuICAgIH1cblxuICAgIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICBiYXNlID0gJyAnICsgdmFsdWUudG9VVENTdHJpbmcoKTtcbiAgICB9XG5cbiAgICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgYnJhY2VzWzFdO1xuICAgIH1cblxuICAgIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBzdHlsaXplKCcnICsgdmFsdWUsICdyZWdleHAnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2Vlbi5wdXNoKHZhbHVlKTtcblxuICAgIHZhciBvdXRwdXQgPSBrZXlzLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHZhciBuYW1lLCBzdHI7XG4gICAgICBpZiAodmFsdWUuX19sb29rdXBHZXR0ZXJfXykge1xuICAgICAgICBpZiAodmFsdWUuX19sb29rdXBHZXR0ZXJfXyhrZXkpKSB7XG4gICAgICAgICAgaWYgKHZhbHVlLl9fbG9va3VwU2V0dGVyX18oa2V5KSkge1xuICAgICAgICAgICAgc3RyID0gc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RyID0gc3R5bGl6ZSgnW0dldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodmFsdWUuX19sb29rdXBTZXR0ZXJfXyhrZXkpKSB7XG4gICAgICAgICAgICBzdHIgPSBzdHlsaXplKCdbU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodmlzaWJsZV9rZXlzLmluZGV4T2Yoa2V5KSA8IDApIHtcbiAgICAgICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgICAgIH1cbiAgICAgIGlmICghc3RyKSB7XG4gICAgICAgIGlmIChzZWVuLmluZGV4T2YodmFsdWVba2V5XSkgPCAwKSB7XG4gICAgICAgICAgaWYgKHJlY3Vyc2VUaW1lcyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgc3RyID0gZm9ybWF0KHZhbHVlW2tleV0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHIgPSBmb3JtYXQodmFsdWVba2V5XSwgcmVjdXJzZVRpbWVzIC0gMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICAgICAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLnN1YnN0cigyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnICAgJyArIGxpbmU7XG4gICAgICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHIgPSBzdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAodHlwZSA9PT0gJ0FycmF5JyAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgfVxuICAgICAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgICAgICBpZiAobmFtZS5tYXRjaCgvXlwiKFthLXpBLVpfXVthLXpBLVpfMC05XSopXCIkLykpIHtcbiAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgICAgICBuYW1lID0gc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICAgICAgbmFtZSA9IHN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbiAgICB9KTtcblxuICAgIHNlZW4ucG9wKCk7XG5cbiAgICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICAgIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgICAgbnVtTGluZXNFc3QrKztcbiAgICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICAgIHJldHVybiBwcmV2ICsgY3VyLmxlbmd0aCArIDE7XG4gICAgfSwgMCk7XG5cbiAgICBpZiAobGVuZ3RoID4gNTApIHtcbiAgICAgIG91dHB1dCA9IGJyYWNlc1swXSArXG4gICAgICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgICAgICcgJyArXG4gICAgICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgICAgIGJyYWNlc1sxXTtcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQgPSBicmFjZXNbMF0gKyBiYXNlICsgJyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnICcgKyBicmFjZXNbMV07XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuICByZXR1cm4gZm9ybWF0KG9iaiwgKHR5cGVvZiBkZXB0aCA9PT0gJ3VuZGVmaW5lZCcgPyAyIDogZGVwdGgpKTtcbn07XG5cblxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gYXIgaW5zdGFuY2VvZiBBcnJheSB8fFxuICAgICAgICAgQXJyYXkuaXNBcnJheShhcikgfHxcbiAgICAgICAgIChhciAmJiBhciAhPT0gT2JqZWN0LnByb3RvdHlwZSAmJiBpc0FycmF5KGFyLl9fcHJvdG9fXykpO1xufVxuXG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiByZSBpbnN0YW5jZW9mIFJlZ0V4cCB8fFxuICAgICh0eXBlb2YgcmUgPT09ICdvYmplY3QnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nKTtcbn1cblxuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICBpZiAoZCBpbnN0YW5jZW9mIERhdGUpIHJldHVybiB0cnVlO1xuICBpZiAodHlwZW9mIGQgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gIHZhciBwcm9wZXJ0aWVzID0gRGF0ZS5wcm90b3R5cGUgJiYgT2JqZWN0X2dldE93blByb3BlcnR5TmFtZXMoRGF0ZS5wcm90b3R5cGUpO1xuICB2YXIgcHJvdG8gPSBkLl9fcHJvdG9fXyAmJiBPYmplY3RfZ2V0T3duUHJvcGVydHlOYW1lcyhkLl9fcHJvdG9fXyk7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShwcm90bykgPT09IEpTT04uc3RyaW5naWZ5KHByb3BlcnRpZXMpO1xufVxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbiAobXNnKSB7fTtcblxuZXhwb3J0cy5wdW1wID0gbnVsbDtcblxudmFyIE9iamVjdF9rZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSByZXMucHVzaChrZXkpO1xuICAgIHJldHVybiByZXM7XG59O1xuXG52YXIgT2JqZWN0X2dldE93blByb3BlcnR5TmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgcmVzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn07XG5cbnZhciBPYmplY3RfY3JlYXRlID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiAocHJvdG90eXBlLCBwcm9wZXJ0aWVzKSB7XG4gICAgLy8gZnJvbSBlczUtc2hpbVxuICAgIHZhciBvYmplY3Q7XG4gICAgaWYgKHByb3RvdHlwZSA9PT0gbnVsbCkge1xuICAgICAgICBvYmplY3QgPSB7ICdfX3Byb3RvX18nIDogbnVsbCB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwcm90b3R5cGUgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICAgICAgICd0eXBlb2YgcHJvdG90eXBlWycgKyAodHlwZW9mIHByb3RvdHlwZSkgKyAnXSAhPSBcXCdvYmplY3RcXCcnXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHZhciBUeXBlID0gZnVuY3Rpb24gKCkge307XG4gICAgICAgIFR5cGUucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICAgICAgICBvYmplY3QgPSBuZXcgVHlwZSgpO1xuICAgICAgICBvYmplY3QuX19wcm90b19fID0gcHJvdG90eXBlO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHByb3BlcnRpZXMgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKG9iamVjdCwgcHJvcGVydGllcyk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG59O1xuXG5leHBvcnRzLmluaGVyaXRzID0gZnVuY3Rpb24oY3Rvciwgc3VwZXJDdG9yKSB7XG4gIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yO1xuICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdF9jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogY3RvcixcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9XG4gIH0pO1xufTtcblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKHR5cGVvZiBmICE9PSAnc3RyaW5nJykge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChleHBvcnRzLmluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOiByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvcih2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pe1xuICAgIGlmICh4ID09PSBudWxsIHx8IHR5cGVvZiB4ICE9PSAnb2JqZWN0Jykge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBleHBvcnRzLmluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuIl19
;