"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn2, res) => function __init() {
  return fn2 && (res = (0, fn2[__getOwnPropNames(fn2)[0]])(fn2 = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to2, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to2, key) && key !== except)
        __defProp(to2, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to2;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/core-js-pure/internals/global-this.js
var require_global_this = __commonJS({
  "node_modules/core-js-pure/internals/global-this.js"(exports, module2) {
    "use strict";
    var check = function(it2) {
      return it2 && it2.Math === Math && it2;
    };
    module2.exports = // eslint-disable-next-line es/no-global-this -- safe
    check(typeof globalThis == "object" && globalThis) || check(typeof window == "object" && window) || // eslint-disable-next-line no-restricted-globals -- safe
    check(typeof self == "object" && self) || check(typeof global == "object" && global) || check(typeof exports == "object" && exports) || // eslint-disable-next-line no-new-func -- fallback
    /* @__PURE__ */ function() {
      return this;
    }() || Function("return this")();
  }
});

// node_modules/core-js-pure/internals/fails.js
var require_fails = __commonJS({
  "node_modules/core-js-pure/internals/fails.js"(exports, module2) {
    "use strict";
    module2.exports = function(exec) {
      try {
        return !!exec();
      } catch (error) {
        return true;
      }
    };
  }
});

// node_modules/core-js-pure/internals/function-bind-native.js
var require_function_bind_native = __commonJS({
  "node_modules/core-js-pure/internals/function-bind-native.js"(exports, module2) {
    "use strict";
    var fails = require_fails();
    module2.exports = !fails(function() {
      var test = function() {
      }.bind();
      return typeof test != "function" || test.hasOwnProperty("prototype");
    });
  }
});

// node_modules/core-js-pure/internals/function-apply.js
var require_function_apply = __commonJS({
  "node_modules/core-js-pure/internals/function-apply.js"(exports, module2) {
    "use strict";
    var NATIVE_BIND = require_function_bind_native();
    var FunctionPrototype = Function.prototype;
    var apply = FunctionPrototype.apply;
    var call = FunctionPrototype.call;
    module2.exports = typeof Reflect == "object" && Reflect.apply || (NATIVE_BIND ? call.bind(apply) : function() {
      return call.apply(apply, arguments);
    });
  }
});

// node_modules/core-js-pure/internals/function-uncurry-this.js
var require_function_uncurry_this = __commonJS({
  "node_modules/core-js-pure/internals/function-uncurry-this.js"(exports, module2) {
    "use strict";
    var NATIVE_BIND = require_function_bind_native();
    var FunctionPrototype = Function.prototype;
    var call = FunctionPrototype.call;
    var uncurryThisWithBind = NATIVE_BIND && FunctionPrototype.bind.bind(call, call);
    module2.exports = NATIVE_BIND ? uncurryThisWithBind : function(fn2) {
      return function() {
        return call.apply(fn2, arguments);
      };
    };
  }
});

// node_modules/core-js-pure/internals/classof-raw.js
var require_classof_raw = __commonJS({
  "node_modules/core-js-pure/internals/classof-raw.js"(exports, module2) {
    "use strict";
    var uncurryThis = require_function_uncurry_this();
    var toString = uncurryThis({}.toString);
    var stringSlice = uncurryThis("".slice);
    module2.exports = function(it2) {
      return stringSlice(toString(it2), 8, -1);
    };
  }
});

// node_modules/core-js-pure/internals/function-uncurry-this-clause.js
var require_function_uncurry_this_clause = __commonJS({
  "node_modules/core-js-pure/internals/function-uncurry-this-clause.js"(exports, module2) {
    "use strict";
    var classofRaw = require_classof_raw();
    var uncurryThis = require_function_uncurry_this();
    module2.exports = function(fn2) {
      if (classofRaw(fn2) === "Function") return uncurryThis(fn2);
    };
  }
});

// node_modules/core-js-pure/internals/is-callable.js
var require_is_callable = __commonJS({
  "node_modules/core-js-pure/internals/is-callable.js"(exports, module2) {
    "use strict";
    var documentAll = typeof document == "object" && document.all;
    module2.exports = typeof documentAll == "undefined" && documentAll !== void 0 ? function(argument) {
      return typeof argument == "function" || argument === documentAll;
    } : function(argument) {
      return typeof argument == "function";
    };
  }
});

// node_modules/core-js-pure/internals/descriptors.js
var require_descriptors = __commonJS({
  "node_modules/core-js-pure/internals/descriptors.js"(exports, module2) {
    "use strict";
    var fails = require_fails();
    module2.exports = !fails(function() {
      return Object.defineProperty({}, 1, { get: function() {
        return 7;
      } })[1] !== 7;
    });
  }
});

// node_modules/core-js-pure/internals/function-call.js
var require_function_call = __commonJS({
  "node_modules/core-js-pure/internals/function-call.js"(exports, module2) {
    "use strict";
    var NATIVE_BIND = require_function_bind_native();
    var call = Function.prototype.call;
    module2.exports = NATIVE_BIND ? call.bind(call) : function() {
      return call.apply(call, arguments);
    };
  }
});

// node_modules/core-js-pure/internals/object-property-is-enumerable.js
var require_object_property_is_enumerable = __commonJS({
  "node_modules/core-js-pure/internals/object-property-is-enumerable.js"(exports) {
    "use strict";
    var $propertyIsEnumerable = {}.propertyIsEnumerable;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1);
    exports.f = NASHORN_BUG ? function propertyIsEnumerable(V2) {
      var descriptor = getOwnPropertyDescriptor(this, V2);
      return !!descriptor && descriptor.enumerable;
    } : $propertyIsEnumerable;
  }
});

// node_modules/core-js-pure/internals/create-property-descriptor.js
var require_create_property_descriptor = __commonJS({
  "node_modules/core-js-pure/internals/create-property-descriptor.js"(exports, module2) {
    "use strict";
    module2.exports = function(bitmap, value) {
      return {
        enumerable: !(bitmap & 1),
        configurable: !(bitmap & 2),
        writable: !(bitmap & 4),
        value
      };
    };
  }
});

// node_modules/core-js-pure/internals/indexed-object.js
var require_indexed_object = __commonJS({
  "node_modules/core-js-pure/internals/indexed-object.js"(exports, module2) {
    "use strict";
    var uncurryThis = require_function_uncurry_this();
    var fails = require_fails();
    var classof = require_classof_raw();
    var $Object = Object;
    var split = uncurryThis("".split);
    module2.exports = fails(function() {
      return !$Object("z").propertyIsEnumerable(0);
    }) ? function(it2) {
      return classof(it2) === "String" ? split(it2, "") : $Object(it2);
    } : $Object;
  }
});

// node_modules/core-js-pure/internals/is-null-or-undefined.js
var require_is_null_or_undefined = __commonJS({
  "node_modules/core-js-pure/internals/is-null-or-undefined.js"(exports, module2) {
    "use strict";
    module2.exports = function(it2) {
      return it2 === null || it2 === void 0;
    };
  }
});

// node_modules/core-js-pure/internals/require-object-coercible.js
var require_require_object_coercible = __commonJS({
  "node_modules/core-js-pure/internals/require-object-coercible.js"(exports, module2) {
    "use strict";
    var isNullOrUndefined = require_is_null_or_undefined();
    var $TypeError = TypeError;
    module2.exports = function(it2) {
      if (isNullOrUndefined(it2)) throw new $TypeError("Can't call method on " + it2);
      return it2;
    };
  }
});

// node_modules/core-js-pure/internals/to-indexed-object.js
var require_to_indexed_object = __commonJS({
  "node_modules/core-js-pure/internals/to-indexed-object.js"(exports, module2) {
    "use strict";
    var IndexedObject = require_indexed_object();
    var requireObjectCoercible = require_require_object_coercible();
    module2.exports = function(it2) {
      return IndexedObject(requireObjectCoercible(it2));
    };
  }
});

// node_modules/core-js-pure/internals/is-object.js
var require_is_object = __commonJS({
  "node_modules/core-js-pure/internals/is-object.js"(exports, module2) {
    "use strict";
    var isCallable = require_is_callable();
    module2.exports = function(it2) {
      return typeof it2 == "object" ? it2 !== null : isCallable(it2);
    };
  }
});

// node_modules/core-js-pure/internals/path.js
var require_path = __commonJS({
  "node_modules/core-js-pure/internals/path.js"(exports, module2) {
    "use strict";
    module2.exports = {};
  }
});

// node_modules/core-js-pure/internals/get-built-in.js
var require_get_built_in = __commonJS({
  "node_modules/core-js-pure/internals/get-built-in.js"(exports, module2) {
    "use strict";
    var path = require_path();
    var globalThis2 = require_global_this();
    var isCallable = require_is_callable();
    var aFunction = function(variable) {
      return isCallable(variable) ? variable : void 0;
    };
    module2.exports = function(namespace, method) {
      return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(globalThis2[namespace]) : path[namespace] && path[namespace][method] || globalThis2[namespace] && globalThis2[namespace][method];
    };
  }
});

// node_modules/core-js-pure/internals/object-is-prototype-of.js
var require_object_is_prototype_of = __commonJS({
  "node_modules/core-js-pure/internals/object-is-prototype-of.js"(exports, module2) {
    "use strict";
    var uncurryThis = require_function_uncurry_this();
    module2.exports = uncurryThis({}.isPrototypeOf);
  }
});

// node_modules/core-js-pure/internals/environment-user-agent.js
var require_environment_user_agent = __commonJS({
  "node_modules/core-js-pure/internals/environment-user-agent.js"(exports, module2) {
    "use strict";
    var globalThis2 = require_global_this();
    var navigator2 = globalThis2.navigator;
    var userAgent = navigator2 && navigator2.userAgent;
    module2.exports = userAgent ? String(userAgent) : "";
  }
});

// node_modules/core-js-pure/internals/environment-v8-version.js
var require_environment_v8_version = __commonJS({
  "node_modules/core-js-pure/internals/environment-v8-version.js"(exports, module2) {
    "use strict";
    var globalThis2 = require_global_this();
    var userAgent = require_environment_user_agent();
    var process2 = globalThis2.process;
    var Deno = globalThis2.Deno;
    var versions = process2 && process2.versions || Deno && Deno.version;
    var v8 = versions && versions.v8;
    var match;
    var version2;
    if (v8) {
      match = v8.split(".");
      version2 = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
    }
    if (!version2 && userAgent) {
      match = userAgent.match(/Edge\/(\d+)/);
      if (!match || match[1] >= 74) {
        match = userAgent.match(/Chrome\/(\d+)/);
        if (match) version2 = +match[1];
      }
    }
    module2.exports = version2;
  }
});

// node_modules/core-js-pure/internals/symbol-constructor-detection.js
var require_symbol_constructor_detection = __commonJS({
  "node_modules/core-js-pure/internals/symbol-constructor-detection.js"(exports, module2) {
    "use strict";
    var V8_VERSION = require_environment_v8_version();
    var fails = require_fails();
    var globalThis2 = require_global_this();
    var $String = globalThis2.String;
    module2.exports = !!Object.getOwnPropertySymbols && !fails(function() {
      var symbol = Symbol("symbol detection");
      return !$String(symbol) || !(Object(symbol) instanceof Symbol) || // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
      !Symbol.sham && V8_VERSION && V8_VERSION < 41;
    });
  }
});

// node_modules/core-js-pure/internals/use-symbol-as-uid.js
var require_use_symbol_as_uid = __commonJS({
  "node_modules/core-js-pure/internals/use-symbol-as-uid.js"(exports, module2) {
    "use strict";
    var NATIVE_SYMBOL = require_symbol_constructor_detection();
    module2.exports = NATIVE_SYMBOL && !Symbol.sham && typeof Symbol.iterator == "symbol";
  }
});

// node_modules/core-js-pure/internals/is-symbol.js
var require_is_symbol = __commonJS({
  "node_modules/core-js-pure/internals/is-symbol.js"(exports, module2) {
    "use strict";
    var getBuiltIn = require_get_built_in();
    var isCallable = require_is_callable();
    var isPrototypeOf = require_object_is_prototype_of();
    var USE_SYMBOL_AS_UID = require_use_symbol_as_uid();
    var $Object = Object;
    module2.exports = USE_SYMBOL_AS_UID ? function(it2) {
      return typeof it2 == "symbol";
    } : function(it2) {
      var $Symbol = getBuiltIn("Symbol");
      return isCallable($Symbol) && isPrototypeOf($Symbol.prototype, $Object(it2));
    };
  }
});

// node_modules/core-js-pure/internals/try-to-string.js
var require_try_to_string = __commonJS({
  "node_modules/core-js-pure/internals/try-to-string.js"(exports, module2) {
    "use strict";
    var $String = String;
    module2.exports = function(argument) {
      try {
        return $String(argument);
      } catch (error) {
        return "Object";
      }
    };
  }
});

// node_modules/core-js-pure/internals/a-callable.js
var require_a_callable = __commonJS({
  "node_modules/core-js-pure/internals/a-callable.js"(exports, module2) {
    "use strict";
    var isCallable = require_is_callable();
    var tryToString = require_try_to_string();
    var $TypeError = TypeError;
    module2.exports = function(argument) {
      if (isCallable(argument)) return argument;
      throw new $TypeError(tryToString(argument) + " is not a function");
    };
  }
});

// node_modules/core-js-pure/internals/get-method.js
var require_get_method = __commonJS({
  "node_modules/core-js-pure/internals/get-method.js"(exports, module2) {
    "use strict";
    var aCallable = require_a_callable();
    var isNullOrUndefined = require_is_null_or_undefined();
    module2.exports = function(V2, P2) {
      var func = V2[P2];
      return isNullOrUndefined(func) ? void 0 : aCallable(func);
    };
  }
});

// node_modules/core-js-pure/internals/ordinary-to-primitive.js
var require_ordinary_to_primitive = __commonJS({
  "node_modules/core-js-pure/internals/ordinary-to-primitive.js"(exports, module2) {
    "use strict";
    var call = require_function_call();
    var isCallable = require_is_callable();
    var isObject = require_is_object();
    var $TypeError = TypeError;
    module2.exports = function(input, pref) {
      var fn2, val;
      if (pref === "string" && isCallable(fn2 = input.toString) && !isObject(val = call(fn2, input))) return val;
      if (isCallable(fn2 = input.valueOf) && !isObject(val = call(fn2, input))) return val;
      if (pref !== "string" && isCallable(fn2 = input.toString) && !isObject(val = call(fn2, input))) return val;
      throw new $TypeError("Can't convert object to primitive value");
    };
  }
});

// node_modules/core-js-pure/internals/is-pure.js
var require_is_pure = __commonJS({
  "node_modules/core-js-pure/internals/is-pure.js"(exports, module2) {
    "use strict";
    module2.exports = true;
  }
});

// node_modules/core-js-pure/internals/define-global-property.js
var require_define_global_property = __commonJS({
  "node_modules/core-js-pure/internals/define-global-property.js"(exports, module2) {
    "use strict";
    var globalThis2 = require_global_this();
    var defineProperty = Object.defineProperty;
    module2.exports = function(key, value) {
      try {
        defineProperty(globalThis2, key, { value, configurable: true, writable: true });
      } catch (error) {
        globalThis2[key] = value;
      }
      return value;
    };
  }
});

// node_modules/core-js-pure/internals/shared-store.js
var require_shared_store = __commonJS({
  "node_modules/core-js-pure/internals/shared-store.js"(exports, module2) {
    "use strict";
    var IS_PURE = require_is_pure();
    var globalThis2 = require_global_this();
    var defineGlobalProperty = require_define_global_property();
    var SHARED = "__core-js_shared__";
    var store = module2.exports = globalThis2[SHARED] || defineGlobalProperty(SHARED, {});
    (store.versions || (store.versions = [])).push({
      version: "3.49.0",
      mode: IS_PURE ? "pure" : "global",
      copyright: "© 2013–2025 Denis Pushkarev (zloirock.ru), 2025–2026 CoreJS Company (core-js.io). All rights reserved.",
      license: "https://github.com/zloirock/core-js/blob/v3.49.0/LICENSE",
      source: "https://github.com/zloirock/core-js"
    });
  }
});

// node_modules/core-js-pure/internals/shared.js
var require_shared = __commonJS({
  "node_modules/core-js-pure/internals/shared.js"(exports, module2) {
    "use strict";
    var store = require_shared_store();
    module2.exports = function(key, value) {
      return store[key] || (store[key] = value || {});
    };
  }
});

// node_modules/core-js-pure/internals/to-object.js
var require_to_object = __commonJS({
  "node_modules/core-js-pure/internals/to-object.js"(exports, module2) {
    "use strict";
    var requireObjectCoercible = require_require_object_coercible();
    var $Object = Object;
    module2.exports = function(argument) {
      return $Object(requireObjectCoercible(argument));
    };
  }
});

// node_modules/core-js-pure/internals/has-own-property.js
var require_has_own_property = __commonJS({
  "node_modules/core-js-pure/internals/has-own-property.js"(exports, module2) {
    "use strict";
    var uncurryThis = require_function_uncurry_this();
    var toObject = require_to_object();
    var hasOwnProperty = uncurryThis({}.hasOwnProperty);
    module2.exports = Object.hasOwn || function hasOwn(it2, key) {
      return hasOwnProperty(toObject(it2), key);
    };
  }
});

// node_modules/core-js-pure/internals/uid.js
var require_uid = __commonJS({
  "node_modules/core-js-pure/internals/uid.js"(exports, module2) {
    "use strict";
    var uncurryThis = require_function_uncurry_this();
    var id = 0;
    var postfix = Math.random();
    var toString = uncurryThis(1.1.toString);
    module2.exports = function(key) {
      return "Symbol(" + (key === void 0 ? "" : key) + ")_" + toString(++id + postfix, 36);
    };
  }
});

// node_modules/core-js-pure/internals/well-known-symbol.js
var require_well_known_symbol = __commonJS({
  "node_modules/core-js-pure/internals/well-known-symbol.js"(exports, module2) {
    "use strict";
    var globalThis2 = require_global_this();
    var shared = require_shared();
    var hasOwn = require_has_own_property();
    var uid = require_uid();
    var NATIVE_SYMBOL = require_symbol_constructor_detection();
    var USE_SYMBOL_AS_UID = require_use_symbol_as_uid();
    var Symbol2 = globalThis2.Symbol;
    var WellKnownSymbolsStore = shared("wks");
    var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol2["for"] || Symbol2 : Symbol2 && Symbol2.withoutSetter || uid;
    module2.exports = function(name) {
      if (!hasOwn(WellKnownSymbolsStore, name)) {
        WellKnownSymbolsStore[name] = NATIVE_SYMBOL && hasOwn(Symbol2, name) ? Symbol2[name] : createWellKnownSymbol("Symbol." + name);
      }
      return WellKnownSymbolsStore[name];
    };
  }
});

// node_modules/core-js-pure/internals/to-primitive.js
var require_to_primitive = __commonJS({
  "node_modules/core-js-pure/internals/to-primitive.js"(exports, module2) {
    "use strict";
    var call = require_function_call();
    var isObject = require_is_object();
    var isSymbol = require_is_symbol();
    var getMethod = require_get_method();
    var ordinaryToPrimitive = require_ordinary_to_primitive();
    var wellKnownSymbol = require_well_known_symbol();
    var $TypeError = TypeError;
    var TO_PRIMITIVE = wellKnownSymbol("toPrimitive");
    module2.exports = function(input, pref) {
      if (!isObject(input) || isSymbol(input)) return input;
      var exoticToPrim = getMethod(input, TO_PRIMITIVE);
      var result;
      if (exoticToPrim) {
        if (pref === void 0) pref = "default";
        result = call(exoticToPrim, input, pref);
        if (!isObject(result) || isSymbol(result)) return result;
        throw new $TypeError("Can't convert object to primitive value");
      }
      if (pref === void 0) pref = "number";
      return ordinaryToPrimitive(input, pref);
    };
  }
});

// node_modules/core-js-pure/internals/to-property-key.js
var require_to_property_key = __commonJS({
  "node_modules/core-js-pure/internals/to-property-key.js"(exports, module2) {
    "use strict";
    var toPrimitive2 = require_to_primitive();
    var isSymbol = require_is_symbol();
    module2.exports = function(argument) {
      var key = toPrimitive2(argument, "string");
      return isSymbol(key) ? key : key + "";
    };
  }
});

// node_modules/core-js-pure/internals/document-create-element.js
var require_document_create_element = __commonJS({
  "node_modules/core-js-pure/internals/document-create-element.js"(exports, module2) {
    "use strict";
    var globalThis2 = require_global_this();
    var isObject = require_is_object();
    var document2 = globalThis2.document;
    var EXISTS = isObject(document2) && isObject(document2.createElement);
    module2.exports = function(it2) {
      return EXISTS ? document2.createElement(it2) : {};
    };
  }
});

// node_modules/core-js-pure/internals/ie8-dom-define.js
var require_ie8_dom_define = __commonJS({
  "node_modules/core-js-pure/internals/ie8-dom-define.js"(exports, module2) {
    "use strict";
    var DESCRIPTORS = require_descriptors();
    var fails = require_fails();
    var createElement = require_document_create_element();
    module2.exports = !DESCRIPTORS && !fails(function() {
      return Object.defineProperty(createElement("div"), "a", {
        get: function() {
          return 7;
        }
      }).a !== 7;
    });
  }
});

// node_modules/core-js-pure/internals/object-get-own-property-descriptor.js
var require_object_get_own_property_descriptor = __commonJS({
  "node_modules/core-js-pure/internals/object-get-own-property-descriptor.js"(exports) {
    "use strict";
    var DESCRIPTORS = require_descriptors();
    var call = require_function_call();
    var propertyIsEnumerableModule = require_object_property_is_enumerable();
    var createPropertyDescriptor = require_create_property_descriptor();
    var toIndexedObject = require_to_indexed_object();
    var toPropertyKey2 = require_to_property_key();
    var hasOwn = require_has_own_property();
    var IE8_DOM_DEFINE = require_ie8_dom_define();
    var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    exports.f = DESCRIPTORS ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O2, P2) {
      O2 = toIndexedObject(O2);
      P2 = toPropertyKey2(P2);
      if (IE8_DOM_DEFINE) try {
        return $getOwnPropertyDescriptor(O2, P2);
      } catch (error) {
      }
      if (hasOwn(O2, P2)) return createPropertyDescriptor(!call(propertyIsEnumerableModule.f, O2, P2), O2[P2]);
    };
  }
});

// node_modules/core-js-pure/internals/is-forced.js
var require_is_forced = __commonJS({
  "node_modules/core-js-pure/internals/is-forced.js"(exports, module2) {
    "use strict";
    var fails = require_fails();
    var isCallable = require_is_callable();
    var replacement = /#|\.prototype\./;
    var isForced = function(feature, detection) {
      var value = data[normalize(feature)];
      return value === POLYFILL ? true : value === NATIVE ? false : isCallable(detection) ? fails(detection) : !!detection;
    };
    var normalize = isForced.normalize = function(string) {
      return String(string).replace(replacement, ".").toLowerCase();
    };
    var data = isForced.data = {};
    var NATIVE = isForced.NATIVE = "N";
    var POLYFILL = isForced.POLYFILL = "P";
    module2.exports = isForced;
  }
});

// node_modules/core-js-pure/internals/function-bind-context.js
var require_function_bind_context = __commonJS({
  "node_modules/core-js-pure/internals/function-bind-context.js"(exports, module2) {
    "use strict";
    var uncurryThis = require_function_uncurry_this_clause();
    var aCallable = require_a_callable();
    var NATIVE_BIND = require_function_bind_native();
    var bind = uncurryThis(uncurryThis.bind);
    module2.exports = function(fn2, that) {
      aCallable(fn2);
      return that === void 0 ? fn2 : NATIVE_BIND ? bind(fn2, that) : function() {
        return fn2.apply(that, arguments);
      };
    };
  }
});

// node_modules/core-js-pure/internals/v8-prototype-define-bug.js
var require_v8_prototype_define_bug = __commonJS({
  "node_modules/core-js-pure/internals/v8-prototype-define-bug.js"(exports, module2) {
    "use strict";
    var DESCRIPTORS = require_descriptors();
    var fails = require_fails();
    module2.exports = DESCRIPTORS && fails(function() {
      return Object.defineProperty(function() {
      }, "prototype", {
        value: 42,
        writable: false
      }).prototype !== 42;
    });
  }
});

// node_modules/core-js-pure/internals/an-object.js
var require_an_object = __commonJS({
  "node_modules/core-js-pure/internals/an-object.js"(exports, module2) {
    "use strict";
    var isObject = require_is_object();
    var $String = String;
    var $TypeError = TypeError;
    module2.exports = function(argument) {
      if (isObject(argument)) return argument;
      throw new $TypeError($String(argument) + " is not an object");
    };
  }
});

// node_modules/core-js-pure/internals/object-define-property.js
var require_object_define_property = __commonJS({
  "node_modules/core-js-pure/internals/object-define-property.js"(exports) {
    "use strict";
    var DESCRIPTORS = require_descriptors();
    var IE8_DOM_DEFINE = require_ie8_dom_define();
    var V8_PROTOTYPE_DEFINE_BUG = require_v8_prototype_define_bug();
    var anObject = require_an_object();
    var toPropertyKey2 = require_to_property_key();
    var $TypeError = TypeError;
    var $defineProperty = Object.defineProperty;
    var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var ENUMERABLE = "enumerable";
    var CONFIGURABLE = "configurable";
    var WRITABLE = "writable";
    exports.f = DESCRIPTORS ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O2, P2, Attributes) {
      anObject(O2);
      P2 = toPropertyKey2(P2);
      anObject(Attributes);
      if (typeof O2 === "function" && P2 === "prototype" && "value" in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
        var current = $getOwnPropertyDescriptor(O2, P2);
        if (current && current[WRITABLE]) {
          O2[P2] = Attributes.value;
          Attributes = {
            configurable: CONFIGURABLE in Attributes ? Attributes[CONFIGURABLE] : current[CONFIGURABLE],
            enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
            writable: false
          };
        }
      }
      return $defineProperty(O2, P2, Attributes);
    } : $defineProperty : function defineProperty(O2, P2, Attributes) {
      anObject(O2);
      P2 = toPropertyKey2(P2);
      anObject(Attributes);
      if (IE8_DOM_DEFINE) try {
        return $defineProperty(O2, P2, Attributes);
      } catch (error) {
      }
      if ("get" in Attributes || "set" in Attributes) throw new $TypeError("Accessors not supported");
      if ("value" in Attributes) O2[P2] = Attributes.value;
      return O2;
    };
  }
});

// node_modules/core-js-pure/internals/create-non-enumerable-property.js
var require_create_non_enumerable_property = __commonJS({
  "node_modules/core-js-pure/internals/create-non-enumerable-property.js"(exports, module2) {
    "use strict";
    var DESCRIPTORS = require_descriptors();
    var definePropertyModule = require_object_define_property();
    var createPropertyDescriptor = require_create_property_descriptor();
    module2.exports = DESCRIPTORS ? function(object, key, value) {
      return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
    } : function(object, key, value) {
      object[key] = value;
      return object;
    };
  }
});

// node_modules/core-js-pure/internals/export.js
var require_export = __commonJS({
  "node_modules/core-js-pure/internals/export.js"(exports, module2) {
    "use strict";
    var globalThis2 = require_global_this();
    var apply = require_function_apply();
    var uncurryThis = require_function_uncurry_this_clause();
    var isCallable = require_is_callable();
    var getOwnPropertyDescriptor = require_object_get_own_property_descriptor().f;
    var isForced = require_is_forced();
    var path = require_path();
    var bind = require_function_bind_context();
    var createNonEnumerableProperty = require_create_non_enumerable_property();
    var hasOwn = require_has_own_property();
    require_shared_store();
    var wrapConstructor = function(NativeConstructor) {
      var Wrapper = function(a3, b2, c3) {
        if (this instanceof Wrapper) {
          switch (arguments.length) {
            case 0:
              return new NativeConstructor();
            case 1:
              return new NativeConstructor(a3);
            case 2:
              return new NativeConstructor(a3, b2);
          }
          return new NativeConstructor(a3, b2, c3);
        }
        return apply(NativeConstructor, this, arguments);
      };
      Wrapper.prototype = NativeConstructor.prototype;
      return Wrapper;
    };
    module2.exports = function(options, source) {
      var TARGET = options.target;
      var GLOBAL = options.global;
      var STATIC = options.stat;
      var PROTO = options.proto;
      var nativeSource = GLOBAL ? globalThis2 : STATIC ? globalThis2[TARGET] : globalThis2[TARGET] && globalThis2[TARGET].prototype;
      var target = GLOBAL ? path : path[TARGET] || createNonEnumerableProperty(path, TARGET, {})[TARGET];
      var targetPrototype = target.prototype;
      var FORCED, USE_NATIVE, VIRTUAL_PROTOTYPE;
      var key, sourceProperty, targetProperty, nativeProperty, resultProperty, descriptor;
      for (key in source) {
        FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? "." : "#") + key, options.forced);
        USE_NATIVE = !FORCED && nativeSource && hasOwn(nativeSource, key);
        targetProperty = target[key];
        if (USE_NATIVE) if (options.dontCallGetSet) {
          descriptor = getOwnPropertyDescriptor(nativeSource, key);
          nativeProperty = descriptor && descriptor.value;
        } else nativeProperty = nativeSource[key];
        sourceProperty = USE_NATIVE && nativeProperty ? nativeProperty : source[key];
        if (!FORCED && !PROTO && typeof targetProperty == typeof sourceProperty) continue;
        if (options.bind && USE_NATIVE) resultProperty = bind(sourceProperty, globalThis2);
        else if (options.wrap && USE_NATIVE) resultProperty = wrapConstructor(sourceProperty);
        else if (PROTO && isCallable(sourceProperty)) resultProperty = uncurryThis(sourceProperty);
        else resultProperty = sourceProperty;
        if (options.sham || sourceProperty && sourceProperty.sham || targetProperty && targetProperty.sham) {
          createNonEnumerableProperty(resultProperty, "sham", true);
        }
        createNonEnumerableProperty(target, key, resultProperty);
        if (PROTO) {
          VIRTUAL_PROTOTYPE = TARGET + "Prototype";
          if (!hasOwn(path, VIRTUAL_PROTOTYPE)) {
            createNonEnumerableProperty(path, VIRTUAL_PROTOTYPE, {});
          }
          createNonEnumerableProperty(path[VIRTUAL_PROTOTYPE], key, sourceProperty);
          if (options.real && targetPrototype && (FORCED || !targetPrototype[key])) {
            createNonEnumerableProperty(targetPrototype, key, sourceProperty);
          }
        }
      }
    };
  }
});

// node_modules/core-js-pure/modules/es.object.define-property.js
var require_es_object_define_property = __commonJS({
  "node_modules/core-js-pure/modules/es.object.define-property.js"() {
    "use strict";
    var $2 = require_export();
    var DESCRIPTORS = require_descriptors();
    var defineProperty = require_object_define_property().f;
    $2({ target: "Object", stat: true, forced: Object.defineProperty !== defineProperty, sham: !DESCRIPTORS }, {
      defineProperty
    });
  }
});

// node_modules/core-js-pure/es/object/define-property.js
var require_define_property = __commonJS({
  "node_modules/core-js-pure/es/object/define-property.js"(exports, module2) {
    "use strict";
    require_es_object_define_property();
    var path = require_path();
    var Object2 = path.Object;
    var $defineProperty = module2.exports = function defineProperty(it2, key, desc) {
      return Object2.defineProperty(it2, key, desc);
    };
    if (Object2.defineProperty.sham) $defineProperty.sham = true;
  }
});

// node_modules/core-js-pure/stable/object/define-property.js
var require_define_property2 = __commonJS({
  "node_modules/core-js-pure/stable/object/define-property.js"(exports, module2) {
    "use strict";
    var parent = require_define_property();
    module2.exports = parent;
  }
});

// node_modules/core-js-pure/actual/object/define-property.js
var require_define_property3 = __commonJS({
  "node_modules/core-js-pure/actual/object/define-property.js"(exports, module2) {
    "use strict";
    var parent = require_define_property2();
    module2.exports = parent;
  }
});

// node_modules/core-js-pure/full/object/define-property.js
var require_define_property4 = __commonJS({
  "node_modules/core-js-pure/full/object/define-property.js"(exports, module2) {
    "use strict";
    var parent = require_define_property3();
    module2.exports = parent;
  }
});

// node_modules/core-js-pure/features/object/define-property.js
var require_define_property5 = __commonJS({
  "node_modules/core-js-pure/features/object/define-property.js"(exports, module2) {
    "use strict";
    module2.exports = require_define_property4();
  }
});

// node_modules/core-js-pure/internals/is-array.js
var require_is_array = __commonJS({
  "node_modules/core-js-pure/internals/is-array.js"(exports, module2) {
    "use strict";
    var classof = require_classof_raw();
    module2.exports = Array.isArray || function isArray(argument) {
      return classof(argument) === "Array";
    };
  }
});

// node_modules/core-js-pure/internals/math-trunc.js
var require_math_trunc = __commonJS({
  "node_modules/core-js-pure/internals/math-trunc.js"(exports, module2) {
    "use strict";
    var ceil = Math.ceil;
    var floor = Math.floor;
    module2.exports = Math.trunc || function trunc(x2) {
      var n3 = +x2;
      return (n3 > 0 ? floor : ceil)(n3);
    };
  }
});

// node_modules/core-js-pure/internals/to-integer-or-infinity.js
var require_to_integer_or_infinity = __commonJS({
  "node_modules/core-js-pure/internals/to-integer-or-infinity.js"(exports, module2) {
    "use strict";
    var trunc = require_math_trunc();
    module2.exports = function(argument) {
      var number = +argument;
      return number !== number || number === 0 ? 0 : trunc(number);
    };
  }
});

// node_modules/core-js-pure/internals/to-length.js
var require_to_length = __commonJS({
  "node_modules/core-js-pure/internals/to-length.js"(exports, module2) {
    "use strict";
    var toIntegerOrInfinity = require_to_integer_or_infinity();
    var min = Math.min;
    module2.exports = function(argument) {
      var len = toIntegerOrInfinity(argument);
      return len > 0 ? min(len, 9007199254740991) : 0;
    };
  }
});

// node_modules/core-js-pure/internals/length-of-array-like.js
var require_length_of_array_like = __commonJS({
  "node_modules/core-js-pure/internals/length-of-array-like.js"(exports, module2) {
    "use strict";
    var toLength = require_to_length();
    module2.exports = function(obj) {
      return toLength(obj.length);
    };
  }
});

// node_modules/core-js-pure/internals/does-not-exceed-safe-integer.js
var require_does_not_exceed_safe_integer = __commonJS({
  "node_modules/core-js-pure/internals/does-not-exceed-safe-integer.js"(exports, module2) {
    "use strict";
    var $TypeError = TypeError;
    var MAX_SAFE_INTEGER = 9007199254740991;
    module2.exports = function(it2) {
      if (it2 > MAX_SAFE_INTEGER) throw new $TypeError("Maximum allowed index exceeded");
      return it2;
    };
  }
});

// node_modules/core-js-pure/internals/create-property.js
var require_create_property = __commonJS({
  "node_modules/core-js-pure/internals/create-property.js"(exports, module2) {
    "use strict";
    var DESCRIPTORS = require_descriptors();
    var definePropertyModule = require_object_define_property();
    var createPropertyDescriptor = require_create_property_descriptor();
    module2.exports = function(object, key, value) {
      if (DESCRIPTORS) definePropertyModule.f(object, key, createPropertyDescriptor(0, value));
      else object[key] = value;
    };
  }
});

// node_modules/core-js-pure/internals/array-set-length.js
var require_array_set_length = __commonJS({
  "node_modules/core-js-pure/internals/array-set-length.js"(exports, module2) {
    "use strict";
    var DESCRIPTORS = require_descriptors();
    var isArray = require_is_array();
    var $TypeError = TypeError;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var SILENT_ON_NON_WRITABLE_LENGTH_SET = DESCRIPTORS && !function() {
      if (this !== void 0) return true;
      try {
        Object.defineProperty([], "length", { writable: false }).length = 1;
      } catch (error) {
        return error instanceof TypeError;
      }
    }();
    module2.exports = SILENT_ON_NON_WRITABLE_LENGTH_SET ? function(O2, length) {
      if (isArray(O2) && !getOwnPropertyDescriptor(O2, "length").writable) {
        throw new $TypeError("Cannot set read only .length");
      }
      return O2.length = length;
    } : function(O2, length) {
      return O2.length = length;
    };
  }
});

// node_modules/core-js-pure/internals/to-string-tag-support.js
var require_to_string_tag_support = __commonJS({
  "node_modules/core-js-pure/internals/to-string-tag-support.js"(exports, module2) {
    "use strict";
    var wellKnownSymbol = require_well_known_symbol();
    var TO_STRING_TAG = wellKnownSymbol("toStringTag");
    var test = {};
    test[TO_STRING_TAG] = "z";
    module2.exports = String(test) === "[object z]";
  }
});

// node_modules/core-js-pure/internals/classof.js
var require_classof = __commonJS({
  "node_modules/core-js-pure/internals/classof.js"(exports, module2) {
    "use strict";
    var TO_STRING_TAG_SUPPORT = require_to_string_tag_support();
    var isCallable = require_is_callable();
    var classofRaw = require_classof_raw();
    var wellKnownSymbol = require_well_known_symbol();
    var TO_STRING_TAG = wellKnownSymbol("toStringTag");
    var $Object = Object;
    var CORRECT_ARGUMENTS = classofRaw(/* @__PURE__ */ function() {
      return arguments;
    }()) === "Arguments";
    var tryGet = function(it2, key) {
      try {
        return it2[key];
      } catch (error) {
      }
    };
    module2.exports = TO_STRING_TAG_SUPPORT ? classofRaw : function(it2) {
      var O2, tag, result;
      return it2 === void 0 ? "Undefined" : it2 === null ? "Null" : typeof (tag = tryGet(O2 = $Object(it2), TO_STRING_TAG)) == "string" ? tag : CORRECT_ARGUMENTS ? classofRaw(O2) : (result = classofRaw(O2)) === "Object" && isCallable(O2.callee) ? "Arguments" : result;
    };
  }
});

// node_modules/core-js-pure/internals/inspect-source.js
var require_inspect_source = __commonJS({
  "node_modules/core-js-pure/internals/inspect-source.js"(exports, module2) {
    "use strict";
    var uncurryThis = require_function_uncurry_this();
    var isCallable = require_is_callable();
    var store = require_shared_store();
    var functionToString = uncurryThis(Function.toString);
    if (!isCallable(store.inspectSource)) {
      store.inspectSource = function(it2) {
        return functionToString(it2);
      };
    }
    module2.exports = store.inspectSource;
  }
});

// node_modules/core-js-pure/internals/is-constructor.js
var require_is_constructor = __commonJS({
  "node_modules/core-js-pure/internals/is-constructor.js"(exports, module2) {
    "use strict";
    var uncurryThis = require_function_uncurry_this();
    var fails = require_fails();
    var isCallable = require_is_callable();
    var classof = require_classof();
    var getBuiltIn = require_get_built_in();
    var inspectSource = require_inspect_source();
    var noop = function() {
    };
    var construct = getBuiltIn("Reflect", "construct");
    var constructorRegExp = /^\s*(?:class|function)\b/;
    var exec = uncurryThis(constructorRegExp.exec);
    var INCORRECT_TO_STRING = !constructorRegExp.test(noop);
    var isConstructorModern = function isConstructor(argument) {
      if (!isCallable(argument)) return false;
      try {
        construct(noop, [], argument);
        return true;
      } catch (error) {
        return false;
      }
    };
    var isConstructorLegacy = function isConstructor(argument) {
      if (!isCallable(argument)) return false;
      switch (classof(argument)) {
        case "AsyncFunction":
        case "GeneratorFunction":
        case "AsyncGeneratorFunction":
          return false;
      }
      try {
        return INCORRECT_TO_STRING || !!exec(constructorRegExp, inspectSource(argument));
      } catch (error) {
        return true;
      }
    };
    isConstructorLegacy.sham = true;
    module2.exports = !construct || fails(function() {
      var called;
      return isConstructorModern(isConstructorModern.call) || !isConstructorModern(Object) || !isConstructorModern(function() {
        called = true;
      }) || called;
    }) ? isConstructorLegacy : isConstructorModern;
  }
});

// node_modules/core-js-pure/internals/array-species-constructor.js
var require_array_species_constructor = __commonJS({
  "node_modules/core-js-pure/internals/array-species-constructor.js"(exports, module2) {
    "use strict";
    var isArray = require_is_array();
    var isConstructor = require_is_constructor();
    var isObject = require_is_object();
    var wellKnownSymbol = require_well_known_symbol();
    var SPECIES = wellKnownSymbol("species");
    var $Array = Array;
    module2.exports = function(originalArray) {
      var C2;
      if (isArray(originalArray)) {
        C2 = originalArray.constructor;
        if (isConstructor(C2) && (C2 === $Array || isArray(C2.prototype))) C2 = void 0;
        else if (isObject(C2)) {
          C2 = C2[SPECIES];
          if (C2 === null) C2 = void 0;
        }
      }
      return C2 === void 0 ? $Array : C2;
    };
  }
});

// node_modules/core-js-pure/internals/array-species-create.js
var require_array_species_create = __commonJS({
  "node_modules/core-js-pure/internals/array-species-create.js"(exports, module2) {
    "use strict";
    var arraySpeciesConstructor = require_array_species_constructor();
    module2.exports = function(originalArray, length) {
      return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
    };
  }
});

// node_modules/core-js-pure/internals/array-method-has-species-support.js
var require_array_method_has_species_support = __commonJS({
  "node_modules/core-js-pure/internals/array-method-has-species-support.js"(exports, module2) {
    "use strict";
    var fails = require_fails();
    var wellKnownSymbol = require_well_known_symbol();
    var V8_VERSION = require_environment_v8_version();
    var SPECIES = wellKnownSymbol("species");
    module2.exports = function(METHOD_NAME) {
      return V8_VERSION >= 51 || !fails(function() {
        var array = [];
        var constructor = array.constructor = {};
        constructor[SPECIES] = function() {
          return { foo: 1 };
        };
        return array[METHOD_NAME](Boolean).foo !== 1;
      });
    };
  }
});

// node_modules/core-js-pure/modules/es.array.concat.js
var require_es_array_concat = __commonJS({
  "node_modules/core-js-pure/modules/es.array.concat.js"() {
    "use strict";
    var $2 = require_export();
    var fails = require_fails();
    var isArray = require_is_array();
    var isObject = require_is_object();
    var toObject = require_to_object();
    var lengthOfArrayLike = require_length_of_array_like();
    var doesNotExceedSafeInteger = require_does_not_exceed_safe_integer();
    var createProperty = require_create_property();
    var setArrayLength = require_array_set_length();
    var arraySpeciesCreate = require_array_species_create();
    var arrayMethodHasSpeciesSupport = require_array_method_has_species_support();
    var wellKnownSymbol = require_well_known_symbol();
    var V8_VERSION = require_environment_v8_version();
    var IS_CONCAT_SPREADABLE = wellKnownSymbol("isConcatSpreadable");
    var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION >= 51 || !fails(function() {
      var array = [];
      array[IS_CONCAT_SPREADABLE] = false;
      return array.concat()[0] !== array;
    });
    var isConcatSpreadable = function(O2) {
      if (!isObject(O2)) return false;
      var spreadable = O2[IS_CONCAT_SPREADABLE];
      return spreadable !== void 0 ? !!spreadable : isArray(O2);
    };
    var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !arrayMethodHasSpeciesSupport("concat");
    $2({ target: "Array", proto: true, arity: 1, forced: FORCED }, {
      // eslint-disable-next-line no-unused-vars -- required for `.length`
      concat: function concat(arg) {
        var O2 = toObject(this);
        var A2 = arraySpeciesCreate(O2, 0);
        var n3 = 0;
        var i3, k2, length, len, E2;
        for (i3 = -1, length = arguments.length; i3 < length; i3++) {
          E2 = i3 === -1 ? O2 : arguments[i3];
          if (isConcatSpreadable(E2)) {
            len = lengthOfArrayLike(E2);
            doesNotExceedSafeInteger(n3 + len);
            for (k2 = 0; k2 < len; k2++, n3++) if (k2 in E2) createProperty(A2, n3, E2[k2]);
          } else {
            doesNotExceedSafeInteger(n3 + 1);
            createProperty(A2, n3++, E2);
          }
        }
        setArrayLength(A2, n3);
        return A2;
      }
    });
  }
});

// node_modules/core-js-pure/modules/es.object.to-string.js
var require_es_object_to_string = __commonJS({
  "node_modules/core-js-pure/modules/es.object.to-string.js"() {
  }
});

// node_modules/core-js-pure/internals/to-string.js
var require_to_string = __commonJS({
  "node_modules/core-js-pure/internals/to-string.js"(exports, module2) {
    "use strict";
    var classof = require_classof();
    var $String = String;
    module2.exports = function(argument) {
      if (classof(argument) === "Symbol") throw new TypeError("Cannot convert a Symbol value to a string");
      return $String(argument);
    };
  }
});

// node_modules/core-js-pure/internals/to-absolute-index.js
var require_to_absolute_index = __commonJS({
  "node_modules/core-js-pure/internals/to-absolute-index.js"(exports, module2) {
    "use strict";
    var toIntegerOrInfinity = require_to_integer_or_infinity();
    var max = Math.max;
    var min = Math.min;
    module2.exports = function(index, length) {
      var integer = toIntegerOrInfinity(index);
      return integer < 0 ? max(integer + length, 0) : min(integer, length);
    };
  }
});

// node_modules/core-js-pure/internals/array-includes.js
var require_array_includes = __commonJS({
  "node_modules/core-js-pure/internals/array-includes.js"(exports, module2) {
    "use strict";
    var toIndexedObject = require_to_indexed_object();
    var toAbsoluteIndex = require_to_absolute_index();
    var lengthOfArrayLike = require_length_of_array_like();
    var createMethod = function(IS_INCLUDES) {
      return function($this, el2, fromIndex) {
        var O2 = toIndexedObject($this);
        var length = lengthOfArrayLike(O2);
        if (length === 0) return !IS_INCLUDES && -1;
        var index = toAbsoluteIndex(fromIndex, length);
        var value;
        if (IS_INCLUDES && el2 !== el2) while (length > index) {
          value = O2[index++];
          if (value !== value) return true;
        }
        else for (; length > index; index++) {
          if ((IS_INCLUDES || index in O2) && O2[index] === el2) return IS_INCLUDES || index || 0;
        }
        return !IS_INCLUDES && -1;
      };
    };
    module2.exports = {
      // `Array.prototype.includes` method
      // https://tc39.es/ecma262/#sec-array.prototype.includes
      includes: createMethod(true),
      // `Array.prototype.indexOf` method
      // https://tc39.es/ecma262/#sec-array.prototype.indexof
      indexOf: createMethod(false)
    };
  }
});

// node_modules/core-js-pure/internals/hidden-keys.js
var require_hidden_keys = __commonJS({
  "node_modules/core-js-pure/internals/hidden-keys.js"(exports, module2) {
    "use strict";
    module2.exports = {};
  }
});

// node_modules/core-js-pure/internals/object-keys-internal.js
var require_object_keys_internal = __commonJS({
  "node_modules/core-js-pure/internals/object-keys-internal.js"(exports, module2) {
    "use strict";
    var uncurryThis = require_function_uncurry_this();
    var hasOwn = require_has_own_property();
    var toIndexedObject = require_to_indexed_object();
    var indexOf = require_array_includes().indexOf;
    var hiddenKeys = require_hidden_keys();
    var push = uncurryThis([].push);
    module2.exports = function(object, names) {
      var O2 = toIndexedObject(object);
      var i3 = 0;
      var result = [];
      var key;
      for (key in O2) !hasOwn(hiddenKeys, key) && hasOwn(O2, key) && push(result, key);
      while (names.length > i3) if (hasOwn(O2, key = names[i3++])) {
        ~indexOf(result, key) || push(result, key);
      }
      return result;
    };
  }
});

// node_modules/core-js-pure/internals/enum-bug-keys.js
var require_enum_bug_keys = __commonJS({
  "node_modules/core-js-pure/internals/enum-bug-keys.js"(exports, module2) {
    "use strict";
    module2.exports = [
      "constructor",
      "hasOwnProperty",
      "isPrototypeOf",
      "propertyIsEnumerable",
      "toLocaleString",
      "toString",
      "valueOf"
    ];
  }
});

// node_modules/core-js-pure/internals/object-keys.js
var require_object_keys = __commonJS({
  "node_modules/core-js-pure/internals/object-keys.js"(exports, module2) {
    "use strict";
    var internalObjectKeys = require_object_keys_internal();
    var enumBugKeys = require_enum_bug_keys();
    module2.exports = Object.keys || function keys(O2) {
      return internalObjectKeys(O2, enumBugKeys);
    };
  }
});

// node_modules/core-js-pure/internals/object-define-properties.js
var require_object_define_properties = __commonJS({
  "node_modules/core-js-pure/internals/object-define-properties.js"(exports) {
    "use strict";
    var DESCRIPTORS = require_descriptors();
    var V8_PROTOTYPE_DEFINE_BUG = require_v8_prototype_define_bug();
    var definePropertyModule = require_object_define_property();
    var anObject = require_an_object();
    var toIndexedObject = require_to_indexed_object();
    var objectKeys = require_object_keys();
    exports.f = DESCRIPTORS && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O2, Properties) {
      anObject(O2);
      var props = toIndexedObject(Properties);
      var keys = objectKeys(Properties);
      var length = keys.length;
      var index = 0;
      var key;
      while (length > index) definePropertyModule.f(O2, key = keys[index++], props[key]);
      return O2;
    };
  }
});

// node_modules/core-js-pure/internals/html.js
var require_html = __commonJS({
  "node_modules/core-js-pure/internals/html.js"(exports, module2) {
    "use strict";
    var getBuiltIn = require_get_built_in();
    module2.exports = getBuiltIn("document", "documentElement");
  }
});

// node_modules/core-js-pure/internals/shared-key.js
var require_shared_key = __commonJS({
  "node_modules/core-js-pure/internals/shared-key.js"(exports, module2) {
    "use strict";
    var shared = require_shared();
    var uid = require_uid();
    var keys = shared("keys");
    module2.exports = function(key) {
      return keys[key] || (keys[key] = uid(key));
    };
  }
});

// node_modules/core-js-pure/internals/object-create.js
var require_object_create = __commonJS({
  "node_modules/core-js-pure/internals/object-create.js"(exports, module2) {
    "use strict";
    var anObject = require_an_object();
    var definePropertiesModule = require_object_define_properties();
    var enumBugKeys = require_enum_bug_keys();
    var hiddenKeys = require_hidden_keys();
    var html = require_html();
    var documentCreateElement = require_document_create_element();
    var sharedKey = require_shared_key();
    var GT = ">";
    var LT = "<";
    var PROTOTYPE = "prototype";
    var SCRIPT = "script";
    var IE_PROTO = sharedKey("IE_PROTO");
    var EmptyConstructor = function() {
    };
    var scriptTag = function(content) {
      return LT + SCRIPT + GT + content + LT + "/" + SCRIPT + GT;
    };
    var NullProtoObjectViaActiveX = function(activeXDocument2) {
      activeXDocument2.write(scriptTag(""));
      activeXDocument2.close();
      var temp = activeXDocument2.parentWindow.Object;
      activeXDocument2 = null;
      return temp;
    };
    var NullProtoObjectViaIFrame = function() {
      var iframe = documentCreateElement("iframe");
      var JS = "java" + SCRIPT + ":";
      var iframeDocument;
      iframe.style.display = "none";
      html.appendChild(iframe);
      iframe.src = String(JS);
      iframeDocument = iframe.contentWindow.document;
      iframeDocument.open();
      iframeDocument.write(scriptTag("document.F=Object"));
      iframeDocument.close();
      return iframeDocument.F;
    };
    var activeXDocument;
    var NullProtoObject = function() {
      try {
        activeXDocument = new ActiveXObject("htmlfile");
      } catch (error) {
      }
      NullProtoObject = typeof document != "undefined" ? document.domain && activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame() : NullProtoObjectViaActiveX(activeXDocument);
      var length = enumBugKeys.length;
      while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
      return NullProtoObject();
    };
    hiddenKeys[IE_PROTO] = true;
    module2.exports = Object.create || function create(O2, Properties) {
      var result;
      if (O2 !== null) {
        EmptyConstructor[PROTOTYPE] = anObject(O2);
        result = new EmptyConstructor();
        EmptyConstructor[PROTOTYPE] = null;
        result[IE_PROTO] = O2;
      } else result = NullProtoObject();
      return Properties === void 0 ? result : definePropertiesModule.f(result, Properties);
    };
  }
});

// node_modules/core-js-pure/internals/object-get-own-property-names.js
var require_object_get_own_property_names = __commonJS({
  "node_modules/core-js-pure/internals/object-get-own-property-names.js"(exports) {
    "use strict";
    var internalObjectKeys = require_object_keys_internal();
    var enumBugKeys = require_enum_bug_keys();
    var hiddenKeys = enumBugKeys.concat("length", "prototype");
    exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O2) {
      return internalObjectKeys(O2, hiddenKeys);
    };
  }
});

// node_modules/core-js-pure/internals/array-slice.js
var require_array_slice = __commonJS({
  "node_modules/core-js-pure/internals/array-slice.js"(exports, module2) {
    "use strict";
    var uncurryThis = require_function_uncurry_this();
    module2.exports = uncurryThis([].slice);
  }
});

// node_modules/core-js-pure/internals/object-get-own-property-names-external.js
var require_object_get_own_property_names_external = __commonJS({
  "node_modules/core-js-pure/internals/object-get-own-property-names-external.js"(exports, module2) {
    "use strict";
    var classof = require_classof_raw();
    var toIndexedObject = require_to_indexed_object();
    var $getOwnPropertyNames = require_object_get_own_property_names().f;
    var arraySlice = require_array_slice();
    var windowNames = typeof window == "object" && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];
    var getWindowNames = function(it2) {
      try {
        return $getOwnPropertyNames(it2);
      } catch (error) {
        return arraySlice(windowNames);
      }
    };
    module2.exports.f = function getOwnPropertyNames(it2) {
      return windowNames && classof(it2) === "Window" ? getWindowNames(it2) : $getOwnPropertyNames(toIndexedObject(it2));
    };
  }
});

// node_modules/core-js-pure/internals/object-get-own-property-symbols.js
var require_object_get_own_property_symbols = __commonJS({
  "node_modules/core-js-pure/internals/object-get-own-property-symbols.js"(exports) {
    "use strict";
    exports.f = Object.getOwnPropertySymbols;
  }
});

// node_modules/core-js-pure/internals/define-built-in.js
var require_define_built_in = __commonJS({
  "node_modules/core-js-pure/internals/define-built-in.js"(exports, module2) {
    "use strict";
    var createNonEnumerableProperty = require_create_non_enumerable_property();
    module2.exports = function(target, key, value, options) {
      if (options && options.enumerable) target[key] = value;
      else createNonEnumerableProperty(target, key, value);
      return target;
    };
  }
});

// node_modules/core-js-pure/internals/define-built-in-accessor.js
var require_define_built_in_accessor = __commonJS({
  "node_modules/core-js-pure/internals/define-built-in-accessor.js"(exports, module2) {
    "use strict";
    var defineProperty = require_object_define_property();
    module2.exports = function(target, name, descriptor) {
      return defineProperty.f(target, name, descriptor);
    };
  }
});

// node_modules/core-js-pure/internals/well-known-symbol-wrapped.js
var require_well_known_symbol_wrapped = __commonJS({
  "node_modules/core-js-pure/internals/well-known-symbol-wrapped.js"(exports) {
    "use strict";
    var wellKnownSymbol = require_well_known_symbol();
    exports.f = wellKnownSymbol;
  }
});

// node_modules/core-js-pure/internals/well-known-symbol-define.js
var require_well_known_symbol_define = __commonJS({
  "node_modules/core-js-pure/internals/well-known-symbol-define.js"(exports, module2) {
    "use strict";
    var path = require_path();
    var hasOwn = require_has_own_property();
    var wrappedWellKnownSymbolModule = require_well_known_symbol_wrapped();
    var defineProperty = require_object_define_property().f;
    module2.exports = function(NAME) {
      var Symbol2 = path.Symbol || (path.Symbol = {});
      if (!hasOwn(Symbol2, NAME)) defineProperty(Symbol2, NAME, {
        value: wrappedWellKnownSymbolModule.f(NAME)
      });
    };
  }
});

// node_modules/core-js-pure/internals/symbol-define-to-primitive.js
var require_symbol_define_to_primitive = __commonJS({
  "node_modules/core-js-pure/internals/symbol-define-to-primitive.js"(exports, module2) {
    "use strict";
    var call = require_function_call();
    var getBuiltIn = require_get_built_in();
    var wellKnownSymbol = require_well_known_symbol();
    var defineBuiltIn = require_define_built_in();
    module2.exports = function() {
      var Symbol2 = getBuiltIn("Symbol");
      var SymbolPrototype = Symbol2 && Symbol2.prototype;
      var valueOf = SymbolPrototype && SymbolPrototype.valueOf;
      var TO_PRIMITIVE = wellKnownSymbol("toPrimitive");
      if (SymbolPrototype && !SymbolPrototype[TO_PRIMITIVE]) {
        defineBuiltIn(SymbolPrototype, TO_PRIMITIVE, function(hint) {
          return call(valueOf, this);
        }, { arity: 1 });
      }
    };
  }
});

// node_modules/core-js-pure/internals/object-to-string.js
var require_object_to_string = __commonJS({
  "node_modules/core-js-pure/internals/object-to-string.js"(exports, module2) {
    "use strict";
    var TO_STRING_TAG_SUPPORT = require_to_string_tag_support();
    var classof = require_classof();
    module2.exports = TO_STRING_TAG_SUPPORT ? {}.toString : function toString() {
      return "[object " + classof(this) + "]";
    };
  }
});

// node_modules/core-js-pure/internals/set-to-string-tag.js
var require_set_to_string_tag = __commonJS({
  "node_modules/core-js-pure/internals/set-to-string-tag.js"(exports, module2) {
    "use strict";
    var TO_STRING_TAG_SUPPORT = require_to_string_tag_support();
    var defineProperty = require_object_define_property().f;
    var createNonEnumerableProperty = require_create_non_enumerable_property();
    var hasOwn = require_has_own_property();
    var toString = require_object_to_string();
    var wellKnownSymbol = require_well_known_symbol();
    var TO_STRING_TAG = wellKnownSymbol("toStringTag");
    module2.exports = function(it2, TAG, STATIC, SET_METHOD) {
      var target = STATIC ? it2 : it2 && it2.prototype;
      if (target) {
        if (!hasOwn(target, TO_STRING_TAG)) {
          defineProperty(target, TO_STRING_TAG, { configurable: true, value: TAG });
        }
        if (SET_METHOD && !TO_STRING_TAG_SUPPORT) {
          createNonEnumerableProperty(target, "toString", toString);
        }
      }
    };
  }
});

// node_modules/core-js-pure/internals/weak-map-basic-detection.js
var require_weak_map_basic_detection = __commonJS({
  "node_modules/core-js-pure/internals/weak-map-basic-detection.js"(exports, module2) {
    "use strict";
    var globalThis2 = require_global_this();
    var isCallable = require_is_callable();
    var WeakMap2 = globalThis2.WeakMap;
    module2.exports = isCallable(WeakMap2) && /native code/.test(String(WeakMap2));
  }
});

// node_modules/core-js-pure/internals/internal-state.js
var require_internal_state = __commonJS({
  "node_modules/core-js-pure/internals/internal-state.js"(exports, module2) {
    "use strict";
    var NATIVE_WEAK_MAP = require_weak_map_basic_detection();
    var globalThis2 = require_global_this();
    var isObject = require_is_object();
    var createNonEnumerableProperty = require_create_non_enumerable_property();
    var hasOwn = require_has_own_property();
    var shared = require_shared_store();
    var sharedKey = require_shared_key();
    var hiddenKeys = require_hidden_keys();
    var OBJECT_ALREADY_INITIALIZED = "Object already initialized";
    var TypeError2 = globalThis2.TypeError;
    var WeakMap2 = globalThis2.WeakMap;
    var set;
    var get;
    var has;
    var enforce = function(it2) {
      return has(it2) ? get(it2) : set(it2, {});
    };
    var getterFor = function(TYPE) {
      return function(it2) {
        var state;
        if (!isObject(it2) || (state = get(it2)).type !== TYPE) {
          throw new TypeError2("Incompatible receiver, " + TYPE + " required");
        }
        return state;
      };
    };
    if (NATIVE_WEAK_MAP || shared.state) {
      store = shared.state || (shared.state = new WeakMap2());
      store.get = store.get;
      store.has = store.has;
      store.set = store.set;
      set = function(it2, metadata) {
        if (store.has(it2)) throw new TypeError2(OBJECT_ALREADY_INITIALIZED);
        metadata.facade = it2;
        store.set(it2, metadata);
        return metadata;
      };
      get = function(it2) {
        return store.get(it2) || {};
      };
      has = function(it2) {
        return store.has(it2);
      };
    } else {
      STATE = sharedKey("state");
      hiddenKeys[STATE] = true;
      set = function(it2, metadata) {
        if (hasOwn(it2, STATE)) throw new TypeError2(OBJECT_ALREADY_INITIALIZED);
        metadata.facade = it2;
        createNonEnumerableProperty(it2, STATE, metadata);
        return metadata;
      };
      get = function(it2) {
        return hasOwn(it2, STATE) ? it2[STATE] : {};
      };
      has = function(it2) {
        return hasOwn(it2, STATE);
      };
    }
    var store;
    var STATE;
    module2.exports = {
      set,
      get,
      has,
      enforce,
      getterFor
    };
  }
});

// node_modules/core-js-pure/internals/array-iteration.js
var require_array_iteration = __commonJS({
  "node_modules/core-js-pure/internals/array-iteration.js"(exports, module2) {
    "use strict";
    var bind = require_function_bind_context();
    var IndexedObject = require_indexed_object();
    var toObject = require_to_object();
    var lengthOfArrayLike = require_length_of_array_like();
    var arraySpeciesCreate = require_array_species_create();
    var createProperty = require_create_property();
    var createMethod = function(TYPE) {
      var IS_MAP = TYPE === 1;
      var IS_FILTER = TYPE === 2;
      var IS_SOME = TYPE === 3;
      var IS_EVERY = TYPE === 4;
      var IS_FIND_INDEX = TYPE === 6;
      var IS_FILTER_REJECT = TYPE === 7;
      var NO_HOLES = TYPE === 5 || IS_FIND_INDEX;
      return function($this, callbackfn, that) {
        var O2 = toObject($this);
        var self2 = IndexedObject(O2);
        var length = lengthOfArrayLike(self2);
        var boundFunction = bind(callbackfn, that);
        var index = 0;
        var resIndex = 0;
        var target = IS_MAP ? arraySpeciesCreate($this, length) : IS_FILTER || IS_FILTER_REJECT ? arraySpeciesCreate($this, 0) : void 0;
        var value, result;
        for (; length > index; index++) if (NO_HOLES || index in self2) {
          value = self2[index];
          result = boundFunction(value, index, O2);
          if (TYPE) {
            if (IS_MAP) createProperty(target, index, result);
            else if (result) switch (TYPE) {
              case 3:
                return true;
              // some
              case 5:
                return value;
              // find
              case 6:
                return index;
              // findIndex
              case 2:
                createProperty(target, resIndex++, value);
            }
            else switch (TYPE) {
              case 4:
                return false;
              // every
              case 7:
                createProperty(target, resIndex++, value);
            }
          }
        }
        return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
      };
    };
    module2.exports = {
      // `Array.prototype.forEach` method
      // https://tc39.es/ecma262/#sec-array.prototype.foreach
      forEach: createMethod(0),
      // `Array.prototype.map` method
      // https://tc39.es/ecma262/#sec-array.prototype.map
      map: createMethod(1),
      // `Array.prototype.filter` method
      // https://tc39.es/ecma262/#sec-array.prototype.filter
      filter: createMethod(2),
      // `Array.prototype.some` method
      // https://tc39.es/ecma262/#sec-array.prototype.some
      some: createMethod(3),
      // `Array.prototype.every` method
      // https://tc39.es/ecma262/#sec-array.prototype.every
      every: createMethod(4),
      // `Array.prototype.find` method
      // https://tc39.es/ecma262/#sec-array.prototype.find
      find: createMethod(5),
      // `Array.prototype.findIndex` method
      // https://tc39.es/ecma262/#sec-array.prototype.findIndex
      findIndex: createMethod(6),
      // `Array.prototype.filterReject` method
      // https://github.com/tc39/proposal-array-filtering
      filterReject: createMethod(7)
    };
  }
});

// node_modules/core-js-pure/modules/es.symbol.constructor.js
var require_es_symbol_constructor = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.constructor.js"() {
    "use strict";
    var $2 = require_export();
    var globalThis2 = require_global_this();
    var call = require_function_call();
    var uncurryThis = require_function_uncurry_this();
    var IS_PURE = require_is_pure();
    var DESCRIPTORS = require_descriptors();
    var NATIVE_SYMBOL = require_symbol_constructor_detection();
    var fails = require_fails();
    var hasOwn = require_has_own_property();
    var isPrototypeOf = require_object_is_prototype_of();
    var anObject = require_an_object();
    var toIndexedObject = require_to_indexed_object();
    var toPropertyKey2 = require_to_property_key();
    var $toString = require_to_string();
    var createPropertyDescriptor = require_create_property_descriptor();
    var nativeObjectCreate = require_object_create();
    var objectKeys = require_object_keys();
    var getOwnPropertyNamesModule = require_object_get_own_property_names();
    var getOwnPropertyNamesExternal = require_object_get_own_property_names_external();
    var getOwnPropertySymbolsModule = require_object_get_own_property_symbols();
    var getOwnPropertyDescriptorModule = require_object_get_own_property_descriptor();
    var definePropertyModule = require_object_define_property();
    var definePropertiesModule = require_object_define_properties();
    var propertyIsEnumerableModule = require_object_property_is_enumerable();
    var defineBuiltIn = require_define_built_in();
    var defineBuiltInAccessor = require_define_built_in_accessor();
    var shared = require_shared();
    var sharedKey = require_shared_key();
    var hiddenKeys = require_hidden_keys();
    var uid = require_uid();
    var wellKnownSymbol = require_well_known_symbol();
    var wrappedWellKnownSymbolModule = require_well_known_symbol_wrapped();
    var defineWellKnownSymbol = require_well_known_symbol_define();
    var defineSymbolToPrimitive = require_symbol_define_to_primitive();
    var setToStringTag = require_set_to_string_tag();
    var InternalStateModule = require_internal_state();
    var $forEach = require_array_iteration().forEach;
    var HIDDEN = sharedKey("hidden");
    var SYMBOL = "Symbol";
    var PROTOTYPE = "prototype";
    var setInternalState = InternalStateModule.set;
    var getInternalState = InternalStateModule.getterFor(SYMBOL);
    var ObjectPrototype = Object[PROTOTYPE];
    var $Symbol = globalThis2.Symbol;
    var SymbolPrototype = $Symbol && $Symbol[PROTOTYPE];
    var RangeError = globalThis2.RangeError;
    var TypeError2 = globalThis2.TypeError;
    var QObject = globalThis2.QObject;
    var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
    var nativeDefineProperty = definePropertyModule.f;
    var nativeGetOwnPropertyNames = getOwnPropertyNamesExternal.f;
    var nativePropertyIsEnumerable = propertyIsEnumerableModule.f;
    var push = uncurryThis([].push);
    var AllSymbols = shared("symbols");
    var ObjectPrototypeSymbols = shared("op-symbols");
    var WellKnownSymbolsStore = shared("wks");
    var USE_SETTER = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;
    var fallbackDefineProperty = function(O2, P2, Attributes) {
      var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor(ObjectPrototype, P2);
      if (ObjectPrototypeDescriptor) delete ObjectPrototype[P2];
      nativeDefineProperty(O2, P2, Attributes);
      if (ObjectPrototypeDescriptor && O2 !== ObjectPrototype) {
        nativeDefineProperty(ObjectPrototype, P2, ObjectPrototypeDescriptor);
      }
      return O2;
    };
    var setSymbolDescriptor = DESCRIPTORS && fails(function() {
      return nativeObjectCreate(nativeDefineProperty({}, "a", {
        get: function() {
          return nativeDefineProperty(this, "a", { value: 7 }).a;
        }
      })).a !== 7;
    }) ? fallbackDefineProperty : nativeDefineProperty;
    var wrap = function(tag, description) {
      var symbol = AllSymbols[tag] = nativeObjectCreate(SymbolPrototype);
      setInternalState(symbol, {
        type: SYMBOL,
        tag,
        description
      });
      if (!DESCRIPTORS) symbol.description = description;
      return symbol;
    };
    var $defineProperty = function defineProperty(O2, P2, Attributes) {
      if (O2 === ObjectPrototype) $defineProperty(ObjectPrototypeSymbols, P2, Attributes);
      anObject(O2);
      var key = toPropertyKey2(P2);
      anObject(Attributes);
      if (hasOwn(AllSymbols, key)) {
        if (!("enumerable" in Attributes) ? !hasOwn(O2, key) || hasOwn(O2, HIDDEN) && O2[HIDDEN][key] : !Attributes.enumerable) {
          if (!hasOwn(O2, HIDDEN)) nativeDefineProperty(O2, HIDDEN, createPropertyDescriptor(1, nativeObjectCreate(null)));
          O2[HIDDEN][key] = true;
        } else {
          if (hasOwn(O2, HIDDEN) && O2[HIDDEN][key]) O2[HIDDEN][key] = false;
          Attributes = nativeObjectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
        }
        return setSymbolDescriptor(O2, key, Attributes);
      }
      return nativeDefineProperty(O2, key, Attributes);
    };
    var $defineProperties = function defineProperties(O2, Properties) {
      anObject(O2);
      var properties = toIndexedObject(Properties);
      var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
      $forEach(keys, function(key) {
        if (!DESCRIPTORS || call($propertyIsEnumerable, properties, key)) $defineProperty(O2, key, properties[key]);
      });
      return O2;
    };
    var $create = function create(O2, Properties) {
      return Properties === void 0 ? nativeObjectCreate(O2) : $defineProperties(nativeObjectCreate(O2), Properties);
    };
    var $propertyIsEnumerable = function propertyIsEnumerable(V2) {
      var P2 = toPropertyKey2(V2);
      var enumerable = call(nativePropertyIsEnumerable, this, P2);
      if (this === ObjectPrototype && hasOwn(AllSymbols, P2) && !hasOwn(ObjectPrototypeSymbols, P2)) return false;
      return enumerable || !hasOwn(this, P2) || !hasOwn(AllSymbols, P2) || hasOwn(this, HIDDEN) && this[HIDDEN][P2] ? enumerable : true;
    };
    var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O2, P2) {
      var it2 = toIndexedObject(O2);
      var key = toPropertyKey2(P2);
      if (it2 === ObjectPrototype && hasOwn(AllSymbols, key) && !hasOwn(ObjectPrototypeSymbols, key)) return;
      var descriptor = nativeGetOwnPropertyDescriptor(it2, key);
      if (descriptor && hasOwn(AllSymbols, key) && !(hasOwn(it2, HIDDEN) && it2[HIDDEN][key])) {
        descriptor.enumerable = true;
      }
      return descriptor;
    };
    var $getOwnPropertyNames = function getOwnPropertyNames(O2) {
      var names = nativeGetOwnPropertyNames(toIndexedObject(O2));
      var result = [];
      $forEach(names, function(key) {
        if (!hasOwn(AllSymbols, key) && !hasOwn(hiddenKeys, key)) push(result, key);
      });
      return result;
    };
    var $getOwnPropertySymbols = function(O2) {
      var IS_OBJECT_PROTOTYPE = O2 === ObjectPrototype;
      var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O2));
      var result = [];
      $forEach(names, function(key) {
        if (hasOwn(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || hasOwn(ObjectPrototype, key))) {
          push(result, AllSymbols[key]);
        }
      });
      return result;
    };
    if (!NATIVE_SYMBOL) {
      $Symbol = function Symbol2() {
        if (isPrototypeOf(SymbolPrototype, this)) throw new TypeError2("Symbol is not a constructor");
        var description = !arguments.length || arguments[0] === void 0 ? void 0 : $toString(arguments[0]);
        var tag = uid(description);
        var setter = function(value) {
          var $this = this === void 0 ? globalThis2 : this;
          if ($this === ObjectPrototype) call(setter, ObjectPrototypeSymbols, value);
          if (hasOwn($this, HIDDEN) && hasOwn($this[HIDDEN], tag)) $this[HIDDEN][tag] = false;
          var descriptor = createPropertyDescriptor(1, value);
          try {
            setSymbolDescriptor($this, tag, descriptor);
          } catch (error) {
            if (!(error instanceof RangeError)) throw error;
            fallbackDefineProperty($this, tag, descriptor);
          }
        };
        if (DESCRIPTORS && USE_SETTER) setSymbolDescriptor(ObjectPrototype, tag, { configurable: true, set: setter });
        return wrap(tag, description);
      };
      SymbolPrototype = $Symbol[PROTOTYPE];
      defineBuiltIn(SymbolPrototype, "toString", function toString() {
        return getInternalState(this).tag;
      });
      defineBuiltIn($Symbol, "withoutSetter", function(description) {
        return wrap(uid(description), description);
      });
      propertyIsEnumerableModule.f = $propertyIsEnumerable;
      definePropertyModule.f = $defineProperty;
      definePropertiesModule.f = $defineProperties;
      getOwnPropertyDescriptorModule.f = $getOwnPropertyDescriptor;
      getOwnPropertyNamesModule.f = getOwnPropertyNamesExternal.f = $getOwnPropertyNames;
      getOwnPropertySymbolsModule.f = $getOwnPropertySymbols;
      wrappedWellKnownSymbolModule.f = function(name) {
        return wrap(wellKnownSymbol(name), name);
      };
      if (DESCRIPTORS) {
        defineBuiltInAccessor(SymbolPrototype, "description", {
          configurable: true,
          get: function description() {
            return getInternalState(this).description;
          }
        });
        if (!IS_PURE) {
          defineBuiltIn(ObjectPrototype, "propertyIsEnumerable", $propertyIsEnumerable, { unsafe: true });
        }
      }
    }
    $2({ global: true, constructor: true, wrap: true, forced: !NATIVE_SYMBOL, sham: !NATIVE_SYMBOL }, {
      Symbol: $Symbol
    });
    $forEach(objectKeys(WellKnownSymbolsStore), function(name) {
      defineWellKnownSymbol(name);
    });
    $2({ target: SYMBOL, stat: true, forced: !NATIVE_SYMBOL }, {
      useSetter: function() {
        USE_SETTER = true;
      },
      useSimple: function() {
        USE_SETTER = false;
      }
    });
    $2({ target: "Object", stat: true, forced: !NATIVE_SYMBOL, sham: !DESCRIPTORS }, {
      // `Object.create` method
      // https://tc39.es/ecma262/#sec-object.create
      create: $create,
      // `Object.defineProperty` method
      // https://tc39.es/ecma262/#sec-object.defineproperty
      defineProperty: $defineProperty,
      // `Object.defineProperties` method
      // https://tc39.es/ecma262/#sec-object.defineproperties
      defineProperties: $defineProperties,
      // `Object.getOwnPropertyDescriptor` method
      // https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
      getOwnPropertyDescriptor: $getOwnPropertyDescriptor
    });
    $2({ target: "Object", stat: true, forced: !NATIVE_SYMBOL }, {
      // `Object.getOwnPropertyNames` method
      // https://tc39.es/ecma262/#sec-object.getownpropertynames
      getOwnPropertyNames: $getOwnPropertyNames
    });
    defineSymbolToPrimitive();
    setToStringTag($Symbol, SYMBOL);
    hiddenKeys[HIDDEN] = true;
  }
});

// node_modules/core-js-pure/internals/symbol-registry-detection.js
var require_symbol_registry_detection = __commonJS({
  "node_modules/core-js-pure/internals/symbol-registry-detection.js"(exports, module2) {
    "use strict";
    var NATIVE_SYMBOL = require_symbol_constructor_detection();
    module2.exports = NATIVE_SYMBOL && !!Symbol["for"] && !!Symbol.keyFor;
  }
});

// node_modules/core-js-pure/modules/es.symbol.for.js
var require_es_symbol_for = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.for.js"() {
    "use strict";
    var $2 = require_export();
    var getBuiltIn = require_get_built_in();
    var hasOwn = require_has_own_property();
    var toString = require_to_string();
    var shared = require_shared();
    var NATIVE_SYMBOL_REGISTRY = require_symbol_registry_detection();
    var StringToSymbolRegistry = shared("string-to-symbol-registry");
    var SymbolToStringRegistry = shared("symbol-to-string-registry");
    $2({ target: "Symbol", stat: true, forced: !NATIVE_SYMBOL_REGISTRY }, {
      "for": function(key) {
        var string = toString(key);
        if (hasOwn(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
        var symbol = getBuiltIn("Symbol")(string);
        StringToSymbolRegistry[string] = symbol;
        SymbolToStringRegistry[symbol] = string;
        return symbol;
      }
    });
  }
});

// node_modules/core-js-pure/modules/es.symbol.key-for.js
var require_es_symbol_key_for = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.key-for.js"() {
    "use strict";
    var $2 = require_export();
    var hasOwn = require_has_own_property();
    var isSymbol = require_is_symbol();
    var tryToString = require_try_to_string();
    var shared = require_shared();
    var NATIVE_SYMBOL_REGISTRY = require_symbol_registry_detection();
    var SymbolToStringRegistry = shared("symbol-to-string-registry");
    $2({ target: "Symbol", stat: true, forced: !NATIVE_SYMBOL_REGISTRY }, {
      keyFor: function keyFor(sym) {
        if (!isSymbol(sym)) throw new TypeError(tryToString(sym) + " is not a symbol");
        if (hasOwn(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
      }
    });
  }
});

// node_modules/core-js-pure/internals/is-raw-json.js
var require_is_raw_json = __commonJS({
  "node_modules/core-js-pure/internals/is-raw-json.js"(exports, module2) {
    "use strict";
    var isObject = require_is_object();
    var getInternalState = require_internal_state().get;
    module2.exports = function isRawJSON(O2) {
      if (!isObject(O2)) return false;
      var state = getInternalState(O2);
      return !!state && state.type === "RawJSON";
    };
  }
});

// node_modules/core-js-pure/internals/parse-json-string.js
var require_parse_json_string = __commonJS({
  "node_modules/core-js-pure/internals/parse-json-string.js"(exports, module2) {
    "use strict";
    var uncurryThis = require_function_uncurry_this();
    var hasOwn = require_has_own_property();
    var $SyntaxError = SyntaxError;
    var $parseInt = parseInt;
    var fromCharCode = String.fromCharCode;
    var at2 = uncurryThis("".charAt);
    var slice = uncurryThis("".slice);
    var exec = uncurryThis(/./.exec);
    var codePoints = {
      '\\"': '"',
      "\\\\": "\\",
      "\\/": "/",
      "\\b": "\b",
      "\\f": "\f",
      "\\n": "\n",
      "\\r": "\r",
      "\\t": "	"
    };
    var IS_4_HEX_DIGITS = /^[\da-f]{4}$/i;
    var IS_C0_CONTROL_CODE = /^[\u0000-\u001F]$/;
    module2.exports = function(source, i3) {
      var unterminated = true;
      var value = "";
      while (i3 < source.length) {
        var chr = at2(source, i3);
        if (chr === "\\") {
          var twoChars = slice(source, i3, i3 + 2);
          if (hasOwn(codePoints, twoChars)) {
            value += codePoints[twoChars];
            i3 += 2;
          } else if (twoChars === "\\u") {
            i3 += 2;
            var fourHexDigits = slice(source, i3, i3 + 4);
            if (!exec(IS_4_HEX_DIGITS, fourHexDigits)) throw new $SyntaxError("Bad Unicode escape at: " + i3);
            value += fromCharCode($parseInt(fourHexDigits, 16));
            i3 += 4;
          } else throw new $SyntaxError('Unknown escape sequence: "' + twoChars + '"');
        } else if (chr === '"') {
          unterminated = false;
          i3++;
          break;
        } else {
          if (exec(IS_C0_CONTROL_CODE, chr)) throw new $SyntaxError("Bad control character in string literal at: " + i3);
          value += chr;
          i3++;
        }
      }
      if (unterminated) throw new $SyntaxError("Unterminated string at: " + i3);
      return { value, end: i3 };
    };
  }
});

// node_modules/core-js-pure/internals/native-raw-json.js
var require_native_raw_json = __commonJS({
  "node_modules/core-js-pure/internals/native-raw-json.js"(exports, module2) {
    "use strict";
    var fails = require_fails();
    module2.exports = !fails(function() {
      var unsafeInt = "9007199254740993";
      var raw = JSON.rawJSON(unsafeInt);
      return !JSON.isRawJSON(raw) || JSON.stringify(raw) !== unsafeInt;
    });
  }
});

// node_modules/core-js-pure/modules/es.json.stringify.js
var require_es_json_stringify = __commonJS({
  "node_modules/core-js-pure/modules/es.json.stringify.js"() {
    "use strict";
    var $2 = require_export();
    var getBuiltIn = require_get_built_in();
    var apply = require_function_apply();
    var call = require_function_call();
    var uncurryThis = require_function_uncurry_this();
    var fails = require_fails();
    var isArray = require_is_array();
    var isCallable = require_is_callable();
    var isRawJSON = require_is_raw_json();
    var isSymbol = require_is_symbol();
    var classof = require_classof_raw();
    var toString = require_to_string();
    var arraySlice = require_array_slice();
    var parseJSONString = require_parse_json_string();
    var uid = require_uid();
    var NATIVE_SYMBOL = require_symbol_constructor_detection();
    var NATIVE_RAW_JSON = require_native_raw_json();
    var $String = String;
    var $stringify = getBuiltIn("JSON", "stringify");
    var exec = uncurryThis(/./.exec);
    var charAt = uncurryThis("".charAt);
    var charCodeAt = uncurryThis("".charCodeAt);
    var replace = uncurryThis("".replace);
    var slice = uncurryThis("".slice);
    var push = uncurryThis([].push);
    var numberToString = uncurryThis(1.1.toString);
    var surrogates = /[\uD800-\uDFFF]/g;
    var leadingSurrogates = /^[\uD800-\uDBFF]$/;
    var trailingSurrogates = /^[\uDC00-\uDFFF]$/;
    var MARK = uid();
    var MARK_LENGTH = MARK.length;
    var WRONG_SYMBOLS_CONVERSION = !NATIVE_SYMBOL || fails(function() {
      var symbol = getBuiltIn("Symbol")("stringify detection");
      return $stringify([symbol]) !== "[null]" || $stringify({ a: symbol }) !== "{}" || $stringify(Object(symbol)) !== "{}";
    });
    var ILL_FORMED_UNICODE = fails(function() {
      return $stringify("\uDF06\uD834") !== '"\\udf06\\ud834"' || $stringify("\uDEAD") !== '"\\udead"';
    });
    var stringifyWithProperSymbolsConversion = WRONG_SYMBOLS_CONVERSION ? function(it2, replacer) {
      var args = arraySlice(arguments);
      var $replacer = getReplacerFunction(replacer);
      if (!isCallable($replacer) && (it2 === void 0 || isSymbol(it2))) return;
      args[1] = function(key, value) {
        if (isCallable($replacer)) value = call($replacer, this, $String(key), value);
        if (!isSymbol(value)) return value;
      };
      return apply($stringify, null, args);
    } : $stringify;
    var fixIllFormedJSON = function(match, offset, string) {
      var prev = charAt(string, offset - 1);
      var next = charAt(string, offset + 1);
      if (exec(leadingSurrogates, match) && !exec(trailingSurrogates, next) || exec(trailingSurrogates, match) && !exec(leadingSurrogates, prev)) {
        return "\\u" + numberToString(charCodeAt(match, 0), 16);
      }
      return match;
    };
    var getReplacerFunction = function(replacer) {
      if (isCallable(replacer)) return replacer;
      if (!isArray(replacer)) return;
      var rawLength = replacer.length;
      var keys = [];
      for (var i3 = 0; i3 < rawLength; i3++) {
        var element = replacer[i3];
        if (typeof element == "string") push(keys, element);
        else if (typeof element == "number" || classof(element) === "Number" || classof(element) === "String") push(keys, toString(element));
      }
      var keysLength = keys.length;
      var root = true;
      return function(key, value) {
        if (root) {
          root = false;
          return value;
        }
        if (isArray(this)) return value;
        for (var j2 = 0; j2 < keysLength; j2++) if (keys[j2] === key) return value;
      };
    };
    if ($stringify) $2({ target: "JSON", stat: true, arity: 3, forced: WRONG_SYMBOLS_CONVERSION || ILL_FORMED_UNICODE || !NATIVE_RAW_JSON }, {
      stringify: function stringify(text, replacer, space) {
        var replacerFunction = getReplacerFunction(replacer);
        var rawStrings = [];
        var json = stringifyWithProperSymbolsConversion(text, function(key, value) {
          var v2 = isCallable(replacerFunction) ? call(replacerFunction, this, $String(key), value) : value;
          return !NATIVE_RAW_JSON && isRawJSON(v2) ? MARK + (push(rawStrings, v2.rawJSON) - 1) : v2;
        }, space);
        if (typeof json != "string") return json;
        if (ILL_FORMED_UNICODE) json = replace(json, surrogates, fixIllFormedJSON);
        if (NATIVE_RAW_JSON) return json;
        var result = "";
        var length = json.length;
        for (var i3 = 0; i3 < length; i3++) {
          var chr = charAt(json, i3);
          if (chr === '"') {
            var end = parseJSONString(json, ++i3).end - 1;
            var string = slice(json, i3, end);
            result += slice(string, 0, MARK_LENGTH) === MARK ? rawStrings[slice(string, MARK_LENGTH)] : '"' + string + '"';
            i3 = end;
          } else result += chr;
        }
        return result;
      }
    });
  }
});

// node_modules/core-js-pure/modules/es.object.get-own-property-symbols.js
var require_es_object_get_own_property_symbols = __commonJS({
  "node_modules/core-js-pure/modules/es.object.get-own-property-symbols.js"() {
    "use strict";
    var $2 = require_export();
    var NATIVE_SYMBOL = require_symbol_constructor_detection();
    var fails = require_fails();
    var getOwnPropertySymbolsModule = require_object_get_own_property_symbols();
    var toObject = require_to_object();
    var FORCED = !NATIVE_SYMBOL || fails(function() {
      getOwnPropertySymbolsModule.f(1);
    });
    $2({ target: "Object", stat: true, forced: FORCED }, {
      getOwnPropertySymbols: function getOwnPropertySymbols(it2) {
        var $getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
        return $getOwnPropertySymbols ? $getOwnPropertySymbols(toObject(it2)) : [];
      }
    });
  }
});

// node_modules/core-js-pure/modules/es.symbol.js
var require_es_symbol = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.js"() {
    "use strict";
    require_es_symbol_constructor();
    require_es_symbol_for();
    require_es_symbol_key_for();
    require_es_json_stringify();
    require_es_object_get_own_property_symbols();
  }
});

// node_modules/core-js-pure/modules/es.symbol.async-dispose.js
var require_es_symbol_async_dispose = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.async-dispose.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("asyncDispose");
  }
});

// node_modules/core-js-pure/modules/es.symbol.async-iterator.js
var require_es_symbol_async_iterator = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.async-iterator.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("asyncIterator");
  }
});

// node_modules/core-js-pure/modules/es.symbol.description.js
var require_es_symbol_description = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.description.js"() {
  }
});

// node_modules/core-js-pure/modules/es.symbol.dispose.js
var require_es_symbol_dispose = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.dispose.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("dispose");
  }
});

// node_modules/core-js-pure/modules/es.symbol.has-instance.js
var require_es_symbol_has_instance = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.has-instance.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("hasInstance");
  }
});

// node_modules/core-js-pure/modules/es.symbol.is-concat-spreadable.js
var require_es_symbol_is_concat_spreadable = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.is-concat-spreadable.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("isConcatSpreadable");
  }
});

// node_modules/core-js-pure/modules/es.symbol.iterator.js
var require_es_symbol_iterator = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.iterator.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("iterator");
  }
});

// node_modules/core-js-pure/modules/es.symbol.match.js
var require_es_symbol_match = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.match.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("match");
  }
});

// node_modules/core-js-pure/modules/es.symbol.match-all.js
var require_es_symbol_match_all = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.match-all.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("matchAll");
  }
});

// node_modules/core-js-pure/modules/es.symbol.replace.js
var require_es_symbol_replace = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.replace.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("replace");
  }
});

// node_modules/core-js-pure/modules/es.symbol.search.js
var require_es_symbol_search = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.search.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("search");
  }
});

// node_modules/core-js-pure/modules/es.symbol.species.js
var require_es_symbol_species = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.species.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("species");
  }
});

// node_modules/core-js-pure/modules/es.symbol.split.js
var require_es_symbol_split = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.split.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("split");
  }
});

// node_modules/core-js-pure/modules/es.symbol.to-primitive.js
var require_es_symbol_to_primitive = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.to-primitive.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    var defineSymbolToPrimitive = require_symbol_define_to_primitive();
    defineWellKnownSymbol("toPrimitive");
    defineSymbolToPrimitive();
  }
});

// node_modules/core-js-pure/modules/es.symbol.to-string-tag.js
var require_es_symbol_to_string_tag = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.to-string-tag.js"() {
    "use strict";
    var getBuiltIn = require_get_built_in();
    var defineWellKnownSymbol = require_well_known_symbol_define();
    var setToStringTag = require_set_to_string_tag();
    defineWellKnownSymbol("toStringTag");
    setToStringTag(getBuiltIn("Symbol"), "Symbol");
  }
});

// node_modules/core-js-pure/modules/es.symbol.unscopables.js
var require_es_symbol_unscopables = __commonJS({
  "node_modules/core-js-pure/modules/es.symbol.unscopables.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("unscopables");
  }
});

// node_modules/core-js-pure/modules/es.json.to-string-tag.js
var require_es_json_to_string_tag = __commonJS({
  "node_modules/core-js-pure/modules/es.json.to-string-tag.js"() {
    "use strict";
    var globalThis2 = require_global_this();
    var setToStringTag = require_set_to_string_tag();
    setToStringTag(globalThis2.JSON, "JSON", true);
  }
});

// node_modules/core-js-pure/modules/es.math.to-string-tag.js
var require_es_math_to_string_tag = __commonJS({
  "node_modules/core-js-pure/modules/es.math.to-string-tag.js"() {
  }
});

// node_modules/core-js-pure/modules/es.reflect.to-string-tag.js
var require_es_reflect_to_string_tag = __commonJS({
  "node_modules/core-js-pure/modules/es.reflect.to-string-tag.js"() {
  }
});

// node_modules/core-js-pure/es/symbol/index.js
var require_symbol = __commonJS({
  "node_modules/core-js-pure/es/symbol/index.js"(exports, module2) {
    "use strict";
    require_es_array_concat();
    require_es_object_to_string();
    require_es_symbol();
    require_es_symbol_async_dispose();
    require_es_symbol_async_iterator();
    require_es_symbol_description();
    require_es_symbol_dispose();
    require_es_symbol_has_instance();
    require_es_symbol_is_concat_spreadable();
    require_es_symbol_iterator();
    require_es_symbol_match();
    require_es_symbol_match_all();
    require_es_symbol_replace();
    require_es_symbol_search();
    require_es_symbol_species();
    require_es_symbol_split();
    require_es_symbol_to_primitive();
    require_es_symbol_to_string_tag();
    require_es_symbol_unscopables();
    require_es_json_to_string_tag();
    require_es_math_to_string_tag();
    require_es_reflect_to_string_tag();
    var path = require_path();
    module2.exports = path.Symbol;
  }
});

// node_modules/core-js-pure/internals/add-to-unscopables.js
var require_add_to_unscopables = __commonJS({
  "node_modules/core-js-pure/internals/add-to-unscopables.js"(exports, module2) {
    "use strict";
    module2.exports = function() {
    };
  }
});

// node_modules/core-js-pure/internals/iterators.js
var require_iterators = __commonJS({
  "node_modules/core-js-pure/internals/iterators.js"(exports, module2) {
    "use strict";
    module2.exports = {};
  }
});

// node_modules/core-js-pure/internals/function-name.js
var require_function_name = __commonJS({
  "node_modules/core-js-pure/internals/function-name.js"(exports, module2) {
    "use strict";
    var DESCRIPTORS = require_descriptors();
    var hasOwn = require_has_own_property();
    var FunctionPrototype = Function.prototype;
    var getDescriptor = DESCRIPTORS && Object.getOwnPropertyDescriptor;
    var EXISTS = hasOwn(FunctionPrototype, "name");
    var PROPER = EXISTS && function something() {
    }.name === "something";
    var CONFIGURABLE = EXISTS && (!DESCRIPTORS || DESCRIPTORS && getDescriptor(FunctionPrototype, "name").configurable);
    module2.exports = {
      EXISTS,
      PROPER,
      CONFIGURABLE
    };
  }
});

// node_modules/core-js-pure/internals/correct-prototype-getter.js
var require_correct_prototype_getter = __commonJS({
  "node_modules/core-js-pure/internals/correct-prototype-getter.js"(exports, module2) {
    "use strict";
    var fails = require_fails();
    module2.exports = !fails(function() {
      function F2() {
      }
      F2.prototype.constructor = null;
      return Object.getPrototypeOf(new F2()) !== F2.prototype;
    });
  }
});

// node_modules/core-js-pure/internals/object-get-prototype-of.js
var require_object_get_prototype_of = __commonJS({
  "node_modules/core-js-pure/internals/object-get-prototype-of.js"(exports, module2) {
    "use strict";
    var hasOwn = require_has_own_property();
    var isCallable = require_is_callable();
    var toObject = require_to_object();
    var sharedKey = require_shared_key();
    var CORRECT_PROTOTYPE_GETTER = require_correct_prototype_getter();
    var IE_PROTO = sharedKey("IE_PROTO");
    var $Object = Object;
    var ObjectPrototype = $Object.prototype;
    module2.exports = CORRECT_PROTOTYPE_GETTER ? $Object.getPrototypeOf : function(O2) {
      var object = toObject(O2);
      if (hasOwn(object, IE_PROTO)) return object[IE_PROTO];
      var constructor = object.constructor;
      if (isCallable(constructor) && object instanceof constructor) {
        return constructor.prototype;
      }
      return object instanceof $Object ? ObjectPrototype : null;
    };
  }
});

// node_modules/core-js-pure/internals/iterators-core.js
var require_iterators_core = __commonJS({
  "node_modules/core-js-pure/internals/iterators-core.js"(exports, module2) {
    "use strict";
    var fails = require_fails();
    var isCallable = require_is_callable();
    var isObject = require_is_object();
    var create = require_object_create();
    var getPrototypeOf = require_object_get_prototype_of();
    var defineBuiltIn = require_define_built_in();
    var wellKnownSymbol = require_well_known_symbol();
    var IS_PURE = require_is_pure();
    var ITERATOR = wellKnownSymbol("iterator");
    var BUGGY_SAFARI_ITERATORS = false;
    var IteratorPrototype;
    var PrototypeOfArrayIteratorPrototype;
    var arrayIterator;
    if ([].keys) {
      arrayIterator = [].keys();
      if (!("next" in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
      else {
        PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
        if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
      }
    }
    var NEW_ITERATOR_PROTOTYPE = !isObject(IteratorPrototype) || fails(function() {
      var test = {};
      return IteratorPrototype[ITERATOR].call(test) !== test;
    });
    if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype = {};
    else if (IS_PURE) IteratorPrototype = create(IteratorPrototype);
    if (!isCallable(IteratorPrototype[ITERATOR])) {
      defineBuiltIn(IteratorPrototype, ITERATOR, function() {
        return this;
      });
    }
    module2.exports = {
      IteratorPrototype,
      BUGGY_SAFARI_ITERATORS
    };
  }
});

// node_modules/core-js-pure/internals/iterator-create-constructor.js
var require_iterator_create_constructor = __commonJS({
  "node_modules/core-js-pure/internals/iterator-create-constructor.js"(exports, module2) {
    "use strict";
    var IteratorPrototype = require_iterators_core().IteratorPrototype;
    var create = require_object_create();
    var createPropertyDescriptor = require_create_property_descriptor();
    var setToStringTag = require_set_to_string_tag();
    var Iterators = require_iterators();
    var returnThis = function() {
      return this;
    };
    module2.exports = function(IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
      var TO_STRING_TAG = NAME + " Iterator";
      IteratorConstructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(+!ENUMERABLE_NEXT, next) });
      setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
      Iterators[TO_STRING_TAG] = returnThis;
      return IteratorConstructor;
    };
  }
});

// node_modules/core-js-pure/internals/function-uncurry-this-accessor.js
var require_function_uncurry_this_accessor = __commonJS({
  "node_modules/core-js-pure/internals/function-uncurry-this-accessor.js"(exports, module2) {
    "use strict";
    var uncurryThis = require_function_uncurry_this();
    var aCallable = require_a_callable();
    module2.exports = function(object, key, method) {
      try {
        return uncurryThis(aCallable(Object.getOwnPropertyDescriptor(object, key)[method]));
      } catch (error) {
      }
    };
  }
});

// node_modules/core-js-pure/internals/is-possible-prototype.js
var require_is_possible_prototype = __commonJS({
  "node_modules/core-js-pure/internals/is-possible-prototype.js"(exports, module2) {
    "use strict";
    var isObject = require_is_object();
    module2.exports = function(argument) {
      return isObject(argument) || argument === null;
    };
  }
});

// node_modules/core-js-pure/internals/a-possible-prototype.js
var require_a_possible_prototype = __commonJS({
  "node_modules/core-js-pure/internals/a-possible-prototype.js"(exports, module2) {
    "use strict";
    var isPossiblePrototype = require_is_possible_prototype();
    var $String = String;
    var $TypeError = TypeError;
    module2.exports = function(argument) {
      if (isPossiblePrototype(argument)) return argument;
      throw new $TypeError("Can't set " + $String(argument) + " as a prototype");
    };
  }
});

// node_modules/core-js-pure/internals/object-set-prototype-of.js
var require_object_set_prototype_of = __commonJS({
  "node_modules/core-js-pure/internals/object-set-prototype-of.js"(exports, module2) {
    "use strict";
    var uncurryThisAccessor = require_function_uncurry_this_accessor();
    var isObject = require_is_object();
    var requireObjectCoercible = require_require_object_coercible();
    var aPossiblePrototype = require_a_possible_prototype();
    module2.exports = Object.setPrototypeOf || ("__proto__" in {} ? function() {
      var CORRECT_SETTER = false;
      var test = {};
      var setter;
      try {
        setter = uncurryThisAccessor(Object.prototype, "__proto__", "set");
        setter(test, []);
        CORRECT_SETTER = test instanceof Array;
      } catch (error) {
      }
      return function setPrototypeOf(O2, proto) {
        requireObjectCoercible(O2);
        aPossiblePrototype(proto);
        if (!isObject(O2)) return O2;
        if (CORRECT_SETTER) setter(O2, proto);
        else O2.__proto__ = proto;
        return O2;
      };
    }() : void 0);
  }
});

// node_modules/core-js-pure/internals/iterator-define.js
var require_iterator_define = __commonJS({
  "node_modules/core-js-pure/internals/iterator-define.js"(exports, module2) {
    "use strict";
    var $2 = require_export();
    var call = require_function_call();
    var IS_PURE = require_is_pure();
    var FunctionName = require_function_name();
    var isCallable = require_is_callable();
    var createIteratorConstructor = require_iterator_create_constructor();
    var getPrototypeOf = require_object_get_prototype_of();
    var setPrototypeOf = require_object_set_prototype_of();
    var setToStringTag = require_set_to_string_tag();
    var createNonEnumerableProperty = require_create_non_enumerable_property();
    var defineBuiltIn = require_define_built_in();
    var wellKnownSymbol = require_well_known_symbol();
    var Iterators = require_iterators();
    var IteratorsCore = require_iterators_core();
    var PROPER_FUNCTION_NAME = FunctionName.PROPER;
    var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
    var IteratorPrototype = IteratorsCore.IteratorPrototype;
    var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
    var ITERATOR = wellKnownSymbol("iterator");
    var KEYS = "keys";
    var VALUES = "values";
    var ENTRIES = "entries";
    var returnThis = function() {
      return this;
    };
    module2.exports = function(Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
      createIteratorConstructor(IteratorConstructor, NAME, next);
      var getIterationMethod = function(KIND) {
        if (KIND === DEFAULT && defaultIterator) return defaultIterator;
        if (!BUGGY_SAFARI_ITERATORS && KIND && KIND in IterablePrototype) return IterablePrototype[KIND];
        switch (KIND) {
          case KEYS:
            return function keys() {
              return new IteratorConstructor(this, KIND);
            };
          case VALUES:
            return function values() {
              return new IteratorConstructor(this, KIND);
            };
          case ENTRIES:
            return function entries() {
              return new IteratorConstructor(this, KIND);
            };
        }
        return function() {
          return new IteratorConstructor(this);
        };
      };
      var TO_STRING_TAG = NAME + " Iterator";
      var INCORRECT_VALUES_NAME = false;
      var IterablePrototype = Iterable.prototype;
      var nativeIterator = IterablePrototype[ITERATOR] || IterablePrototype["@@iterator"] || DEFAULT && IterablePrototype[DEFAULT];
      var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
      var anyNativeIterator = NAME === "Array" ? IterablePrototype.entries || nativeIterator : nativeIterator;
      var CurrentIteratorPrototype, methods, KEY;
      if (anyNativeIterator) {
        CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
        if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
          if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
            if (setPrototypeOf) {
              setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
            } else if (!isCallable(CurrentIteratorPrototype[ITERATOR])) {
              defineBuiltIn(CurrentIteratorPrototype, ITERATOR, returnThis);
            }
          }
          setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
          if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
        }
      }
      if (PROPER_FUNCTION_NAME && DEFAULT === VALUES && nativeIterator && nativeIterator.name !== VALUES) {
        if (!IS_PURE && CONFIGURABLE_FUNCTION_NAME) {
          createNonEnumerableProperty(IterablePrototype, "name", VALUES);
        } else {
          INCORRECT_VALUES_NAME = true;
          defaultIterator = function values() {
            return call(nativeIterator, this);
          };
        }
      }
      if (DEFAULT) {
        methods = {
          values: getIterationMethod(VALUES),
          keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
          entries: getIterationMethod(ENTRIES)
        };
        if (FORCED) for (KEY in methods) {
          if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
            defineBuiltIn(IterablePrototype, KEY, methods[KEY]);
          }
        }
        else $2({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
      }
      if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) {
        defineBuiltIn(IterablePrototype, ITERATOR, defaultIterator, { name: DEFAULT });
      }
      Iterators[NAME] = defaultIterator;
      return methods;
    };
  }
});

// node_modules/core-js-pure/internals/create-iter-result-object.js
var require_create_iter_result_object = __commonJS({
  "node_modules/core-js-pure/internals/create-iter-result-object.js"(exports, module2) {
    "use strict";
    module2.exports = function(value, done) {
      return { value, done };
    };
  }
});

// node_modules/core-js-pure/modules/es.array.iterator.js
var require_es_array_iterator = __commonJS({
  "node_modules/core-js-pure/modules/es.array.iterator.js"(exports, module2) {
    "use strict";
    var toIndexedObject = require_to_indexed_object();
    var addToUnscopables = require_add_to_unscopables();
    var Iterators = require_iterators();
    var InternalStateModule = require_internal_state();
    var defineProperty = require_object_define_property().f;
    var defineIterator = require_iterator_define();
    var createIterResultObject = require_create_iter_result_object();
    var IS_PURE = require_is_pure();
    var DESCRIPTORS = require_descriptors();
    var ARRAY_ITERATOR = "Array Iterator";
    var setInternalState = InternalStateModule.set;
    var getInternalState = InternalStateModule.getterFor(ARRAY_ITERATOR);
    module2.exports = defineIterator(Array, "Array", function(iterated, kind) {
      setInternalState(this, {
        type: ARRAY_ITERATOR,
        target: toIndexedObject(iterated),
        // target
        index: 0,
        // next index
        kind
        // kind
      });
    }, function() {
      var state = getInternalState(this);
      var target = state.target;
      var index = state.index++;
      if (!target || index >= target.length) {
        state.target = null;
        return createIterResultObject(void 0, true);
      }
      switch (state.kind) {
        case "keys":
          return createIterResultObject(index, false);
        case "values":
          return createIterResultObject(target[index], false);
      }
      return createIterResultObject([index, target[index]], false);
    }, "values");
    var values = Iterators.Arguments = Iterators.Array;
    addToUnscopables("keys");
    addToUnscopables("values");
    addToUnscopables("entries");
    if (!IS_PURE && DESCRIPTORS && values.name !== "values") try {
      defineProperty(values, "name", { value: "values" });
    } catch (error) {
    }
  }
});

// node_modules/core-js-pure/internals/dom-iterables.js
var require_dom_iterables = __commonJS({
  "node_modules/core-js-pure/internals/dom-iterables.js"(exports, module2) {
    "use strict";
    module2.exports = {
      CSSRuleList: 0,
      CSSStyleDeclaration: 0,
      CSSValueList: 0,
      ClientRectList: 0,
      DOMRectList: 0,
      DOMStringList: 0,
      DOMTokenList: 1,
      DataTransferItemList: 0,
      FileList: 0,
      HTMLAllCollection: 0,
      HTMLCollection: 0,
      HTMLFormElement: 0,
      HTMLSelectElement: 0,
      MediaList: 0,
      MimeTypeArray: 0,
      NamedNodeMap: 0,
      NodeList: 1,
      PaintRequestList: 0,
      Plugin: 0,
      PluginArray: 0,
      SVGLengthList: 0,
      SVGNumberList: 0,
      SVGPathSegList: 0,
      SVGPointList: 0,
      SVGStringList: 0,
      SVGTransformList: 0,
      SourceBufferList: 0,
      StyleSheetList: 0,
      TextTrackCueList: 0,
      TextTrackList: 0,
      TouchList: 0
    };
  }
});

// node_modules/core-js-pure/modules/web.dom-collections.iterator.js
var require_web_dom_collections_iterator = __commonJS({
  "node_modules/core-js-pure/modules/web.dom-collections.iterator.js"() {
    "use strict";
    require_es_array_iterator();
    var DOMIterables = require_dom_iterables();
    var globalThis2 = require_global_this();
    var setToStringTag = require_set_to_string_tag();
    var Iterators = require_iterators();
    for (COLLECTION_NAME in DOMIterables) {
      setToStringTag(globalThis2[COLLECTION_NAME], COLLECTION_NAME);
      Iterators[COLLECTION_NAME] = Iterators.Array;
    }
    var COLLECTION_NAME;
  }
});

// node_modules/core-js-pure/stable/symbol/index.js
var require_symbol2 = __commonJS({
  "node_modules/core-js-pure/stable/symbol/index.js"(exports, module2) {
    "use strict";
    var parent = require_symbol();
    require_web_dom_collections_iterator();
    module2.exports = parent;
  }
});

// node_modules/core-js-pure/modules/esnext.function.metadata.js
var require_esnext_function_metadata = __commonJS({
  "node_modules/core-js-pure/modules/esnext.function.metadata.js"() {
    "use strict";
    var wellKnownSymbol = require_well_known_symbol();
    var defineProperty = require_object_define_property().f;
    var METADATA = wellKnownSymbol("metadata");
    var FunctionPrototype = Function.prototype;
    if (FunctionPrototype[METADATA] === void 0) {
      defineProperty(FunctionPrototype, METADATA, {
        value: null
      });
    }
  }
});

// node_modules/core-js-pure/modules/esnext.symbol.async-dispose.js
var require_esnext_symbol_async_dispose = __commonJS({
  "node_modules/core-js-pure/modules/esnext.symbol.async-dispose.js"() {
    "use strict";
    require_es_symbol_async_dispose();
  }
});

// node_modules/core-js-pure/modules/esnext.symbol.dispose.js
var require_esnext_symbol_dispose = __commonJS({
  "node_modules/core-js-pure/modules/esnext.symbol.dispose.js"() {
    "use strict";
    require_es_symbol_dispose();
  }
});

// node_modules/core-js-pure/modules/esnext.symbol.metadata.js
var require_esnext_symbol_metadata = __commonJS({
  "node_modules/core-js-pure/modules/esnext.symbol.metadata.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("metadata");
  }
});

// node_modules/core-js-pure/actual/symbol/index.js
var require_symbol3 = __commonJS({
  "node_modules/core-js-pure/actual/symbol/index.js"(exports, module2) {
    "use strict";
    var parent = require_symbol2();
    require_esnext_function_metadata();
    require_esnext_symbol_async_dispose();
    require_esnext_symbol_dispose();
    require_esnext_symbol_metadata();
    module2.exports = parent;
  }
});

// node_modules/core-js-pure/internals/symbol-is-registered.js
var require_symbol_is_registered = __commonJS({
  "node_modules/core-js-pure/internals/symbol-is-registered.js"(exports, module2) {
    "use strict";
    var getBuiltIn = require_get_built_in();
    var uncurryThis = require_function_uncurry_this();
    var Symbol2 = getBuiltIn("Symbol");
    var keyFor = Symbol2.keyFor;
    var thisSymbolValue = uncurryThis(Symbol2.prototype.valueOf);
    module2.exports = Symbol2.isRegisteredSymbol || function isRegisteredSymbol(value) {
      try {
        return keyFor(thisSymbolValue(value)) !== void 0;
      } catch (error) {
        return false;
      }
    };
  }
});

// node_modules/core-js-pure/modules/esnext.symbol.is-registered-symbol.js
var require_esnext_symbol_is_registered_symbol = __commonJS({
  "node_modules/core-js-pure/modules/esnext.symbol.is-registered-symbol.js"() {
    "use strict";
    var $2 = require_export();
    var isRegisteredSymbol = require_symbol_is_registered();
    $2({ target: "Symbol", stat: true }, {
      isRegisteredSymbol
    });
  }
});

// node_modules/core-js-pure/internals/symbol-is-well-known.js
var require_symbol_is_well_known = __commonJS({
  "node_modules/core-js-pure/internals/symbol-is-well-known.js"(exports, module2) {
    "use strict";
    var shared = require_shared();
    var getBuiltIn = require_get_built_in();
    var uncurryThis = require_function_uncurry_this();
    var isSymbol = require_is_symbol();
    var wellKnownSymbol = require_well_known_symbol();
    var Symbol2 = getBuiltIn("Symbol");
    var $isWellKnownSymbol = Symbol2.isWellKnownSymbol;
    var getOwnPropertyNames = getBuiltIn("Object", "getOwnPropertyNames");
    var thisSymbolValue = uncurryThis(Symbol2.prototype.valueOf);
    var WellKnownSymbolsStore = shared("wks");
    for (i3 = 0, symbolKeys = getOwnPropertyNames(Symbol2), symbolKeysLength = symbolKeys.length; i3 < symbolKeysLength; i3++) {
      try {
        symbolKey = symbolKeys[i3];
        if (isSymbol(Symbol2[symbolKey])) wellKnownSymbol(symbolKey);
      } catch (error) {
      }
    }
    var symbolKey;
    var i3;
    var symbolKeys;
    var symbolKeysLength;
    module2.exports = function isWellKnownSymbol(value) {
      if ($isWellKnownSymbol && $isWellKnownSymbol(value)) return true;
      try {
        var symbol = thisSymbolValue(value);
        for (var j2 = 0, keys = getOwnPropertyNames(WellKnownSymbolsStore), keysLength = keys.length; j2 < keysLength; j2++) {
          if (WellKnownSymbolsStore[keys[j2]] == symbol) return true;
        }
      } catch (error) {
      }
      return false;
    };
  }
});

// node_modules/core-js-pure/modules/esnext.symbol.is-well-known-symbol.js
var require_esnext_symbol_is_well_known_symbol = __commonJS({
  "node_modules/core-js-pure/modules/esnext.symbol.is-well-known-symbol.js"() {
    "use strict";
    var $2 = require_export();
    var isWellKnownSymbol = require_symbol_is_well_known();
    $2({ target: "Symbol", stat: true, forced: true }, {
      isWellKnownSymbol
    });
  }
});

// node_modules/core-js-pure/modules/esnext.symbol.custom-matcher.js
var require_esnext_symbol_custom_matcher = __commonJS({
  "node_modules/core-js-pure/modules/esnext.symbol.custom-matcher.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("customMatcher");
  }
});

// node_modules/core-js-pure/modules/esnext.symbol.observable.js
var require_esnext_symbol_observable = __commonJS({
  "node_modules/core-js-pure/modules/esnext.symbol.observable.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("observable");
  }
});

// node_modules/core-js-pure/modules/esnext.symbol.is-registered.js
var require_esnext_symbol_is_registered = __commonJS({
  "node_modules/core-js-pure/modules/esnext.symbol.is-registered.js"() {
    "use strict";
    var $2 = require_export();
    var isRegisteredSymbol = require_symbol_is_registered();
    $2({ target: "Symbol", stat: true, name: "isRegisteredSymbol" }, {
      isRegistered: isRegisteredSymbol
    });
  }
});

// node_modules/core-js-pure/modules/esnext.symbol.is-well-known.js
var require_esnext_symbol_is_well_known = __commonJS({
  "node_modules/core-js-pure/modules/esnext.symbol.is-well-known.js"() {
    "use strict";
    var $2 = require_export();
    var isWellKnownSymbol = require_symbol_is_well_known();
    $2({ target: "Symbol", stat: true, name: "isWellKnownSymbol", forced: true }, {
      isWellKnown: isWellKnownSymbol
    });
  }
});

// node_modules/core-js-pure/modules/esnext.symbol.matcher.js
var require_esnext_symbol_matcher = __commonJS({
  "node_modules/core-js-pure/modules/esnext.symbol.matcher.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("matcher");
  }
});

// node_modules/core-js-pure/modules/esnext.symbol.metadata-key.js
var require_esnext_symbol_metadata_key = __commonJS({
  "node_modules/core-js-pure/modules/esnext.symbol.metadata-key.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("metadataKey");
  }
});

// node_modules/core-js-pure/modules/esnext.symbol.pattern-match.js
var require_esnext_symbol_pattern_match = __commonJS({
  "node_modules/core-js-pure/modules/esnext.symbol.pattern-match.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("patternMatch");
  }
});

// node_modules/core-js-pure/modules/esnext.symbol.replace-all.js
var require_esnext_symbol_replace_all = __commonJS({
  "node_modules/core-js-pure/modules/esnext.symbol.replace-all.js"() {
    "use strict";
    var defineWellKnownSymbol = require_well_known_symbol_define();
    defineWellKnownSymbol("replaceAll");
  }
});

// node_modules/core-js-pure/full/symbol/index.js
var require_symbol4 = __commonJS({
  "node_modules/core-js-pure/full/symbol/index.js"(exports, module2) {
    "use strict";
    var parent = require_symbol3();
    require_esnext_symbol_is_registered_symbol();
    require_esnext_symbol_is_well_known_symbol();
    require_esnext_symbol_custom_matcher();
    require_esnext_symbol_observable();
    require_esnext_symbol_is_registered();
    require_esnext_symbol_is_well_known();
    require_esnext_symbol_matcher();
    require_esnext_symbol_metadata_key();
    require_esnext_symbol_pattern_match();
    require_esnext_symbol_replace_all();
    module2.exports = parent;
  }
});

// node_modules/core-js-pure/features/symbol/index.js
var require_symbol5 = __commonJS({
  "node_modules/core-js-pure/features/symbol/index.js"(exports, module2) {
    "use strict";
    module2.exports = require_symbol4();
  }
});

// node_modules/core-js-pure/internals/string-multibyte.js
var require_string_multibyte = __commonJS({
  "node_modules/core-js-pure/internals/string-multibyte.js"(exports, module2) {
    "use strict";
    var uncurryThis = require_function_uncurry_this();
    var toIntegerOrInfinity = require_to_integer_or_infinity();
    var toString = require_to_string();
    var requireObjectCoercible = require_require_object_coercible();
    var charAt = uncurryThis("".charAt);
    var charCodeAt = uncurryThis("".charCodeAt);
    var stringSlice = uncurryThis("".slice);
    var createMethod = function(CONVERT_TO_STRING) {
      return function($this, pos) {
        var S2 = toString(requireObjectCoercible($this));
        var position = toIntegerOrInfinity(pos);
        var size = S2.length;
        var first, second;
        if (position < 0 || position >= size) return CONVERT_TO_STRING ? "" : void 0;
        first = charCodeAt(S2, position);
        return first < 55296 || first > 56319 || position + 1 === size || (second = charCodeAt(S2, position + 1)) < 56320 || second > 57343 ? CONVERT_TO_STRING ? charAt(S2, position) : first : CONVERT_TO_STRING ? stringSlice(S2, position, position + 2) : (first - 55296 << 10) + (second - 56320) + 65536;
      };
    };
    module2.exports = {
      // `String.prototype.codePointAt` method
      // https://tc39.es/ecma262/#sec-string.prototype.codepointat
      codeAt: createMethod(false),
      // `String.prototype.at` method
      // https://github.com/mathiasbynens/String.prototype.at
      charAt: createMethod(true)
    };
  }
});

// node_modules/core-js-pure/modules/es.string.iterator.js
var require_es_string_iterator = __commonJS({
  "node_modules/core-js-pure/modules/es.string.iterator.js"() {
    "use strict";
    var charAt = require_string_multibyte().charAt;
    var toString = require_to_string();
    var InternalStateModule = require_internal_state();
    var defineIterator = require_iterator_define();
    var createIterResultObject = require_create_iter_result_object();
    var STRING_ITERATOR = "String Iterator";
    var setInternalState = InternalStateModule.set;
    var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);
    defineIterator(String, "String", function(iterated) {
      setInternalState(this, {
        type: STRING_ITERATOR,
        string: toString(iterated),
        index: 0
      });
    }, function next() {
      var state = getInternalState(this);
      var string = state.string;
      var index = state.index;
      var point;
      if (index >= string.length) return createIterResultObject(void 0, true);
      point = charAt(string, index);
      state.index += point.length;
      return createIterResultObject(point, false);
    });
  }
});

// node_modules/core-js-pure/es/symbol/iterator.js
var require_iterator = __commonJS({
  "node_modules/core-js-pure/es/symbol/iterator.js"(exports, module2) {
    "use strict";
    require_es_array_iterator();
    require_es_object_to_string();
    require_es_string_iterator();
    require_es_symbol_iterator();
    var WrappedWellKnownSymbolModule = require_well_known_symbol_wrapped();
    module2.exports = WrappedWellKnownSymbolModule.f("iterator");
  }
});

// node_modules/core-js-pure/stable/symbol/iterator.js
var require_iterator2 = __commonJS({
  "node_modules/core-js-pure/stable/symbol/iterator.js"(exports, module2) {
    "use strict";
    var parent = require_iterator();
    require_web_dom_collections_iterator();
    module2.exports = parent;
  }
});

// node_modules/core-js-pure/actual/symbol/iterator.js
var require_iterator3 = __commonJS({
  "node_modules/core-js-pure/actual/symbol/iterator.js"(exports, module2) {
    "use strict";
    var parent = require_iterator2();
    module2.exports = parent;
  }
});

// node_modules/core-js-pure/full/symbol/iterator.js
var require_iterator4 = __commonJS({
  "node_modules/core-js-pure/full/symbol/iterator.js"(exports, module2) {
    "use strict";
    var parent = require_iterator3();
    module2.exports = parent;
  }
});

// node_modules/core-js-pure/features/symbol/iterator.js
var require_iterator5 = __commonJS({
  "node_modules/core-js-pure/features/symbol/iterator.js"(exports, module2) {
    "use strict";
    module2.exports = require_iterator4();
  }
});

// node_modules/core-js-pure/modules/es.date.to-primitive.js
var require_es_date_to_primitive = __commonJS({
  "node_modules/core-js-pure/modules/es.date.to-primitive.js"() {
  }
});

// node_modules/core-js-pure/es/symbol/to-primitive.js
var require_to_primitive2 = __commonJS({
  "node_modules/core-js-pure/es/symbol/to-primitive.js"(exports, module2) {
    "use strict";
    require_es_date_to_primitive();
    require_es_symbol_to_primitive();
    var WrappedWellKnownSymbolModule = require_well_known_symbol_wrapped();
    module2.exports = WrappedWellKnownSymbolModule.f("toPrimitive");
  }
});

// node_modules/core-js-pure/stable/symbol/to-primitive.js
var require_to_primitive3 = __commonJS({
  "node_modules/core-js-pure/stable/symbol/to-primitive.js"(exports, module2) {
    "use strict";
    var parent = require_to_primitive2();
    module2.exports = parent;
  }
});

// node_modules/core-js-pure/actual/symbol/to-primitive.js
var require_to_primitive4 = __commonJS({
  "node_modules/core-js-pure/actual/symbol/to-primitive.js"(exports, module2) {
    "use strict";
    var parent = require_to_primitive3();
    module2.exports = parent;
  }
});

// node_modules/core-js-pure/full/symbol/to-primitive.js
var require_to_primitive5 = __commonJS({
  "node_modules/core-js-pure/full/symbol/to-primitive.js"(exports, module2) {
    "use strict";
    var parent = require_to_primitive4();
    module2.exports = parent;
  }
});

// node_modules/core-js-pure/features/symbol/to-primitive.js
var require_to_primitive6 = __commonJS({
  "node_modules/core-js-pure/features/symbol/to-primitive.js"(exports, module2) {
    "use strict";
    module2.exports = require_to_primitive5();
  }
});

// node_modules/core-js-pure/internals/whitespaces.js
var require_whitespaces = __commonJS({
  "node_modules/core-js-pure/internals/whitespaces.js"(exports, module2) {
    "use strict";
    module2.exports = "	\n\v\f\r                　\u2028\u2029\uFEFF";
  }
});

// node_modules/core-js-pure/internals/string-trim.js
var require_string_trim = __commonJS({
  "node_modules/core-js-pure/internals/string-trim.js"(exports, module2) {
    "use strict";
    var uncurryThis = require_function_uncurry_this();
    var requireObjectCoercible = require_require_object_coercible();
    var toString = require_to_string();
    var whitespaces = require_whitespaces();
    var replace = uncurryThis("".replace);
    var ltrim = RegExp("^[" + whitespaces + "]+");
    var rtrim = RegExp("(^|[^" + whitespaces + "])[" + whitespaces + "]+$");
    var createMethod = function(TYPE) {
      return function($this) {
        var string = toString(requireObjectCoercible($this));
        if (TYPE & 1) string = replace(string, ltrim, "");
        if (TYPE & 2) string = replace(string, rtrim, "$1");
        return string;
      };
    };
    module2.exports = {
      // `String.prototype.{ trimLeft, trimStart }` methods
      // https://tc39.es/ecma262/#sec-string.prototype.trimstart
      start: createMethod(1),
      // `String.prototype.{ trimRight, trimEnd }` methods
      // https://tc39.es/ecma262/#sec-string.prototype.trimend
      end: createMethod(2),
      // `String.prototype.trim` method
      // https://tc39.es/ecma262/#sec-string.prototype.trim
      trim: createMethod(3)
    };
  }
});

// node_modules/core-js-pure/internals/string-trim-forced.js
var require_string_trim_forced = __commonJS({
  "node_modules/core-js-pure/internals/string-trim-forced.js"(exports, module2) {
    "use strict";
    var PROPER_FUNCTION_NAME = require_function_name().PROPER;
    var fails = require_fails();
    var whitespaces = require_whitespaces();
    var non = "​᠎";
    module2.exports = function(METHOD_NAME) {
      return fails(function() {
        return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() !== non || PROPER_FUNCTION_NAME && whitespaces[METHOD_NAME].name !== METHOD_NAME;
      });
    };
  }
});

// node_modules/core-js-pure/modules/es.string.trim.js
var require_es_string_trim = __commonJS({
  "node_modules/core-js-pure/modules/es.string.trim.js"() {
    "use strict";
    var $2 = require_export();
    var $trim = require_string_trim().trim;
    var forcedStringTrimMethod = require_string_trim_forced();
    $2({ target: "String", proto: true, forced: forcedStringTrimMethod("trim") }, {
      trim: function trim() {
        return $trim(this);
      }
    });
  }
});

// node_modules/core-js-pure/internals/get-built-in-prototype-method.js
var require_get_built_in_prototype_method = __commonJS({
  "node_modules/core-js-pure/internals/get-built-in-prototype-method.js"(exports, module2) {
    "use strict";
    var globalThis2 = require_global_this();
    var path = require_path();
    module2.exports = function(CONSTRUCTOR, METHOD) {
      var Namespace = path[CONSTRUCTOR + "Prototype"];
      var pureMethod = Namespace && Namespace[METHOD];
      if (pureMethod) return pureMethod;
      var NativeConstructor = globalThis2[CONSTRUCTOR];
      var NativePrototype = NativeConstructor && NativeConstructor.prototype;
      return NativePrototype && NativePrototype[METHOD];
    };
  }
});

// node_modules/core-js-pure/es/string/virtual/trim.js
var require_trim = __commonJS({
  "node_modules/core-js-pure/es/string/virtual/trim.js"(exports, module2) {
    "use strict";
    require_es_string_trim();
    var getBuiltInPrototypeMethod = require_get_built_in_prototype_method();
    module2.exports = getBuiltInPrototypeMethod("String", "trim");
  }
});

// node_modules/core-js-pure/es/instance/trim.js
var require_trim2 = __commonJS({
  "node_modules/core-js-pure/es/instance/trim.js"(exports, module2) {
    "use strict";
    var isPrototypeOf = require_object_is_prototype_of();
    var method = require_trim();
    var StringPrototype = String.prototype;
    module2.exports = function(it2) {
      var own = it2.trim;
      return typeof it2 == "string" || it2 === StringPrototype || isPrototypeOf(StringPrototype, it2) && own === StringPrototype.trim ? method : own;
    };
  }
});

// node_modules/core-js-pure/stable/instance/trim.js
var require_trim3 = __commonJS({
  "node_modules/core-js-pure/stable/instance/trim.js"(exports, module2) {
    "use strict";
    var parent = require_trim2();
    module2.exports = parent;
  }
});

// node_modules/core-js-pure/actual/instance/trim.js
var require_trim4 = __commonJS({
  "node_modules/core-js-pure/actual/instance/trim.js"(exports, module2) {
    "use strict";
    var parent = require_trim3();
    module2.exports = parent;
  }
});

// node_modules/core-js-pure/full/instance/trim.js
var require_trim5 = __commonJS({
  "node_modules/core-js-pure/full/instance/trim.js"(exports, module2) {
    "use strict";
    var parent = require_trim4();
    module2.exports = parent;
  }
});

// node_modules/core-js-pure/features/instance/trim.js
var require_trim6 = __commonJS({
  "node_modules/core-js-pure/features/instance/trim.js"(exports, module2) {
    "use strict";
    module2.exports = require_trim5();
  }
});

// node_modules/@babel/runtime-corejs3/core-js/instance/trim.js
var require_trim7 = __commonJS({
  "node_modules/@babel/runtime-corejs3/core-js/instance/trim.js"(exports, module2) {
    module2.exports = require_trim6();
  }
});

// node_modules/openpgp/dist/openpgp.min.mjs
var openpgp_min_exports = {};
__export(openpgp_min_exports, {
  AEADEncryptedDataPacket: () => ia,
  CleartextMessage: () => co,
  CompressedDataPacket: () => Ys,
  GrammarError: () => js,
  LiteralDataPacket: () => Qs,
  MarkerPacket: () => fa,
  Message: () => ro,
  OnePassSignaturePacket: () => Hs,
  PacketList: () => Gs,
  PaddingPacket: () => ma,
  PrivateKey: () => Va,
  PublicKey: () => ja,
  PublicKeyEncryptedSessionKeyPacket: () => sa,
  PublicKeyPacket: () => ca,
  PublicSubkeyPacket: () => la,
  SecretKeyPacket: () => ga,
  SecretSubkeyPacket: () => Aa,
  Signature: () => ka,
  SignaturePacket: () => Ls,
  Subkey: () => Na,
  SymEncryptedIntegrityProtectedDataPacket: () => ta,
  SymEncryptedSessionKeyPacket: () => oa,
  SymmetricallyEncryptedDataPacket: () => ha,
  TrustPacket: () => wa,
  UnparseablePacket: () => ht,
  UserAttributePacket: () => ya,
  UserIDPacket: () => da,
  armor: () => ee,
  config: () => F,
  createCleartextMessage: () => ho,
  createMessage: () => ao,
  decrypt: () => wo,
  decryptKey: () => go,
  decryptSessionKeys: () => vo,
  encrypt: () => Ao,
  encryptKey: () => po,
  encryptSessionKey: () => Eo,
  enums: () => R,
  generateKey: () => fo,
  generateSessionKey: () => ko,
  readCleartextMessage: () => uo,
  readKey: () => Za,
  readKeys: () => Wa,
  readMessage: () => so,
  readPrivateKey: () => Ja,
  readPrivateKeys: () => Xa,
  readSignature: () => Ea,
  reformatKey: () => lo,
  revokeKey: () => yo,
  sign: () => mo,
  unarmor: () => $,
  verify: () => bo
});
function t(e2, t2) {
  return t2.forEach(function(t3) {
    t3 && "string" != typeof t3 && !Array.isArray(t3) && Object.keys(t3).forEach(function(r3) {
      if ("default" !== r3 && !(r3 in e2)) {
        var n3 = Object.getOwnPropertyDescriptor(t3, r3);
        Object.defineProperty(e2, r3, n3.get ? n3 : { enumerable: true, get: function() {
          return t3[r3];
        } });
      }
    });
  }), Object.freeze(e2);
}
function o2(e2) {
  return e2 && e2.getReader && Array.isArray(e2);
}
function c2(e2) {
  if (!o2(e2)) {
    const t2 = e2.getWriter(), r3 = t2.releaseLock;
    return t2.releaseLock = () => {
      t2.closed.catch(function() {
      }), r3.call(t2);
    }, t2;
  }
  this.stream = e2;
}
function u(t2) {
  if (o2(t2)) return "array";
  if (e.ReadableStream && e.ReadableStream.prototype.isPrototypeOf(t2)) return "web";
  if (t2 && !(e.ReadableStream && t2 instanceof e.ReadableStream) && "function" == typeof t2._read && "object" == typeof t2._readableState) throw Error("Native Node streams are no longer supported: please manually convert the stream to a WebStream, using e.g. `stream.Readable.toWeb`");
  return !(!t2 || !t2.getReader) && "web-like";
}
function h2(e2) {
  return Uint8Array.prototype.isPrototypeOf(e2);
}
function f(e2) {
  if (1 === e2.length) return e2[0];
  let t2 = 0;
  for (let r4 = 0; r4 < e2.length; r4++) {
    if (!h2(e2[r4])) throw Error("concatUint8Array: Data must be in the form of a Uint8Array");
    t2 += e2[r4].length;
  }
  const r3 = new Uint8Array(t2);
  let n3 = 0;
  return e2.forEach(function(e3) {
    r3.set(e3, n3), n3 += e3.length;
  }), r3;
}
function g(e2) {
  if (this.stream = e2, e2[y] && (this[y] = e2[y].slice()), o2(e2)) {
    const t3 = e2.getReader();
    return this._read = t3.read.bind(t3), this._releaseLock = () => {
    }, void (this._cancel = () => {
    });
  }
  if (u(e2)) {
    const t3 = e2.getReader();
    return this._read = t3.read.bind(t3), this._releaseLock = () => {
      t3.closed.catch(function() {
      }), t3.releaseLock();
    }, void (this._cancel = t3.cancel.bind(t3));
  }
  let t2 = false;
  this._read = async () => t2 || l.has(e2) ? { value: void 0, done: true } : (t2 = true, { value: e2, done: false }), this._releaseLock = () => {
    if (t2) try {
      l.add(e2);
    } catch {
    }
  };
}
function p(e2) {
  return u(e2) ? e2 : new ReadableStream({ start(t2) {
    t2.enqueue(e2), t2.close();
  } });
}
function d2(e2) {
  const t2 = u(e2);
  if (t2) {
    if ("array" !== t2) throw Error("Can't convert Stream to ArrayStream here, call `readToEnd` first");
    return e2;
  }
  const r3 = new a2();
  return (async () => {
    const t3 = Q(r3);
    await t3.write(e2), await t3.close();
  })(), r3;
}
function A(e2) {
  return e2.some((e3) => u(e3) && !o2(e3)) ? function(e3) {
    const t2 = e3.map(p), r3 = m(async function(e4) {
      await Promise.all(i3.map((t3) => U(t3, e4)));
    });
    let n3 = Promise.resolve();
    const i3 = t2.map((e4, i4) => v(e4, (e5, s3) => (n3 = n3.then(() => w(e5, r3.writable, { preventClose: i4 !== t2.length - 1 })), n3)));
    return r3.readable;
  }(e2) : e2.some((e3) => o2(e3)) ? function(e3) {
    const t2 = new a2();
    let r3 = Promise.resolve();
    return e3.forEach((n3, i3) => (r3 = r3.then(() => w(n3, t2, { preventClose: i3 !== e3.length - 1 })), r3)), t2;
  }(e2) : "string" == typeof e2[0] ? e2.join("") : f(e2);
}
async function w(e2, t2, { preventClose: r3 = false, preventAbort: n3 = false, preventCancel: i3 = false } = {}) {
  if (u(e2) && !o2(e2) && !o2(t2)) {
    e2 = p(e2);
    try {
      if (e2[y]) {
        const r4 = Q(t2);
        for (let t3 = 0; t3 < e2[y].length; t3++) await r4.ready, await r4.write(e2[y][t3]);
        r4.releaseLock();
      }
      await e2.pipeTo(t2, { preventClose: r3, preventAbort: n3, preventCancel: i3 });
    } catch {
    }
    return;
  }
  u(e2) || (e2 = d2(e2));
  const s3 = x(e2), a3 = Q(t2);
  try {
    for (; ; ) {
      await a3.ready;
      const { done: e3, value: t3 } = await s3.read();
      if (e3) {
        r3 || await a3.close();
        break;
      }
      await a3.write(t3);
    }
  } catch (e3) {
    n3 || await a3.abort(e3);
  } finally {
    s3.releaseLock(), a3.releaseLock();
  }
}
function m(e2) {
  let t2, r3, n3, i3 = false, s3 = false;
  return { readable: new ReadableStream({ start(e3) {
    n3 = e3;
  }, pull() {
    t2 ? t2() : i3 = true;
  }, async cancel(t3) {
    s3 = true, e2 && await e2(t3), r3 && r3(t3);
  } }, { highWaterMark: 0 }), writable: new WritableStream({ write: async function(e3) {
    if (s3) throw Error("Stream is cancelled");
    n3.enqueue(e3), i3 ? i3 = false : (await new Promise((e4, n4) => {
      t2 = e4, r3 = n4;
    }), t2 = null, r3 = null);
  }, close: n3.close.bind(n3), abort: n3.error.bind(n3) }) };
}
function b(e2, t2 = () => {
}, r3 = () => {
}, n3 = { highWaterMark: 0 }) {
  if (u(e2)) return E(e2, t2, r3, n3);
  const i3 = t2(e2), s3 = r3();
  return void 0 !== i3 && void 0 !== s3 ? A([i3, s3]) : void 0 !== i3 ? i3 : s3;
}
async function k(e2, t2 = async () => {
}, r3 = async () => {
}, n3 = { highWaterMark: 1 }) {
  if (u(e2)) return E(e2, t2, r3, n3);
  const i3 = await t2(e2), s3 = await r3();
  return void 0 !== i3 && void 0 !== s3 ? A([i3, s3]) : void 0 !== i3 ? i3 : s3;
}
function E(e2, t2, r3, n3) {
  if (o2(e2)) {
    const n4 = new a2();
    return (async () => {
      const i3 = Q(n4);
      try {
        const n5 = await D(e2), s3 = await t2(n5), a3 = await r3();
        let o3;
        o3 = void 0 !== s3 && void 0 !== a3 ? A([s3, a3]) : void 0 !== s3 ? s3 : a3, await i3.write(o3), await i3.close();
      } catch (e3) {
        await i3.abort(e3);
      }
    })(), n4;
  }
  if (u(e2)) {
    let i3, s3 = false;
    return new ReadableStream({ start() {
      i3 = e2.getReader();
    }, async pull(n4) {
      if (s3) return n4.close(), void e2.releaseLock();
      try {
        for (; ; ) {
          const { value: a3, done: o3 } = await i3.read();
          s3 = o3;
          const c3 = await (o3 ? r3 : t2)(a3);
          if (void 0 !== c3) return void n4.enqueue(c3);
          if (o3) return n4.close(), void e2.releaseLock();
        }
      } catch (e3) {
        n4.error(e3);
      }
    }, async cancel(e3) {
      await i3.cancel(e3);
    } }, n3);
  }
  throw Error("Unreachable");
}
function v(e2, t2) {
  if (u(e2) && !o2(e2)) {
    let r4;
    const n3 = new TransformStream({ start(e3) {
      r4 = e3;
    } }), i3 = w(e2, n3.writable), s3 = m(async function(e3) {
      r4.error(e3), await i3, await new Promise((e4) => setTimeout(e4));
    });
    return t2(n3.readable, s3.writable), s3.readable;
  }
  e2 = d2(e2);
  const r3 = new a2();
  return t2(e2, r3), r3;
}
function I(e2, t2) {
  let r3;
  const n3 = v(e2, (e3, i3) => {
    const s3 = x(e3);
    s3.remainder = () => (s3.releaseLock(), w(e3, i3), n3), r3 = t2(s3);
  });
  return r3;
}
function B(e2) {
  if (o2(e2)) return e2.clone();
  if (u(e2)) {
    const t2 = function(e3) {
      if (o2(e3)) throw Error("ArrayStream cannot be tee()d, use clone() instead");
      if (u(e3)) {
        const t3 = p(e3).tee();
        return t3[0][y] = t3[1][y] = e3[y], t3;
      }
      return [C(e3), C(e3)];
    }(e2);
    return K(e2, t2[0]), t2[1];
  }
  return C(e2);
}
function S(e2) {
  return o2(e2) ? B(e2) : u(e2) ? new ReadableStream({ start(t2) {
    const r3 = v(e2, async (e3, r4) => {
      const n3 = x(e3), i3 = Q(r4);
      try {
        for (; ; ) {
          await i3.ready;
          const { done: e4, value: r5 } = await n3.read();
          if (e4) {
            try {
              t2.close();
            } catch {
            }
            return void await i3.close();
          }
          try {
            t2.enqueue(r5);
          } catch {
          }
          await i3.write(r5);
        }
      } catch (e4) {
        t2.error(e4), await i3.abort(e4);
      }
    });
    K(e2, r3);
  } }) : C(e2);
}
function K(e2, t2) {
  Object.entries(Object.getOwnPropertyDescriptors(e2.constructor.prototype)).forEach(([r3, n3]) => {
    "constructor" !== r3 && (n3.value ? n3.value = n3.value.bind(t2) : n3.get = n3.get.bind(t2), Object.defineProperty(e2, r3, n3));
  });
}
function C(e2, t2 = 0, r3 = 1 / 0) {
  if (o2(e2)) throw Error("Not implemented");
  if (u(e2)) {
    if (t2 >= 0 && r3 >= 0) {
      let n3, i3 = 0;
      return new ReadableStream({ start() {
        n3 = e2.getReader();
      }, async pull(s3) {
        try {
          for (; ; ) {
            if (!(i3 < r3)) return s3.close(), void e2.releaseLock();
            {
              const { value: a3, done: o3 } = await n3.read();
              if (o3) return s3.close(), void e2.releaseLock();
              let c3;
              if (i3 + a3.length >= t2 && (c3 = C(a3, Math.max(t2 - i3, 0), r3 - i3)), i3 += a3.length, c3) return void s3.enqueue(c3);
            }
          }
        } catch (e3) {
          s3.error(e3);
        }
      }, async cancel(e3) {
        await n3.cancel(e3);
      } }, { highWaterMark: 0 });
    }
    if (t2 < 0 && (r3 < 0 || r3 === 1 / 0)) {
      let n3 = [];
      return b(e2, (e3) => {
        e3.length >= -t2 ? n3 = [e3] : n3.push(e3);
      }, () => C(A(n3), t2, r3));
    }
    if (0 === t2 && r3 < 0) {
      let n3;
      return b(e2, (e3) => {
        const i3 = n3 ? A([n3, e3]) : e3;
        if (i3.length >= -r3) return n3 = C(i3, r3), C(i3, t2, r3);
        n3 = i3;
      });
    }
    return console.warn(`stream.slice(input, ${t2}, ${r3}) not implemented efficiently.`), P(async () => C(await D(e2), t2, r3));
  }
  return e2[y] && (e2 = A(e2[y].concat([e2]))), h2(e2) ? e2.subarray(t2, r3 === 1 / 0 ? e2.length : r3) : e2.slice(t2, r3);
}
async function D(e2, t2 = A) {
  return o2(e2) ? e2.readToEnd(t2) : u(e2) ? x(e2).readToEnd(t2) : e2;
}
async function U(e2, t2) {
  if (u(e2)) {
    if (e2.cancel) {
      const r3 = await e2.cancel(t2);
      return await new Promise((e3) => setTimeout(e3)), r3;
    }
    if (e2.destroy) return e2.destroy(t2), await new Promise((e3) => setTimeout(e3)), t2;
  }
}
function P(e2) {
  const t2 = new a2();
  return (async () => {
    const r3 = Q(t2);
    try {
      await r3.write(await e2()), await r3.close();
    } catch (e3) {
      await r3.abort(e3);
    }
  })(), t2;
}
function x(e2) {
  return new g(e2);
}
function Q(e2) {
  return new c2(e2);
}
function z(e2) {
  let t2 = new Uint8Array();
  return b(e2, (e3) => {
    t2 = L.concatUint8Array([t2, e3]);
    const r3 = [], n3 = Math.floor(t2.length / 45), i3 = 45 * n3, s3 = O(t2.subarray(0, i3));
    for (let e4 = 0; e4 < n3; e4++) r3.push(s3.substr(60 * e4, 60)), r3.push("\n");
    return t2 = t2.subarray(i3), r3.join("");
  }, () => t2.length ? O(t2) + "\n" : "");
}
function G(e2) {
  let t2 = "";
  return b(e2, (e3) => {
    t2 += e3;
    let r3 = 0;
    const n3 = [" ", "	", "\r", "\n"];
    for (let e4 = 0; e4 < n3.length; e4++) {
      const i4 = n3[e4];
      for (let e5 = t2.indexOf(i4); -1 !== e5; e5 = t2.indexOf(i4, e5 + 1)) r3++;
    }
    let i3 = t2.length;
    for (; i3 > 0 && (i3 - r3) % 4 != 0; i3--) n3.includes(t2[i3]) && r3--;
    const s3 = H(t2.substr(0, i3));
    return t2 = t2.substr(i3), s3;
  }, () => H(t2));
}
function j(e2) {
  return G(e2.replace(/-/g, "+").replace(/_/g, "/"));
}
function V(e2, t2) {
  let r3 = z(e2).replace(/[\r\n]/g, "");
  return r3 = r3.replace(/[+]/g, "-").replace(/[/]/g, "_").replace(/[=]/g, ""), r3;
}
function q(e2) {
  const t2 = e2.match(/^-----BEGIN PGP (MESSAGE, PART \d+\/\d+|MESSAGE, PART \d+|SIGNED MESSAGE|MESSAGE|PUBLIC KEY BLOCK|PRIVATE KEY BLOCK|SIGNATURE)-----$/m);
  if (!t2) throw Error("Unknown ASCII armor type");
  return /MESSAGE, PART \d+\/\d+/.test(t2[1]) ? R.armor.multipartSection : /MESSAGE, PART \d+/.test(t2[1]) ? R.armor.multipartLast : /SIGNED MESSAGE/.test(t2[1]) ? R.armor.signed : /MESSAGE/.test(t2[1]) ? R.armor.message : /PUBLIC KEY BLOCK/.test(t2[1]) ? R.armor.publicKey : /PRIVATE KEY BLOCK/.test(t2[1]) ? R.armor.privateKey : /SIGNATURE/.test(t2[1]) ? R.armor.signature : void 0;
}
function _(e2, t2) {
  let r3 = "";
  return t2.showVersion && (r3 += "Version: " + t2.versionString + "\n"), t2.showComment && (r3 += "Comment: " + t2.commentString + "\n"), e2 && (r3 += "Comment: " + e2 + "\n"), r3 += "\n", r3;
}
function Y(e2) {
  const t2 = function(e3) {
    let t3 = 13501623;
    return b(e3, (e4) => {
      const r3 = J ? Math.floor(e4.length / 4) : 0, n3 = new Uint32Array(e4.buffer, e4.byteOffset, r3);
      for (let e5 = 0; e5 < r3; e5++) t3 ^= n3[e5], t3 = Z[0][t3 >> 24 & 255] ^ Z[1][t3 >> 16 & 255] ^ Z[2][t3 >> 8 & 255] ^ Z[3][255 & t3];
      for (let n4 = 4 * r3; n4 < e4.length; n4++) t3 = t3 >> 8 ^ Z[0][255 & t3 ^ e4[n4]];
    }, () => new Uint8Array([t3, t3 >> 8, t3 >> 16]));
  }(e2);
  return z(t2);
}
function W(e2) {
  for (let t2 = 0; t2 < e2.length; t2++) /^([^\s:]|[^\s:][^:]*[^\s:]): .+$/.test(e2[t2]) || L.printDebugError(Error("Improperly formatted armor header: " + e2[t2])), /^(Version|Comment|MessageID|Hash|Charset): .+$/.test(e2[t2]) || L.printDebugError(Error("Unknown header: " + e2[t2]));
}
function X(e2) {
  let t2 = e2;
  const r3 = e2.lastIndexOf("=");
  return r3 >= 0 && r3 !== e2.length - 1 && (t2 = e2.slice(0, r3)), t2;
}
function $(e2) {
  return new Promise((t2, r3) => {
    try {
      const n3 = /^-----[^-]+-----$/m, i3 = /^[ \f\r\t\u00a0\u2000-\u200a\u202f\u205f\u3000]*$/;
      let s3;
      const a3 = [];
      let o3, c3, u2 = a3, h4 = [];
      const f2 = G(v(e2, async (e3, l2) => {
        const y2 = x(e3);
        try {
          for (; ; ) {
            let e4 = await y2.readLine();
            if (void 0 === e4) throw Error("Misformed armored text");
            if (e4 = L.removeTrailingSpaces(e4.replace(/[\r\n]/g, "")), s3) if (o3) c3 || s3 !== R.armor.signed || (n3.test(e4) ? (h4 = h4.join("\r\n"), c3 = true, W(u2), u2 = [], o3 = false) : h4.push(e4.replace(/^- /, "")));
            else if (n3.test(e4) && r3(Error("Mandatory blank line missing between armor headers and armor data")), i3.test(e4)) {
              if (W(u2), o3 = true, c3 || s3 !== R.armor.signed) {
                t2({ text: h4, data: f2, headers: a3, type: s3 });
                break;
              }
            } else u2.push(e4);
            else n3.test(e4) && (s3 = q(e4));
          }
        } catch (e4) {
          return void r3(e4);
        }
        const g2 = Q(l2);
        try {
          for (; ; ) {
            await g2.ready;
            const { done: e4, value: t3 } = await y2.read();
            if (e4) throw Error("Misformed armored text");
            const r4 = t3 + "";
            if (-1 !== r4.indexOf("=") || -1 !== r4.indexOf("-")) {
              let e5 = await y2.readToEnd();
              e5.length || (e5 = ""), e5 = r4 + e5, e5 = L.removeTrailingSpaces(e5.replace(/\r/g, ""));
              const t4 = e5.split(n3);
              if (1 === t4.length) throw Error("Misformed armored text");
              const i4 = X(t4[0].slice(0, -1));
              await g2.write(i4);
              break;
            }
            await g2.write(r4);
          }
          await g2.ready, await g2.close();
        } catch (e4) {
          await g2.abort(e4);
        }
      }));
    } catch (e3) {
      r3(e3);
    }
  }).then(async (e3) => (o2(e3.data) && (e3.data = await D(e3.data)), e3));
}
function ee(e2, t2, r3, n3, i3, s3 = false, a3 = F) {
  let o3, c3;
  e2 === R.armor.signed && (o3 = t2.text, c3 = t2.hash, t2 = t2.data);
  const u2 = s3 && S(t2), h4 = [];
  switch (e2) {
    case R.armor.multipartSection:
      h4.push("-----BEGIN PGP MESSAGE, PART " + r3 + "/" + n3 + "-----\n"), h4.push(_(i3, a3)), h4.push(z(t2)), u2 && h4.push("=", Y(u2)), h4.push("-----END PGP MESSAGE, PART " + r3 + "/" + n3 + "-----\n");
      break;
    case R.armor.multipartLast:
      h4.push("-----BEGIN PGP MESSAGE, PART " + r3 + "-----\n"), h4.push(_(i3, a3)), h4.push(z(t2)), u2 && h4.push("=", Y(u2)), h4.push("-----END PGP MESSAGE, PART " + r3 + "-----\n");
      break;
    case R.armor.signed:
      h4.push("-----BEGIN PGP SIGNED MESSAGE-----\n"), h4.push(c3 ? `Hash: ${c3}

` : "\n"), h4.push(o3.replace(/^-/gm, "- -")), h4.push("\n-----BEGIN PGP SIGNATURE-----\n"), h4.push(_(i3, a3)), h4.push(z(t2)), u2 && h4.push("=", Y(u2)), h4.push("-----END PGP SIGNATURE-----\n");
      break;
    case R.armor.message:
      h4.push("-----BEGIN PGP MESSAGE-----\n"), h4.push(_(i3, a3)), h4.push(z(t2)), u2 && h4.push("=", Y(u2)), h4.push("-----END PGP MESSAGE-----\n");
      break;
    case R.armor.publicKey:
      h4.push("-----BEGIN PGP PUBLIC KEY BLOCK-----\n"), h4.push(_(i3, a3)), h4.push(z(t2)), u2 && h4.push("=", Y(u2)), h4.push("-----END PGP PUBLIC KEY BLOCK-----\n");
      break;
    case R.armor.privateKey:
      h4.push("-----BEGIN PGP PRIVATE KEY BLOCK-----\n"), h4.push(_(i3, a3)), h4.push(z(t2)), u2 && h4.push("=", Y(u2)), h4.push("-----END PGP PRIVATE KEY BLOCK-----\n");
      break;
    case R.armor.signature:
      h4.push("-----BEGIN PGP SIGNATURE-----\n"), h4.push(_(i3, a3)), h4.push(z(t2)), u2 && h4.push("=", Y(u2)), h4.push("-----END PGP SIGNATURE-----\n");
  }
  return L.concat(h4);
}
function ne(e2) {
  const t2 = "0123456789ABCDEF";
  let r3 = "";
  return e2.forEach((e3) => {
    r3 += t2[e3 >> 4] + t2[15 & e3];
  }), BigInt("0x0" + r3);
}
function ie(e2, t2) {
  const r3 = e2 % t2;
  return r3 < te ? r3 + t2 : r3;
}
function se(e2, t2, r3) {
  const n3 = -e2;
  return t2 & n3 | r3 & ~n3;
}
function ae(e2, t2, r3) {
  if (r3 === te) throw Error("Modulo cannot be zero");
  if (r3 === re) return BigInt(0);
  if (t2 < te) throw Error("Unsopported negative exponent");
  let n3 = t2, i3 = e2;
  i3 %= r3;
  let s3 = BigInt(1);
  for (; n3 > te; ) {
    const e3 = n3 & re;
    n3 >>= re;
    s3 = se(e3, s3 * i3 % r3, s3), i3 = i3 * i3 % r3;
  }
  return s3;
}
function oe(e2) {
  return e2 >= te ? e2 : -e2;
}
function ce(e2, t2) {
  const { gcd: r3, x: n3 } = function(e3, t3) {
    let r4 = BigInt(0), n4 = BigInt(1), i3 = BigInt(1), s3 = BigInt(0), a3 = oe(e3), o3 = oe(t3);
    const c3 = e3 < te, u2 = t3 < te;
    for (; o3 !== te; ) {
      const e4 = a3 / o3;
      let t4 = r4;
      r4 = i3 - e4 * r4, i3 = t4, t4 = n4, n4 = s3 - e4 * n4, s3 = t4, t4 = o3, o3 = a3 % o3, a3 = t4;
    }
    return { x: c3 ? -i3 : i3, y: u2 ? -s3 : s3, gcd: a3 };
  }(e2, t2);
  if (r3 !== re) throw Error("Inverse does not exist");
  return ie(n3 + t2, t2);
}
function ue(e2) {
  const t2 = Number(e2);
  if (t2 > Number.MAX_SAFE_INTEGER) throw Error("Number can only safely store up to 53 bits");
  return t2;
}
function he(e2, t2) {
  return (e2 >> BigInt(t2) & re) === te ? 0 : 1;
}
function fe(e2) {
  const t2 = e2 < te ? BigInt(-1) : te;
  let r3 = 1, n3 = e2;
  for (; (n3 >>= re) !== t2; ) r3++;
  return r3;
}
function le(e2) {
  const t2 = e2 < te ? BigInt(-1) : te, r3 = BigInt(8);
  let n3 = 1, i3 = e2;
  for (; (i3 >>= r3) !== t2; ) n3++;
  return n3;
}
function ye(e2, t2 = "be", r3) {
  let n3 = e2.toString(16);
  n3.length % 2 == 1 && (n3 = "0" + n3);
  const i3 = n3.length / 2, s3 = new Uint8Array(r3 || i3), a3 = r3 ? r3 - i3 : 0;
  let o3 = 0;
  for (; o3 < i3; ) s3[o3 + a3] = parseInt(n3.slice(2 * o3, 2 * o3 + 2), 16), o3++;
  return "be" !== t2 && s3.reverse(), s3;
}
function pe(e2) {
  const t2 = "undefined" != typeof crypto ? crypto : ge?.webcrypto;
  if (t2?.getRandomValues) {
    const r3 = new Uint8Array(e2);
    return t2.getRandomValues(r3);
  }
  throw Error("No secure random number generator available.");
}
function de(e2, t2) {
  if (t2 < e2) throw Error("Illegal parameter value: max <= min");
  const r3 = t2 - e2;
  return ie(ne(pe(le(r3) + 8)), r3) + e2;
}
function we(e2, t2, r3) {
  const n3 = BigInt(30), i3 = Ae << BigInt(e2 - 1), s3 = [1, 6, 5, 4, 3, 2, 1, 4, 3, 2, 1, 2, 1, 4, 3, 2, 1, 2, 1, 4, 3, 2, 1, 6, 5, 4, 3, 2, 1, 2];
  let a3 = de(i3, i3 << Ae), o3 = ue(ie(a3, n3));
  do {
    a3 += BigInt(s3[o3]), o3 = (o3 + s3[o3]) % s3.length, fe(a3) > e2 && (a3 = ie(a3, i3 << Ae), a3 += i3, o3 = ue(ie(a3, n3)));
  } while (!me(a3, t2, r3));
  return a3;
}
function me(e2, t2, r3) {
  return (!t2 || function(e3, t3) {
    let r4 = e3, n3 = t3;
    for (; n3 !== te; ) {
      const e4 = n3;
      n3 = r4 % n3, r4 = e4;
    }
    return r4;
  }(e2 - Ae, t2) === Ae) && (!!function(e3) {
    const t3 = BigInt(0);
    return be.every((r4) => ie(e3, r4) !== t3);
  }(e2) && (!!function(e3, t3 = BigInt(2)) {
    return ae(t3, e3 - Ae, e3) === Ae;
  }(e2) && !!function(e3, t3) {
    const r4 = fe(e3);
    t3 || (t3 = Math.max(1, r4 / 48 | 0));
    const n3 = e3 - Ae;
    let i3 = 0;
    for (; !he(n3, i3); ) i3++;
    const s3 = e3 >> BigInt(i3);
    for (; t3 > 0; t3--) {
      let t4, r5 = ae(de(BigInt(2), n3), s3, e3);
      if (r5 !== Ae && r5 !== n3) {
        for (t4 = 1; t4 < i3; t4++) {
          if (r5 = ie(r5 * r5, e3), r5 === Ae) return false;
          if (r5 === n3) break;
        }
        if (t4 === i3) return false;
      }
    }
    return true;
  }(e2, r3)));
}
function Ie(e2) {
  if (Ee && ve.includes(e2)) return async function(t2) {
    const r3 = Ee.createHash(e2);
    return b(t2, (e3) => {
      r3.update(e3);
    }, () => new Uint8Array(r3.digest()));
  };
}
function Be(e2, t2) {
  const r3 = async () => {
    const { nobleHashes: t3 } = await Promise.resolve().then(function() {
      return fl;
    }), r4 = t3.get(e2);
    if (!r4) throw Error("Unsupported hash");
    return r4;
  };
  return async function(e3) {
    if (o2(e3) && (e3 = await D(e3)), L.isStream(e3)) {
      const t3 = (await r3()).create();
      return b(e3, (e4) => {
        t3.update(e4);
      }, () => t3.digest());
    }
    if (ke && t2) return new Uint8Array(await ke.digest(t2, e3));
    return (await r3())(e3);
  };
}
function Re(e2, t2) {
  switch (e2) {
    case R.hash.md5:
      return Se(t2);
    case R.hash.sha1:
      return Ke(t2);
    case R.hash.ripemd:
      return xe(t2);
    case R.hash.sha256:
      return De(t2);
    case R.hash.sha384:
      return Ue(t2);
    case R.hash.sha512:
      return Pe(t2);
    case R.hash.sha224:
      return Ce(t2);
    case R.hash.sha3_256:
      return Qe(t2);
    case R.hash.sha3_512:
      return Me(t2);
    default:
      throw Error("Unsupported hash function");
  }
}
function Fe(e2) {
  switch (e2) {
    case R.hash.md5:
      return 16;
    case R.hash.sha1:
    case R.hash.ripemd:
      return 20;
    case R.hash.sha256:
      return 32;
    case R.hash.sha384:
      return 48;
    case R.hash.sha512:
      return 64;
    case R.hash.sha224:
      return 28;
    case R.hash.sha3_256:
      return 32;
    case R.hash.sha3_512:
      return 64;
    default:
      throw Error("Invalid hash algorithm.");
  }
}
function Le(e2, t2) {
  const r3 = e2.length;
  if (r3 > t2 - 11) throw Error("Message too long");
  const n3 = function(e3) {
    const t3 = new Uint8Array(e3);
    let r4 = 0;
    for (; r4 < e3; ) {
      const n4 = pe(e3 - r4);
      for (let e4 = 0; e4 < n4.length; e4++) 0 !== n4[e4] && (t3[r4++] = n4[e4]);
    }
    return t3;
  }(t2 - r3 - 3), i3 = new Uint8Array(t2);
  return i3[1] = 2, i3.set(n3, 2), i3.set(e2, t2 - r3), i3;
}
function Ne(e2, t2) {
  let r3 = 2, n3 = 1;
  for (let t3 = r3; t3 < e2.length; t3++) n3 &= 0 !== e2[t3], r3 += n3;
  const i3 = r3 - 2, s3 = e2.subarray(r3 + 1), a3 = 0 === e2[0] & 2 === e2[1] & i3 >= 8 & !n3;
  if (t2) return L.selectUint8Array(a3, s3, t2);
  if (a3) return s3;
  throw Error("Decryption error");
}
function Oe(e2, t2, r3) {
  let n3;
  if (t2.length !== Fe(e2)) throw Error("Invalid hash length");
  const i3 = new Uint8Array(Te[e2].length);
  for (n3 = 0; n3 < Te[e2].length; n3++) i3[n3] = Te[e2][n3];
  const s3 = i3.length + t2.length;
  if (r3 < s3 + 11) throw Error("Intended encoded message length too short");
  const a3 = new Uint8Array(r3 - s3 - 3).fill(255), o3 = new Uint8Array(r3);
  return o3[1] = 1, o3.set(a3, 2), o3.set(i3, r3 - s3), o3.set(t2, r3 - t2.length), o3;
}
async function je(e2, t2, r3, n3, i3, s3, a3, o3, c3) {
  if (Fe(e2) >= r3.length) throw Error("Digest size cannot exceed key modulus size");
  if (t2 && !L.isStream(t2)) {
    if (L.getWebCrypto()) try {
      return await async function(e3, t3, r4, n4, i4, s4, a4, o4) {
        const c4 = Ye(r4, n4, i4, s4, a4, o4), u2 = { name: "RSASSA-PKCS1-v1_5", hash: { name: e3 } }, h4 = await He.importKey("jwk", c4, u2, false, ["sign"]);
        return new Uint8Array(await He.sign("RSASSA-PKCS1-v1_5", h4, t3));
      }(R.read(R.webHash, e2), t2, r3, n3, i3, s3, a3, o3);
    } catch (e3) {
      L.printDebugError(e3);
    }
    else if (L.getNodeCrypto()) return function(e3, t3, r4, n4, i4, s4, a4, o4) {
      const c4 = ze.createSign(R.read(R.hash, e3));
      c4.write(t3), c4.end();
      const u2 = Ye(r4, n4, i4, s4, a4, o4);
      return new Uint8Array(c4.sign({ key: u2, format: "jwk", type: "pkcs1" }));
    }(e2, t2, r3, n3, i3, s3, a3, o3);
  }
  return function(e3, t3, r4, n4) {
    t3 = ne(t3);
    const i4 = ne(Oe(e3, n4, le(t3)));
    return r4 = ne(r4), ye(ae(i4, r4, t3), "be", le(t3));
  }(e2, r3, i3, c3);
}
async function Ve(e2, t2, r3, n3, i3, s3) {
  if (t2 && !L.isStream(t2)) {
    if (L.getWebCrypto()) try {
      return await async function(e3, t3, r4, n4, i4) {
        const s4 = Ze(n4, i4), a3 = await He.importKey("jwk", s4, { name: "RSASSA-PKCS1-v1_5", hash: { name: e3 } }, false, ["verify"]);
        return He.verify("RSASSA-PKCS1-v1_5", a3, r4, t3);
      }(R.read(R.webHash, e2), t2, r3, n3, i3);
    } catch (e3) {
      L.printDebugError(e3);
    }
    else if (L.getNodeCrypto()) return function(e3, t3, r4, n4, i4) {
      const s4 = Ze(n4, i4), a3 = { key: s4, format: "jwk", type: "pkcs1" }, o3 = ze.createVerify(R.read(R.hash, e3));
      o3.write(t3), o3.end();
      try {
        return o3.verify(a3, r4);
      } catch {
        return false;
      }
    }(e2, t2, r3, n3, i3);
  }
  return function(e3, t3, r4, n4, i4) {
    if (r4 = ne(r4), t3 = ne(t3), n4 = ne(n4), t3 >= r4) throw Error("Signature size cannot exceed modulus size");
    const s4 = ye(ae(t3, n4, r4), "be", le(r4)), a3 = Oe(e3, i4, le(r4));
    return L.equalsUint8Array(s4, a3);
  }(e2, r3, n3, i3, s3);
}
async function qe(e2, t2, r3) {
  return L.getNodeCrypto() ? function(e3, t3, r4) {
    const n3 = Ze(t3, r4), i3 = { key: n3, format: "jwk", type: "pkcs1", padding: ze.constants.RSA_PKCS1_PADDING };
    return new Uint8Array(ze.publicEncrypt(i3, e3));
  }(e2, t2, r3) : function(e3, t3, r4) {
    if (t3 = ne(t3), e3 = ne(Le(e3, le(t3))), r4 = ne(r4), e3 >= t3) throw Error("Message size cannot exceed modulus size");
    return ye(ae(e3, r4, t3), "be", le(t3));
  }(e2, t2, r3);
}
async function _e(e2, t2, r3, n3, i3, s3, a3, o3) {
  if (L.getNodeCrypto() && !o3) try {
    return function(e3, t3, r4, n4, i4, s4, a4) {
      const o4 = Ye(t3, r4, n4, i4, s4, a4), c3 = { key: o4, format: "jwk", type: "pkcs1", padding: ze.constants.RSA_PKCS1_PADDING };
      try {
        return new Uint8Array(ze.privateDecrypt(c3, e3));
      } catch {
        throw Error("Decryption error");
      }
    }(e2, t2, r3, n3, i3, s3, a3);
  } catch (e3) {
    L.printDebugError(e3);
  }
  return function(e3, t3, r4, n4, i4, s4, a4, o4) {
    if (e3 = ne(e3), t3 = ne(t3), r4 = ne(r4), n4 = ne(n4), i4 = ne(i4), s4 = ne(s4), a4 = ne(a4), e3 >= t3) throw Error("Data too large.");
    const c3 = ie(n4, s4 - Ge), u2 = ie(n4, i4 - Ge), h4 = de(BigInt(2), t3), f2 = ae(ce(h4, t3), r4, t3);
    e3 = ie(e3 * f2, t3);
    const l2 = ae(e3, u2, i4), y2 = ae(e3, c3, s4), g2 = ie(a4 * (y2 - l2), s4);
    let p2 = g2 * i4 + l2;
    return p2 = ie(p2 * h4, t3), Ne(ye(p2, "be", le(t3)), o4);
  }(e2, t2, r3, n3, i3, s3, a3, o3);
}
function Ye(e2, t2, r3, n3, i3, s3) {
  const a3 = ne(n3), o3 = ne(i3), c3 = ne(r3);
  let u2 = ie(c3, o3 - Ge), h4 = ie(c3, a3 - Ge);
  return h4 = ye(h4), u2 = ye(u2), { kty: "RSA", n: V(e2), e: V(t2), d: V(r3), p: V(i3), q: V(n3), dp: V(u2), dq: V(h4), qi: V(s3), ext: true };
}
function Ze(e2, t2) {
  return { kty: "RSA", n: V(e2), e: V(t2), ext: true };
}
function Je(e2, t2) {
  return { n: j(e2.n), e: ye(t2), d: j(e2.d), p: j(e2.q), q: j(e2.p), u: j(e2.qi) };
}
function et(e2) {
  let t2, r3 = 0;
  const n3 = e2[0];
  return n3 < 192 ? ([r3] = e2, t2 = 1) : n3 < 255 ? (r3 = (e2[0] - 192 << 8) + e2[1] + 192, t2 = 2) : 255 === n3 && (r3 = L.readNumber(e2.subarray(1, 5)), t2 = 5), { len: r3, offset: t2 };
}
function tt(e2) {
  return e2 < 192 ? new Uint8Array([e2]) : e2 > 191 && e2 < 8384 ? new Uint8Array([192 + (e2 - 192 >> 8), e2 - 192 & 255]) : L.concatUint8Array([new Uint8Array([255]), L.writeNumber(e2, 4)]);
}
function rt(e2) {
  if (e2 < 0 || e2 > 30) throw Error("Partial Length power must be between 1 and 30");
  return new Uint8Array([224 + e2]);
}
function nt(e2) {
  return new Uint8Array([192 | e2]);
}
function it(e2, t2) {
  return L.concatUint8Array([nt(e2), tt(t2)]);
}
function st(e2) {
  return [R.packet.literalData, R.packet.compressedData, R.packet.symmetricallyEncryptedData, R.packet.symEncryptedIntegrityProtectedData, R.packet.aeadEncryptedData].includes(e2);
}
async function at(e2, t2, r3) {
  let n3, i3;
  try {
    const s3 = await e2.peekBytes(2);
    if (!s3 || s3.length < 2 || !(128 & s3[0])) throw Error("Error during parsing. This message / key probably does not conform to a valid OpenPGP format.");
    const o3 = await e2.readByte();
    let c3, u2, h4 = -1, f2 = -1;
    f2 = 0, 64 & o3 && (f2 = 1), f2 ? h4 = 63 & o3 : (h4 = (63 & o3) >> 2, u2 = 3 & o3);
    const l2 = st(h4);
    let y2, g2 = null;
    if (t2 && l2) {
      if ("array" === t2) {
        const e3 = new a2();
        n3 = Q(e3), g2 = e3;
      } else {
        const e3 = new TransformStream();
        n3 = Q(e3.writable), g2 = e3.readable;
      }
      i3 = r3({ tag: h4, packet: g2 });
    } else g2 = [];
    do {
      if (f2) {
        const t3 = await e2.readByte();
        if (y2 = false, t3 < 192) c3 = t3;
        else if (t3 >= 192 && t3 < 224) c3 = (t3 - 192 << 8) + await e2.readByte() + 192;
        else if (t3 > 223 && t3 < 255) {
          if (c3 = 1 << (31 & t3), y2 = true, !l2) throw new TypeError("This packet type does not support partial lengths.");
        } else c3 = await e2.readByte() << 24 | await e2.readByte() << 16 | await e2.readByte() << 8 | await e2.readByte();
      } else switch (u2) {
        case 0:
          c3 = await e2.readByte();
          break;
        case 1:
          c3 = await e2.readByte() << 8 | await e2.readByte();
          break;
        case 2:
          c3 = await e2.readByte() << 24 | await e2.readByte() << 16 | await e2.readByte() << 8 | await e2.readByte();
          break;
        default:
          c3 = 1 / 0;
      }
      if (c3 > 0) {
        let t3 = 0;
        for (; ; ) {
          n3 && await n3.ready;
          const { done: r4, value: i4 } = await e2.read();
          if (r4) {
            if (c3 === 1 / 0) break;
            throw Error("Unexpected end of packet");
          }
          const s4 = c3 === 1 / 0 ? i4 : i4.subarray(0, c3 - t3);
          if (n3 ? await n3.write(s4) : g2.push(s4), t3 += i4.length, t3 >= c3) {
            e2.unshift(i4.subarray(c3 - t3 + i4.length));
            break;
          }
        }
      }
    } while (y2);
    n3 ? (await n3.ready, await n3.close()) : (g2 = L.concatUint8Array(g2), await r3({ tag: h4, packet: g2 }));
  } catch (e3) {
    if (n3) return await n3.abort(e3), true;
    throw e3;
  } finally {
    n3 && await i3;
  }
}
async function ft(e2) {
  switch (e2) {
    case R.publicKey.ed25519:
      try {
        const e3 = L.getWebCrypto(), t2 = await e3.generateKey("Ed25519", true, ["sign", "verify"]).catch((e4) => {
          if ("OperationError" === e4.name) {
            const e5 = Error("Unexpected key generation issue");
            throw e5.name = "NotSupportedError", e5;
          }
          throw e4;
        }), r3 = await e3.exportKey("jwk", t2.privateKey), n3 = await e3.exportKey("jwk", t2.publicKey);
        return { A: new Uint8Array(j(n3.x)), seed: j(r3.d) };
      } catch (t2) {
        if ("NotSupportedError" !== t2.name) throw t2;
        const { default: r3 } = await Promise.resolve().then(function() {
          return ry;
        }), n3 = pe(pt(e2)), { publicKey: i3 } = r3.sign.keyPair.fromSeed(n3);
        return { A: i3, seed: n3 };
      }
    case R.publicKey.ed448: {
      const e3 = await L.getNobleCurve(R.publicKey.ed448), { secretKey: t2, publicKey: r3 } = e3.keygen();
      return { A: r3, seed: t2 };
    }
    default:
      throw Error("Unsupported EdDSA algorithm");
  }
}
async function lt(e2, t2, r3, n3, i3, s3) {
  if (Fe(t2) < Fe(dt(e2))) throw Error("Hash algorithm too weak for EdDSA.");
  switch (e2) {
    case R.publicKey.ed25519:
      try {
        const t3 = L.getWebCrypto(), r4 = wt(e2, n3, i3), a3 = await t3.importKey("jwk", r4, "Ed25519", false, ["sign"]);
        return { RS: new Uint8Array(await t3.sign("Ed25519", a3, s3)) };
      } catch (e3) {
        if ("NotSupportedError" !== e3.name) throw e3;
        const { default: t3 } = await Promise.resolve().then(function() {
          return ry;
        }), r4 = L.concatUint8Array([i3, n3]);
        return { RS: t3.sign.detached(s3, r4) };
      }
    case R.publicKey.ed448:
      return { RS: (await L.getNobleCurve(R.publicKey.ed448)).sign(s3, i3) };
    default:
      throw Error("Unsupported EdDSA algorithm");
  }
}
async function yt(e2, t2, { RS: r3 }, n3, i3, s3) {
  if (Fe(t2) < Fe(dt(e2))) throw Error("Hash algorithm too weak for EdDSA.");
  switch (e2) {
    case R.publicKey.ed25519:
      try {
        const t3 = L.getWebCrypto(), n4 = At(e2, i3), a3 = await t3.importKey("jwk", n4, "Ed25519", false, ["verify"]);
        return await t3.verify("Ed25519", a3, r3, s3);
      } catch (e3) {
        if ("NotSupportedError" !== e3.name) throw e3;
        const { default: t3 } = await Promise.resolve().then(function() {
          return ry;
        });
        return t3.sign.detached.verify(s3, r3, i3);
      }
    case R.publicKey.ed448:
      return (await L.getNobleCurve(R.publicKey.ed448)).verify(r3, s3, i3);
    default:
      throw Error("Unsupported EdDSA algorithm");
  }
}
async function gt(e2, t2, r3) {
  switch (e2) {
    case R.publicKey.ed25519:
      try {
        const n3 = L.getWebCrypto(), i3 = wt(e2, t2, r3), s3 = At(e2, t2), a3 = await n3.importKey("jwk", i3, "Ed25519", false, ["sign"]), o3 = await n3.importKey("jwk", s3, "Ed25519", false, ["verify"]), c3 = pe(8), u2 = new Uint8Array(await n3.sign("Ed25519", a3, c3));
        return await n3.verify("Ed25519", o3, u2, c3);
      } catch (e3) {
        if ("NotSupportedError" !== e3.name) return false;
        const { default: n3 } = await Promise.resolve().then(function() {
          return ry;
        }), { publicKey: i3 } = n3.sign.keyPair.fromSeed(r3);
        return L.equalsUint8Array(t2, i3);
      }
    case R.publicKey.ed448: {
      const e3 = (await L.getNobleCurve(R.publicKey.ed448)).getPublicKey(r3);
      return L.equalsUint8Array(t2, e3);
    }
    default:
      return false;
  }
}
function pt(e2) {
  switch (e2) {
    case R.publicKey.ed25519:
      return 32;
    case R.publicKey.ed448:
      return 57;
    default:
      throw Error("Unsupported EdDSA algorithm");
  }
}
function dt(e2) {
  switch (e2) {
    case R.publicKey.ed25519:
      return R.hash.sha256;
    case R.publicKey.ed448:
      return R.hash.sha512;
    default:
      throw Error("Unknown EdDSA algo");
  }
}
function bt(e2) {
  return e2 instanceof Uint8Array || ArrayBuffer.isView(e2) && "Uint8Array" === e2.constructor.name;
}
function kt(e2, ...t2) {
  if (!bt(e2)) throw Error("Uint8Array expected");
  if (t2.length > 0 && !t2.includes(e2.length)) throw Error("Uint8Array expected of length " + t2 + ", got length=" + e2.length);
}
function Et(e2, t2 = true) {
  if (e2.destroyed) throw Error("Hash instance has been destroyed");
  if (t2 && e2.finished) throw Error("Hash#digest() has already been called");
}
function vt(e2, t2) {
  kt(e2);
  const r3 = t2.outputLen;
  if (e2.length < r3) throw Error("digestInto() expects output buffer of length at least " + r3);
}
function It(e2) {
  return new Uint8Array(e2.buffer, e2.byteOffset, e2.byteLength);
}
function Bt(e2) {
  return new Uint32Array(e2.buffer, e2.byteOffset, Math.floor(e2.byteLength / 4));
}
function St(...e2) {
  for (let t2 = 0; t2 < e2.length; t2++) e2[t2].fill(0);
}
function Kt(e2) {
  return new DataView(e2.buffer, e2.byteOffset, e2.byteLength);
}
function Dt(e2) {
  if ("string" == typeof e2) e2 = function(e3) {
    if ("string" != typeof e3) throw Error("string expected");
    return new Uint8Array(new TextEncoder().encode(e3));
  }(e2);
  else {
    if (!bt(e2)) throw Error("Uint8Array expected, got " + typeof e2);
    e2 = Tt(e2);
  }
  return e2;
}
function Ut(e2, t2) {
  return e2.buffer === t2.buffer && e2.byteOffset < t2.byteOffset + t2.byteLength && t2.byteOffset < e2.byteOffset + e2.byteLength;
}
function Pt(e2, t2) {
  if (Ut(e2, t2) && e2.byteOffset < t2.byteOffset) throw Error("complex overlap of input and output is not supported");
}
function xt(e2, t2) {
  if (e2.length !== t2.length) return false;
  let r3 = 0;
  for (let n3 = 0; n3 < e2.length; n3++) r3 |= e2[n3] ^ t2[n3];
  return 0 === r3;
}
function Mt(e2, t2, r3 = true) {
  if (void 0 === t2) return new Uint8Array(e2);
  if (t2.length !== e2) throw Error("invalid output length, expected " + e2 + ", got: " + t2.length);
  if (r3 && !Ft(t2)) throw Error("invalid output, must be aligned");
  return t2;
}
function Rt(e2, t2, r3, n3) {
  if ("function" == typeof e2.setBigUint64) return e2.setBigUint64(t2, r3, n3);
  const i3 = BigInt(32), s3 = BigInt(4294967295), a3 = Number(r3 >> i3 & s3), o3 = Number(r3 & s3);
  e2.setUint32(t2 + 0, a3, n3), e2.setUint32(t2 + 4, o3, n3);
}
function Ft(e2) {
  return e2.byteOffset % 4 == 0;
}
function Tt(e2) {
  return Uint8Array.from(e2);
}
function jt(e2) {
  const t2 = (t3, r4) => e2(r4, t3.length).update(Dt(t3)).digest(), r3 = e2(new Uint8Array(16), 0);
  return t2.outputLen = r3.outputLen, t2.blockLen = r3.blockLen, t2.create = (t3, r4) => e2(t3, r4), t2;
}
function Yt(e2) {
  return e2 << 1 ^ 283 & -(e2 >> 7);
}
function Zt(e2, t2) {
  let r3 = 0;
  for (; t2 > 0; t2 >>= 1) r3 ^= e2 & -(1 & t2), e2 = Yt(e2);
  return r3;
}
function er(e2, t2) {
  if (256 !== e2.length) throw Error("Wrong sbox length");
  const r3 = new Uint32Array(256).map((r4, n4) => t2(e2[n4])), n3 = r3.map(Xt), i3 = n3.map(Xt), s3 = i3.map(Xt), a3 = new Uint32Array(65536), o3 = new Uint32Array(65536), c3 = new Uint16Array(65536);
  for (let t3 = 0; t3 < 256; t3++) for (let u2 = 0; u2 < 256; u2++) {
    const h4 = 256 * t3 + u2;
    a3[h4] = r3[t3] ^ n3[u2], o3[h4] = i3[t3] ^ s3[u2], c3[h4] = e2[t3] << 8 | e2[u2];
  }
  return { sbox: e2, sbox2: c3, T0: r3, T1: n3, T2: i3, T3: s3, T01: a3, T23: o3 };
}
function ir(e2) {
  kt(e2);
  const t2 = e2.length;
  if (![16, 24, 32].includes(t2)) throw Error("aes: invalid key size, should be 16, 24 or 32, got " + t2);
  const { sbox2: r3 } = tr, n3 = [];
  Ft(e2) || n3.push(e2 = Tt(e2));
  const i3 = Bt(e2), s3 = i3.length, a3 = (e3) => or(r3, e3, e3, e3, e3), o3 = new Uint32Array(t2 + 28);
  o3.set(i3);
  for (let e3 = s3; e3 < o3.length; e3++) {
    let t3 = o3[e3 - 1];
    e3 % s3 == 0 ? t3 = a3((c3 = t3) << 24 | c3 >>> 8) ^ nr[e3 / s3 - 1] : s3 > 6 && e3 % s3 == 4 && (t3 = a3(t3)), o3[e3] = o3[e3 - s3] ^ t3;
  }
  var c3;
  return St(...n3), o3;
}
function sr(e2) {
  const t2 = ir(e2), r3 = t2.slice(), n3 = t2.length, { sbox2: i3 } = tr, { T0: s3, T1: a3, T2: o3, T3: c3 } = rr;
  for (let e3 = 0; e3 < n3; e3 += 4) for (let i4 = 0; i4 < 4; i4++) r3[e3 + i4] = t2[n3 - e3 - 4 + i4];
  St(t2);
  for (let e3 = 4; e3 < n3 - 4; e3++) {
    const t3 = r3[e3], n4 = or(i3, t3, t3, t3, t3);
    r3[e3] = s3[255 & n4] ^ a3[n4 >>> 8 & 255] ^ o3[n4 >>> 16 & 255] ^ c3[n4 >>> 24];
  }
  return r3;
}
function ar(e2, t2, r3, n3, i3, s3) {
  return e2[r3 << 8 & 65280 | n3 >>> 8 & 255] ^ t2[i3 >>> 8 & 65280 | s3 >>> 24 & 255];
}
function or(e2, t2, r3, n3, i3) {
  return e2[255 & t2 | 65280 & r3] | e2[n3 >>> 16 & 255 | i3 >>> 16 & 65280] << 16;
}
function cr(e2, t2, r3, n3, i3) {
  const { sbox2: s3, T01: a3, T23: o3 } = tr;
  let c3 = 0;
  t2 ^= e2[c3++], r3 ^= e2[c3++], n3 ^= e2[c3++], i3 ^= e2[c3++];
  const u2 = e2.length / 4 - 2;
  for (let s4 = 0; s4 < u2; s4++) {
    const s5 = e2[c3++] ^ ar(a3, o3, t2, r3, n3, i3), u3 = e2[c3++] ^ ar(a3, o3, r3, n3, i3, t2), h4 = e2[c3++] ^ ar(a3, o3, n3, i3, t2, r3), f2 = e2[c3++] ^ ar(a3, o3, i3, t2, r3, n3);
    t2 = s5, r3 = u3, n3 = h4, i3 = f2;
  }
  return { s0: e2[c3++] ^ or(s3, t2, r3, n3, i3), s1: e2[c3++] ^ or(s3, r3, n3, i3, t2), s2: e2[c3++] ^ or(s3, n3, i3, t2, r3), s3: e2[c3++] ^ or(s3, i3, t2, r3, n3) };
}
function ur(e2, t2, r3, n3, i3) {
  const { sbox2: s3, T01: a3, T23: o3 } = rr;
  let c3 = 0;
  t2 ^= e2[c3++], r3 ^= e2[c3++], n3 ^= e2[c3++], i3 ^= e2[c3++];
  const u2 = e2.length / 4 - 2;
  for (let s4 = 0; s4 < u2; s4++) {
    const s5 = e2[c3++] ^ ar(a3, o3, t2, i3, n3, r3), u3 = e2[c3++] ^ ar(a3, o3, r3, t2, i3, n3), h4 = e2[c3++] ^ ar(a3, o3, n3, r3, t2, i3), f2 = e2[c3++] ^ ar(a3, o3, i3, n3, r3, t2);
    t2 = s5, r3 = u3, n3 = h4, i3 = f2;
  }
  return { s0: e2[c3++] ^ or(s3, t2, i3, n3, r3), s1: e2[c3++] ^ or(s3, r3, t2, i3, n3), s2: e2[c3++] ^ or(s3, n3, r3, t2, i3), s3: e2[c3++] ^ or(s3, i3, n3, r3, t2) };
}
function hr(e2, t2, r3, n3) {
  kt(t2, qt), kt(r3);
  const i3 = r3.length;
  Pt(r3, n3 = Mt(i3, n3));
  const s3 = t2, a3 = Bt(s3);
  let { s0: o3, s1: c3, s2: u2, s3: h4 } = cr(e2, a3[0], a3[1], a3[2], a3[3]);
  const f2 = Bt(r3), l2 = Bt(n3);
  for (let t3 = 0; t3 + 4 <= f2.length; t3 += 4) {
    l2[t3 + 0] = f2[t3 + 0] ^ o3, l2[t3 + 1] = f2[t3 + 1] ^ c3, l2[t3 + 2] = f2[t3 + 2] ^ u2, l2[t3 + 3] = f2[t3 + 3] ^ h4;
    let r4 = 1;
    for (let e3 = s3.length - 1; e3 >= 0; e3--) r4 = r4 + (255 & s3[e3]) | 0, s3[e3] = 255 & r4, r4 >>>= 8;
    ({ s0: o3, s1: c3, s2: u2, s3: h4 } = cr(e2, a3[0], a3[1], a3[2], a3[3]));
  }
  const y2 = qt * Math.floor(f2.length / 4);
  if (y2 < i3) {
    const e3 = new Uint32Array([o3, c3, u2, h4]), t3 = It(e3);
    for (let e4 = y2, s4 = 0; e4 < i3; e4++, s4++) n3[e4] = r3[e4] ^ t3[s4];
    St(e3);
  }
  return n3;
}
function fr(e2, t2, r3, n3, i3) {
  kt(r3, qt), kt(n3), i3 = Mt(n3.length, i3);
  const s3 = r3, a3 = Bt(s3), o3 = Kt(s3), c3 = Bt(n3), u2 = Bt(i3), h4 = t2 ? 0 : 12, f2 = n3.length;
  let l2 = o3.getUint32(h4, t2), { s0: y2, s1: g2, s2: p2, s3: d3 } = cr(e2, a3[0], a3[1], a3[2], a3[3]);
  for (let r4 = 0; r4 + 4 <= c3.length; r4 += 4) u2[r4 + 0] = c3[r4 + 0] ^ y2, u2[r4 + 1] = c3[r4 + 1] ^ g2, u2[r4 + 2] = c3[r4 + 2] ^ p2, u2[r4 + 3] = c3[r4 + 3] ^ d3, l2 = l2 + 1 >>> 0, o3.setUint32(h4, l2, t2), { s0: y2, s1: g2, s2: p2, s3: d3 } = cr(e2, a3[0], a3[1], a3[2], a3[3]);
  const A2 = qt * Math.floor(c3.length / 4);
  if (A2 < f2) {
    const e3 = new Uint32Array([y2, g2, p2, d3]), t3 = It(e3);
    for (let e4 = A2, r4 = 0; e4 < f2; e4++, r4++) i3[e4] = n3[e4] ^ t3[r4];
    St(e3);
  }
  return i3;
}
function pr(e2, t2, r3, n3, i3) {
  const s3 = i3 ? i3.length : 0, a3 = e2.create(r3, n3.length + s3);
  i3 && a3.update(i3);
  const o3 = function(e3, t3, r4) {
    const n4 = new Uint8Array(16), i4 = Kt(n4);
    return Rt(i4, 0, BigInt(t3), r4), Rt(i4, 8, BigInt(e3), r4), n4;
  }(8 * n3.length, 8 * s3, t2);
  a3.update(n3), a3.update(o3);
  const c3 = a3.digest();
  return St(o3), c3;
}
function Ar(e2) {
  return e2 instanceof Uint32Array || ArrayBuffer.isView(e2) && "Uint32Array" === e2.constructor.name;
}
function wr(e2, t2) {
  if (kt(t2, 16), !Ar(e2)) throw Error("_encryptBlock accepts result of expandKeyLE");
  const r3 = Bt(t2);
  let { s0: n3, s1: i3, s2: s3, s3: a3 } = cr(e2, r3[0], r3[1], r3[2], r3[3]);
  return r3[0] = n3, r3[1] = i3, r3[2] = s3, r3[3] = a3, t2;
}
function mr(e2, t2) {
  if (kt(t2, 16), !Ar(e2)) throw Error("_decryptBlock accepts result of expandKeyLE");
  const r3 = Bt(t2);
  let { s0: n3, s1: i3, s2: s3, s3: a3 } = ur(e2, r3[0], r3[1], r3[2], r3[3]);
  return r3[0] = n3, r3[1] = i3, r3[2] = s3, r3[3] = a3, t2;
}
async function Ir(e2) {
  switch (e2) {
    case R.symmetric.aes128:
    case R.symmetric.aes192:
    case R.symmetric.aes256:
      throw Error("Not a legacy cipher");
    case R.symmetric.cast5:
    case R.symmetric.blowfish:
    case R.symmetric.twofish:
    case R.symmetric.tripledes: {
      const { legacyCiphers: t2 } = await Promise.resolve().then(function() {
        return Ay;
      }), r3 = R.read(R.symmetric, e2), n3 = t2.get(r3);
      if (!n3) throw Error("Unsupported cipher algorithm");
      return n3;
    }
    default:
      throw Error("Unsupported cipher algorithm");
  }
}
function Br(e2) {
  switch (e2) {
    case R.symmetric.aes128:
    case R.symmetric.aes192:
    case R.symmetric.aes256:
    case R.symmetric.twofish:
      return 16;
    case R.symmetric.blowfish:
    case R.symmetric.cast5:
    case R.symmetric.tripledes:
      return 8;
    default:
      throw Error("Unsupported cipher");
  }
}
function Sr(e2) {
  switch (e2) {
    case R.symmetric.aes128:
    case R.symmetric.blowfish:
    case R.symmetric.cast5:
      return 16;
    case R.symmetric.aes192:
    case R.symmetric.tripledes:
      return 24;
    case R.symmetric.aes256:
    case R.symmetric.twofish:
      return 32;
    default:
      throw Error("Unsupported cipher");
  }
}
function Kr(e2) {
  return { keySize: Sr(e2), blockSize: Br(e2) };
}
async function Dr(e2, t2, r3) {
  const { keySize: n3 } = Kr(e2);
  if (!L.isAES(e2) || t2.length !== n3) throw Error("Unexpected algorithm or key size");
  try {
    const e3 = await Cr.importKey("raw", t2, { name: "AES-KW" }, false, ["wrapKey"]), n4 = await Cr.importKey("raw", r3, { name: "HMAC", hash: "SHA-256" }, true, ["sign"]), i3 = await Cr.wrapKey("raw", n4, e3, { name: "AES-KW" });
    return new Uint8Array(i3);
  } catch (e3) {
    if ("NotSupportedError" !== e3.name && (24 !== t2.length || "OperationError" !== e3.name)) throw e3;
    L.printDebugError("Browser did not support operation: " + e3.message);
  }
  return Er(t2).encrypt(r3);
}
async function Ur(e2, t2, r3) {
  const { keySize: n3 } = Kr(e2);
  if (!L.isAES(e2) || t2.length !== n3) throw Error("Unexpected algorithm or key size");
  let i3;
  try {
    i3 = await Cr.importKey("raw", t2, { name: "AES-KW" }, false, ["unwrapKey"]);
  } catch (e3) {
    if ("NotSupportedError" !== e3.name && (24 !== t2.length || "OperationError" !== e3.name)) throw e3;
    return L.printDebugError("Browser did not support operation: " + e3.message), Er(t2).decrypt(r3);
  }
  try {
    const e3 = await Cr.unwrapKey("raw", r3, i3, { name: "AES-KW" }, { name: "HMAC", hash: "SHA-256" }, true, ["sign"]);
    return new Uint8Array(await Cr.exportKey("raw", e3));
  } catch (e3) {
    if ("OperationError" === e3.name) throw Error("Key Data Integrity failed");
    throw e3;
  }
}
async function Pr(e2, t2, r3, n3, i3) {
  const s3 = L.getWebCrypto(), a3 = R.read(R.webHash, e2);
  if (!a3) throw Error("Hash algo not supported with HKDF");
  const o3 = await s3.importKey("raw", t2, "HKDF", false, ["deriveBits"]), c3 = await s3.deriveBits({ name: "HKDF", hash: a3, salt: r3, info: n3 }, o3, 8 * i3);
  return new Uint8Array(c3);
}
async function Qr(e2) {
  switch (e2) {
    case R.publicKey.x25519:
      try {
        const e3 = L.getWebCrypto(), t2 = await e3.generateKey("X25519", true, ["deriveKey", "deriveBits"]).catch((e4) => {
          if ("OperationError" === e4.name) {
            const e5 = Error("Unexpected key generation issue");
            throw e5.name = "NotSupportedError", e5;
          }
          throw e4;
        }), r3 = await e3.exportKey("jwk", t2.privateKey), n3 = await e3.exportKey("jwk", t2.publicKey);
        if (r3.x !== n3.x) {
          const e4 = Error("Unexpected mismatching public point");
          throw e4.name = "NotSupportedError", e4;
        }
        return { A: new Uint8Array(j(n3.x)), k: j(r3.d) };
      } catch (e3) {
        if ("NotSupportedError" !== e3.name) throw e3;
        const { default: t2 } = await Promise.resolve().then(function() {
          return ry;
        }), { secretKey: r3, publicKey: n3 } = t2.box.keyPair();
        return { A: n3, k: r3 };
      }
    case R.publicKey.x448: {
      const e3 = await L.getNobleCurve(R.publicKey.x448), { secretKey: t2, publicKey: r3 } = e3.keygen();
      return { A: r3, k: t2 };
    }
    default:
      throw Error("Unsupported ECDH algorithm");
  }
}
async function Mr(e2, t2, r3) {
  switch (e2) {
    case R.publicKey.x25519:
      try {
        const { ephemeralPublicKey: n3, sharedSecret: i3 } = await Lr(e2, t2), s3 = await Nr(e2, n3, t2, r3);
        return L.equalsUint8Array(i3, s3);
      } catch {
        return false;
      }
    case R.publicKey.x448: {
      const e3 = (await L.getNobleCurve(R.publicKey.x448)).getPublicKey(r3);
      return L.equalsUint8Array(t2, e3);
    }
    default:
      return false;
  }
}
async function Rr(e2, t2, r3) {
  const { ephemeralPublicKey: n3, sharedSecret: i3 } = await Lr(e2, r3), s3 = L.concatUint8Array([n3, r3, i3]);
  switch (e2) {
    case R.publicKey.x25519: {
      const e3 = R.symmetric.aes128, { keySize: r4 } = Kr(e3), i4 = await Pr(R.hash.sha256, s3, new Uint8Array(), xr.x25519, r4);
      return { ephemeralPublicKey: n3, wrappedKey: await Dr(e3, i4, t2) };
    }
    case R.publicKey.x448: {
      const e3 = R.symmetric.aes256, { keySize: r4 } = Kr(R.symmetric.aes256), i4 = await Pr(R.hash.sha512, s3, new Uint8Array(), xr.x448, r4);
      return { ephemeralPublicKey: n3, wrappedKey: await Dr(e3, i4, t2) };
    }
    default:
      throw Error("Unsupported ECDH algorithm");
  }
}
async function Fr(e2, t2, r3, n3, i3) {
  const s3 = await Nr(e2, t2, n3, i3), a3 = L.concatUint8Array([t2, n3, s3]);
  switch (e2) {
    case R.publicKey.x25519: {
      const e3 = R.symmetric.aes128, { keySize: t3 } = Kr(e3);
      return Ur(e3, await Pr(R.hash.sha256, a3, new Uint8Array(), xr.x25519, t3), r3);
    }
    case R.publicKey.x448: {
      const e3 = R.symmetric.aes256, { keySize: t3 } = Kr(R.symmetric.aes256);
      return Ur(e3, await Pr(R.hash.sha512, a3, new Uint8Array(), xr.x448, t3), r3);
    }
    default:
      throw Error("Unsupported ECDH algorithm");
  }
}
function Tr(e2) {
  switch (e2) {
    case R.publicKey.x25519:
      return 32;
    case R.publicKey.x448:
      return 56;
    default:
      throw Error("Unsupported ECDH algorithm");
  }
}
async function Lr(e2, t2) {
  switch (e2) {
    case R.publicKey.x25519:
      try {
        const r3 = L.getWebCrypto(), n3 = await r3.generateKey("X25519", true, ["deriveKey", "deriveBits"]).catch((e3) => {
          if ("OperationError" === e3.name) {
            const e4 = Error("Unexpected key generation issue");
            throw e4.name = "NotSupportedError", e4;
          }
          throw e3;
        }), i3 = await r3.exportKey("jwk", n3.publicKey);
        if ((await r3.exportKey("jwk", n3.privateKey)).x !== i3.x) {
          const e3 = Error("Unexpected mismatching public point");
          throw e3.name = "NotSupportedError", e3;
        }
        const s3 = Hr(e2, t2), a3 = await r3.importKey("jwk", s3, "X25519", false, []), o3 = await r3.deriveBits({ name: "X25519", public: a3 }, n3.privateKey, 8 * Tr(e2));
        return { sharedSecret: new Uint8Array(o3), ephemeralPublicKey: new Uint8Array(j(i3.x)) };
      } catch (e3) {
        if ("NotSupportedError" !== e3.name) throw e3;
        const { default: r3 } = await Promise.resolve().then(function() {
          return ry;
        }), { secretKey: n3, publicKey: i3 } = r3.box.keyPair(), s3 = r3.scalarMult(n3, t2);
        return Or(s3), { ephemeralPublicKey: i3, sharedSecret: s3 };
      }
    case R.publicKey.x448: {
      const e3 = await L.getNobleCurve(R.publicKey.x448), { secretKey: r3, publicKey: n3 } = e3.keygen(), i3 = e3.getSharedSecret(r3, t2);
      return Or(i3), { ephemeralPublicKey: n3, sharedSecret: i3 };
    }
    default:
      throw Error("Unsupported ECDH algorithm");
  }
}
async function Nr(e2, t2, r3, n3) {
  switch (e2) {
    case R.publicKey.x25519:
      try {
        const i3 = L.getWebCrypto(), s3 = function(e3, t3, r4) {
          if (e3 === R.publicKey.x25519) {
            const n4 = Hr(e3, t3);
            return n4.d = V(r4), n4;
          }
          throw Error("Unsupported ECDH algorithm");
        }(e2, r3, n3), a3 = Hr(e2, t2), o3 = await i3.importKey("jwk", s3, "X25519", false, ["deriveKey", "deriveBits"]), c3 = await i3.importKey("jwk", a3, "X25519", false, []), u2 = await i3.deriveBits({ name: "X25519", public: c3 }, o3, 8 * Tr(e2));
        return new Uint8Array(u2);
      } catch (e3) {
        if ("NotSupportedError" !== e3.name) throw e3;
        const { default: r4 } = await Promise.resolve().then(function() {
          return ry;
        }), i3 = r4.scalarMult(n3, t2);
        return Or(i3), i3;
      }
    case R.publicKey.x448: {
      const e3 = (await L.getNobleCurve(R.publicKey.x448)).getSharedSecret(n3, t2);
      return Or(e3), e3;
    }
    default:
      throw Error("Unsupported ECDH algorithm");
  }
}
function Or(e2) {
  let t2 = 0;
  for (let r3 = 0; r3 < e2.length; r3++) t2 |= e2[r3];
  if (0 === t2) throw Error("Unexpected low order point");
}
function Hr(e2, t2) {
  if (e2 === R.publicKey.x25519) {
    return { kty: "OKP", crv: "X25519", x: V(t2), ext: true };
  }
  throw Error("Unsupported ECDH algorithm");
}
async function Jr(e2) {
  const t2 = new Zr(e2), { oid: r3, hash: n3, cipher: i3 } = t2, s3 = await t2.genKeyPair();
  return { oid: r3, Q: s3.publicKey, secret: L.leftPad(s3.privateKey, t2.payloadSize), hash: n3, cipher: i3 };
}
function Wr(e2) {
  return Yr[e2.getName()].hash;
}
async function Xr(e2, t2, r3, n3) {
  const i3 = { [R.curve.nistP256]: true, [R.curve.nistP384]: true, [R.curve.nistP521]: true, [R.curve.secp256k1]: true, [R.curve.curve25519Legacy]: e2 === R.publicKey.ecdh, [R.curve.brainpoolP256r1]: true, [R.curve.brainpoolP384r1]: true, [R.curve.brainpoolP512r1]: true }, s3 = t2.getName();
  if (!i3[s3]) return false;
  if (s3 === R.curve.curve25519Legacy) {
    const e3 = n3.slice().reverse();
    return !(r3.length < 1 || 64 !== r3[0]) && Mr(R.publicKey.x25519, r3.subarray(1), e3);
  }
  const a3 = (await L.getNobleCurve(R.publicKey.ecdsa, s3)).getPublicKey(n3, false);
  return !!L.equalsUint8Array(a3, r3);
}
function $r(e2, t2) {
  const { payloadSize: r3, wireFormatLeadingByte: n3, name: i3 } = e2, s3 = i3 === R.curve.curve25519Legacy || i3 === R.curve.ed25519Legacy ? r3 : 2 * r3;
  if (t2[0] !== n3 || t2.length !== s3 + 1) throw Error("Invalid point encoding");
}
async function en(e2) {
  const t2 = await L.getNobleCurve(R.publicKey.ecdsa, e2), { secretKey: r3 } = t2.keygen();
  return { publicKey: t2.getPublicKey(r3, false), privateKey: r3 };
}
function tn(e2, t2) {
  const r3 = j(e2.x), n3 = j(e2.y), i3 = new Uint8Array(r3.length + n3.length + 1);
  return i3[0] = t2, i3.set(r3, 1), i3.set(n3, r3.length + 1), i3;
}
function rn(e2, t2, r3) {
  const n3 = e2, i3 = r3.slice(1, n3 + 1), s3 = r3.slice(n3 + 1, 2 * n3 + 1);
  return { kty: "EC", crv: t2, x: V(i3), y: V(s3), ext: true };
}
function nn(e2, t2, r3, n3) {
  const i3 = rn(e2, t2, r3);
  return i3.d = V(n3), i3;
}
async function on(e2, t2, r3, n3, i3, s3) {
  const a3 = new Zr(e2);
  if ($r(a3, n3), r3 && !L.isStream(r3)) {
    const e3 = { publicKey: n3, privateKey: i3 };
    switch (a3.type) {
      case "web":
        try {
          return await async function(e4, t3, r4, n4) {
            const i4 = e4.payloadSize, s4 = nn(e4.payloadSize, Vr[e4.name], n4.publicKey, n4.privateKey), a4 = await sn.importKey("jwk", s4, { name: "ECDSA", namedCurve: Vr[e4.name], hash: { name: R.read(R.webHash, e4.hash) } }, false, ["sign"]), o4 = new Uint8Array(await sn.sign({ name: "ECDSA", namedCurve: Vr[e4.name], hash: { name: R.read(R.webHash, t3) } }, a4, r4));
            return { r: o4.slice(0, i4), s: o4.slice(i4, i4 << 1) };
          }(a3, t2, r3, e3);
        } catch (e4) {
          if ("nistP521" !== a3.name && ("DataError" === e4.name || "OperationError" === e4.name)) throw e4;
          L.printDebugError("Browser did not support signing: " + e4.message);
        }
        break;
      case "node":
        return function(e4, t3, r4, n4) {
          const i4 = L.nodeRequire("eckey-utils"), s4 = L.getNodeBuffer(), { privateKey: a4 } = i4.generateDer({ curveName: _r[e4.name], privateKey: s4.from(n4) }), o4 = an.createSign(R.read(R.hash, t3));
          o4.write(r4), o4.end();
          const c3 = new Uint8Array(o4.sign({ key: a4, format: "der", type: "sec1", dsaEncoding: "ieee-p1363" })), u2 = e4.payloadSize;
          return { r: c3.subarray(0, u2), s: c3.subarray(u2, u2 << 1) };
        }(a3, t2, r3, i3);
    }
  }
  const o3 = (await L.getNobleCurve(R.publicKey.ecdsa, a3.name)).sign(s3, i3, { lowS: false });
  return { r: ye(o3.r, "be", a3.payloadSize), s: ye(o3.s, "be", a3.payloadSize) };
}
async function cn(e2, t2, r3, n3, i3, s3) {
  const a3 = new Zr(e2);
  $r(a3, i3);
  const o3 = async () => 0 === s3[0] && un(a3, r3, s3.subarray(1), i3);
  if (n3 && !L.isStream(n3)) switch (a3.type) {
    case "web":
      try {
        const e3 = await async function(e4, t3, { r: r4, s: n4 }, i4, s4) {
          const a4 = rn(e4.payloadSize, Vr[e4.name], s4), o4 = await sn.importKey("jwk", a4, { name: "ECDSA", namedCurve: Vr[e4.name], hash: { name: R.read(R.webHash, e4.hash) } }, false, ["verify"]), c3 = L.concatUint8Array([r4, n4]).buffer;
          return sn.verify({ name: "ECDSA", namedCurve: Vr[e4.name], hash: { name: R.read(R.webHash, t3) } }, o4, c3, i4);
        }(a3, t2, r3, n3, i3);
        return e3 || o3();
      } catch (e3) {
        if ("nistP521" !== a3.name && ("DataError" === e3.name || "OperationError" === e3.name)) throw e3;
        L.printDebugError("Browser did not support verifying: " + e3.message);
      }
      break;
    case "node": {
      const e3 = function(e4, t3, { r: r4, s: n4 }, i4, s4) {
        const a4 = L.nodeRequire("eckey-utils"), o4 = L.getNodeBuffer(), { publicKey: c3 } = a4.generateDer({ curveName: _r[e4.name], publicKey: o4.from(s4) }), u2 = an.createVerify(R.read(R.hash, t3));
        u2.write(i4), u2.end();
        const h4 = L.concatUint8Array([r4, n4]);
        try {
          return u2.verify({ key: c3, format: "der", type: "spki", dsaEncoding: "ieee-p1363" }, h4);
        } catch {
          return false;
        }
      }(a3, t2, r3, n3, i3);
      return e3 || o3();
    }
  }
  return await un(a3, r3, s3, i3) || o3();
}
async function un(e2, t2, r3, n3) {
  return (await L.getNobleCurve(R.publicKey.ecdsa, e2.name)).verify(L.concatUint8Array([t2.r, t2.s]), r3, n3, { lowS: false });
}
async function fn(e2, t2, r3, n3, i3, s3) {
  if ($r(new Zr(e2), n3), Fe(t2) < Fe(R.hash.sha256)) throw Error("Hash algorithm too weak for EdDSA.");
  const { RS: a3 } = await lt(R.publicKey.ed25519, t2, 0, n3.subarray(1), i3, s3);
  return { r: a3.subarray(0, 32), s: a3.subarray(32) };
}
async function ln(e2, t2, { r: r3, s: n3 }, i3, s3, a3) {
  if ($r(new Zr(e2), s3), Fe(t2) < Fe(R.hash.sha256)) throw Error("Hash algorithm too weak for EdDSA.");
  const o3 = L.concatUint8Array([r3, n3]);
  return yt(R.publicKey.ed25519, t2, { RS: o3 }, 0, s3.subarray(1), a3);
}
async function yn(e2, t2, r3) {
  return e2.getName() === R.curve.ed25519Legacy && (!(t2.length < 1 || 64 !== t2[0]) && gt(R.publicKey.ed25519, t2.subarray(1), r3));
}
function pn(e2) {
  const t2 = e2.length;
  if (t2 > 0) {
    const r3 = e2[t2 - 1];
    if (r3 >= 1) {
      const n3 = e2.subarray(t2 - r3), i3 = new Uint8Array(r3).fill(r3);
      if (L.equalsUint8Array(n3, i3)) return e2.subarray(0, t2 - r3);
    }
  }
  throw Error("Invalid padding");
}
function dn(e2, t2, r3, n3) {
  return L.concatUint8Array([t2.write(), new Uint8Array([e2]), r3.write(), L.stringToUint8Array("Anonymous Sender    "), n3]);
}
async function An(e2, t2, r3, n3, i3 = false, s3 = false) {
  let a3;
  if (i3) {
    for (a3 = 0; a3 < t2.length && 0 === t2[a3]; a3++) ;
    t2 = t2.subarray(a3);
  }
  if (s3) {
    for (a3 = t2.length - 1; a3 >= 0 && 0 === t2[a3]; a3--) ;
    t2 = t2.subarray(0, a3 + 1);
  }
  return (await Re(e2, L.concatUint8Array([new Uint8Array([0, 0, 0, 1]), t2, n3]))).subarray(0, r3);
}
async function wn(e2, t2) {
  switch (e2.type) {
    case "curve25519Legacy": {
      const { sharedSecret: r3, ephemeralPublicKey: n3 } = await Lr(R.publicKey.x25519, t2.subarray(1));
      return { publicKey: L.concatUint8Array([new Uint8Array([e2.wireFormatLeadingByte]), n3]), sharedKey: r3 };
    }
    case "web":
      if (e2.web && L.getWebCrypto()) try {
        return await async function(e3, t3) {
          const r3 = L.getWebCrypto(), n3 = rn(e3.payloadSize, e3.web, t3);
          let i3 = r3.generateKey({ name: "ECDH", namedCurve: e3.web }, true, ["deriveKey", "deriveBits"]), s3 = r3.importKey("jwk", n3, { name: "ECDH", namedCurve: e3.web }, false, []);
          [i3, s3] = await Promise.all([i3, s3]);
          let a3 = r3.deriveBits({ name: "ECDH", namedCurve: e3.web, public: s3 }, i3.privateKey, e3.sharedSize), o3 = r3.exportKey("jwk", i3.publicKey);
          [a3, o3] = await Promise.all([a3, o3]);
          const c3 = new Uint8Array(a3), u2 = new Uint8Array(tn(o3, e3.wireFormatLeadingByte));
          return { publicKey: u2, sharedKey: c3 };
        }(e2, t2);
      } catch (r3) {
        return L.printDebugError(r3), vn(e2, t2);
      }
      break;
    case "node":
      return function(e3, t3) {
        const r3 = L.getNodeCrypto(), n3 = r3.createECDH(e3.node);
        n3.generateKeys();
        const i3 = new Uint8Array(n3.computeSecret(t3));
        return { publicKey: new Uint8Array(n3.getPublicKey()), sharedKey: i3 };
      }(e2, t2);
    default:
      return vn(e2, t2);
  }
}
async function mn(e2, t2, r3, n3, i3) {
  const s3 = function(e3) {
    const t3 = 8 - e3.length % 8, r4 = new Uint8Array(e3.length + t3).fill(t3);
    return r4.set(e3), r4;
  }(r3), a3 = new Zr(e2);
  $r(a3, n3);
  const { publicKey: o3, sharedKey: c3 } = await wn(a3, n3), u2 = dn(R.publicKey.ecdh, e2, t2, i3), { keySize: h4 } = Kr(t2.cipher), f2 = await An(t2.hash, c3, h4, u2);
  return { publicKey: o3, wrappedKey: await Dr(t2.cipher, f2, s3) };
}
async function bn(e2, t2, r3, n3) {
  if (n3.length !== e2.payloadSize) {
    const t3 = new Uint8Array(e2.payloadSize);
    t3.set(n3, e2.payloadSize - n3.length), n3 = t3;
  }
  switch (e2.type) {
    case "curve25519Legacy": {
      const e3 = n3.slice().reverse();
      return { secretKey: e3, sharedKey: await Nr(R.publicKey.x25519, t2.subarray(1), r3.subarray(1), e3) };
    }
    case "web":
      if (e2.web && L.getWebCrypto()) try {
        return await async function(e3, t3, r4, n4) {
          const i3 = L.getWebCrypto(), s3 = nn(e3.payloadSize, e3.web, r4, n4);
          let a3 = i3.importKey("jwk", s3, { name: "ECDH", namedCurve: e3.web }, true, ["deriveKey", "deriveBits"]);
          const o3 = rn(e3.payloadSize, e3.web, t3);
          let c3 = i3.importKey("jwk", o3, { name: "ECDH", namedCurve: e3.web }, true, []);
          [a3, c3] = await Promise.all([a3, c3]);
          let u2 = i3.deriveBits({ name: "ECDH", namedCurve: e3.web, public: c3 }, a3, e3.sharedSize), h4 = i3.exportKey("jwk", a3);
          [u2, h4] = await Promise.all([u2, h4]);
          const f2 = new Uint8Array(u2);
          return { secretKey: j(h4.d), sharedKey: f2 };
        }(e2, t2, r3, n3);
      } catch (r4) {
        return L.printDebugError(r4), En(e2, t2, n3);
      }
      break;
    case "node":
      return function(e3, t3, r4) {
        const n4 = L.getNodeCrypto(), i3 = n4.createECDH(e3.node);
        i3.setPrivateKey(r4);
        const s3 = new Uint8Array(i3.computeSecret(t3));
        return { secretKey: new Uint8Array(i3.getPrivateKey()), sharedKey: s3 };
      }(e2, t2, n3);
    default:
      return En(e2, t2, n3);
  }
}
async function kn(e2, t2, r3, n3, i3, s3, a3) {
  const o3 = new Zr(e2);
  $r(o3, i3), $r(o3, r3);
  const { sharedKey: c3 } = await bn(o3, r3, i3, s3), u2 = dn(R.publicKey.ecdh, e2, t2, a3), { keySize: h4 } = Kr(t2.cipher);
  let f2;
  for (let e3 = 0; e3 < 3; e3++) try {
    const r4 = await An(t2.hash, c3, h4, u2, 1 === e3, 2 === e3);
    return pn(await Ur(t2.cipher, r4, n3));
  } catch (e4) {
    f2 = e4;
  }
  throw f2;
}
async function En(e2, t2, r3) {
  return { secretKey: r3, sharedKey: (await L.getNobleCurve(R.publicKey.ecdh, e2.name)).getSharedSecret(r3, t2).subarray(1) };
}
async function vn(e2, t2) {
  const r3 = await L.getNobleCurve(R.publicKey.ecdh, e2.name), { publicKey: n3, privateKey: i3 } = await e2.genKeyPair();
  return { publicKey: n3, sharedKey: r3.getSharedSecret(i3, t2).subarray(1) };
}
async function Un(e2, t2, r3, n3, i3) {
  switch (e2) {
    case R.publicKey.rsaEncrypt:
    case R.publicKey.rsaEncryptSign: {
      const { n: e3, e: t3 } = r3;
      return { c: await qe(n3, e3, t3) };
    }
    case R.publicKey.elgamal: {
      const { p: e3, g: t3, y: i4 } = r3;
      return async function(e4, t4, r4, n4) {
        t4 = ne(t4), r4 = ne(r4), n4 = ne(n4);
        const i5 = ne(Le(e4, le(t4))), s3 = de(We, t4 - We);
        return { c1: ye(ae(r4, s3, t4)), c2: ye(ie(ae(n4, s3, t4) * i5, t4)) };
      }(n3, e3, t3, i4);
    }
    case R.publicKey.ecdh: {
      const { oid: e3, Q: t3, kdfParams: s3 } = r3, { publicKey: a3, wrappedKey: o3 } = await mn(e3, s3, n3, t3, i3);
      return { V: a3, C: new Kn(o3) };
    }
    case R.publicKey.x25519:
    case R.publicKey.x448: {
      if (t2 && !L.isAES(t2)) throw Error("X25519 and X448 keys can only encrypt AES session keys");
      const { A: i4 } = r3, { ephemeralPublicKey: s3, wrappedKey: a3 } = await Rr(e2, n3, i4);
      return { ephemeralPublicKey: s3, C: Dn.fromObject({ algorithm: t2, wrappedKey: a3 }) };
    }
    default:
      return [];
  }
}
async function Pn(e2, t2, r3, n3, i3, s3) {
  switch (e2) {
    case R.publicKey.rsaEncryptSign:
    case R.publicKey.rsaEncrypt: {
      const { c: e3 } = n3, { n: i4, e: a3 } = t2, { d: o3, p: c3, q: u2, u: h4 } = r3;
      return _e(e3, i4, a3, o3, c3, u2, h4, s3);
    }
    case R.publicKey.elgamal: {
      const { c1: e3, c2: i4 } = n3;
      return async function(e4, t3, r4, n4, i5) {
        return e4 = ne(e4), t3 = ne(t3), r4 = ne(r4), Ne(ye(ie(ce(ae(e4, n4 = ne(n4), r4), r4) * t3, r4), "be", le(r4)), i5);
      }(e3, i4, t2.p, r3.x, s3);
    }
    case R.publicKey.ecdh: {
      const { oid: e3, Q: s4, kdfParams: a3 } = t2, { d: o3 } = r3, { V: c3, C: u2 } = n3;
      return kn(e3, a3, c3, u2.data, s4, o3, i3);
    }
    case R.publicKey.x25519:
    case R.publicKey.x448: {
      const { A: i4 } = t2, { k: s4 } = r3, { ephemeralPublicKey: a3, C: o3 } = n3;
      if (null !== o3.algorithm && !L.isAES(o3.algorithm)) throw Error("AES session key expected");
      return Fr(e2, a3, o3.wrappedKey, i4, s4);
    }
    default:
      throw Error("Unknown public key encryption algorithm.");
  }
}
function xn(e2, t2, r3) {
  let n3 = 0;
  switch (e2) {
    case R.publicKey.rsaEncrypt:
    case R.publicKey.rsaEncryptSign:
    case R.publicKey.rsaSign: {
      const e3 = L.readMPI(t2.subarray(n3));
      n3 += e3.length + 2;
      const r4 = L.readMPI(t2.subarray(n3));
      n3 += r4.length + 2;
      const i3 = L.readMPI(t2.subarray(n3));
      n3 += i3.length + 2;
      const s3 = L.readMPI(t2.subarray(n3));
      return n3 += s3.length + 2, { read: n3, privateParams: { d: e3, p: r4, q: i3, u: s3 } };
    }
    case R.publicKey.dsa:
    case R.publicKey.elgamal: {
      const e3 = L.readMPI(t2.subarray(n3));
      return n3 += e3.length + 2, { read: n3, privateParams: { x: e3 } };
    }
    case R.publicKey.ecdsa:
    case R.publicKey.ecdh: {
      const i3 = Ln(e2, r3.oid);
      let s3 = L.readMPI(t2.subarray(n3));
      return n3 += s3.length + 2, s3 = L.leftPad(s3, i3), { read: n3, privateParams: { d: s3 } };
    }
    case R.publicKey.eddsaLegacy: {
      const i3 = Ln(e2, r3.oid);
      if (r3.oid.getName() !== R.curve.ed25519Legacy) throw Error("Unexpected OID for eddsaLegacy");
      let s3 = L.readMPI(t2.subarray(n3));
      return n3 += s3.length + 2, s3 = L.leftPad(s3, i3), { read: n3, privateParams: { seed: s3 } };
    }
    case R.publicKey.ed25519:
    case R.publicKey.ed448: {
      const r4 = Ln(e2), i3 = L.readExactSubarray(t2, n3, n3 + r4);
      return n3 += i3.length, { read: n3, privateParams: { seed: i3 } };
    }
    case R.publicKey.x25519:
    case R.publicKey.x448: {
      const r4 = Ln(e2), i3 = L.readExactSubarray(t2, n3, n3 + r4);
      return n3 += i3.length, { read: n3, privateParams: { k: i3 } };
    }
    default:
      throw new ot("Unknown public key encryption algorithm.");
  }
}
function Qn(e2, t2) {
  const r3 = /* @__PURE__ */ new Set([R.publicKey.ed25519, R.publicKey.x25519, R.publicKey.ed448, R.publicKey.x448]), n3 = Object.keys(t2).map((n4) => {
    const i3 = t2[n4];
    return L.isUint8Array(i3) ? r3.has(e2) ? i3 : L.uint8ArrayToMPI(i3) : i3.write();
  });
  return L.concatUint8Array(n3);
}
function Mn(e2, t2, r3) {
  switch (e2) {
    case R.publicKey.rsaEncrypt:
    case R.publicKey.rsaEncryptSign:
    case R.publicKey.rsaSign:
      return async function(e3, t3) {
        if (t3 = BigInt(t3), L.getWebCrypto()) {
          const r5 = { name: "RSASSA-PKCS1-v1_5", modulusLength: e3, publicExponent: ye(t3), hash: { name: "SHA-1" } }, n4 = await He.generateKey(r5, true, ["sign", "verify"]);
          return Je(await He.exportKey("jwk", n4.privateKey), t3);
        }
        if (L.getNodeCrypto()) {
          const r5 = { modulusLength: e3, publicExponent: ue(t3), publicKeyEncoding: { type: "pkcs1", format: "jwk" }, privateKeyEncoding: { type: "pkcs1", format: "jwk" } }, n4 = await new Promise((e4, t4) => {
            ze.generateKeyPair("rsa", r5, (r6, n5, i4) => {
              r6 ? t4(r6) : e4(i4);
            });
          });
          return Je(n4, t3);
        }
        let r4, n3, i3;
        do {
          n3 = we(e3 - (e3 >> 1), t3, 40), r4 = we(e3 >> 1, t3, 40), i3 = r4 * n3;
        } while (fe(i3) !== e3);
        const s3 = (r4 - Ge) * (n3 - Ge);
        return n3 < r4 && ([r4, n3] = [n3, r4]), { n: ye(i3), e: ye(t3), d: ye(ce(t3, s3)), p: ye(r4), q: ye(n3), u: ye(ce(r4, n3)) };
      }(t2, 65537).then(({ n: e3, e: t3, d: r4, p: n3, q: i3, u: s3 }) => ({ privateParams: { d: r4, p: n3, q: i3, u: s3 }, publicParams: { n: e3, e: t3 } }));
    case R.publicKey.ecdsa:
      return Jr(r3).then(({ oid: e3, Q: t3, secret: r4 }) => ({ privateParams: { d: r4 }, publicParams: { oid: new $e(e3), Q: t3 } }));
    case R.publicKey.eddsaLegacy:
      return Jr(r3).then(({ oid: e3, Q: t3, secret: r4 }) => ({ privateParams: { seed: r4 }, publicParams: { oid: new $e(e3), Q: t3 } }));
    case R.publicKey.ecdh:
      return Jr(r3).then(({ oid: e3, Q: t3, secret: r4, hash: n3, cipher: i3 }) => ({ privateParams: { d: r4 }, publicParams: { oid: new $e(e3), Q: t3, kdfParams: new Cn({ hash: n3, cipher: i3 }) } }));
    case R.publicKey.ed25519:
    case R.publicKey.ed448:
      return ft(e2).then(({ A: e3, seed: t3 }) => ({ privateParams: { seed: t3 }, publicParams: { A: e3 } }));
    case R.publicKey.x25519:
    case R.publicKey.x448:
      return Qr(e2).then(({ A: e3, k: t3 }) => ({ privateParams: { k: t3 }, publicParams: { A: e3 } }));
    case R.publicKey.dsa:
    case R.publicKey.elgamal:
      throw Error("Unsupported algorithm for key generation.");
    default:
      throw Error("Unknown public key algorithm.");
  }
}
async function Rn(e2, t2, r3) {
  if (!t2 || !r3) throw Error("Missing key parameters");
  switch (e2) {
    case R.publicKey.rsaEncrypt:
    case R.publicKey.rsaEncryptSign:
    case R.publicKey.rsaSign: {
      const { n: e3, e: n3 } = t2, { d: i3, p: s3, q: a3, u: o3 } = r3;
      return async function(e4, t3, r4, n4, i4, s4) {
        if (e4 = ne(e4), (n4 = ne(n4)) * (i4 = ne(i4)) !== e4) return false;
        const a4 = BigInt(2);
        if (ie(n4 * (s4 = ne(s4)), i4) !== BigInt(1)) return false;
        t3 = ne(t3), r4 = ne(r4);
        const o4 = de(a4, a4 << BigInt(Math.floor(fe(e4) / 3))), c3 = o4 * r4 * t3;
        return !(ie(c3, n4 - Ge) !== o4 || ie(c3, i4 - Ge) !== o4);
      }(e3, n3, i3, s3, a3, o3);
    }
    case R.publicKey.dsa: {
      const { p: e3, q: n3, g: i3, y: s3 } = t2, { x: a3 } = r3;
      return async function(e4, t3, r4, n4, i4) {
        const s4 = ne(e4), a4 = ne(t3), o3 = ne(r4), c3 = ne(n4);
        if (o3 <= Sn || o3 >= s4) return false;
        if (ie(s4 - Sn, a4) !== Bn) return false;
        if (ae(o3, a4, s4) !== Sn) return false;
        const u2 = BigInt(fe(a4));
        if (u2 < BigInt(150) || !me(a4, null, 32)) return false;
        const h4 = ne(i4), f2 = BigInt(2);
        return c3 === ae(o3, a4 * de(f2 << u2 - Sn, f2 << u2) + h4, s4);
      }(e3, n3, i3, s3, a3);
    }
    case R.publicKey.elgamal: {
      const { p: e3, g: n3, y: i3 } = t2, { x: s3 } = r3;
      return async function(e4, t3, r4, n4) {
        const i4 = ne(e4), s4 = ne(t3), a3 = ne(r4);
        if (s4 <= We || s4 >= i4) return false;
        const o3 = BigInt(fe(i4));
        if (o3 < BigInt(1023)) return false;
        if (ae(s4, i4 - We, i4) !== We) return false;
        let c3 = s4, u2 = BigInt(1);
        const h4 = BigInt(2), f2 = h4 << BigInt(17);
        for (; u2 < f2; ) {
          if (c3 = ie(c3 * s4, i4), c3 === We) return false;
          u2++;
        }
        const l2 = ne(n4), y2 = de(h4 << o3 - We, h4 << o3);
        return a3 === ae(s4, (i4 - We) * y2 + l2, i4);
      }(e3, n3, i3, s3);
    }
    case R.publicKey.ecdsa:
    case R.publicKey.ecdh: {
      const n3 = In[R.read(R.publicKey, e2)], { oid: i3, Q: s3 } = t2, { d: a3 } = r3;
      return n3.validateParams(i3, s3, a3);
    }
    case R.publicKey.eddsaLegacy: {
      const { Q: e3, oid: n3 } = t2, { seed: i3 } = r3;
      return yn(n3, e3, i3);
    }
    case R.publicKey.ed25519:
    case R.publicKey.ed448: {
      const { A: n3 } = t2, { seed: i3 } = r3;
      return gt(e2, n3, i3);
    }
    case R.publicKey.x25519:
    case R.publicKey.x448: {
      const { A: n3 } = t2, { k: i3 } = r3;
      return Mr(e2, n3, i3);
    }
    default:
      throw Error("Unknown public key algorithm.");
  }
}
function Fn(e2) {
  const { keySize: t2 } = Kr(e2);
  return pe(t2);
}
function Tn(e2) {
  try {
    e2.getName();
  } catch {
    throw new ot("Unknown curve OID");
  }
}
function Ln(e2, t2) {
  switch (e2) {
    case R.publicKey.ecdsa:
    case R.publicKey.ecdh:
    case R.publicKey.eddsaLegacy:
      return new Zr(t2).payloadSize;
    case R.publicKey.ed25519:
    case R.publicKey.ed448:
      return pt(e2);
    case R.publicKey.x25519:
    case R.publicKey.x448:
      return Tr(e2);
    default:
      throw Error("Unknown elliptic algo");
  }
}
function Gn(e2) {
  const { blockSize: t2 } = Kr(e2), r3 = pe(t2), n3 = new Uint8Array([r3[r3.length - 2], r3[r3.length - 1]]);
  return L.concat([r3, n3]);
}
async function jn(e2, t2, r3, n3, i3) {
  const s3 = R.read(R.symmetric, e2);
  if (L.getNodeCrypto() && zn[s3]) return function(e3, t3, r4, n4) {
    const i4 = R.read(R.symmetric, e3), s4 = new On.createCipheriv(zn[i4], t3, n4);
    return b(r4, (e4) => new Uint8Array(s4.update(e4)));
  }(e2, t2, r3, n3);
  if (L.isAES(e2)) return async function(e3, t3, r4, n4) {
    if (Nn && await qn.isSupported(e3)) {
      const i4 = new qn(e3, t3, n4);
      return L.isStream(r4) ? k(r4, (e4) => i4.encryptChunk(e4), () => i4.finish()) : i4.encrypt(r4);
    }
    if (L.isStream(r4)) {
      const i4 = new _n(true, e3, t3, n4);
      return k(r4, (e4) => i4.processChunk(e4), () => i4.finish());
    }
    return gr(t3, n4).encrypt(r4);
  }(e2, t2, r3, n3);
  const a3 = new (await Ir(e2))(t2), o3 = a3.blockSize, c3 = n3.slice();
  let u2 = new Uint8Array();
  const h4 = (e3) => {
    e3 && (u2 = L.concatUint8Array([u2, e3]));
    const t3 = new Uint8Array(u2.length);
    let r4, n4 = 0;
    for (; e3 ? u2.length >= o3 : u2.length; ) {
      const e4 = a3.encrypt(c3);
      for (r4 = 0; r4 < o3; r4++) c3[r4] = u2[r4] ^ e4[r4], t3[n4++] = c3[r4];
      u2 = u2.subarray(o3);
    }
    return t3.subarray(0, n4);
  };
  return b(r3, h4, h4);
}
async function Vn(e2, t2, r3, n3) {
  const i3 = R.read(R.symmetric, e2);
  if (On && zn[i3]) return function(e3, t3, r4, n4) {
    const i4 = R.read(R.symmetric, e3), s4 = new On.createDecipheriv(zn[i4], t3, n4);
    return b(r4, (e4) => new Uint8Array(s4.update(e4)));
  }(e2, t2, r3, n3);
  if (L.isAES(e2)) return function(e3, t3, r4, n4) {
    if (L.isStream(r4)) {
      const i4 = new _n(false, e3, t3, n4);
      return k(r4, (e4) => i4.processChunk(e4), () => i4.finish());
    }
    return gr(t3, n4).decrypt(r4);
  }(e2, t2, r3, n3);
  const s3 = new (await Ir(e2))(t2), a3 = s3.blockSize;
  let o3 = n3, c3 = new Uint8Array();
  const u2 = (e3) => {
    e3 && (c3 = L.concatUint8Array([c3, e3]));
    const t3 = new Uint8Array(c3.length);
    let r4, n4 = 0;
    for (; e3 ? c3.length >= a3 : c3.length; ) {
      const e4 = s3.encrypt(o3);
      for (o3 = c3.subarray(0, a3), r4 = 0; r4 < a3; r4++) t3[n4++] = o3[r4] ^ e4[r4];
      c3 = c3.subarray(a3);
    }
    return t3.subarray(0, n4);
  };
  return b(r3, u2, u2);
}
function Yn(e2, t2) {
  const r3 = Math.min(e2.length, t2.length);
  for (let n3 = 0; n3 < r3; n3++) e2[n3] = e2[n3] ^ t2[n3];
}
function $n(e2, t2) {
  const r3 = e2.length - Xn;
  for (let n3 = 0; n3 < Xn; n3++) e2[n3 + r3] ^= t2[n3];
  return e2;
}
async function ti(e2) {
  const t2 = await ri(e2), r3 = L.double(await t2(ei)), n3 = L.double(r3);
  return async function(e3) {
    return (await t2(function(e4, t3, r4) {
      if (e4.length && e4.length % Xn == 0) return $n(e4, t3);
      const n4 = new Uint8Array(e4.length + (Xn - e4.length % Xn));
      return n4.set(e4), n4[e4.length] = 128, $n(n4, r4);
    }(e3, r3, n3))).subarray(-16);
  };
}
async function ri(e2) {
  if (L.getNodeCrypto()) return async function(t2) {
    const r3 = new Wn.createCipheriv("aes-" + 8 * e2.length + "-cbc", e2, ei).update(t2);
    return new Uint8Array(r3);
  };
  if (L.getWebCrypto()) try {
    return e2 = await Jn.importKey("raw", e2, { name: "AES-CBC", length: 8 * e2.length }, false, ["encrypt"]), async function(t2) {
      const r3 = await Jn.encrypt({ name: "AES-CBC", iv: ei, length: 128 }, e2, t2);
      return new Uint8Array(r3).subarray(0, r3.byteLength - Xn);
    };
  } catch (t2) {
    if ("NotSupportedError" !== t2.name && (24 !== e2.length || "OperationError" !== t2.name)) throw t2;
    L.printDebugError("Browser did not support operation: " + t2.message);
  }
  return async function(t2) {
    return yr(e2, ei, { disablePadding: true }).encrypt(t2);
  };
}
async function fi(e2) {
  const t2 = await ti(e2);
  return function(e3, r3) {
    return t2(L.concatUint8Array([e3, r3]));
  };
}
async function li(e2) {
  if (L.getNodeCrypto()) return async function(t2, r3) {
    const n3 = new ii.createCipheriv("aes-" + 8 * e2.length + "-ctr", e2, r3), i3 = si.concat([n3.update(t2), n3.final()]);
    return new Uint8Array(i3);
  };
  if (L.getWebCrypto()) try {
    const t2 = await ni.importKey("raw", e2, { name: "AES-CTR", length: 8 * e2.length }, false, ["encrypt"]);
    return async function(e3, r3) {
      const n3 = await ni.encrypt({ name: "AES-CTR", counter: r3, length: 128 }, t2, e3);
      return new Uint8Array(n3);
    };
  } catch (t2) {
    if ("NotSupportedError" !== t2.name && (24 !== e2.length || "OperationError" !== t2.name)) throw t2;
    L.printDebugError("Browser did not support operation: " + t2.message);
  }
  return async function(t2, r3) {
    return lr(e2, r3).encrypt(t2);
  };
}
async function yi(e2, t2) {
  if (e2 !== R.symmetric.aes128 && e2 !== R.symmetric.aes192 && e2 !== R.symmetric.aes256) throw Error("EAX mode supports only AES cipher");
  const [r3, n3] = await Promise.all([fi(t2), li(t2)]);
  return { encrypt: async function(e3, t3, i3) {
    const [s3, a3] = await Promise.all([r3(ci, t3), r3(ui, i3)]), o3 = await n3(e3, s3), c3 = await r3(hi, o3);
    for (let e4 = 0; e4 < oi; e4++) c3[e4] ^= a3[e4] ^ s3[e4];
    return L.concatUint8Array([o3, c3]);
  }, decrypt: async function(e3, t3, i3) {
    if (e3.length < oi) throw Error("Invalid EAX ciphertext");
    const s3 = e3.subarray(0, -16), a3 = e3.subarray(-16), [o3, c3, u2] = await Promise.all([r3(ci, t3), r3(ui, i3), r3(hi, s3)]), h4 = u2;
    for (let e4 = 0; e4 < oi; e4++) h4[e4] ^= c3[e4] ^ o3[e4];
    if (!L.equalsUint8Array(a3, h4)) throw Error("Authentication tag mismatch");
    return await n3(s3, o3);
  } };
}
function di(e2) {
  let t2 = 0;
  for (let r3 = 1; !(e2 & r3); r3 <<= 1) t2++;
  return t2;
}
function Ai(e2, t2) {
  for (let r3 = 0; r3 < e2.length; r3++) e2[r3] ^= t2[r3];
  return e2;
}
function wi(e2, t2) {
  return Ai(e2.slice(), t2);
}
async function ki(e2, t2) {
  const { keySize: r3 } = Kr(e2);
  if (!L.isAES(e2) || t2.length !== r3) throw Error("Unexpected algorithm or key size");
  let n3 = 0;
  const i3 = (e3) => yr(t2, mi, { disablePadding: true }).encrypt(e3), s3 = (e3) => yr(t2, mi, { disablePadding: true }).decrypt(e3);
  let a3;
  function o3(e3, t3, r4, s4) {
    const o4 = t3.length / gi | 0;
    !function(e4, t4) {
      const r5 = L.nbits(Math.max(e4.length, t4.length) / gi | 0) - 1;
      for (let e5 = n3 + 1; e5 <= r5; e5++) a3[e5] = L.double(a3[e5 - 1]);
      n3 = r5;
    }(t3, s4);
    const c3 = L.concatUint8Array([mi.subarray(0, 15 - r4.length), bi, r4]), u2 = 63 & c3[15];
    c3[15] &= 192;
    const h4 = i3(c3), f2 = L.concatUint8Array([h4, wi(h4.subarray(0, 8), h4.subarray(1, 9))]), l2 = L.shiftRight(f2.subarray(0 + (u2 >> 3), 17 + (u2 >> 3)), 8 - (7 & u2)).subarray(1), y2 = new Uint8Array(gi), g2 = new Uint8Array(t3.length + pi);
    let p2, d3 = 0;
    for (p2 = 0; p2 < o4; p2++) Ai(l2, a3[di(p2 + 1)]), g2.set(Ai(e3(wi(l2, t3)), l2), d3), Ai(y2, e3 === i3 ? t3 : g2.subarray(d3)), t3 = t3.subarray(gi), d3 += gi;
    if (t3.length) {
      Ai(l2, a3.x);
      const r5 = i3(l2);
      g2.set(wi(t3, r5), d3);
      const n4 = new Uint8Array(gi);
      n4.set(e3 === i3 ? t3 : g2.subarray(d3, -16), 0), n4[t3.length] = 128, Ai(y2, n4), d3 += t3.length;
    }
    const A2 = Ai(i3(Ai(Ai(y2, l2), a3.$)), function(e4) {
      if (!e4.length) return mi;
      const t4 = e4.length / gi | 0, r5 = new Uint8Array(gi), n4 = new Uint8Array(gi);
      for (let s5 = 0; s5 < t4; s5++) Ai(r5, a3[di(s5 + 1)]), Ai(n4, i3(wi(r5, e4))), e4 = e4.subarray(gi);
      if (e4.length) {
        Ai(r5, a3.x);
        const t5 = new Uint8Array(gi);
        t5.set(e4, 0), t5[e4.length] = 128, Ai(t5, r5), Ai(n4, i3(t5));
      }
      return n4;
    }(s4));
    return g2.set(A2, d3), g2;
  }
  return function() {
    const e3 = i3(mi), t3 = L.double(e3);
    a3 = [], a3[0] = L.double(t3), a3.x = e3, a3.$ = t3;
  }(), { encrypt: async function(e3, t3, r4) {
    return o3(i3, e3, t3, r4);
  }, decrypt: async function(e3, t3, r4) {
    if (e3.length < pi) throw Error("Invalid OCB ciphertext");
    const n4 = e3.subarray(-16);
    e3 = e3.subarray(0, -16);
    const i4 = o3(s3, e3, t3, r4);
    if (L.equalsUint8Array(n4, i4.subarray(-16))) return i4.subarray(0, -16);
    throw Error("Authentication tag mismatch");
  } };
}
async function Ki(e2, t2) {
  if (e2 !== R.symmetric.aes128 && e2 !== R.symmetric.aes192 && e2 !== R.symmetric.aes256) throw Error("GCM mode supports only AES cipher");
  if (L.getNodeCrypto()) return { encrypt: async function(e3, r3, n3 = new Uint8Array()) {
    const i3 = new vi.createCipheriv("aes-" + 8 * t2.length + "-gcm", t2, r3);
    i3.setAAD(n3);
    const s3 = Ii.concat([i3.update(e3), i3.final(), i3.getAuthTag()]);
    return new Uint8Array(s3);
  }, decrypt: async function(e3, r3, n3 = new Uint8Array()) {
    const i3 = new vi.createDecipheriv("aes-" + 8 * t2.length + "-gcm", t2, r3);
    i3.setAAD(n3), i3.setAuthTag(e3.slice(e3.length - Bi, e3.length));
    const s3 = Ii.concat([i3.update(e3.slice(0, e3.length - Bi)), i3.final()]);
    return new Uint8Array(s3);
  } };
  if (L.getWebCrypto()) try {
    const e3 = await Ei.importKey("raw", t2, { name: Si }, false, ["encrypt", "decrypt"]), r3 = navigator.userAgent.match(/Version\/13\.\d(\.\d)* Safari/) || navigator.userAgent.match(/Version\/(13|14)\.\d(\.\d)* Mobile\/\S* Safari/);
    return { encrypt: async function(n3, i3, s3 = new Uint8Array()) {
      if (r3 && !n3.length) return dr(t2, i3, s3).encrypt(n3);
      const a3 = await Ei.encrypt({ name: Si, iv: i3, additionalData: s3, tagLength: 128 }, e3, n3);
      return new Uint8Array(a3);
    }, decrypt: async function(n3, i3, s3 = new Uint8Array()) {
      if (r3 && n3.length === Bi) return dr(t2, i3, s3).decrypt(n3);
      try {
        const t3 = await Ei.decrypt({ name: Si, iv: i3, additionalData: s3, tagLength: 128 }, e3, n3);
        return new Uint8Array(t3);
      } catch (e4) {
        if ("OperationError" === e4.name) throw Error("Authentication tag mismatch");
      }
    } };
  } catch (e3) {
    if ("NotSupportedError" !== e3.name && (24 !== t2.length || "OperationError" !== e3.name)) throw e3;
    L.printDebugError("Browser did not support operation: " + e3.message);
  }
  return { encrypt: async function(e3, r3, n3) {
    return dr(t2, r3, n3).encrypt(e3);
  }, decrypt: async function(e3, r3, n3) {
    return dr(t2, r3, n3).decrypt(e3);
  } };
}
function Ci(e2, t2 = false) {
  switch (e2) {
    case R.aead.eax:
      return yi;
    case R.aead.ocb:
      return ki;
    case R.aead.gcm:
      return Ki;
    case R.aead.experimentalGCM:
      if (!t2) throw Error("Unexpected non-standard `experimentalGCM` AEAD algorithm provided in `config.preferredAEADAlgorithm`: use `gcm` instead");
      return Ki;
    default:
      throw Error("Unsupported AEAD mode");
  }
}
async function Di(e2, t2, r3, n3, i3, s3) {
  switch (e2) {
    case R.publicKey.rsaEncryptSign:
    case R.publicKey.rsaEncrypt:
    case R.publicKey.rsaSign: {
      const { n: e3, e: a3 } = n3;
      return Ve(t2, i3, L.leftPad(r3.s, e3.length), e3, a3, s3);
    }
    case R.publicKey.dsa: {
      const { g: e3, p: t3, q: i4, y: a3 } = n3, { r: o3, s: c3 } = r3;
      return async function(e4, t4, r4, n4, i5, s4, a4, o4) {
        if (t4 = ne(t4), r4 = ne(r4), s4 = ne(s4), a4 = ne(a4), i5 = ne(i5), o4 = ne(o4), t4 <= Bn || t4 >= a4 || r4 <= Bn || r4 >= a4) return L.printDebug("invalid DSA Signature"), false;
        const c4 = ie(ne(n4.subarray(0, le(a4))), a4), u2 = ce(r4, a4);
        if (u2 === Bn) return L.printDebug("invalid DSA Signature"), false;
        i5 = ie(i5, s4), o4 = ie(o4, s4);
        const h4 = ie(c4 * u2, a4), f2 = ie(t4 * u2, a4);
        return ie(ie(ae(i5, h4, s4) * ae(o4, f2, s4), s4), a4) === t4;
      }(0, o3, c3, s3, e3, t3, i4, a3);
    }
    case R.publicKey.ecdsa: {
      const { oid: e3, Q: a3 } = n3, o3 = new Zr(e3).payloadSize;
      return cn(e3, t2, { r: L.leftPad(r3.r, o3), s: L.leftPad(r3.s, o3) }, i3, a3, s3);
    }
    case R.publicKey.eddsaLegacy: {
      const { oid: e3, Q: i4 } = n3, a3 = new Zr(e3).payloadSize;
      return ln(e3, t2, { r: L.leftPad(r3.r, a3), s: L.leftPad(r3.s, a3) }, 0, i4, s3);
    }
    case R.publicKey.ed25519:
    case R.publicKey.ed448: {
      const { A: i4 } = n3;
      return yt(e2, t2, r3, 0, i4, s3);
    }
    default:
      throw Error("Unknown signature algorithm.");
  }
}
async function Ui(e2, t2, r3, n3, i3, s3) {
  if (!r3 || !n3) throw Error("Missing key parameters");
  switch (e2) {
    case R.publicKey.rsaEncryptSign:
    case R.publicKey.rsaEncrypt:
    case R.publicKey.rsaSign: {
      const { n: e3, e: a3 } = r3, { d: o3, p: c3, q: u2, u: h4 } = n3;
      return { s: await je(t2, i3, e3, a3, o3, c3, u2, h4, s3) };
    }
    case R.publicKey.dsa: {
      const { g: e3, p: t3, q: i4 } = r3, { x: a3 } = n3;
      return async function(e4, t4, r4, n4, i5, s4) {
        const a4 = BigInt(0);
        let o3, c3, u2, h4;
        n4 = ne(n4), i5 = ne(i5), r4 = ne(r4), s4 = ne(s4), r4 = ie(r4, n4), s4 = ie(s4, i5);
        const f2 = ie(ne(t4.subarray(0, le(i5))), i5);
        for (; ; ) {
          if (o3 = de(Sn, i5), c3 = ie(ae(r4, o3, n4), i5), c3 === a4) continue;
          const e5 = ie(s4 * c3, i5);
          if (h4 = ie(f2 + e5, i5), u2 = ie(ce(o3, i5) * h4, i5), u2 !== a4) break;
        }
        return { r: ye(c3, "be", le(n4)), s: ye(u2, "be", le(n4)) };
      }(0, s3, e3, t3, i4, a3);
    }
    case R.publicKey.elgamal:
      throw Error("Signing with Elgamal is not defined in the OpenPGP standard.");
    case R.publicKey.ecdsa: {
      const { oid: e3, Q: a3 } = r3, { d: o3 } = n3;
      return on(e3, t2, i3, a3, o3, s3);
    }
    case R.publicKey.eddsaLegacy: {
      const { oid: e3, Q: i4 } = r3, { seed: a3 } = n3;
      return fn(e3, t2, 0, i4, a3, s3);
    }
    case R.publicKey.ed25519:
    case R.publicKey.ed448: {
      const { A: i4 } = r3, { seed: a3 } = n3;
      return lt(e2, t2, 0, i4, a3, s3);
    }
    default:
      throw Error("Unknown signature algorithm.");
  }
}
function Ti(e2, t2 = F) {
  switch (e2) {
    case R.s2k.argon2:
      return new Mi(t2);
    case R.s2k.iterated:
    case R.s2k.gnu:
    case R.s2k.salted:
    case R.s2k.simple:
      return new Ri(e2, t2);
    default:
      throw new ot("Unsupported S2K type");
  }
}
function Li(e2) {
  const { s2kType: t2 } = e2;
  if (!Fi.has(t2)) throw Error("The provided `config.s2kType` value is not allowed");
  return Ti(t2, e2);
}
function Ns(e2, t2, r3) {
  const n3 = [];
  return n3.push(tt(r3.length + 1)), n3.push(new Uint8Array([(t2 ? 128 : 0) | e2])), n3.push(r3), L.concat(n3);
}
function Os(e2) {
  switch (e2) {
    case R.hash.sha256:
      return 16;
    case R.hash.sha384:
      return 24;
    case R.hash.sha512:
      return 32;
    case R.hash.sha224:
    case R.hash.sha3_256:
      return 16;
    case R.hash.sha3_512:
      return 32;
    default:
      throw Error("Unsupported hash function");
  }
}
function zs(e2, t2) {
  if (!t2[e2]) {
    let t3;
    try {
      t3 = R.read(R.packet, e2);
    } catch {
      throw new ct("Unknown packet type with tag: " + e2);
    }
    throw Error("Packet not allowed in this context: " + t3);
  }
  return new t2[e2]();
}
function Zs(e2, t2) {
  return (r3) => {
    let n3;
    if (n3 = o2(r3) ? new ReadableStream({ async start(e3) {
      try {
        e3.enqueue(await D(r3)), e3.close();
      } catch (t3) {
        e3.error(t3);
      }
    } }) : u(r3) ? r3 : p(r3), n3 = function(e3) {
      const t3 = x(e3);
      return new ReadableStream({ async pull(e4) {
        try {
          const { value: r4, done: n4 } = await t3.read();
          if (n4) return void e4.close();
          for (let t4 = 0; t4 <= r4.length; t4 += 65536) (!t4 || t4 < r4.length) && e4.enqueue(r4.subarray(t4, t4 + 65536));
        } catch (t4) {
          e4.error(t4);
        }
      } }, { highWaterMark: 0 });
    }(n3), e2) try {
      const t3 = e2();
      return n3.pipeThrough(t3);
    } catch (e3) {
      if ("TypeError" !== e3.name) throw e3;
    }
    const i3 = x(n3), s3 = new t2();
    let a3 = false, c3 = false;
    return new ReadableStream({ start(e3) {
      s3.ondata = (t3, r4) => {
        e3.enqueue(t3), a3 = true, r4 && (e3.close(), c3 = true);
      };
    }, async pull() {
      for (a3 = false; !a3 && !c3; ) {
        const { done: e3, value: t3 } = await i3.read();
        if (e3) return void s3.push(new Uint8Array(), true);
        t3.length && s3.push(t3);
      }
    } }, { highWaterMark: 0 });
  };
}
function Js() {
  return async function(e2) {
    const { default: t2 } = await Promise.resolve().then(function() {
      return Jy;
    });
    return t2(p(e2));
  };
}
async function ra(e2, t2, r3, n3) {
  const i3 = e2 instanceof ta && 2 === e2.version, s3 = !i3 && e2.constructor.tag === R.packet.aeadEncryptedData;
  if (!i3 && !s3) throw Error("Unexpected packet type");
  const a3 = Ci(e2.aeadAlgorithm, s3), o3 = "decrypt" === t2 ? a3.tagLength : 0, c3 = "encrypt" === t2 ? a3.tagLength : 0, u2 = 2 ** (e2.chunkSizeByte + 6) + o3, h4 = s3 ? 8 : 0, f2 = new ArrayBuffer(13 + h4), l2 = new Uint8Array(f2, 0, 5 + h4), y2 = new Uint8Array(f2), g2 = new DataView(f2), p2 = new Uint8Array(f2, 5, 8);
  l2.set([192 | e2.constructor.tag, e2.version, e2.cipherAlgorithm, e2.aeadAlgorithm, e2.chunkSizeByte], 0);
  let d3, A2, m2 = 0, b2 = Promise.resolve(), k2 = 0, E2 = 0;
  if (i3) {
    const { keySize: t3 } = Kr(e2.cipherAlgorithm), { ivLength: n4 } = a3, i4 = new Uint8Array(f2, 0, 5), s4 = await Pr(R.hash.sha256, r3, e2.salt, i4, t3 + n4);
    r3 = s4.subarray(0, t3), d3 = s4.subarray(t3), d3.fill(0, d3.length - 8), A2 = new DataView(d3.buffer, d3.byteOffset, d3.byteLength);
  } else d3 = e2.iv;
  const I2 = await a3(e2.cipherAlgorithm, r3);
  return v(n3, async (r4, n4) => {
    if ("array" !== L.isStream(r4)) {
      const t3 = new TransformStream({}, { highWaterMark: L.getHardwareConcurrency() * 2 ** (e2.chunkSizeByte + 6), size: (e3) => e3.length });
      w(t3.readable, n4), n4 = t3.writable;
    }
    const s4 = x(r4), a4 = Q(n4);
    try {
      for (; ; ) {
        let e3 = await s4.readBytes(u2 + o3) || new Uint8Array();
        const r5 = e3.subarray(e3.length - o3);
        let n5, f3, w2;
        if (e3 = e3.subarray(0, e3.length - o3), i3) w2 = d3;
        else {
          w2 = d3.slice();
          for (let e4 = 0; e4 < 8; e4++) w2[d3.length - 8 + e4] ^= p2[e4];
        }
        if (!m2 || e3.length ? (s4.unshift(r5), n5 = I2[t2](e3, w2, l2), n5.catch(() => {
        }), E2 += e3.length - o3 + c3) : (g2.setInt32(5 + h4 + 4, k2), n5 = I2[t2](r5, w2, y2), n5.catch(() => {
        }), E2 += c3, f3 = true), k2 += e3.length - o3, b2 = b2.then(() => n5).then(async (e4) => {
          await a4.ready, await a4.write(e4), E2 -= e4.length;
        }).catch((e4) => a4.abort(e4)), (f3 || E2 > a4.desiredSize) && await b2, f3) {
          await a4.close();
          break;
        }
        i3 ? A2.setInt32(d3.length - 4, ++m2) : g2.setInt32(9, ++m2);
      }
    } catch (e3) {
      await a4.ready.catch(() => {
      }), await a4.abort(e3);
    }
  });
}
function aa(e2, t2, r3, n3) {
  switch (t2) {
    case R.publicKey.rsaEncrypt:
    case R.publicKey.rsaEncryptSign:
    case R.publicKey.elgamal:
    case R.publicKey.ecdh:
      return L.concatUint8Array([new Uint8Array(6 === e2 ? [] : [r3]), n3, L.writeChecksum(n3.subarray(n3.length % 8))]);
    case R.publicKey.x25519:
    case R.publicKey.x448:
      return n3;
    default:
      throw Error("Unsupported public key algorithm");
  }
}
async function pa(e2, t2, r3, n3, i3, s3, a3, o3) {
  if ("argon2" === t2.type && !i3) throw Error("Using Argon2 S2K without AEAD is not allowed");
  if ("simple" === t2.type && 6 === e2) throw Error("Using Simple S2K with version 6 keys is not allowed");
  const { keySize: c3 } = Kr(n3), u2 = await t2.produceKey(r3, c3, o3);
  if (!i3 || 5 === e2 || a3) return u2;
  const h4 = L.concatUint8Array([s3, new Uint8Array([e2, n3, i3])]);
  return Pr(R.hash.sha256, u2, new Uint8Array(), h4, c3);
}
async function Ea({ armoredSignature: e2, binarySignature: t2, config: r3, ...n3 }) {
  r3 = { ...F, ...r3 };
  let i3 = e2 || t2;
  if (!i3) throw Error("readSignature: must pass options object containing `armoredSignature` or `binarySignature`");
  if (e2 && !L.isString(e2)) throw Error("readSignature: options.armoredSignature must be a string");
  if (t2 && !L.isUint8Array(t2)) throw Error("readSignature: options.binarySignature must be a Uint8Array");
  const s3 = Object.keys(n3);
  if (s3.length > 0) throw Error("Unknown option: " + s3.join(", "));
  if (e2) {
    const { type: e3, data: t3 } = await $(i3);
    if (e3 !== R.armor.signature) throw Error("Armored text not of type signature");
    i3 = t3;
  }
  const a3 = await Gs.fromBinary(i3, ba, r3);
  return new ka(a3);
}
async function va(e2, t2) {
  const r3 = new Aa(e2.date, t2);
  return r3.packets = null, r3.algorithm = R.write(R.publicKey, e2.algorithm), await r3.generate(e2.rsaBits, e2.curve), await r3.computeFingerprintAndKeyID(), r3;
}
async function Ia(e2, t2) {
  const r3 = new ga(e2.date, t2);
  return r3.packets = null, r3.algorithm = R.write(R.publicKey, e2.algorithm), await r3.generate(e2.rsaBits, e2.curve, e2.config), await r3.computeFingerprintAndKeyID(), r3;
}
async function Ba(e2, t2, r3, n3, i3 = /* @__PURE__ */ new Date(), s3) {
  let a3, o3;
  for (let c3 = e2.length - 1; c3 >= 0; c3--) try {
    (!a3 || e2[c3].created >= a3.created) && (await e2[c3].verify(t2, r3, n3, i3, void 0, s3), a3 = e2[c3]);
  } catch (e3) {
    o3 = e3;
  }
  if (!a3) throw L.wrapError(`Could not find valid ${R.read(R.signature, r3)} signature in key ${t2.getKeyID().toHex()}`.replace("certGeneric ", "self-").replace(/([a-z])([A-Z])/g, (e3, t3, r4) => t3 + " " + r4.toLowerCase()), o3);
  return a3;
}
function Sa(e2, t2, r3 = /* @__PURE__ */ new Date()) {
  const n3 = L.normalizeDate(r3);
  if (null !== n3) {
    const r4 = xa(e2, t2);
    return !(e2.created <= n3 && n3 < r4);
  }
  return false;
}
async function Ka(e2, t2, r3, n3) {
  const i3 = {};
  i3.key = t2, i3.bind = e2;
  const s3 = { signatureType: R.signature.subkeyBinding };
  r3.sign ? (s3.keyFlags = [R.keyFlags.signData], s3.embeddedSignature = await Da(i3, [], e2, { signatureType: R.signature.keyBinding }, r3.date, void 0, void 0, void 0, n3)) : s3.keyFlags = [R.keyFlags.encryptCommunication | R.keyFlags.encryptStorage], r3.keyExpirationTime > 0 && (s3.keyExpirationTime = r3.keyExpirationTime, s3.keyNeverExpires = false);
  return await Da(i3, [], t2, s3, r3.date, void 0, void 0, void 0, n3);
}
async function Ca(e2, t2, r3 = /* @__PURE__ */ new Date(), n3 = [], i3) {
  const s3 = R.hash.sha256, a3 = i3.preferredHashAlgorithm, o3 = await Promise.all(e2.map(async (e3, t3) => (await e3.getPrimarySelfSignature(r3, n3[t3], i3)).preferredHashAlgorithms || [])), c3 = /* @__PURE__ */ new Map();
  for (const e3 of o3) for (const t3 of e3) try {
    const e4 = R.write(R.hash, t3);
    c3.set(e4, c3.has(e4) ? c3.get(e4) + 1 : 1);
  } catch {
  }
  const u2 = (t3) => 0 === e2.length || c3.get(t3) === e2.length || t3 === s3, h4 = () => {
    if (0 === c3.size) return s3;
    const e3 = Array.from(c3.keys()).filter((e4) => u2(e4)).sort((e4, t3) => Fe(e4) - Fe(t3))[0];
    return Fe(e3) >= Fe(s3) ? e3 : s3;
  };
  if ((/* @__PURE__ */ new Set([R.publicKey.ecdsa, R.publicKey.eddsaLegacy, R.publicKey.ed25519, R.publicKey.ed448])).has(t2.algorithm)) {
    const e3 = function(e4, t3) {
      switch (e4) {
        case R.publicKey.ecdsa:
        case R.publicKey.eddsaLegacy:
          return Wr(t3);
        case R.publicKey.ed25519:
        case R.publicKey.ed448:
          return dt(e4);
        default:
          throw Error("Unknown elliptic signing algo");
      }
    }(t2.algorithm, t2.publicParams.oid), r4 = u2(a3), n4 = Fe(a3) >= Fe(e3);
    if (r4 && n4) return a3;
    {
      const t3 = h4();
      return Fe(t3) >= Fe(e3) ? t3 : e3;
    }
  }
  return u2(a3) ? a3 : h4();
}
async function Da(e2, t2, r3, n3, i3, s3, a3 = [], o3 = false, c3) {
  if (r3.isDummy()) throw Error("Cannot sign with a gnu-dummy key.");
  if (!r3.isDecrypted()) throw Error("Signing key is not decrypted.");
  const u2 = new Ls();
  return Object.assign(u2, n3), u2.publicKeyAlgorithm = r3.algorithm, u2.hashAlgorithm = await Ca(t2, r3, i3, s3, c3), u2.rawNotations = [...a3], await u2.sign(r3, e2, i3, o3, c3), u2;
}
async function Ua(e2, t2, r3, n3 = /* @__PURE__ */ new Date(), i3) {
  (e2 = e2[r3]) && (t2[r3].length ? await Promise.all(e2.map(async function(e3) {
    e3.isExpired(n3) || i3 && !await i3(e3) || t2[r3].some(function(t3) {
      return L.equalsUint8Array(t3.writeParams(), e3.writeParams());
    }) || t2[r3].push(e3);
  })) : t2[r3] = e2);
}
async function Pa(e2, t2, r3, n3, i3, s3, a3 = /* @__PURE__ */ new Date(), o3) {
  s3 = s3 || e2;
  const c3 = [];
  return await Promise.all(n3.map(async function(e3) {
    try {
      if (!i3 || e3.issuerKeyID.equals(i3.issuerKeyID)) {
        const n4 = ![R.reasonForRevocation.keyRetired, R.reasonForRevocation.keySuperseded, R.reasonForRevocation.userIDInvalid].includes(e3.reasonForRevocationFlag);
        await e3.verify(s3, t2, r3, n4 ? null : a3, false, o3), c3.push(e3.issuerKeyID);
      }
    } catch {
    }
  })), i3 ? (i3.revoked = !!c3.some((e3) => e3.equals(i3.issuerKeyID)) || (i3.revoked || false), i3.revoked) : c3.length > 0;
}
function xa(e2, t2) {
  let r3;
  return false === t2.keyNeverExpires && (r3 = e2.created.getTime() + 1e3 * t2.keyExpirationTime), r3 ? new Date(r3) : 1 / 0;
}
function Qa(e2, t2 = {}) {
  switch (e2.type = e2.type || t2.type, e2.curve = e2.curve || t2.curve, e2.rsaBits = e2.rsaBits || t2.rsaBits, e2.keyExpirationTime = void 0 !== e2.keyExpirationTime ? e2.keyExpirationTime : t2.keyExpirationTime, e2.passphrase = L.isString(e2.passphrase) ? e2.passphrase : t2.passphrase, e2.date = e2.date || t2.date, e2.sign = e2.sign || false, e2.type) {
    case "ecc":
      try {
        e2.curve = R.write(R.curve, e2.curve);
      } catch {
        throw Error("Unknown curve");
      }
      e2.curve !== R.curve.ed25519Legacy && e2.curve !== R.curve.curve25519Legacy && "ed25519" !== e2.curve && "curve25519" !== e2.curve || (e2.curve = e2.sign ? R.curve.ed25519Legacy : R.curve.curve25519Legacy), e2.sign ? e2.algorithm = e2.curve === R.curve.ed25519Legacy ? R.publicKey.eddsaLegacy : R.publicKey.ecdsa : e2.algorithm = R.publicKey.ecdh;
      break;
    case "curve25519":
      e2.algorithm = e2.sign ? R.publicKey.ed25519 : R.publicKey.x25519;
      break;
    case "curve448":
      e2.algorithm = e2.sign ? R.publicKey.ed448 : R.publicKey.x448;
      break;
    case "rsa":
      e2.algorithm = R.publicKey.rsaEncryptSign;
      break;
    default:
      throw Error("Unsupported key type " + e2.type);
  }
  return e2;
}
function Ma(e2, t2, r3) {
  switch (e2.algorithm) {
    case R.publicKey.rsaEncryptSign:
    case R.publicKey.rsaSign:
    case R.publicKey.dsa:
    case R.publicKey.ecdsa:
    case R.publicKey.eddsaLegacy:
    case R.publicKey.ed25519:
    case R.publicKey.ed448:
      if (!t2.keyFlags && !r3.allowMissingKeyFlags) throw Error("None of the key flags is set: consider passing `config.allowMissingKeyFlags`");
      return !t2.keyFlags || !!(t2.keyFlags[0] & R.keyFlags.signData);
    default:
      return false;
  }
}
function Ra(e2, t2, r3) {
  switch (e2.algorithm) {
    case R.publicKey.rsaEncryptSign:
    case R.publicKey.rsaEncrypt:
    case R.publicKey.elgamal:
    case R.publicKey.ecdh:
    case R.publicKey.x25519:
    case R.publicKey.x448:
      if (!t2.keyFlags && !r3.allowMissingKeyFlags) throw Error("None of the key flags is set: consider passing `config.allowMissingKeyFlags`");
      return !t2.keyFlags || !!(t2.keyFlags[0] & R.keyFlags.encryptCommunication) || !!(t2.keyFlags[0] & R.keyFlags.encryptStorage);
    default:
      return false;
  }
}
function Fa(e2, t2, r3) {
  if (!t2.keyFlags && !r3.allowMissingKeyFlags) throw Error("None of the key flags is set: consider passing `config.allowMissingKeyFlags`");
  switch (e2.algorithm) {
    case R.publicKey.rsaEncryptSign:
    case R.publicKey.rsaEncrypt:
    case R.publicKey.elgamal:
    case R.publicKey.ecdh:
    case R.publicKey.x25519:
    case R.publicKey.x448:
      return !(!(!t2.keyFlags || !!(t2.keyFlags[0] & R.keyFlags.signData)) || !r3.allowInsecureDecryptionWithSigningKeys) || (!t2.keyFlags || !!(t2.keyFlags[0] & R.keyFlags.encryptCommunication) || !!(t2.keyFlags[0] & R.keyFlags.encryptStorage));
    default:
      return false;
  }
}
function Ta(e2, t2) {
  const r3 = R.write(R.publicKey, e2.algorithm), n3 = e2.getAlgorithmInfo();
  if (t2.rejectPublicKeyAlgorithms.has(r3)) throw Error(n3.algorithm + " keys are considered too weak.");
  switch (r3) {
    case R.publicKey.rsaEncryptSign:
    case R.publicKey.rsaSign:
    case R.publicKey.rsaEncrypt:
      if (n3.bits < t2.minRSABits) throw Error(`RSA keys shorter than ${t2.minRSABits} bits are considered too weak.`);
      break;
    case R.publicKey.ecdsa:
    case R.publicKey.eddsaLegacy:
    case R.publicKey.ecdh:
      if (t2.rejectCurves.has(n3.curve)) throw Error(`Support for ${n3.algorithm} keys using curve ${n3.curve} is disabled.`);
  }
}
function _a(e2) {
  for (const t2 of e2) switch (t2.constructor.tag) {
    case R.packet.secretKey:
      return new Va(e2);
    case R.packet.publicKey:
      return new ja(e2);
  }
  throw Error("No key packet found");
}
async function Ya(e2, t2, r3, n3) {
  r3.passphrase && await e2.encrypt(r3.passphrase, n3), await Promise.all(t2.map(async function(e3, t3) {
    const i4 = r3.subkeys[t3].passphrase;
    i4 && await e3.encrypt(i4, n3);
  }));
  const i3 = new Gs();
  function s3(e3, t3) {
    return [t3, ...e3.filter((e4) => e4 !== t3)];
  }
  function a3() {
    const e3 = {};
    e3.keyFlags = [R.keyFlags.certifyKeys | R.keyFlags.signData];
    const t3 = s3([R.symmetric.aes256, R.symmetric.aes128], n3.preferredSymmetricAlgorithm);
    if (e3.preferredSymmetricAlgorithms = t3, n3.aeadProtect) {
      const r4 = s3([R.aead.gcm, R.aead.eax, R.aead.ocb], n3.preferredAEADAlgorithm);
      e3.preferredCipherSuites = r4.flatMap((e4) => t3.map((t4) => [t4, e4]));
    }
    return e3.preferredHashAlgorithms = s3([R.hash.sha512, R.hash.sha256, R.hash.sha3_512, R.hash.sha3_256], n3.preferredHashAlgorithm), e3.preferredCompressionAlgorithms = s3([R.compression.uncompressed, R.compression.zlib, R.compression.zip], n3.preferredCompressionAlgorithm), e3.features = [0], e3.features[0] |= R.features.modificationDetection, n3.aeadProtect && (e3.features[0] |= R.features.seipdv2), r3.keyExpirationTime > 0 && (e3.keyExpirationTime = r3.keyExpirationTime, e3.keyNeverExpires = false), e3;
  }
  if (i3.push(e2), 6 === e2.version) {
    const t3 = { key: e2 }, s4 = a3();
    s4.signatureType = R.signature.key;
    const o4 = await Da(t3, [], e2, s4, r3.date, void 0, r3.signatureNotations, void 0, n3);
    i3.push(o4);
  }
  await Promise.all(r3.userIDs.map(async function(t3, i4) {
    const s4 = da.fromObject(t3), o4 = { userID: s4, key: e2 }, c3 = 6 !== e2.version ? a3() : {};
    c3.signatureType = R.signature.certPositive, 0 === i4 && (c3.isPrimaryUserID = true);
    return { userIDPacket: s4, signaturePacket: await Da(o4, [], e2, c3, r3.date, void 0, r3.signatureNotations, void 0, n3) };
  })).then((e3) => {
    e3.forEach(({ userIDPacket: e4, signaturePacket: t3 }) => {
      i3.push(e4), i3.push(t3);
    });
  }), await Promise.all(t2.map(async function(t3, i4) {
    const s4 = r3.subkeys[i4];
    return { secretSubkeyPacket: t3, subkeySignaturePacket: await Ka(t3, e2, s4, n3) };
  })).then((e3) => {
    e3.forEach(({ secretSubkeyPacket: e4, subkeySignaturePacket: t3 }) => {
      i3.push(e4), i3.push(t3);
    });
  });
  const o3 = { key: e2 };
  return i3.push(await Da(o3, [], e2, { signatureType: R.signature.keyRevocation, reasonForRevocationFlag: R.reasonForRevocation.noReason, reasonForRevocationString: "" }, r3.date, void 0, void 0, void 0, n3)), r3.passphrase && e2.clearPrivateParams(), t2.map(function(e3, t3) {
    r3.subkeys[t3].passphrase && e3.clearPrivateParams();
  }), new Va(i3);
}
async function Za({ armoredKey: e2, binaryKey: t2, config: r3, ...n3 }) {
  if (r3 = { ...F, ...r3 }, !e2 && !t2) throw Error("readKey: must pass options object containing `armoredKey` or `binaryKey`");
  if (e2 && !L.isString(e2)) throw Error("readKey: options.armoredKey must be a string");
  if (t2 && !L.isUint8Array(t2)) throw Error("readKey: options.binaryKey must be a Uint8Array");
  const i3 = Object.keys(n3);
  if (i3.length > 0) throw Error("Unknown option: " + i3.join(", "));
  let s3;
  if (e2) {
    const { type: t3, data: r4 } = await $(e2);
    if (t3 !== R.armor.publicKey && t3 !== R.armor.privateKey) throw Error("Armored text not of type key");
    s3 = r4;
  } else s3 = t2;
  const a3 = await Gs.fromBinary(s3, qa, r3), o3 = a3.indexOfTag(R.packet.publicKey, R.packet.secretKey);
  if (0 === o3.length) throw Error("No key packet found");
  return _a(a3.slice(o3[0], o3[1]));
}
async function Ja({ armoredKey: e2, binaryKey: t2, config: r3, ...n3 }) {
  if (r3 = { ...F, ...r3 }, !e2 && !t2) throw Error("readPrivateKey: must pass options object containing `armoredKey` or `binaryKey`");
  if (e2 && !L.isString(e2)) throw Error("readPrivateKey: options.armoredKey must be a string");
  if (t2 && !L.isUint8Array(t2)) throw Error("readPrivateKey: options.binaryKey must be a Uint8Array");
  const i3 = Object.keys(n3);
  if (i3.length > 0) throw Error("Unknown option: " + i3.join(", "));
  let s3;
  if (e2) {
    const { type: t3, data: r4 } = await $(e2);
    if (t3 !== R.armor.privateKey) throw Error("Armored text not of type private key");
    s3 = r4;
  } else s3 = t2;
  const a3 = await Gs.fromBinary(s3, qa, r3), o3 = a3.indexOfTag(R.packet.publicKey, R.packet.secretKey);
  for (let e3 = 0; e3 < o3.length; e3++) {
    if (a3[o3[e3]].constructor.tag === R.packet.publicKey) continue;
    const t3 = a3.slice(o3[e3], o3[e3 + 1]);
    return new Va(t3);
  }
  throw Error("No secret key packet found");
}
async function Wa({ armoredKeys: e2, binaryKeys: t2, config: r3, ...n3 }) {
  r3 = { ...F, ...r3 };
  let i3 = e2 || t2;
  if (!i3) throw Error("readKeys: must pass options object containing `armoredKeys` or `binaryKeys`");
  if (e2 && !L.isString(e2)) throw Error("readKeys: options.armoredKeys must be a string");
  if (t2 && !L.isUint8Array(t2)) throw Error("readKeys: options.binaryKeys must be a Uint8Array");
  const s3 = Object.keys(n3);
  if (s3.length > 0) throw Error("Unknown option: " + s3.join(", "));
  if (e2) {
    const { type: t3, data: r4 } = await $(e2);
    if (t3 !== R.armor.publicKey && t3 !== R.armor.privateKey) throw Error("Armored text not of type key");
    i3 = r4;
  }
  const a3 = [], o3 = await Gs.fromBinary(i3, qa, r3), c3 = o3.indexOfTag(R.packet.publicKey, R.packet.secretKey);
  if (0 === c3.length) throw Error("No key packet found");
  for (let e3 = 0; e3 < c3.length; e3++) {
    const t3 = _a(o3.slice(c3[e3], c3[e3 + 1]));
    a3.push(t3);
  }
  return a3;
}
async function Xa({ armoredKeys: e2, binaryKeys: t2, config: r3 }) {
  r3 = { ...F, ...r3 };
  let n3 = e2 || t2;
  if (!n3) throw Error("readPrivateKeys: must pass options object containing `armoredKeys` or `binaryKeys`");
  if (e2 && !L.isString(e2)) throw Error("readPrivateKeys: options.armoredKeys must be a string");
  if (t2 && !L.isUint8Array(t2)) throw Error("readPrivateKeys: options.binaryKeys must be a Uint8Array");
  if (e2) {
    const { type: t3, data: r4 } = await $(e2);
    if (t3 !== R.armor.privateKey) throw Error("Armored text not of type private key");
    n3 = r4;
  }
  const i3 = [], s3 = await Gs.fromBinary(n3, qa, r3), a3 = s3.indexOfTag(R.packet.publicKey, R.packet.secretKey);
  for (let e3 = 0; e3 < a3.length; e3++) {
    if (s3[a3[e3]].constructor.tag === R.packet.publicKey) continue;
    const t3 = s3.slice(a3[e3], a3[e3 + 1]), r4 = new Va(t3);
    i3.push(r4);
  }
  if (0 === i3.length) throw Error("No secret key packet found");
  return i3;
}
async function no(e2, t2, r3 = [], n3 = null, i3 = [], s3 = /* @__PURE__ */ new Date(), a3 = [], o3 = [], c3 = [], u2 = false, h4 = F) {
  const f2 = new Gs(), l2 = null === e2.text ? R.signature.binary : R.signature.text;
  if (await Promise.all(t2.map(async (t3, n4) => {
    const f3 = a3[n4];
    if (!t3.isPrivate()) throw Error("Need private key for signing");
    const y2 = await t3.getSigningKey(i3[n4], s3, f3, h4);
    return Da(e2, r3.length ? r3 : [t3], y2.keyPacket, { signatureType: l2 }, s3, o3, c3, u2, h4);
  })).then((e3) => {
    f2.push(...e3);
  }), n3) {
    const e3 = n3.packets.filterByTag(R.packet.signature);
    f2.push(...e3);
  }
  return f2;
}
function io(e2, t2, r3, n3 = /* @__PURE__ */ new Date(), i3 = false, s3 = F) {
  return e2.filter((e3) => ["text", "binary"].includes(R.read(R.signature, e3.signatureType))).map((e3) => function(e4, t3, r4, n4 = /* @__PURE__ */ new Date(), i4 = false, s4 = F) {
    let a3, o3;
    for (const t4 of r4) {
      const r5 = t4.getKeys(e4.issuerKeyID);
      if (r5.length > 0) {
        a3 = t4, o3 = r5[0];
        break;
      }
    }
    const c3 = e4 instanceof Hs ? e4.correspondingSig : e4, u2 = { keyID: e4.issuerKeyID, verified: (async () => {
      if (!o3) throw Error("Could not find signing key with key ID " + e4.issuerKeyID.toHex());
      await e4.verify(o3.keyPacket, e4.signatureType, t3[0], n4, i4, s4);
      const r5 = await c3;
      if (o3.getCreationTime() > r5.created) throw Error("Key is newer than the signature");
      try {
        await a3.getSigningKey(o3.getKeyID(), r5.created, void 0, s4);
      } catch (e5) {
        if (!s4.allowInsecureVerificationWithReformattedKeys || !e5.message.match(/Signature creation time is in the future/)) throw e5;
        await a3.getSigningKey(o3.getKeyID(), n4, void 0, s4);
      }
      return true;
    })(), signature: (async () => {
      const e5 = await c3, t4 = new Gs();
      return e5 && t4.push(e5), new ka(t4);
    })() };
    return u2.signature.catch(() => {
    }), u2.verified.catch(() => {
    }), u2;
  }(e3, t2, r3, n3, i3, s3));
}
async function so({ armoredMessage: e2, binaryMessage: t2, config: r3, ...n3 }) {
  r3 = { ...F, ...r3 };
  let i3 = e2 || t2;
  if (!i3) throw Error("readMessage: must pass options object containing `armoredMessage` or `binaryMessage`");
  if (e2 && !L.isString(e2) && !L.isStream(e2)) throw Error("readMessage: options.armoredMessage must be a string or stream");
  if (t2 && !L.isUint8Array(t2) && !L.isStream(t2)) throw Error("readMessage: options.binaryMessage must be a Uint8Array or stream");
  const s3 = Object.keys(n3);
  if (s3.length > 0) throw Error("Unknown option: " + s3.join(", "));
  const a3 = L.isStream(i3);
  if (e2) {
    const { type: e3, data: t3 } = await $(i3);
    if (e3 !== R.armor.message) throw Error("Armored text not of type message");
    i3 = t3;
  }
  const o3 = await Gs.fromBinary(i3, $a, r3, new qs()), c3 = new ro(o3);
  return c3.fromStream = a3, c3;
}
async function ao({ text: e2, binary: t2, filename: r3, date: n3 = /* @__PURE__ */ new Date(), format: i3 = void 0 !== e2 ? "utf8" : "binary", ...s3 }) {
  const a3 = void 0 !== e2 ? e2 : t2;
  if (void 0 === a3) throw Error("createMessage: must pass options object containing `text` or `binary`");
  if (e2 && !L.isString(e2) && !L.isStream(e2)) throw Error("createMessage: options.text must be a string or stream");
  if (t2 && !L.isUint8Array(t2) && !L.isStream(t2)) throw Error("createMessage: options.binary must be a Uint8Array or stream");
  const o3 = Object.keys(s3);
  if (o3.length > 0) throw Error("Unknown option: " + o3.join(", "));
  const c3 = L.isStream(a3), u2 = new Qs(n3);
  void 0 !== e2 ? u2.setText(a3, R.write(R.literal, i3)) : u2.setBytes(a3, R.write(R.literal, i3)), void 0 !== r3 && u2.setFilename(r3);
  const h4 = new Gs();
  h4.push(u2);
  const f2 = new ro(h4);
  return f2.fromStream = c3, f2;
}
async function uo({ cleartextMessage: e2, config: t2, ...r3 }) {
  if (t2 = { ...F, ...t2 }, !e2) throw Error("readCleartextMessage: must pass options object containing `cleartextMessage`");
  if (!L.isString(e2)) throw Error("readCleartextMessage: options.cleartextMessage must be a string");
  const n3 = Object.keys(r3);
  if (n3.length > 0) throw Error("Unknown option: " + n3.join(", "));
  const i3 = await $(e2);
  if (i3.type !== R.armor.signed) throw Error("No cleartext signed message.");
  const s3 = await Gs.fromBinary(i3.data, oo, t2);
  !function(e3, t3) {
    const r4 = function(e4) {
      const r5 = (e5) => (t4) => e5.hashAlgorithm === t4;
      for (let n5 = 0; n5 < t3.length; n5++) if (t3[n5].constructor.tag === R.packet.signature && !e4.some(r5(t3[n5]))) return false;
      return true;
    }, n4 = [];
    if (e3.forEach((e4) => {
      const t4 = e4.match(/^Hash: (.+)$/);
      if (!t4) throw Error('Only "Hash" header allowed in cleartext signed message');
      {
        const e5 = t4[1].replace(/\s/g, "").split(",").map((e6) => {
          try {
            return R.write(R.hash, e6.toLowerCase());
          } catch {
            throw Error("Unknown hash algorithm in armor header: " + e6.toLowerCase());
          }
        });
        n4.push(...e5);
      }
    }), n4.length && !r4(n4)) throw Error("Hash algorithm mismatch in armor header and signature");
  }(i3.headers, s3);
  const a3 = new ka(s3);
  return new co(i3.text, a3);
}
async function ho({ text: e2, ...t2 }) {
  if (!e2) throw Error("createCleartextMessage: must pass options object containing `text`");
  if (!L.isString(e2)) throw Error("createCleartextMessage: options.text must be a string");
  const r3 = Object.keys(t2);
  if (r3.length > 0) throw Error("Unknown option: " + r3.join(", "));
  return new co(e2);
}
async function fo({ userIDs: e2 = [], passphrase: t2, type: r3, curve: n3, rsaBits: i3 = 4096, keyExpirationTime: s3 = 0, date: a3 = /* @__PURE__ */ new Date(), subkeys: o3 = [{}], format: c3 = "armored", signatureNotations: u2 = [], config: h4, ...f2 }) {
  Co(h4 = { ...F, ...h4 }), r3 || n3 ? (r3 = r3 || "ecc", n3 = n3 || "curve25519Legacy") : (r3 = h4.v6Keys ? "curve25519" : "ecc", n3 = "curve25519Legacy"), e2 = Do(e2), u2 = Do(u2);
  const l2 = Object.keys(f2);
  if (l2.length > 0) throw Error("Unknown option: " + l2.join(", "));
  if (0 === e2.length && !h4.v6Keys) throw Error("UserIDs are required for V4 keys");
  if ("rsa" === r3 && i3 < h4.minRSABits) throw Error(`rsaBits should be at least ${h4.minRSABits}, got: ${i3}`);
  const y2 = { userIDs: e2, passphrase: t2, type: r3, rsaBits: i3, curve: n3, keyExpirationTime: s3, date: a3, subkeys: o3, signatureNotations: u2 };
  try {
    const { key: e3, revocationCertificate: t3 } = await async function(e4, t4) {
      e4.sign = true, (e4 = Qa(e4)).subkeys = e4.subkeys.map((t5, r5) => Qa(e4.subkeys[r5], e4));
      let r4 = [Ia(e4, t4)];
      r4 = r4.concat(e4.subkeys.map((e5) => va(e5, t4)));
      const n4 = await Promise.all(r4), i4 = await Ya(n4[0], n4.slice(1), e4, t4), s4 = await i4.getRevocationCertificate(e4.date, t4);
      return i4.revocationSignatures = [], { key: i4, revocationCertificate: s4 };
    }(y2, h4);
    return e3.getKeys().forEach(({ keyPacket: e4 }) => Ta(e4, h4)), { privateKey: xo(e3, c3, h4), publicKey: xo(e3.toPublic(), c3, h4), revocationCertificate: t3 };
  } catch (e3) {
    throw L.wrapError("Error generating keypair", e3);
  }
}
async function lo({ privateKey: e2, userIDs: t2 = [], passphrase: r3, keyExpirationTime: n3 = 0, date: i3, format: s3 = "armored", signatureNotations: a3 = [], config: o3, ...c3 }) {
  Co(o3 = { ...F, ...o3 }), t2 = Do(t2), a3 = Do(a3);
  const u2 = Object.keys(c3);
  if (u2.length > 0) throw Error("Unknown option: " + u2.join(", "));
  if (0 === t2.length && 6 !== e2.keyPacket.version) throw Error("UserIDs are required for V4 keys");
  const h4 = { privateKey: e2, userIDs: t2, passphrase: r3, keyExpirationTime: n3, date: i3, signatureNotations: a3 };
  try {
    const { key: e3, revocationCertificate: t3 } = await async function(e4, t4) {
      e4 = o4(e4);
      const { privateKey: r4 } = e4;
      if (!r4.isPrivate()) throw Error("Cannot reformat a public key");
      if (r4.keyPacket.isDummy()) throw Error("Cannot reformat a gnu-dummy primary key");
      if (!r4.getKeys().every(({ keyPacket: e5 }) => e5.isDecrypted())) throw Error("Key is not decrypted");
      const n4 = r4.keyPacket;
      e4.subkeys || (e4.subkeys = await Promise.all(r4.subkeys.map(async (e5) => {
        const r5 = e5.keyPacket, i5 = { key: n4, bind: r5 }, s5 = await Ba(e5.bindingSignatures, n4, R.signature.subkeyBinding, i5, null, t4).catch(() => ({}));
        return { sign: s5.keyFlags && s5.keyFlags[0] & R.keyFlags.signData };
      })));
      const i4 = r4.subkeys.map((e5) => e5.keyPacket);
      if (e4.subkeys.length !== i4.length) throw Error("Number of subkey options does not match number of subkeys");
      e4.subkeys = e4.subkeys.map((t5) => o4(t5, e4));
      const s4 = await Ya(n4, i4, e4, t4), a4 = await s4.getRevocationCertificate(e4.date, t4);
      return s4.revocationSignatures = [], { key: s4, revocationCertificate: a4 };
      function o4(e5, t5 = {}) {
        return e5.keyExpirationTime = e5.keyExpirationTime || t5.keyExpirationTime, e5.passphrase = L.isString(e5.passphrase) ? e5.passphrase : t5.passphrase, e5.date = e5.date || t5.date, e5;
      }
    }(h4, o3);
    return { privateKey: xo(e3, s3, o3), publicKey: xo(e3.toPublic(), s3, o3), revocationCertificate: t3 };
  } catch (e3) {
    throw L.wrapError("Error reformatting keypair", e3);
  }
}
async function yo({ key: e2, revocationCertificate: t2, reasonForRevocation: r3, date: n3 = /* @__PURE__ */ new Date(), format: i3 = "armored", config: s3, ...a3 }) {
  Co(s3 = { ...F, ...s3 });
  const o3 = Object.keys(a3);
  if (o3.length > 0) throw Error("Unknown option: " + o3.join(", "));
  try {
    const a4 = t2 ? await e2.applyRevocationCertificate(t2, n3, s3) : await e2.revoke(r3, n3, s3);
    return a4.isPrivate() ? { privateKey: xo(a4, i3, s3), publicKey: xo(a4.toPublic(), i3, s3) } : { privateKey: null, publicKey: xo(a4, i3, s3) };
  } catch (e3) {
    throw L.wrapError("Error revoking key", e3);
  }
}
async function go({ privateKey: e2, passphrase: t2, config: r3, ...n3 }) {
  Co(r3 = { ...F, ...r3 });
  const i3 = Object.keys(n3);
  if (i3.length > 0) throw Error("Unknown option: " + i3.join(", "));
  if (!e2.isPrivate()) throw Error("Cannot decrypt a public key");
  const s3 = e2.clone(true), a3 = L.isArray(t2) ? t2 : [t2];
  try {
    return await Promise.all(s3.getKeys().map((e3) => L.anyPromise(a3.map((t3) => e3.keyPacket.decrypt(t3, r3))))), await s3.validate(r3), s3;
  } catch (e3) {
    throw s3.clearPrivateParams(), L.wrapError("Error decrypting private key", e3);
  }
}
async function po({ privateKey: e2, passphrase: t2, config: r3, ...n3 }) {
  Co(r3 = { ...F, ...r3 });
  const i3 = Object.keys(n3);
  if (i3.length > 0) throw Error("Unknown option: " + i3.join(", "));
  if (!e2.isPrivate()) throw Error("Cannot encrypt a public key");
  const s3 = e2.clone(true), a3 = s3.getKeys(), o3 = L.isArray(t2) ? t2 : Array(a3.length).fill(t2);
  if (o3.length !== a3.length) throw Error("Invalid number of passphrases given for key encryption");
  try {
    return await Promise.all(a3.map(async (e3, t3) => {
      const { keyPacket: n4 } = e3;
      await n4.encrypt(o3[t3], r3), n4.clearPrivateParams();
    })), s3;
  } catch (e3) {
    throw s3.clearPrivateParams(), L.wrapError("Error encrypting private key", e3);
  }
}
async function Ao({ message: e2, encryptionKeys: t2, signingKeys: r3, passwords: n3, sessionKey: i3, format: s3 = "armored", signature: a3 = null, wildcard: o3 = false, signingKeyIDs: c3 = [], encryptionKeyIDs: u2 = [], date: h4 = /* @__PURE__ */ new Date(), signingUserIDs: f2 = [], encryptionUserIDs: l2 = [], signatureNotations: y2 = [], config: g2, ...p2 }) {
  if (Co(g2 = { ...F, ...g2 }), Io(e2), So(s3), t2 = Do(t2), r3 = Do(r3), n3 = Do(n3), c3 = Do(c3), u2 = Do(u2), f2 = Do(f2), l2 = Do(l2), y2 = Do(y2), p2.detached) throw Error("The `detached` option has been removed from openpgp.encrypt, separately call openpgp.sign instead. Don't forget to remove the `privateKeys` option as well.");
  if (p2.publicKeys) throw Error("The `publicKeys` option has been removed from openpgp.encrypt, pass `encryptionKeys` instead");
  if (p2.privateKeys) throw Error("The `privateKeys` option has been removed from openpgp.encrypt, pass `signingKeys` instead");
  if (void 0 !== p2.armor) throw Error("The `armor` option has been removed from openpgp.encrypt, pass `format` instead.");
  const d3 = Object.keys(p2);
  if (d3.length > 0) throw Error("Unknown option: " + d3.join(", "));
  r3 || (r3 = []);
  try {
    if ((r3.length || a3) && (e2 = await e2.sign(r3, t2, a3, c3, h4, f2, u2, y2, g2)), e2 = e2.compress(await async function(e3 = [], t3 = /* @__PURE__ */ new Date(), r4 = [], n4 = F) {
      const i4 = R.compression.uncompressed, s4 = n4.preferredCompressionAlgorithm, a4 = await Promise.all(e3.map(async function(e4, i5) {
        const a5 = (await e4.getPrimarySelfSignature(t3, r4[i5], n4)).preferredCompressionAlgorithms;
        return !!a5 && a5.indexOf(s4) >= 0;
      }));
      return a4.every(Boolean) ? s4 : i4;
    }(t2, h4, l2, g2), g2), e2 = await e2.encrypt(t2, n3, i3, o3, u2, h4, l2, g2), "object" === s3) return e2;
    const p3 = "armored" === s3 ? e2.armor(g2) : e2.write();
    return await Uo(p3);
  } catch (e3) {
    throw L.wrapError("Error encrypting message", e3);
  }
}
async function wo({ message: e2, decryptionKeys: t2, passwords: r3, sessionKeys: n3, verificationKeys: i3, expectSigned: s3 = false, format: a3 = "utf8", signature: o3 = null, date: c3 = /* @__PURE__ */ new Date(), config: u2, ...h4 }) {
  if (Co(u2 = { ...F, ...u2 }), Io(e2), i3 = Do(i3), t2 = Do(t2), r3 = Do(r3), n3 = Do(n3), h4.privateKeys) throw Error("The `privateKeys` option has been removed from openpgp.decrypt, pass `decryptionKeys` instead");
  if (h4.publicKeys) throw Error("The `publicKeys` option has been removed from openpgp.decrypt, pass `verificationKeys` instead");
  const f2 = Object.keys(h4);
  if (f2.length > 0) throw Error("Unknown option: " + f2.join(", "));
  try {
    const h5 = await e2.decrypt(t2, r3, n3, c3, u2);
    i3 || (i3 = []);
    const f3 = {};
    if (f3.signatures = o3 ? await h5.verifyDetached(o3, i3, c3, u2) : await h5.verify(i3, c3, u2), f3.data = "binary" === a3 ? h5.getLiteralData() : h5.getText(), f3.filename = h5.getFilename(), Po(f3, e2, .../* @__PURE__ */ new Set([h5, h5.unwrapCompressed()])), s3) {
      if (0 === i3.length) throw Error("Verification keys are required to verify message signatures");
      if (0 === f3.signatures.length) throw Error("Message is not signed");
      f3.data = A([f3.data, P(async () => (await L.anyPromise(f3.signatures.map((e3) => e3.verified)), "binary" === a3 ? new Uint8Array() : ""))]);
    }
    return f3.data = await Uo(f3.data), f3;
  } catch (e3) {
    throw L.wrapError("Error decrypting message", e3);
  }
}
async function mo({ message: e2, signingKeys: t2, recipientKeys: r3 = [], format: n3 = "armored", detached: i3 = false, signingKeyIDs: s3 = [], date: a3 = /* @__PURE__ */ new Date(), signingUserIDs: o3 = [], recipientUserIDs: c3 = [], signatureNotations: u2 = [], config: h4, ...f2 }) {
  if (Co(h4 = { ...F, ...h4 }), Bo(e2), So(n3), t2 = Do(t2), s3 = Do(s3), o3 = Do(o3), r3 = Do(r3), c3 = Do(c3), u2 = Do(u2), f2.privateKeys) throw Error("The `privateKeys` option has been removed from openpgp.sign, pass `signingKeys` instead");
  if (void 0 !== f2.armor) throw Error("The `armor` option has been removed from openpgp.sign, pass `format` instead.");
  const l2 = Object.keys(f2);
  if (l2.length > 0) throw Error("Unknown option: " + l2.join(", "));
  if (e2 instanceof co && "binary" === n3) throw Error("Cannot return signed cleartext message in binary format");
  if (e2 instanceof co && i3) throw Error("Cannot detach-sign a cleartext message");
  if (!t2 || 0 === t2.length) throw Error("No signing keys provided");
  try {
    let f3;
    if (f3 = i3 ? await e2.signDetached(t2, r3, void 0, s3, a3, o3, c3, u2, h4) : await e2.sign(t2, r3, void 0, s3, a3, o3, c3, u2, h4), "object" === n3) return f3;
    return f3 = "armored" === n3 ? f3.armor(h4) : f3.write(), i3 && (f3 = v(e2.packets.write(), async (e3, t3) => {
      await Promise.all([w(f3, t3), D(e3).catch(() => {
      })]);
    })), await Uo(f3);
  } catch (e3) {
    throw L.wrapError("Error signing message", e3);
  }
}
async function bo({ message: e2, verificationKeys: t2, expectSigned: r3 = false, format: n3 = "utf8", signature: i3 = null, date: s3 = /* @__PURE__ */ new Date(), config: a3, ...o3 }) {
  if (Co(a3 = { ...F, ...a3 }), Bo(e2), t2 = Do(t2), o3.publicKeys) throw Error("The `publicKeys` option has been removed from openpgp.verify, pass `verificationKeys` instead");
  const c3 = Object.keys(o3);
  if (c3.length > 0) throw Error("Unknown option: " + c3.join(", "));
  if (e2 instanceof co && "binary" === n3) throw Error("Can't return cleartext message data as binary");
  if (e2 instanceof co && i3) throw Error("Can't verify detached cleartext signature");
  try {
    const o4 = {};
    if (o4.signatures = i3 ? await e2.verifyDetached(i3, t2, s3, a3) : await e2.verify(t2, s3, a3), o4.data = "binary" === n3 ? e2.getLiteralData() : e2.getText(), e2.fromStream && !i3 && Po(o4, .../* @__PURE__ */ new Set([e2, e2.unwrapCompressed()])), r3) {
      if (0 === o4.signatures.length) throw Error("Message is not signed");
      o4.data = A([o4.data, P(async () => (await L.anyPromise(o4.signatures.map((e3) => e3.verified)), "binary" === n3 ? new Uint8Array() : ""))]);
    }
    return o4.data = await Uo(o4.data), o4;
  } catch (e3) {
    throw L.wrapError("Error verifying signed message", e3);
  }
}
async function ko({ encryptionKeys: e2, date: t2 = /* @__PURE__ */ new Date(), encryptionUserIDs: r3 = [], config: n3, ...i3 }) {
  if (Co(n3 = { ...F, ...n3 }), e2 = Do(e2), r3 = Do(r3), i3.publicKeys) throw Error("The `publicKeys` option has been removed from openpgp.generateSessionKey, pass `encryptionKeys` instead");
  const s3 = Object.keys(i3);
  if (s3.length > 0) throw Error("Unknown option: " + s3.join(", "));
  try {
    return await ro.generateSessionKey(e2, t2, r3, n3);
  } catch (e3) {
    throw L.wrapError("Error generating session key", e3);
  }
}
async function Eo({ data: e2, algorithm: t2, aeadAlgorithm: r3, encryptionKeys: n3, passwords: i3, format: s3 = "armored", wildcard: a3 = false, encryptionKeyIDs: o3 = [], date: c3 = /* @__PURE__ */ new Date(), encryptionUserIDs: u2 = [], config: h4, ...f2 }) {
  if (Co(h4 = { ...F, ...h4 }), function(e3) {
    if (!L.isUint8Array(e3)) throw Error("Parameter [data] must be of type Uint8Array");
  }(e2), function(e3, t3) {
    if (!L.isString(e3)) throw Error("Parameter [" + t3 + "] must be of type String");
  }(t2, "algorithm"), So(s3), n3 = Do(n3), i3 = Do(i3), o3 = Do(o3), u2 = Do(u2), f2.publicKeys) throw Error("The `publicKeys` option has been removed from openpgp.encryptSessionKey, pass `encryptionKeys` instead");
  const l2 = Object.keys(f2);
  if (l2.length > 0) throw Error("Unknown option: " + l2.join(", "));
  if (!(n3 && 0 !== n3.length || i3 && 0 !== i3.length)) throw Error("No encryption keys or passwords provided.");
  try {
    return xo(await ro.encryptSessionKey(e2, t2, r3, n3, i3, a3, o3, c3, u2, h4), s3, h4);
  } catch (e3) {
    throw L.wrapError("Error encrypting session key", e3);
  }
}
async function vo({ message: e2, decryptionKeys: t2, passwords: r3, date: n3 = /* @__PURE__ */ new Date(), config: i3, ...s3 }) {
  if (Co(i3 = { ...F, ...i3 }), Io(e2), t2 = Do(t2), r3 = Do(r3), s3.privateKeys) throw Error("The `privateKeys` option has been removed from openpgp.decryptSessionKeys, pass `decryptionKeys` instead");
  const a3 = Object.keys(s3);
  if (a3.length > 0) throw Error("Unknown option: " + a3.join(", "));
  try {
    return await e2.decryptSessionKeys(t2, r3, void 0, n3, i3);
  } catch (e3) {
    throw L.wrapError("Error decrypting session keys", e3);
  }
}
function Io(e2) {
  if (!(e2 instanceof ro)) throw Error("Parameter [message] needs to be of type Message");
}
function Bo(e2) {
  if (!(e2 instanceof co || e2 instanceof ro)) throw Error("Parameter [message] needs to be of type Message or CleartextMessage");
}
function So(e2) {
  if ("armored" !== e2 && "binary" !== e2 && "object" !== e2) throw Error("Unsupported format " + e2);
}
function Co(e2) {
  const t2 = Object.keys(e2);
  if (t2.length !== Ko) {
    for (const e3 of t2) if (void 0 === F[e3]) throw Error("Unknown config property: " + e3);
  }
}
function Do(e2) {
  return e2 && !L.isArray(e2) && (e2 = [e2]), e2;
}
async function Uo(e2) {
  return "array" === L.isStream(e2) ? D(e2) : e2;
}
function Po(e2, t2, ...r3) {
  e2.data = v(t2.packets.stream, async (t3, n3) => {
    await w(e2.data, n3, { preventClose: true });
    const i3 = Q(n3);
    try {
      await D(t3, (e3) => e3), await Promise.all(r3.map((e3) => D(e3.packets.stream, (e4) => e4))), await i3.close();
    } catch (e3) {
      await i3.abort(e3);
    }
  });
}
function xo(e2, t2, r3) {
  switch (t2) {
    case "object":
      return e2;
    case "armored":
      return e2.armor(r3);
    case "binary":
      return e2.write();
    default:
      throw Error("Unsupported format " + t2);
  }
}
function Mo(e2) {
  return e2 instanceof Uint8Array || ArrayBuffer.isView(e2) && "Uint8Array" === e2.constructor.name;
}
function Ro(e2) {
  if (!Number.isSafeInteger(e2) || e2 < 0) throw Error("positive integer expected, got " + e2);
}
function Fo(e2, ...t2) {
  if (!Mo(e2)) throw Error("Uint8Array expected");
  if (t2.length > 0 && !t2.includes(e2.length)) throw Error("Uint8Array expected of length " + t2 + ", got length=" + e2.length);
}
function To(e2) {
  if ("function" != typeof e2 || "function" != typeof e2.create) throw Error("Hash should be wrapped by utils.createHasher");
  Ro(e2.outputLen), Ro(e2.blockLen);
}
function Lo(e2, t2 = true) {
  if (e2.destroyed) throw Error("Hash instance has been destroyed");
  if (t2 && e2.finished) throw Error("Hash#digest() has already been called");
}
function No(e2, t2) {
  Fo(e2);
  const r3 = t2.outputLen;
  if (e2.length < r3) throw Error("digestInto() expects output buffer of length at least " + r3);
}
function Oo(...e2) {
  for (let t2 = 0; t2 < e2.length; t2++) e2[t2].fill(0);
}
function Ho(e2) {
  return new DataView(e2.buffer, e2.byteOffset, e2.byteLength);
}
function zo(e2, t2) {
  return e2 << 32 - t2 | e2 >>> t2;
}
function Go(e2, t2) {
  return e2 << t2 | e2 >>> 32 - t2 >>> 0;
}
function _o(e2) {
  if (Fo(e2), Vo) return e2.toHex();
  let t2 = "";
  for (let r3 = 0; r3 < e2.length; r3++) t2 += qo[e2[r3]];
  return t2;
}
function ec(e2) {
  return e2 >= Yo && e2 <= Zo ? e2 - Yo : e2 >= Jo && e2 <= Wo ? e2 - (Jo - 10) : e2 >= Xo && e2 <= $o ? e2 - (Xo - 10) : void 0;
}
function tc(e2) {
  if ("string" != typeof e2) throw Error("hex string expected, got " + typeof e2);
  if (Vo) return Uint8Array.fromHex(e2);
  const t2 = e2.length, r3 = t2 / 2;
  if (t2 % 2) throw Error("hex string expected, got unpadded hex of length " + t2);
  const n3 = new Uint8Array(r3);
  for (let t3 = 0, i3 = 0; t3 < r3; t3++, i3 += 2) {
    const r4 = ec(e2.charCodeAt(i3)), s3 = ec(e2.charCodeAt(i3 + 1));
    if (void 0 === r4 || void 0 === s3) {
      const t4 = e2[i3] + e2[i3 + 1];
      throw Error('hex string expected, got non-hex character "' + t4 + '" at index ' + i3);
    }
    n3[t3] = 16 * r4 + s3;
  }
  return n3;
}
function rc(e2) {
  return "string" == typeof e2 && (e2 = function(e3) {
    if ("string" != typeof e3) throw Error("string expected");
    return new Uint8Array(new TextEncoder().encode(e3));
  }(e2)), Fo(e2), e2;
}
function nc(...e2) {
  let t2 = 0;
  for (let r4 = 0; r4 < e2.length; r4++) {
    const n3 = e2[r4];
    Fo(n3), t2 += n3.length;
  }
  const r3 = new Uint8Array(t2);
  for (let t3 = 0, n3 = 0; t3 < e2.length; t3++) {
    const i3 = e2[t3];
    r3.set(i3, n3), n3 += i3.length;
  }
  return r3;
}
function sc(e2) {
  const t2 = (t3) => e2().update(rc(t3)).digest(), r3 = e2();
  return t2.outputLen = r3.outputLen, t2.blockLen = r3.blockLen, t2.create = () => e2(), t2;
}
function oc(e2 = 32) {
  if (Qo && "function" == typeof Qo.getRandomValues) return Qo.getRandomValues(new Uint8Array(e2));
  if (Qo && "function" == typeof Qo.randomBytes) return Uint8Array.from(Qo.randomBytes(e2));
  throw Error("crypto.getRandomValues must be defined");
}
function hc(e2, t2 = "") {
  if ("boolean" != typeof e2) {
    throw Error((t2 && `"${t2}"`) + "expected boolean, got type=" + typeof e2);
  }
  return e2;
}
function fc(e2, t2, r3 = "") {
  const n3 = Mo(e2), i3 = e2?.length, s3 = void 0 !== t2;
  if (!n3 || s3 && i3 !== t2) {
    throw Error((r3 && `"${r3}" `) + "expected Uint8Array" + (s3 ? " of length " + t2 : "") + ", got " + (n3 ? "length=" + i3 : "type=" + typeof e2));
  }
  return e2;
}
function lc(e2) {
  const t2 = e2.toString(16);
  return 1 & t2.length ? "0" + t2 : t2;
}
function yc(e2) {
  if ("string" != typeof e2) throw Error("hex string expected, got " + typeof e2);
  return "" === e2 ? cc : BigInt("0x" + e2);
}
function gc(e2) {
  return yc(_o(e2));
}
function pc(e2) {
  return Fo(e2), yc(_o(Uint8Array.from(e2).reverse()));
}
function dc(e2, t2) {
  return tc(e2.toString(16).padStart(2 * t2, "0"));
}
function Ac(e2, t2) {
  return dc(e2, t2).reverse();
}
function wc(e2, t2, r3) {
  let n3;
  if ("string" == typeof t2) try {
    n3 = tc(t2);
  } catch (t3) {
    throw Error(e2 + " must be hex string or Uint8Array, cause: " + t3);
  }
  else {
    if (!Mo(t2)) throw Error(e2 + " must be hex string or Uint8Array");
    n3 = Uint8Array.from(t2);
  }
  const i3 = n3.length;
  if ("number" == typeof r3 && i3 !== r3) throw Error(e2 + " of length " + r3 + " expected, got " + i3);
  return n3;
}
function mc(e2) {
  return Uint8Array.from(e2);
}
function kc(e2, t2, r3, n3) {
  if (!function(e3, t3, r4) {
    return bc(e3) && bc(t3) && bc(r4) && t3 <= e3 && e3 < r4;
  }(t2, r3, n3)) throw Error("expected valid " + e2 + ": " + r3 + " <= n < " + n3 + ", got " + t2);
}
function Ec(e2) {
  let t2;
  for (t2 = 0; e2 > cc; e2 >>= uc, t2 += 1) ;
  return t2;
}
function Ic(e2, t2, r3 = {}) {
  if (!e2 || "object" != typeof e2) throw Error("expected valid options object");
  function n3(t3, r4, n4) {
    const i3 = e2[t3];
    if (n4 && void 0 === i3) return;
    const s3 = typeof i3;
    if (s3 !== r4 || null === i3) throw Error(`param "${t3}" is invalid: expected ${r4}, got ${s3}`);
  }
  Object.entries(t2).forEach(([e3, t3]) => n3(e3, t3, false)), Object.entries(r3).forEach(([e3, t3]) => n3(e3, t3, true));
}
function Bc(e2) {
  const t2 = /* @__PURE__ */ new WeakMap();
  return (r3, ...n3) => {
    const i3 = t2.get(r3);
    if (void 0 !== i3) return i3;
    const s3 = e2(r3, ...n3);
    return t2.set(r3, s3), s3;
  };
}
function Fc(e2, t2) {
  const r3 = e2 % t2;
  return r3 >= Sc ? r3 : t2 + r3;
}
function Tc(e2, t2, r3) {
  let n3 = e2;
  for (; t2-- > Sc; ) n3 *= n3, n3 %= r3;
  return n3;
}
function Lc(e2, t2) {
  if (e2 === Sc) throw Error("invert: expected non-zero number");
  if (t2 <= Sc) throw Error("invert: expected positive modulus, got " + t2);
  let r3 = Fc(e2, t2), n3 = t2, i3 = Sc, s3 = Kc;
  for (; r3 !== Sc; ) {
    const e3 = n3 % r3, t3 = i3 - s3 * (n3 / r3);
    n3 = r3, r3 = e3, i3 = s3, s3 = t3;
  }
  if (n3 !== Kc) throw Error("invert: does not exist");
  return Fc(i3, t2);
}
function Nc(e2, t2, r3) {
  if (!e2.eql(e2.sqr(t2), r3)) throw Error("Cannot find square root");
}
function Oc(e2, t2) {
  const r3 = (e2.ORDER + Kc) / Uc, n3 = e2.pow(t2, r3);
  return Nc(e2, n3, t2), n3;
}
function Hc(e2, t2) {
  const r3 = (e2.ORDER - Pc) / Qc, n3 = e2.mul(t2, Cc), i3 = e2.pow(n3, r3), s3 = e2.mul(t2, i3), a3 = e2.mul(e2.mul(s3, Cc), i3), o3 = e2.mul(s3, e2.sub(a3, e2.ONE));
  return Nc(e2, o3, t2), o3;
}
function zc(e2) {
  if (e2 < Dc) throw Error("sqrt is not defined for small field");
  let t2 = e2 - Kc, r3 = 0;
  for (; t2 % Cc === Sc; ) t2 /= Cc, r3++;
  let n3 = Cc;
  const i3 = Yc(e2);
  for (; 1 === qc(i3, n3); ) if (n3++ > 1e3) throw Error("Cannot find square root: probably non-prime P");
  if (1 === r3) return Oc;
  let s3 = i3.pow(n3, t2);
  const a3 = (t2 + Kc) / Cc;
  return function(e3, n4) {
    if (e3.is0(n4)) return n4;
    if (1 !== qc(e3, n4)) throw Error("Cannot find square root");
    let i4 = r3, o3 = e3.mul(e3.ONE, s3), c3 = e3.pow(n4, t2), u2 = e3.pow(n4, a3);
    for (; !e3.eql(c3, e3.ONE); ) {
      if (e3.is0(c3)) return e3.ZERO;
      let t3 = 1, r4 = e3.sqr(c3);
      for (; !e3.eql(r4, e3.ONE); ) if (t3++, r4 = e3.sqr(r4), t3 === i4) throw Error("Cannot find square root");
      const n5 = Kc << BigInt(i4 - t3 - 1), s4 = e3.pow(o3, n5);
      i4 = t3, o3 = e3.sqr(s4), c3 = e3.mul(c3, o3), u2 = e3.mul(u2, s4);
    }
    return u2;
  };
}
function Gc(e2) {
  return e2 % Uc === Dc ? Oc : e2 % Qc === Pc ? Hc : e2 % Rc === Mc ? function(e3) {
    const t2 = Yc(e3), r3 = zc(e3), n3 = r3(t2, t2.neg(t2.ONE)), i3 = r3(t2, n3), s3 = r3(t2, t2.neg(n3)), a3 = (e3 + xc) / Rc;
    return (e4, t3) => {
      let r4 = e4.pow(t3, a3), o3 = e4.mul(r4, n3);
      const c3 = e4.mul(r4, i3), u2 = e4.mul(r4, s3), h4 = e4.eql(e4.sqr(o3), t3), f2 = e4.eql(e4.sqr(c3), t3);
      r4 = e4.cmov(r4, o3, h4), o3 = e4.cmov(u2, c3, f2);
      const l2 = e4.eql(e4.sqr(o3), t3), y2 = e4.cmov(r4, o3, l2);
      return Nc(e4, y2, t3), y2;
    };
  }(e2) : zc(e2);
}
function Vc(e2, t2, r3 = false) {
  const n3 = Array(t2.length).fill(r3 ? e2.ZERO : void 0), i3 = t2.reduce((t3, r4, i4) => e2.is0(r4) ? t3 : (n3[i4] = t3, e2.mul(t3, r4)), e2.ONE), s3 = e2.inv(i3);
  return t2.reduceRight((t3, r4, i4) => e2.is0(r4) ? t3 : (n3[i4] = e2.mul(t3, n3[i4]), e2.mul(t3, r4)), s3), n3;
}
function qc(e2, t2) {
  const r3 = (e2.ORDER - Kc) / Cc, n3 = e2.pow(t2, r3), i3 = e2.eql(n3, e2.ONE), s3 = e2.eql(n3, e2.ZERO), a3 = e2.eql(n3, e2.neg(e2.ONE));
  if (!i3 && !s3 && !a3) throw Error("invalid Legendre symbol result");
  return i3 ? 1 : s3 ? 0 : -1;
}
function _c(e2, t2) {
  void 0 !== t2 && Ro(t2);
  const r3 = void 0 !== t2 ? t2 : e2.toString(2).length;
  return { nBitLength: r3, nByteLength: Math.ceil(r3 / 8) };
}
function Yc(e2, t2, r3 = false, n3 = {}) {
  if (e2 <= Sc) throw Error("invalid field: expected ORDER > 0, got " + e2);
  let i3, s3, a3, o3 = false;
  if ("object" == typeof t2 && null != t2) {
    if (n3.sqrt || r3) throw Error("cannot specify opts in two arguments");
    const e3 = t2;
    e3.BITS && (i3 = e3.BITS), e3.sqrt && (s3 = e3.sqrt), "boolean" == typeof e3.isLE && (r3 = e3.isLE), "boolean" == typeof e3.modFromBytes && (o3 = e3.modFromBytes), a3 = e3.allowedLengths;
  } else "number" == typeof t2 && (i3 = t2), n3.sqrt && (s3 = n3.sqrt);
  const { nBitLength: c3, nByteLength: u2 } = _c(e2, i3);
  if (u2 > 2048) throw Error("invalid field: expected ORDER of <= 2048 bytes");
  let h4;
  const f2 = Object.freeze({ ORDER: e2, isLE: r3, BITS: c3, BYTES: u2, MASK: vc(c3), ZERO: Sc, ONE: Kc, allowedLengths: a3, create: (t3) => Fc(t3, e2), isValid: (t3) => {
    if ("bigint" != typeof t3) throw Error("invalid field element: expected bigint, got " + typeof t3);
    return Sc <= t3 && t3 < e2;
  }, is0: (e3) => e3 === Sc, isValidNot0: (e3) => !f2.is0(e3) && f2.isValid(e3), isOdd: (e3) => (e3 & Kc) === Kc, neg: (t3) => Fc(-t3, e2), eql: (e3, t3) => e3 === t3, sqr: (t3) => Fc(t3 * t3, e2), add: (t3, r4) => Fc(t3 + r4, e2), sub: (t3, r4) => Fc(t3 - r4, e2), mul: (t3, r4) => Fc(t3 * r4, e2), pow: (e3, t3) => function(e4, t4, r4) {
    if (r4 < Sc) throw Error("invalid exponent, negatives unsupported");
    if (r4 === Sc) return e4.ONE;
    if (r4 === Kc) return t4;
    let n4 = e4.ONE, i4 = t4;
    for (; r4 > Sc; ) r4 & Kc && (n4 = e4.mul(n4, i4)), i4 = e4.sqr(i4), r4 >>= Kc;
    return n4;
  }(f2, e3, t3), div: (t3, r4) => Fc(t3 * Lc(r4, e2), e2), sqrN: (e3) => e3 * e3, addN: (e3, t3) => e3 + t3, subN: (e3, t3) => e3 - t3, mulN: (e3, t3) => e3 * t3, inv: (t3) => Lc(t3, e2), sqrt: s3 || ((t3) => (h4 || (h4 = Gc(e2)), h4(f2, t3))), toBytes: (e3) => r3 ? Ac(e3, u2) : dc(e3, u2), fromBytes: (t3, n4 = true) => {
    if (a3) {
      if (!a3.includes(t3.length) || t3.length > u2) throw Error("Field.fromBytes: expected " + a3 + " bytes, got " + t3.length);
      const e3 = new Uint8Array(u2);
      e3.set(t3, r3 ? 0 : e3.length - t3.length), t3 = e3;
    }
    if (t3.length !== u2) throw Error("Field.fromBytes: expected " + u2 + " bytes, got " + t3.length);
    let i4 = r3 ? pc(t3) : gc(t3);
    if (o3 && (i4 = Fc(i4, e2)), !n4 && !f2.isValid(i4)) throw Error("invalid field element: outside of range 0..ORDER");
    return i4;
  }, invertBatch: (e3) => Vc(f2, e3), cmov: (e3, t3, r4) => r4 ? t3 : e3 });
  return Object.freeze(f2);
}
function Zc(e2) {
  if ("bigint" != typeof e2) throw Error("field order must be bigint");
  const t2 = e2.toString(2).length;
  return Math.ceil(t2 / 8);
}
function Jc(e2) {
  const t2 = Zc(e2);
  return t2 + Math.ceil(t2 / 2);
}
function Wc(e2, t2, r3) {
  return e2 & t2 ^ ~e2 & r3;
}
function Xc(e2, t2, r3) {
  return e2 & t2 ^ e2 & r3 ^ t2 & r3;
}
function au(e2, t2 = false) {
  return t2 ? { h: Number(e2 & iu), l: Number(e2 >> su & iu) } : { h: 0 | Number(e2 >> su & iu), l: 0 | Number(e2 & iu) };
}
function ou(e2, t2 = false) {
  const r3 = e2.length;
  let n3 = new Uint32Array(r3), i3 = new Uint32Array(r3);
  for (let s3 = 0; s3 < r3; s3++) {
    const { h: r4, l: a3 } = au(e2[s3], t2);
    [n3[s3], i3[s3]] = [r4, a3];
  }
  return [n3, i3];
}
function gu(e2, t2, r3, n3) {
  const i3 = (t2 >>> 0) + (n3 >>> 0);
  return { h: e2 + r3 + (i3 / 2 ** 32 | 0) | 0, l: 0 | i3 };
}
function Ou(e2, t2) {
  const r3 = t2.negate();
  return e2 ? r3 : t2;
}
function Hu(e2, t2) {
  const r3 = Vc(e2.Fp, t2.map((e3) => e3.Z));
  return t2.map((t3, n3) => e2.fromAffine(t3.toAffine(r3[n3])));
}
function zu(e2, t2) {
  if (!Number.isSafeInteger(e2) || e2 <= 0 || e2 > t2) throw Error("invalid window size, expected [1.." + t2 + "], got W=" + e2);
}
function Gu(e2, t2) {
  zu(e2, t2);
  const r3 = 2 ** e2;
  return { windows: Math.ceil(t2 / e2) + 1, windowSize: 2 ** (e2 - 1), mask: vc(e2), maxNumber: r3, shiftBy: BigInt(e2) };
}
function ju(e2, t2, r3) {
  const { windowSize: n3, mask: i3, maxNumber: s3, shiftBy: a3 } = r3;
  let o3 = Number(e2 & i3), c3 = e2 >> a3;
  o3 > n3 && (o3 -= s3, c3 += Nu);
  const u2 = t2 * n3;
  return { nextN: c3, offset: u2 + Math.abs(o3) - 1, isZero: 0 === o3, isNeg: o3 < 0, isNegF: t2 % 2 != 0, offsetF: u2 };
}
function _u(e2) {
  return qu.get(e2) || 1;
}
function Yu(e2) {
  if (e2 !== Lu) throw Error("invalid wNAF");
}
function Ju(e2, t2, r3, n3) {
  !function(e3, t3) {
    if (!Array.isArray(e3)) throw Error("array expected");
    e3.forEach((e4, r4) => {
      if (!(e4 instanceof t3)) throw Error("invalid point at index " + r4);
    });
  }(r3, e2), function(e3, t3) {
    if (!Array.isArray(e3)) throw Error("array of scalars expected");
    e3.forEach((e4, r4) => {
      if (!t3.isValid(e4)) throw Error("invalid scalar at index " + r4);
    });
  }(n3, t2);
  const i3 = r3.length, s3 = n3.length;
  if (i3 !== s3) throw Error("arrays of points and scalars must have equal length");
  const a3 = e2.ZERO, o3 = Ec(BigInt(i3));
  let c3 = 1;
  o3 > 12 ? c3 = o3 - 3 : o3 > 4 ? c3 = o3 - 2 : o3 > 0 && (c3 = 2);
  const u2 = vc(c3), h4 = Array(Number(u2) + 1).fill(a3);
  let f2 = a3;
  for (let e3 = Math.floor((t2.BITS - 1) / c3) * c3; e3 >= 0; e3 -= c3) {
    h4.fill(a3);
    for (let t4 = 0; t4 < s3; t4++) {
      const i4 = n3[t4], s4 = Number(i4 >> BigInt(e3) & u2);
      h4[s4] = h4[s4].add(r3[t4]);
    }
    let t3 = a3;
    for (let e4 = h4.length - 1, r4 = a3; e4 > 0; e4--) r4 = r4.add(h4[e4]), t3 = t3.add(r4);
    if (f2 = f2.add(t3), 0 !== e3) for (let e4 = 0; e4 < c3; e4++) f2 = f2.double();
  }
  return f2;
}
function Wu(e2, t2, r3) {
  if (t2) {
    if (t2.ORDER !== e2) throw Error("Field.ORDER must match order: Fp == p, Fn == n");
    return function(e3) {
      Ic(e3, jc.reduce((e4, t3) => (e4[t3] = "function", e4), { ORDER: "bigint", MASK: "bigint", BYTES: "number", BITS: "number" }));
    }(t2), t2;
  }
  return Yc(e2, { isLE: r3 });
}
function Xu(e2, t2, r3 = {}, n3) {
  if (void 0 === n3 && (n3 = "edwards" === e2), !t2 || "object" != typeof t2) throw Error(`expected valid ${e2} CURVE object`);
  for (const e3 of ["p", "n", "h"]) {
    const r4 = t2[e3];
    if (!("bigint" == typeof r4 && r4 > Lu)) throw Error(`CURVE.${e3} must be positive bigint`);
  }
  const i3 = Wu(t2.p, r3.Fp, n3), s3 = Wu(t2.n, r3.Fn, n3), a3 = ["Gx", "Gy", "a", "weierstrass" === e2 ? "b" : "d"];
  for (const e3 of a3) if (!i3.isValid(t2[e3])) throw Error(`CURVE.${e3} must be valid field element of CURVE.Fp`);
  return { CURVE: t2 = Object.freeze(Object.assign({}, t2)), Fp: i3, Fn: s3 };
}
function eh(e2) {
  if (!["compact", "recovered", "der"].includes(e2)) throw Error('Signature format must be "compact", "recovered", or "der"');
  return e2;
}
function th(e2, t2) {
  const r3 = {};
  for (let n3 of Object.keys(t2)) r3[n3] = void 0 === e2[n3] ? t2[n3] : e2[n3];
  return hc(r3.lowS, "lowS"), hc(r3.prehash, "prehash"), void 0 !== r3.format && eh(r3.format), r3;
}
function ch(e2, t2) {
  const { BYTES: r3 } = e2;
  let n3;
  if ("bigint" == typeof t2) n3 = t2;
  else {
    let i3 = wc("private key", t2);
    try {
      n3 = e2.fromBytes(i3);
    } catch (e3) {
      throw Error(`invalid private key: expected ui8a of size ${r3}, got ${typeof t2}`);
    }
  }
  if (!e2.isValidNot0(n3)) throw Error("invalid private key: out of range [1..N-1]");
  return n3;
}
function uh(e2, t2 = {}) {
  const r3 = Xu("weierstrass", e2, t2), { Fp: n3, Fn: i3 } = r3;
  let s3 = r3.CURVE;
  const { h: a3, n: o3 } = s3;
  Ic(t2, {}, { allowInfinityPoint: "boolean", clearCofactor: "function", isTorsionFree: "function", fromBytes: "function", toBytes: "function", endo: "object", wrapPrivateKey: "boolean" });
  const { endo: c3 } = t2;
  if (c3 && (!n3.is0(s3.a) || "bigint" != typeof c3.beta || !Array.isArray(c3.basises))) throw Error('invalid endo: expected "beta": bigint and "basises": array');
  const u2 = fh(n3, i3);
  function h4() {
    if (!n3.isOdd) throw Error("compression is not supported: Field does not have .isOdd()");
  }
  const f2 = t2.toBytes || function(e3, t3, r4) {
    const { x: i4, y: s4 } = t3.toAffine(), a4 = n3.toBytes(i4);
    if (hc(r4, "isCompressed"), r4) {
      h4();
      return nc(hh(!n3.isOdd(s4)), a4);
    }
    return nc(Uint8Array.of(4), a4, n3.toBytes(s4));
  }, l2 = t2.fromBytes || function(e3) {
    fc(e3, void 0, "Point");
    const { publicKey: t3, publicKeyUncompressed: r4 } = u2, i4 = e3.length, s4 = e3[0], a4 = e3.subarray(1);
    if (i4 !== t3 || 2 !== s4 && 3 !== s4) {
      if (i4 === r4 && 4 === s4) {
        const e4 = n3.BYTES, t4 = n3.fromBytes(a4.subarray(0, e4)), r5 = n3.fromBytes(a4.subarray(e4, 2 * e4));
        if (!g2(t4, r5)) throw Error("bad point: is not on curve");
        return { x: t4, y: r5 };
      }
      throw Error(`bad point: got length ${i4}, expected compressed=${t3} or uncompressed=${r4}`);
    }
    {
      const e4 = n3.fromBytes(a4);
      if (!n3.isValid(e4)) throw Error("bad point: is not on curve, wrong x");
      const t4 = y2(e4);
      let r5;
      try {
        r5 = n3.sqrt(t4);
      } catch (e5) {
        const t5 = e5 instanceof Error ? ": " + e5.message : "";
        throw Error("bad point: is not on curve, sqrt error" + t5);
      }
      h4();
      return !(1 & ~s4) !== n3.isOdd(r5) && (r5 = n3.neg(r5)), { x: e4, y: r5 };
    }
  };
  function y2(e3) {
    const t3 = n3.sqr(e3), r4 = n3.mul(t3, e3);
    return n3.add(n3.add(r4, n3.mul(e3, s3.a)), s3.b);
  }
  function g2(e3, t3) {
    const r4 = n3.sqr(t3), i4 = y2(e3);
    return n3.eql(r4, i4);
  }
  if (!g2(s3.Gx, s3.Gy)) throw Error("bad curve params: generator point");
  const p2 = n3.mul(n3.pow(s3.a, ah), oh), d3 = n3.mul(n3.sqr(s3.b), BigInt(27));
  if (n3.is0(n3.add(p2, d3))) throw Error("bad curve params: a or b");
  function A2(e3, t3, r4 = false) {
    if (!n3.isValid(t3) || r4 && n3.is0(t3)) throw Error("bad point coordinate " + e3);
    return t3;
  }
  function w2(e3) {
    if (!(e3 instanceof v2)) throw Error("ProjectivePoint expected");
  }
  function m2(e3) {
    if (!c3 || !c3.basises) throw Error("no endo");
    return function(e4, t3, r4) {
      const [[n4, i4], [s4, a4]] = t3, o4 = $u(a4 * e4, r4), c4 = $u(-i4 * e4, r4);
      let u3 = e4 - o4 * n4 - c4 * s4, h5 = -o4 * i4 - c4 * a4;
      const f3 = u3 < nh, l3 = h5 < nh;
      f3 && (u3 = -u3), l3 && (h5 = -h5);
      const y3 = vc(Math.ceil(Ec(r4) / 2)) + ih;
      if (u3 < nh || u3 >= y3 || h5 < nh || h5 >= y3) throw Error("splitScalar (endomorphism): failed, k=" + e4);
      return { k1neg: f3, k1: u3, k2neg: l3, k2: h5 };
    }(e3, c3.basises, i3.ORDER);
  }
  const b2 = Bc((e3, t3) => {
    const { X: r4, Y: i4, Z: s4 } = e3;
    if (n3.eql(s4, n3.ONE)) return { x: r4, y: i4 };
    const a4 = e3.is0();
    null == t3 && (t3 = a4 ? n3.ONE : n3.inv(s4));
    const o4 = n3.mul(r4, t3), c4 = n3.mul(i4, t3), u3 = n3.mul(s4, t3);
    if (a4) return { x: n3.ZERO, y: n3.ZERO };
    if (!n3.eql(u3, n3.ONE)) throw Error("invZ was invalid");
    return { x: o4, y: c4 };
  }), k2 = Bc((e3) => {
    if (e3.is0()) {
      if (t2.allowInfinityPoint && !n3.is0(e3.Y)) return;
      throw Error("bad point: ZERO");
    }
    const { x: r4, y: i4 } = e3.toAffine();
    if (!n3.isValid(r4) || !n3.isValid(i4)) throw Error("bad point: x or y not field elements");
    if (!g2(r4, i4)) throw Error("bad point: equation left != right");
    if (!e3.isTorsionFree()) throw Error("bad point: not in prime-order subgroup");
    return true;
  });
  function E2(e3, t3, r4, i4, s4) {
    return r4 = new v2(n3.mul(r4.X, e3), r4.Y, r4.Z), t3 = Ou(i4, t3), r4 = Ou(s4, r4), t3.add(r4);
  }
  class v2 {
    constructor(e3, t3, r4) {
      this.X = A2("x", e3), this.Y = A2("y", t3, true), this.Z = A2("z", r4), Object.freeze(this);
    }
    static CURVE() {
      return s3;
    }
    static fromAffine(e3) {
      const { x: t3, y: r4 } = e3 || {};
      if (!e3 || !n3.isValid(t3) || !n3.isValid(r4)) throw Error("invalid affine point");
      if (e3 instanceof v2) throw Error("projective point not allowed");
      return n3.is0(t3) && n3.is0(r4) ? v2.ZERO : new v2(t3, r4, n3.ONE);
    }
    static fromBytes(e3) {
      const t3 = v2.fromAffine(l2(fc(e3, void 0, "point")));
      return t3.assertValidity(), t3;
    }
    static fromHex(e3) {
      return v2.fromBytes(wc("pointHex", e3));
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    precompute(e3 = 8, t3 = true) {
      return B2.createCache(this, e3), t3 || this.multiply(ah), this;
    }
    assertValidity() {
      k2(this);
    }
    hasEvenY() {
      const { y: e3 } = this.toAffine();
      if (!n3.isOdd) throw Error("Field doesn't support isOdd");
      return !n3.isOdd(e3);
    }
    equals(e3) {
      w2(e3);
      const { X: t3, Y: r4, Z: i4 } = this, { X: s4, Y: a4, Z: o4 } = e3, c4 = n3.eql(n3.mul(t3, o4), n3.mul(s4, i4)), u3 = n3.eql(n3.mul(r4, o4), n3.mul(a4, i4));
      return c4 && u3;
    }
    negate() {
      return new v2(this.X, n3.neg(this.Y), this.Z);
    }
    double() {
      const { a: e3, b: t3 } = s3, r4 = n3.mul(t3, ah), { X: i4, Y: a4, Z: o4 } = this;
      let c4 = n3.ZERO, u3 = n3.ZERO, h5 = n3.ZERO, f3 = n3.mul(i4, i4), l3 = n3.mul(a4, a4), y3 = n3.mul(o4, o4), g3 = n3.mul(i4, a4);
      return g3 = n3.add(g3, g3), h5 = n3.mul(i4, o4), h5 = n3.add(h5, h5), c4 = n3.mul(e3, h5), u3 = n3.mul(r4, y3), u3 = n3.add(c4, u3), c4 = n3.sub(l3, u3), u3 = n3.add(l3, u3), u3 = n3.mul(c4, u3), c4 = n3.mul(g3, c4), h5 = n3.mul(r4, h5), y3 = n3.mul(e3, y3), g3 = n3.sub(f3, y3), g3 = n3.mul(e3, g3), g3 = n3.add(g3, h5), h5 = n3.add(f3, f3), f3 = n3.add(h5, f3), f3 = n3.add(f3, y3), f3 = n3.mul(f3, g3), u3 = n3.add(u3, f3), y3 = n3.mul(a4, o4), y3 = n3.add(y3, y3), f3 = n3.mul(y3, g3), c4 = n3.sub(c4, f3), h5 = n3.mul(y3, l3), h5 = n3.add(h5, h5), h5 = n3.add(h5, h5), new v2(c4, u3, h5);
    }
    add(e3) {
      w2(e3);
      const { X: t3, Y: r4, Z: i4 } = this, { X: a4, Y: o4, Z: c4 } = e3;
      let u3 = n3.ZERO, h5 = n3.ZERO, f3 = n3.ZERO;
      const l3 = s3.a, y3 = n3.mul(s3.b, ah);
      let g3 = n3.mul(t3, a4), p3 = n3.mul(r4, o4), d4 = n3.mul(i4, c4), A3 = n3.add(t3, r4), m3 = n3.add(a4, o4);
      A3 = n3.mul(A3, m3), m3 = n3.add(g3, p3), A3 = n3.sub(A3, m3), m3 = n3.add(t3, i4);
      let b3 = n3.add(a4, c4);
      return m3 = n3.mul(m3, b3), b3 = n3.add(g3, d4), m3 = n3.sub(m3, b3), b3 = n3.add(r4, i4), u3 = n3.add(o4, c4), b3 = n3.mul(b3, u3), u3 = n3.add(p3, d4), b3 = n3.sub(b3, u3), f3 = n3.mul(l3, m3), u3 = n3.mul(y3, d4), f3 = n3.add(u3, f3), u3 = n3.sub(p3, f3), f3 = n3.add(p3, f3), h5 = n3.mul(u3, f3), p3 = n3.add(g3, g3), p3 = n3.add(p3, g3), d4 = n3.mul(l3, d4), m3 = n3.mul(y3, m3), p3 = n3.add(p3, d4), d4 = n3.sub(g3, d4), d4 = n3.mul(l3, d4), m3 = n3.add(m3, d4), g3 = n3.mul(p3, m3), h5 = n3.add(h5, g3), g3 = n3.mul(b3, m3), u3 = n3.mul(A3, u3), u3 = n3.sub(u3, g3), g3 = n3.mul(A3, p3), f3 = n3.mul(b3, f3), f3 = n3.add(f3, g3), new v2(u3, h5, f3);
    }
    subtract(e3) {
      return this.add(e3.negate());
    }
    is0() {
      return this.equals(v2.ZERO);
    }
    multiply(e3) {
      const { endo: r4 } = t2;
      if (!i3.isValidNot0(e3)) throw Error("invalid scalar: out of range");
      let n4, s4;
      const a4 = (e4) => B2.cached(this, e4, (e5) => Hu(v2, e5));
      if (r4) {
        const { k1neg: t3, k1: i4, k2neg: o4, k2: c4 } = m2(e3), { p: u3, f: h5 } = a4(i4), { p: f3, f: l3 } = a4(c4);
        s4 = h5.add(l3), n4 = E2(r4.beta, u3, f3, t3, o4);
      } else {
        const { p: t3, f: r5 } = a4(e3);
        n4 = t3, s4 = r5;
      }
      return Hu(v2, [n4, s4])[0];
    }
    multiplyUnsafe(e3) {
      const { endo: r4 } = t2, n4 = this;
      if (!i3.isValid(e3)) throw Error("invalid scalar: out of range");
      if (e3 === nh || n4.is0()) return v2.ZERO;
      if (e3 === ih) return n4;
      if (B2.hasCache(this)) return this.multiply(e3);
      if (r4) {
        const { k1neg: t3, k1: i4, k2neg: s4, k2: a4 } = m2(e3), { p1: o4, p2: c4 } = function(e4, t4, r5, n5) {
          let i5 = t4, s5 = e4.ZERO, a5 = e4.ZERO;
          for (; r5 > Lu || n5 > Lu; ) r5 & Nu && (s5 = s5.add(i5)), n5 & Nu && (a5 = a5.add(i5)), i5 = i5.double(), r5 >>= Nu, n5 >>= Nu;
          return { p1: s5, p2: a5 };
        }(v2, n4, i4, a4);
        return E2(r4.beta, o4, c4, t3, s4);
      }
      return B2.unsafe(n4, e3);
    }
    multiplyAndAddUnsafe(e3, t3, r4) {
      const n4 = this.multiplyUnsafe(t3).add(e3.multiplyUnsafe(r4));
      return n4.is0() ? void 0 : n4;
    }
    toAffine(e3) {
      return b2(this, e3);
    }
    isTorsionFree() {
      const { isTorsionFree: e3 } = t2;
      return a3 === ih || (e3 ? e3(v2, this) : B2.unsafe(this, o3).is0());
    }
    clearCofactor() {
      const { clearCofactor: e3 } = t2;
      return a3 === ih ? this : e3 ? e3(v2, this) : this.multiplyUnsafe(a3);
    }
    isSmallOrder() {
      return this.multiplyUnsafe(a3).is0();
    }
    toBytes(e3 = true) {
      return hc(e3, "isCompressed"), this.assertValidity(), f2(v2, this, e3);
    }
    toHex(e3 = true) {
      return _o(this.toBytes(e3));
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
    get px() {
      return this.X;
    }
    get py() {
      return this.X;
    }
    get pz() {
      return this.Z;
    }
    toRawBytes(e3 = true) {
      return this.toBytes(e3);
    }
    _setWindowSize(e3) {
      this.precompute(e3);
    }
    static normalizeZ(e3) {
      return Hu(v2, e3);
    }
    static msm(e3, t3) {
      return Ju(v2, i3, e3, t3);
    }
    static fromPrivateKey(e3) {
      return v2.BASE.multiply(ch(i3, e3));
    }
  }
  v2.BASE = new v2(s3.Gx, s3.Gy, n3.ONE), v2.ZERO = new v2(n3.ZERO, n3.ONE, n3.ZERO), v2.Fp = n3, v2.Fn = i3;
  const I2 = i3.BITS, B2 = new Zu(v2, t2.endo ? Math.ceil(I2 / 2) : I2);
  return v2.BASE.precompute(8), v2;
}
function hh(e2) {
  return Uint8Array.of(e2 ? 2 : 3);
}
function fh(e2, t2) {
  return { secretKey: t2.BYTES, publicKey: 1 + e2.BYTES, publicKeyUncompressed: 1 + 2 * e2.BYTES, publicKeyHasPrefix: true, signature: 2 * t2.BYTES };
}
function lh(e2, t2 = {}) {
  const { Fn: r3 } = e2, n3 = t2.randomBytes || oc, i3 = Object.assign(fh(e2.Fp, r3), { seed: Jc(r3.ORDER) });
  function s3(e3) {
    try {
      return !!ch(r3, e3);
    } catch (e4) {
      return false;
    }
  }
  function a3(e3 = n3(i3.seed)) {
    return function(e4, t3, r4 = false) {
      const n4 = e4.length, i4 = Zc(t3), s4 = Jc(t3);
      if (n4 < 16 || n4 < s4 || n4 > 1024) throw Error("expected " + s4 + "-1024 bytes of input, got " + n4);
      const a4 = Fc(r4 ? pc(e4) : gc(e4), t3 - Kc) + Kc;
      return r4 ? Ac(a4, i4) : dc(a4, i4);
    }(fc(e3, i3.seed, "seed"), r3.ORDER);
  }
  function o3(t3, n4 = true) {
    return e2.BASE.multiply(ch(r3, t3)).toBytes(n4);
  }
  function c3(t3) {
    if ("bigint" == typeof t3) return false;
    if (t3 instanceof e2) return true;
    const { secretKey: n4, publicKey: s4, publicKeyUncompressed: a4 } = i3;
    if (r3.allowedLengths || n4 === s4) return;
    const o4 = wc("key", t3).length;
    return o4 === s4 || o4 === a4;
  }
  const u2 = { isValidSecretKey: s3, isValidPublicKey: function(t3, r4) {
    const { publicKey: n4, publicKeyUncompressed: s4 } = i3;
    try {
      const i4 = t3.length;
      return (true !== r4 || i4 === n4) && ((false !== r4 || i4 === s4) && !!e2.fromBytes(t3));
    } catch (e3) {
      return false;
    }
  }, randomSecretKey: a3, isValidPrivateKey: s3, randomPrivateKey: a3, normPrivateKeyToScalar: (e3) => ch(r3, e3), precompute: (t3 = 8, r4 = e2.BASE) => r4.precompute(t3, false) };
  return Object.freeze({ getPublicKey: o3, getSharedSecret: function(t3, n4, i4 = true) {
    if (true === c3(t3)) throw Error("first arg must be private key");
    if (false === c3(n4)) throw Error("second arg must be public key");
    const s4 = ch(r3, t3);
    return e2.fromHex(n4).multiply(s4).toBytes(i4);
  }, keygen: function(e3) {
    const t3 = a3(e3);
    return { secretKey: t3, publicKey: o3(t3) };
  }, Point: e2, utils: u2, lengths: i3 });
}
function yh(e2, t2, r3 = {}) {
  To(t2), Ic(r3, {}, { hmac: "function", lowS: "boolean", randomBytes: "function", bits2int: "function", bits2int_modN: "function" });
  const n3 = r3.randomBytes || oc, i3 = r3.hmac || ((e3, ...r4) => Tu(t2, e3, nc(...r4))), { Fp: s3, Fn: a3 } = e2, { ORDER: o3, BITS: c3 } = a3, { keygen: u2, getPublicKey: h4, getSharedSecret: f2, utils: l2, lengths: y2 } = lh(e2, r3), g2 = { prehash: false, lowS: "boolean" == typeof r3.lowS && r3.lowS, format: void 0, extraEntropy: false }, p2 = "compact";
  function d3(e3) {
    return e3 > o3 >> ih;
  }
  function A2(e3, t3) {
    if (!a3.isValidNot0(t3)) throw Error(`invalid signature ${e3}: out of range 1..Point.Fn.ORDER`);
    return t3;
  }
  class w2 {
    constructor(e3, t3, r4) {
      this.r = A2("r", e3), this.s = A2("s", t3), null != r4 && (this.recovery = r4), Object.freeze(this);
    }
    static fromBytes(e3, t3 = p2) {
      let r4;
      if (function(e4, t4) {
        eh(t4);
        const r5 = y2.signature;
        fc(e4, "compact" === t4 ? r5 : "recovered" === t4 ? r5 + 1 : void 0, t4 + " signature");
      }(e3, t3), "der" === t3) {
        const { r: t4, s: r5 } = rh.toSig(fc(e3));
        return new w2(t4, r5);
      }
      "recovered" === t3 && (r4 = e3[0], t3 = "compact", e3 = e3.subarray(1));
      const n4 = a3.BYTES, i4 = e3.subarray(0, n4), s4 = e3.subarray(n4, 2 * n4);
      return new w2(a3.fromBytes(i4), a3.fromBytes(s4), r4);
    }
    static fromHex(e3, t3) {
      return this.fromBytes(tc(e3), t3);
    }
    addRecoveryBit(e3) {
      return new w2(this.r, this.s, e3);
    }
    recoverPublicKey(t3) {
      const r4 = s3.ORDER, { r: n4, s: i4, recovery: c4 } = this;
      if (null == c4 || ![0, 1, 2, 3].includes(c4)) throw Error("recovery id invalid");
      if (o3 * sh < r4 && c4 > 1) throw Error("recovery id is ambiguous for h>1 curve");
      const u3 = 2 === c4 || 3 === c4 ? n4 + o3 : n4;
      if (!s3.isValid(u3)) throw Error("recovery id 2 or 3 invalid");
      const h5 = s3.toBytes(u3), f3 = e2.fromBytes(nc(hh(!(1 & c4)), h5)), l3 = a3.inv(u3), y3 = b2(wc("msgHash", t3)), g3 = a3.create(-y3 * l3), p3 = a3.create(i4 * l3), d4 = e2.BASE.multiplyUnsafe(g3).add(f3.multiplyUnsafe(p3));
      if (d4.is0()) throw Error("point at infinify");
      return d4.assertValidity(), d4;
    }
    hasHighS() {
      return d3(this.s);
    }
    toBytes(e3 = p2) {
      if (eh(e3), "der" === e3) return tc(rh.hexFromSig(this));
      const t3 = a3.toBytes(this.r), r4 = a3.toBytes(this.s);
      if ("recovered" === e3) {
        if (null == this.recovery) throw Error("recovery bit must be present");
        return nc(Uint8Array.of(this.recovery), t3, r4);
      }
      return nc(t3, r4);
    }
    toHex(e3) {
      return _o(this.toBytes(e3));
    }
    assertValidity() {
    }
    static fromCompact(e3) {
      return w2.fromBytes(wc("sig", e3), "compact");
    }
    static fromDER(e3) {
      return w2.fromBytes(wc("sig", e3), "der");
    }
    normalizeS() {
      return this.hasHighS() ? new w2(this.r, a3.neg(this.s), this.recovery) : this;
    }
    toDERRawBytes() {
      return this.toBytes("der");
    }
    toDERHex() {
      return _o(this.toBytes("der"));
    }
    toCompactRawBytes() {
      return this.toBytes("compact");
    }
    toCompactHex() {
      return _o(this.toBytes("compact"));
    }
  }
  const m2 = r3.bits2int || function(e3) {
    if (e3.length > 8192) throw Error("input is too large");
    const t3 = gc(e3), r4 = 8 * e3.length - c3;
    return r4 > 0 ? t3 >> BigInt(r4) : t3;
  }, b2 = r3.bits2int_modN || function(e3) {
    return a3.create(m2(e3));
  }, k2 = vc(c3);
  function E2(e3) {
    return kc("num < 2^" + c3, e3, nh, k2), a3.toBytes(e3);
  }
  function v2(e3, r4) {
    return fc(e3, void 0, "message"), r4 ? fc(t2(e3), void 0, "prehashed message") : e3;
  }
  return Object.freeze({ keygen: u2, getPublicKey: h4, getSharedSecret: f2, utils: l2, lengths: y2, Point: e2, sign: function(r4, s4, o4 = {}) {
    r4 = wc("message", r4);
    const { seed: c4, k2sig: u3 } = function(t3, r5, i4) {
      if (["recovered", "canonical"].some((e3) => e3 in i4)) throw Error("sign() legacy options not supported");
      const { lowS: s5, prehash: o5, extraEntropy: c5 } = th(i4, g2);
      t3 = v2(t3, o5);
      const u4 = b2(t3), h6 = ch(a3, r5), f3 = [E2(h6), E2(u4)];
      if (null != c5 && false !== c5) {
        const e3 = true === c5 ? n3(y2.secretKey) : c5;
        f3.push(wc("extraEntropy", e3));
      }
      const l3 = nc(...f3), p3 = u4;
      return { seed: l3, k2sig: function(t4) {
        const r6 = m2(t4);
        if (!a3.isValidNot0(r6)) return;
        const n4 = a3.inv(r6), i5 = e2.BASE.multiply(r6).toAffine(), o6 = a3.create(i5.x);
        if (o6 === nh) return;
        const c6 = a3.create(n4 * a3.create(p3 + o6 * h6));
        if (c6 === nh) return;
        let u5 = (i5.x === o6 ? 0 : 2) | Number(i5.y & ih), f4 = c6;
        return s5 && d3(c6) && (f4 = a3.neg(c6), u5 ^= 1), new w2(o6, f4, u5);
      } };
    }(r4, s4, o4), h5 = function(e3, t3, r5) {
      if ("number" != typeof e3 || e3 < 2) throw Error("hashLen must be a number");
      if ("number" != typeof t3 || t3 < 2) throw Error("qByteLen must be a number");
      if ("function" != typeof r5) throw Error("hmacFn must be a function");
      const n4 = (e4) => new Uint8Array(e4), i4 = (e4) => Uint8Array.of(e4);
      let s5 = n4(e3), a4 = n4(e3), o5 = 0;
      const c5 = () => {
        s5.fill(1), a4.fill(0), o5 = 0;
      }, u4 = (...e4) => r5(a4, s5, ...e4), h6 = (e4 = n4(0)) => {
        a4 = u4(i4(0), e4), s5 = u4(), 0 !== e4.length && (a4 = u4(i4(1), e4), s5 = u4());
      }, f3 = () => {
        if (o5++ >= 1e3) throw Error("drbg: tried 1000 values");
        let e4 = 0;
        const r6 = [];
        for (; e4 < t3; ) {
          s5 = u4();
          const t4 = s5.slice();
          r6.push(t4), e4 += s5.length;
        }
        return nc(...r6);
      };
      return (e4, t4) => {
        let r6;
        for (c5(), h6(e4); !(r6 = t4(f3())); ) h6();
        return c5(), r6;
      };
    }(t2.outputLen, a3.BYTES, i3);
    return h5(c4, u3);
  }, verify: function(t3, r4, n4, i4 = {}) {
    const { lowS: s4, prehash: o4, format: c4 } = th(i4, g2);
    if (n4 = wc("publicKey", n4), r4 = v2(wc("message", r4), o4), "strict" in i4) throw Error("options.strict was renamed to lowS");
    const u3 = void 0 === c4 ? function(e3) {
      let t4;
      const r5 = "string" == typeof e3 || Mo(e3), n5 = !r5 && null !== e3 && "object" == typeof e3 && "bigint" == typeof e3.r && "bigint" == typeof e3.s;
      if (!r5 && !n5) throw Error("invalid signature, expected Uint8Array, hex string or Signature instance");
      if (n5) t4 = new w2(e3.r, e3.s);
      else if (r5) {
        try {
          t4 = w2.fromBytes(wc("sig", e3), "der");
        } catch (e4) {
          if (!(e4 instanceof rh.Err)) throw e4;
        }
        if (!t4) try {
          t4 = w2.fromBytes(wc("sig", e3), "compact");
        } catch (e4) {
          return false;
        }
      }
      return t4 || false;
    }(t3) : w2.fromBytes(wc("sig", t3), c4);
    if (false === u3) return false;
    try {
      const t4 = e2.fromBytes(n4);
      if (s4 && u3.hasHighS()) return false;
      const { r: i5, s: o5 } = u3, c5 = b2(r4), h5 = a3.inv(o5), f3 = a3.create(c5 * h5), l3 = a3.create(i5 * h5), y3 = e2.BASE.multiplyUnsafe(f3).add(t4.multiplyUnsafe(l3));
      if (y3.is0()) return false;
      return a3.create(y3.x) === i5;
    } catch (e3) {
      return false;
    }
  }, recoverPublicKey: function(e3, t3, r4 = {}) {
    const { prehash: n4 } = th(r4, g2);
    return t3 = v2(t3, n4), w2.fromBytes(e3, "recovered").recoverPublicKey(t3).toBytes();
  }, Signature: w2, hash: t2 });
}
function gh(e2) {
  const { CURVE: t2, curveOpts: r3 } = function(e3) {
    const t3 = { a: e3.a, b: e3.b, p: e3.Fp.ORDER, n: e3.n, h: e3.h, Gx: e3.Gx, Gy: e3.Gy }, r4 = e3.Fp;
    let n4 = e3.allowedPrivateKeyLengths ? Array.from(new Set(e3.allowedPrivateKeyLengths.map((e4) => Math.ceil(e4 / 2)))) : void 0;
    return { CURVE: t3, curveOpts: { Fp: r4, Fn: Yc(t3.n, { BITS: e3.nBitLength, allowedLengths: n4, modFromBytes: e3.wrapPrivateKey }), allowInfinityPoint: e3.allowInfinityPoint, endo: e3.endo, isTorsionFree: e3.isTorsionFree, clearCofactor: e3.clearCofactor, fromBytes: e3.fromBytes, toBytes: e3.toBytes } };
  }(e2), n3 = { hmac: e2.hmac, randomBytes: e2.randomBytes, lowS: e2.lowS, bits2int: e2.bits2int, bits2int_modN: e2.bits2int_modN };
  return { CURVE: t2, curveOpts: r3, hash: e2.hash, ecdsaOpts: n3 };
}
function ph(e2) {
  const { CURVE: t2, curveOpts: r3, hash: n3, ecdsaOpts: i3 } = gh(e2);
  return function(e3, t3) {
    const r4 = t3.Point;
    return Object.assign({}, t3, { ProjectivePoint: r4, CURVE: Object.assign({}, e3, _c(r4.Fn.ORDER, r4.Fn.BITS)) });
  }(e2, yh(uh(t2, r3), n3, i3));
}
function dh(e2, t2) {
  const r3 = (t3) => ph({ ...e2, hash: t3 });
  return { ...r3(t2), create: r3 };
}
function Jh(e2, t2 = {}) {
  const r3 = Xu("edwards", e2, t2, t2.FpFnLE), { Fp: n3, Fn: i3 } = r3;
  let s3 = r3.CURVE;
  const { h: a3 } = s3;
  Ic(t2, {}, { uvRatio: "function" });
  const o3 = Yh << BigInt(8 * i3.BYTES) - _h, c3 = (e3) => n3.create(e3), u2 = t2.uvRatio || ((e3, t3) => {
    try {
      return { isValid: true, value: n3.sqrt(n3.div(e3, t3)) };
    } catch (e4) {
      return { isValid: false, value: qh };
    }
  });
  if (!function(e3, t3, r4, n4) {
    const i4 = e3.sqr(r4), s4 = e3.sqr(n4), a4 = e3.add(e3.mul(t3.a, i4), s4), o4 = e3.add(e3.ONE, e3.mul(t3.d, e3.mul(i4, s4)));
    return e3.eql(a4, o4);
  }(n3, s3, s3.Gx, s3.Gy)) throw Error("bad curve params: generator point");
  function h4(e3, t3, r4 = false) {
    return kc("coordinate " + e3, t3, r4 ? _h : qh, o3), t3;
  }
  function f2(e3) {
    if (!(e3 instanceof g2)) throw Error("ExtendedPoint expected");
  }
  const l2 = Bc((e3, t3) => {
    const { X: r4, Y: i4, Z: s4 } = e3, a4 = e3.is0();
    null == t3 && (t3 = a4 ? Zh : n3.inv(s4));
    const o4 = c3(r4 * t3), u3 = c3(i4 * t3), h5 = n3.mul(s4, t3);
    if (a4) return { x: qh, y: _h };
    if (h5 !== _h) throw Error("invZ was invalid");
    return { x: o4, y: u3 };
  }), y2 = Bc((e3) => {
    const { a: t3, d: r4 } = s3;
    if (e3.is0()) throw Error("bad point: ZERO");
    const { X: n4, Y: i4, Z: a4, T: o4 } = e3, u3 = c3(n4 * n4), h5 = c3(i4 * i4), f3 = c3(a4 * a4), l3 = c3(f3 * f3), y3 = c3(u3 * t3);
    if (c3(f3 * c3(y3 + h5)) !== c3(l3 + c3(r4 * c3(u3 * h5)))) throw Error("bad point: equation left != right (1)");
    if (c3(n4 * i4) !== c3(a4 * o4)) throw Error("bad point: equation left != right (2)");
    return true;
  });
  class g2 {
    constructor(e3, t3, r4, n4) {
      this.X = h4("x", e3), this.Y = h4("y", t3), this.Z = h4("z", r4, true), this.T = h4("t", n4), Object.freeze(this);
    }
    static CURVE() {
      return s3;
    }
    static fromAffine(e3) {
      if (e3 instanceof g2) throw Error("extended point not allowed");
      const { x: t3, y: r4 } = e3 || {};
      return h4("x", t3), h4("y", r4), new g2(t3, r4, _h, c3(t3 * r4));
    }
    static fromBytes(e3, t3 = false) {
      const r4 = n3.BYTES, { a: i4, d: a4 } = s3;
      e3 = mc(fc(e3, r4, "point")), hc(t3, "zip215");
      const h5 = mc(e3), f3 = e3[r4 - 1];
      h5[r4 - 1] = -129 & f3;
      const l3 = pc(h5), y3 = t3 ? o3 : n3.ORDER;
      kc("point.y", l3, qh, y3);
      const p3 = c3(l3 * l3), d3 = c3(p3 - _h), A2 = c3(a4 * p3 - i4);
      let { isValid: w2, value: m2 } = u2(d3, A2);
      if (!w2) throw Error("bad point: invalid y coordinate");
      const b2 = (m2 & _h) === _h, k2 = !!(128 & f3);
      if (!t3 && m2 === qh && k2) throw Error("bad point: x=0 and x_0=1");
      return k2 !== b2 && (m2 = c3(-m2)), g2.fromAffine({ x: m2, y: l3 });
    }
    static fromHex(e3, t3 = false) {
      return g2.fromBytes(wc("point", e3), t3);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    precompute(e3 = 8, t3 = true) {
      return p2.createCache(this, e3), t3 || this.multiply(Yh), this;
    }
    assertValidity() {
      y2(this);
    }
    equals(e3) {
      f2(e3);
      const { X: t3, Y: r4, Z: n4 } = this, { X: i4, Y: s4, Z: a4 } = e3, o4 = c3(t3 * a4), u3 = c3(i4 * n4), h5 = c3(r4 * a4), l3 = c3(s4 * n4);
      return o4 === u3 && h5 === l3;
    }
    is0() {
      return this.equals(g2.ZERO);
    }
    negate() {
      return new g2(c3(-this.X), this.Y, this.Z, c3(-this.T));
    }
    double() {
      const { a: e3 } = s3, { X: t3, Y: r4, Z: n4 } = this, i4 = c3(t3 * t3), a4 = c3(r4 * r4), o4 = c3(Yh * c3(n4 * n4)), u3 = c3(e3 * i4), h5 = t3 + r4, f3 = c3(c3(h5 * h5) - i4 - a4), l3 = u3 + a4, y3 = l3 - o4, p3 = u3 - a4, d3 = c3(f3 * y3), A2 = c3(l3 * p3), w2 = c3(f3 * p3), m2 = c3(y3 * l3);
      return new g2(d3, A2, m2, w2);
    }
    add(e3) {
      f2(e3);
      const { a: t3, d: r4 } = s3, { X: n4, Y: i4, Z: a4, T: o4 } = this, { X: u3, Y: h5, Z: l3, T: y3 } = e3, p3 = c3(n4 * u3), d3 = c3(i4 * h5), A2 = c3(o4 * r4 * y3), w2 = c3(a4 * l3), m2 = c3((n4 + i4) * (u3 + h5) - p3 - d3), b2 = w2 - A2, k2 = w2 + A2, E2 = c3(d3 - t3 * p3), v2 = c3(m2 * b2), I2 = c3(k2 * E2), B2 = c3(m2 * E2), S2 = c3(b2 * k2);
      return new g2(v2, I2, S2, B2);
    }
    subtract(e3) {
      return this.add(e3.negate());
    }
    multiply(e3) {
      if (!i3.isValidNot0(e3)) throw Error("invalid scalar: expected 1 <= sc < curve.n");
      const { p: t3, f: r4 } = p2.cached(this, e3, (e4) => Hu(g2, e4));
      return Hu(g2, [t3, r4])[0];
    }
    multiplyUnsafe(e3, t3 = g2.ZERO) {
      if (!i3.isValid(e3)) throw Error("invalid scalar: expected 0 <= sc < curve.n");
      return e3 === qh ? g2.ZERO : this.is0() || e3 === _h ? this : p2.unsafe(this, e3, (e4) => Hu(g2, e4), t3);
    }
    isSmallOrder() {
      return this.multiplyUnsafe(a3).is0();
    }
    isTorsionFree() {
      return p2.unsafe(this, s3.n).is0();
    }
    toAffine(e3) {
      return l2(this, e3);
    }
    clearCofactor() {
      return a3 === _h ? this : this.multiplyUnsafe(a3);
    }
    toBytes() {
      const { x: e3, y: t3 } = this.toAffine(), r4 = n3.toBytes(t3);
      return r4[r4.length - 1] |= e3 & _h ? 128 : 0, r4;
    }
    toHex() {
      return _o(this.toBytes());
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
    get ex() {
      return this.X;
    }
    get ey() {
      return this.Y;
    }
    get ez() {
      return this.Z;
    }
    get et() {
      return this.T;
    }
    static normalizeZ(e3) {
      return Hu(g2, e3);
    }
    static msm(e3, t3) {
      return Ju(g2, i3, e3, t3);
    }
    _setWindowSize(e3) {
      this.precompute(e3);
    }
    toRawBytes() {
      return this.toBytes();
    }
  }
  g2.BASE = new g2(s3.Gx, s3.Gy, _h, c3(s3.Gx * s3.Gy)), g2.ZERO = new g2(qh, _h, _h, qh), g2.Fp = n3, g2.Fn = i3;
  const p2 = new Zu(g2, i3.BITS);
  return g2.BASE.precompute(8), g2;
}
function Wh(e2, t2, r3 = {}) {
  if ("function" != typeof t2) throw Error('"hash" function param is required');
  Ic(r3, {}, { adjustScalarBytes: "function", randomBytes: "function", domain: "function", prehash: "function", mapToCurve: "function" });
  const { prehash: n3 } = r3, { BASE: i3, Fp: s3, Fn: a3 } = e2, o3 = r3.randomBytes || oc, c3 = r3.adjustScalarBytes || ((e3) => e3), u2 = r3.domain || ((e3, t3, r4) => {
    if (hc(r4, "phflag"), t3.length || r4) throw Error("Contexts/pre-hash are not supported");
    return e3;
  });
  function h4(e3) {
    return a3.create(pc(e3));
  }
  function f2(e3) {
    const { head: r4, prefix: n4, scalar: s4 } = function(e4) {
      const r5 = d3.secretKey;
      e4 = wc("private key", e4, r5);
      const n5 = wc("hashed private key", t2(e4), 2 * r5), i4 = c3(n5.slice(0, r5));
      return { head: i4, prefix: n5.slice(r5, 2 * r5), scalar: h4(i4) };
    }(e3), a4 = i3.multiply(s4), o4 = a4.toBytes();
    return { head: r4, prefix: n4, scalar: s4, point: a4, pointBytes: o4 };
  }
  function l2(e3) {
    return f2(e3).pointBytes;
  }
  function y2(e3 = Uint8Array.of(), ...r4) {
    const i4 = nc(...r4);
    return h4(t2(u2(i4, wc("context", e3), !!n3)));
  }
  const g2 = { zip215: true };
  const p2 = s3.BYTES, d3 = { secretKey: p2, publicKey: p2, signature: 2 * p2, seed: p2 };
  function A2(e3 = o3(d3.seed)) {
    return fc(e3, d3.seed, "seed");
  }
  const w2 = { getExtendedPublicKey: f2, randomSecretKey: A2, isValidSecretKey: function(e3) {
    return Mo(e3) && e3.length === a3.BYTES;
  }, isValidPublicKey: function(t3, r4) {
    try {
      return !!e2.fromBytes(t3, r4);
    } catch (e3) {
      return false;
    }
  }, toMontgomery(t3) {
    const { y: r4 } = e2.fromBytes(t3), n4 = d3.publicKey, i4 = 32 === n4;
    if (!i4 && 57 !== n4) throw Error("only defined for 25519 and 448");
    const a4 = i4 ? s3.div(_h + r4, _h - r4) : s3.div(r4 - _h, r4 + _h);
    return s3.toBytes(a4);
  }, toMontgomerySecret(e3) {
    const r4 = d3.secretKey;
    fc(e3, r4);
    const n4 = t2(e3.subarray(0, r4));
    return c3(n4).subarray(0, r4);
  }, randomPrivateKey: A2, precompute: (t3 = 8, r4 = e2.BASE) => r4.precompute(t3, false) };
  return Object.freeze({ keygen: function(e3) {
    const t3 = w2.randomSecretKey(e3);
    return { secretKey: t3, publicKey: l2(t3) };
  }, getPublicKey: l2, sign: function(e3, t3, r4 = {}) {
    e3 = wc("message", e3), n3 && (e3 = n3(e3));
    const { prefix: s4, scalar: o4, pointBytes: c4 } = f2(t3), u3 = y2(r4.context, s4, e3), h5 = i3.multiply(u3).toBytes(), l3 = y2(r4.context, h5, c4, e3), g3 = a3.create(u3 + l3 * o4);
    if (!a3.isValid(g3)) throw Error("sign failed: invalid s");
    return fc(nc(h5, a3.toBytes(g3)), d3.signature, "result");
  }, verify: function(t3, r4, s4, a4 = g2) {
    const { context: o4, zip215: c4 } = a4, u3 = d3.signature;
    t3 = wc("signature", t3, u3), r4 = wc("message", r4), s4 = wc("publicKey", s4, d3.publicKey), void 0 !== c4 && hc(c4, "zip215"), n3 && (r4 = n3(r4));
    const h5 = u3 / 2, f3 = t3.subarray(0, h5), l3 = pc(t3.subarray(h5, u3));
    let p3, A3, w3;
    try {
      p3 = e2.fromBytes(s4, c4), A3 = e2.fromBytes(f3, c4), w3 = i3.multiplyUnsafe(l3);
    } catch (e3) {
      return false;
    }
    if (!c4 && p3.isSmallOrder()) return false;
    const m2 = y2(o4, A3.toBytes(), p3.toBytes(), r4);
    return A3.add(p3.multiplyUnsafe(m2)).subtract(w3).clearCofactor().is0();
  }, utils: w2, Point: e2, lengths: d3 });
}
function tf(e2) {
  const t2 = (Ic(r3 = e2, { adjustScalarBytes: "function", powPminus2: "function" }), Object.freeze({ ...r3 }));
  var r3;
  const { P: n3, type: i3, adjustScalarBytes: s3, powPminus2: a3, randomBytes: o3 } = t2, c3 = "x25519" === i3;
  if (!c3 && "x448" !== i3) throw Error("invalid type");
  const u2 = o3 || oc, h4 = c3 ? 255 : 448, f2 = c3 ? 32 : 56, l2 = c3 ? BigInt(9) : BigInt(5), y2 = c3 ? BigInt(121665) : BigInt(39081), g2 = c3 ? ef ** BigInt(254) : ef ** BigInt(447), p2 = c3 ? BigInt(8) * ef ** BigInt(251) - $h : BigInt(4) * ef ** BigInt(445) - $h, d3 = g2 + p2 + $h, A2 = (e3) => Fc(e3, n3), w2 = m2(l2);
  function m2(e3) {
    return Ac(A2(e3), f2);
  }
  function b2(e3, t3) {
    const r4 = function(e4, t4) {
      kc("u", e4, Xh, n3), kc("scalar", t4, g2, d3);
      const r5 = t4, i4 = e4;
      let s4 = $h, o4 = Xh, c4 = e4, u3 = $h, f3 = Xh;
      for (let e5 = BigInt(h4 - 1); e5 >= Xh; e5--) {
        const t5 = r5 >> e5 & $h;
        f3 ^= t5, { x_2: s4, x_3: c4 } = E2(f3, s4, c4), { x_2: o4, x_3: u3 } = E2(f3, o4, u3), f3 = t5;
        const n4 = s4 + o4, a4 = A2(n4 * n4), h5 = s4 - o4, l4 = A2(h5 * h5), g3 = a4 - l4, p3 = c4 + u3, d4 = A2((c4 - u3) * n4), w3 = A2(p3 * h5), m3 = d4 + w3, b3 = d4 - w3;
        c4 = A2(m3 * m3), u3 = A2(i4 * A2(b3 * b3)), s4 = A2(a4 * l4), o4 = A2(g3 * (a4 + A2(y2 * g3)));
      }
      ({ x_2: s4, x_3: c4 } = E2(f3, s4, c4)), { x_2: o4, x_3: u3 } = E2(f3, o4, u3);
      const l3 = a3(o4);
      return A2(s4 * l3);
    }(function(e4) {
      const t4 = wc("u coordinate", e4, f2);
      return c3 && (t4[31] &= 127), A2(pc(t4));
    }(t3), function(e4) {
      return pc(s3(wc("scalar", e4, f2)));
    }(e3));
    if (r4 === Xh) throw Error("invalid private or public key received");
    return m2(r4);
  }
  function k2(e3) {
    return b2(e3, w2);
  }
  function E2(e3, t3, r4) {
    const n4 = A2(e3 * (t3 - r4));
    return { x_2: t3 = A2(t3 - n4), x_3: r4 = A2(r4 + n4) };
  }
  const v2 = { secretKey: f2, publicKey: f2, seed: f2 }, I2 = (e3 = u2(f2)) => (Fo(e3, v2.seed), e3);
  return { keygen: function(e3) {
    const t3 = I2(e3);
    return { secretKey: t3, publicKey: k2(t3) };
  }, getSharedSecret: (e3, t3) => b2(e3, t3), getPublicKey: (e3) => k2(e3), scalarMult: b2, scalarMultBase: k2, utils: { randomSecretKey: I2, randomPrivateKey: I2 }, GuBytes: w2.slice(), lengths: v2 };
}
function gf(e2) {
  const t2 = rf.p, r3 = e2 * e2 * e2 % t2, n3 = r3 * r3 * e2 % t2, i3 = Tc(n3, cf, t2) * n3 % t2, s3 = Tc(i3, cf, t2) * n3 % t2, a3 = Tc(s3, of, t2) * r3 % t2, o3 = Tc(a3, uf, t2) * a3 % t2, c3 = Tc(o3, hf, t2) * o3 % t2, u2 = Tc(c3, ff, t2) * c3 % t2, h4 = Tc(u2, lf, t2) * u2 % t2, f2 = Tc(h4, ff, t2) * c3 % t2, l2 = Tc(f2, of, t2) * r3 % t2, y2 = Tc(l2, af, t2) * e2 % t2;
  return Tc(y2, yf, t2) * l2 % t2;
}
function pf(e2) {
  return e2[0] &= 252, e2[55] |= 128, e2[56] = 0, e2;
}
function df(e2, t2) {
  const r3 = rf.p, n3 = Fc(e2 * e2 * t2, r3), i3 = Fc(n3 * e2, r3), s3 = Fc(i3 * n3 * t2, r3), a3 = Fc(i3 * gf(s3), r3), o3 = Fc(a3 * a3, r3);
  return { isValid: Fc(o3 * t2, r3) === e2, value: a3 };
}
function mf(e2, t2, r3) {
  if (t2.length > 255) throw Error("context must be smaller than 255, got: " + t2.length);
  return nc((n3 = "SigEd448", Uint8Array.from(n3, (e3, t3) => {
    const r4 = e3.charCodeAt(0);
    if (1 !== e3.length || r4 > 127) throw Error(`string contains non-ASCII character "${n3[t3]}" with code ${r4} at position ${t3}`);
    return r4;
  })), new Uint8Array([r3 ? 1 : 0, t2.length]), t2, e2);
  var n3;
}
function el(e2, t2, r3, n3) {
  return 0 === e2 ? t2 ^ r3 ^ n3 : 1 === e2 ? t2 & r3 | ~t2 & n3 : 2 === e2 ? (t2 | ~r3) ^ n3 : 3 === e2 ? t2 & n3 | r3 & ~n3 : t2 ^ (r3 | ~n3);
}
function Bl(e2, t2, r3, n3) {
  e2[t2] = r3 >> 24 & 255, e2[t2 + 1] = r3 >> 16 & 255, e2[t2 + 2] = r3 >> 8 & 255, e2[t2 + 3] = 255 & r3, e2[t2 + 4] = n3 >> 24 & 255, e2[t2 + 5] = n3 >> 16 & 255, e2[t2 + 6] = n3 >> 8 & 255, e2[t2 + 7] = 255 & n3;
}
function Sl(e2, t2, r3, n3) {
  return function(e3, t3, r4, n4, i3) {
    var s3, a3 = 0;
    for (s3 = 0; s3 < i3; s3++) a3 |= e3[t3 + s3] ^ r4[n4 + s3];
    return (1 & a3 - 1 >>> 8) - 1;
  }(e2, t2, r3, n3, 32);
}
function Kl(e2, t2) {
  var r3;
  for (r3 = 0; r3 < 16; r3++) e2[r3] = 0 | t2[r3];
}
function Cl(e2) {
  var t2, r3, n3 = 1;
  for (t2 = 0; t2 < 16; t2++) r3 = e2[t2] + n3 + 65535, n3 = Math.floor(r3 / 65536), e2[t2] = r3 - 65536 * n3;
  e2[0] += n3 - 1 + 37 * (n3 - 1);
}
function Dl(e2, t2, r3) {
  for (var n3, i3 = ~(r3 - 1), s3 = 0; s3 < 16; s3++) n3 = i3 & (e2[s3] ^ t2[s3]), e2[s3] ^= n3, t2[s3] ^= n3;
}
function Ul(e2, t2) {
  var r3, n3, i3, s3 = gl(), a3 = gl();
  for (r3 = 0; r3 < 16; r3++) a3[r3] = t2[r3];
  for (Cl(a3), Cl(a3), Cl(a3), n3 = 0; n3 < 2; n3++) {
    for (s3[0] = a3[0] - 65517, r3 = 1; r3 < 15; r3++) s3[r3] = a3[r3] - 65535 - (s3[r3 - 1] >> 16 & 1), s3[r3 - 1] &= 65535;
    s3[15] = a3[15] - 32767 - (s3[14] >> 16 & 1), i3 = s3[15] >> 16 & 1, s3[14] &= 65535, Dl(a3, s3, 1 - i3);
  }
  for (r3 = 0; r3 < 16; r3++) e2[2 * r3] = 255 & a3[r3], e2[2 * r3 + 1] = a3[r3] >> 8;
}
function Pl(e2, t2) {
  var r3 = new Uint8Array(32), n3 = new Uint8Array(32);
  return Ul(r3, e2), Ul(n3, t2), Sl(r3, 0, n3, 0);
}
function xl(e2) {
  var t2 = new Uint8Array(32);
  return Ul(t2, e2), 1 & t2[0];
}
function Ql(e2, t2) {
  var r3;
  for (r3 = 0; r3 < 16; r3++) e2[r3] = t2[2 * r3] + (t2[2 * r3 + 1] << 8);
  e2[15] &= 32767;
}
function Ml(e2, t2, r3) {
  for (var n3 = 0; n3 < 16; n3++) e2[n3] = t2[n3] + r3[n3];
}
function Rl(e2, t2, r3) {
  for (var n3 = 0; n3 < 16; n3++) e2[n3] = t2[n3] - r3[n3];
}
function Fl(e2, t2, r3) {
  var n3, i3, s3 = 0, a3 = 0, o3 = 0, c3 = 0, u2 = 0, h4 = 0, f2 = 0, l2 = 0, y2 = 0, g2 = 0, p2 = 0, d3 = 0, A2 = 0, w2 = 0, m2 = 0, b2 = 0, k2 = 0, E2 = 0, v2 = 0, I2 = 0, B2 = 0, S2 = 0, K2 = 0, C2 = 0, D2 = 0, U2 = 0, P2 = 0, x2 = 0, Q2 = 0, M2 = 0, R2 = 0, F2 = r3[0], T2 = r3[1], L2 = r3[2], N2 = r3[3], O2 = r3[4], H2 = r3[5], z2 = r3[6], G2 = r3[7], j2 = r3[8], V2 = r3[9], q2 = r3[10], _2 = r3[11], Y2 = r3[12], Z2 = r3[13], J2 = r3[14], W2 = r3[15];
  s3 += (n3 = t2[0]) * F2, a3 += n3 * T2, o3 += n3 * L2, c3 += n3 * N2, u2 += n3 * O2, h4 += n3 * H2, f2 += n3 * z2, l2 += n3 * G2, y2 += n3 * j2, g2 += n3 * V2, p2 += n3 * q2, d3 += n3 * _2, A2 += n3 * Y2, w2 += n3 * Z2, m2 += n3 * J2, b2 += n3 * W2, a3 += (n3 = t2[1]) * F2, o3 += n3 * T2, c3 += n3 * L2, u2 += n3 * N2, h4 += n3 * O2, f2 += n3 * H2, l2 += n3 * z2, y2 += n3 * G2, g2 += n3 * j2, p2 += n3 * V2, d3 += n3 * q2, A2 += n3 * _2, w2 += n3 * Y2, m2 += n3 * Z2, b2 += n3 * J2, k2 += n3 * W2, o3 += (n3 = t2[2]) * F2, c3 += n3 * T2, u2 += n3 * L2, h4 += n3 * N2, f2 += n3 * O2, l2 += n3 * H2, y2 += n3 * z2, g2 += n3 * G2, p2 += n3 * j2, d3 += n3 * V2, A2 += n3 * q2, w2 += n3 * _2, m2 += n3 * Y2, b2 += n3 * Z2, k2 += n3 * J2, E2 += n3 * W2, c3 += (n3 = t2[3]) * F2, u2 += n3 * T2, h4 += n3 * L2, f2 += n3 * N2, l2 += n3 * O2, y2 += n3 * H2, g2 += n3 * z2, p2 += n3 * G2, d3 += n3 * j2, A2 += n3 * V2, w2 += n3 * q2, m2 += n3 * _2, b2 += n3 * Y2, k2 += n3 * Z2, E2 += n3 * J2, v2 += n3 * W2, u2 += (n3 = t2[4]) * F2, h4 += n3 * T2, f2 += n3 * L2, l2 += n3 * N2, y2 += n3 * O2, g2 += n3 * H2, p2 += n3 * z2, d3 += n3 * G2, A2 += n3 * j2, w2 += n3 * V2, m2 += n3 * q2, b2 += n3 * _2, k2 += n3 * Y2, E2 += n3 * Z2, v2 += n3 * J2, I2 += n3 * W2, h4 += (n3 = t2[5]) * F2, f2 += n3 * T2, l2 += n3 * L2, y2 += n3 * N2, g2 += n3 * O2, p2 += n3 * H2, d3 += n3 * z2, A2 += n3 * G2, w2 += n3 * j2, m2 += n3 * V2, b2 += n3 * q2, k2 += n3 * _2, E2 += n3 * Y2, v2 += n3 * Z2, I2 += n3 * J2, B2 += n3 * W2, f2 += (n3 = t2[6]) * F2, l2 += n3 * T2, y2 += n3 * L2, g2 += n3 * N2, p2 += n3 * O2, d3 += n3 * H2, A2 += n3 * z2, w2 += n3 * G2, m2 += n3 * j2, b2 += n3 * V2, k2 += n3 * q2, E2 += n3 * _2, v2 += n3 * Y2, I2 += n3 * Z2, B2 += n3 * J2, S2 += n3 * W2, l2 += (n3 = t2[7]) * F2, y2 += n3 * T2, g2 += n3 * L2, p2 += n3 * N2, d3 += n3 * O2, A2 += n3 * H2, w2 += n3 * z2, m2 += n3 * G2, b2 += n3 * j2, k2 += n3 * V2, E2 += n3 * q2, v2 += n3 * _2, I2 += n3 * Y2, B2 += n3 * Z2, S2 += n3 * J2, K2 += n3 * W2, y2 += (n3 = t2[8]) * F2, g2 += n3 * T2, p2 += n3 * L2, d3 += n3 * N2, A2 += n3 * O2, w2 += n3 * H2, m2 += n3 * z2, b2 += n3 * G2, k2 += n3 * j2, E2 += n3 * V2, v2 += n3 * q2, I2 += n3 * _2, B2 += n3 * Y2, S2 += n3 * Z2, K2 += n3 * J2, C2 += n3 * W2, g2 += (n3 = t2[9]) * F2, p2 += n3 * T2, d3 += n3 * L2, A2 += n3 * N2, w2 += n3 * O2, m2 += n3 * H2, b2 += n3 * z2, k2 += n3 * G2, E2 += n3 * j2, v2 += n3 * V2, I2 += n3 * q2, B2 += n3 * _2, S2 += n3 * Y2, K2 += n3 * Z2, C2 += n3 * J2, D2 += n3 * W2, p2 += (n3 = t2[10]) * F2, d3 += n3 * T2, A2 += n3 * L2, w2 += n3 * N2, m2 += n3 * O2, b2 += n3 * H2, k2 += n3 * z2, E2 += n3 * G2, v2 += n3 * j2, I2 += n3 * V2, B2 += n3 * q2, S2 += n3 * _2, K2 += n3 * Y2, C2 += n3 * Z2, D2 += n3 * J2, U2 += n3 * W2, d3 += (n3 = t2[11]) * F2, A2 += n3 * T2, w2 += n3 * L2, m2 += n3 * N2, b2 += n3 * O2, k2 += n3 * H2, E2 += n3 * z2, v2 += n3 * G2, I2 += n3 * j2, B2 += n3 * V2, S2 += n3 * q2, K2 += n3 * _2, C2 += n3 * Y2, D2 += n3 * Z2, U2 += n3 * J2, P2 += n3 * W2, A2 += (n3 = t2[12]) * F2, w2 += n3 * T2, m2 += n3 * L2, b2 += n3 * N2, k2 += n3 * O2, E2 += n3 * H2, v2 += n3 * z2, I2 += n3 * G2, B2 += n3 * j2, S2 += n3 * V2, K2 += n3 * q2, C2 += n3 * _2, D2 += n3 * Y2, U2 += n3 * Z2, P2 += n3 * J2, x2 += n3 * W2, w2 += (n3 = t2[13]) * F2, m2 += n3 * T2, b2 += n3 * L2, k2 += n3 * N2, E2 += n3 * O2, v2 += n3 * H2, I2 += n3 * z2, B2 += n3 * G2, S2 += n3 * j2, K2 += n3 * V2, C2 += n3 * q2, D2 += n3 * _2, U2 += n3 * Y2, P2 += n3 * Z2, x2 += n3 * J2, Q2 += n3 * W2, m2 += (n3 = t2[14]) * F2, b2 += n3 * T2, k2 += n3 * L2, E2 += n3 * N2, v2 += n3 * O2, I2 += n3 * H2, B2 += n3 * z2, S2 += n3 * G2, K2 += n3 * j2, C2 += n3 * V2, D2 += n3 * q2, U2 += n3 * _2, P2 += n3 * Y2, x2 += n3 * Z2, Q2 += n3 * J2, M2 += n3 * W2, b2 += (n3 = t2[15]) * F2, a3 += 38 * (E2 += n3 * L2), o3 += 38 * (v2 += n3 * N2), c3 += 38 * (I2 += n3 * O2), u2 += 38 * (B2 += n3 * H2), h4 += 38 * (S2 += n3 * z2), f2 += 38 * (K2 += n3 * G2), l2 += 38 * (C2 += n3 * j2), y2 += 38 * (D2 += n3 * V2), g2 += 38 * (U2 += n3 * q2), p2 += 38 * (P2 += n3 * _2), d3 += 38 * (x2 += n3 * Y2), A2 += 38 * (Q2 += n3 * Z2), w2 += 38 * (M2 += n3 * J2), m2 += 38 * (R2 += n3 * W2), s3 = (n3 = (s3 += 38 * (k2 += n3 * T2)) + (i3 = 1) + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), a3 = (n3 = a3 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), o3 = (n3 = o3 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), c3 = (n3 = c3 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), u2 = (n3 = u2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), h4 = (n3 = h4 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), f2 = (n3 = f2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), l2 = (n3 = l2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), y2 = (n3 = y2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), g2 = (n3 = g2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), p2 = (n3 = p2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), d3 = (n3 = d3 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), A2 = (n3 = A2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), w2 = (n3 = w2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), m2 = (n3 = m2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), b2 = (n3 = b2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), s3 = (n3 = (s3 += i3 - 1 + 37 * (i3 - 1)) + (i3 = 1) + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), a3 = (n3 = a3 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), o3 = (n3 = o3 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), c3 = (n3 = c3 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), u2 = (n3 = u2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), h4 = (n3 = h4 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), f2 = (n3 = f2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), l2 = (n3 = l2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), y2 = (n3 = y2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), g2 = (n3 = g2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), p2 = (n3 = p2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), d3 = (n3 = d3 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), A2 = (n3 = A2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), w2 = (n3 = w2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), m2 = (n3 = m2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), b2 = (n3 = b2 + i3 + 65535) - 65536 * (i3 = Math.floor(n3 / 65536)), s3 += i3 - 1 + 37 * (i3 - 1), e2[0] = s3, e2[1] = a3, e2[2] = o3, e2[3] = c3, e2[4] = u2, e2[5] = h4, e2[6] = f2, e2[7] = l2, e2[8] = y2, e2[9] = g2, e2[10] = p2, e2[11] = d3, e2[12] = A2, e2[13] = w2, e2[14] = m2, e2[15] = b2;
}
function Tl(e2, t2) {
  Fl(e2, t2, t2);
}
function Ll(e2, t2) {
  var r3, n3 = gl();
  for (r3 = 0; r3 < 16; r3++) n3[r3] = t2[r3];
  for (r3 = 253; r3 >= 0; r3--) Tl(n3, n3), 2 !== r3 && 4 !== r3 && Fl(n3, n3, t2);
  for (r3 = 0; r3 < 16; r3++) e2[r3] = n3[r3];
}
function Nl(e2, t2, r3) {
  var n3, i3, s3 = new Uint8Array(32), a3 = new Float64Array(80), o3 = gl(), c3 = gl(), u2 = gl(), h4 = gl(), f2 = gl(), l2 = gl();
  for (i3 = 0; i3 < 31; i3++) s3[i3] = t2[i3];
  for (s3[31] = 127 & t2[31] | 64, s3[0] &= 248, Ql(a3, r3), i3 = 0; i3 < 16; i3++) c3[i3] = a3[i3], h4[i3] = o3[i3] = u2[i3] = 0;
  for (o3[0] = h4[0] = 1, i3 = 254; i3 >= 0; --i3) Dl(o3, c3, n3 = s3[i3 >>> 3] >>> (7 & i3) & 1), Dl(u2, h4, n3), Ml(f2, o3, u2), Rl(o3, o3, u2), Ml(u2, c3, h4), Rl(c3, c3, h4), Tl(h4, f2), Tl(l2, o3), Fl(o3, u2, o3), Fl(u2, c3, f2), Ml(f2, o3, u2), Rl(o3, o3, u2), Tl(c3, o3), Rl(u2, h4, l2), Fl(o3, u2, ml), Ml(o3, o3, h4), Fl(u2, u2, o3), Fl(o3, h4, l2), Fl(h4, c3, a3), Tl(c3, f2), Dl(o3, c3, n3), Dl(u2, h4, n3);
  for (i3 = 0; i3 < 16; i3++) a3[i3 + 16] = o3[i3], a3[i3 + 32] = u2[i3], a3[i3 + 48] = c3[i3], a3[i3 + 64] = h4[i3];
  var y2 = a3.subarray(32), g2 = a3.subarray(16);
  return Ll(y2, y2), Fl(g2, g2, y2), Ul(e2, g2), 0;
}
function Ol(e2, t2) {
  return Nl(e2, t2, dl);
}
function zl(e2, t2, r3, n3) {
  for (var i3, s3, a3, o3, c3, u2, h4, f2, l2, y2, g2, p2, d3, A2, w2, m2, b2, k2, E2, v2, I2, B2, S2, K2, C2, D2, U2 = new Int32Array(16), P2 = new Int32Array(16), x2 = e2[0], Q2 = e2[1], M2 = e2[2], R2 = e2[3], F2 = e2[4], T2 = e2[5], L2 = e2[6], N2 = e2[7], O2 = t2[0], H2 = t2[1], z2 = t2[2], G2 = t2[3], j2 = t2[4], V2 = t2[5], q2 = t2[6], _2 = t2[7], Y2 = 0; n3 >= 128; ) {
    for (E2 = 0; E2 < 16; E2++) v2 = 8 * E2 + Y2, U2[E2] = r3[v2 + 0] << 24 | r3[v2 + 1] << 16 | r3[v2 + 2] << 8 | r3[v2 + 3], P2[E2] = r3[v2 + 4] << 24 | r3[v2 + 5] << 16 | r3[v2 + 6] << 8 | r3[v2 + 7];
    for (E2 = 0; E2 < 80; E2++) if (i3 = x2, s3 = Q2, a3 = M2, o3 = R2, c3 = F2, u2 = T2, h4 = L2, N2, l2 = O2, y2 = H2, g2 = z2, p2 = G2, d3 = j2, A2 = V2, w2 = q2, _2, S2 = 65535 & (B2 = _2), K2 = B2 >>> 16, C2 = 65535 & (I2 = N2), D2 = I2 >>> 16, S2 += 65535 & (B2 = (j2 >>> 14 | F2 << 18) ^ (j2 >>> 18 | F2 << 14) ^ (F2 >>> 9 | j2 << 23)), K2 += B2 >>> 16, C2 += 65535 & (I2 = (F2 >>> 14 | j2 << 18) ^ (F2 >>> 18 | j2 << 14) ^ (j2 >>> 9 | F2 << 23)), D2 += I2 >>> 16, S2 += 65535 & (B2 = j2 & V2 ^ ~j2 & q2), K2 += B2 >>> 16, C2 += 65535 & (I2 = F2 & T2 ^ ~F2 & L2), D2 += I2 >>> 16, S2 += 65535 & (B2 = Hl[2 * E2 + 1]), K2 += B2 >>> 16, C2 += 65535 & (I2 = Hl[2 * E2]), D2 += I2 >>> 16, I2 = U2[E2 % 16], K2 += (B2 = P2[E2 % 16]) >>> 16, C2 += 65535 & I2, D2 += I2 >>> 16, C2 += (K2 += (S2 += 65535 & B2) >>> 16) >>> 16, S2 = 65535 & (B2 = k2 = 65535 & S2 | K2 << 16), K2 = B2 >>> 16, C2 = 65535 & (I2 = b2 = 65535 & C2 | (D2 += C2 >>> 16) << 16), D2 = I2 >>> 16, S2 += 65535 & (B2 = (O2 >>> 28 | x2 << 4) ^ (x2 >>> 2 | O2 << 30) ^ (x2 >>> 7 | O2 << 25)), K2 += B2 >>> 16, C2 += 65535 & (I2 = (x2 >>> 28 | O2 << 4) ^ (O2 >>> 2 | x2 << 30) ^ (O2 >>> 7 | x2 << 25)), D2 += I2 >>> 16, K2 += (B2 = O2 & H2 ^ O2 & z2 ^ H2 & z2) >>> 16, C2 += 65535 & (I2 = x2 & Q2 ^ x2 & M2 ^ Q2 & M2), D2 += I2 >>> 16, f2 = 65535 & (C2 += (K2 += (S2 += 65535 & B2) >>> 16) >>> 16) | (D2 += C2 >>> 16) << 16, m2 = 65535 & S2 | K2 << 16, S2 = 65535 & (B2 = p2), K2 = B2 >>> 16, C2 = 65535 & (I2 = o3), D2 = I2 >>> 16, K2 += (B2 = k2) >>> 16, C2 += 65535 & (I2 = b2), D2 += I2 >>> 16, Q2 = i3, M2 = s3, R2 = a3, F2 = o3 = 65535 & (C2 += (K2 += (S2 += 65535 & B2) >>> 16) >>> 16) | (D2 += C2 >>> 16) << 16, T2 = c3, L2 = u2, N2 = h4, x2 = f2, H2 = l2, z2 = y2, G2 = g2, j2 = p2 = 65535 & S2 | K2 << 16, V2 = d3, q2 = A2, _2 = w2, O2 = m2, E2 % 16 == 15) for (v2 = 0; v2 < 16; v2++) I2 = U2[v2], S2 = 65535 & (B2 = P2[v2]), K2 = B2 >>> 16, C2 = 65535 & I2, D2 = I2 >>> 16, I2 = U2[(v2 + 9) % 16], S2 += 65535 & (B2 = P2[(v2 + 9) % 16]), K2 += B2 >>> 16, C2 += 65535 & I2, D2 += I2 >>> 16, b2 = U2[(v2 + 1) % 16], S2 += 65535 & (B2 = ((k2 = P2[(v2 + 1) % 16]) >>> 1 | b2 << 31) ^ (k2 >>> 8 | b2 << 24) ^ (k2 >>> 7 | b2 << 25)), K2 += B2 >>> 16, C2 += 65535 & (I2 = (b2 >>> 1 | k2 << 31) ^ (b2 >>> 8 | k2 << 24) ^ b2 >>> 7), D2 += I2 >>> 16, b2 = U2[(v2 + 14) % 16], K2 += (B2 = ((k2 = P2[(v2 + 14) % 16]) >>> 19 | b2 << 13) ^ (b2 >>> 29 | k2 << 3) ^ (k2 >>> 6 | b2 << 26)) >>> 16, C2 += 65535 & (I2 = (b2 >>> 19 | k2 << 13) ^ (k2 >>> 29 | b2 << 3) ^ b2 >>> 6), D2 += I2 >>> 16, D2 += (C2 += (K2 += (S2 += 65535 & B2) >>> 16) >>> 16) >>> 16, U2[v2] = 65535 & C2 | D2 << 16, P2[v2] = 65535 & S2 | K2 << 16;
    S2 = 65535 & (B2 = O2), K2 = B2 >>> 16, C2 = 65535 & (I2 = x2), D2 = I2 >>> 16, I2 = e2[0], K2 += (B2 = t2[0]) >>> 16, C2 += 65535 & I2, D2 += I2 >>> 16, D2 += (C2 += (K2 += (S2 += 65535 & B2) >>> 16) >>> 16) >>> 16, e2[0] = x2 = 65535 & C2 | D2 << 16, t2[0] = O2 = 65535 & S2 | K2 << 16, S2 = 65535 & (B2 = H2), K2 = B2 >>> 16, C2 = 65535 & (I2 = Q2), D2 = I2 >>> 16, I2 = e2[1], K2 += (B2 = t2[1]) >>> 16, C2 += 65535 & I2, D2 += I2 >>> 16, D2 += (C2 += (K2 += (S2 += 65535 & B2) >>> 16) >>> 16) >>> 16, e2[1] = Q2 = 65535 & C2 | D2 << 16, t2[1] = H2 = 65535 & S2 | K2 << 16, S2 = 65535 & (B2 = z2), K2 = B2 >>> 16, C2 = 65535 & (I2 = M2), D2 = I2 >>> 16, I2 = e2[2], K2 += (B2 = t2[2]) >>> 16, C2 += 65535 & I2, D2 += I2 >>> 16, D2 += (C2 += (K2 += (S2 += 65535 & B2) >>> 16) >>> 16) >>> 16, e2[2] = M2 = 65535 & C2 | D2 << 16, t2[2] = z2 = 65535 & S2 | K2 << 16, S2 = 65535 & (B2 = G2), K2 = B2 >>> 16, C2 = 65535 & (I2 = R2), D2 = I2 >>> 16, I2 = e2[3], K2 += (B2 = t2[3]) >>> 16, C2 += 65535 & I2, D2 += I2 >>> 16, D2 += (C2 += (K2 += (S2 += 65535 & B2) >>> 16) >>> 16) >>> 16, e2[3] = R2 = 65535 & C2 | D2 << 16, t2[3] = G2 = 65535 & S2 | K2 << 16, S2 = 65535 & (B2 = j2), K2 = B2 >>> 16, C2 = 65535 & (I2 = F2), D2 = I2 >>> 16, I2 = e2[4], K2 += (B2 = t2[4]) >>> 16, C2 += 65535 & I2, D2 += I2 >>> 16, D2 += (C2 += (K2 += (S2 += 65535 & B2) >>> 16) >>> 16) >>> 16, e2[4] = F2 = 65535 & C2 | D2 << 16, t2[4] = j2 = 65535 & S2 | K2 << 16, S2 = 65535 & (B2 = V2), K2 = B2 >>> 16, C2 = 65535 & (I2 = T2), D2 = I2 >>> 16, I2 = e2[5], K2 += (B2 = t2[5]) >>> 16, C2 += 65535 & I2, D2 += I2 >>> 16, D2 += (C2 += (K2 += (S2 += 65535 & B2) >>> 16) >>> 16) >>> 16, e2[5] = T2 = 65535 & C2 | D2 << 16, t2[5] = V2 = 65535 & S2 | K2 << 16, S2 = 65535 & (B2 = q2), K2 = B2 >>> 16, C2 = 65535 & (I2 = L2), D2 = I2 >>> 16, I2 = e2[6], K2 += (B2 = t2[6]) >>> 16, C2 += 65535 & I2, D2 += I2 >>> 16, D2 += (C2 += (K2 += (S2 += 65535 & B2) >>> 16) >>> 16) >>> 16, e2[6] = L2 = 65535 & C2 | D2 << 16, t2[6] = q2 = 65535 & S2 | K2 << 16, S2 = 65535 & (B2 = _2), K2 = B2 >>> 16, C2 = 65535 & (I2 = N2), D2 = I2 >>> 16, I2 = e2[7], K2 += (B2 = t2[7]) >>> 16, C2 += 65535 & I2, D2 += I2 >>> 16, D2 += (C2 += (K2 += (S2 += 65535 & B2) >>> 16) >>> 16) >>> 16, e2[7] = N2 = 65535 & C2 | D2 << 16, t2[7] = _2 = 65535 & S2 | K2 << 16, Y2 += 128, n3 -= 128;
  }
  return n3;
}
function Gl(e2, t2, r3) {
  var n3, i3 = new Int32Array(8), s3 = new Int32Array(8), a3 = new Uint8Array(256), o3 = r3;
  for (i3[0] = 1779033703, i3[1] = 3144134277, i3[2] = 1013904242, i3[3] = 2773480762, i3[4] = 1359893119, i3[5] = 2600822924, i3[6] = 528734635, i3[7] = 1541459225, s3[0] = 4089235720, s3[1] = 2227873595, s3[2] = 4271175723, s3[3] = 1595750129, s3[4] = 2917565137, s3[5] = 725511199, s3[6] = 4215389547, s3[7] = 327033209, zl(i3, s3, t2, r3), r3 %= 128, n3 = 0; n3 < r3; n3++) a3[n3] = t2[o3 - r3 + n3];
  for (a3[r3] = 128, a3[(r3 = 256 - 128 * (r3 < 112 ? 1 : 0)) - 9] = 0, Bl(a3, r3 - 8, o3 / 536870912 | 0, o3 << 3), zl(i3, s3, a3, r3), n3 = 0; n3 < 8; n3++) Bl(e2, 8 * n3, i3[n3], s3[n3]);
  return 0;
}
function jl(e2, t2) {
  var r3 = gl(), n3 = gl(), i3 = gl(), s3 = gl(), a3 = gl(), o3 = gl(), c3 = gl(), u2 = gl(), h4 = gl();
  Rl(r3, e2[1], e2[0]), Rl(h4, t2[1], t2[0]), Fl(r3, r3, h4), Ml(n3, e2[0], e2[1]), Ml(h4, t2[0], t2[1]), Fl(n3, n3, h4), Fl(i3, e2[3], t2[3]), Fl(i3, i3, kl), Fl(s3, e2[2], t2[2]), Ml(s3, s3, s3), Rl(a3, n3, r3), Rl(o3, s3, i3), Ml(c3, s3, i3), Ml(u2, n3, r3), Fl(e2[0], a3, o3), Fl(e2[1], u2, c3), Fl(e2[2], c3, o3), Fl(e2[3], a3, u2);
}
function Vl(e2, t2, r3) {
  var n3;
  for (n3 = 0; n3 < 4; n3++) Dl(e2[n3], t2[n3], r3);
}
function ql(e2, t2) {
  var r3 = gl(), n3 = gl(), i3 = gl();
  Ll(i3, t2[2]), Fl(r3, t2[0], i3), Fl(n3, t2[1], i3), Ul(e2, n3), e2[31] ^= xl(r3) << 7;
}
function _l(e2, t2, r3) {
  var n3, i3;
  for (Kl(e2[0], Al), Kl(e2[1], wl), Kl(e2[2], wl), Kl(e2[3], Al), i3 = 255; i3 >= 0; --i3) Vl(e2, t2, n3 = r3[i3 / 8 | 0] >> (7 & i3) & 1), jl(t2, e2), jl(e2, e2), Vl(e2, t2, n3);
}
function Yl(e2, t2) {
  var r3 = [gl(), gl(), gl(), gl()];
  Kl(r3[0], El), Kl(r3[1], vl), Kl(r3[2], wl), Fl(r3[3], El, vl), _l(e2, r3, t2);
}
function Zl(e2, t2, r3) {
  var n3, i3 = new Uint8Array(64), s3 = [gl(), gl(), gl(), gl()];
  for (r3 || pl(t2, 32), Gl(i3, t2, 32), i3[0] &= 248, i3[31] &= 127, i3[31] |= 64, Yl(s3, i3), ql(e2, s3), n3 = 0; n3 < 32; n3++) t2[n3 + 32] = e2[n3];
  return 0;
}
function Wl(e2, t2) {
  var r3, n3, i3, s3;
  for (n3 = 63; n3 >= 32; --n3) {
    for (r3 = 0, i3 = n3 - 32, s3 = n3 - 12; i3 < s3; ++i3) t2[i3] += r3 - 16 * t2[n3] * Jl[i3 - (n3 - 32)], r3 = Math.floor((t2[i3] + 128) / 256), t2[i3] -= 256 * r3;
    t2[i3] += r3, t2[n3] = 0;
  }
  for (r3 = 0, i3 = 0; i3 < 32; i3++) t2[i3] += r3 - (t2[31] >> 4) * Jl[i3], r3 = t2[i3] >> 8, t2[i3] &= 255;
  for (i3 = 0; i3 < 32; i3++) t2[i3] -= r3 * Jl[i3];
  for (n3 = 0; n3 < 32; n3++) t2[n3 + 1] += t2[n3] >> 8, e2[n3] = 255 & t2[n3];
}
function Xl(e2) {
  var t2, r3 = new Float64Array(64);
  for (t2 = 0; t2 < 64; t2++) r3[t2] = e2[t2];
  for (t2 = 0; t2 < 64; t2++) e2[t2] = 0;
  Wl(e2, r3);
}
function $l(e2, t2) {
  var r3 = gl(), n3 = gl(), i3 = gl(), s3 = gl(), a3 = gl(), o3 = gl(), c3 = gl();
  return Kl(e2[2], wl), Ql(e2[1], t2), Tl(i3, e2[1]), Fl(s3, i3, bl), Rl(i3, i3, e2[2]), Ml(s3, e2[2], s3), Tl(a3, s3), Tl(o3, a3), Fl(c3, o3, a3), Fl(r3, c3, i3), Fl(r3, r3, s3), function(e3, t3) {
    var r4, n4 = gl();
    for (r4 = 0; r4 < 16; r4++) n4[r4] = t3[r4];
    for (r4 = 250; r4 >= 0; r4--) Tl(n4, n4), 1 !== r4 && Fl(n4, n4, t3);
    for (r4 = 0; r4 < 16; r4++) e3[r4] = n4[r4];
  }(r3, r3), Fl(r3, r3, i3), Fl(r3, r3, s3), Fl(r3, r3, s3), Fl(e2[0], r3, s3), Tl(n3, e2[0]), Fl(n3, n3, s3), Pl(n3, i3) && Fl(e2[0], e2[0], Il), Tl(n3, e2[0]), Fl(n3, n3, s3), Pl(n3, i3) ? -1 : (xl(e2[0]) === t2[31] >> 7 && Rl(e2[0], Al, e2[0]), Fl(e2[3], e2[0], e2[1]), 0);
}
function ty() {
  for (var e2 = 0; e2 < arguments.length; e2++) if (!(arguments[e2] instanceof Uint8Array)) throw new TypeError("unexpected type, use Uint8Array");
}
function ny(e2, t2, r3, n3, i3, s3) {
  const a3 = [16843776, 0, 65536, 16843780, 16842756, 66564, 4, 65536, 1024, 16843776, 16843780, 1024, 16778244, 16842756, 16777216, 4, 1028, 16778240, 16778240, 66560, 66560, 16842752, 16842752, 16778244, 65540, 16777220, 16777220, 65540, 0, 1028, 66564, 16777216, 65536, 16843780, 4, 16842752, 16843776, 16777216, 16777216, 1024, 16842756, 65536, 66560, 16777220, 1024, 4, 16778244, 66564, 16843780, 65540, 16842752, 16778244, 16777220, 1028, 66564, 16843776, 1028, 16778240, 16778240, 0, 65540, 66560, 0, 16842756], o3 = [-2146402272, -2147450880, 32768, 1081376, 1048576, 32, -2146435040, -2147450848, -2147483616, -2146402272, -2146402304, -2147483648, -2147450880, 1048576, 32, -2146435040, 1081344, 1048608, -2147450848, 0, -2147483648, 32768, 1081376, -2146435072, 1048608, -2147483616, 0, 1081344, 32800, -2146402304, -2146435072, 32800, 0, 1081376, -2146435040, 1048576, -2147450848, -2146435072, -2146402304, 32768, -2146435072, -2147450880, 32, -2146402272, 1081376, 32, 32768, -2147483648, 32800, -2146402304, 1048576, -2147483616, 1048608, -2147450848, -2147483616, 1048608, 1081344, 0, -2147450880, 32800, -2147483648, -2146435040, -2146402272, 1081344], c3 = [520, 134349312, 0, 134348808, 134218240, 0, 131592, 134218240, 131080, 134217736, 134217736, 131072, 134349320, 131080, 134348800, 520, 134217728, 8, 134349312, 512, 131584, 134348800, 134348808, 131592, 134218248, 131584, 131072, 134218248, 8, 134349320, 512, 134217728, 134349312, 134217728, 131080, 520, 131072, 134349312, 134218240, 0, 512, 131080, 134349320, 134218240, 134217736, 512, 0, 134348808, 134218248, 131072, 134217728, 134349320, 8, 131592, 131584, 134217736, 134348800, 134218248, 520, 134348800, 131592, 8, 134348808, 131584], u2 = [8396801, 8321, 8321, 128, 8396928, 8388737, 8388609, 8193, 0, 8396800, 8396800, 8396929, 129, 0, 8388736, 8388609, 1, 8192, 8388608, 8396801, 128, 8388608, 8193, 8320, 8388737, 1, 8320, 8388736, 8192, 8396928, 8396929, 129, 8388736, 8388609, 8396800, 8396929, 129, 0, 0, 8396800, 8320, 8388736, 8388737, 1, 8396801, 8321, 8321, 128, 8396929, 129, 1, 8192, 8388609, 8193, 8396928, 8388737, 8193, 8320, 8388608, 8396801, 128, 8388608, 8192, 8396928], h4 = [256, 34078976, 34078720, 1107296512, 524288, 256, 1073741824, 34078720, 1074266368, 524288, 33554688, 1074266368, 1107296512, 1107820544, 524544, 1073741824, 33554432, 1074266112, 1074266112, 0, 1073742080, 1107820800, 1107820800, 33554688, 1107820544, 1073742080, 0, 1107296256, 34078976, 33554432, 1107296256, 524544, 524288, 1107296512, 256, 33554432, 1073741824, 34078720, 1107296512, 1074266368, 33554688, 1073741824, 1107820544, 34078976, 1074266368, 256, 33554432, 1107820544, 1107820800, 524544, 1107296256, 1107820800, 34078720, 0, 1074266112, 1107296256, 524544, 33554688, 1073742080, 524288, 0, 1074266112, 34078976, 1073742080], f2 = [536870928, 541065216, 16384, 541081616, 541065216, 16, 541081616, 4194304, 536887296, 4210704, 4194304, 536870928, 4194320, 536887296, 536870912, 16400, 0, 4194320, 536887312, 16384, 4210688, 536887312, 16, 541065232, 541065232, 0, 4210704, 541081600, 16400, 4210688, 541081600, 536870912, 536887296, 16, 541065232, 4210688, 541081616, 4194304, 16400, 536870928, 4194304, 536887296, 536870912, 16400, 536870928, 541081616, 4210688, 541065216, 4210704, 541081600, 0, 541065232, 16, 16384, 541065216, 4210704, 16384, 4194320, 536887312, 0, 541081600, 536870912, 4194320, 536887312], l2 = [2097152, 69206018, 67110914, 0, 2048, 67110914, 2099202, 69208064, 69208066, 2097152, 0, 67108866, 2, 67108864, 69206018, 2050, 67110912, 2099202, 2097154, 67110912, 67108866, 69206016, 69208064, 2097154, 69206016, 2048, 2050, 69208066, 2099200, 2, 67108864, 2099200, 67108864, 2099200, 2097152, 67110914, 67110914, 69206018, 69206018, 2, 2097154, 67108864, 67110912, 2097152, 69208064, 2050, 2099202, 69208064, 2050, 67108866, 69208066, 69206016, 2099200, 0, 2, 69208066, 0, 2099202, 69206016, 2048, 67108866, 67110912, 2048, 2097154], y2 = [268439616, 4096, 262144, 268701760, 268435456, 268439616, 64, 268435456, 262208, 268697600, 268701760, 266240, 268701696, 266304, 4096, 64, 268697600, 268435520, 268439552, 4160, 266240, 262208, 268697664, 268701696, 4160, 0, 0, 268697664, 268435520, 268439552, 266304, 262144, 266304, 262144, 268701696, 4096, 64, 268697664, 4096, 266304, 268439552, 64, 268435520, 268697600, 268697664, 268435456, 262144, 268439616, 0, 268701760, 262208, 268435520, 268697600, 268439552, 268439616, 0, 268701760, 266240, 266240, 4160, 4160, 262208, 268435456, 268701696];
  let g2, p2, d3, A2, w2, m2, b2, k2, E2, v2, I2 = 0, B2 = t2.length;
  const S2 = 32 === e2.length ? 3 : 9;
  k2 = 3 === S2 ? r3 ? [0, 32, 2] : [30, -2, -2] : r3 ? [0, 32, 2, 62, 30, -2, 64, 96, 2] : [94, 62, -2, 32, 64, 2, 30, -2, -2], r3 && (t2 = function(e3) {
    const t3 = 8 - e3.length % 8;
    let r4;
    if (!(t3 < 8)) {
      if (8 === t3) return e3;
      throw Error("des: invalid padding");
    }
    r4 = 0;
    const n4 = new Uint8Array(e3.length + t3);
    for (let t4 = 0; t4 < e3.length; t4++) n4[t4] = e3[t4];
    for (let i4 = 0; i4 < t3; i4++) n4[e3.length + i4] = r4;
    return n4;
  }(t2), B2 = t2.length);
  let K2 = new Uint8Array(B2), C2 = 0;
  for (; I2 < B2; ) {
    for (m2 = t2[I2++] << 24 | t2[I2++] << 16 | t2[I2++] << 8 | t2[I2++], b2 = t2[I2++] << 24 | t2[I2++] << 16 | t2[I2++] << 8 | t2[I2++], d3 = 252645135 & (m2 >>> 4 ^ b2), b2 ^= d3, m2 ^= d3 << 4, d3 = 65535 & (m2 >>> 16 ^ b2), b2 ^= d3, m2 ^= d3 << 16, d3 = 858993459 & (b2 >>> 2 ^ m2), m2 ^= d3, b2 ^= d3 << 2, d3 = 16711935 & (b2 >>> 8 ^ m2), m2 ^= d3, b2 ^= d3 << 8, d3 = 1431655765 & (m2 >>> 1 ^ b2), b2 ^= d3, m2 ^= d3 << 1, m2 = m2 << 1 | m2 >>> 31, b2 = b2 << 1 | b2 >>> 31, p2 = 0; p2 < S2; p2 += 3) {
      for (E2 = k2[p2 + 1], v2 = k2[p2 + 2], g2 = k2[p2]; g2 !== E2; g2 += v2) A2 = b2 ^ e2[g2], w2 = (b2 >>> 4 | b2 << 28) ^ e2[g2 + 1], d3 = m2, m2 = b2, b2 = d3 ^ (o3[A2 >>> 24 & 63] | u2[A2 >>> 16 & 63] | f2[A2 >>> 8 & 63] | y2[63 & A2] | a3[w2 >>> 24 & 63] | c3[w2 >>> 16 & 63] | h4[w2 >>> 8 & 63] | l2[63 & w2]);
      d3 = m2, m2 = b2, b2 = d3;
    }
    m2 = m2 >>> 1 | m2 << 31, b2 = b2 >>> 1 | b2 << 31, d3 = 1431655765 & (m2 >>> 1 ^ b2), b2 ^= d3, m2 ^= d3 << 1, d3 = 16711935 & (b2 >>> 8 ^ m2), m2 ^= d3, b2 ^= d3 << 8, d3 = 858993459 & (b2 >>> 2 ^ m2), m2 ^= d3, b2 ^= d3 << 2, d3 = 65535 & (m2 >>> 16 ^ b2), b2 ^= d3, m2 ^= d3 << 16, d3 = 252645135 & (m2 >>> 4 ^ b2), b2 ^= d3, m2 ^= d3 << 4, K2[C2++] = m2 >>> 24, K2[C2++] = m2 >>> 16 & 255, K2[C2++] = m2 >>> 8 & 255, K2[C2++] = 255 & m2, K2[C2++] = b2 >>> 24, K2[C2++] = b2 >>> 16 & 255, K2[C2++] = b2 >>> 8 & 255, K2[C2++] = 255 & b2;
  }
  return r3 || (K2 = function(e3) {
    let t3, r4 = null;
    if (t3 = 0, !r4) {
      for (r4 = 1; e3[e3.length - r4] === t3; ) r4++;
      r4--;
    }
    return e3.subarray(0, e3.length - r4);
  }(K2)), K2;
}
function iy(e2) {
  const t2 = [0, 4, 536870912, 536870916, 65536, 65540, 536936448, 536936452, 512, 516, 536871424, 536871428, 66048, 66052, 536936960, 536936964], r3 = [0, 1, 1048576, 1048577, 67108864, 67108865, 68157440, 68157441, 256, 257, 1048832, 1048833, 67109120, 67109121, 68157696, 68157697], n3 = [0, 8, 2048, 2056, 16777216, 16777224, 16779264, 16779272, 0, 8, 2048, 2056, 16777216, 16777224, 16779264, 16779272], i3 = [0, 2097152, 134217728, 136314880, 8192, 2105344, 134225920, 136323072, 131072, 2228224, 134348800, 136445952, 139264, 2236416, 134356992, 136454144], s3 = [0, 262144, 16, 262160, 0, 262144, 16, 262160, 4096, 266240, 4112, 266256, 4096, 266240, 4112, 266256], a3 = [0, 1024, 32, 1056, 0, 1024, 32, 1056, 33554432, 33555456, 33554464, 33555488, 33554432, 33555456, 33554464, 33555488], o3 = [0, 268435456, 524288, 268959744, 2, 268435458, 524290, 268959746, 0, 268435456, 524288, 268959744, 2, 268435458, 524290, 268959746], c3 = [0, 65536, 2048, 67584, 536870912, 536936448, 536872960, 536938496, 131072, 196608, 133120, 198656, 537001984, 537067520, 537004032, 537069568], u2 = [0, 262144, 0, 262144, 2, 262146, 2, 262146, 33554432, 33816576, 33554432, 33816576, 33554434, 33816578, 33554434, 33816578], h4 = [0, 268435456, 8, 268435464, 0, 268435456, 8, 268435464, 1024, 268436480, 1032, 268436488, 1024, 268436480, 1032, 268436488], f2 = [0, 32, 0, 32, 1048576, 1048608, 1048576, 1048608, 8192, 8224, 8192, 8224, 1056768, 1056800, 1056768, 1056800], l2 = [0, 16777216, 512, 16777728, 2097152, 18874368, 2097664, 18874880, 67108864, 83886080, 67109376, 83886592, 69206016, 85983232, 69206528, 85983744], y2 = [0, 4096, 134217728, 134221824, 524288, 528384, 134742016, 134746112, 16, 4112, 134217744, 134221840, 524304, 528400, 134742032, 134746128], g2 = [0, 4, 256, 260, 0, 4, 256, 260, 1, 5, 257, 261, 1, 5, 257, 261], p2 = e2.length > 8 ? 3 : 1, d3 = Array(32 * p2), A2 = [0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0];
  let w2, m2, b2, k2 = 0, E2 = 0;
  for (let v2 = 0; v2 < p2; v2++) {
    let p3 = e2[k2++] << 24 | e2[k2++] << 16 | e2[k2++] << 8 | e2[k2++], v3 = e2[k2++] << 24 | e2[k2++] << 16 | e2[k2++] << 8 | e2[k2++];
    b2 = 252645135 & (p3 >>> 4 ^ v3), v3 ^= b2, p3 ^= b2 << 4, b2 = 65535 & (v3 >>> -16 ^ p3), p3 ^= b2, v3 ^= b2 << -16, b2 = 858993459 & (p3 >>> 2 ^ v3), v3 ^= b2, p3 ^= b2 << 2, b2 = 65535 & (v3 >>> -16 ^ p3), p3 ^= b2, v3 ^= b2 << -16, b2 = 1431655765 & (p3 >>> 1 ^ v3), v3 ^= b2, p3 ^= b2 << 1, b2 = 16711935 & (v3 >>> 8 ^ p3), p3 ^= b2, v3 ^= b2 << 8, b2 = 1431655765 & (p3 >>> 1 ^ v3), v3 ^= b2, p3 ^= b2 << 1, b2 = p3 << 8 | v3 >>> 20 & 240, p3 = v3 << 24 | v3 << 8 & 16711680 | v3 >>> 8 & 65280 | v3 >>> 24 & 240, v3 = b2;
    for (let e3 = 0; e3 < 16; e3++) A2[e3] ? (p3 = p3 << 2 | p3 >>> 26, v3 = v3 << 2 | v3 >>> 26) : (p3 = p3 << 1 | p3 >>> 27, v3 = v3 << 1 | v3 >>> 27), p3 &= -15, v3 &= -15, w2 = t2[p3 >>> 28] | r3[p3 >>> 24 & 15] | n3[p3 >>> 20 & 15] | i3[p3 >>> 16 & 15] | s3[p3 >>> 12 & 15] | a3[p3 >>> 8 & 15] | o3[p3 >>> 4 & 15], m2 = c3[v3 >>> 28] | u2[v3 >>> 24 & 15] | h4[v3 >>> 20 & 15] | f2[v3 >>> 16 & 15] | l2[v3 >>> 12 & 15] | y2[v3 >>> 8 & 15] | g2[v3 >>> 4 & 15], b2 = 65535 & (m2 >>> 16 ^ w2), d3[E2++] = w2 ^ b2, d3[E2++] = m2 ^ b2 << 16;
  }
  return d3;
}
function sy(e2) {
  this.key = [];
  for (let t2 = 0; t2 < 3; t2++) this.key.push(new Uint8Array(e2.subarray(8 * t2, 8 * t2 + 8)));
  this.encrypt = function(e3) {
    return ny(iy(this.key[2]), ny(iy(this.key[1]), ny(iy(this.key[0]), e3, true), false), true);
  };
}
function ay() {
  this.BlockSize = 8, this.KeySize = 16, this.setKey = function(e3) {
    if (this.masking = Array(16), this.rotate = Array(16), this.reset(), e3.length !== this.KeySize) throw Error("CAST-128: keys must be 16 bytes");
    return this.keySchedule(e3), true;
  }, this.reset = function() {
    for (let e3 = 0; e3 < 16; e3++) this.masking[e3] = 0, this.rotate[e3] = 0;
  }, this.getBlockSize = function() {
    return this.BlockSize;
  }, this.encrypt = function(e3) {
    const t3 = Array(e3.length);
    for (let s4 = 0; s4 < e3.length; s4 += 8) {
      let a3, o3 = e3[s4] << 24 | e3[s4 + 1] << 16 | e3[s4 + 2] << 8 | e3[s4 + 3], c3 = e3[s4 + 4] << 24 | e3[s4 + 5] << 16 | e3[s4 + 6] << 8 | e3[s4 + 7];
      a3 = c3, c3 = o3 ^ r3(c3, this.masking[0], this.rotate[0]), o3 = a3, a3 = c3, c3 = o3 ^ n3(c3, this.masking[1], this.rotate[1]), o3 = a3, a3 = c3, c3 = o3 ^ i3(c3, this.masking[2], this.rotate[2]), o3 = a3, a3 = c3, c3 = o3 ^ r3(c3, this.masking[3], this.rotate[3]), o3 = a3, a3 = c3, c3 = o3 ^ n3(c3, this.masking[4], this.rotate[4]), o3 = a3, a3 = c3, c3 = o3 ^ i3(c3, this.masking[5], this.rotate[5]), o3 = a3, a3 = c3, c3 = o3 ^ r3(c3, this.masking[6], this.rotate[6]), o3 = a3, a3 = c3, c3 = o3 ^ n3(c3, this.masking[7], this.rotate[7]), o3 = a3, a3 = c3, c3 = o3 ^ i3(c3, this.masking[8], this.rotate[8]), o3 = a3, a3 = c3, c3 = o3 ^ r3(c3, this.masking[9], this.rotate[9]), o3 = a3, a3 = c3, c3 = o3 ^ n3(c3, this.masking[10], this.rotate[10]), o3 = a3, a3 = c3, c3 = o3 ^ i3(c3, this.masking[11], this.rotate[11]), o3 = a3, a3 = c3, c3 = o3 ^ r3(c3, this.masking[12], this.rotate[12]), o3 = a3, a3 = c3, c3 = o3 ^ n3(c3, this.masking[13], this.rotate[13]), o3 = a3, a3 = c3, c3 = o3 ^ i3(c3, this.masking[14], this.rotate[14]), o3 = a3, a3 = c3, c3 = o3 ^ r3(c3, this.masking[15], this.rotate[15]), o3 = a3, t3[s4] = c3 >>> 24 & 255, t3[s4 + 1] = c3 >>> 16 & 255, t3[s4 + 2] = c3 >>> 8 & 255, t3[s4 + 3] = 255 & c3, t3[s4 + 4] = o3 >>> 24 & 255, t3[s4 + 5] = o3 >>> 16 & 255, t3[s4 + 6] = o3 >>> 8 & 255, t3[s4 + 7] = 255 & o3;
    }
    return t3;
  }, this.decrypt = function(e3) {
    const t3 = Array(e3.length);
    for (let s4 = 0; s4 < e3.length; s4 += 8) {
      let a3, o3 = e3[s4] << 24 | e3[s4 + 1] << 16 | e3[s4 + 2] << 8 | e3[s4 + 3], c3 = e3[s4 + 4] << 24 | e3[s4 + 5] << 16 | e3[s4 + 6] << 8 | e3[s4 + 7];
      a3 = c3, c3 = o3 ^ r3(c3, this.masking[15], this.rotate[15]), o3 = a3, a3 = c3, c3 = o3 ^ i3(c3, this.masking[14], this.rotate[14]), o3 = a3, a3 = c3, c3 = o3 ^ n3(c3, this.masking[13], this.rotate[13]), o3 = a3, a3 = c3, c3 = o3 ^ r3(c3, this.masking[12], this.rotate[12]), o3 = a3, a3 = c3, c3 = o3 ^ i3(c3, this.masking[11], this.rotate[11]), o3 = a3, a3 = c3, c3 = o3 ^ n3(c3, this.masking[10], this.rotate[10]), o3 = a3, a3 = c3, c3 = o3 ^ r3(c3, this.masking[9], this.rotate[9]), o3 = a3, a3 = c3, c3 = o3 ^ i3(c3, this.masking[8], this.rotate[8]), o3 = a3, a3 = c3, c3 = o3 ^ n3(c3, this.masking[7], this.rotate[7]), o3 = a3, a3 = c3, c3 = o3 ^ r3(c3, this.masking[6], this.rotate[6]), o3 = a3, a3 = c3, c3 = o3 ^ i3(c3, this.masking[5], this.rotate[5]), o3 = a3, a3 = c3, c3 = o3 ^ n3(c3, this.masking[4], this.rotate[4]), o3 = a3, a3 = c3, c3 = o3 ^ r3(c3, this.masking[3], this.rotate[3]), o3 = a3, a3 = c3, c3 = o3 ^ i3(c3, this.masking[2], this.rotate[2]), o3 = a3, a3 = c3, c3 = o3 ^ n3(c3, this.masking[1], this.rotate[1]), o3 = a3, a3 = c3, c3 = o3 ^ r3(c3, this.masking[0], this.rotate[0]), o3 = a3, t3[s4] = c3 >>> 24 & 255, t3[s4 + 1] = c3 >>> 16 & 255, t3[s4 + 2] = c3 >>> 8 & 255, t3[s4 + 3] = 255 & c3, t3[s4 + 4] = o3 >>> 24 & 255, t3[s4 + 5] = o3 >> 16 & 255, t3[s4 + 6] = o3 >> 8 & 255, t3[s4 + 7] = 255 & o3;
    }
    return t3;
  };
  const e2 = [, , , ,];
  e2[0] = [, , , ,], e2[0][0] = [4, 0, 13, 15, 12, 14, 8], e2[0][1] = [5, 2, 16, 18, 17, 19, 10], e2[0][2] = [6, 3, 23, 22, 21, 20, 9], e2[0][3] = [7, 1, 26, 25, 27, 24, 11], e2[1] = [, , , ,], e2[1][0] = [0, 6, 21, 23, 20, 22, 16], e2[1][1] = [1, 4, 0, 2, 1, 3, 18], e2[1][2] = [2, 5, 7, 6, 5, 4, 17], e2[1][3] = [3, 7, 10, 9, 11, 8, 19], e2[2] = [, , , ,], e2[2][0] = [4, 0, 13, 15, 12, 14, 8], e2[2][1] = [5, 2, 16, 18, 17, 19, 10], e2[2][2] = [6, 3, 23, 22, 21, 20, 9], e2[2][3] = [7, 1, 26, 25, 27, 24, 11], e2[3] = [, , , ,], e2[3][0] = [0, 6, 21, 23, 20, 22, 16], e2[3][1] = [1, 4, 0, 2, 1, 3, 18], e2[3][2] = [2, 5, 7, 6, 5, 4, 17], e2[3][3] = [3, 7, 10, 9, 11, 8, 19];
  const t2 = [, , , ,];
  function r3(e3, t3, r4) {
    const n4 = t3 + e3, i4 = n4 << r4 | n4 >>> 32 - r4;
    return (s3[0][i4 >>> 24] ^ s3[1][i4 >>> 16 & 255]) - s3[2][i4 >>> 8 & 255] + s3[3][255 & i4];
  }
  function n3(e3, t3, r4) {
    const n4 = t3 ^ e3, i4 = n4 << r4 | n4 >>> 32 - r4;
    return s3[0][i4 >>> 24] - s3[1][i4 >>> 16 & 255] + s3[2][i4 >>> 8 & 255] ^ s3[3][255 & i4];
  }
  function i3(e3, t3, r4) {
    const n4 = t3 - e3, i4 = n4 << r4 | n4 >>> 32 - r4;
    return (s3[0][i4 >>> 24] + s3[1][i4 >>> 16 & 255] ^ s3[2][i4 >>> 8 & 255]) - s3[3][255 & i4];
  }
  t2[0] = [, , , ,], t2[0][0] = [24, 25, 23, 22, 18], t2[0][1] = [26, 27, 21, 20, 22], t2[0][2] = [28, 29, 19, 18, 25], t2[0][3] = [30, 31, 17, 16, 28], t2[1] = [, , , ,], t2[1][0] = [3, 2, 12, 13, 8], t2[1][1] = [1, 0, 14, 15, 13], t2[1][2] = [7, 6, 8, 9, 3], t2[1][3] = [5, 4, 10, 11, 7], t2[2] = [, , , ,], t2[2][0] = [19, 18, 28, 29, 25], t2[2][1] = [17, 16, 30, 31, 28], t2[2][2] = [23, 22, 24, 25, 18], t2[2][3] = [21, 20, 26, 27, 22], t2[3] = [, , , ,], t2[3][0] = [8, 9, 7, 6, 3], t2[3][1] = [10, 11, 5, 4, 7], t2[3][2] = [12, 13, 3, 2, 8], t2[3][3] = [14, 15, 1, 0, 13], this.keySchedule = function(r4) {
    const n4 = [, , , , , , , ,], i4 = Array(32);
    let a3;
    for (let e3 = 0; e3 < 4; e3++) a3 = 4 * e3, n4[e3] = r4[a3] << 24 | r4[a3 + 1] << 16 | r4[a3 + 2] << 8 | r4[a3 + 3];
    const o3 = [6, 7, 4, 5];
    let c3, u2 = 0;
    for (let r5 = 0; r5 < 2; r5++) for (let r6 = 0; r6 < 4; r6++) {
      for (a3 = 0; a3 < 4; a3++) {
        const t3 = e2[r6][a3];
        c3 = n4[t3[1]], c3 ^= s3[4][n4[t3[2] >>> 2] >>> 24 - 8 * (3 & t3[2]) & 255], c3 ^= s3[5][n4[t3[3] >>> 2] >>> 24 - 8 * (3 & t3[3]) & 255], c3 ^= s3[6][n4[t3[4] >>> 2] >>> 24 - 8 * (3 & t3[4]) & 255], c3 ^= s3[7][n4[t3[5] >>> 2] >>> 24 - 8 * (3 & t3[5]) & 255], c3 ^= s3[o3[a3]][n4[t3[6] >>> 2] >>> 24 - 8 * (3 & t3[6]) & 255], n4[t3[0]] = c3;
      }
      for (a3 = 0; a3 < 4; a3++) {
        const e3 = t2[r6][a3];
        c3 = s3[4][n4[e3[0] >>> 2] >>> 24 - 8 * (3 & e3[0]) & 255], c3 ^= s3[5][n4[e3[1] >>> 2] >>> 24 - 8 * (3 & e3[1]) & 255], c3 ^= s3[6][n4[e3[2] >>> 2] >>> 24 - 8 * (3 & e3[2]) & 255], c3 ^= s3[7][n4[e3[3] >>> 2] >>> 24 - 8 * (3 & e3[3]) & 255], c3 ^= s3[4 + a3][n4[e3[4] >>> 2] >>> 24 - 8 * (3 & e3[4]) & 255], i4[u2] = c3, u2++;
      }
    }
    for (let e3 = 0; e3 < 16; e3++) this.masking[e3] = i4[e3], this.rotate[e3] = 31 & i4[16 + e3];
  };
  const s3 = [, , , , , , , ,];
  s3[0] = [821772500, 2678128395, 1810681135, 1059425402, 505495343, 2617265619, 1610868032, 3483355465, 3218386727, 2294005173, 3791863952, 2563806837, 1852023008, 365126098, 3269944861, 584384398, 677919599, 3229601881, 4280515016, 2002735330, 1136869587, 3744433750, 2289869850, 2731719981, 2714362070, 879511577, 1639411079, 575934255, 717107937, 2857637483, 576097850, 2731753936, 1725645e3, 2810460463, 5111599, 767152862, 2543075244, 1251459544, 1383482551, 3052681127, 3089939183, 3612463449, 1878520045, 1510570527, 2189125840, 2431448366, 582008916, 3163445557, 1265446783, 1354458274, 3529918736, 3202711853, 3073581712, 3912963487, 3029263377, 1275016285, 4249207360, 2905708351, 3304509486, 1442611557, 3585198765, 2712415662, 2731849581, 3248163920, 2283946226, 208555832, 2766454743, 1331405426, 1447828783, 3315356441, 3108627284, 2957404670, 2981538698, 3339933917, 1669711173, 286233437, 1465092821, 1782121619, 3862771680, 710211251, 980974943, 1651941557, 430374111, 2051154026, 704238805, 4128970897, 3144820574, 2857402727, 948965521, 3333752299, 2227686284, 718756367, 2269778983, 2731643755, 718440111, 2857816721, 3616097120, 1113355533, 2478022182, 410092745, 1811985197, 1944238868, 2696854588, 1415722873, 1682284203, 1060277122, 1998114690, 1503841958, 82706478, 2315155686, 1068173648, 845149890, 2167947013, 1768146376, 1993038550, 3566826697, 3390574031, 940016341, 3355073782, 2328040721, 904371731, 1205506512, 4094660742, 2816623006, 825647681, 85914773, 2857843460, 1249926541, 1417871568, 3287612, 3211054559, 3126306446, 1975924523, 1353700161, 2814456437, 2438597621, 1800716203, 722146342, 2873936343, 1151126914, 4160483941, 2877670899, 458611604, 2866078500, 3483680063, 770352098, 2652916994, 3367839148, 3940505011, 3585973912, 3809620402, 718646636, 2504206814, 2914927912, 3631288169, 2857486607, 2860018678, 575749918, 2857478043, 718488780, 2069512688, 3548183469, 453416197, 1106044049, 3032691430, 52586708, 3378514636, 3459808877, 3211506028, 1785789304, 218356169, 3571399134, 3759170522, 1194783844, 1523787992, 3007827094, 1975193539, 2555452411, 1341901877, 3045838698, 3776907964, 3217423946, 2802510864, 2889438986, 1057244207, 1636348243, 3761863214, 1462225785, 2632663439, 481089165, 718503062, 24497053, 3332243209, 3344655856, 3655024856, 3960371065, 1195698900, 2971415156, 3710176158, 2115785917, 4027663609, 3525578417, 2524296189, 2745972565, 3564906415, 1372086093, 1452307862, 2780501478, 1476592880, 3389271281, 18495466, 2378148571, 901398090, 891748256, 3279637769, 3157290713, 2560960102, 1447622437, 4284372637, 216884176, 2086908623, 1879786977, 3588903153, 2242455666, 2938092967, 3559082096, 2810645491, 758861177, 1121993112, 215018983, 642190776, 4169236812, 1196255959, 2081185372, 3508738393, 941322904, 4124243163, 2877523539, 1848581667, 2205260958, 3180453958, 2589345134, 3694731276, 550028657, 2519456284, 3789985535, 2973870856, 2093648313, 443148163, 46942275, 2734146937, 1117713533, 1115362972, 1523183689, 3717140224, 1551984063], s3[1] = [522195092, 4010518363, 1776537470, 960447360, 4267822970, 4005896314, 1435016340, 1929119313, 2913464185, 1310552629, 3579470798, 3724818106, 2579771631, 1594623892, 417127293, 2715217907, 2696228731, 1508390405, 3994398868, 3925858569, 3695444102, 4019471449, 3129199795, 3770928635, 3520741761, 990456497, 4187484609, 2783367035, 21106139, 3840405339, 631373633, 3783325702, 532942976, 396095098, 3548038825, 4267192484, 2564721535, 2011709262, 2039648873, 620404603, 3776170075, 2898526339, 3612357925, 4159332703, 1645490516, 223693667, 1567101217, 3362177881, 1029951347, 3470931136, 3570957959, 1550265121, 119497089, 972513919, 907948164, 3840628539, 1613718692, 3594177948, 465323573, 2659255085, 654439692, 2575596212, 2699288441, 3127702412, 277098644, 624404830, 4100943870, 2717858591, 546110314, 2403699828, 3655377447, 1321679412, 4236791657, 1045293279, 4010672264, 895050893, 2319792268, 494945126, 1914543101, 2777056443, 3894764339, 2219737618, 311263384, 4275257268, 3458730721, 669096869, 3584475730, 3835122877, 3319158237, 3949359204, 2005142349, 2713102337, 2228954793, 3769984788, 569394103, 3855636576, 1425027204, 108000370, 2736431443, 3671869269, 3043122623, 1750473702, 2211081108, 762237499, 3972989403, 2798899386, 3061857628, 2943854345, 867476300, 964413654, 1591880597, 1594774276, 2179821409, 552026980, 3026064248, 3726140315, 2283577634, 3110545105, 2152310760, 582474363, 1582640421, 1383256631, 2043843868, 3322775884, 1217180674, 463797851, 2763038571, 480777679, 2718707717, 2289164131, 3118346187, 214354409, 200212307, 3810608407, 3025414197, 2674075964, 3997296425, 1847405948, 1342460550, 510035443, 4080271814, 815934613, 833030224, 1620250387, 1945732119, 2703661145, 3966000196, 1388869545, 3456054182, 2687178561, 2092620194, 562037615, 1356438536, 3409922145, 3261847397, 1688467115, 2150901366, 631725691, 3840332284, 549916902, 3455104640, 394546491, 837744717, 2114462948, 751520235, 2221554606, 2415360136, 3999097078, 2063029875, 803036379, 2702586305, 821456707, 3019566164, 360699898, 4018502092, 3511869016, 3677355358, 2402471449, 812317050, 49299192, 2570164949, 3259169295, 2816732080, 3331213574, 3101303564, 2156015656, 3705598920, 3546263921, 143268808, 3200304480, 1638124008, 3165189453, 3341807610, 578956953, 2193977524, 3638120073, 2333881532, 807278310, 658237817, 2969561766, 1641658566, 11683945, 3086995007, 148645947, 1138423386, 4158756760, 1981396783, 2401016740, 3699783584, 380097457, 2680394679, 2803068651, 3334260286, 441530178, 4016580796, 1375954390, 761952171, 891809099, 2183123478, 157052462, 3683840763, 1592404427, 341349109, 2438483839, 1417898363, 644327628, 2233032776, 2353769706, 2201510100, 220455161, 1815641738, 182899273, 2995019788, 3627381533, 3702638151, 2890684138, 1052606899, 588164016, 1681439879, 4038439418, 2405343923, 4229449282, 167996282, 1336969661, 1688053129, 2739224926, 1543734051, 1046297529, 1138201970, 2121126012, 115334942, 1819067631, 1902159161, 1941945968, 2206692869, 1159982321], s3[2] = [2381300288, 637164959, 3952098751, 3893414151, 1197506559, 916448331, 2350892612, 2932787856, 3199334847, 4009478890, 3905886544, 1373570990, 2450425862, 4037870920, 3778841987, 2456817877, 286293407, 124026297, 3001279700, 1028597854, 3115296800, 4208886496, 2691114635, 2188540206, 1430237888, 1218109995, 3572471700, 308166588, 570424558, 2187009021, 2455094765, 307733056, 1310360322, 3135275007, 1384269543, 2388071438, 863238079, 2359263624, 2801553128, 3380786597, 2831162807, 1470087780, 1728663345, 4072488799, 1090516929, 532123132, 2389430977, 1132193179, 2578464191, 3051079243, 1670234342, 1434557849, 2711078940, 1241591150, 3314043432, 3435360113, 3091448339, 1812415473, 2198440252, 267246943, 796911696, 3619716990, 38830015, 1526438404, 2806502096, 374413614, 2943401790, 1489179520, 1603809326, 1920779204, 168801282, 260042626, 2358705581, 1563175598, 2397674057, 1356499128, 2217211040, 514611088, 2037363785, 2186468373, 4022173083, 2792511869, 2913485016, 1173701892, 4200428547, 3896427269, 1334932762, 2455136706, 602925377, 2835607854, 1613172210, 41346230, 2499634548, 2457437618, 2188827595, 41386358, 4172255629, 1313404830, 2405527007, 3801973774, 2217704835, 873260488, 2528884354, 2478092616, 4012915883, 2555359016, 2006953883, 2463913485, 575479328, 2218240648, 2099895446, 660001756, 2341502190, 3038761536, 3888151779, 3848713377, 3286851934, 1022894237, 1620365795, 3449594689, 1551255054, 15374395, 3570825345, 4249311020, 4151111129, 3181912732, 310226346, 1133119310, 530038928, 136043402, 2476768958, 3107506709, 2544909567, 1036173560, 2367337196, 1681395281, 1758231547, 3641649032, 306774401, 1575354324, 3716085866, 1990386196, 3114533736, 2455606671, 1262092282, 3124342505, 2768229131, 4210529083, 1833535011, 423410938, 660763973, 2187129978, 1639812e3, 3508421329, 3467445492, 310289298, 272797111, 2188552562, 2456863912, 310240523, 677093832, 1013118031, 901835429, 3892695601, 1116285435, 3036471170, 1337354835, 243122523, 520626091, 277223598, 4244441197, 4194248841, 1766575121, 594173102, 316590669, 742362309, 3536858622, 4176435350, 3838792410, 2501204839, 1229605004, 3115755532, 1552908988, 2312334149, 979407927, 3959474601, 1148277331, 176638793, 3614686272, 2083809052, 40992502, 1340822838, 2731552767, 3535757508, 3560899520, 1354035053, 122129617, 7215240, 2732932949, 3118912700, 2718203926, 2539075635, 3609230695, 3725561661, 1928887091, 2882293555, 1988674909, 2063640240, 2491088897, 1459647954, 4189817080, 2302804382, 1113892351, 2237858528, 1927010603, 4002880361, 1856122846, 1594404395, 2944033133, 3855189863, 3474975698, 1643104450, 4054590833, 3431086530, 1730235576, 2984608721, 3084664418, 2131803598, 4178205752, 267404349, 1617849798, 1616132681, 1462223176, 736725533, 2327058232, 551665188, 2945899023, 1749386277, 2575514597, 1611482493, 674206544, 2201269090, 3642560800, 728599968, 1680547377, 2620414464, 1388111496, 453204106, 4156223445, 1094905244, 2754698257, 2201108165, 3757000246, 2704524545, 3922940700, 3996465027], s3[3] = [2645754912, 532081118, 2814278639, 3530793624, 1246723035, 1689095255, 2236679235, 4194438865, 2116582143, 3859789411, 157234593, 2045505824, 4245003587, 1687664561, 4083425123, 605965023, 672431967, 1336064205, 3376611392, 214114848, 4258466608, 3232053071, 489488601, 605322005, 3998028058, 264917351, 1912574028, 756637694, 436560991, 202637054, 135989450, 85393697, 2152923392, 3896401662, 2895836408, 2145855233, 3535335007, 115294817, 3147733898, 1922296357, 3464822751, 4117858305, 1037454084, 2725193275, 2127856640, 1417604070, 1148013728, 1827919605, 642362335, 2929772533, 909348033, 1346338451, 3547799649, 297154785, 1917849091, 4161712827, 2883604526, 3968694238, 1469521537, 3780077382, 3375584256, 1763717519, 136166297, 4290970789, 1295325189, 2134727907, 2798151366, 1566297257, 3672928234, 2677174161, 2672173615, 965822077, 2780786062, 289653839, 1133871874, 3491843819, 35685304, 1068898316, 418943774, 672553190, 642281022, 2346158704, 1954014401, 3037126780, 4079815205, 2030668546, 3840588673, 672283427, 1776201016, 359975446, 3750173538, 555499703, 2769985273, 1324923, 69110472, 152125443, 3176785106, 3822147285, 1340634837, 798073664, 1434183902, 15393959, 216384236, 1303690150, 3881221631, 3711134124, 3960975413, 106373927, 2578434224, 1455997841, 1801814300, 1578393881, 1854262133, 3188178946, 3258078583, 2302670060, 1539295533, 3505142565, 3078625975, 2372746020, 549938159, 3278284284, 2620926080, 181285381, 2865321098, 3970029511, 68876850, 488006234, 1728155692, 2608167508, 836007927, 2435231793, 919367643, 3339422534, 3655756360, 1457871481, 40520939, 1380155135, 797931188, 234455205, 2255801827, 3990488299, 397000196, 739833055, 3077865373, 2871719860, 4022553888, 772369276, 390177364, 3853951029, 557662966, 740064294, 1640166671, 1699928825, 3535942136, 622006121, 3625353122, 68743880, 1742502, 219489963, 1664179233, 1577743084, 1236991741, 410585305, 2366487942, 823226535, 1050371084, 3426619607, 3586839478, 212779912, 4147118561, 1819446015, 1911218849, 530248558, 3486241071, 3252585495, 2886188651, 3410272728, 2342195030, 20547779, 2982490058, 3032363469, 3631753222, 312714466, 1870521650, 1493008054, 3491686656, 615382978, 4103671749, 2534517445, 1932181, 2196105170, 278426614, 6369430, 3274544417, 2913018367, 697336853, 2143000447, 2946413531, 701099306, 1558357093, 2805003052, 3500818408, 2321334417, 3567135975, 216290473, 3591032198, 23009561, 1996984579, 3735042806, 2024298078, 3739440863, 569400510, 2339758983, 3016033873, 3097871343, 3639523026, 3844324983, 3256173865, 795471839, 2951117563, 4101031090, 4091603803, 3603732598, 971261452, 534414648, 428311343, 3389027175, 2844869880, 694888862, 1227866773, 2456207019, 3043454569, 2614353370, 3749578031, 3676663836, 459166190, 4132644070, 1794958188, 51825668, 2252611902, 3084671440, 2036672799, 3436641603, 1099053433, 2469121526, 3059204941, 1323291266, 2061838604, 1018778475, 2233344254, 2553501054, 334295216, 3556750194, 1065731521, 183467730], s3[4] = [2127105028, 745436345, 2601412319, 2788391185, 3093987327, 500390133, 1155374404, 389092991, 150729210, 3891597772, 3523549952, 1935325696, 716645080, 946045387, 2901812282, 1774124410, 3869435775, 4039581901, 3293136918, 3438657920, 948246080, 363898952, 3867875531, 1286266623, 1598556673, 68334250, 630723836, 1104211938, 1312863373, 613332731, 2377784574, 1101634306, 441780740, 3129959883, 1917973735, 2510624549, 3238456535, 2544211978, 3308894634, 1299840618, 4076074851, 1756332096, 3977027158, 297047435, 3790297736, 2265573040, 3621810518, 1311375015, 1667687725, 47300608, 3299642885, 2474112369, 201668394, 1468347890, 576830978, 3594690761, 3742605952, 1958042578, 1747032512, 3558991340, 1408974056, 3366841779, 682131401, 1033214337, 1545599232, 4265137049, 206503691, 103024618, 2855227313, 1337551222, 2428998917, 2963842932, 4015366655, 3852247746, 2796956967, 3865723491, 3747938335, 247794022, 3755824572, 702416469, 2434691994, 397379957, 851939612, 2314769512, 218229120, 1380406772, 62274761, 214451378, 3170103466, 2276210409, 3845813286, 28563499, 446592073, 1693330814, 3453727194, 29968656, 3093872512, 220656637, 2470637031, 77972100, 1667708854, 1358280214, 4064765667, 2395616961, 325977563, 4277240721, 4220025399, 3605526484, 3355147721, 811859167, 3069544926, 3962126810, 652502677, 3075892249, 4132761541, 3498924215, 1217549313, 3250244479, 3858715919, 3053989961, 1538642152, 2279026266, 2875879137, 574252750, 3324769229, 2651358713, 1758150215, 141295887, 2719868960, 3515574750, 4093007735, 4194485238, 1082055363, 3417560400, 395511885, 2966884026, 179534037, 3646028556, 3738688086, 1092926436, 2496269142, 257381841, 3772900718, 1636087230, 1477059743, 2499234752, 3811018894, 2675660129, 3285975680, 90732309, 1684827095, 1150307763, 1723134115, 3237045386, 1769919919, 1240018934, 815675215, 750138730, 2239792499, 1234303040, 1995484674, 138143821, 675421338, 1145607174, 1936608440, 3238603024, 2345230278, 2105974004, 323969391, 779555213, 3004902369, 2861610098, 1017501463, 2098600890, 2628620304, 2940611490, 2682542546, 1171473753, 3656571411, 3687208071, 4091869518, 393037935, 159126506, 1662887367, 1147106178, 391545844, 3452332695, 1891500680, 3016609650, 1851642611, 546529401, 1167818917, 3194020571, 2848076033, 3953471836, 575554290, 475796850, 4134673196, 450035699, 2351251534, 844027695, 1080539133, 86184846, 1554234488, 3692025454, 1972511363, 2018339607, 1491841390, 1141460869, 1061690759, 4244549243, 2008416118, 2351104703, 2868147542, 1598468138, 722020353, 1027143159, 212344630, 1387219594, 1725294528, 3745187956, 2500153616, 458938280, 4129215917, 1828119673, 544571780, 3503225445, 2297937496, 1241802790, 267843827, 2694610800, 1397140384, 1558801448, 3782667683, 1806446719, 929573330, 2234912681, 400817706, 616011623, 4121520928, 3603768725, 1761550015, 1968522284, 4053731006, 4192232858, 4005120285, 872482584, 3140537016, 3894607381, 2287405443, 1963876937, 3663887957, 1584857e3, 2975024454, 1833426440, 4025083860], s3[5] = [4143615901, 749497569, 1285769319, 3795025788, 2514159847, 23610292, 3974978748, 844452780, 3214870880, 3751928557, 2213566365, 1676510905, 448177848, 3730751033, 4086298418, 2307502392, 871450977, 3222878141, 4110862042, 3831651966, 2735270553, 1310974780, 2043402188, 1218528103, 2736035353, 4274605013, 2702448458, 3936360550, 2693061421, 162023535, 2827510090, 687910808, 23484817, 3784910947, 3371371616, 779677500, 3503626546, 3473927188, 4157212626, 3500679282, 4248902014, 2466621104, 3899384794, 1958663117, 925738300, 1283408968, 3669349440, 1840910019, 137959847, 2679828185, 1239142320, 1315376211, 1547541505, 1690155329, 739140458, 3128809933, 3933172616, 3876308834, 905091803, 1548541325, 4040461708, 3095483362, 144808038, 451078856, 676114313, 2861728291, 2469707347, 993665471, 373509091, 2599041286, 4025009006, 4170239449, 2149739950, 3275793571, 3749616649, 2794760199, 1534877388, 572371878, 2590613551, 1753320020, 3467782511, 1405125690, 4270405205, 633333386, 3026356924, 3475123903, 632057672, 2846462855, 1404951397, 3882875879, 3915906424, 195638627, 2385783745, 3902872553, 1233155085, 3355999740, 2380578713, 2702246304, 2144565621, 3663341248, 3894384975, 2502479241, 4248018925, 3094885567, 1594115437, 572884632, 3385116731, 767645374, 1331858858, 1475698373, 3793881790, 3532746431, 1321687957, 619889600, 1121017241, 3440213920, 2070816767, 2833025776, 1933951238, 4095615791, 890643334, 3874130214, 859025556, 360630002, 925594799, 1764062180, 3920222280, 4078305929, 979562269, 2810700344, 4087740022, 1949714515, 546639971, 1165388173, 3069891591, 1495988560, 922170659, 1291546247, 2107952832, 1813327274, 3406010024, 3306028637, 4241950635, 153207855, 2313154747, 1608695416, 1150242611, 1967526857, 721801357, 1220138373, 3691287617, 3356069787, 2112743302, 3281662835, 1111556101, 1778980689, 250857638, 2298507990, 673216130, 2846488510, 3207751581, 3562756981, 3008625920, 3417367384, 2198807050, 529510932, 3547516680, 3426503187, 2364944742, 102533054, 2294910856, 1617093527, 1204784762, 3066581635, 1019391227, 1069574518, 1317995090, 1691889997, 3661132003, 510022745, 3238594800, 1362108837, 1817929911, 2184153760, 805817662, 1953603311, 3699844737, 120799444, 2118332377, 207536705, 2282301548, 4120041617, 145305846, 2508124933, 3086745533, 3261524335, 1877257368, 2977164480, 3160454186, 2503252186, 4221677074, 759945014, 254147243, 2767453419, 3801518371, 629083197, 2471014217, 907280572, 3900796746, 940896768, 2751021123, 2625262786, 3161476951, 3661752313, 3260732218, 1425318020, 2977912069, 1496677566, 3988592072, 2140652971, 3126511541, 3069632175, 977771578, 1392695845, 1698528874, 1411812681, 1369733098, 1343739227, 3620887944, 1142123638, 67414216, 3102056737, 3088749194, 1626167401, 2546293654, 3941374235, 697522451, 33404913, 143560186, 2595682037, 994885535, 1247667115, 3859094837, 2699155541, 3547024625, 4114935275, 2968073508, 3199963069, 2732024527, 1237921620, 951448369, 1898488916, 1211705605, 2790989240, 2233243581, 3598044975], s3[6] = [2246066201, 858518887, 1714274303, 3485882003, 713916271, 2879113490, 3730835617, 539548191, 36158695, 1298409750, 419087104, 1358007170, 749914897, 2989680476, 1261868530, 2995193822, 2690628854, 3443622377, 3780124940, 3796824509, 2976433025, 4259637129, 1551479e3, 512490819, 1296650241, 951993153, 2436689437, 2460458047, 144139966, 3136204276, 310820559, 3068840729, 643875328, 1969602020, 1680088954, 2185813161, 3283332454, 672358534, 198762408, 896343282, 276269502, 3014846926, 84060815, 197145886, 376173866, 3943890818, 3813173521, 3545068822, 1316698879, 1598252827, 2633424951, 1233235075, 859989710, 2358460855, 3503838400, 3409603720, 1203513385, 1193654839, 2792018475, 2060853022, 207403770, 1144516871, 3068631394, 1121114134, 177607304, 3785736302, 326409831, 1929119770, 2983279095, 4183308101, 3474579288, 3200513878, 3228482096, 119610148, 1170376745, 3378393471, 3163473169, 951863017, 3337026068, 3135789130, 2907618374, 1183797387, 2015970143, 4045674555, 2182986399, 2952138740, 3928772205, 384012900, 2454997643, 10178499, 2879818989, 2596892536, 111523738, 2995089006, 451689641, 3196290696, 235406569, 1441906262, 3890558523, 3013735005, 4158569349, 1644036924, 376726067, 1006849064, 3664579700, 2041234796, 1021632941, 1374734338, 2566452058, 371631263, 4007144233, 490221539, 206551450, 3140638584, 1053219195, 1853335209, 3412429660, 3562156231, 735133835, 1623211703, 3104214392, 2738312436, 4096837757, 3366392578, 3110964274, 3956598718, 3196820781, 2038037254, 3877786376, 2339753847, 300912036, 3766732888, 2372630639, 1516443558, 4200396704, 1574567987, 4069441456, 4122592016, 2699739776, 146372218, 2748961456, 2043888151, 35287437, 2596680554, 655490400, 1132482787, 110692520, 1031794116, 2188192751, 1324057718, 1217253157, 919197030, 686247489, 3261139658, 1028237775, 3135486431, 3059715558, 2460921700, 986174950, 2661811465, 4062904701, 2752986992, 3709736643, 367056889, 1353824391, 731860949, 1650113154, 1778481506, 784341916, 357075625, 3608602432, 1074092588, 2480052770, 3811426202, 92751289, 877911070, 3600361838, 1231880047, 480201094, 3756190983, 3094495953, 434011822, 87971354, 363687820, 1717726236, 1901380172, 3926403882, 2481662265, 400339184, 1490350766, 2661455099, 1389319756, 2558787174, 784598401, 1983468483, 30828846, 3550527752, 2716276238, 3841122214, 1765724805, 1955612312, 1277890269, 1333098070, 1564029816, 2704417615, 1026694237, 3287671188, 1260819201, 3349086767, 1016692350, 1582273796, 1073413053, 1995943182, 694588404, 1025494639, 3323872702, 3551898420, 4146854327, 453260480, 1316140391, 1435673405, 3038941953, 3486689407, 1622062951, 403978347, 817677117, 950059133, 4246079218, 3278066075, 1486738320, 1417279718, 481875527, 2549965225, 3933690356, 760697757, 1452955855, 3897451437, 1177426808, 1702951038, 4085348628, 2447005172, 1084371187, 3516436277, 3068336338, 1073369276, 1027665953, 3284188590, 1230553676, 1368340146, 2226246512, 267243139, 2274220762, 4070734279, 2497715176, 2423353163, 2504755875], s3[7] = [3793104909, 3151888380, 2817252029, 895778965, 2005530807, 3871412763, 237245952, 86829237, 296341424, 3851759377, 3974600970, 2475086196, 709006108, 1994621201, 2972577594, 937287164, 3734691505, 168608556, 3189338153, 2225080640, 3139713551, 3033610191, 3025041904, 77524477, 185966941, 1208824168, 2344345178, 1721625922, 3354191921, 1066374631, 1927223579, 1971335949, 2483503697, 1551748602, 2881383779, 2856329572, 3003241482, 48746954, 1398218158, 2050065058, 313056748, 4255789917, 393167848, 1912293076, 940740642, 3465845460, 3091687853, 2522601570, 2197016661, 1727764327, 364383054, 492521376, 1291706479, 3264136376, 1474851438, 1685747964, 2575719748, 1619776915, 1814040067, 970743798, 1561002147, 2925768690, 2123093554, 1880132620, 3151188041, 697884420, 2550985770, 2607674513, 2659114323, 110200136, 1489731079, 997519150, 1378877361, 3527870668, 478029773, 2766872923, 1022481122, 431258168, 1112503832, 897933369, 2635587303, 669726182, 3383752315, 918222264, 163866573, 3246985393, 3776823163, 114105080, 1903216136, 761148244, 3571337562, 1690750982, 3166750252, 1037045171, 1888456500, 2010454850, 642736655, 616092351, 365016990, 1185228132, 4174898510, 1043824992, 2023083429, 2241598885, 3863320456, 3279669087, 3674716684, 108438443, 2132974366, 830746235, 606445527, 4173263986, 2204105912, 1844756978, 2532684181, 4245352700, 2969441100, 3796921661, 1335562986, 4061524517, 2720232303, 2679424040, 634407289, 885462008, 3294724487, 3933892248, 2094100220, 339117932, 4048830727, 3202280980, 1458155303, 2689246273, 1022871705, 2464987878, 3714515309, 353796843, 2822958815, 4256850100, 4052777845, 551748367, 618185374, 3778635579, 4020649912, 1904685140, 3069366075, 2670879810, 3407193292, 2954511620, 4058283405, 2219449317, 3135758300, 1120655984, 3447565834, 1474845562, 3577699062, 550456716, 3466908712, 2043752612, 881257467, 869518812, 2005220179, 938474677, 3305539448, 3850417126, 1315485940, 3318264702, 226533026, 965733244, 321539988, 1136104718, 804158748, 573969341, 3708209826, 937399083, 3290727049, 2901666755, 1461057207, 4013193437, 4066861423, 3242773476, 2421326174, 1581322155, 3028952165, 786071460, 3900391652, 3918438532, 1485433313, 4023619836, 3708277595, 3678951060, 953673138, 1467089153, 1930354364, 1533292819, 2492563023, 1346121658, 1685000834, 1965281866, 3765933717, 4190206607, 2052792609, 3515332758, 690371149, 3125873887, 2180283551, 2903598061, 3933952357, 436236910, 289419410, 14314871, 1242357089, 2904507907, 1616633776, 2666382180, 585885352, 3471299210, 2699507360, 1432659641, 277164553, 3354103607, 770115018, 2303809295, 3741942315, 3177781868, 2853364978, 2269453327, 3774259834, 987383833, 1290892879, 225909803, 1741533526, 890078084, 1496906255, 1111072499, 916028167, 243534141, 1252605537, 2204162171, 531204876, 290011180, 3916834213, 102027703, 237315147, 209093447, 1486785922, 220223953, 2758195998, 4175039106, 82940208, 3127791296, 2569425252, 518464269, 1353887104, 3941492737, 2377294467, 3935040926];
}
function oy(e2) {
  this.cast5 = new ay(), this.cast5.setKey(e2), this.encrypt = function(e3) {
    return this.cast5.encrypt(e3);
  };
}
function uy(e2, t2) {
  return (e2 << t2 | e2 >>> 32 - t2) & cy;
}
function hy(e2, t2) {
  return e2[t2] | e2[t2 + 1] << 8 | e2[t2 + 2] << 16 | e2[t2 + 3] << 24;
}
function fy(e2, t2, r3) {
  e2.splice(t2, 4, 255 & r3, r3 >>> 8 & 255, r3 >>> 16 & 255, r3 >>> 24 & 255);
}
function ly(e2, t2) {
  return e2 >>> 8 * t2 & 255;
}
function yy(e2) {
  this.tf = /* @__PURE__ */ function() {
    let e3 = null, t2 = null, r3 = -1, n3 = [], i3 = [[], [], [], []];
    function s3(e4) {
      return i3[0][ly(e4, 0)] ^ i3[1][ly(e4, 1)] ^ i3[2][ly(e4, 2)] ^ i3[3][ly(e4, 3)];
    }
    function a3(e4) {
      return i3[0][ly(e4, 3)] ^ i3[1][ly(e4, 0)] ^ i3[2][ly(e4, 1)] ^ i3[3][ly(e4, 2)];
    }
    function o3(e4, t3) {
      let r4 = s3(t3[0]), i4 = a3(t3[1]);
      t3[2] = uy(t3[2] ^ r4 + i4 + n3[4 * e4 + 8] & cy, 31), t3[3] = uy(t3[3], 1) ^ r4 + 2 * i4 + n3[4 * e4 + 9] & cy, r4 = s3(t3[2]), i4 = a3(t3[3]), t3[0] = uy(t3[0] ^ r4 + i4 + n3[4 * e4 + 10] & cy, 31), t3[1] = uy(t3[1], 1) ^ r4 + 2 * i4 + n3[4 * e4 + 11] & cy;
    }
    function c3(e4, t3) {
      let r4 = s3(t3[0]), i4 = a3(t3[1]);
      t3[2] = uy(t3[2], 1) ^ r4 + i4 + n3[4 * e4 + 10] & cy, t3[3] = uy(t3[3] ^ r4 + 2 * i4 + n3[4 * e4 + 11] & cy, 31), r4 = s3(t3[2]), i4 = a3(t3[3]), t3[0] = uy(t3[0], 1) ^ r4 + i4 + n3[4 * e4 + 8] & cy, t3[1] = uy(t3[1] ^ r4 + 2 * i4 + n3[4 * e4 + 9] & cy, 31);
    }
    return { name: "twofish", blocksize: 16, open: function(t3) {
      let r4, s4, a4, o4, c4;
      e3 = t3;
      const u2 = [], h4 = [], f2 = [];
      let l2;
      const y2 = [];
      let g2, p2, d3;
      const A2 = [[8, 1, 7, 13, 6, 15, 3, 2, 0, 11, 5, 9, 14, 12, 10, 4], [2, 8, 11, 13, 15, 7, 6, 14, 3, 1, 9, 4, 0, 10, 12, 5]], w2 = [[14, 12, 11, 8, 1, 2, 3, 5, 15, 4, 10, 6, 7, 0, 9, 13], [1, 14, 2, 11, 4, 12, 3, 7, 6, 13, 10, 5, 15, 9, 0, 8]], m2 = [[11, 10, 5, 14, 6, 13, 9, 0, 12, 8, 15, 3, 2, 4, 7, 1], [4, 12, 7, 5, 1, 6, 9, 10, 0, 14, 13, 8, 2, 11, 3, 15]], b2 = [[13, 7, 15, 4, 1, 2, 6, 14, 9, 11, 3, 0, 8, 5, 12, 10], [11, 9, 5, 1, 12, 3, 13, 14, 6, 4, 7, 15, 2, 0, 8, 10]], k2 = [0, 8, 1, 9, 2, 10, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15], E2 = [0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 5, 14, 7], v2 = [[], []], I2 = [[], [], [], []];
      function B2(e4) {
        return e4 ^ e4 >> 2 ^ [0, 90, 180, 238][3 & e4];
      }
      function S2(e4) {
        return e4 ^ e4 >> 1 ^ e4 >> 2 ^ [0, 238, 180, 90][3 & e4];
      }
      function K2(e4, t4) {
        let r5, n4, i4;
        for (r5 = 0; r5 < 8; r5++) n4 = t4 >>> 24, t4 = t4 << 8 & cy | e4 >>> 24, e4 = e4 << 8 & cy, i4 = n4 << 1, 128 & n4 && (i4 ^= 333), t4 ^= n4 ^ i4 << 16, i4 ^= n4 >>> 1, 1 & n4 && (i4 ^= 166), t4 ^= i4 << 24 | i4 << 8;
        return t4;
      }
      function C2(e4, t4) {
        const r5 = t4 >> 4, n4 = 15 & t4, i4 = A2[e4][r5 ^ n4], s5 = w2[e4][k2[n4] ^ E2[r5]];
        return b2[e4][k2[s5] ^ E2[i4]] << 4 | m2[e4][i4 ^ s5];
      }
      function D2(e4, t4) {
        let r5 = ly(e4, 0), n4 = ly(e4, 1), i4 = ly(e4, 2), s5 = ly(e4, 3);
        switch (l2) {
          case 4:
            r5 = v2[1][r5] ^ ly(t4[3], 0), n4 = v2[0][n4] ^ ly(t4[3], 1), i4 = v2[0][i4] ^ ly(t4[3], 2), s5 = v2[1][s5] ^ ly(t4[3], 3);
          case 3:
            r5 = v2[1][r5] ^ ly(t4[2], 0), n4 = v2[1][n4] ^ ly(t4[2], 1), i4 = v2[0][i4] ^ ly(t4[2], 2), s5 = v2[0][s5] ^ ly(t4[2], 3);
          case 2:
            r5 = v2[0][v2[0][r5] ^ ly(t4[1], 0)] ^ ly(t4[0], 0), n4 = v2[0][v2[1][n4] ^ ly(t4[1], 1)] ^ ly(t4[0], 1), i4 = v2[1][v2[0][i4] ^ ly(t4[1], 2)] ^ ly(t4[0], 2), s5 = v2[1][v2[1][s5] ^ ly(t4[1], 3)] ^ ly(t4[0], 3);
        }
        return I2[0][r5] ^ I2[1][n4] ^ I2[2][i4] ^ I2[3][s5];
      }
      for (e3 = e3.slice(0, 32), r4 = e3.length; 16 !== r4 && 24 !== r4 && 32 !== r4; ) e3[r4++] = 0;
      for (r4 = 0; r4 < e3.length; r4 += 4) f2[r4 >> 2] = hy(e3, r4);
      for (r4 = 0; r4 < 256; r4++) v2[0][r4] = C2(0, r4), v2[1][r4] = C2(1, r4);
      for (r4 = 0; r4 < 256; r4++) g2 = v2[1][r4], p2 = B2(g2), d3 = S2(g2), I2[0][r4] = g2 + (p2 << 8) + (d3 << 16) + (d3 << 24), I2[2][r4] = p2 + (d3 << 8) + (g2 << 16) + (d3 << 24), g2 = v2[0][r4], p2 = B2(g2), d3 = S2(g2), I2[1][r4] = d3 + (d3 << 8) + (p2 << 16) + (g2 << 24), I2[3][r4] = p2 + (g2 << 8) + (d3 << 16) + (p2 << 24);
      for (l2 = f2.length / 2, r4 = 0; r4 < l2; r4++) s4 = f2[r4 + r4], u2[r4] = s4, a4 = f2[r4 + r4 + 1], h4[r4] = a4, y2[l2 - r4 - 1] = K2(s4, a4);
      for (r4 = 0; r4 < 40; r4 += 2) s4 = 16843009 * r4, a4 = s4 + 16843009, s4 = D2(s4, u2), a4 = uy(D2(a4, h4), 8), n3[r4] = s4 + a4 & cy, n3[r4 + 1] = uy(s4 + 2 * a4, 9);
      for (r4 = 0; r4 < 256; r4++) switch (s4 = a4 = o4 = c4 = r4, l2) {
        case 4:
          s4 = v2[1][s4] ^ ly(y2[3], 0), a4 = v2[0][a4] ^ ly(y2[3], 1), o4 = v2[0][o4] ^ ly(y2[3], 2), c4 = v2[1][c4] ^ ly(y2[3], 3);
        case 3:
          s4 = v2[1][s4] ^ ly(y2[2], 0), a4 = v2[1][a4] ^ ly(y2[2], 1), o4 = v2[0][o4] ^ ly(y2[2], 2), c4 = v2[0][c4] ^ ly(y2[2], 3);
        case 2:
          i3[0][r4] = I2[0][v2[0][v2[0][s4] ^ ly(y2[1], 0)] ^ ly(y2[0], 0)], i3[1][r4] = I2[1][v2[0][v2[1][a4] ^ ly(y2[1], 1)] ^ ly(y2[0], 1)], i3[2][r4] = I2[2][v2[1][v2[0][o4] ^ ly(y2[1], 2)] ^ ly(y2[0], 2)], i3[3][r4] = I2[3][v2[1][v2[1][c4] ^ ly(y2[1], 3)] ^ ly(y2[0], 3)];
      }
    }, close: function() {
      n3 = [], i3 = [[], [], [], []];
    }, encrypt: function(e4, i4) {
      t2 = e4, r3 = i4;
      const s4 = [hy(t2, r3) ^ n3[0], hy(t2, r3 + 4) ^ n3[1], hy(t2, r3 + 8) ^ n3[2], hy(t2, r3 + 12) ^ n3[3]];
      for (let e5 = 0; e5 < 8; e5++) o3(e5, s4);
      return fy(t2, r3, s4[2] ^ n3[4]), fy(t2, r3 + 4, s4[3] ^ n3[5]), fy(t2, r3 + 8, s4[0] ^ n3[6]), fy(t2, r3 + 12, s4[1] ^ n3[7]), r3 += 16, t2;
    }, decrypt: function(e4, i4) {
      t2 = e4, r3 = i4;
      const s4 = [hy(t2, r3) ^ n3[4], hy(t2, r3 + 4) ^ n3[5], hy(t2, r3 + 8) ^ n3[6], hy(t2, r3 + 12) ^ n3[7]];
      for (let e5 = 7; e5 >= 0; e5--) c3(e5, s4);
      fy(t2, r3, s4[2] ^ n3[0]), fy(t2, r3 + 4, s4[3] ^ n3[1]), fy(t2, r3 + 8, s4[0] ^ n3[2]), fy(t2, r3 + 12, s4[1] ^ n3[3]), r3 += 16;
    }, finalize: function() {
      return t2;
    } };
  }(), this.tf.open(Array.from(e2), 0), this.encrypt = function(e3) {
    return this.tf.encrypt(Array.from(e3), 0);
  };
}
function gy() {
}
function py(e2) {
  this.bf = new gy(), this.bf.init(e2), this.encrypt = function(e3) {
    return this.bf.encryptBlock(e3);
  };
}
function wy(e2, t2, r3, n3) {
  e2[t2] += r3[n3], e2[t2 + 1] += r3[n3 + 1] + (e2[t2] < r3[n3]);
}
function my(e2, t2) {
  e2[0] += t2, e2[1] += e2[0] < t2;
}
function by(e2, t2, r3, n3, i3, s3, a3, o3) {
  wy(e2, r3, e2, n3), wy(e2, r3, t2, a3);
  let c3 = e2[s3] ^ e2[r3], u2 = e2[s3 + 1] ^ e2[r3 + 1];
  e2[s3] = u2, e2[s3 + 1] = c3, wy(e2, i3, e2, s3), c3 = e2[n3] ^ e2[i3], u2 = e2[n3 + 1] ^ e2[i3 + 1], e2[n3] = c3 >>> 24 ^ u2 << 8, e2[n3 + 1] = u2 >>> 24 ^ c3 << 8, wy(e2, r3, e2, n3), wy(e2, r3, t2, o3), c3 = e2[s3] ^ e2[r3], u2 = e2[s3 + 1] ^ e2[r3 + 1], e2[s3] = c3 >>> 16 ^ u2 << 16, e2[s3 + 1] = u2 >>> 16 ^ c3 << 16, wy(e2, i3, e2, s3), c3 = e2[n3] ^ e2[i3], u2 = e2[n3 + 1] ^ e2[i3 + 1], e2[n3] = u2 >>> 31 ^ c3 << 1, e2[n3 + 1] = c3 >>> 31 ^ u2 << 1;
}
function vy(e2, t2) {
  const r3 = new Uint32Array(32), n3 = new Uint32Array(e2.b.buffer, e2.b.byteOffset, 32);
  for (let t3 = 0; t3 < 16; t3++) r3[t3] = e2.h[t3], r3[t3 + 16] = ky[t3];
  r3[24] ^= e2.t0[0], r3[25] ^= e2.t0[1];
  const i3 = t2 ? 4294967295 : 0;
  r3[28] ^= i3, r3[29] ^= i3;
  for (let e3 = 0; e3 < 12; e3++) {
    const t3 = e3 << 4;
    by(r3, n3, 0, 8, 16, 24, Ey[t3 + 0], Ey[t3 + 1]), by(r3, n3, 2, 10, 18, 26, Ey[t3 + 2], Ey[t3 + 3]), by(r3, n3, 4, 12, 20, 28, Ey[t3 + 4], Ey[t3 + 5]), by(r3, n3, 6, 14, 22, 30, Ey[t3 + 6], Ey[t3 + 7]), by(r3, n3, 0, 10, 20, 30, Ey[t3 + 8], Ey[t3 + 9]), by(r3, n3, 2, 12, 22, 24, Ey[t3 + 10], Ey[t3 + 11]), by(r3, n3, 4, 14, 16, 26, Ey[t3 + 12], Ey[t3 + 13]), by(r3, n3, 6, 8, 18, 28, Ey[t3 + 14], Ey[t3 + 15]);
  }
  for (let t3 = 0; t3 < 16; t3++) e2.h[t3] ^= r3[t3] ^ r3[t3 + 16];
}
function By(e2, t2, r3, n3) {
  if (e2 > Sy) throw Error(`outlen must be at most ${Sy} (given: ${e2})`);
  return new Iy(e2, t2, r3, n3);
}
function Uy(e2, t2, r3) {
  return e2[r3 + 0] = t2, e2[r3 + 1] = t2 >> 8, e2[r3 + 2] = t2 >> 16, e2[r3 + 3] = t2 >> 24, e2;
}
function Py(e2, t2, r3) {
  if (t2 > Number.MAX_SAFE_INTEGER) throw Error("LE64: large numbers unsupported");
  let n3 = t2;
  for (let t3 = r3; t3 < r3 + 7; t3++) e2[t3] = n3, n3 = (n3 - e2[t3]) / 256;
  return e2;
}
function xy(e2, t2, r3) {
  const n3 = new Uint8Array(64), i3 = new Uint8Array(4 + t2.length);
  if (Uy(i3, e2, 0), i3.set(t2, 4), e2 <= 64) return By(e2).update(i3).digest(r3), r3;
  const s3 = Math.ceil(e2 / 32) - 2;
  for (let e3 = 0; e3 < s3; e3++) By(64).update(0 === e3 ? i3 : n3).digest(n3), r3.set(n3.subarray(0, 32), 32 * e3);
  const a3 = new Uint8Array(By(e2 - 32 * s3).update(n3).digest());
  return r3.set(a3, 32 * s3), r3;
}
function Qy(e2, t2, r3, n3) {
  return e2.fn.XOR(t2.byteOffset, r3.byteOffset, n3.byteOffset), t2;
}
function My(e2, t2, r3, n3) {
  return e2.fn.G(t2.byteOffset, r3.byteOffset, n3.byteOffset, e2.refs.gZ.byteOffset), n3;
}
function Ry(e2, t2, r3, n3) {
  return e2.fn.G2(t2.byteOffset, r3.byteOffset, n3.byteOffset, e2.refs.gZ.byteOffset), n3;
}
function* Fy(e2, t2, r3, n3, i3, s3, a3, o3) {
  e2.refs.prngTmp.fill(0);
  const c3 = e2.refs.prngTmp.subarray(0, 48);
  Py(c3, t2, 0), Py(c3, r3, 8), Py(c3, n3, 16), Py(c3, i3, 24), Py(c3, s3, 32), Py(c3, 2, 40);
  for (let t3 = 1; t3 <= a3; t3++) {
    Py(e2.refs.prngTmp, t3, c3.length);
    const r4 = Ry(e2, e2.refs.ZERO1024, e2.refs.prngTmp, e2.refs.prngR);
    for (let e3 = 1 === t3 ? 8 * o3 : 0; e3 < r4.length; e3 += 8) yield r4.subarray(e3, e3 + 8);
  }
  return [];
}
function Ty(e2, { memory: t2, instance: r3 }) {
  if (!Dy) throw Error("BigEndian system not supported");
  const n3 = function({ type: e3, version: t3, tagLength: r4, password: n4, salt: i4, ad: s4, secret: a4, parallelism: o4, memorySize: c4, passes: u3 }) {
    const h5 = (e4, t4, r5, n5) => {
      if (t4 < r5 || t4 > n5) throw Error(`${e4} size should be between ${r5} and ${n5} bytes`);
    };
    if (2 !== e3 || 19 !== t3) throw Error("Unsupported type or version");
    return h5("password", n4, 8, 4294967295), h5("salt", i4, 8, 4294967295), h5("tag", r4, 4, 4294967295), h5("memory", c4, 8 * o4, 4294967295), s4 && h5("associated data", s4, 0, 4294967295), a4 && h5("secret", a4, 0, 32), { type: e3, version: t3, tagLength: r4, password: n4, salt: i4, ad: s4, secret: a4, lanes: o4, memorySize: c4, passes: u3 };
  }({ type: 2, version: 19, ...e2 }), { G: i3, G2: s3, xor: a3, getLZ: o3 } = r3.exports, c3 = {}, u2 = {};
  u2.G = i3, u2.G2 = s3, u2.XOR = a3;
  const h4 = 4 * n3.lanes * Math.floor(n3.memorySize / (4 * n3.lanes)), f2 = h4 * Cy + 10240;
  if (t2.buffer.byteLength < f2) {
    const e3 = Math.ceil((f2 - t2.buffer.byteLength) / 65536);
    t2.grow(e3);
  }
  let l2 = 0;
  c3.gZ = new Uint8Array(t2.buffer, l2, Cy), l2 += c3.gZ.length, c3.prngR = new Uint8Array(t2.buffer, l2, Cy), l2 += c3.prngR.length, c3.prngTmp = new Uint8Array(t2.buffer, l2, Cy), l2 += c3.prngTmp.length, c3.ZERO1024 = new Uint8Array(t2.buffer, l2, 1024), l2 += c3.ZERO1024.length;
  const y2 = new Uint32Array(t2.buffer, l2, 2);
  l2 += y2.length * Uint32Array.BYTES_PER_ELEMENT;
  const g2 = { fn: u2, refs: c3 }, p2 = new Uint8Array(t2.buffer, l2, Cy);
  l2 += p2.length;
  const d3 = new Uint8Array(t2.buffer, l2, n3.memorySize * Cy), A2 = new Uint8Array(t2.buffer, 0, l2), w2 = function(e3) {
    const t3 = By(64), r4 = new Uint8Array(4), n4 = new Uint8Array(24);
    Uy(n4, e3.lanes, 0), Uy(n4, e3.tagLength, 4), Uy(n4, e3.memorySize, 8), Uy(n4, e3.passes, 12), Uy(n4, e3.version, 16), Uy(n4, e3.type, 20);
    const i4 = [n4];
    e3.password ? (i4.push(Uy(new Uint8Array(4), e3.password.length, 0)), i4.push(e3.password)) : i4.push(r4);
    e3.salt ? (i4.push(Uy(new Uint8Array(4), e3.salt.length, 0)), i4.push(e3.salt)) : i4.push(r4);
    e3.secret ? (i4.push(Uy(new Uint8Array(4), e3.secret.length, 0)), i4.push(e3.secret)) : i4.push(r4);
    e3.ad ? (i4.push(Uy(new Uint8Array(4), e3.ad.length, 0)), i4.push(e3.ad)) : i4.push(r4);
    t3.update(function(e4) {
      if (1 === e4.length) return e4[0];
      let t4 = 0;
      for (let r6 = 0; r6 < e4.length; r6++) {
        if (!(e4[r6] instanceof Uint8Array)) throw Error("concatArrays: Data must be in the form of a Uint8Array");
        t4 += e4[r6].length;
      }
      const r5 = new Uint8Array(t4);
      let n5 = 0;
      return e4.forEach((e5) => {
        r5.set(e5, n5), n5 += e5.length;
      }), r5;
    }(i4));
    const s4 = t3.digest();
    return new Uint8Array(s4);
  }(n3), m2 = h4 / n3.lanes, b2 = Array(n3.lanes).fill(null).map(() => Array(m2)), k2 = (e3, t3) => (b2[e3][t3] = d3.subarray(e3 * m2 * 1024 + 1024 * t3, e3 * m2 * 1024 + 1024 * t3 + Cy), b2[e3][t3]);
  for (let e3 = 0; e3 < n3.lanes; e3++) {
    const t3 = new Uint8Array(w2.length + 8);
    t3.set(w2), Uy(t3, 0, w2.length), Uy(t3, e3, w2.length + 4), xy(Cy, t3, k2(e3, 0)), Uy(t3, 1, w2.length), xy(Cy, t3, k2(e3, 1));
  }
  const E2 = m2 / 4;
  for (let e3 = 0; e3 < n3.passes; e3++) for (let t3 = 0; t3 < 4; t3++) {
    const r4 = 0 === e3 && t3 <= 1;
    for (let i4 = 0; i4 < n3.lanes; i4++) {
      let s4 = 0 === t3 && 0 === e3 ? 2 : 0;
      const a4 = r4 ? Fy(g2, e3, i4, t3, h4, n3.passes, E2, s4) : null;
      for (; s4 < E2; s4++) {
        const c4 = t3 * E2 + s4, u3 = c4 > 0 ? b2[i4][c4 - 1] : b2[i4][m2 - 1], h5 = r4 ? a4.next().value : u3;
        o3(y2.byteOffset, h5.byteOffset, i4, n3.lanes, e3, t3, s4, 4, E2);
        const f3 = y2[0], l3 = y2[1];
        0 === e3 && k2(i4, c4), My(g2, u3, b2[f3][l3], e3 > 0 ? p2 : b2[i4][c4]), e3 > 0 && Qy(g2, b2[i4][c4], p2, b2[i4][c4]);
      }
    }
  }
  const v2 = b2[0][m2 - 1];
  for (let e3 = 1; e3 < n3.lanes; e3++) Qy(g2, v2, v2, b2[e3][m2 - 1]);
  const I2 = xy(n3.tagLength, v2, new Uint8Array(n3.tagLength));
  return A2.fill(0), t2.grow(0), I2;
}
async function Ny(e2, t2) {
  const r3 = new WebAssembly.Memory({ initial: 1040, maximum: 65536 }), n3 = await async function(e3, t3, r4) {
    const n4 = { env: { memory: e3 } };
    if (void 0 === Ly) try {
      const e4 = await t3(n4);
      return Ly = true, e4;
    } catch (e4) {
      Ly = false;
    }
    return (Ly ? t3 : r4)(n4);
  }(r3, e2, t2);
  return (e3) => Ty(e3, { instance: n3.instance, memory: r3 });
}
function Oy(t2, r3, n3, i3) {
  var s3 = null, a3 = e.atob(n3), o3 = a3.length;
  s3 = new Uint8Array(new ArrayBuffer(o3));
  for (var c3 = 0; c3 < o3; c3++) s3[c3] = a3.charCodeAt(c3);
  return function(e2, t3, r4) {
    var n4 = r4 ? WebAssembly.instantiateStreaming : WebAssembly.instantiate, i4 = r4 ? WebAssembly.compileStreaming : WebAssembly.compile;
    return t3 ? n4(e2, t3) : i4(e2);
  }(s3, i3, false);
}
function Yy(e2) {
  return e2 && e2.__esModule && Object.prototype.hasOwnProperty.call(e2, "default") ? e2.default : e2;
}
var e, r2, n2, i2, s2, a2, l, y, M, R, F, T, L, N, O, H, Z, J, te, re, ge, Ae, be, ke, Ee, ve, Se, Ke, Ce, De, Ue, Pe, xe, Qe, Me, Te, He, ze, Ge, We, Xe, $e, ot, ct, ut, ht, At, wt, mt, Ct, Qt, Lt, Nt, Ot, Ht, zt, Gt, Vt, qt, _t, Jt, Wt, Xt, $t, tr, rr, nr, lr, yr, gr, dr, br, kr, Er, vr, Cr, xr, zr, Gr, jr, Vr, qr, _r, Yr, Zr, sn, an, hn, gn, In, Bn, Sn, Kn, Cn, Dn, Nn, On, Hn, zn, qn, _n, Zn, Jn, Wn, Xn, ei, ni, ii, si, ai, oi, ci, ui, hi, gi, pi, mi, bi, Ei, vi, Ii, Bi, Si, Pi, xi, Qi, Mi, Ri, Fi, Ni, Oi, Hi, zi, Gi, ji, Vi, qi, _i, Yi, es, Zi, Ji, Wi, Xi, $i, ts, rs, ns, is, ss, as, os, cs, us, hs, fs, ls, ys, gs, ps, ds, As, ws, ms, bs, ks, Es, vs, Is, Bs, Ss, Ks, Cs, Ds, Us, Ps, xs, Qs, Ms, Rs, Fs, Ts, Ls, Hs, Gs, js, Vs, qs, _s, Ys, Ws, Xs, $s, ea, ta, na, ia, sa, oa, ca, ua, ha, fa, la, ya, ga, da, Aa, wa, ma, ba, ka, La, Na, Oa, Ha, za, Ga, ja, Va, qa, $a, eo, to, ro, oo, co, Ko, Qo, jo, Vo, qo, Yo, Zo, Jo, Wo, Xo, $o, ic, ac, cc, uc, bc, vc, Sc, Kc, Cc, Dc, Uc, Pc, xc, Qc, Mc, Rc, jc, $c, eu, tu, ru, nu, iu, su, cu, uu, hu, fu, lu, yu, pu, du, Au, wu, mu, bu, ku, Eu, vu, Iu, Bu, Su, Ku, Cu, Du, Uu, Pu, xu, Qu, Mu, Ru, Fu, Tu, Lu, Nu, Vu, qu, Zu, $u, rh, nh, ih, sh, ah, oh, Ah, wh, mh, bh, kh, Eh, vh, Ih, Bh, Sh, Kh, Ch, Dh, Uh, Ph, xh, Qh, Mh, Rh, Fh, Th, Lh, Nh, Oh, Hh, zh, Gh, jh, Vh, qh, _h, Yh, Zh, Xh, $h, ef, rf, nf, sf, af, of, cf, uf, hf, ff, lf, yf, Af, wf, bf, kf, Ef, vf, If, Bf, Sf, Kf, Cf, Df, Uf, Pf, xf, Qf, Mf, Rf, Ff, Tf, Lf, Nf, Of, Hf, zf, Gf, jf, Vf, qf, _f, Yf, Zf, Jf, Wf, Xf, $f, tl, rl, nl, il, sl, al, ol, cl, ul, hl, fl, ll, yl, gl, pl, dl, Al, wl, ml, bl, kl, El, vl, Il, Hl, Jl, ey, ry, cy, dy, Ay, ky, Ey, Iy, Sy, Ky, Cy, Dy, Ly, Hy, zy, Gy, jy, Vy, qy, _y, Zy, Jy;
var init_openpgp_min = __esm({
  "node_modules/openpgp/dist/openpgp.min.mjs"() {
    e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};
    r2 = Symbol("doneWritingPromise");
    n2 = Symbol("doneWritingResolve");
    i2 = Symbol("doneWritingReject");
    s2 = Symbol("readingIndex");
    a2 = class _a2 extends Array {
      constructor() {
        super(), Object.setPrototypeOf(this, _a2.prototype), this[r2] = new Promise((e2, t2) => {
          this[n2] = e2, this[i2] = t2;
        }), this[r2].catch(() => {
        });
      }
    };
    a2.prototype.getReader = function() {
      return void 0 === this[s2] && (this[s2] = 0), { read: async () => (await this[r2], this[s2] === this.length ? { value: void 0, done: true } : { value: this[this[s2]++], done: false }) };
    }, a2.prototype.readToEnd = async function(e2) {
      await this[r2];
      const t2 = e2(this.slice(this[s2]));
      return this.length = 0, t2;
    }, a2.prototype.clone = function() {
      const e2 = new a2();
      return e2[r2] = this[r2].then(() => {
        e2.push(...this);
      }), e2;
    }, c2.prototype.write = async function(e2) {
      this.stream.push(e2);
    }, c2.prototype.close = async function() {
      this.stream[n2]();
    }, c2.prototype.abort = async function(e2) {
      return this.stream[i2](e2), e2;
    }, c2.prototype.releaseLock = function() {
    }, "object" == typeof e.process && e.process.versions;
    l = /* @__PURE__ */ new WeakSet();
    y = Symbol("externalBuffer");
    g.prototype.read = async function() {
      if (this[y] && this[y].length) {
        return { done: false, value: this[y].shift() };
      }
      return this._read();
    }, g.prototype.releaseLock = function() {
      this[y] && (this.stream[y] = this[y]), this._releaseLock();
    }, g.prototype.cancel = function(e2) {
      return this._cancel(e2);
    }, g.prototype.readLine = async function() {
      let e2, t2 = [];
      for (; !e2; ) {
        let { done: r3, value: n3 } = await this.read();
        if (n3 += "", r3) return t2.length ? A(t2) : void 0;
        const i3 = n3.indexOf("\n") + 1;
        i3 && (e2 = A(t2.concat(n3.substr(0, i3))), t2 = []), i3 !== n3.length && t2.push(n3.substr(i3));
      }
      return this.unshift(...t2), e2;
    }, g.prototype.readByte = async function() {
      const { done: e2, value: t2 } = await this.read();
      if (e2) return;
      const r3 = t2[0];
      return this.unshift(C(t2, 1)), r3;
    }, g.prototype.readBytes = async function(e2) {
      const t2 = [];
      let r3 = 0;
      for (; ; ) {
        const { done: n3, value: i3 } = await this.read();
        if (n3) return t2.length ? A(t2) : void 0;
        if (t2.push(i3), r3 += i3.length, r3 >= e2) {
          const r4 = A(t2);
          return this.unshift(C(r4, e2)), C(r4, 0, e2);
        }
      }
    }, g.prototype.peekBytes = async function(e2) {
      const t2 = await this.readBytes(e2);
      return this.unshift(t2), t2;
    }, g.prototype.unshift = function(...e2) {
      this[y] || (this[y] = []), 1 === e2.length && h2(e2[0]) && this[y].length && e2[0].length && this[y][0].byteOffset >= e2[0].length ? this[y][0] = new Uint8Array(this[y][0].buffer, this[y][0].byteOffset - e2[0].length, this[y][0].byteLength + e2[0].length) : this[y].unshift(...e2.filter((e3) => e3 && e3.length));
    }, g.prototype.readToEnd = async function(e2 = A) {
      const t2 = [];
      for (; ; ) {
        const { done: e3, value: r3 } = await this.read();
        if (e3) break;
        t2.push(r3);
      }
      return e2(t2);
    };
    M = Symbol("byValue");
    R = { curve: { nistP256: "nistP256", p256: "nistP256", nistP384: "nistP384", p384: "nistP384", nistP521: "nistP521", p521: "nistP521", secp256k1: "secp256k1", ed25519Legacy: "ed25519Legacy", ed25519: "ed25519Legacy", curve25519Legacy: "curve25519Legacy", curve25519: "curve25519Legacy", brainpoolP256r1: "brainpoolP256r1", brainpoolP384r1: "brainpoolP384r1", brainpoolP512r1: "brainpoolP512r1" }, s2k: { simple: 0, salted: 1, iterated: 3, argon2: 4, gnu: 101 }, publicKey: { rsaEncryptSign: 1, rsaEncrypt: 2, rsaSign: 3, elgamal: 16, dsa: 17, ecdh: 18, ecdsa: 19, eddsaLegacy: 22, aedh: 23, aedsa: 24, x25519: 25, x448: 26, ed25519: 27, ed448: 28 }, symmetric: { idea: 1, tripledes: 2, cast5: 3, blowfish: 4, aes128: 7, aes192: 8, aes256: 9, twofish: 10 }, compression: { uncompressed: 0, zip: 1, zlib: 2, bzip2: 3 }, hash: { md5: 1, sha1: 2, ripemd: 3, sha256: 8, sha384: 9, sha512: 10, sha224: 11, sha3_256: 12, sha3_512: 14 }, webHash: { "SHA-1": 2, "SHA-256": 8, "SHA-384": 9, "SHA-512": 10 }, aead: { eax: 1, ocb: 2, gcm: 3, experimentalGCM: 100 }, packet: { publicKeyEncryptedSessionKey: 1, signature: 2, symEncryptedSessionKey: 3, onePassSignature: 4, secretKey: 5, publicKey: 6, secretSubkey: 7, compressedData: 8, symmetricallyEncryptedData: 9, marker: 10, literalData: 11, trust: 12, userID: 13, publicSubkey: 14, userAttribute: 17, symEncryptedIntegrityProtectedData: 18, modificationDetectionCode: 19, aeadEncryptedData: 20, padding: 21 }, literal: { binary: 98, text: 116, utf8: 117, mime: 109 }, signature: { binary: 0, text: 1, standalone: 2, certGeneric: 16, certPersona: 17, certCasual: 18, certPositive: 19, certRevocation: 48, subkeyBinding: 24, keyBinding: 25, key: 31, keyRevocation: 32, subkeyRevocation: 40, timestamp: 64, thirdParty: 80 }, signatureSubpacket: { signatureCreationTime: 2, signatureExpirationTime: 3, exportableCertification: 4, trustSignature: 5, regularExpression: 6, revocable: 7, keyExpirationTime: 9, placeholderBackwardsCompatibility: 10, preferredSymmetricAlgorithms: 11, revocationKey: 12, issuerKeyID: 16, notationData: 20, preferredHashAlgorithms: 21, preferredCompressionAlgorithms: 22, keyServerPreferences: 23, preferredKeyServer: 24, primaryUserID: 25, policyURI: 26, keyFlags: 27, signersUserID: 28, reasonForRevocation: 29, features: 30, signatureTarget: 31, embeddedSignature: 32, issuerFingerprint: 33, preferredAEADAlgorithms: 34, preferredCipherSuites: 39 }, keyFlags: { certifyKeys: 1, signData: 2, encryptCommunication: 4, encryptStorage: 8, splitPrivateKey: 16, authentication: 32, sharedPrivateKey: 128 }, armor: { multipartSection: 0, multipartLast: 1, signed: 2, message: 3, publicKey: 4, privateKey: 5, signature: 6 }, reasonForRevocation: { noReason: 0, keySuperseded: 1, keyCompromised: 2, keyRetired: 3, userIDInvalid: 32 }, features: { modificationDetection: 1, aead: 2, v5Keys: 4, seipdv2: 8 }, write: function(e2, t2) {
      if ("number" == typeof t2 && (t2 = this.read(e2, t2)), void 0 !== e2[t2]) return e2[t2];
      throw Error("Invalid enum value.");
    }, read: function(e2, t2) {
      if (e2[M] || (e2[M] = [], Object.entries(e2).forEach(([t3, r3]) => {
        e2[M][r3] = t3;
      })), void 0 !== e2[M][t2]) return e2[M][t2];
      throw Error("Invalid enum value.");
    } };
    F = { preferredHashAlgorithm: R.hash.sha512, preferredSymmetricAlgorithm: R.symmetric.aes256, preferredCompressionAlgorithm: R.compression.uncompressed, aeadProtect: false, parseAEADEncryptedV4KeysAsLegacy: false, preferredAEADAlgorithm: R.aead.gcm, aeadChunkSizeByte: 12, v6Keys: false, enableParsingV5Entities: false, s2kType: R.s2k.iterated, s2kIterationCountByte: 224, s2kArgon2Params: { passes: 3, parallelism: 4, memoryExponent: 16 }, maxArgon2MemoryExponent: 30, allowUnauthenticatedMessages: false, allowUnauthenticatedStream: false, minRSABits: 2047, passwordCollisionCheck: false, allowInsecureDecryptionWithSigningKeys: false, allowInsecureVerificationWithReformattedKeys: false, allowMissingKeyFlags: false, constantTimePKCS1Decryption: false, constantTimePKCS1DecryptionSupportedSymmetricAlgorithms: /* @__PURE__ */ new Set([R.symmetric.aes128, R.symmetric.aes192, R.symmetric.aes256]), ignoreUnsupportedPackets: true, ignoreMalformedPackets: false, enforceGrammar: true, additionalAllowedPackets: [], showVersion: false, showComment: false, versionString: "OpenPGP.js 6.3.1", commentString: "https://openpgpjs.org", maxUserIDLength: 5120, maxDecompressedMessageSize: 1 / 0, knownNotations: [], nonDeterministicSignaturesViaNotation: true, useEllipticFallback: true, rejectHashAlgorithms: /* @__PURE__ */ new Set([R.hash.md5, R.hash.ripemd]), rejectMessageHashAlgorithms: /* @__PURE__ */ new Set([R.hash.md5, R.hash.ripemd, R.hash.sha1]), rejectPublicKeyAlgorithms: /* @__PURE__ */ new Set([R.publicKey.elgamal, R.publicKey.dsa]), rejectCurves: /* @__PURE__ */ new Set([R.curve.secp256k1]) };
    T = (() => {
      try {
        return true;
      } catch {
      }
      return false;
    })();
    L = { isString: function(e2) {
      return "string" == typeof e2 || e2 instanceof String;
    }, nodeRequire: () => {
    }, isArray: function(e2) {
      return e2 instanceof Array;
    }, isUint8Array: h2, isStream: u, getNobleCurve: async (e2, t2) => {
      if (!F.useEllipticFallback) throw Error("This curve is only supported in the full build of OpenPGP.js");
      const { nobleCurves: r3 } = await Promise.resolve().then(function() {
        return Lf;
      });
      switch (e2) {
        case R.publicKey.ecdh:
        case R.publicKey.ecdsa: {
          const e3 = r3.get(t2);
          if (!e3) throw Error("Unsupported curve");
          return e3;
        }
        case R.publicKey.x448:
          return r3.get("x448");
        case R.publicKey.ed448:
          return r3.get("ed448");
        default:
          throw Error("Unsupported curve");
      }
    }, readNumber: function(e2) {
      let t2 = 0;
      for (let r3 = 0; r3 < e2.length; r3++) t2 += 256 ** r3 * e2[e2.length - 1 - r3];
      return t2;
    }, writeNumber: function(e2, t2) {
      const r3 = new Uint8Array(t2);
      for (let n3 = 0; n3 < t2; n3++) r3[n3] = e2 >> 8 * (t2 - n3 - 1) & 255;
      return r3;
    }, readDate: function(e2) {
      const t2 = L.readNumber(e2);
      return new Date(1e3 * t2);
    }, writeDate: function(e2) {
      const t2 = Math.floor(e2.getTime() / 1e3);
      return L.writeNumber(t2, 4);
    }, normalizeDate: function(e2 = Date.now()) {
      return null === e2 || e2 === 1 / 0 ? e2 : new Date(1e3 * Math.floor(+e2 / 1e3));
    }, readMPI: function(e2) {
      const t2 = (e2[0] << 8 | e2[1]) + 7 >>> 3;
      return L.readExactSubarray(e2, 2, 2 + t2);
    }, readExactSubarray: function(e2, t2, r3) {
      if (e2.length < r3) throw Error("Input array too short");
      return e2.subarray(t2, r3);
    }, leftPad(e2, t2) {
      if (e2.length > t2) throw Error("Input array too long");
      const r3 = new Uint8Array(t2), n3 = t2 - e2.length;
      return r3.set(e2, n3), r3;
    }, uint8ArrayToMPI: function(e2) {
      const t2 = L.uint8ArrayBitLength(e2);
      if (0 === t2) throw Error("Zero MPI");
      const r3 = e2.subarray(e2.length - Math.ceil(t2 / 8)), n3 = new Uint8Array([(65280 & t2) >> 8, 255 & t2]);
      return L.concatUint8Array([n3, r3]);
    }, uint8ArrayBitLength: function(e2) {
      let t2;
      for (t2 = 0; t2 < e2.length && 0 === e2[t2]; t2++) ;
      if (t2 === e2.length) return 0;
      const r3 = e2.subarray(t2);
      return 8 * (r3.length - 1) + L.nbits(r3[0]);
    }, hexToUint8Array: function(e2) {
      const t2 = new Uint8Array(e2.length >> 1);
      for (let r3 = 0; r3 < e2.length >> 1; r3++) t2[r3] = parseInt(e2.substr(r3 << 1, 2), 16);
      return t2;
    }, uint8ArrayToHex: function(e2) {
      const t2 = "0123456789abcdef";
      let r3 = "";
      return e2.forEach((e3) => {
        r3 += t2[e3 >> 4] + t2[15 & e3];
      }), r3;
    }, stringToUint8Array: function(e2) {
      return b(e2, (e3) => {
        if (!L.isString(e3)) throw Error("stringToUint8Array: Data must be in the form of a string");
        const t2 = new Uint8Array(e3.length);
        for (let r3 = 0; r3 < e3.length; r3++) t2[r3] = e3.charCodeAt(r3);
        return t2;
      });
    }, uint8ArrayToString: function(e2) {
      const t2 = [], r3 = 16384, n3 = (e2 = new Uint8Array(e2)).length;
      for (let i3 = 0; i3 < n3; i3 += r3) t2.push(String.fromCharCode.apply(String, e2.subarray(i3, i3 + r3 < n3 ? i3 + r3 : n3)));
      return t2.join("");
    }, encodeUTF8: function(e2) {
      const t2 = new TextEncoder("utf-8");
      function r3(e3, r4 = false) {
        return t2.encode(e3, { stream: !r4 });
      }
      return b(e2, r3, () => r3("", true));
    }, decodeUTF8: function(e2) {
      const t2 = new TextDecoder("utf-8");
      function r3(e3, r4 = false) {
        return t2.decode(e3, { stream: !r4 });
      }
      return b(e2, r3, () => r3(new Uint8Array(), true));
    }, concat: A, concatUint8Array: f, equalsUint8Array: function(e2, t2) {
      if (!L.isUint8Array(e2) || !L.isUint8Array(t2)) throw Error("Data must be in the form of a Uint8Array");
      if (e2.length !== t2.length) return false;
      for (let r3 = 0; r3 < e2.length; r3++) if (e2[r3] !== t2[r3]) return false;
      return true;
    }, findLastIndex: function(e2, t2) {
      for (let r3 = e2.length; r3 >= 0; r3--) if (t2(e2[r3], r3, e2)) return r3;
      return -1;
    }, writeChecksum: function(e2) {
      let t2 = 0;
      for (let r3 = 0; r3 < e2.length; r3++) t2 = t2 + e2[r3] & 65535;
      return L.writeNumber(t2, 2);
    }, printDebug: function(e2) {
      T && console.log("[OpenPGP.js debug]", e2);
    }, printDebugError: function(e2) {
      T && console.error("[OpenPGP.js debug]", e2);
    }, nbits: function(e2) {
      let t2 = 1, r3 = e2 >>> 16;
      return 0 !== r3 && (e2 = r3, t2 += 16), r3 = e2 >> 8, 0 !== r3 && (e2 = r3, t2 += 8), r3 = e2 >> 4, 0 !== r3 && (e2 = r3, t2 += 4), r3 = e2 >> 2, 0 !== r3 && (e2 = r3, t2 += 2), r3 = e2 >> 1, 0 !== r3 && (e2 = r3, t2 += 1), t2;
    }, double: function(e2) {
      const t2 = new Uint8Array(e2.length), r3 = e2.length - 1;
      for (let n3 = 0; n3 < r3; n3++) t2[n3] = e2[n3] << 1 ^ e2[n3 + 1] >> 7;
      return t2[r3] = e2[r3] << 1 ^ 135 * (e2[0] >> 7), t2;
    }, shiftRight: function(e2, t2) {
      if (t2) for (let r3 = e2.length - 1; r3 >= 0; r3--) e2[r3] >>= t2, r3 > 0 && (e2[r3] |= e2[r3 - 1] << 8 - t2);
      return e2;
    }, getWebCrypto: function() {
      const t2 = void 0 !== e && e.crypto && e.crypto.subtle || this.getNodeCrypto()?.webcrypto.subtle;
      if (!t2) throw Error("The WebCrypto API is not available");
      return t2;
    }, getNodeCrypto: function() {
      return this.nodeRequire("crypto");
    }, getNodeZlib: function() {
      return this.nodeRequire("zlib");
    }, getNodeBuffer: function() {
      return (this.nodeRequire("buffer") || {}).Buffer;
    }, getHardwareConcurrency: function() {
      if ("undefined" != typeof navigator) return navigator.hardwareConcurrency || 1;
      return this.nodeRequire("os").cpus().length;
    }, isEmailAddress: function(e2) {
      if (!L.isString(e2)) return false;
      return /^[^\p{C}\p{Z}@<>\\]+@[^\p{C}\p{Z}@<>\\]+[^\p{C}\p{Z}\p{P}]$/u.test(e2);
    }, canonicalizeEOL: function(e2) {
      let t2 = false;
      return b(e2, (e3) => {
        let r3;
        t2 && (e3 = L.concatUint8Array([new Uint8Array([13]), e3])), 13 === e3[e3.length - 1] ? (t2 = true, e3 = e3.subarray(0, -1)) : t2 = false;
        const n3 = [];
        for (let t3 = 0; r3 = e3.indexOf(10, t3) + 1, r3; t3 = r3) 13 !== e3[r3 - 2] && n3.push(r3);
        if (!n3.length) return e3;
        const i3 = new Uint8Array(e3.length + n3.length);
        let s3 = 0;
        for (let t3 = 0; t3 < n3.length; t3++) {
          const r4 = e3.subarray(n3[t3 - 1] || 0, n3[t3]);
          i3.set(r4, s3), s3 += r4.length, i3[s3 - 1] = 13, i3[s3] = 10, s3++;
        }
        return i3.set(e3.subarray(n3[n3.length - 1] || 0), s3), i3;
      }, () => t2 ? new Uint8Array([13]) : void 0);
    }, nativeEOL: function(e2) {
      let t2 = false;
      return b(e2, (e3) => {
        let r3;
        13 === (e3 = t2 && 10 !== e3[0] ? L.concatUint8Array([new Uint8Array([13]), e3]) : new Uint8Array(e3))[e3.length - 1] ? (t2 = true, e3 = e3.subarray(0, -1)) : t2 = false;
        let n3 = 0;
        for (let t3 = 0; t3 !== e3.length; t3 = r3) {
          r3 = e3.indexOf(13, t3) + 1, r3 || (r3 = e3.length);
          const i3 = r3 - (10 === e3[r3] ? 1 : 0);
          t3 && e3.copyWithin(n3, t3, i3), n3 += i3 - t3;
        }
        return e3.subarray(0, n3);
      }, () => t2 ? new Uint8Array([13]) : void 0);
    }, removeTrailingSpaces: function(e2) {
      return e2.split("\n").map((e3) => {
        let t2 = e3.length - 1;
        for (; t2 >= 0 && (" " === e3[t2] || "	" === e3[t2] || "\r" === e3[t2]); t2--) ;
        return e3.substr(0, t2 + 1);
      }).join("\n");
    }, wrapError: function(e2, t2) {
      if (!t2) return e2 instanceof Error ? e2 : Error(e2);
      if (e2 instanceof Error) {
        try {
          e2.message += ": " + t2.message, e2.cause = t2;
        } catch {
        }
        return e2;
      }
      return Error(e2 + ": " + t2.message, { cause: t2 });
    }, constructAllowedPackets: function(e2) {
      const t2 = {};
      return e2.forEach((e3) => {
        if (!e3.tag) throw Error("Invalid input: expected a packet class");
        t2[e3.tag] = e3;
      }), t2;
    }, anyPromise: function(e2) {
      return new Promise((t2, r3) => {
        let n3;
        Promise.all(e2.map(async (e3) => {
          try {
            t2(await e3);
          } catch (e4) {
            n3 = e4;
          }
        })).then(() => {
          r3(n3);
        });
      });
    }, selectUint8Array: function(e2, t2, r3) {
      const n3 = Math.max(t2.length, r3.length), i3 = new Uint8Array(n3);
      let s3 = 0;
      for (let n4 = 0; n4 < i3.length; n4++) i3[n4] = t2[n4] & 256 - e2 | r3[n4] & 255 + e2, s3 += e2 & n4 < t2.length | 1 - e2 & n4 < r3.length;
      return i3.subarray(0, s3);
    }, selectUint8: function(e2, t2, r3) {
      return t2 & 256 - e2 | r3 & 255 + e2;
    }, isAES: function(e2) {
      return e2 === R.symmetric.aes128 || e2 === R.symmetric.aes192 || e2 === R.symmetric.aes256;
    } };
    N = L.getNodeBuffer();
    N ? (O = (e2) => N.from(e2).toString("base64"), H = (e2) => {
      const t2 = N.from(e2, "base64");
      return new Uint8Array(t2.buffer, t2.byteOffset, t2.byteLength);
    }) : (O = (e2) => btoa(L.uint8ArrayToString(e2)), H = (e2) => L.stringToUint8Array(atob(e2)));
    Z = [Array(255), Array(255), Array(255), Array(255)];
    for (let e2 = 0; e2 <= 255; e2++) {
      let t2 = e2 << 16;
      for (let e3 = 0; e3 < 8; e3++) t2 = t2 << 1 ^ (8388608 & t2 ? 8801531 : 0);
      Z[0][e2] = (16711680 & t2) >> 16 | 65280 & t2 | (255 & t2) << 16;
    }
    for (let e2 = 0; e2 <= 255; e2++) Z[1][e2] = Z[0][e2] >> 8 ^ Z[0][255 & Z[0][e2]];
    for (let e2 = 0; e2 <= 255; e2++) Z[2][e2] = Z[1][e2] >> 8 ^ Z[0][255 & Z[1][e2]];
    for (let e2 = 0; e2 <= 255; e2++) Z[3][e2] = Z[2][e2] >> 8 ^ Z[0][255 & Z[2][e2]];
    J = function() {
      const e2 = new ArrayBuffer(2);
      return new DataView(e2).setInt16(0, 255, true), 255 === new Int16Array(e2)[0];
    }();
    te = BigInt(0);
    re = BigInt(1);
    ge = L.getNodeCrypto();
    Ae = BigInt(1);
    be = [7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997, 1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1087, 1091, 1093, 1097, 1103, 1109, 1117, 1123, 1129, 1151, 1153, 1163, 1171, 1181, 1187, 1193, 1201, 1213, 1217, 1223, 1229, 1231, 1237, 1249, 1259, 1277, 1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307, 1319, 1321, 1327, 1361, 1367, 1373, 1381, 1399, 1409, 1423, 1427, 1429, 1433, 1439, 1447, 1451, 1453, 1459, 1471, 1481, 1483, 1487, 1489, 1493, 1499, 1511, 1523, 1531, 1543, 1549, 1553, 1559, 1567, 1571, 1579, 1583, 1597, 1601, 1607, 1609, 1613, 1619, 1621, 1627, 1637, 1657, 1663, 1667, 1669, 1693, 1697, 1699, 1709, 1721, 1723, 1733, 1741, 1747, 1753, 1759, 1777, 1783, 1787, 1789, 1801, 1811, 1823, 1831, 1847, 1861, 1867, 1871, 1873, 1877, 1879, 1889, 1901, 1907, 1913, 1931, 1933, 1949, 1951, 1973, 1979, 1987, 1993, 1997, 1999, 2003, 2011, 2017, 2027, 2029, 2039, 2053, 2063, 2069, 2081, 2083, 2087, 2089, 2099, 2111, 2113, 2129, 2131, 2137, 2141, 2143, 2153, 2161, 2179, 2203, 2207, 2213, 2221, 2237, 2239, 2243, 2251, 2267, 2269, 2273, 2281, 2287, 2293, 2297, 2309, 2311, 2333, 2339, 2341, 2347, 2351, 2357, 2371, 2377, 2381, 2383, 2389, 2393, 2399, 2411, 2417, 2423, 2437, 2441, 2447, 2459, 2467, 2473, 2477, 2503, 2521, 2531, 2539, 2543, 2549, 2551, 2557, 2579, 2591, 2593, 2609, 2617, 2621, 2633, 2647, 2657, 2659, 2663, 2671, 2677, 2683, 2687, 2689, 2693, 2699, 2707, 2711, 2713, 2719, 2729, 2731, 2741, 2749, 2753, 2767, 2777, 2789, 2791, 2797, 2801, 2803, 2819, 2833, 2837, 2843, 2851, 2857, 2861, 2879, 2887, 2897, 2903, 2909, 2917, 2927, 2939, 2953, 2957, 2963, 2969, 2971, 2999, 3001, 3011, 3019, 3023, 3037, 3041, 3049, 3061, 3067, 3079, 3083, 3089, 3109, 3119, 3121, 3137, 3163, 3167, 3169, 3181, 3187, 3191, 3203, 3209, 3217, 3221, 3229, 3251, 3253, 3257, 3259, 3271, 3299, 3301, 3307, 3313, 3319, 3323, 3329, 3331, 3343, 3347, 3359, 3361, 3371, 3373, 3389, 3391, 3407, 3413, 3433, 3449, 3457, 3461, 3463, 3467, 3469, 3491, 3499, 3511, 3517, 3527, 3529, 3533, 3539, 3541, 3547, 3557, 3559, 3571, 3581, 3583, 3593, 3607, 3613, 3617, 3623, 3631, 3637, 3643, 3659, 3671, 3673, 3677, 3691, 3697, 3701, 3709, 3719, 3727, 3733, 3739, 3761, 3767, 3769, 3779, 3793, 3797, 3803, 3821, 3823, 3833, 3847, 3851, 3853, 3863, 3877, 3881, 3889, 3907, 3911, 3917, 3919, 3923, 3929, 3931, 3943, 3947, 3967, 3989, 4001, 4003, 4007, 4013, 4019, 4021, 4027, 4049, 4051, 4057, 4073, 4079, 4091, 4093, 4099, 4111, 4127, 4129, 4133, 4139, 4153, 4157, 4159, 4177, 4201, 4211, 4217, 4219, 4229, 4231, 4241, 4243, 4253, 4259, 4261, 4271, 4273, 4283, 4289, 4297, 4327, 4337, 4339, 4349, 4357, 4363, 4373, 4391, 4397, 4409, 4421, 4423, 4441, 4447, 4451, 4457, 4463, 4481, 4483, 4493, 4507, 4513, 4517, 4519, 4523, 4547, 4549, 4561, 4567, 4583, 4591, 4597, 4603, 4621, 4637, 4639, 4643, 4649, 4651, 4657, 4663, 4673, 4679, 4691, 4703, 4721, 4723, 4729, 4733, 4751, 4759, 4783, 4787, 4789, 4793, 4799, 4801, 4813, 4817, 4831, 4861, 4871, 4877, 4889, 4903, 4909, 4919, 4931, 4933, 4937, 4943, 4951, 4957, 4967, 4969, 4973, 4987, 4993, 4999].map((e2) => BigInt(e2));
    ke = L.getWebCrypto();
    Ee = L.getNodeCrypto();
    ve = Ee && Ee.getHashes();
    Se = Ie("md5") || Be("md5");
    Ke = Ie("sha1") || Be("sha1", "SHA-1");
    Ce = Ie("sha224") || Be("sha224");
    De = Ie("sha256") || Be("sha256", "SHA-256");
    Ue = Ie("sha384") || Be("sha384", "SHA-384");
    Pe = Ie("sha512") || Be("sha512", "SHA-512");
    xe = Ie("ripemd160") || Be("ripemd160");
    Qe = Ie("sha3-256") || Be("sha3_256");
    Me = Ie("sha3-512") || Be("sha3_512");
    Te = [];
    Te[1] = [48, 32, 48, 12, 6, 8, 42, 134, 72, 134, 247, 13, 2, 5, 5, 0, 4, 16], Te[2] = [48, 33, 48, 9, 6, 5, 43, 14, 3, 2, 26, 5, 0, 4, 20], Te[3] = [48, 33, 48, 9, 6, 5, 43, 36, 3, 2, 1, 5, 0, 4, 20], Te[8] = [48, 49, 48, 13, 6, 9, 96, 134, 72, 1, 101, 3, 4, 2, 1, 5, 0, 4, 32], Te[9] = [48, 65, 48, 13, 6, 9, 96, 134, 72, 1, 101, 3, 4, 2, 2, 5, 0, 4, 48], Te[10] = [48, 81, 48, 13, 6, 9, 96, 134, 72, 1, 101, 3, 4, 2, 3, 5, 0, 4, 64], Te[11] = [48, 45, 48, 13, 6, 9, 96, 134, 72, 1, 101, 3, 4, 2, 4, 5, 0, 4, 28], Te[12] = [48, 49, 48, 13, 6, 9, 96, 134, 72, 1, 101, 3, 4, 2, 8, 5, 0, 4, 32], Te[14] = [48, 81, 48, 13, 6, 9, 96, 134, 72, 1, 101, 3, 4, 2, 10, 5, 0, 4, 64];
    He = L.getWebCrypto();
    ze = L.getNodeCrypto();
    Ge = BigInt(1);
    We = BigInt(1);
    Xe = { "2a8648ce3d030107": R.curve.nistP256, "2b81040022": R.curve.nistP384, "2b81040023": R.curve.nistP521, "2b8104000a": R.curve.secp256k1, "2b06010401da470f01": R.curve.ed25519Legacy, "2b060104019755010501": R.curve.curve25519Legacy, "2b2403030208010107": R.curve.brainpoolP256r1, "2b240303020801010b": R.curve.brainpoolP384r1, "2b240303020801010d": R.curve.brainpoolP512r1 };
    $e = class _$e {
      constructor(e2) {
        if (e2 instanceof _$e) this.oid = e2.oid;
        else if (L.isArray(e2) || L.isUint8Array(e2)) {
          if (6 === (e2 = new Uint8Array(e2))[0]) {
            if (e2[1] !== e2.length - 2) throw Error("Length mismatch in DER encoded oid");
            e2 = e2.subarray(2);
          }
          this.oid = e2;
        } else this.oid = "";
      }
      read(e2) {
        if (e2.length >= 1) {
          const t2 = e2[0];
          if (e2.length >= 1 + t2) return this.oid = e2.subarray(1, 1 + t2), 1 + this.oid.length;
        }
        throw Error("Invalid oid");
      }
      write() {
        return L.concatUint8Array([new Uint8Array([this.oid.length]), this.oid]);
      }
      toHex() {
        return L.uint8ArrayToHex(this.oid);
      }
      getName() {
        const e2 = Xe[this.toHex()];
        if (!e2) throw Error("Unknown curve object identifier.");
        return e2;
      }
    };
    ot = class _ot extends Error {
      constructor(...e2) {
        super(...e2), Error.captureStackTrace && Error.captureStackTrace(this, _ot), this.name = "UnsupportedError";
      }
    };
    ct = class extends ot {
      constructor(...e2) {
        super(...e2), Error.captureStackTrace && Error.captureStackTrace(this, ot), this.name = "UnknownPacketError";
      }
    };
    ut = class extends ot {
      constructor(...e2) {
        super(...e2), Error.captureStackTrace && Error.captureStackTrace(this, ot), this.name = "MalformedPacketError";
      }
    };
    ht = class {
      constructor(e2, t2) {
        this.tag = e2, this.rawContent = t2;
      }
      write() {
        return this.rawContent;
      }
    };
    At = (e2, t2) => {
      if (e2 === R.publicKey.ed25519) {
        return { kty: "OKP", crv: "Ed25519", x: V(t2), ext: true };
      }
      throw Error("Unsupported EdDSA algorithm");
    };
    wt = (e2, t2, r3) => {
      if (e2 === R.publicKey.ed25519) {
        const n3 = At(e2, t2);
        return n3.d = V(r3), n3;
      }
      throw Error("Unsupported EdDSA algorithm");
    };
    mt = /* @__PURE__ */ Object.freeze({ __proto__: null, generate: ft, getPayloadSize: pt, getPreferredHashAlgo: dt, sign: lt, validateParams: gt, verify: yt });
    Ct = /* @__PURE__ */ (() => 68 === new Uint8Array(new Uint32Array([287454020]).buffer)[0])();
    Qt = (e2, t2) => {
      function r3(r4, ...n3) {
        if (kt(r4), !Ct) throw Error("Non little-endian hardware is not yet supported");
        if (void 0 !== e2.nonceLength) {
          const t3 = n3[0];
          if (!t3) throw Error("nonce / iv required");
          e2.varSizeNonce ? kt(t3) : kt(t3, e2.nonceLength);
        }
        const i3 = e2.tagLength;
        i3 && void 0 !== n3[1] && kt(n3[1]);
        const s3 = t2(r4, ...n3), a3 = (e3, t3) => {
          if (void 0 !== t3) {
            if (2 !== e3) throw Error("cipher output not supported");
            kt(t3);
          }
        };
        let o3 = false;
        return { encrypt(e3, t3) {
          if (o3) throw Error("cannot encrypt() twice with same key + nonce");
          return o3 = true, kt(e3), a3(s3.encrypt.length, t3), s3.encrypt(e3, t3);
        }, decrypt(e3, t3) {
          if (kt(e3), i3 && e3.length < i3) throw Error("invalid ciphertext length: smaller than tagLength=" + i3);
          return a3(s3.decrypt.length, t3), s3.decrypt(e3, t3);
        } };
      }
      return Object.assign(r3, e2), r3;
    };
    Lt = 16;
    Nt = /* @__PURE__ */ new Uint8Array(16);
    Ot = Bt(Nt);
    Ht = (e2) => (e2 >>> 0 & 255) << 24 | (e2 >>> 8 & 255) << 16 | (e2 >>> 16 & 255) << 8 | e2 >>> 24 & 255;
    zt = class {
      constructor(e2, t2) {
        this.blockLen = Lt, this.outputLen = Lt, this.s0 = 0, this.s1 = 0, this.s2 = 0, this.s3 = 0, this.finished = false, kt(e2 = Dt(e2), 16);
        const r3 = Kt(e2);
        let n3 = r3.getUint32(0, false), i3 = r3.getUint32(4, false), s3 = r3.getUint32(8, false), a3 = r3.getUint32(12, false);
        const o3 = [];
        for (let e3 = 0; e3 < 128; e3++) o3.push({ s0: Ht(n3), s1: Ht(i3), s2: Ht(s3), s3: Ht(a3) }), { s0: n3, s1: i3, s2: s3, s3: a3 } = { s3: (h4 = s3) << 31 | (f2 = a3) >>> 1, s2: (u2 = i3) << 31 | h4 >>> 1, s1: (c3 = n3) << 31 | u2 >>> 1, s0: c3 >>> 1 ^ 225 << 24 & -(1 & f2) };
        var c3, u2, h4, f2;
        const l2 = (y2 = t2 || 1024) > 65536 ? 8 : y2 > 1024 ? 4 : 2;
        var y2;
        if (![1, 2, 4, 8].includes(l2)) throw Error("ghash: invalid window size, expected 2, 4 or 8");
        this.W = l2;
        const g2 = 128 / l2, p2 = this.windowSize = 2 ** l2, d3 = [];
        for (let e3 = 0; e3 < g2; e3++) for (let t3 = 0; t3 < p2; t3++) {
          let r4 = 0, n4 = 0, i4 = 0, s4 = 0;
          for (let a4 = 0; a4 < l2; a4++) {
            if (!(t3 >>> l2 - a4 - 1 & 1)) continue;
            const { s0: c4, s1: u3, s2: h5, s3: f3 } = o3[l2 * e3 + a4];
            r4 ^= c4, n4 ^= u3, i4 ^= h5, s4 ^= f3;
          }
          d3.push({ s0: r4, s1: n4, s2: i4, s3: s4 });
        }
        this.t = d3;
      }
      _updateBlock(e2, t2, r3, n3) {
        e2 ^= this.s0, t2 ^= this.s1, r3 ^= this.s2, n3 ^= this.s3;
        const { W: i3, t: s3, windowSize: a3 } = this;
        let o3 = 0, c3 = 0, u2 = 0, h4 = 0;
        const f2 = (1 << i3) - 1;
        let l2 = 0;
        for (const y2 of [e2, t2, r3, n3]) for (let e3 = 0; e3 < 4; e3++) {
          const t3 = y2 >>> 8 * e3 & 255;
          for (let e4 = 8 / i3 - 1; e4 >= 0; e4--) {
            const r4 = t3 >>> i3 * e4 & f2, { s0: n4, s1: y3, s2: g2, s3: p2 } = s3[l2 * a3 + r4];
            o3 ^= n4, c3 ^= y3, u2 ^= g2, h4 ^= p2, l2 += 1;
          }
        }
        this.s0 = o3, this.s1 = c3, this.s2 = u2, this.s3 = h4;
      }
      update(e2) {
        Et(this), kt(e2 = Dt(e2));
        const t2 = Bt(e2), r3 = Math.floor(e2.length / Lt), n3 = e2.length % Lt;
        for (let e3 = 0; e3 < r3; e3++) this._updateBlock(t2[4 * e3 + 0], t2[4 * e3 + 1], t2[4 * e3 + 2], t2[4 * e3 + 3]);
        return n3 && (Nt.set(e2.subarray(r3 * Lt)), this._updateBlock(Ot[0], Ot[1], Ot[2], Ot[3]), St(Ot)), this;
      }
      destroy() {
        const { t: e2 } = this;
        for (const t2 of e2) t2.s0 = 0, t2.s1 = 0, t2.s2 = 0, t2.s3 = 0;
      }
      digestInto(e2) {
        Et(this), vt(e2, this), this.finished = true;
        const { s0: t2, s1: r3, s2: n3, s3: i3 } = this, s3 = Bt(e2);
        return s3[0] = t2, s3[1] = r3, s3[2] = n3, s3[3] = i3, e2;
      }
      digest() {
        const e2 = new Uint8Array(Lt);
        return this.digestInto(e2), this.destroy(), e2;
      }
    };
    Gt = class extends zt {
      constructor(e2, t2) {
        kt(e2 = Dt(e2));
        const r3 = function(e3) {
          e3.reverse();
          const t3 = 1 & e3[15];
          let r4 = 0;
          for (let t4 = 0; t4 < e3.length; t4++) {
            const n3 = e3[t4];
            e3[t4] = n3 >>> 1 | r4, r4 = (1 & n3) << 7;
          }
          return e3[0] ^= 225 & -t3, e3;
        }(Tt(e2));
        super(r3, t2), St(r3);
      }
      update(e2) {
        e2 = Dt(e2), Et(this);
        const t2 = Bt(e2), r3 = e2.length % Lt, n3 = Math.floor(e2.length / Lt);
        for (let e3 = 0; e3 < n3; e3++) this._updateBlock(Ht(t2[4 * e3 + 3]), Ht(t2[4 * e3 + 2]), Ht(t2[4 * e3 + 1]), Ht(t2[4 * e3 + 0]));
        return r3 && (Nt.set(e2.subarray(n3 * Lt)), this._updateBlock(Ht(Ot[3]), Ht(Ot[2]), Ht(Ot[1]), Ht(Ot[0])), St(Ot)), this;
      }
      digestInto(e2) {
        Et(this), vt(e2, this), this.finished = true;
        const { s0: t2, s1: r3, s2: n3, s3: i3 } = this, s3 = Bt(e2);
        return s3[0] = t2, s3[1] = r3, s3[2] = n3, s3[3] = i3, e2.reverse();
      }
    };
    Vt = jt((e2, t2) => new zt(e2, t2));
    jt((e2, t2) => new Gt(e2, t2));
    qt = 16;
    _t = /* @__PURE__ */ new Uint8Array(qt);
    Jt = /* @__PURE__ */ (() => {
      const e2 = new Uint8Array(256);
      for (let t3 = 0, r3 = 1; t3 < 256; t3++, r3 ^= Yt(r3)) e2[t3] = r3;
      const t2 = new Uint8Array(256);
      t2[0] = 99;
      for (let r3 = 0; r3 < 255; r3++) {
        let n3 = e2[255 - r3];
        n3 |= n3 << 8, t2[e2[r3]] = 255 & (n3 ^ n3 >> 4 ^ n3 >> 5 ^ n3 >> 6 ^ n3 >> 7 ^ 99);
      }
      return St(e2), t2;
    })();
    Wt = /* @__PURE__ */ Jt.map((e2, t2) => Jt.indexOf(t2));
    Xt = (e2) => e2 << 8 | e2 >>> 24;
    $t = (e2) => e2 << 24 & 4278190080 | e2 << 8 & 16711680 | e2 >>> 8 & 65280 | e2 >>> 24 & 255;
    tr = /* @__PURE__ */ er(Jt, (e2) => Zt(e2, 3) << 24 | e2 << 16 | e2 << 8 | Zt(e2, 2));
    rr = /* @__PURE__ */ er(Wt, (e2) => Zt(e2, 11) << 24 | Zt(e2, 13) << 16 | Zt(e2, 9) << 8 | Zt(e2, 14));
    nr = /* @__PURE__ */ (() => {
      const e2 = new Uint8Array(16);
      for (let t2 = 0, r3 = 1; t2 < 16; t2++, r3 = Yt(r3)) e2[t2] = r3;
      return e2;
    })();
    lr = /* @__PURE__ */ Qt({ blockSize: 16, nonceLength: 16 }, function(e2, t2) {
      function r3(r4, n3) {
        if (kt(r4), void 0 !== n3 && (kt(n3), !Ft(n3))) throw Error("unaligned destination");
        const i3 = ir(e2), s3 = Tt(t2), a3 = [i3, s3];
        Ft(r4) || a3.push(r4 = Tt(r4));
        const o3 = hr(i3, s3, r4, n3);
        return St(...a3), o3;
      }
      return { encrypt: (e3, t3) => r3(e3, t3), decrypt: (e3, t3) => r3(e3, t3) };
    });
    yr = /* @__PURE__ */ Qt({ blockSize: 16, nonceLength: 16 }, function(e2, t2, r3 = {}) {
      const n3 = !r3.disablePadding;
      return { encrypt(r4, i3) {
        const s3 = ir(e2), { b: a3, o: o3, out: c3 } = function(e3, t3, r5) {
          kt(e3);
          let n4 = e3.length;
          const i4 = n4 % qt;
          if (!t3 && 0 !== i4) throw Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
          Ft(e3) || (e3 = Tt(e3));
          const s4 = Bt(e3);
          if (t3) {
            let e4 = qt - i4;
            e4 || (e4 = qt), n4 += e4;
          }
          return Pt(e3, r5 = Mt(n4, r5)), { b: s4, o: Bt(r5), out: r5 };
        }(r4, n3, i3);
        let u2 = t2;
        const h4 = [s3];
        Ft(u2) || h4.push(u2 = Tt(u2));
        const f2 = Bt(u2);
        let l2 = f2[0], y2 = f2[1], g2 = f2[2], p2 = f2[3], d3 = 0;
        for (; d3 + 4 <= a3.length; ) l2 ^= a3[d3 + 0], y2 ^= a3[d3 + 1], g2 ^= a3[d3 + 2], p2 ^= a3[d3 + 3], { s0: l2, s1: y2, s2: g2, s3: p2 } = cr(s3, l2, y2, g2, p2), o3[d3++] = l2, o3[d3++] = y2, o3[d3++] = g2, o3[d3++] = p2;
        if (n3) {
          const e3 = function(e4) {
            const t3 = new Uint8Array(16), r5 = Bt(t3);
            t3.set(e4);
            const n4 = qt - e4.length;
            for (let e5 = qt - n4; e5 < qt; e5++) t3[e5] = n4;
            return r5;
          }(r4.subarray(4 * d3));
          l2 ^= e3[0], y2 ^= e3[1], g2 ^= e3[2], p2 ^= e3[3], { s0: l2, s1: y2, s2: g2, s3: p2 } = cr(s3, l2, y2, g2, p2), o3[d3++] = l2, o3[d3++] = y2, o3[d3++] = g2, o3[d3++] = p2;
        }
        return St(...h4), c3;
      }, decrypt(r4, i3) {
        !function(e3) {
          if (kt(e3), e3.length % qt != 0) throw Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size 16");
        }(r4);
        const s3 = sr(e2);
        let a3 = t2;
        const o3 = [s3];
        Ft(a3) || o3.push(a3 = Tt(a3));
        const c3 = Bt(a3);
        i3 = Mt(r4.length, i3), Ft(r4) || o3.push(r4 = Tt(r4)), Pt(r4, i3);
        const u2 = Bt(r4), h4 = Bt(i3);
        let f2 = c3[0], l2 = c3[1], y2 = c3[2], g2 = c3[3];
        for (let e3 = 0; e3 + 4 <= u2.length; ) {
          const t3 = f2, r5 = l2, n4 = y2, i4 = g2;
          f2 = u2[e3 + 0], l2 = u2[e3 + 1], y2 = u2[e3 + 2], g2 = u2[e3 + 3];
          const { s0: a4, s1: o4, s2: c4, s3: p2 } = ur(s3, f2, l2, y2, g2);
          h4[e3++] = a4 ^ t3, h4[e3++] = o4 ^ r5, h4[e3++] = c4 ^ n4, h4[e3++] = p2 ^ i4;
        }
        return St(...o3), function(e3, t3) {
          if (!t3) return e3;
          const r5 = e3.length;
          if (!r5) throw Error("aes/pcks5: empty ciphertext not allowed");
          const n4 = e3[r5 - 1];
          if (n4 <= 0 || n4 > 16) throw Error("aes/pcks5: wrong padding");
          const i4 = e3.subarray(0, -n4);
          for (let t4 = 0; t4 < n4; t4++) if (e3[r5 - t4 - 1] !== n4) throw Error("aes/pcks5: wrong padding");
          return i4;
        }(i3, n3);
      } };
    });
    gr = /* @__PURE__ */ Qt({ blockSize: 16, nonceLength: 16 }, function(e2, t2) {
      function r3(r4, n3, i3) {
        kt(r4);
        const s3 = r4.length;
        if (Ut(r4, i3 = Mt(s3, i3))) throw Error("overlapping src and dst not supported.");
        const a3 = ir(e2);
        let o3 = t2;
        const c3 = [a3];
        Ft(o3) || c3.push(o3 = Tt(o3)), Ft(r4) || c3.push(r4 = Tt(r4));
        const u2 = Bt(r4), h4 = Bt(i3), f2 = n3 ? h4 : u2, l2 = Bt(o3);
        let y2 = l2[0], g2 = l2[1], p2 = l2[2], d3 = l2[3];
        for (let e3 = 0; e3 + 4 <= u2.length; ) {
          const { s0: t3, s1: r5, s2: n4, s3: i4 } = cr(a3, y2, g2, p2, d3);
          h4[e3 + 0] = u2[e3 + 0] ^ t3, h4[e3 + 1] = u2[e3 + 1] ^ r5, h4[e3 + 2] = u2[e3 + 2] ^ n4, h4[e3 + 3] = u2[e3 + 3] ^ i4, y2 = f2[e3++], g2 = f2[e3++], p2 = f2[e3++], d3 = f2[e3++];
        }
        const A2 = qt * Math.floor(u2.length / 4);
        if (A2 < s3) {
          ({ s0: y2, s1: g2, s2: p2, s3: d3 } = cr(a3, y2, g2, p2, d3));
          const e3 = It(new Uint32Array([y2, g2, p2, d3]));
          for (let t3 = A2, n4 = 0; t3 < s3; t3++, n4++) i3[t3] = r4[t3] ^ e3[n4];
          St(e3);
        }
        return St(...c3), i3;
      }
      return { encrypt: (e3, t3) => r3(e3, true, t3), decrypt: (e3, t3) => r3(e3, false, t3) };
    });
    dr = /* @__PURE__ */ Qt({ blockSize: 16, nonceLength: 12, tagLength: 16, varSizeNonce: true }, function(e2, t2, r3) {
      if (t2.length < 8) throw Error("aes/gcm: invalid nonce length");
      function n3(e3, t3, n4) {
        const i4 = pr(Vt, false, e3, n4, r3);
        for (let e4 = 0; e4 < t3.length; e4++) i4[e4] ^= t3[e4];
        return i4;
      }
      function i3() {
        const r4 = ir(e2), n4 = _t.slice(), i4 = _t.slice();
        if (fr(r4, false, i4, i4, n4), 12 === t2.length) i4.set(t2);
        else {
          const e3 = _t.slice();
          Rt(Kt(e3), 8, BigInt(8 * t2.length), false);
          const r5 = Vt.create(n4).update(t2).update(e3);
          r5.digestInto(i4), r5.destroy();
        }
        return { xk: r4, authKey: n4, counter: i4, tagMask: fr(r4, false, i4, _t) };
      }
      return { encrypt(e3) {
        const { xk: t3, authKey: r4, counter: s3, tagMask: a3 } = i3(), o3 = new Uint8Array(e3.length + 16), c3 = [t3, r4, s3, a3];
        Ft(e3) || c3.push(e3 = Tt(e3)), fr(t3, false, s3, e3, o3.subarray(0, e3.length));
        const u2 = n3(r4, a3, o3.subarray(0, o3.length - 16));
        return c3.push(u2), o3.set(u2, e3.length), St(...c3), o3;
      }, decrypt(e3) {
        const { xk: t3, authKey: r4, counter: s3, tagMask: a3 } = i3(), o3 = [t3, r4, a3, s3];
        Ft(e3) || o3.push(e3 = Tt(e3));
        const c3 = e3.subarray(0, -16), u2 = e3.subarray(-16), h4 = n3(r4, a3, c3);
        if (o3.push(h4), !xt(h4, u2)) throw Error("aes/gcm: invalid ghash tag");
        const f2 = fr(t3, false, s3, c3);
        return St(...o3), f2;
      } };
    });
    br = { encrypt(e2, t2) {
      if (t2.length >= 2 ** 32) throw Error("plaintext should be less than 4gb");
      const r3 = ir(e2);
      if (16 === t2.length) wr(r3, t2);
      else {
        const e3 = Bt(t2);
        let n3 = e3[0], i3 = e3[1];
        for (let t3 = 0, s3 = 1; t3 < 6; t3++) for (let t4 = 2; t4 < e3.length; t4 += 2, s3++) {
          const { s0: a3, s1: o3, s2: c3, s3: u2 } = cr(r3, n3, i3, e3[t4], e3[t4 + 1]);
          n3 = a3, i3 = o3 ^ $t(s3), e3[t4] = c3, e3[t4 + 1] = u2;
        }
        e3[0] = n3, e3[1] = i3;
      }
      r3.fill(0);
    }, decrypt(e2, t2) {
      if (t2.length - 8 >= 2 ** 32) throw Error("ciphertext should be less than 4gb");
      const r3 = sr(e2), n3 = t2.length / 8 - 1;
      if (1 === n3) mr(r3, t2);
      else {
        const e3 = Bt(t2);
        let i3 = e3[0], s3 = e3[1];
        for (let t3 = 0, a3 = 6 * n3; t3 < 6; t3++) for (let t4 = 2 * n3; t4 >= 1; t4 -= 2, a3--) {
          s3 ^= $t(a3);
          const { s0: n4, s1: o3, s2: c3, s3: u2 } = ur(r3, i3, s3, e3[t4], e3[t4 + 1]);
          i3 = n4, s3 = o3, e3[t4] = c3, e3[t4 + 1] = u2;
        }
        e3[0] = i3, e3[1] = s3;
      }
      r3.fill(0);
    } };
    kr = /* @__PURE__ */ new Uint8Array(8).fill(166);
    Er = /* @__PURE__ */ Qt({ blockSize: 8 }, (e2) => ({ encrypt(t2) {
      if (!t2.length || t2.length % 8 != 0) throw Error("invalid plaintext length");
      if (8 === t2.length) throw Error("8-byte keys not allowed in AESKW, use AESKWP instead");
      const r3 = function(...e3) {
        let t3 = 0;
        for (let r5 = 0; r5 < e3.length; r5++) {
          const n3 = e3[r5];
          kt(n3), t3 += n3.length;
        }
        const r4 = new Uint8Array(t3);
        for (let t4 = 0, n3 = 0; t4 < e3.length; t4++) {
          const i3 = e3[t4];
          r4.set(i3, n3), n3 += i3.length;
        }
        return r4;
      }(kr, t2);
      return br.encrypt(e2, r3), r3;
    }, decrypt(t2) {
      if (t2.length % 8 != 0 || t2.length < 24) throw Error("invalid ciphertext length");
      const r3 = Tt(t2);
      if (br.decrypt(e2, r3), !xt(r3.subarray(0, 8), kr)) throw Error("integrity check failed");
      return r3.subarray(0, 8).fill(0), r3.subarray(8);
    } }));
    vr = { expandKeyLE: ir, expandKeyDecLE: sr, encrypt: cr, decrypt: ur, encryptBlock: wr, decryptBlock: mr, ctrCounter: hr, ctr32: fr };
    Cr = L.getWebCrypto();
    xr = { x25519: L.encodeUTF8("OpenPGP X25519"), x448: L.encodeUTF8("OpenPGP X448") };
    zr = /* @__PURE__ */ Object.freeze({ __proto__: null, decrypt: Fr, encrypt: Rr, generate: Qr, generateEphemeralEncryptionMaterial: Lr, getPayloadSize: Tr, recomputeSharedSecret: Nr, validateParams: Mr });
    Gr = L.getWebCrypto();
    jr = L.getNodeCrypto();
    Vr = { [R.curve.nistP256]: "P-256", [R.curve.nistP384]: "P-384", [R.curve.nistP521]: "P-521" };
    qr = jr ? jr.getCurves() : [];
    _r = jr ? { [R.curve.secp256k1]: qr.includes("secp256k1") ? "secp256k1" : void 0, [R.curve.nistP256]: qr.includes("prime256v1") ? "prime256v1" : void 0, [R.curve.nistP384]: qr.includes("secp384r1") ? "secp384r1" : void 0, [R.curve.nistP521]: qr.includes("secp521r1") ? "secp521r1" : void 0, [R.curve.ed25519Legacy]: qr.includes("ED25519") ? "ED25519" : void 0, [R.curve.curve25519Legacy]: qr.includes("X25519") ? "X25519" : void 0, [R.curve.brainpoolP256r1]: qr.includes("brainpoolP256r1") ? "brainpoolP256r1" : void 0, [R.curve.brainpoolP384r1]: qr.includes("brainpoolP384r1") ? "brainpoolP384r1" : void 0, [R.curve.brainpoolP512r1]: qr.includes("brainpoolP512r1") ? "brainpoolP512r1" : void 0 } : {};
    Yr = { [R.curve.nistP256]: { oid: [6, 8, 42, 134, 72, 206, 61, 3, 1, 7], keyType: R.publicKey.ecdsa, hash: R.hash.sha256, cipher: R.symmetric.aes128, node: _r[R.curve.nistP256], web: Vr[R.curve.nistP256], payloadSize: 32, sharedSize: 256, wireFormatLeadingByte: 4 }, [R.curve.nistP384]: { oid: [6, 5, 43, 129, 4, 0, 34], keyType: R.publicKey.ecdsa, hash: R.hash.sha384, cipher: R.symmetric.aes192, node: _r[R.curve.nistP384], web: Vr[R.curve.nistP384], payloadSize: 48, sharedSize: 384, wireFormatLeadingByte: 4 }, [R.curve.nistP521]: { oid: [6, 5, 43, 129, 4, 0, 35], keyType: R.publicKey.ecdsa, hash: R.hash.sha512, cipher: R.symmetric.aes256, node: _r[R.curve.nistP521], web: Vr[R.curve.nistP521], payloadSize: 66, sharedSize: 528, wireFormatLeadingByte: 4 }, [R.curve.secp256k1]: { oid: [6, 5, 43, 129, 4, 0, 10], keyType: R.publicKey.ecdsa, hash: R.hash.sha256, cipher: R.symmetric.aes128, node: _r[R.curve.secp256k1], payloadSize: 32, wireFormatLeadingByte: 4 }, [R.curve.ed25519Legacy]: { oid: [6, 9, 43, 6, 1, 4, 1, 218, 71, 15, 1], keyType: R.publicKey.eddsaLegacy, hash: R.hash.sha512, node: false, payloadSize: 32, wireFormatLeadingByte: 64 }, [R.curve.curve25519Legacy]: { oid: [6, 10, 43, 6, 1, 4, 1, 151, 85, 1, 5, 1], keyType: R.publicKey.ecdh, hash: R.hash.sha256, cipher: R.symmetric.aes128, node: false, payloadSize: 32, wireFormatLeadingByte: 64 }, [R.curve.brainpoolP256r1]: { oid: [6, 9, 43, 36, 3, 3, 2, 8, 1, 1, 7], keyType: R.publicKey.ecdsa, hash: R.hash.sha256, cipher: R.symmetric.aes128, node: _r[R.curve.brainpoolP256r1], payloadSize: 32, wireFormatLeadingByte: 4 }, [R.curve.brainpoolP384r1]: { oid: [6, 9, 43, 36, 3, 3, 2, 8, 1, 1, 11], keyType: R.publicKey.ecdsa, hash: R.hash.sha384, cipher: R.symmetric.aes192, node: _r[R.curve.brainpoolP384r1], payloadSize: 48, wireFormatLeadingByte: 4 }, [R.curve.brainpoolP512r1]: { oid: [6, 9, 43, 36, 3, 3, 2, 8, 1, 1, 13], keyType: R.publicKey.ecdsa, hash: R.hash.sha512, cipher: R.symmetric.aes256, node: _r[R.curve.brainpoolP512r1], payloadSize: 64, wireFormatLeadingByte: 4 } };
    Zr = class {
      constructor(e2) {
        try {
          this.name = e2 instanceof $e ? e2.getName() : R.write(R.curve, e2);
        } catch {
          throw new ot("Unknown curve");
        }
        const t2 = Yr[this.name];
        this.keyType = t2.keyType, this.oid = t2.oid, this.hash = t2.hash, this.cipher = t2.cipher, this.node = t2.node, this.web = t2.web, this.payloadSize = t2.payloadSize, this.sharedSize = t2.sharedSize, this.wireFormatLeadingByte = t2.wireFormatLeadingByte, this.web && L.getWebCrypto() ? this.type = "web" : this.node && L.getNodeCrypto() ? this.type = "node" : this.name === R.curve.curve25519Legacy ? this.type = "curve25519Legacy" : this.name === R.curve.ed25519Legacy && (this.type = "ed25519Legacy");
      }
      async genKeyPair() {
        switch (this.type) {
          case "web":
            try {
              return await async function(e2, t2) {
                const r3 = await Gr.generateKey({ name: "ECDSA", namedCurve: Vr[e2] }, true, ["sign", "verify"]), n3 = await Gr.exportKey("jwk", r3.privateKey);
                return { publicKey: tn(await Gr.exportKey("jwk", r3.publicKey), t2), privateKey: j(n3.d) };
              }(this.name, this.wireFormatLeadingByte);
            } catch (e2) {
              return L.printDebugError("Browser did not support generating ec key " + e2.message), en(this.name);
            }
          case "node":
            return function(e2) {
              const t2 = jr.createECDH(_r[e2]);
              return t2.generateKeys(), { publicKey: new Uint8Array(t2.getPublicKey()), privateKey: new Uint8Array(t2.getPrivateKey()) };
            }(this.name);
          case "curve25519Legacy": {
            const { k: e2, A: t2 } = await Qr(R.publicKey.x25519), r3 = e2.slice().reverse();
            r3[0] = 127 & r3[0] | 64, r3[31] &= 248;
            return { publicKey: L.concatUint8Array([new Uint8Array([this.wireFormatLeadingByte]), t2]), privateKey: r3 };
          }
          case "ed25519Legacy": {
            const { seed: e2, A: t2 } = await ft(R.publicKey.ed25519);
            return { publicKey: L.concatUint8Array([new Uint8Array([this.wireFormatLeadingByte]), t2]), privateKey: e2 };
          }
          default:
            return en(this.name);
        }
      }
    };
    sn = L.getWebCrypto();
    an = L.getNodeCrypto();
    hn = /* @__PURE__ */ Object.freeze({ __proto__: null, sign: on, validateParams: async function(e2, t2, r3) {
      const n3 = new Zr(e2);
      if (n3.keyType !== R.publicKey.ecdsa) return false;
      switch (n3.type) {
        case "web":
        case "node": {
          const n4 = pe(8), i3 = R.hash.sha256, s3 = await Re(i3, n4);
          try {
            const a3 = await on(e2, i3, n4, t2, r3, s3);
            return await cn(e2, i3, a3, n4, t2, s3);
          } catch {
            return false;
          }
        }
        default:
          return Xr(R.publicKey.ecdsa, e2, t2, r3);
      }
    }, verify: cn });
    gn = /* @__PURE__ */ Object.freeze({ __proto__: null, sign: fn, validateParams: yn, verify: ln });
    In = /* @__PURE__ */ Object.freeze({ __proto__: null, CurveWithOID: Zr, ecdh: /* @__PURE__ */ Object.freeze({ __proto__: null, decrypt: kn, encrypt: mn, validateParams: async function(e2, t2, r3) {
      return Xr(R.publicKey.ecdh, e2, t2, r3);
    } }), ecdhX: zr, ecdsa: hn, eddsa: mt, eddsaLegacy: gn, generate: Jr, getPreferredHashAlgo: Wr });
    Bn = BigInt(0);
    Sn = BigInt(1);
    Kn = class {
      constructor(e2) {
        e2 && (this.data = e2);
      }
      read(e2) {
        if (e2.length >= 1) {
          const t2 = e2[0];
          if (e2.length >= 1 + t2) return this.data = e2.subarray(1, 1 + t2), 1 + this.data.length;
        }
        throw Error("Invalid symmetric key");
      }
      write() {
        return L.concatUint8Array([new Uint8Array([this.data.length]), this.data]);
      }
    };
    Cn = class {
      constructor(e2) {
        if (e2) {
          const { hash: t2, cipher: r3 } = e2;
          this.hash = t2, this.cipher = r3;
        } else this.hash = null, this.cipher = null;
      }
      read(e2) {
        if (e2.length < 4 || 3 !== e2[0] || 1 !== e2[1]) throw new ot("Cannot read KDFParams");
        return this.hash = e2[2], this.cipher = e2[3], 4;
      }
      write() {
        return new Uint8Array([3, 1, this.hash, this.cipher]);
      }
    };
    Dn = class _Dn {
      static fromObject({ wrappedKey: e2, algorithm: t2 }) {
        const r3 = new _Dn();
        return r3.wrappedKey = e2, r3.algorithm = t2, r3;
      }
      read(e2) {
        let t2 = 0, r3 = e2[t2++];
        this.algorithm = r3 % 2 ? e2[t2++] : null, r3 -= r3 % 2, this.wrappedKey = L.readExactSubarray(e2, t2, t2 + r3), t2 += r3;
      }
      write() {
        return L.concatUint8Array([this.algorithm ? new Uint8Array([this.wrappedKey.length + 1, this.algorithm]) : new Uint8Array([this.wrappedKey.length]), this.wrappedKey]);
      }
    };
    Nn = L.getWebCrypto();
    On = L.getNodeCrypto();
    Hn = On ? On.getCiphers() : [];
    zn = { idea: Hn.includes("idea-cfb") ? "idea-cfb" : void 0, tripledes: Hn.includes("des-ede3-cfb") ? "des-ede3-cfb" : void 0, cast5: Hn.includes("cast5-cfb") ? "cast5-cfb" : void 0, blowfish: Hn.includes("bf-cfb") ? "bf-cfb" : void 0, aes128: Hn.includes("aes-128-cfb") ? "aes-128-cfb" : void 0, aes192: Hn.includes("aes-192-cfb") ? "aes-192-cfb" : void 0, aes256: Hn.includes("aes-256-cfb") ? "aes-256-cfb" : void 0 };
    qn = class {
      constructor(e2, t2, r3) {
        const { blockSize: n3 } = Kr(e2);
        this.key = t2, this.iv = r3, this.prevBlock = r3.slice(), this.nextBlock = new Uint8Array(n3), this.i = 0, this.blockSize = n3, this.zeroBlock = new Uint8Array(this.blockSize);
      }
      static isSupported(e2) {
        const { keySize: t2 } = Kr(e2);
        return Nn.importKey("raw", new Uint8Array(t2), "aes-cbc", false, ["encrypt"]).then(() => true, () => false);
      }
      async _runCBC(e2, t2) {
        const r3 = "AES-CBC";
        this.keyRef = this.keyRef || await Nn.importKey("raw", this.key, r3, false, ["encrypt"]);
        const n3 = await Nn.encrypt({ name: r3, iv: t2 || this.zeroBlock }, this.keyRef, e2);
        return new Uint8Array(n3).subarray(0, e2.length);
      }
      async encryptChunk(e2) {
        const t2 = this.nextBlock.length - this.i, r3 = e2.subarray(0, t2);
        if (this.nextBlock.set(r3, this.i), this.i + e2.length >= 2 * this.blockSize) {
          const r4 = (e2.length - t2) % this.blockSize, n4 = L.concatUint8Array([this.nextBlock, e2.subarray(t2, e2.length - r4)]), i3 = L.concatUint8Array([this.prevBlock, n4.subarray(0, n4.length - this.blockSize)]), s3 = await this._runCBC(i3);
          return Yn(s3, n4), this.prevBlock = s3.slice(-this.blockSize), r4 > 0 && this.nextBlock.set(e2.subarray(-r4)), this.i = r4, s3;
        }
        let n3;
        if (this.i += r3.length, this.i === this.nextBlock.length) {
          const t3 = this.nextBlock;
          n3 = await this._runCBC(this.prevBlock), Yn(n3, t3), this.prevBlock = n3.slice(), this.i = 0;
          const i3 = e2.subarray(r3.length);
          this.nextBlock.set(i3, this.i), this.i += i3.length;
        } else n3 = new Uint8Array();
        return n3;
      }
      async finish() {
        let e2;
        if (0 === this.i) e2 = new Uint8Array();
        else {
          this.nextBlock = this.nextBlock.subarray(0, this.i);
          const t2 = this.nextBlock, r3 = await this._runCBC(this.prevBlock);
          Yn(r3, t2), e2 = r3.subarray(0, t2.length);
        }
        return this.clearSensitiveData(), e2;
      }
      clearSensitiveData() {
        this.nextBlock.fill(0), this.prevBlock.fill(0), this.keyRef = null, this.key = null;
      }
      async encrypt(e2) {
        const t2 = (await this._runCBC(L.concatUint8Array([new Uint8Array(this.blockSize), e2]), this.iv)).subarray(0, e2.length);
        return Yn(t2, e2), this.clearSensitiveData(), t2;
      }
    };
    _n = class {
      constructor(e2, t2, r3, n3) {
        this.forEncryption = e2;
        const { blockSize: i3 } = Kr(t2);
        this.key = vr.expandKeyLE(r3), n3.byteOffset % 4 != 0 && (n3 = n3.slice()), this.prevBlock = Zn(n3), this.nextBlock = new Uint8Array(i3), this.i = 0, this.blockSize = i3;
      }
      _runCFB(e2) {
        const t2 = Zn(e2), r3 = new Uint8Array(e2.length), n3 = Zn(r3);
        for (let e3 = 0; e3 + 4 <= n3.length; e3 += 4) {
          const { s0: r4, s1: i3, s2: s3, s3: a3 } = vr.encrypt(this.key, this.prevBlock[0], this.prevBlock[1], this.prevBlock[2], this.prevBlock[3]);
          n3[e3 + 0] = t2[e3 + 0] ^ r4, n3[e3 + 1] = t2[e3 + 1] ^ i3, n3[e3 + 2] = t2[e3 + 2] ^ s3, n3[e3 + 3] = t2[e3 + 3] ^ a3, this.prevBlock = (this.forEncryption ? n3 : t2).slice(e3, e3 + 4);
        }
        return r3;
      }
      async processChunk(e2) {
        const t2 = this.nextBlock.length - this.i, r3 = e2.subarray(0, t2);
        if (this.nextBlock.set(r3, this.i), this.i + e2.length >= 2 * this.blockSize) {
          const r4 = (e2.length - t2) % this.blockSize, n4 = L.concatUint8Array([this.nextBlock, e2.subarray(t2, e2.length - r4)]), i3 = this._runCFB(n4);
          return r4 > 0 && this.nextBlock.set(e2.subarray(-r4)), this.i = r4, i3;
        }
        let n3;
        if (this.i += r3.length, this.i === this.nextBlock.length) {
          n3 = this._runCFB(this.nextBlock), this.i = 0;
          const t3 = e2.subarray(r3.length);
          this.nextBlock.set(t3, this.i), this.i += t3.length;
        } else n3 = new Uint8Array();
        return n3;
      }
      async finish() {
        let e2;
        if (0 === this.i) e2 = new Uint8Array();
        else {
          e2 = this._runCFB(this.nextBlock).subarray(0, this.i);
        }
        return this.clearSensitiveData(), e2;
      }
      clearSensitiveData() {
        this.nextBlock.fill(0), this.prevBlock.fill(0), this.key.fill(0);
      }
    };
    Zn = (e2) => new Uint32Array(e2.buffer, e2.byteOffset, Math.floor(e2.byteLength / 4));
    Jn = L.getWebCrypto();
    Wn = L.getNodeCrypto();
    Xn = 16;
    ei = new Uint8Array(Xn);
    ni = L.getWebCrypto();
    ii = L.getNodeCrypto();
    si = L.getNodeBuffer();
    ai = 16;
    oi = ai;
    ci = new Uint8Array(ai);
    ui = new Uint8Array(ai);
    ui[15] = 1;
    hi = new Uint8Array(ai);
    hi[15] = 2, yi.getNonce = function(e2, t2) {
      const r3 = e2.slice();
      for (let e3 = 0; e3 < t2.length; e3++) r3[8 + e3] ^= t2[e3];
      return r3;
    }, yi.blockLength = ai, yi.ivLength = 16, yi.tagLength = oi;
    gi = 16;
    pi = 16;
    mi = new Uint8Array(gi);
    bi = new Uint8Array([1]);
    ki.getNonce = function(e2, t2) {
      const r3 = e2.slice();
      for (let e3 = 0; e3 < t2.length; e3++) r3[7 + e3] ^= t2[e3];
      return r3;
    }, ki.blockLength = gi, ki.ivLength = 15, ki.tagLength = pi;
    Ei = L.getWebCrypto();
    vi = L.getNodeCrypto();
    Ii = L.getNodeBuffer();
    Bi = 16;
    Si = "AES-GCM";
    Ki.getNonce = function(e2, t2) {
      const r3 = e2.slice();
      for (let e3 = 0; e3 < t2.length; e3++) r3[4 + e3] ^= t2[e3];
      return r3;
    }, Ki.blockLength = 16, Ki.ivLength = 12, Ki.tagLength = Bi;
    Pi = class _Pi extends Error {
      constructor(...e2) {
        super(...e2), Error.captureStackTrace && Error.captureStackTrace(this, _Pi), this.name = "Argon2OutOfMemoryError";
      }
    };
    Mi = class {
      constructor(e2 = F) {
        const { passes: t2, parallelism: r3, memoryExponent: n3 } = e2.s2kArgon2Params;
        this.type = "argon2", this.salt = null, this.t = t2, this.p = r3, this.encodedM = n3;
      }
      generateSalt() {
        this.salt = pe(16);
      }
      read(e2) {
        let t2 = 0;
        return this.salt = e2.subarray(t2, t2 + 16), t2 += 16, this.t = e2[t2++], this.p = e2[t2++], this.encodedM = e2[t2++], t2;
      }
      write() {
        const e2 = [new Uint8Array([R.write(R.s2k, this.type)]), this.salt, new Uint8Array([this.t, this.p, this.encodedM])];
        return L.concatUint8Array(e2);
      }
      async produceKey(e2, t2, r3) {
        if (r3.maxArgon2MemoryExponent > 30) throw new Pi("'config.maxArgon2MemoryExponent' exceeds the max allowed value of 30");
        if (this.encodedM > r3.maxArgon2MemoryExponent) throw new Pi("Argon2 required memory exceeds `config.maxArgon2MemoryExponent`");
        const n3 = 1 << this.encodedM;
        try {
          xi = xi || (await Promise.resolve().then(function() {
            return _y;
          })).default, Qi = Qi || xi();
          const r4 = await Qi, i3 = r4({ version: 19, type: 2, password: L.encodeUTF8(e2), salt: this.salt, tagLength: t2, memorySize: n3, parallelism: this.p, passes: this.t });
          return n3 > 1048576 && (Qi = xi(), Qi.catch(() => {
          })), i3;
        } catch (e3) {
          throw e3.message && (e3.message.includes("Unable to grow instance memory") || e3.message.includes("failed to grow memory") || e3.message.includes("WebAssembly.Memory.grow") || e3.message.includes("Out of memory")) ? new Pi("Could not allocate required memory for Argon2") : e3;
        }
      }
    };
    Ri = class {
      constructor(e2, t2 = F) {
        this.algorithm = R.hash.sha256, this.type = R.read(R.s2k, e2), this.c = t2.s2kIterationCountByte, this.salt = null;
      }
      generateSalt() {
        switch (this.type) {
          case "salted":
          case "iterated":
            this.salt = pe(8);
        }
      }
      getCount() {
        return 16 + (15 & this.c) << 6 + (this.c >> 4);
      }
      read(e2) {
        let t2 = 0;
        switch (this.algorithm = e2[t2++], this.type) {
          case "simple":
            break;
          case "salted":
            this.salt = e2.subarray(t2, t2 + 8), t2 += 8;
            break;
          case "iterated":
            this.salt = e2.subarray(t2, t2 + 8), t2 += 8, this.c = e2[t2++];
            break;
          case "gnu":
            if ("GNU" !== L.uint8ArrayToString(e2.subarray(t2, t2 + 3))) throw new ot("Unknown s2k type.");
            t2 += 3;
            if (1001 !== 1e3 + e2[t2++]) throw new ot("Unknown s2k gnu protection mode.");
            this.type = "gnu-dummy";
            break;
          default:
            throw new ot("Unknown s2k type.");
        }
        return t2;
      }
      write() {
        if ("gnu-dummy" === this.type) return new Uint8Array([101, 0, ...L.stringToUint8Array("GNU"), 1]);
        const e2 = [new Uint8Array([R.write(R.s2k, this.type), this.algorithm])];
        switch (this.type) {
          case "simple":
            break;
          case "salted":
            e2.push(this.salt);
            break;
          case "iterated":
            e2.push(this.salt), e2.push(new Uint8Array([this.c]));
            break;
          case "gnu":
            throw Error("GNU s2k type not supported.");
          default:
            throw Error("Unknown s2k type.");
        }
        return L.concatUint8Array(e2);
      }
      async produceKey(e2, t2, r3) {
        e2 = L.encodeUTF8(e2);
        const n3 = [];
        let i3 = 0, s3 = 0;
        for (; i3 < t2; ) {
          let t3;
          switch (this.type) {
            case "simple":
              t3 = L.concatUint8Array([new Uint8Array(s3), e2]);
              break;
            case "salted":
              t3 = L.concatUint8Array([new Uint8Array(s3), this.salt, e2]);
              break;
            case "iterated": {
              const r5 = L.concatUint8Array([this.salt, e2]);
              let n4 = r5.length;
              const i4 = Math.max(this.getCount(), n4);
              t3 = new Uint8Array(s3 + i4), t3.set(r5, s3);
              for (let e3 = s3 + n4; e3 < i4; e3 += n4, n4 *= 2) t3.copyWithin(e3, s3, e3);
              break;
            }
            case "gnu":
              throw Error("GNU s2k type not supported.");
            default:
              throw Error("Unknown s2k type.");
          }
          const r4 = await Re(this.algorithm, t3);
          n3.push(r4), i3 += r4.length, s3++;
        }
        return L.concatUint8Array(n3).subarray(0, t2);
      }
    };
    Fi = /* @__PURE__ */ new Set([R.s2k.argon2, R.s2k.iterated]);
    Ni = Uint8Array;
    Oi = Uint16Array;
    Hi = Int32Array;
    zi = new Ni([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0]);
    Gi = new Ni([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0]);
    ji = new Ni([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
    Vi = function(e2, t2) {
      for (var r3 = new Oi(31), n3 = 0; n3 < 31; ++n3) r3[n3] = t2 += 1 << e2[n3 - 1];
      var i3 = new Hi(r3[30]);
      for (n3 = 1; n3 < 30; ++n3) for (var s3 = r3[n3]; s3 < r3[n3 + 1]; ++s3) i3[s3] = s3 - r3[n3] << 5 | n3;
      return { b: r3, r: i3 };
    };
    qi = Vi(zi, 2);
    _i = qi.b;
    Yi = qi.r;
    _i[28] = 258, Yi[258] = 28;
    for (Zi = Vi(Gi, 0), Ji = Zi.b, Wi = Zi.r, Xi = new Oi(32768), $i = 0; $i < 32768; ++$i) {
      es = (43690 & $i) >> 1 | (21845 & $i) << 1;
      es = (61680 & (es = (52428 & es) >> 2 | (13107 & es) << 2)) >> 4 | (3855 & es) << 4, Xi[$i] = ((65280 & es) >> 8 | (255 & es) << 8) >> 1;
    }
    ts = function(e2, t2, r3) {
      for (var n3 = e2.length, i3 = 0, s3 = new Oi(t2); i3 < n3; ++i3) e2[i3] && ++s3[e2[i3] - 1];
      var a3, o3 = new Oi(t2);
      for (i3 = 1; i3 < t2; ++i3) o3[i3] = o3[i3 - 1] + s3[i3 - 1] << 1;
      if (r3) {
        a3 = new Oi(1 << t2);
        var c3 = 15 - t2;
        for (i3 = 0; i3 < n3; ++i3) if (e2[i3]) for (var u2 = i3 << 4 | e2[i3], h4 = t2 - e2[i3], f2 = o3[e2[i3] - 1]++ << h4, l2 = f2 | (1 << h4) - 1; f2 <= l2; ++f2) a3[Xi[f2] >> c3] = u2;
      } else for (a3 = new Oi(n3), i3 = 0; i3 < n3; ++i3) e2[i3] && (a3[i3] = Xi[o3[e2[i3] - 1]++] >> 15 - e2[i3]);
      return a3;
    };
    rs = new Ni(288);
    for ($i = 0; $i < 144; ++$i) rs[$i] = 8;
    for ($i = 144; $i < 256; ++$i) rs[$i] = 9;
    for ($i = 256; $i < 280; ++$i) rs[$i] = 7;
    for ($i = 280; $i < 288; ++$i) rs[$i] = 8;
    ns = new Ni(32);
    for ($i = 0; $i < 32; ++$i) ns[$i] = 5;
    is = /* @__PURE__ */ ts(rs, 9, 0);
    ss = /* @__PURE__ */ ts(rs, 9, 1);
    as = /* @__PURE__ */ ts(ns, 5, 0);
    os = /* @__PURE__ */ ts(ns, 5, 1);
    cs = function(e2) {
      for (var t2 = e2[0], r3 = 1; r3 < e2.length; ++r3) e2[r3] > t2 && (t2 = e2[r3]);
      return t2;
    };
    us = function(e2, t2, r3) {
      var n3 = t2 / 8 | 0;
      return (e2[n3] | e2[n3 + 1] << 8) >> (7 & t2) & r3;
    };
    hs = function(e2, t2) {
      var r3 = t2 / 8 | 0;
      return (e2[r3] | e2[r3 + 1] << 8 | e2[r3 + 2] << 16) >> (7 & t2);
    };
    fs = function(e2) {
      return (e2 + 7) / 8 | 0;
    };
    ls = function(e2, t2, r3) {
      return (null == t2 || t2 < 0) && (t2 = 0), (null == r3 || r3 > e2.length) && (r3 = e2.length), new Ni(e2.subarray(t2, r3));
    };
    ys = ["unexpected EOF", "invalid block type", "invalid length/literal", "invalid distance", "stream finished", "no stream handler", , "no callback", "invalid UTF-8 data", "extra field too long", "date not in range 1980-2099", "filename too long", "stream finishing", "invalid zip data"];
    gs = function(e2, t2, r3) {
      var n3 = Error(t2 || ys[e2]);
      if (n3.code = e2, Error.captureStackTrace && Error.captureStackTrace(n3, gs), !r3) throw n3;
      return n3;
    };
    ps = function(e2, t2, r3) {
      r3 <<= 7 & t2;
      var n3 = t2 / 8 | 0;
      e2[n3] |= r3, e2[n3 + 1] |= r3 >> 8;
    };
    ds = function(e2, t2, r3) {
      r3 <<= 7 & t2;
      var n3 = t2 / 8 | 0;
      e2[n3] |= r3, e2[n3 + 1] |= r3 >> 8, e2[n3 + 2] |= r3 >> 16;
    };
    As = function(e2, t2) {
      for (var r3 = [], n3 = 0; n3 < e2.length; ++n3) e2[n3] && r3.push({ s: n3, f: e2[n3] });
      var i3 = r3.length, s3 = r3.slice();
      if (!i3) return { t: Is, l: 0 };
      if (1 == i3) {
        var a3 = new Ni(r3[0].s + 1);
        return a3[r3[0].s] = 1, { t: a3, l: 1 };
      }
      r3.sort(function(e3, t3) {
        return e3.f - t3.f;
      }), r3.push({ s: -1, f: 25001 });
      var o3 = r3[0], c3 = r3[1], u2 = 0, h4 = 1, f2 = 2;
      for (r3[0] = { s: -1, f: o3.f + c3.f, l: o3, r: c3 }; h4 != i3 - 1; ) o3 = r3[r3[u2].f < r3[f2].f ? u2++ : f2++], c3 = r3[u2 != h4 && r3[u2].f < r3[f2].f ? u2++ : f2++], r3[h4++] = { s: -1, f: o3.f + c3.f, l: o3, r: c3 };
      var l2 = s3[0].s;
      for (n3 = 1; n3 < i3; ++n3) s3[n3].s > l2 && (l2 = s3[n3].s);
      var y2 = new Oi(l2 + 1), g2 = ws(r3[h4 - 1], y2, 0);
      if (g2 > t2) {
        n3 = 0;
        var p2 = 0, d3 = g2 - t2, A2 = 1 << d3;
        for (s3.sort(function(e3, t3) {
          return y2[t3.s] - y2[e3.s] || e3.f - t3.f;
        }); n3 < i3; ++n3) {
          var w2 = s3[n3].s;
          if (!(y2[w2] > t2)) break;
          p2 += A2 - (1 << g2 - y2[w2]), y2[w2] = t2;
        }
        for (p2 >>= d3; p2 > 0; ) {
          var m2 = s3[n3].s;
          y2[m2] < t2 ? p2 -= 1 << t2 - y2[m2]++ - 1 : ++n3;
        }
        for (; n3 >= 0 && p2; --n3) {
          var b2 = s3[n3].s;
          y2[b2] == t2 && (--y2[b2], ++p2);
        }
        g2 = t2;
      }
      return { t: new Ni(y2), l: g2 };
    };
    ws = function(e2, t2, r3) {
      return -1 == e2.s ? Math.max(ws(e2.l, t2, r3 + 1), ws(e2.r, t2, r3 + 1)) : t2[e2.s] = r3;
    };
    ms = function(e2) {
      for (var t2 = e2.length; t2 && !e2[--t2]; ) ;
      for (var r3 = new Oi(++t2), n3 = 0, i3 = e2[0], s3 = 1, a3 = function(e3) {
        r3[n3++] = e3;
      }, o3 = 1; o3 <= t2; ++o3) if (e2[o3] == i3 && o3 != t2) ++s3;
      else {
        if (!i3 && s3 > 2) {
          for (; s3 > 138; s3 -= 138) a3(32754);
          s3 > 2 && (a3(s3 > 10 ? s3 - 11 << 5 | 28690 : s3 - 3 << 5 | 12305), s3 = 0);
        } else if (s3 > 3) {
          for (a3(i3), --s3; s3 > 6; s3 -= 6) a3(8304);
          s3 > 2 && (a3(s3 - 3 << 5 | 8208), s3 = 0);
        }
        for (; s3--; ) a3(i3);
        s3 = 1, i3 = e2[o3];
      }
      return { c: r3.subarray(0, n3), n: t2 };
    };
    bs = function(e2, t2) {
      for (var r3 = 0, n3 = 0; n3 < t2.length; ++n3) r3 += e2[n3] * t2[n3];
      return r3;
    };
    ks = function(e2, t2, r3) {
      var n3 = r3.length, i3 = fs(t2 + 2);
      e2[i3] = 255 & n3, e2[i3 + 1] = n3 >> 8, e2[i3 + 2] = 255 ^ e2[i3], e2[i3 + 3] = 255 ^ e2[i3 + 1];
      for (var s3 = 0; s3 < n3; ++s3) e2[i3 + s3 + 4] = r3[s3];
      return 8 * (i3 + 4 + n3);
    };
    Es = function(e2, t2, r3, n3, i3, s3, a3, o3, c3, u2, h4) {
      ps(t2, h4++, r3), ++i3[256];
      for (var f2 = As(i3, 15), l2 = f2.t, y2 = f2.l, g2 = As(s3, 15), p2 = g2.t, d3 = g2.l, A2 = ms(l2), w2 = A2.c, m2 = A2.n, b2 = ms(p2), k2 = b2.c, E2 = b2.n, v2 = new Oi(19), I2 = 0; I2 < w2.length; ++I2) ++v2[31 & w2[I2]];
      for (I2 = 0; I2 < k2.length; ++I2) ++v2[31 & k2[I2]];
      for (var B2 = As(v2, 7), S2 = B2.t, K2 = B2.l, C2 = 19; C2 > 4 && !S2[ji[C2 - 1]]; --C2) ;
      var D2, U2, P2, x2, Q2 = u2 + 5 << 3, M2 = bs(i3, rs) + bs(s3, ns) + a3, R2 = bs(i3, l2) + bs(s3, p2) + a3 + 14 + 3 * C2 + bs(v2, S2) + 2 * v2[16] + 3 * v2[17] + 7 * v2[18];
      if (c3 >= 0 && Q2 <= M2 && Q2 <= R2) return ks(t2, h4, e2.subarray(c3, c3 + u2));
      if (ps(t2, h4, 1 + (R2 < M2)), h4 += 2, R2 < M2) {
        D2 = ts(l2, y2, 0), U2 = l2, P2 = ts(p2, d3, 0), x2 = p2;
        var F2 = ts(S2, K2, 0);
        ps(t2, h4, m2 - 257), ps(t2, h4 + 5, E2 - 1), ps(t2, h4 + 10, C2 - 4), h4 += 14;
        for (I2 = 0; I2 < C2; ++I2) ps(t2, h4 + 3 * I2, S2[ji[I2]]);
        h4 += 3 * C2;
        for (var T2 = [w2, k2], L2 = 0; L2 < 2; ++L2) {
          var N2 = T2[L2];
          for (I2 = 0; I2 < N2.length; ++I2) {
            var O2 = 31 & N2[I2];
            ps(t2, h4, F2[O2]), h4 += S2[O2], O2 > 15 && (ps(t2, h4, N2[I2] >> 5 & 127), h4 += N2[I2] >> 12);
          }
        }
      } else D2 = is, U2 = rs, P2 = as, x2 = ns;
      for (I2 = 0; I2 < o3; ++I2) {
        var H2 = n3[I2];
        if (H2 > 255) {
          ds(t2, h4, D2[(O2 = H2 >> 18 & 31) + 257]), h4 += U2[O2 + 257], O2 > 7 && (ps(t2, h4, H2 >> 23 & 31), h4 += zi[O2]);
          var z2 = 31 & H2;
          ds(t2, h4, P2[z2]), h4 += x2[z2], z2 > 3 && (ds(t2, h4, H2 >> 5 & 8191), h4 += Gi[z2]);
        } else ds(t2, h4, D2[H2]), h4 += U2[H2];
      }
      return ds(t2, h4, D2[256]), h4 + U2[256];
    };
    vs = /* @__PURE__ */ new Hi([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
    Is = /* @__PURE__ */ new Ni(0);
    Bs = function() {
      var e2 = 1, t2 = 0;
      return { p: function(r3) {
        for (var n3 = e2, i3 = t2, s3 = 0 | r3.length, a3 = 0; a3 != s3; ) {
          for (var o3 = Math.min(a3 + 2655, s3); a3 < o3; ++a3) i3 += n3 += r3[a3];
          n3 = (65535 & n3) + 15 * (n3 >> 16), i3 = (65535 & i3) + 15 * (i3 >> 16);
        }
        e2 = n3, t2 = i3;
      }, d: function() {
        return (255 & (e2 %= 65521)) << 24 | (65280 & e2) << 8 | (255 & (t2 %= 65521)) << 8 | t2 >> 8;
      } };
    };
    Ss = function(e2, t2, r3, n3, i3) {
      if (!i3 && (i3 = { l: 1 }, t2.dictionary)) {
        var s3 = t2.dictionary.subarray(-32768), a3 = new Ni(s3.length + e2.length);
        a3.set(s3), a3.set(e2, s3.length), e2 = a3, i3.w = s3.length;
      }
      return function(e3, t3, r4, n4, i4, s4) {
        var a4 = s4.z || e3.length, o3 = new Ni(n4 + a4 + 5 * (1 + Math.ceil(a4 / 7e3)) + i4), c3 = o3.subarray(n4, o3.length - i4), u2 = s4.l, h4 = 7 & (s4.r || 0);
        if (t3) {
          h4 && (c3[0] = s4.r >> 3);
          for (var f2 = vs[t3 - 1], l2 = f2 >> 13, y2 = 8191 & f2, g2 = (1 << r4) - 1, p2 = s4.p || new Oi(32768), d3 = s4.h || new Oi(g2 + 1), A2 = Math.ceil(r4 / 3), w2 = 2 * A2, m2 = function(t4) {
            return (e3[t4] ^ e3[t4 + 1] << A2 ^ e3[t4 + 2] << w2) & g2;
          }, b2 = new Hi(25e3), k2 = new Oi(288), E2 = new Oi(32), v2 = 0, I2 = 0, B2 = s4.i || 0, S2 = 0, K2 = s4.w || 0, C2 = 0; B2 + 2 < a4; ++B2) {
            var D2 = m2(B2), U2 = 32767 & B2, P2 = d3[D2];
            if (p2[U2] = P2, d3[D2] = U2, K2 <= B2) {
              var x2 = a4 - B2;
              if ((v2 > 7e3 || S2 > 24576) && (x2 > 423 || !u2)) {
                h4 = Es(e3, c3, 0, b2, k2, E2, I2, S2, C2, B2 - C2, h4), S2 = v2 = I2 = 0, C2 = B2;
                for (var Q2 = 0; Q2 < 286; ++Q2) k2[Q2] = 0;
                for (Q2 = 0; Q2 < 30; ++Q2) E2[Q2] = 0;
              }
              var M2 = 2, R2 = 0, F2 = y2, T2 = U2 - P2 & 32767;
              if (x2 > 2 && D2 == m2(B2 - T2)) for (var L2 = Math.min(l2, x2) - 1, N2 = Math.min(32767, B2), O2 = Math.min(258, x2); T2 <= N2 && --F2 && U2 != P2; ) {
                if (e3[B2 + M2] == e3[B2 + M2 - T2]) {
                  for (var H2 = 0; H2 < O2 && e3[B2 + H2] == e3[B2 + H2 - T2]; ++H2) ;
                  if (H2 > M2) {
                    if (M2 = H2, R2 = T2, H2 > L2) break;
                    var z2 = Math.min(T2, H2 - 2), G2 = 0;
                    for (Q2 = 0; Q2 < z2; ++Q2) {
                      var j2 = B2 - T2 + Q2 & 32767, V2 = j2 - p2[j2] & 32767;
                      V2 > G2 && (G2 = V2, P2 = j2);
                    }
                  }
                }
                T2 += (U2 = P2) - (P2 = p2[U2]) & 32767;
              }
              if (R2) {
                b2[S2++] = 268435456 | Yi[M2] << 18 | Wi[R2];
                var q2 = 31 & Yi[M2], _2 = 31 & Wi[R2];
                I2 += zi[q2] + Gi[_2], ++k2[257 + q2], ++E2[_2], K2 = B2 + M2, ++v2;
              } else b2[S2++] = e3[B2], ++k2[e3[B2]];
            }
          }
          for (B2 = Math.max(B2, K2); B2 < a4; ++B2) b2[S2++] = e3[B2], ++k2[e3[B2]];
          h4 = Es(e3, c3, u2, b2, k2, E2, I2, S2, C2, B2 - C2, h4), u2 || (s4.r = 7 & h4 | c3[h4 / 8 | 0] << 3, h4 -= 7, s4.h = d3, s4.p = p2, s4.i = B2, s4.w = K2);
        } else {
          for (B2 = s4.w || 0; B2 < a4 + u2; B2 += 65535) {
            var Y2 = B2 + 65535;
            Y2 >= a4 && (c3[h4 / 8 | 0] = u2, Y2 = a4), h4 = ks(c3, h4 + 1, e3.subarray(B2, Y2));
          }
          s4.i = a4;
        }
        return ls(o3, 0, n4 + fs(h4) + i4);
      }(e2, null == t2.level ? 6 : t2.level, null == t2.mem ? i3.l ? Math.ceil(1.5 * Math.max(8, Math.min(13, Math.log(e2.length)))) : 20 : 12 + t2.mem, r3, n3, i3);
    };
    Ks = function(e2, t2, r3) {
      for (; r3; ++t2) e2[t2] = r3, r3 >>>= 8;
    };
    Cs = /* @__PURE__ */ function() {
      function e2(e3, t2) {
        if ("function" == typeof e3 && (t2 = e3, e3 = {}), this.ondata = t2, this.o = e3 || {}, this.s = { l: 0, i: 32768, w: 32768, z: 32768 }, this.b = new Ni(98304), this.o.dictionary) {
          var r3 = this.o.dictionary.subarray(-32768);
          this.b.set(r3, 32768 - r3.length), this.s.i = 32768 - r3.length;
        }
      }
      return e2.prototype.p = function(e3, t2) {
        this.ondata(Ss(e3, this.o, 0, 0, this.s), t2);
      }, e2.prototype.push = function(e3, t2) {
        this.ondata || gs(5), this.s.l && gs(4);
        var r3 = e3.length + this.s.z;
        if (r3 > this.b.length) {
          if (r3 > 2 * this.b.length - 32768) {
            var n3 = new Ni(-32768 & r3);
            n3.set(this.b.subarray(0, this.s.z)), this.b = n3;
          }
          var i3 = this.b.length - this.s.z;
          this.b.set(e3.subarray(0, i3), this.s.z), this.s.z = this.b.length, this.p(this.b, false), this.b.set(this.b.subarray(-32768)), this.b.set(e3.subarray(i3), 32768), this.s.z = e3.length - i3 + 32768, this.s.i = 32766, this.s.w = 32768;
        } else this.b.set(e3, this.s.z), this.s.z += e3.length;
        this.s.l = 1 & t2, (this.s.z > this.s.w + 8191 || t2) && (this.p(this.b, t2 || false), this.s.w = this.s.i, this.s.i -= 2), t2 && (this.s = this.o = {}, this.b = Is);
      }, e2.prototype.flush = function(e3) {
        if (this.ondata || gs(5), this.s.l && gs(4), this.p(this.b, false), this.s.w = this.s.i, this.s.i -= 2, e3) {
          var t2 = new Ni(6);
          t2[0] = this.s.r >> 3;
          var r3 = ks(t2, this.s.r, Is);
          this.s.r = 0, this.ondata(t2.subarray(0, r3 >> 3), false);
        }
      }, e2;
    }();
    Ds = /* @__PURE__ */ function() {
      function e2(e3, t2) {
        "function" == typeof e3 && (t2 = e3, e3 = {}), this.ondata = t2;
        var r3 = e3 && e3.dictionary && e3.dictionary.subarray(-32768);
        this.s = { i: 0, b: r3 ? r3.length : 0 }, this.o = new Ni(32768), this.p = new Ni(0), r3 && this.o.set(r3);
      }
      return e2.prototype.e = function(e3) {
        if (this.ondata || gs(5), this.d && gs(4), this.p.length) {
          if (e3.length) {
            var t2 = new Ni(this.p.length + e3.length);
            t2.set(this.p), t2.set(e3, this.p.length), this.p = t2;
          }
        } else this.p = e3;
      }, e2.prototype.c = function(e3) {
        this.s.i = +(this.d = e3 || false);
        var t2 = this.s.b, r3 = function(e4, t3, r4, n3) {
          var i3 = e4.length;
          if (!i3 || t3.f && !t3.l) return r4 || new Ni(0);
          var s3 = !r4, a3 = s3 || 2 != t3.i, o3 = t3.i;
          s3 && (r4 = new Ni(3 * i3));
          var c3 = function(e5) {
            var t4 = r4.length;
            if (e5 > t4) {
              var n4 = new Ni(Math.max(2 * t4, e5));
              n4.set(r4), r4 = n4;
            }
          }, u2 = t3.f || 0, h4 = t3.p || 0, f2 = t3.b || 0, l2 = t3.l, y2 = t3.d, g2 = t3.m, p2 = t3.n, d3 = 8 * i3;
          do {
            if (!l2) {
              u2 = us(e4, h4, 1);
              var A2 = us(e4, h4 + 1, 3);
              if (h4 += 3, !A2) {
                var w2 = e4[(D2 = fs(h4) + 4) - 4] | e4[D2 - 3] << 8, m2 = D2 + w2;
                if (m2 > i3) {
                  o3 && gs(0);
                  break;
                }
                a3 && c3(f2 + w2), r4.set(e4.subarray(D2, m2), f2), t3.b = f2 += w2, t3.p = h4 = 8 * m2, t3.f = u2;
                continue;
              }
              if (1 == A2) l2 = ss, y2 = os, g2 = 9, p2 = 5;
              else if (2 == A2) {
                var b2 = us(e4, h4, 31) + 257, k2 = us(e4, h4 + 10, 15) + 4, E2 = b2 + us(e4, h4 + 5, 31) + 1;
                h4 += 14;
                for (var v2 = new Ni(E2), I2 = new Ni(19), B2 = 0; B2 < k2; ++B2) I2[ji[B2]] = us(e4, h4 + 3 * B2, 7);
                h4 += 3 * k2;
                var S2 = cs(I2), K2 = (1 << S2) - 1, C2 = ts(I2, S2, 1);
                for (B2 = 0; B2 < E2; ) {
                  var D2, U2 = C2[us(e4, h4, K2)];
                  if (h4 += 15 & U2, (D2 = U2 >> 4) < 16) v2[B2++] = D2;
                  else {
                    var P2 = 0, x2 = 0;
                    for (16 == D2 ? (x2 = 3 + us(e4, h4, 3), h4 += 2, P2 = v2[B2 - 1]) : 17 == D2 ? (x2 = 3 + us(e4, h4, 7), h4 += 3) : 18 == D2 && (x2 = 11 + us(e4, h4, 127), h4 += 7); x2--; ) v2[B2++] = P2;
                  }
                }
                var Q2 = v2.subarray(0, b2), M2 = v2.subarray(b2);
                g2 = cs(Q2), p2 = cs(M2), l2 = ts(Q2, g2, 1), y2 = ts(M2, p2, 1);
              } else gs(1);
              if (h4 > d3) {
                o3 && gs(0);
                break;
              }
            }
            a3 && c3(f2 + 131072);
            for (var R2 = (1 << g2) - 1, F2 = (1 << p2) - 1, T2 = h4; ; T2 = h4) {
              var L2 = (P2 = l2[hs(e4, h4) & R2]) >> 4;
              if ((h4 += 15 & P2) > d3) {
                o3 && gs(0);
                break;
              }
              if (P2 || gs(2), L2 < 256) r4[f2++] = L2;
              else {
                if (256 == L2) {
                  T2 = h4, l2 = null;
                  break;
                }
                var N2 = L2 - 254;
                if (L2 > 264) {
                  var O2 = zi[B2 = L2 - 257];
                  N2 = us(e4, h4, (1 << O2) - 1) + _i[B2], h4 += O2;
                }
                var H2 = y2[hs(e4, h4) & F2], z2 = H2 >> 4;
                if (H2 || gs(3), h4 += 15 & H2, M2 = Ji[z2], z2 > 3 && (O2 = Gi[z2], M2 += hs(e4, h4) & (1 << O2) - 1, h4 += O2), h4 > d3) {
                  o3 && gs(0);
                  break;
                }
                a3 && c3(f2 + 131072);
                var G2 = f2 + N2;
                if (f2 < M2) {
                  var j2 = 0 - M2, V2 = Math.min(M2, G2);
                  for (j2 + f2 < 0 && gs(3); f2 < V2; ++f2) r4[f2] = n3[j2 + f2];
                }
                for (; f2 < G2; ++f2) r4[f2] = r4[f2 - M2];
              }
            }
            t3.l = l2, t3.p = T2, t3.b = f2, t3.f = u2, l2 && (u2 = 1, t3.m = g2, t3.d = y2, t3.n = p2);
          } while (!u2);
          return f2 != r4.length && s3 ? ls(r4, 0, f2) : r4.subarray(0, f2);
        }(this.p, this.s, this.o);
        this.ondata(ls(r3, t2, this.s.b), this.d), this.o = ls(r3, this.s.b - 32768), this.s.b = this.o.length, this.p = ls(this.p, this.s.p / 8 | 0), this.s.p &= 7;
      }, e2.prototype.push = function(e3, t2) {
        this.e(e3), this.c(t2);
      }, e2;
    }();
    Us = /* @__PURE__ */ function() {
      function e2(e3, t2) {
        this.c = Bs(), this.v = 1, Cs.call(this, e3, t2);
      }
      return e2.prototype.push = function(e3, t2) {
        this.c.p(e3), Cs.prototype.push.call(this, e3, t2);
      }, e2.prototype.p = function(e3, t2) {
        var r3 = Ss(e3, this.o, this.v && (this.o.dictionary ? 6 : 2), t2 && 4, this.s);
        this.v && (function(e4, t3) {
          var r4 = t3.level, n3 = 0 == r4 ? 0 : r4 < 6 ? 1 : 9 == r4 ? 3 : 2;
          if (e4[0] = 120, e4[1] = n3 << 6 | (t3.dictionary && 32), e4[1] |= 31 - (e4[0] << 8 | e4[1]) % 31, t3.dictionary) {
            var i3 = Bs();
            i3.p(t3.dictionary), Ks(e4, 2, i3.d());
          }
        }(r3, this.o), this.v = 0), t2 && Ks(r3, r3.length - 4, this.c.d()), this.ondata(r3, t2);
      }, e2.prototype.flush = function(e3) {
        Cs.prototype.flush.call(this, e3);
      }, e2;
    }();
    Ps = /* @__PURE__ */ function() {
      function e2(e3, t2) {
        Ds.call(this, e3, t2), this.v = e3 && e3.dictionary ? 2 : 1;
      }
      return e2.prototype.push = function(e3, t2) {
        if (Ds.prototype.e.call(this, e3), this.v) {
          if (this.p.length < 6 && !t2) return;
          this.p = this.p.subarray((r3 = this.p, n3 = this.v - 1, (8 != (15 & r3[0]) || r3[0] >> 4 > 7 || (r3[0] << 8 | r3[1]) % 31) && gs(6, "invalid zlib data"), (r3[1] >> 5 & 1) == +!n3 && gs(6, "invalid zlib data: " + (32 & r3[1] ? "need" : "unexpected") + " dictionary"), 2 + (r3[1] >> 3 & 4))), this.v = 0;
        }
        var r3, n3;
        t2 && (this.p.length < 4 && gs(6, "invalid zlib data"), this.p = this.p.subarray(0, -4)), Ds.prototype.c.call(this, t2);
      }, e2;
    }();
    xs = "undefined" != typeof TextDecoder && /* @__PURE__ */ new TextDecoder();
    try {
      xs.decode(Is, { stream: true });
    } catch (e2) {
    }
    Qs = class {
      static get tag() {
        return R.packet.literalData;
      }
      constructor(e2 = /* @__PURE__ */ new Date()) {
        this.format = R.literal.utf8, this.date = L.normalizeDate(e2), this.text = null, this.data = null, this.filename = "";
      }
      setText(e2, t2 = R.literal.utf8) {
        this.format = t2, this.text = e2, this.data = null;
      }
      getText(e2 = false) {
        return (null === this.text || L.isStream(this.text)) && (this.text = L.decodeUTF8(L.nativeEOL(this.getBytes(e2)))), this.text;
      }
      setBytes(e2, t2) {
        this.format = t2, this.data = e2, this.text = null;
      }
      getBytes(e2 = false) {
        return null === this.data && (this.data = L.canonicalizeEOL(L.encodeUTF8(this.text))), e2 ? S(this.data) : this.data;
      }
      setFilename(e2) {
        this.filename = e2;
      }
      getFilename() {
        return this.filename;
      }
      async read(e2) {
        await I(e2, async (e3) => {
          const t2 = await e3.readByte(), r3 = await e3.readByte();
          this.filename = L.decodeUTF8(await e3.readBytes(r3)), this.date = L.readDate(await e3.readBytes(4));
          let n3 = e3.remainder();
          o2(n3) && (n3 = await D(n3)), this.setBytes(n3, t2);
        });
      }
      writeHeader() {
        const e2 = L.encodeUTF8(this.filename), t2 = new Uint8Array([e2.length]), r3 = new Uint8Array([this.format]), n3 = L.writeDate(this.date);
        return L.concatUint8Array([r3, t2, e2, n3]);
      }
      write() {
        const e2 = this.writeHeader(), t2 = this.getBytes();
        return L.concat([e2, t2]);
      }
    };
    Ms = class _Ms {
      constructor() {
        this.bytes = "";
      }
      read(e2) {
        return this.bytes = L.uint8ArrayToString(e2.subarray(0, 8)), this.bytes.length;
      }
      write() {
        return L.stringToUint8Array(this.bytes);
      }
      toHex() {
        return L.uint8ArrayToHex(L.stringToUint8Array(this.bytes));
      }
      equals(e2, t2 = false) {
        return t2 && (e2.isWildcard() || this.isWildcard()) || this.bytes === e2.bytes;
      }
      isNull() {
        return "" === this.bytes;
      }
      isWildcard() {
        return /^0+$/.test(this.toHex());
      }
      static mapToHex(e2) {
        return e2.toHex();
      }
      static fromID(e2) {
        const t2 = new _Ms();
        return t2.read(L.hexToUint8Array(e2)), t2;
      }
      static wildcard() {
        const e2 = new _Ms();
        return e2.read(new Uint8Array(8)), e2;
      }
    };
    Rs = Symbol("verified");
    Fs = "salt@notations.openpgpjs.org";
    Ts = /* @__PURE__ */ new Set([R.signatureSubpacket.issuerKeyID, R.signatureSubpacket.issuerFingerprint, R.signatureSubpacket.embeddedSignature]);
    Ls = class _Ls {
      static get tag() {
        return R.packet.signature;
      }
      constructor() {
        this.version = null, this.signatureType = null, this.hashAlgorithm = null, this.publicKeyAlgorithm = null, this.signatureData = null, this.unhashedSubpackets = [], this.unknownSubpackets = [], this.signedHashValue = null, this.salt = null, this.created = null, this.signatureExpirationTime = null, this.signatureNeverExpires = true, this.exportable = null, this.trustLevel = null, this.trustAmount = null, this.regularExpression = null, this.revocable = null, this.keyExpirationTime = null, this.keyNeverExpires = null, this.preferredSymmetricAlgorithms = null, this.revocationKeyClass = null, this.revocationKeyAlgorithm = null, this.revocationKeyFingerprint = null, this.issuerKeyID = new Ms(), this.rawNotations = [], this.notations = {}, this.preferredHashAlgorithms = null, this.preferredCompressionAlgorithms = null, this.keyServerPreferences = null, this.preferredKeyServer = null, this.isPrimaryUserID = null, this.policyURI = null, this.keyFlags = null, this.signersUserID = null, this.reasonForRevocationFlag = null, this.reasonForRevocationString = null, this.features = null, this.signatureTargetPublicKeyAlgorithm = null, this.signatureTargetHashAlgorithm = null, this.signatureTargetHash = null, this.embeddedSignature = null, this.issuerKeyVersion = null, this.issuerFingerprint = null, this.preferredAEADAlgorithms = null, this.preferredCipherSuites = null, this.revoked = null, this[Rs] = null;
      }
      read(e2, t2 = F) {
        let r3 = 0;
        if (this.version = e2[r3++], 5 === this.version && !t2.enableParsingV5Entities) throw new ot("Support for v5 entities is disabled; turn on `config.enableParsingV5Entities` if needed");
        if (4 !== this.version && 5 !== this.version && 6 !== this.version) throw new ot(`Version ${this.version} of the signature packet is unsupported.`);
        if (this.signatureType = e2[r3++], this.publicKeyAlgorithm = e2[r3++], this.hashAlgorithm = e2[r3++], r3 += this.readSubPackets(e2.subarray(r3, e2.length), true), !this.created) throw Error("Missing signature creation time subpacket.");
        if (this.signatureData = e2.subarray(0, r3), r3 += this.readSubPackets(e2.subarray(r3, e2.length), false), this.signedHashValue = e2.subarray(r3, r3 + 2), r3 += 2, 6 === this.version) {
          const t3 = e2[r3++];
          this.salt = e2.subarray(r3, r3 + t3), r3 += t3;
        }
        const n3 = e2.subarray(r3, e2.length), { read: i3, signatureParams: s3 } = function(e3, t3) {
          let r4 = 0;
          switch (e3) {
            case R.publicKey.rsaEncryptSign:
            case R.publicKey.rsaEncrypt:
            case R.publicKey.rsaSign: {
              const e4 = L.readMPI(t3.subarray(r4));
              return r4 += e4.length + 2, { read: r4, signatureParams: { s: e4 } };
            }
            case R.publicKey.dsa:
            case R.publicKey.ecdsa: {
              const e4 = L.readMPI(t3.subarray(r4));
              r4 += e4.length + 2;
              const n4 = L.readMPI(t3.subarray(r4));
              return r4 += n4.length + 2, { read: r4, signatureParams: { r: e4, s: n4 } };
            }
            case R.publicKey.eddsaLegacy: {
              const e4 = L.readMPI(t3.subarray(r4));
              r4 += e4.length + 2;
              const n4 = L.readMPI(t3.subarray(r4));
              return r4 += n4.length + 2, { read: r4, signatureParams: { r: e4, s: n4 } };
            }
            case R.publicKey.ed25519:
            case R.publicKey.ed448: {
              const n4 = 2 * pt(e3), i4 = L.readExactSubarray(t3, r4, r4 + n4);
              return r4 += i4.length, { read: r4, signatureParams: { RS: i4 } };
            }
            default:
              throw new ot("Unknown signature algorithm.");
          }
        }(this.publicKeyAlgorithm, n3);
        if (i3 < n3.length) throw Error("Error reading MPIs");
        this.params = s3;
      }
      writeParams() {
        return this.params instanceof Promise ? P(async () => Qn(this.publicKeyAlgorithm, await this.params)) : Qn(this.publicKeyAlgorithm, this.params);
      }
      write() {
        const e2 = [];
        return e2.push(this.signatureData), e2.push(this.writeUnhashedSubPackets()), e2.push(this.signedHashValue), 6 === this.version && (e2.push(new Uint8Array([this.salt.length])), e2.push(this.salt)), e2.push(this.writeParams()), L.concat(e2);
      }
      async sign(e2, t2, r3 = /* @__PURE__ */ new Date(), n3 = false, i3) {
        this.version = e2.version, this.created = L.normalizeDate(r3), this.issuerKeyVersion = e2.version, this.issuerFingerprint = e2.getFingerprintBytes(), this.issuerKeyID = e2.getKeyID();
        const s3 = [new Uint8Array([this.version, this.signatureType, this.publicKeyAlgorithm, this.hashAlgorithm])];
        if (6 === this.version) {
          const e3 = Os(this.hashAlgorithm);
          if (null === this.salt) this.salt = pe(e3);
          else if (e3 !== this.salt.length) throw Error("Provided salt does not have the required length");
        } else if (i3.nonDeterministicSignaturesViaNotation) {
          if (0 !== this.rawNotations.filter(({ name: e3 }) => e3 === Fs).length) throw Error("Unexpected existing salt notation");
          {
            const e3 = pe(Os(this.hashAlgorithm));
            this.rawNotations.push({ name: Fs, value: e3, humanReadable: false, critical: false });
          }
        }
        s3.push(this.writeHashedSubPackets()), this.unhashedSubpackets = [], this.signatureData = L.concat(s3);
        const a3 = this.toHash(this.signatureType, t2, n3), o3 = await this.hash(this.signatureType, t2, a3, n3);
        this.signedHashValue = C(B(o3), 0, 2);
        const c3 = async () => Ui(this.publicKeyAlgorithm, this.hashAlgorithm, e2.publicParams, e2.privateParams, a3, await D(o3));
        L.isStream(o3) ? this.params = c3() : (this.params = await c3(), this[Rs] = true);
      }
      writeHashedSubPackets() {
        const e2 = R.signatureSubpacket, t2 = [];
        let r3;
        if (null === this.created) throw Error("Missing signature creation time");
        t2.push(Ns(e2.signatureCreationTime, true, L.writeDate(this.created))), null !== this.signatureExpirationTime && t2.push(Ns(e2.signatureExpirationTime, true, L.writeNumber(this.signatureExpirationTime, 4))), null !== this.exportable && t2.push(Ns(e2.exportableCertification, true, new Uint8Array([this.exportable ? 1 : 0]))), null !== this.trustLevel && (r3 = new Uint8Array([this.trustLevel, this.trustAmount]), t2.push(Ns(e2.trustSignature, true, r3))), null !== this.regularExpression && t2.push(Ns(e2.regularExpression, true, this.regularExpression)), null !== this.revocable && t2.push(Ns(e2.revocable, true, new Uint8Array([this.revocable ? 1 : 0]))), null !== this.keyExpirationTime && t2.push(Ns(e2.keyExpirationTime, true, L.writeNumber(this.keyExpirationTime, 4))), null !== this.preferredSymmetricAlgorithms && (r3 = L.stringToUint8Array(L.uint8ArrayToString(this.preferredSymmetricAlgorithms)), t2.push(Ns(e2.preferredSymmetricAlgorithms, false, r3))), null !== this.revocationKeyClass && (r3 = new Uint8Array([this.revocationKeyClass, this.revocationKeyAlgorithm]), r3 = L.concat([r3, this.revocationKeyFingerprint]), t2.push(Ns(e2.revocationKey, false, r3))), !this.issuerKeyID.isNull() && this.issuerKeyVersion < 5 && t2.push(Ns(e2.issuerKeyID, false, this.issuerKeyID.write())), this.rawNotations.forEach(({ name: n4, value: i4, humanReadable: s3, critical: a3 }) => {
          r3 = [new Uint8Array([s3 ? 128 : 0, 0, 0, 0])];
          const o3 = L.encodeUTF8(n4);
          r3.push(L.writeNumber(o3.length, 2)), r3.push(L.writeNumber(i4.length, 2)), r3.push(o3), r3.push(i4), r3 = L.concat(r3), t2.push(Ns(e2.notationData, a3, r3));
        }), null !== this.preferredHashAlgorithms && (r3 = L.stringToUint8Array(L.uint8ArrayToString(this.preferredHashAlgorithms)), t2.push(Ns(e2.preferredHashAlgorithms, false, r3))), null !== this.preferredCompressionAlgorithms && (r3 = L.stringToUint8Array(L.uint8ArrayToString(this.preferredCompressionAlgorithms)), t2.push(Ns(e2.preferredCompressionAlgorithms, false, r3))), null !== this.keyServerPreferences && (r3 = L.stringToUint8Array(L.uint8ArrayToString(this.keyServerPreferences)), t2.push(Ns(e2.keyServerPreferences, false, r3))), null !== this.preferredKeyServer && t2.push(Ns(e2.preferredKeyServer, false, L.encodeUTF8(this.preferredKeyServer))), null !== this.isPrimaryUserID && t2.push(Ns(e2.primaryUserID, false, new Uint8Array([this.isPrimaryUserID ? 1 : 0]))), null !== this.policyURI && t2.push(Ns(e2.policyURI, false, L.encodeUTF8(this.policyURI))), null !== this.keyFlags && (r3 = L.stringToUint8Array(L.uint8ArrayToString(this.keyFlags)), t2.push(Ns(e2.keyFlags, true, r3))), null !== this.signersUserID && t2.push(Ns(e2.signersUserID, false, L.encodeUTF8(this.signersUserID))), null !== this.reasonForRevocationFlag && (r3 = L.stringToUint8Array(String.fromCharCode(this.reasonForRevocationFlag) + this.reasonForRevocationString), t2.push(Ns(e2.reasonForRevocation, true, r3))), null !== this.features && (r3 = L.stringToUint8Array(L.uint8ArrayToString(this.features)), t2.push(Ns(e2.features, false, r3))), null !== this.signatureTargetPublicKeyAlgorithm && (r3 = [new Uint8Array([this.signatureTargetPublicKeyAlgorithm, this.signatureTargetHashAlgorithm])], r3.push(L.stringToUint8Array(this.signatureTargetHash)), r3 = L.concat(r3), t2.push(Ns(e2.signatureTarget, true, r3))), null !== this.embeddedSignature && t2.push(Ns(e2.embeddedSignature, true, this.embeddedSignature.write())), null !== this.issuerFingerprint && (r3 = [new Uint8Array([this.issuerKeyVersion]), this.issuerFingerprint], r3 = L.concat(r3), t2.push(Ns(e2.issuerFingerprint, this.version >= 5, r3))), null !== this.preferredAEADAlgorithms && (r3 = L.stringToUint8Array(L.uint8ArrayToString(this.preferredAEADAlgorithms)), t2.push(Ns(e2.preferredAEADAlgorithms, false, r3))), null !== this.preferredCipherSuites && (r3 = new Uint8Array([].concat(...this.preferredCipherSuites)), t2.push(Ns(e2.preferredCipherSuites, false, r3)));
        const n3 = L.concat(t2), i3 = L.writeNumber(n3.length, 6 === this.version ? 4 : 2);
        return L.concat([i3, n3]);
      }
      writeUnhashedSubPackets() {
        const e2 = this.unhashedSubpackets.map(({ type: e3, critical: t3, body: r4 }) => Ns(e3, t3, r4)), t2 = L.concat(e2), r3 = L.writeNumber(t2.length, 6 === this.version ? 4 : 2);
        return L.concat([r3, t2]);
      }
      readSubPacket(e2, t2 = true) {
        let r3 = 0;
        const n3 = !!(128 & e2[r3]), i3 = 127 & e2[r3];
        if (r3++, t2 || (this.unhashedSubpackets.push({ type: i3, critical: n3, body: e2.subarray(r3, e2.length) }), Ts.has(i3))) switch (i3) {
          case R.signatureSubpacket.signatureCreationTime:
            this.created = L.readDate(e2.subarray(r3, e2.length));
            break;
          case R.signatureSubpacket.signatureExpirationTime: {
            const t3 = L.readNumber(e2.subarray(r3, e2.length));
            this.signatureNeverExpires = 0 === t3, this.signatureExpirationTime = t3;
            break;
          }
          case R.signatureSubpacket.exportableCertification:
            this.exportable = 1 === e2[r3++];
            break;
          case R.signatureSubpacket.trustSignature:
            this.trustLevel = e2[r3++], this.trustAmount = e2[r3++];
            break;
          case R.signatureSubpacket.regularExpression:
            this.regularExpression = e2[r3];
            break;
          case R.signatureSubpacket.revocable:
            this.revocable = 1 === e2[r3++];
            break;
          case R.signatureSubpacket.keyExpirationTime: {
            const t3 = L.readNumber(e2.subarray(r3, e2.length));
            this.keyExpirationTime = t3, this.keyNeverExpires = 0 === t3;
            break;
          }
          case R.signatureSubpacket.preferredSymmetricAlgorithms:
            this.preferredSymmetricAlgorithms = [...e2.subarray(r3, e2.length)];
            break;
          case R.signatureSubpacket.revocationKey:
            this.revocationKeyClass = e2[r3++], this.revocationKeyAlgorithm = e2[r3++], this.revocationKeyFingerprint = e2.subarray(r3, r3 + 20);
            break;
          case R.signatureSubpacket.issuerKeyID:
            if (4 === this.version) this.issuerKeyID.read(e2.subarray(r3, e2.length));
            else if (t2) throw Error("Unexpected Issuer Key ID subpacket");
            break;
          case R.signatureSubpacket.notationData: {
            const t3 = !!(128 & e2[r3]);
            r3 += 4;
            const i4 = L.readNumber(e2.subarray(r3, r3 + 2));
            r3 += 2;
            const s3 = L.readNumber(e2.subarray(r3, r3 + 2));
            r3 += 2;
            const a3 = L.decodeUTF8(e2.subarray(r3, r3 + i4)), o3 = e2.subarray(r3 + i4, r3 + i4 + s3);
            this.rawNotations.push({ name: a3, humanReadable: t3, value: o3, critical: n3 }), t3 && (this.notations[a3] = L.decodeUTF8(o3));
            break;
          }
          case R.signatureSubpacket.preferredHashAlgorithms:
            this.preferredHashAlgorithms = [...e2.subarray(r3, e2.length)];
            break;
          case R.signatureSubpacket.preferredCompressionAlgorithms:
            this.preferredCompressionAlgorithms = [...e2.subarray(r3, e2.length)];
            break;
          case R.signatureSubpacket.keyServerPreferences:
            this.keyServerPreferences = [...e2.subarray(r3, e2.length)];
            break;
          case R.signatureSubpacket.preferredKeyServer:
            this.preferredKeyServer = L.decodeUTF8(e2.subarray(r3, e2.length));
            break;
          case R.signatureSubpacket.primaryUserID:
            this.isPrimaryUserID = 0 !== e2[r3++];
            break;
          case R.signatureSubpacket.policyURI:
            this.policyURI = L.decodeUTF8(e2.subarray(r3, e2.length));
            break;
          case R.signatureSubpacket.keyFlags:
            this.keyFlags = [...e2.subarray(r3, e2.length)];
            break;
          case R.signatureSubpacket.signersUserID:
            this.signersUserID = L.decodeUTF8(e2.subarray(r3, e2.length));
            break;
          case R.signatureSubpacket.reasonForRevocation:
            this.reasonForRevocationFlag = e2[r3++], this.reasonForRevocationString = L.decodeUTF8(e2.subarray(r3, e2.length));
            break;
          case R.signatureSubpacket.features:
            this.features = [...e2.subarray(r3, e2.length)];
            break;
          case R.signatureSubpacket.signatureTarget: {
            this.signatureTargetPublicKeyAlgorithm = e2[r3++], this.signatureTargetHashAlgorithm = e2[r3++];
            const t3 = Fe(this.signatureTargetHashAlgorithm);
            this.signatureTargetHash = L.uint8ArrayToString(e2.subarray(r3, r3 + t3));
            break;
          }
          case R.signatureSubpacket.embeddedSignature:
            this.embeddedSignature = new _Ls(), this.embeddedSignature.read(e2.subarray(r3, e2.length));
            break;
          case R.signatureSubpacket.issuerFingerprint:
            this.issuerKeyVersion = e2[r3++], this.issuerFingerprint = e2.subarray(r3, e2.length), this.issuerKeyVersion >= 5 ? this.issuerKeyID.read(this.issuerFingerprint) : this.issuerKeyID.read(this.issuerFingerprint.subarray(-8));
            break;
          case R.signatureSubpacket.preferredAEADAlgorithms:
            this.preferredAEADAlgorithms = [...e2.subarray(r3, e2.length)];
            break;
          case R.signatureSubpacket.preferredCipherSuites:
            this.preferredCipherSuites = [];
            for (let t3 = r3; t3 < e2.length; t3 += 2) this.preferredCipherSuites.push([e2[t3], e2[t3 + 1]]);
            break;
          default:
            this.unknownSubpackets.push({ type: i3, critical: n3, body: e2.subarray(r3, e2.length) });
        }
      }
      readSubPackets(e2, t2 = true, r3) {
        const n3 = 6 === this.version ? 4 : 2, i3 = L.readNumber(e2.subarray(0, n3));
        let s3 = n3;
        for (; s3 < 2 + i3; ) {
          const n4 = et(e2.subarray(s3, e2.length));
          s3 += n4.offset, this.readSubPacket(e2.subarray(s3, s3 + n4.len), t2, r3), s3 += n4.len;
        }
        return s3;
      }
      toSign(e2, t2) {
        const r3 = R.signature;
        switch (e2) {
          case r3.binary:
            return null !== t2.text ? L.encodeUTF8(t2.getText(true)) : t2.getBytes(true);
          case r3.text: {
            const e3 = t2.getBytes(true);
            return L.canonicalizeEOL(e3);
          }
          case r3.standalone:
            return new Uint8Array(0);
          case r3.certGeneric:
          case r3.certPersona:
          case r3.certCasual:
          case r3.certPositive:
          case r3.certRevocation: {
            let e3, n3;
            if (t2.userID) n3 = 180, e3 = t2.userID;
            else {
              if (!t2.userAttribute) throw Error("Either a userID or userAttribute packet needs to be supplied for certification.");
              n3 = 209, e3 = t2.userAttribute;
            }
            const i3 = e3.write();
            return L.concat([this.toSign(r3.key, t2), new Uint8Array([n3]), L.writeNumber(i3.length, 4), i3]);
          }
          case r3.subkeyBinding:
          case r3.subkeyRevocation:
          case r3.keyBinding:
            return L.concat([this.toSign(r3.key, t2), this.toSign(r3.key, { key: t2.bind })]);
          case r3.key:
            if (void 0 === t2.key) throw Error("Key packet is required for this signature.");
            return t2.key.writeForHash(this.version);
          case r3.keyRevocation:
            return this.toSign(r3.key, t2);
          case r3.timestamp:
            return new Uint8Array(0);
          case r3.thirdParty:
            throw Error("Not implemented");
          default:
            throw Error("Unknown signature type.");
        }
      }
      calculateTrailer(e2, t2) {
        let r3 = 0;
        return b(B(this.signatureData), (e3) => {
          r3 += e3.length;
        }, () => {
          const n3 = [];
          return 5 !== this.version || this.signatureType !== R.signature.binary && this.signatureType !== R.signature.text || (t2 ? n3.push(new Uint8Array(6)) : n3.push(e2.writeHeader())), n3.push(new Uint8Array([this.version, 255])), 5 === this.version && n3.push(new Uint8Array(4)), n3.push(L.writeNumber(r3, 4)), L.concat(n3);
        });
      }
      toHash(e2, t2, r3 = false) {
        const n3 = this.toSign(e2, t2);
        return L.concat([this.salt || new Uint8Array(), n3, this.signatureData, this.calculateTrailer(t2, r3)]);
      }
      async hash(e2, t2, r3, n3 = false) {
        if (6 === this.version && this.salt.length !== Os(this.hashAlgorithm)) throw Error("Signature salt does not have the expected length");
        return r3 || (r3 = this.toHash(e2, t2, n3)), Re(this.hashAlgorithm, r3);
      }
      async verify(e2, t2, r3, n3 = /* @__PURE__ */ new Date(), i3 = false, s3 = F) {
        if (!this.issuerKeyID.equals(e2.getKeyID())) throw Error("Signature was not issued by the given public key");
        if (this.publicKeyAlgorithm !== e2.algorithm) throw Error("Public key algorithm used to sign signature does not match issuer key algorithm.");
        const a3 = t2 === R.signature.binary || t2 === R.signature.text;
        if (!(this[Rs] && !a3)) {
          let n4, s4;
          if (this.hashed ? s4 = await this.hashed : (n4 = this.toHash(t2, r3, i3), s4 = await this.hash(t2, r3, n4)), s4 = await D(s4), this.signedHashValue[0] !== s4[0] || this.signedHashValue[1] !== s4[1]) throw Error("Signed digest did not match");
          if (this.params = await this.params, this[Rs] = await Di(this.publicKeyAlgorithm, this.hashAlgorithm, this.params, e2.publicParams, n4, s4), !this[Rs]) throw Error("Signature verification failed");
        }
        const o3 = L.normalizeDate(n3);
        if (o3 && this.created > o3) throw Error("Signature creation time is in the future");
        if (o3 && o3 >= this.getExpirationTime()) throw Error("Signature is expired");
        if (s3.rejectHashAlgorithms.has(this.hashAlgorithm)) throw Error("Insecure hash algorithm: " + R.read(R.hash, this.hashAlgorithm).toUpperCase());
        if (s3.rejectMessageHashAlgorithms.has(this.hashAlgorithm) && [R.signature.binary, R.signature.text].includes(this.signatureType)) throw Error("Insecure message hash algorithm: " + R.read(R.hash, this.hashAlgorithm).toUpperCase());
        if (this.unknownSubpackets.forEach(({ type: e3, critical: t3 }) => {
          if (t3) throw Error("Unknown critical signature subpacket type " + e3);
        }), this.rawNotations.forEach(({ name: e3, critical: t3 }) => {
          if (t3 && s3.knownNotations.indexOf(e3) < 0) throw Error("Unknown critical notation: " + e3);
        }), null !== this.revocationKeyClass) throw Error("This key is intended to be revoked with an authorized key, which OpenPGP.js does not support.");
      }
      isExpired(e2 = /* @__PURE__ */ new Date()) {
        const t2 = L.normalizeDate(e2);
        return null !== t2 && !(this.created <= t2 && t2 < this.getExpirationTime());
      }
      getExpirationTime() {
        return this.signatureNeverExpires ? 1 / 0 : new Date(this.created.getTime() + 1e3 * this.signatureExpirationTime);
      }
    };
    Hs = class _Hs {
      static get tag() {
        return R.packet.onePassSignature;
      }
      static fromSignaturePacket(e2, t2) {
        const r3 = new _Hs();
        return r3.version = 6 === e2.version ? 6 : 3, r3.signatureType = e2.signatureType, r3.hashAlgorithm = e2.hashAlgorithm, r3.publicKeyAlgorithm = e2.publicKeyAlgorithm, r3.issuerKeyID = e2.issuerKeyID, r3.salt = e2.salt, r3.issuerFingerprint = e2.issuerFingerprint, r3.flags = t2 ? 1 : 0, r3;
      }
      constructor() {
        this.version = null, this.signatureType = null, this.hashAlgorithm = null, this.publicKeyAlgorithm = null, this.salt = null, this.issuerKeyID = null, this.issuerFingerprint = null, this.flags = null;
      }
      read(e2) {
        let t2 = 0;
        if (this.version = e2[t2++], 3 !== this.version && 6 !== this.version) throw new ot(`Version ${this.version} of the one-pass signature packet is unsupported.`);
        if (this.signatureType = e2[t2++], this.hashAlgorithm = e2[t2++], this.publicKeyAlgorithm = e2[t2++], 6 === this.version) {
          const r3 = e2[t2++];
          this.salt = e2.subarray(t2, t2 + r3), t2 += r3, this.issuerFingerprint = e2.subarray(t2, t2 + 32), t2 += 32, this.issuerKeyID = new Ms(), this.issuerKeyID.read(this.issuerFingerprint);
        } else this.issuerKeyID = new Ms(), this.issuerKeyID.read(e2.subarray(t2, t2 + 8)), t2 += 8;
        return this.flags = e2[t2++], this;
      }
      write() {
        const e2 = [new Uint8Array([this.version, this.signatureType, this.hashAlgorithm, this.publicKeyAlgorithm])];
        return 6 === this.version ? e2.push(new Uint8Array([this.salt.length]), this.salt, this.issuerFingerprint) : e2.push(this.issuerKeyID.write()), e2.push(new Uint8Array([this.flags])), L.concatUint8Array(e2);
      }
      calculateTrailer(...e2) {
        return P(async () => Ls.prototype.calculateTrailer.apply(await this.correspondingSig, e2));
      }
      async verify() {
        const e2 = await this.correspondingSig;
        if (!e2 || e2.constructor.tag !== R.packet.signature) throw Error("Corresponding signature packet missing");
        if (e2.signatureType !== this.signatureType || e2.hashAlgorithm !== this.hashAlgorithm || e2.publicKeyAlgorithm !== this.publicKeyAlgorithm || !e2.issuerKeyID.equals(this.issuerKeyID) || 3 === this.version && 6 === e2.version || 6 === this.version && 6 !== e2.version || 6 === this.version && !L.equalsUint8Array(e2.issuerFingerprint, this.issuerFingerprint) || 6 === this.version && !L.equalsUint8Array(e2.salt, this.salt)) throw Error("Corresponding signature packet does not match one-pass signature packet");
        return e2.hashed = this.hashed, e2.verify.apply(e2, arguments);
      }
    };
    Hs.prototype.hash = Ls.prototype.hash, Hs.prototype.toHash = Ls.prototype.toHash, Hs.prototype.toSign = Ls.prototype.toSign;
    Gs = class _Gs extends Array {
      static async fromBinary(e2, t2, r3 = F, n3 = null, i3 = false) {
        const s3 = new _Gs();
        return await s3.read(e2, t2, r3, n3, i3), s3;
      }
      async read(e2, t2, r3 = F, n3 = null, i3 = false) {
        let s3;
        r3.additionalAllowedPackets.length && (s3 = L.constructAllowedPackets(r3.additionalAllowedPackets), t2 = { ...t2, ...s3 }), this.stream = v(e2, async (e3, a4) => {
          const o3 = x(e3), c3 = Q(a4);
          try {
            let a5 = L.isStream(e3);
            for (; ; ) {
              let e4, u2;
              if (await c3.ready, await at(o3, a5, async (a6) => {
                try {
                  if (a6.tag === R.packet.marker || a6.tag === R.packet.trust || a6.tag === R.packet.padding) return;
                  const e5 = zs(a6.tag, t2);
                  try {
                    n3?.recordPacket(a6.tag, s3);
                  } catch (e6) {
                    if (r3.enforceGrammar) throw e6;
                    L.printDebugError(e6);
                  }
                  e5.packets = new _Gs(), e5.fromStream = L.isStream(a6.packet), u2 = e5.fromStream;
                  try {
                    await e5.read(a6.packet, r3);
                  } catch (t3) {
                    if (!(t3 instanceof ot)) throw L.wrapError(new ut(`Parsing ${e5.constructor.name} failed`), t3);
                    throw t3;
                  }
                  await c3.write(e5);
                } catch (t3) {
                  const n4 = t3 instanceof ct && a6.tag <= 39, s4 = t3 instanceof ot && !(t3 instanceof ct) && !r3.ignoreUnsupportedPackets, o4 = t3 instanceof ut && !r3.ignoreMalformedPackets, u3 = st(a6.tag);
                  if (n4 || s4 || o4 || u3 || !(t3 instanceof ct || t3 instanceof ot || t3 instanceof ut)) i3 ? e4 = t3 : await c3.abort(t3);
                  else {
                    const e5 = new ht(a6.tag, a6.packet);
                    await c3.write(e5);
                  }
                  L.printDebugError(t3);
                }
              }), u2 && (a5 = null), e4) throw await o3.readToEnd(), e4;
              const h4 = await o3.peekBytes(2);
              if (!h4 || !h4.length) {
                try {
                  n3?.recordEnd();
                } catch (e5) {
                  if (r3.enforceGrammar) throw e5;
                  L.printDebugError(e5);
                }
                return await c3.ready, void await c3.close();
              }
            }
          } catch (e4) {
            await c3.abort(e4);
          }
        });
        const a3 = x(this.stream);
        for (; ; ) {
          const { done: e3, value: t3 } = await a3.read();
          if (e3 ? this.stream = null : this.push(t3), e3 || st(t3.constructor.tag)) break;
        }
        a3.releaseLock();
      }
      write() {
        const e2 = [];
        for (let t2 = 0; t2 < this.length; t2++) {
          const r3 = this[t2] instanceof ht ? this[t2].tag : this[t2].constructor.tag, n3 = this[t2].write();
          if (L.isStream(n3) && st(this[t2].constructor.tag)) {
            let t3 = [], i3 = 0;
            const s3 = 512;
            e2.push(nt(r3)), e2.push(b(n3, (e3) => {
              if (t3.push(e3), i3 += e3.length, i3 >= s3) {
                const e4 = Math.min(Math.log(i3) / Math.LN2 | 0, 30), r4 = 2 ** e4, n4 = L.concat([rt(e4)].concat(t3));
                return t3 = [n4.subarray(1 + r4)], i3 = t3[0].length, n4.subarray(0, 1 + r4);
              }
            }, () => L.concat([tt(i3)].concat(t3))));
          } else {
            if (L.isStream(n3)) {
              let t3 = 0;
              e2.push(b(B(n3), (e3) => {
                t3 += e3.length;
              }, () => it(r3, t3)));
            } else e2.push(it(r3, n3.length));
            e2.push(n3);
          }
        }
        return L.concat(e2);
      }
      filterByTag(...e2) {
        const t2 = new _Gs(), r3 = (e3) => (t3) => e3 === t3;
        for (let n3 = 0; n3 < this.length; n3++) e2.some(r3(this[n3].constructor.tag)) && t2.push(this[n3]);
        return t2;
      }
      findPacket(e2) {
        return this.find((t2) => t2.constructor.tag === e2);
      }
      indexOfTag(...e2) {
        const t2 = [], r3 = this, n3 = (e3) => (t3) => e3 === t3;
        for (let i3 = 0; i3 < this.length; i3++) e2.some(n3(r3[i3].constructor.tag)) && t2.push(i3);
        return t2;
      }
    };
    js = class _js extends Error {
      constructor(...e2) {
        super(...e2), Error.captureStackTrace && Error.captureStackTrace(this, _js), this.name = "GrammarError";
      }
    };
    !function(e2) {
      e2[e2.EmptyMessage = 0] = "EmptyMessage", e2[e2.PlaintextOrEncryptedData = 1] = "PlaintextOrEncryptedData", e2[e2.EncryptedSessionKeys = 2] = "EncryptedSessionKeys", e2[e2.StandaloneAdditionalAllowedData = 3] = "StandaloneAdditionalAllowedData";
    }(Vs || (Vs = {}));
    qs = class {
      constructor() {
        this.state = Vs.EmptyMessage, this.leadingOnePassSignatureCounter = 0;
      }
      recordPacket(e2, t2) {
        switch (this.state) {
          case Vs.EmptyMessage:
          case Vs.StandaloneAdditionalAllowedData:
            switch (e2) {
              case R.packet.literalData:
              case R.packet.compressedData:
              case R.packet.aeadEncryptedData:
              case R.packet.symEncryptedIntegrityProtectedData:
              case R.packet.symmetricallyEncryptedData:
                return void (this.state = Vs.PlaintextOrEncryptedData);
              case R.packet.signature:
                if (this.state === Vs.StandaloneAdditionalAllowedData && --this.leadingOnePassSignatureCounter < 0) throw new js("Trailing signature packet without OPS");
                return;
              case R.packet.onePassSignature:
                if (this.state === Vs.StandaloneAdditionalAllowedData) throw new js("OPS following StandaloneAdditionalAllowedData");
                return void this.leadingOnePassSignatureCounter++;
              case R.packet.publicKeyEncryptedSessionKey:
              case R.packet.symEncryptedSessionKey:
                return void (this.state = Vs.EncryptedSessionKeys);
              default:
                if (!t2?.[e2]) throw new js(`Unexpected packet ${e2} in state ${this.state}`);
                return void (this.state = Vs.StandaloneAdditionalAllowedData);
            }
          case Vs.PlaintextOrEncryptedData:
            if (e2 === R.packet.signature) {
              if (--this.leadingOnePassSignatureCounter < 0) throw new js("Trailing signature packet without OPS");
              return void (this.state = Vs.PlaintextOrEncryptedData);
            }
            if (!t2?.[e2]) throw new js(`Unexpected packet ${e2} in state ${this.state}`);
            return void (this.state = Vs.PlaintextOrEncryptedData);
          case Vs.EncryptedSessionKeys:
            switch (e2) {
              case R.packet.publicKeyEncryptedSessionKey:
              case R.packet.symEncryptedSessionKey:
                return void (this.state = Vs.EncryptedSessionKeys);
              case R.packet.symEncryptedIntegrityProtectedData:
              case R.packet.aeadEncryptedData:
              case R.packet.symmetricallyEncryptedData:
                return void (this.state = Vs.PlaintextOrEncryptedData);
              case R.packet.signature:
                if (--this.leadingOnePassSignatureCounter < 0) throw new js("Trailing signature packet without OPS");
                return void (this.state = Vs.PlaintextOrEncryptedData);
              default:
                if (!t2?.[e2]) throw new js(`Unexpected packet ${e2} in state ${this.state}`);
                this.state = Vs.EncryptedSessionKeys;
            }
        }
      }
      recordEnd() {
        switch (this.state) {
          case Vs.EmptyMessage:
          case Vs.PlaintextOrEncryptedData:
          case Vs.EncryptedSessionKeys:
          case Vs.StandaloneAdditionalAllowedData:
            if (this.leadingOnePassSignatureCounter > 0) throw new js("Missing trailing signature packets");
        }
      }
    };
    _s = /* @__PURE__ */ L.constructAllowedPackets([Qs, Hs, Ls]);
    Ys = class {
      static get tag() {
        return R.packet.compressedData;
      }
      constructor(e2 = F) {
        this.packets = null, this.algorithm = e2.preferredCompressionAlgorithm, this.compressed = null;
      }
      async read(e2, t2 = F) {
        await I(e2, async (e3) => {
          this.algorithm = await e3.readByte(), this.compressed = e3.remainder(), await this.decompress(t2);
        });
      }
      write() {
        return null === this.compressed && this.compress(), L.concat([new Uint8Array([this.algorithm]), this.compressed]);
      }
      async decompress(e2 = F) {
        const t2 = R.read(R.compression, this.algorithm), r3 = $s[t2];
        if (!r3) throw Error(t2 + " decompression not supported");
        let n3 = await r3(this.compressed);
        if (e2.maxDecompressedMessageSize !== 1 / 0) {
          let t3 = 0;
          n3 = b(n3, (r4) => {
            if (t3 += r4.length, t3 > e2.maxDecompressedMessageSize) throw Error("Maximum decompressed message size exceeded");
            return r4;
          });
        }
        u(this.compressed) && !o2(this.compressed) || (n3 = await D(n3)), this.packets = await Gs.fromBinary(n3, _s, e2, new qs());
      }
      compress() {
        const e2 = R.read(R.compression, this.algorithm), t2 = Xs[e2];
        if (!t2) throw Error(e2 + " compression not supported");
        const r3 = this.packets.write();
        let n3 = t2(r3);
        u(r3) && !o2(r3) || (n3 = P(() => D(n3))), this.compressed = n3;
      }
    };
    Ws = (e2) => ({ compressor: "undefined" != typeof CompressionStream && (() => new CompressionStream(e2)), decompressor: "undefined" != typeof DecompressionStream && (() => new DecompressionStream(e2)) });
    Xs = { zip: /* @__PURE__ */ Zs(Ws("deflate-raw").compressor, Cs), zlib: /* @__PURE__ */ Zs(Ws("deflate").compressor, Us) };
    $s = { uncompressed: (e2) => e2, zip: /* @__PURE__ */ Zs(Ws("deflate-raw").decompressor, Ds), zlib: /* @__PURE__ */ Zs(Ws("deflate").decompressor, Ps), bzip2: /* @__PURE__ */ Js() };
    ea = /* @__PURE__ */ L.constructAllowedPackets([Qs, Ys, Hs, Ls]);
    ta = class _ta {
      static get tag() {
        return R.packet.symEncryptedIntegrityProtectedData;
      }
      static fromObject({ version: e2, aeadAlgorithm: t2 }) {
        if (1 !== e2 && 2 !== e2) throw Error("Unsupported SEIPD version");
        const r3 = new _ta();
        return r3.version = e2, 2 === e2 && (r3.aeadAlgorithm = t2), r3;
      }
      constructor() {
        this.version = null, this.cipherAlgorithm = null, this.aeadAlgorithm = null, this.chunkSizeByte = null, this.salt = null, this.encrypted = null, this.packets = null;
      }
      async read(e2) {
        await I(e2, async (e3) => {
          if (this.version = await e3.readByte(), 1 !== this.version && 2 !== this.version) throw new ot(`Version ${this.version} of the SEIP packet is unsupported.`);
          2 === this.version && (this.cipherAlgorithm = await e3.readByte(), this.aeadAlgorithm = await e3.readByte(), this.chunkSizeByte = await e3.readByte(), this.salt = await e3.readBytes(32)), this.encrypted = e3.remainder();
        });
      }
      write() {
        return 2 === this.version ? L.concat([new Uint8Array([this.version, this.cipherAlgorithm, this.aeadAlgorithm, this.chunkSizeByte]), this.salt, this.encrypted]) : L.concat([new Uint8Array([this.version]), this.encrypted]);
      }
      async encrypt(e2, t2, r3 = F) {
        const { blockSize: n3, keySize: i3 } = Kr(e2);
        if (t2.length !== i3) throw Error("Unexpected session key size");
        let s3 = this.packets.write();
        if (o2(s3) && (s3 = await D(s3)), 2 === this.version) this.cipherAlgorithm = e2, this.salt = pe(32), this.chunkSizeByte = r3.aeadChunkSizeByte, this.encrypted = await ra(this, "encrypt", t2, s3);
        else {
          const r4 = await Gn(e2), i4 = new Uint8Array([211, 20]), a3 = L.concat([r4, s3, i4]), o3 = await Re(R.hash.sha1, S(a3)), c3 = L.concat([a3, o3]);
          this.encrypted = await jn(e2, t2, c3, new Uint8Array(n3));
        }
        return true;
      }
      async decrypt(e2, t2, r3 = F) {
        if (t2.length !== Kr(e2).keySize) throw Error("Unexpected session key size");
        let n3, i3 = B(this.encrypted);
        o2(i3) && (i3 = await D(i3));
        let s3 = false;
        if (2 === this.version) {
          if (this.cipherAlgorithm !== e2) throw Error("Unexpected session key algorithm");
          n3 = await ra(this, "decrypt", t2, i3);
        } else {
          const { blockSize: a3 } = Kr(e2), o3 = await Vn(e2, t2, i3, new Uint8Array(a3)), c3 = C(S(o3), -20), u2 = C(o3, 0, -20), h4 = Promise.all([D(await Re(R.hash.sha1, S(u2))), D(c3)]).then(([e3, t3]) => {
            if (!L.equalsUint8Array(e3, t3)) throw Error("Modification detected.");
            return new Uint8Array();
          }), f2 = C(u2, a3 + 2);
          n3 = C(f2, 0, -2), n3 = A([n3, P(() => h4)]), L.isStream(i3) && r3.allowUnauthenticatedStream ? s3 = true : n3 = await D(n3);
        }
        return this.packets = await Gs.fromBinary(n3, ea, r3, new qs(), s3), true;
      }
    };
    na = /* @__PURE__ */ L.constructAllowedPackets([Qs, Ys, Hs, Ls]);
    ia = class {
      static get tag() {
        return R.packet.aeadEncryptedData;
      }
      constructor() {
        this.version = 1, this.cipherAlgorithm = null, this.aeadAlgorithm = R.aead.eax, this.chunkSizeByte = null, this.iv = null, this.encrypted = null, this.packets = null;
      }
      async read(e2) {
        await I(e2, async (e3) => {
          const t2 = await e3.readByte();
          if (1 !== t2) throw new ot(`Version ${t2} of the AEAD-encrypted data packet is not supported.`);
          this.cipherAlgorithm = await e3.readByte(), this.aeadAlgorithm = await e3.readByte(), this.chunkSizeByte = await e3.readByte();
          const r3 = Ci(this.aeadAlgorithm, true);
          this.iv = await e3.readBytes(r3.ivLength), this.encrypted = e3.remainder();
        });
      }
      write() {
        return L.concat([new Uint8Array([this.version, this.cipherAlgorithm, this.aeadAlgorithm, this.chunkSizeByte]), this.iv, this.encrypted]);
      }
      async decrypt(e2, t2, r3 = F) {
        this.packets = await Gs.fromBinary(await ra(this, "decrypt", t2, B(this.encrypted)), na, r3, new qs());
      }
      async encrypt(e2, t2, r3 = F) {
        this.cipherAlgorithm = e2;
        const { ivLength: n3 } = Ci(this.aeadAlgorithm, true);
        this.iv = pe(n3), this.chunkSizeByte = r3.aeadChunkSizeByte;
        const i3 = this.packets.write();
        this.encrypted = await ra(this, "encrypt", t2, i3);
      }
    };
    sa = class _sa {
      static get tag() {
        return R.packet.publicKeyEncryptedSessionKey;
      }
      constructor() {
        this.version = null, this.publicKeyID = new Ms(), this.publicKeyVersion = null, this.publicKeyFingerprint = null, this.publicKeyAlgorithm = null, this.sessionKey = null, this.sessionKeyAlgorithm = null, this.encrypted = {};
      }
      static fromObject({ version: e2, encryptionKeyPacket: t2, anonymousRecipient: r3, sessionKey: n3, sessionKeyAlgorithm: i3 }) {
        const s3 = new _sa();
        if (3 !== e2 && 6 !== e2) throw Error("Unsupported PKESK version");
        return s3.version = e2, 6 === e2 && (s3.publicKeyVersion = r3 ? null : t2.version, s3.publicKeyFingerprint = r3 ? null : t2.getFingerprintBytes()), s3.publicKeyID = r3 ? Ms.wildcard() : t2.getKeyID(), s3.publicKeyAlgorithm = t2.algorithm, s3.sessionKey = n3, s3.sessionKeyAlgorithm = i3, s3;
      }
      read(e2) {
        let t2 = 0;
        if (this.version = e2[t2++], 3 !== this.version && 6 !== this.version) throw new ot(`Version ${this.version} of the PKESK packet is unsupported.`);
        if (6 === this.version) {
          const r3 = e2[t2++];
          if (r3) {
            this.publicKeyVersion = e2[t2++];
            const n3 = r3 - 1;
            this.publicKeyFingerprint = e2.subarray(t2, t2 + n3), t2 += n3, this.publicKeyVersion >= 5 ? this.publicKeyID.read(this.publicKeyFingerprint) : this.publicKeyID.read(this.publicKeyFingerprint.subarray(-8));
          } else this.publicKeyID = Ms.wildcard();
        } else t2 += this.publicKeyID.read(e2.subarray(t2, t2 + 8));
        if (this.publicKeyAlgorithm = e2[t2++], this.encrypted = function(e3, t3) {
          let r3 = 0;
          switch (e3) {
            case R.publicKey.rsaEncrypt:
            case R.publicKey.rsaEncryptSign:
              return { c: L.readMPI(t3.subarray(r3)) };
            case R.publicKey.elgamal: {
              const e4 = L.readMPI(t3.subarray(r3));
              return r3 += e4.length + 2, { c1: e4, c2: L.readMPI(t3.subarray(r3)) };
            }
            case R.publicKey.ecdh: {
              const e4 = L.readMPI(t3.subarray(r3));
              r3 += e4.length + 2;
              const n3 = new Kn();
              return n3.read(t3.subarray(r3)), { V: e4, C: n3 };
            }
            case R.publicKey.x25519:
            case R.publicKey.x448: {
              const n3 = Ln(e3), i3 = L.readExactSubarray(t3, r3, r3 + n3);
              r3 += i3.length;
              const s3 = new Dn();
              return s3.read(t3.subarray(r3)), { ephemeralPublicKey: i3, C: s3 };
            }
            default:
              throw new ot("Unknown public key encryption algorithm.");
          }
        }(this.publicKeyAlgorithm, e2.subarray(t2)), this.publicKeyAlgorithm === R.publicKey.x25519 || this.publicKeyAlgorithm === R.publicKey.x448) {
          if (3 === this.version) this.sessionKeyAlgorithm = R.write(R.symmetric, this.encrypted.C.algorithm);
          else if (null !== this.encrypted.C.algorithm) throw Error("Unexpected cleartext symmetric algorithm");
        }
      }
      write() {
        const e2 = [new Uint8Array([this.version])];
        return 6 === this.version ? null !== this.publicKeyFingerprint ? (e2.push(new Uint8Array([this.publicKeyFingerprint.length + 1, this.publicKeyVersion])), e2.push(this.publicKeyFingerprint)) : e2.push(new Uint8Array([0])) : e2.push(this.publicKeyID.write()), e2.push(new Uint8Array([this.publicKeyAlgorithm]), Qn(this.publicKeyAlgorithm, this.encrypted)), L.concatUint8Array(e2);
      }
      async encrypt(e2) {
        const t2 = R.write(R.publicKey, this.publicKeyAlgorithm), r3 = 3 === this.version ? this.sessionKeyAlgorithm : null, n3 = 5 === e2.version ? e2.getFingerprintBytes().subarray(0, 20) : e2.getFingerprintBytes(), i3 = aa(this.version, t2, r3, this.sessionKey);
        this.encrypted = await Un(t2, r3, e2.publicParams, i3, n3);
      }
      async decrypt(e2, t2) {
        if (this.publicKeyAlgorithm !== e2.algorithm) throw Error("Decryption error");
        const r3 = t2 ? aa(this.version, this.publicKeyAlgorithm, t2.sessionKeyAlgorithm, t2.sessionKey) : null, n3 = 5 === e2.version ? e2.getFingerprintBytes().subarray(0, 20) : e2.getFingerprintBytes(), i3 = await Pn(this.publicKeyAlgorithm, e2.publicParams, e2.privateParams, this.encrypted, n3, r3), { sessionKey: s3, sessionKeyAlgorithm: a3 } = function(e3, t3, r4, n4) {
          switch (t3) {
            case R.publicKey.rsaEncrypt:
            case R.publicKey.rsaEncryptSign:
            case R.publicKey.elgamal:
            case R.publicKey.ecdh: {
              const t4 = r4.subarray(0, r4.length - 2), i4 = r4.subarray(r4.length - 2), s4 = L.writeChecksum(t4.subarray(t4.length % 8)), a4 = s4[0] === i4[0] & s4[1] === i4[1], o3 = 6 === e3 ? { sessionKeyAlgorithm: null, sessionKey: t4 } : { sessionKeyAlgorithm: t4[0], sessionKey: t4.subarray(1) };
              if (n4) {
                const t5 = a4 & o3.sessionKeyAlgorithm === n4.sessionKeyAlgorithm & o3.sessionKey.length === n4.sessionKey.length;
                return { sessionKey: L.selectUint8Array(t5, o3.sessionKey, n4.sessionKey), sessionKeyAlgorithm: 6 === e3 ? null : L.selectUint8(t5, o3.sessionKeyAlgorithm, n4.sessionKeyAlgorithm) };
              }
              if (a4 && (6 === e3 || R.read(R.symmetric, o3.sessionKeyAlgorithm))) return o3;
              throw Error("Decryption error");
            }
            case R.publicKey.x25519:
            case R.publicKey.x448:
              return { sessionKeyAlgorithm: null, sessionKey: r4 };
            default:
              throw Error("Unsupported public key algorithm");
          }
        }(this.version, this.publicKeyAlgorithm, i3, t2);
        if (3 === this.version) {
          const e3 = this.publicKeyAlgorithm !== R.publicKey.x25519 && this.publicKeyAlgorithm !== R.publicKey.x448;
          if (this.sessionKeyAlgorithm = e3 ? a3 : this.sessionKeyAlgorithm, s3.length !== Kr(this.sessionKeyAlgorithm).keySize) throw Error("Unexpected session key size");
        }
        this.sessionKey = s3;
      }
    };
    oa = class _oa {
      static get tag() {
        return R.packet.symEncryptedSessionKey;
      }
      constructor(e2 = F) {
        this.version = e2.aeadProtect ? 6 : 4, this.sessionKey = null, this.sessionKeyEncryptionAlgorithm = null, this.sessionKeyAlgorithm = null, this.aeadAlgorithm = R.write(R.aead, e2.preferredAEADAlgorithm), this.encrypted = null, this.s2k = null, this.iv = null;
      }
      read(e2) {
        let t2 = 0;
        if (this.version = e2[t2++], 4 !== this.version && 5 !== this.version && 6 !== this.version) throw new ot(`Version ${this.version} of the SKESK packet is unsupported.`);
        6 === this.version && t2++;
        const r3 = e2[t2++];
        this.version >= 5 && (this.aeadAlgorithm = e2[t2++], 6 === this.version && t2++);
        const n3 = e2[t2++];
        if (this.s2k = Ti(n3), t2 += this.s2k.read(e2.subarray(t2, e2.length)), this.version >= 5) {
          const r4 = Ci(this.aeadAlgorithm, true);
          this.iv = e2.subarray(t2, t2 += r4.ivLength);
        }
        this.version >= 5 || t2 < e2.length ? (this.encrypted = e2.subarray(t2, e2.length), this.sessionKeyEncryptionAlgorithm = r3) : this.sessionKeyAlgorithm = r3;
      }
      write() {
        const e2 = null === this.encrypted ? this.sessionKeyAlgorithm : this.sessionKeyEncryptionAlgorithm;
        let t2;
        const r3 = this.s2k.write();
        if (6 === this.version) {
          const n3 = r3.length, i3 = 3 + n3 + this.iv.length;
          t2 = L.concatUint8Array([new Uint8Array([this.version, i3, e2, this.aeadAlgorithm, n3]), r3, this.iv, this.encrypted]);
        } else 5 === this.version ? t2 = L.concatUint8Array([new Uint8Array([this.version, e2, this.aeadAlgorithm]), r3, this.iv, this.encrypted]) : (t2 = L.concatUint8Array([new Uint8Array([this.version, e2]), r3]), null !== this.encrypted && (t2 = L.concatUint8Array([t2, this.encrypted])));
        return t2;
      }
      async decrypt(e2, t2 = F) {
        const r3 = null !== this.sessionKeyEncryptionAlgorithm ? this.sessionKeyEncryptionAlgorithm : this.sessionKeyAlgorithm, { blockSize: n3, keySize: i3 } = Kr(r3), s3 = await this.s2k.produceKey(e2, i3, t2);
        if (this.version >= 5) {
          const e3 = Ci(this.aeadAlgorithm, true), t3 = new Uint8Array([192 | _oa.tag, this.version, this.sessionKeyEncryptionAlgorithm, this.aeadAlgorithm]), n4 = 6 === this.version ? await Pr(R.hash.sha256, s3, new Uint8Array(), t3, i3) : s3, a3 = await e3(r3, n4);
          this.sessionKey = await a3.decrypt(this.encrypted, this.iv, t3);
        } else if (null !== this.encrypted) {
          const e3 = await Vn(r3, s3, this.encrypted, new Uint8Array(n3));
          if (this.sessionKeyAlgorithm = R.write(R.symmetric, e3[0]), this.sessionKey = e3.subarray(1, e3.length), this.sessionKey.length !== Kr(this.sessionKeyAlgorithm).keySize) throw Error("Unexpected session key size");
        } else this.sessionKey = s3;
      }
      async encrypt(e2, t2 = F) {
        const r3 = null !== this.sessionKeyEncryptionAlgorithm ? this.sessionKeyEncryptionAlgorithm : this.sessionKeyAlgorithm;
        this.sessionKeyEncryptionAlgorithm = r3, this.s2k = Li(t2), this.s2k.generateSalt();
        const { blockSize: n3, keySize: i3 } = Kr(r3), s3 = await this.s2k.produceKey(e2, i3, t2);
        if (null === this.sessionKey && (this.sessionKey = Fn(this.sessionKeyAlgorithm)), this.version >= 5) {
          const e3 = Ci(this.aeadAlgorithm);
          this.iv = pe(e3.ivLength);
          const t3 = new Uint8Array([192 | _oa.tag, this.version, this.sessionKeyEncryptionAlgorithm, this.aeadAlgorithm]), n4 = 6 === this.version ? await Pr(R.hash.sha256, s3, new Uint8Array(), t3, i3) : s3, a3 = await e3(r3, n4);
          this.encrypted = await a3.encrypt(this.sessionKey, this.iv, t3);
        } else {
          const e3 = L.concatUint8Array([new Uint8Array([this.sessionKeyAlgorithm]), this.sessionKey]);
          this.encrypted = await jn(r3, s3, e3, new Uint8Array(n3));
        }
      }
    };
    ca = class _ca {
      static get tag() {
        return R.packet.publicKey;
      }
      constructor(e2 = /* @__PURE__ */ new Date(), t2 = F) {
        this.version = t2.v6Keys ? 6 : 4, this.created = L.normalizeDate(e2), this.algorithm = null, this.publicParams = null, this.expirationTimeV3 = 0, this.fingerprint = null, this.keyID = null;
      }
      static fromSecretKeyPacket(e2) {
        const t2 = new _ca(), { version: r3, created: n3, algorithm: i3, publicParams: s3, keyID: a3, fingerprint: o3 } = e2;
        return t2.version = r3, t2.created = n3, t2.algorithm = i3, t2.publicParams = s3, t2.keyID = a3, t2.fingerprint = o3, t2;
      }
      async read(e2, t2 = F) {
        let r3 = 0;
        if (this.version = e2[r3++], 5 === this.version && !t2.enableParsingV5Entities) throw new ot("Support for parsing v5 entities is disabled; turn on `config.enableParsingV5Entities` if needed");
        if (4 === this.version || 5 === this.version || 6 === this.version) {
          this.created = L.readDate(e2.subarray(r3, r3 + 4)), r3 += 4, this.algorithm = e2[r3++], this.version >= 5 && (r3 += 4);
          const { read: t3, publicParams: n3 } = function(e3, t4) {
            let r4 = 0;
            switch (e3) {
              case R.publicKey.rsaEncrypt:
              case R.publicKey.rsaEncryptSign:
              case R.publicKey.rsaSign: {
                const e4 = L.readMPI(t4.subarray(r4));
                r4 += e4.length + 2;
                const n4 = L.readMPI(t4.subarray(r4));
                return r4 += n4.length + 2, { read: r4, publicParams: { n: e4, e: n4 } };
              }
              case R.publicKey.dsa: {
                const e4 = L.readMPI(t4.subarray(r4));
                r4 += e4.length + 2;
                const n4 = L.readMPI(t4.subarray(r4));
                r4 += n4.length + 2;
                const i3 = L.readMPI(t4.subarray(r4));
                r4 += i3.length + 2;
                const s3 = L.readMPI(t4.subarray(r4));
                return r4 += s3.length + 2, { read: r4, publicParams: { p: e4, q: n4, g: i3, y: s3 } };
              }
              case R.publicKey.elgamal: {
                const e4 = L.readMPI(t4.subarray(r4));
                r4 += e4.length + 2;
                const n4 = L.readMPI(t4.subarray(r4));
                r4 += n4.length + 2;
                const i3 = L.readMPI(t4.subarray(r4));
                return r4 += i3.length + 2, { read: r4, publicParams: { p: e4, g: n4, y: i3 } };
              }
              case R.publicKey.ecdsa: {
                const e4 = new $e();
                r4 += e4.read(t4), Tn(e4);
                const n4 = L.readMPI(t4.subarray(r4));
                return r4 += n4.length + 2, { read: r4, publicParams: { oid: e4, Q: n4 } };
              }
              case R.publicKey.eddsaLegacy: {
                const e4 = new $e();
                if (r4 += e4.read(t4), Tn(e4), e4.getName() !== R.curve.ed25519Legacy) throw Error("Unexpected OID for eddsaLegacy");
                let n4 = L.readMPI(t4.subarray(r4));
                return r4 += n4.length + 2, n4 = L.leftPad(n4, 33), { read: r4, publicParams: { oid: e4, Q: n4 } };
              }
              case R.publicKey.ecdh: {
                const e4 = new $e();
                r4 += e4.read(t4), Tn(e4);
                const n4 = L.readMPI(t4.subarray(r4));
                r4 += n4.length + 2;
                const i3 = new Cn();
                return r4 += i3.read(t4.subarray(r4)), { read: r4, publicParams: { oid: e4, Q: n4, kdfParams: i3 } };
              }
              case R.publicKey.ed25519:
              case R.publicKey.ed448:
              case R.publicKey.x25519:
              case R.publicKey.x448: {
                const n4 = L.readExactSubarray(t4, r4, r4 + Ln(e3));
                return r4 += n4.length, { read: r4, publicParams: { A: n4 } };
              }
              default:
                throw new ot("Unknown public key encryption algorithm.");
            }
          }(this.algorithm, e2.subarray(r3));
          if (6 === this.version && n3.oid && (n3.oid.getName() === R.curve.curve25519Legacy || n3.oid.getName() === R.curve.ed25519Legacy)) throw Error("Legacy curve25519 cannot be used with v6 keys");
          return this.publicParams = n3, r3 += t3, await this.computeFingerprintAndKeyID(), r3;
        }
        throw new ot(`Version ${this.version} of the key packet is unsupported.`);
      }
      write() {
        const e2 = [];
        e2.push(new Uint8Array([this.version])), e2.push(L.writeDate(this.created)), e2.push(new Uint8Array([this.algorithm]));
        const t2 = Qn(this.algorithm, this.publicParams);
        return this.version >= 5 && e2.push(L.writeNumber(t2.length, 4)), e2.push(t2), L.concatUint8Array(e2);
      }
      writeForHash(e2) {
        const t2 = this.writePublicKey(), r3 = 149 + e2, n3 = e2 >= 5 ? 4 : 2;
        return L.concatUint8Array([new Uint8Array([r3]), L.writeNumber(t2.length, n3), t2]);
      }
      isDecrypted() {
        return null;
      }
      getCreationTime() {
        return this.created;
      }
      getKeyID() {
        return this.keyID;
      }
      async computeFingerprintAndKeyID() {
        if (await this.computeFingerprint(), this.keyID = new Ms(), this.version >= 5) this.keyID.read(this.fingerprint.subarray(0, 8));
        else {
          if (4 !== this.version) throw Error("Unsupported key version");
          this.keyID.read(this.fingerprint.subarray(12, 20));
        }
      }
      async computeFingerprint() {
        const e2 = this.writeForHash(this.version);
        if (this.version >= 5) this.fingerprint = await Re(R.hash.sha256, e2);
        else {
          if (4 !== this.version) throw Error("Unsupported key version");
          this.fingerprint = await Re(R.hash.sha1, e2);
        }
      }
      getFingerprintBytes() {
        return this.fingerprint;
      }
      getFingerprint() {
        return L.uint8ArrayToHex(this.getFingerprintBytes());
      }
      hasSameFingerprintAs(e2) {
        return this.version === e2.version && L.equalsUint8Array(this.writePublicKey(), e2.writePublicKey());
      }
      getAlgorithmInfo() {
        const e2 = {};
        e2.algorithm = R.read(R.publicKey, this.algorithm);
        const t2 = this.publicParams.n || this.publicParams.p;
        return t2 ? e2.bits = L.uint8ArrayBitLength(t2) : this.publicParams.oid && (e2.curve = this.publicParams.oid.getName()), e2;
      }
    };
    ca.prototype.readPublicKey = ca.prototype.read, ca.prototype.writePublicKey = ca.prototype.write;
    ua = /* @__PURE__ */ L.constructAllowedPackets([Qs, Ys, Hs, Ls]);
    ha = class {
      static get tag() {
        return R.packet.symmetricallyEncryptedData;
      }
      constructor() {
        this.encrypted = null, this.packets = null;
      }
      read(e2) {
        this.encrypted = e2;
      }
      write() {
        return this.encrypted;
      }
      async decrypt(e2, t2, r3 = F) {
        if (!r3.allowUnauthenticatedMessages) throw Error("Message is not authenticated.");
        const { blockSize: n3 } = Kr(e2), i3 = await D(B(this.encrypted)), s3 = await Vn(e2, t2, i3.subarray(n3 + 2), i3.subarray(2, n3 + 2));
        this.packets = await Gs.fromBinary(s3, ua, r3);
      }
      async encrypt(e2, t2, r3 = F) {
        const n3 = this.packets.write(), { blockSize: i3 } = Kr(e2), s3 = await Gn(e2), a3 = await jn(e2, t2, s3, new Uint8Array(i3)), o3 = await jn(e2, t2, n3, a3.subarray(2));
        this.encrypted = L.concat([a3, o3]);
      }
    };
    fa = class {
      static get tag() {
        return R.packet.marker;
      }
      read(e2) {
        return 80 === e2[0] && 71 === e2[1] && 80 === e2[2];
      }
      write() {
        return new Uint8Array([80, 71, 80]);
      }
    };
    la = class _la extends ca {
      static get tag() {
        return R.packet.publicSubkey;
      }
      constructor(e2, t2) {
        super(e2, t2);
      }
      static fromSecretSubkeyPacket(e2) {
        const t2 = new _la(), { version: r3, created: n3, algorithm: i3, publicParams: s3, keyID: a3, fingerprint: o3 } = e2;
        return t2.version = r3, t2.created = n3, t2.algorithm = i3, t2.publicParams = s3, t2.keyID = a3, t2.fingerprint = o3, t2;
      }
    };
    ya = class _ya {
      static get tag() {
        return R.packet.userAttribute;
      }
      constructor() {
        this.attributes = [];
      }
      read(e2) {
        let t2 = 0;
        for (; t2 < e2.length; ) {
          const r3 = et(e2.subarray(t2, e2.length));
          t2 += r3.offset, this.attributes.push(L.uint8ArrayToString(e2.subarray(t2, t2 + r3.len))), t2 += r3.len;
        }
      }
      write() {
        const e2 = [];
        for (let t2 = 0; t2 < this.attributes.length; t2++) e2.push(tt(this.attributes[t2].length)), e2.push(L.stringToUint8Array(this.attributes[t2]));
        return L.concatUint8Array(e2);
      }
      equals(e2) {
        return !!(e2 && e2 instanceof _ya) && this.attributes.every(function(t2, r3) {
          return t2 === e2.attributes[r3];
        });
      }
    };
    ga = class extends ca {
      static get tag() {
        return R.packet.secretKey;
      }
      constructor(e2 = /* @__PURE__ */ new Date(), t2 = F) {
        super(e2, t2), this.keyMaterial = null, this.isEncrypted = null, this.s2kUsage = 0, this.s2k = null, this.symmetric = null, this.aead = null, this.isLegacyAEAD = null, this.privateParams = null, this.usedModernAEAD = null;
      }
      async read(e2, t2 = F) {
        let r3 = await this.readPublicKey(e2, t2);
        const n3 = r3;
        this.s2kUsage = e2[r3++], 5 === this.version && r3++, 6 === this.version && this.s2kUsage && r3++;
        try {
          if (255 === this.s2kUsage || 254 === this.s2kUsage || 253 === this.s2kUsage) {
            this.symmetric = e2[r3++], 253 === this.s2kUsage && (this.aead = e2[r3++]), 6 === this.version && r3++;
            const t3 = e2[r3++];
            if (this.s2k = Ti(t3), r3 += this.s2k.read(e2.subarray(r3, e2.length)), "gnu-dummy" === this.s2k.type) return;
          } else this.s2kUsage && (this.symmetric = this.s2kUsage);
          this.s2kUsage && (this.isLegacyAEAD = 253 === this.s2kUsage && (5 === this.version || 4 === this.version && t2.parseAEADEncryptedV4KeysAsLegacy), 253 !== this.s2kUsage || this.isLegacyAEAD ? (this.iv = e2.subarray(r3, r3 + Kr(this.symmetric).blockSize), this.usedModernAEAD = false) : (this.iv = e2.subarray(r3, r3 + Ci(this.aead).ivLength), this.usedModernAEAD = true), r3 += this.iv.length);
        } catch (t3) {
          if (!this.s2kUsage) throw t3;
          this.unparseableKeyMaterial = e2.subarray(n3), this.isEncrypted = true;
        }
        if (5 === this.version && (r3 += 4), this.keyMaterial = e2.subarray(r3), this.isEncrypted = !!this.s2kUsage, !this.isEncrypted) {
          let e3;
          if (6 === this.version) e3 = this.keyMaterial;
          else if (e3 = this.keyMaterial.subarray(0, -2), !L.equalsUint8Array(L.writeChecksum(e3), this.keyMaterial.subarray(-2))) throw Error("Key checksum mismatch");
          try {
            const { read: t3, privateParams: r4 } = xn(this.algorithm, e3, this.publicParams);
            if (t3 < e3.length) throw Error("Error reading MPIs");
            this.privateParams = r4;
          } catch (e4) {
            if (e4 instanceof ot) throw e4;
            throw Error("Error reading MPIs");
          }
        }
      }
      write() {
        const e2 = this.writePublicKey();
        if (this.unparseableKeyMaterial) return L.concatUint8Array([e2, this.unparseableKeyMaterial]);
        const t2 = [e2];
        t2.push(new Uint8Array([this.s2kUsage]));
        const r3 = [];
        if (255 === this.s2kUsage || 254 === this.s2kUsage || 253 === this.s2kUsage) {
          r3.push(this.symmetric), 253 === this.s2kUsage && r3.push(this.aead);
          const e3 = this.s2k.write();
          6 === this.version && r3.push(e3.length), r3.push(...e3);
        }
        return this.s2kUsage && "gnu-dummy" !== this.s2k.type && r3.push(...this.iv), (5 === this.version || 6 === this.version && this.s2kUsage) && t2.push(new Uint8Array([r3.length])), t2.push(new Uint8Array(r3)), this.isDummy() || (this.s2kUsage || (this.keyMaterial = Qn(this.algorithm, this.privateParams)), 5 === this.version && t2.push(L.writeNumber(this.keyMaterial.length, 4)), t2.push(this.keyMaterial), this.s2kUsage || 6 === this.version || t2.push(L.writeChecksum(this.keyMaterial))), L.concatUint8Array(t2);
      }
      isDecrypted() {
        return false === this.isEncrypted;
      }
      isMissingSecretKeyMaterial() {
        return void 0 !== this.unparseableKeyMaterial || this.isDummy();
      }
      isDummy() {
        return !(!this.s2k || "gnu-dummy" !== this.s2k.type);
      }
      makeDummy(e2 = F) {
        this.isDummy() || (this.isDecrypted() && this.clearPrivateParams(), delete this.unparseableKeyMaterial, this.isEncrypted = null, this.keyMaterial = null, this.s2k = Ti(R.s2k.gnu, e2), this.s2k.algorithm = 0, this.s2k.c = 0, this.s2k.type = "gnu-dummy", this.s2kUsage = 254, this.symmetric = R.symmetric.aes256, this.isLegacyAEAD = null, this.usedModernAEAD = null);
      }
      async encrypt(e2, t2 = F) {
        if (this.isDummy()) return;
        if (!this.isDecrypted()) throw Error("Key packet is already encrypted");
        if (!e2) throw Error("A non-empty passphrase is required for key encryption.");
        this.s2k = Li(t2), this.s2k.generateSalt();
        const r3 = Qn(this.algorithm, this.privateParams);
        this.symmetric = R.symmetric.aes256;
        const { blockSize: n3 } = Kr(this.symmetric);
        if (t2.aeadProtect) {
          this.s2kUsage = 253, this.aead = t2.preferredAEADAlgorithm;
          const i3 = Ci(this.aead);
          this.isLegacyAEAD = 5 === this.version, this.usedModernAEAD = !this.isLegacyAEAD;
          const s3 = nt(this.constructor.tag), a3 = await pa(this.version, this.s2k, e2, this.symmetric, this.aead, s3, this.isLegacyAEAD, t2), o3 = await i3(this.symmetric, a3);
          this.iv = this.isLegacyAEAD ? pe(n3) : pe(i3.ivLength);
          const c3 = this.isLegacyAEAD ? new Uint8Array() : L.concatUint8Array([s3, this.writePublicKey()]);
          this.keyMaterial = await o3.encrypt(r3, this.iv.subarray(0, i3.ivLength), c3);
        } else {
          this.s2kUsage = 254, this.usedModernAEAD = false;
          const i3 = await pa(this.version, this.s2k, e2, this.symmetric, void 0, void 0, void 0, t2);
          this.iv = pe(n3), this.keyMaterial = await jn(this.symmetric, i3, L.concatUint8Array([r3, await Re(R.hash.sha1, r3)]), this.iv);
        }
      }
      async decrypt(e2, t2 = F) {
        if (this.isDummy()) return false;
        if (this.unparseableKeyMaterial) throw Error("Key packet cannot be decrypted: unsupported S2K or cipher algo");
        if (this.isDecrypted()) throw Error("Key packet is already decrypted.");
        let r3;
        const n3 = nt(this.constructor.tag);
        if (254 !== this.s2kUsage && 253 !== this.s2kUsage) throw 255 === this.s2kUsage ? Error("Encrypted private key is authenticated using an insecure two-byte hash") : Error("Private key is encrypted using an insecure S2K function: unsalted MD5");
        let i3;
        if (r3 = await pa(this.version, this.s2k, e2, this.symmetric, this.aead, n3, this.isLegacyAEAD, t2), 253 === this.s2kUsage) {
          const e3 = Ci(this.aead, true), t3 = await e3(this.symmetric, r3);
          try {
            const r4 = this.isLegacyAEAD ? new Uint8Array() : L.concatUint8Array([n3, this.writePublicKey()]);
            i3 = await t3.decrypt(this.keyMaterial, this.iv.subarray(0, e3.ivLength), r4);
          } catch (e4) {
            if ("Authentication tag mismatch" === e4.message) throw Error("Incorrect key passphrase: " + e4.message);
            throw e4;
          }
        } else {
          const e3 = await Vn(this.symmetric, r3, this.keyMaterial, this.iv);
          i3 = e3.subarray(0, -20);
          const t3 = await Re(R.hash.sha1, i3);
          if (!L.equalsUint8Array(t3, e3.subarray(-20))) throw Error("Incorrect key passphrase");
        }
        try {
          const { privateParams: e3 } = xn(this.algorithm, i3, this.publicParams);
          this.privateParams = e3;
        } catch {
          throw Error("Error reading MPIs");
        }
        this.isEncrypted = false, this.keyMaterial = null, this.s2kUsage = 0, this.aead = null, this.symmetric = null, this.isLegacyAEAD = null;
      }
      async validate() {
        if (this.isDummy()) return;
        if (!this.isDecrypted()) throw Error("Key is not decrypted");
        if (this.usedModernAEAD) return;
        let e2;
        try {
          e2 = await Rn(this.algorithm, this.publicParams, this.privateParams);
        } catch {
          e2 = false;
        }
        if (!e2) throw Error("Key is invalid");
      }
      async generate(e2, t2) {
        if (6 === this.version && (this.algorithm === R.publicKey.ecdh && t2 === R.curve.curve25519Legacy || this.algorithm === R.publicKey.eddsaLegacy)) throw Error(`Cannot generate v6 keys of type 'ecc' with curve ${t2}. Generate a key of type 'curve25519' instead`);
        const { privateParams: r3, publicParams: n3 } = await Mn(this.algorithm, e2, t2);
        this.privateParams = r3, this.publicParams = n3, this.isEncrypted = false;
      }
      clearPrivateParams() {
        this.isMissingSecretKeyMaterial() || (Object.keys(this.privateParams).forEach((e2) => {
          this.privateParams[e2].fill(0), delete this.privateParams[e2];
        }), this.privateParams = null, this.isEncrypted = true);
      }
    };
    da = class _da {
      static get tag() {
        return R.packet.userID;
      }
      constructor() {
        this.userID = "", this.name = "", this.email = "", this.comment = "";
      }
      static fromObject(e2) {
        if (L.isString(e2) || e2.name && !L.isString(e2.name) || e2.email && !L.isEmailAddress(e2.email) || e2.comment && !L.isString(e2.comment)) throw Error("Invalid user ID format");
        const t2 = new _da();
        Object.assign(t2, e2);
        const r3 = [];
        return t2.name && r3.push(t2.name), t2.comment && r3.push(`(${t2.comment})`), t2.email && r3.push(`<${t2.email}>`), t2.userID = r3.join(" "), t2;
      }
      read(e2, t2 = F) {
        const r3 = L.decodeUTF8(e2);
        if (r3.length > t2.maxUserIDLength) throw Error("User ID string is too long");
        const n3 = (e3) => /^[^\s@]+@[^\s@]+$/.test(e3), i3 = r3.indexOf("<"), s3 = r3.lastIndexOf(">");
        if (-1 !== i3 && -1 !== s3 && s3 > i3) {
          const e3 = r3.substring(i3 + 1, s3);
          if (n3(e3)) {
            this.email = e3;
            const t3 = r3.substring(0, i3).trim(), n4 = t3.indexOf("("), s4 = t3.lastIndexOf(")");
            -1 !== n4 && -1 !== s4 && s4 > n4 ? (this.comment = t3.substring(n4 + 1, s4).trim(), this.name = t3.substring(0, n4).trim()) : (this.name = t3, this.comment = "");
          }
        } else n3(r3.trim()) && (this.email = r3.trim(), this.name = "", this.comment = "");
        this.userID = r3;
      }
      write() {
        return L.encodeUTF8(this.userID);
      }
      equals(e2) {
        return e2 && e2.userID === this.userID;
      }
    };
    Aa = class extends ga {
      static get tag() {
        return R.packet.secretSubkey;
      }
      constructor(e2 = /* @__PURE__ */ new Date(), t2 = F) {
        super(e2, t2);
      }
    };
    wa = class {
      static get tag() {
        return R.packet.trust;
      }
      read() {
        throw new ot("Trust packets are not supported");
      }
      write() {
        throw new ot("Trust packets are not supported");
      }
    };
    ma = class {
      static get tag() {
        return R.packet.padding;
      }
      constructor() {
        this.padding = null;
      }
      read(e2) {
      }
      write() {
        return this.padding;
      }
      async createPadding(e2) {
        this.padding = pe(e2);
      }
    };
    ba = /* @__PURE__ */ L.constructAllowedPackets([Ls]);
    ka = class {
      constructor(e2) {
        this.packets = e2 || new Gs();
      }
      write() {
        return this.packets.write();
      }
      armor(e2 = F) {
        const t2 = this.packets.some((e3) => e3.constructor.tag === Ls.tag && 6 !== e3.version);
        return ee(R.armor.signature, this.write(), void 0, void 0, void 0, t2, e2);
      }
      getSigningKeyIDs() {
        return this.packets.map((e2) => e2.issuerKeyID);
      }
    };
    La = class _La {
      constructor(e2, t2) {
        this.userID = e2.constructor.tag === R.packet.userID ? e2 : null, this.userAttribute = e2.constructor.tag === R.packet.userAttribute ? e2 : null, this.selfCertifications = [], this.otherCertifications = [], this.revocationSignatures = [], this.mainKey = t2;
      }
      toPacketList() {
        const e2 = new Gs();
        return e2.push(this.userID || this.userAttribute), e2.push(...this.revocationSignatures), e2.push(...this.selfCertifications), e2.push(...this.otherCertifications), e2;
      }
      clone() {
        const e2 = new _La(this.userID || this.userAttribute, this.mainKey);
        return e2.selfCertifications = [...this.selfCertifications], e2.otherCertifications = [...this.otherCertifications], e2.revocationSignatures = [...this.revocationSignatures], e2;
      }
      async certify(e2, t2, r3) {
        const n3 = this.mainKey.keyPacket, i3 = { userID: this.userID, userAttribute: this.userAttribute, key: n3 }, s3 = new _La(i3.userID || i3.userAttribute, this.mainKey);
        return s3.otherCertifications = await Promise.all(e2.map(async function(e3) {
          if (!e3.isPrivate()) throw Error("Need private key for signing");
          if (e3.hasSameFingerprintAs(n3)) throw Error("The user's own key can only be used for self-certifications");
          const s4 = await e3.getSigningKey(void 0, t2, void 0, r3);
          return Da(i3, [e3], s4.keyPacket, { signatureType: R.signature.certGeneric, keyFlags: [R.keyFlags.certifyKeys | R.keyFlags.signData] }, t2, void 0, void 0, void 0, r3);
        })), await s3.update(this, t2, r3), s3;
      }
      async isRevoked(e2, t2, r3 = /* @__PURE__ */ new Date(), n3 = F) {
        const i3 = this.mainKey.keyPacket;
        return Pa(i3, R.signature.certRevocation, { key: i3, userID: this.userID, userAttribute: this.userAttribute }, this.revocationSignatures, e2, t2, r3, n3);
      }
      async verifyCertificate(e2, t2, r3 = /* @__PURE__ */ new Date(), n3) {
        const i3 = this, s3 = this.mainKey.keyPacket, a3 = { userID: this.userID, userAttribute: this.userAttribute, key: s3 }, { issuerKeyID: o3 } = e2, c3 = t2.filter((e3) => e3.getKeys(o3).length > 0);
        return 0 === c3.length ? null : (await Promise.all(c3.map(async (t3) => {
          const s4 = await t3.getSigningKey(o3, e2.created, void 0, n3);
          if (e2.revoked || await i3.isRevoked(e2, s4.keyPacket, r3, n3)) throw Error("User certificate is revoked");
          try {
            await e2.verify(s4.keyPacket, R.signature.certGeneric, a3, r3, void 0, n3);
          } catch (e3) {
            throw L.wrapError("User certificate is invalid", e3);
          }
        })), true);
      }
      async verifyAllCertifications(e2, t2 = /* @__PURE__ */ new Date(), r3) {
        const n3 = this, i3 = this.selfCertifications.concat(this.otherCertifications);
        return Promise.all(i3.map(async (i4) => ({ keyID: i4.issuerKeyID, valid: await n3.verifyCertificate(i4, e2, t2, r3).catch(() => false) })));
      }
      async verify(e2 = /* @__PURE__ */ new Date(), t2) {
        if (!this.selfCertifications.length) throw Error("No self-certifications found");
        const r3 = this, n3 = this.mainKey.keyPacket, i3 = { userID: this.userID, userAttribute: this.userAttribute, key: n3 };
        let s3;
        for (let a3 = this.selfCertifications.length - 1; a3 >= 0; a3--) try {
          const s4 = this.selfCertifications[a3];
          if (s4.revoked || await r3.isRevoked(s4, void 0, e2, t2)) throw Error("Self-certification is revoked");
          try {
            await s4.verify(n3, R.signature.certGeneric, i3, e2, void 0, t2);
          } catch (e3) {
            throw L.wrapError("Self-certification is invalid", e3);
          }
          return true;
        } catch (e3) {
          s3 = e3;
        }
        throw s3;
      }
      async update(e2, t2, r3) {
        const n3 = this.mainKey.keyPacket, i3 = { userID: this.userID, userAttribute: this.userAttribute, key: n3 };
        await Ua(e2, this, "selfCertifications", t2, async function(e3) {
          try {
            return await e3.verify(n3, R.signature.certGeneric, i3, t2, false, r3), true;
          } catch {
            return false;
          }
        }), await Ua(e2, this, "otherCertifications", t2), await Ua(e2, this, "revocationSignatures", t2, function(e3) {
          return Pa(n3, R.signature.certRevocation, i3, [e3], void 0, void 0, t2, r3);
        });
      }
      async revoke(e2, { flag: t2 = R.reasonForRevocation.noReason, string: r3 = "" } = {}, n3 = /* @__PURE__ */ new Date(), i3 = F) {
        const s3 = { userID: this.userID, userAttribute: this.userAttribute, key: e2 }, a3 = new _La(s3.userID || s3.userAttribute, this.mainKey);
        return a3.revocationSignatures.push(await Da(s3, [], e2, { signatureType: R.signature.certRevocation, reasonForRevocationFlag: R.write(R.reasonForRevocation, t2), reasonForRevocationString: r3 }, n3, void 0, void 0, false, i3)), await a3.update(this), a3;
      }
    };
    Na = class _Na {
      constructor(e2, t2) {
        this.keyPacket = e2, this.bindingSignatures = [], this.revocationSignatures = [], this.mainKey = t2;
      }
      toPacketList() {
        const e2 = new Gs();
        return e2.push(this.keyPacket), e2.push(...this.revocationSignatures), e2.push(...this.bindingSignatures), e2;
      }
      clone() {
        const e2 = new _Na(this.keyPacket, this.mainKey);
        return e2.bindingSignatures = [...this.bindingSignatures], e2.revocationSignatures = [...this.revocationSignatures], e2;
      }
      async isRevoked(e2, t2, r3 = /* @__PURE__ */ new Date(), n3 = F) {
        const i3 = this.mainKey.keyPacket;
        return Pa(i3, R.signature.subkeyRevocation, { key: i3, bind: this.keyPacket }, this.revocationSignatures, e2, t2, r3, n3);
      }
      async verify(e2 = /* @__PURE__ */ new Date(), t2 = F) {
        const r3 = this.mainKey.keyPacket, n3 = { key: r3, bind: this.keyPacket }, i3 = await Ba(this.bindingSignatures, r3, R.signature.subkeyBinding, n3, e2, t2);
        if (i3.revoked || await this.isRevoked(i3, null, e2, t2)) throw Error("Subkey is revoked");
        if (Sa(this.keyPacket, i3, e2)) throw Error("Subkey is expired");
        return i3;
      }
      async getExpirationTime(e2 = /* @__PURE__ */ new Date(), t2 = F) {
        const r3 = this.mainKey.keyPacket, n3 = { key: r3, bind: this.keyPacket };
        let i3;
        try {
          i3 = await Ba(this.bindingSignatures, r3, R.signature.subkeyBinding, n3, e2, t2);
        } catch {
          return null;
        }
        const s3 = xa(this.keyPacket, i3), a3 = i3.getExpirationTime();
        return s3 < a3 ? s3 : a3;
      }
      async update(e2, t2 = /* @__PURE__ */ new Date(), r3 = F) {
        const n3 = this.mainKey.keyPacket;
        if (!this.hasSameFingerprintAs(e2)) throw Error("Subkey update method: fingerprints of subkeys not equal");
        this.keyPacket.constructor.tag === R.packet.publicSubkey && e2.keyPacket.constructor.tag === R.packet.secretSubkey && (this.keyPacket = e2.keyPacket);
        const i3 = this, s3 = { key: n3, bind: i3.keyPacket };
        await Ua(e2, this, "bindingSignatures", t2, async function(e3) {
          for (let t3 = 0; t3 < i3.bindingSignatures.length; t3++) if (i3.bindingSignatures[t3].issuerKeyID.equals(e3.issuerKeyID)) return e3.created > i3.bindingSignatures[t3].created && (i3.bindingSignatures[t3] = e3), false;
          try {
            return await e3.verify(n3, R.signature.subkeyBinding, s3, t2, void 0, r3), true;
          } catch {
            return false;
          }
        }), await Ua(e2, this, "revocationSignatures", t2, function(e3) {
          return Pa(n3, R.signature.subkeyRevocation, s3, [e3], void 0, void 0, t2, r3);
        });
      }
      async revoke(e2, { flag: t2 = R.reasonForRevocation.noReason, string: r3 = "" } = {}, n3 = /* @__PURE__ */ new Date(), i3 = F) {
        const s3 = { key: e2, bind: this.keyPacket }, a3 = new _Na(this.keyPacket, this.mainKey);
        return a3.revocationSignatures.push(await Da(s3, [], e2, { signatureType: R.signature.subkeyRevocation, reasonForRevocationFlag: R.write(R.reasonForRevocation, t2), reasonForRevocationString: r3 }, n3, void 0, void 0, false, i3)), await a3.update(this), a3;
      }
      hasSameFingerprintAs(e2) {
        return this.keyPacket.hasSameFingerprintAs(e2.keyPacket || e2);
      }
    };
    ["getKeyID", "getFingerprint", "getAlgorithmInfo", "getCreationTime", "isDecrypted"].forEach((e2) => {
      Na.prototype[e2] = function() {
        return this.keyPacket[e2]();
      };
    });
    Oa = /* @__PURE__ */ L.constructAllowedPackets([Ls]);
    Ha = /* @__PURE__ */ new Set([R.packet.publicKey, R.packet.privateKey]);
    za = /* @__PURE__ */ new Set([R.packet.publicKey, R.packet.privateKey, R.packet.publicSubkey, R.packet.privateSubkey]);
    Ga = class {
      packetListToStructure(e2, t2 = /* @__PURE__ */ new Set()) {
        let r3, n3, i3, s3;
        for (const a3 of e2) {
          if (a3 instanceof ht) {
            za.has(a3.tag) && !s3 && (s3 = Ha.has(a3.tag) ? Ha : za);
            continue;
          }
          const e3 = a3.constructor.tag;
          if (s3) {
            if (!s3.has(e3)) continue;
            s3 = null;
          }
          if (t2.has(e3)) throw Error("Unexpected packet type: " + e3);
          switch (e3) {
            case R.packet.publicKey:
            case R.packet.secretKey:
              if (this.keyPacket) throw Error("Key block contains multiple keys");
              if (this.keyPacket = a3, n3 = this.getKeyID(), !n3) throw Error("Missing Key ID");
              break;
            case R.packet.userID:
            case R.packet.userAttribute:
              r3 = new La(a3, this), this.users.push(r3);
              break;
            case R.packet.publicSubkey:
            case R.packet.secretSubkey:
              r3 = null, i3 = new Na(a3, this), this.subkeys.push(i3);
              break;
            case R.packet.signature:
              switch (a3.signatureType) {
                case R.signature.certGeneric:
                case R.signature.certPersona:
                case R.signature.certCasual:
                case R.signature.certPositive:
                  if (!r3) {
                    L.printDebug("Dropping certification signatures without preceding user packet");
                    continue;
                  }
                  a3.issuerKeyID.equals(n3) ? r3.selfCertifications.push(a3) : r3.otherCertifications.push(a3);
                  break;
                case R.signature.certRevocation:
                  r3 ? r3.revocationSignatures.push(a3) : this.directSignatures.push(a3);
                  break;
                case R.signature.key:
                  this.directSignatures.push(a3);
                  break;
                case R.signature.subkeyBinding:
                  if (!i3) {
                    L.printDebug("Dropping subkey binding signature without preceding subkey packet");
                    continue;
                  }
                  i3.bindingSignatures.push(a3);
                  break;
                case R.signature.keyRevocation:
                  this.revocationSignatures.push(a3);
                  break;
                case R.signature.subkeyRevocation:
                  if (!i3) {
                    L.printDebug("Dropping subkey revocation signature without preceding subkey packet");
                    continue;
                  }
                  i3.revocationSignatures.push(a3);
              }
          }
        }
      }
      toPacketList() {
        const e2 = new Gs();
        return e2.push(this.keyPacket), e2.push(...this.revocationSignatures), e2.push(...this.directSignatures), this.users.map((t2) => e2.push(...t2.toPacketList())), this.subkeys.map((t2) => e2.push(...t2.toPacketList())), e2;
      }
      clone(e2 = false) {
        const t2 = new this.constructor(this.toPacketList());
        return e2 && t2.getKeys().forEach((e3) => {
          if (e3.keyPacket = Object.create(Object.getPrototypeOf(e3.keyPacket), Object.getOwnPropertyDescriptors(e3.keyPacket)), !e3.keyPacket.isDecrypted()) return;
          const t3 = {};
          Object.keys(e3.keyPacket.privateParams).forEach((r3) => {
            t3[r3] = new Uint8Array(e3.keyPacket.privateParams[r3]);
          }), e3.keyPacket.privateParams = t3;
        }), t2;
      }
      getSubkeys(e2 = null) {
        return this.subkeys.filter((t2) => !e2 || t2.getKeyID().equals(e2, true));
      }
      getKeys(e2 = null) {
        const t2 = [];
        return e2 && !this.getKeyID().equals(e2, true) || t2.push(this), t2.concat(this.getSubkeys(e2));
      }
      getKeyIDs() {
        return this.getKeys().map((e2) => e2.getKeyID());
      }
      getUserIDs() {
        return this.users.map((e2) => e2.userID ? e2.userID.userID : null).filter((e2) => null !== e2);
      }
      write() {
        return this.toPacketList().write();
      }
      async getSigningKey(e2 = null, t2 = /* @__PURE__ */ new Date(), r3 = {}, n3 = F) {
        await this.verifyPrimaryKey(t2, r3, n3);
        const i3 = this.keyPacket;
        try {
          Ta(i3, n3);
        } catch (e3) {
          throw L.wrapError("Could not verify primary key", e3);
        }
        const s3 = this.subkeys.slice().sort((e3, t3) => t3.keyPacket.created - e3.keyPacket.created || t3.keyPacket.algorithm - e3.keyPacket.algorithm);
        let a3;
        for (const r4 of s3) if (!e2 || r4.getKeyID().equals(e2)) try {
          await r4.verify(t2, n3);
          const e3 = { key: i3, bind: r4.keyPacket }, s4 = await Ba(r4.bindingSignatures, i3, R.signature.subkeyBinding, e3, t2, n3);
          if (!Ma(r4.keyPacket, s4, n3)) continue;
          if (!s4.embeddedSignature) throw Error("Missing embedded signature");
          return await Ba([s4.embeddedSignature], r4.keyPacket, R.signature.keyBinding, e3, t2, n3), Ta(r4.keyPacket, n3), r4;
        } catch (e3) {
          a3 = e3;
        }
        try {
          const s4 = await this.getPrimarySelfSignature(t2, r3, n3);
          if ((!e2 || i3.getKeyID().equals(e2)) && Ma(i3, s4, n3)) return Ta(i3, n3), this;
        } catch (e3) {
          a3 = e3;
        }
        throw L.wrapError("Could not find valid signing key packet in key " + this.getKeyID().toHex(), a3);
      }
      async getEncryptionKey(e2, t2 = /* @__PURE__ */ new Date(), r3 = {}, n3 = F) {
        await this.verifyPrimaryKey(t2, r3, n3);
        const i3 = this.keyPacket;
        try {
          Ta(i3, n3);
        } catch (e3) {
          throw L.wrapError("Could not verify primary key", e3);
        }
        const s3 = this.subkeys.slice().sort((e3, t3) => t3.keyPacket.created - e3.keyPacket.created || t3.keyPacket.algorithm - e3.keyPacket.algorithm);
        let a3;
        for (const r4 of s3) if (!e2 || r4.getKeyID().equals(e2)) try {
          await r4.verify(t2, n3);
          const e3 = { key: i3, bind: r4.keyPacket }, s4 = await Ba(r4.bindingSignatures, i3, R.signature.subkeyBinding, e3, t2, n3);
          if (Ra(r4.keyPacket, s4, n3)) return Ta(r4.keyPacket, n3), r4;
        } catch (e3) {
          a3 = e3;
        }
        try {
          const s4 = await this.getPrimarySelfSignature(t2, r3, n3);
          if ((!e2 || i3.getKeyID().equals(e2)) && Ra(i3, s4, n3)) return Ta(i3, n3), this;
        } catch (e3) {
          a3 = e3;
        }
        throw L.wrapError("Could not find valid encryption key packet in key " + this.getKeyID().toHex(), a3);
      }
      async isRevoked(e2, t2, r3 = /* @__PURE__ */ new Date(), n3 = F) {
        return Pa(this.keyPacket, R.signature.keyRevocation, { key: this.keyPacket }, this.revocationSignatures, e2, t2, r3, n3);
      }
      async verifyPrimaryKey(e2 = /* @__PURE__ */ new Date(), t2 = {}, r3 = F) {
        const n3 = this.keyPacket;
        if (await this.isRevoked(null, null, e2, r3)) throw Error("Primary key is revoked");
        if (Sa(n3, await this.getPrimarySelfSignature(e2, t2, r3), e2)) throw Error("Primary key is expired");
        if (6 !== n3.version) {
          const t3 = await Ba(this.directSignatures, n3, R.signature.key, { key: n3 }, e2, r3).catch(() => {
          });
          if (t3 && Sa(n3, t3, e2)) throw Error("Primary key is expired");
        }
      }
      async getExpirationTime(e2, t2 = F) {
        let r3;
        try {
          const n3 = await this.getPrimarySelfSignature(null, e2, t2), i3 = xa(this.keyPacket, n3), s3 = n3.getExpirationTime(), a3 = 6 !== this.keyPacket.version && await Ba(this.directSignatures, this.keyPacket, R.signature.key, { key: this.keyPacket }, null, t2).catch(() => {
          });
          if (a3) {
            const e3 = xa(this.keyPacket, a3);
            r3 = Math.min(i3, s3, e3);
          } else r3 = i3 < s3 ? i3 : s3;
        } catch {
          r3 = null;
        }
        return L.normalizeDate(r3);
      }
      async getPrimarySelfSignature(e2 = /* @__PURE__ */ new Date(), t2 = {}, r3 = F) {
        const n3 = this.keyPacket;
        if (6 === n3.version) return Ba(this.directSignatures, n3, R.signature.key, { key: n3 }, e2, r3);
        const { selfCertification: i3 } = await this.getPrimaryUser(e2, t2, r3);
        return i3;
      }
      async getPrimaryUser(e2 = /* @__PURE__ */ new Date(), t2 = {}, r3 = F) {
        const n3 = this.keyPacket, i3 = [];
        let s3;
        for (let a4 = 0; a4 < this.users.length; a4++) try {
          const s4 = this.users[a4];
          if (!s4.userID) continue;
          if (void 0 !== t2.name && s4.userID.name !== t2.name || void 0 !== t2.email && s4.userID.email !== t2.email || void 0 !== t2.comment && s4.userID.comment !== t2.comment) throw Error("Could not find user that matches that user ID");
          const o4 = { userID: s4.userID, key: n3 }, c4 = await Ba(s4.selfCertifications, n3, R.signature.certGeneric, o4, e2, r3);
          i3.push({ index: a4, user: s4, selfCertification: c4 });
        } catch (e3) {
          s3 = e3;
        }
        if (!i3.length) throw s3 || Error("Could not find primary user");
        await Promise.all(i3.map(async (t3) => {
          t3.selfCertification.revoked || await t3.user.isRevoked(t3.selfCertification, null, e2, r3);
        }));
        const a3 = i3.sort(function(e3, t3) {
          const r4 = e3.selfCertification, n4 = t3.selfCertification;
          return n4.revoked - r4.revoked || r4.isPrimaryUserID - n4.isPrimaryUserID || r4.created - n4.created;
        }).pop(), { user: o3, selfCertification: c3 } = a3;
        if (c3.revoked || await o3.isRevoked(c3, null, e2, r3)) throw Error("Primary user is revoked");
        return a3;
      }
      async update(e2, t2 = /* @__PURE__ */ new Date(), r3 = F) {
        if (!this.hasSameFingerprintAs(e2)) throw Error("Primary key fingerprints must be equal to update the key");
        if (!this.isPrivate() && e2.isPrivate()) {
          if (!(this.subkeys.length === e2.subkeys.length && this.subkeys.every((t3) => e2.subkeys.some((e3) => t3.hasSameFingerprintAs(e3))))) throw Error("Cannot update public key with private key if subkeys mismatch");
          return e2.update(this, r3);
        }
        const n3 = this.clone();
        return await Ua(e2, n3, "revocationSignatures", t2, (i3) => Pa(n3.keyPacket, R.signature.keyRevocation, n3, [i3], null, e2.keyPacket, t2, r3)), await Ua(e2, n3, "directSignatures", t2), await Promise.all(e2.users.map(async (e3) => {
          const i3 = n3.users.filter((t3) => e3.userID && e3.userID.equals(t3.userID) || e3.userAttribute && e3.userAttribute.equals(t3.userAttribute));
          if (i3.length > 0) await Promise.all(i3.map((n4) => n4.update(e3, t2, r3)));
          else {
            const t3 = e3.clone();
            t3.mainKey = n3, n3.users.push(t3);
          }
        })), await Promise.all(e2.subkeys.map(async (e3) => {
          const i3 = n3.subkeys.filter((t3) => t3.hasSameFingerprintAs(e3));
          if (i3.length > 0) await Promise.all(i3.map((n4) => n4.update(e3, t2, r3)));
          else {
            const t3 = e3.clone();
            t3.mainKey = n3, n3.subkeys.push(t3);
          }
        })), n3;
      }
      async getRevocationCertificate(e2 = /* @__PURE__ */ new Date(), t2 = F) {
        const r3 = { key: this.keyPacket }, n3 = await Ba(this.revocationSignatures, this.keyPacket, R.signature.keyRevocation, r3, e2, t2), i3 = new Gs();
        i3.push(n3);
        const s3 = 6 !== this.keyPacket.version;
        return ee(R.armor.publicKey, i3.write(), null, null, "This is a revocation certificate", s3, t2);
      }
      async applyRevocationCertificate(e2, t2 = /* @__PURE__ */ new Date(), r3 = F) {
        const n3 = await $(e2), i3 = (await Gs.fromBinary(n3.data, Oa, r3)).findPacket(R.packet.signature);
        if (!i3 || i3.signatureType !== R.signature.keyRevocation) throw Error("Could not find revocation signature packet");
        if (!i3.issuerKeyID.equals(this.getKeyID())) throw Error("Revocation signature does not match key");
        try {
          await i3.verify(this.keyPacket, R.signature.keyRevocation, { key: this.keyPacket }, t2, void 0, r3);
        } catch (e3) {
          throw L.wrapError("Could not verify revocation signature", e3);
        }
        const s3 = this.clone();
        return s3.revocationSignatures.push(i3), s3;
      }
      async signPrimaryUser(e2, t2, r3, n3 = F) {
        const { index: i3, user: s3 } = await this.getPrimaryUser(t2, r3, n3), a3 = await s3.certify(e2, t2, n3), o3 = this.clone();
        return o3.users[i3] = a3, o3;
      }
      async signAllUsers(e2, t2 = /* @__PURE__ */ new Date(), r3 = F) {
        const n3 = this.clone();
        return n3.users = await Promise.all(this.users.map(function(n4) {
          return n4.certify(e2, t2, r3);
        })), n3;
      }
      async verifyPrimaryUser(e2, t2 = /* @__PURE__ */ new Date(), r3, n3 = F) {
        const i3 = this.keyPacket, { user: s3 } = await this.getPrimaryUser(t2, r3, n3);
        return e2 ? await s3.verifyAllCertifications(e2, t2, n3) : [{ keyID: i3.getKeyID(), valid: await s3.verify(t2, n3).catch(() => false) }];
      }
      async verifyAllUsers(e2, t2 = /* @__PURE__ */ new Date(), r3 = F) {
        const n3 = this.keyPacket, i3 = [];
        return await Promise.all(this.users.map(async (s3) => {
          const a3 = e2 ? await s3.verifyAllCertifications(e2, t2, r3) : [{ keyID: n3.getKeyID(), valid: await s3.verify(t2, r3).catch(() => false) }];
          i3.push(...a3.map((e3) => ({ userID: s3.userID ? s3.userID.userID : null, userAttribute: s3.userAttribute, keyID: e3.keyID, valid: e3.valid })));
        })), i3;
      }
    };
    ["getKeyID", "getFingerprint", "getAlgorithmInfo", "getCreationTime", "hasSameFingerprintAs"].forEach((e2) => {
      Ga.prototype[e2] = Na.prototype[e2];
    });
    ja = class extends Ga {
      constructor(e2) {
        if (super(), this.keyPacket = null, this.revocationSignatures = [], this.directSignatures = [], this.users = [], this.subkeys = [], e2 && (this.packetListToStructure(e2, /* @__PURE__ */ new Set([R.packet.secretKey, R.packet.secretSubkey])), !this.keyPacket)) throw Error("Invalid key: missing public-key packet");
      }
      isPrivate() {
        return false;
      }
      toPublic() {
        return this;
      }
      armor(e2 = F) {
        const t2 = 6 !== this.keyPacket.version;
        return ee(R.armor.publicKey, this.toPacketList().write(), void 0, void 0, void 0, t2, e2);
      }
    };
    Va = class _Va extends ja {
      constructor(e2) {
        if (super(), this.packetListToStructure(e2, /* @__PURE__ */ new Set([R.packet.publicKey, R.packet.publicSubkey])), !this.keyPacket) throw Error("Invalid key: missing private-key packet");
      }
      isPrivate() {
        return true;
      }
      toPublic() {
        const e2 = new Gs(), t2 = this.toPacketList();
        for (const r3 of t2) switch (r3.constructor.tag) {
          case R.packet.secretKey: {
            const t3 = ca.fromSecretKeyPacket(r3);
            e2.push(t3);
            break;
          }
          case R.packet.secretSubkey: {
            const t3 = la.fromSecretSubkeyPacket(r3);
            e2.push(t3);
            break;
          }
          default:
            e2.push(r3);
        }
        return new ja(e2);
      }
      armor(e2 = F) {
        const t2 = 6 !== this.keyPacket.version;
        return ee(R.armor.privateKey, this.toPacketList().write(), void 0, void 0, void 0, t2, e2);
      }
      async getDecryptionKeys(e2, t2 = /* @__PURE__ */ new Date(), r3 = {}, n3 = F) {
        const i3 = this.keyPacket, s3 = [];
        let a3 = null;
        for (let r4 = 0; r4 < this.subkeys.length; r4++) if (!e2 || this.subkeys[r4].getKeyID().equals(e2, true)) {
          if (this.subkeys[r4].keyPacket.isDummy()) {
            a3 = a3 || Error("Gnu-dummy key packets cannot be used for decryption");
            continue;
          }
          try {
            const e3 = { key: i3, bind: this.subkeys[r4].keyPacket }, a4 = await Ba(this.subkeys[r4].bindingSignatures, i3, R.signature.subkeyBinding, e3, t2, n3);
            Fa(this.subkeys[r4].keyPacket, a4, n3) && s3.push(this.subkeys[r4]);
          } catch (e3) {
            a3 = e3;
          }
        }
        const o3 = await this.getPrimarySelfSignature(t2, r3, n3);
        if (e2 && !i3.getKeyID().equals(e2, true) || !Fa(i3, o3, n3) || (i3.isDummy() ? a3 = a3 || Error("Gnu-dummy key packets cannot be used for decryption") : s3.push(this)), 0 === s3.length) throw a3 || Error("No decryption key packets found");
        return s3;
      }
      isDecrypted() {
        return this.getKeys().some(({ keyPacket: e2 }) => e2.isDecrypted());
      }
      async validate(e2 = F) {
        if (!this.isPrivate()) throw Error("Cannot validate a public key");
        let t2;
        if (this.keyPacket.isDummy()) {
          const r3 = await this.getSigningKey(null, null, void 0, { ...e2, rejectPublicKeyAlgorithms: /* @__PURE__ */ new Set(), minRSABits: 0 });
          r3 && !r3.keyPacket.isDummy() && (t2 = r3.keyPacket);
        } else t2 = this.keyPacket;
        if (t2) return t2.validate();
        {
          const e3 = this.getKeys();
          if (e3.map((e4) => e4.keyPacket.isDummy()).every(Boolean)) throw Error("Cannot validate an all-gnu-dummy key");
          return Promise.all(e3.map((e4) => e4.keyPacket.validate()));
        }
      }
      clearPrivateParams() {
        this.getKeys().forEach(({ keyPacket: e2 }) => {
          e2.isDecrypted() && e2.clearPrivateParams();
        });
      }
      async revoke({ flag: e2 = R.reasonForRevocation.noReason, string: t2 = "" } = {}, r3 = /* @__PURE__ */ new Date(), n3 = F) {
        if (!this.isPrivate()) throw Error("Need private key for revoking");
        const i3 = { key: this.keyPacket }, s3 = this.clone();
        return s3.revocationSignatures.push(await Da(i3, [], this.keyPacket, { signatureType: R.signature.keyRevocation, reasonForRevocationFlag: R.write(R.reasonForRevocation, e2), reasonForRevocationString: t2 }, r3, void 0, void 0, void 0, n3)), s3;
      }
      async addSubkey(e2 = {}) {
        const t2 = { ...F, ...e2.config };
        if (e2.passphrase) throw Error("Subkey could not be encrypted here, please encrypt whole key");
        if (e2.rsaBits < t2.minRSABits) throw Error(`rsaBits should be at least ${t2.minRSABits}, got: ${e2.rsaBits}`);
        const r3 = this.keyPacket;
        if (r3.isDummy()) throw Error("Cannot add subkey to gnu-dummy primary key");
        if (!r3.isDecrypted()) throw Error("Key is not decrypted");
        const n3 = r3.getAlgorithmInfo();
        n3.type = function(e3) {
          switch (R.write(R.publicKey, e3)) {
            case R.publicKey.rsaEncrypt:
            case R.publicKey.rsaEncryptSign:
            case R.publicKey.rsaSign:
            case R.publicKey.dsa:
              return "rsa";
            case R.publicKey.ecdsa:
            case R.publicKey.eddsaLegacy:
              return "ecc";
            case R.publicKey.ed25519:
              return "curve25519";
            case R.publicKey.ed448:
              return "curve448";
            default:
              throw Error("Unsupported algorithm");
          }
        }(n3.algorithm), n3.rsaBits = n3.bits || 4096, n3.curve = n3.curve || "curve25519Legacy", e2 = Qa(e2, n3);
        const i3 = await va(e2, { ...t2, v6Keys: 6 === this.keyPacket.version });
        Ta(i3, t2);
        const s3 = await Ka(i3, r3, e2, t2), a3 = this.toPacketList();
        return a3.push(i3, s3), new _Va(a3);
      }
    };
    qa = /* @__PURE__ */ L.constructAllowedPackets([ca, la, ga, Aa, da, ya, Ls]);
    $a = /* @__PURE__ */ L.constructAllowedPackets([Qs, Ys, ia, ta, ha, sa, oa, Hs, Ls]);
    eo = /* @__PURE__ */ L.constructAllowedPackets([oa]);
    to = /* @__PURE__ */ L.constructAllowedPackets([Ls]);
    ro = class _ro {
      constructor(e2) {
        this.packets = e2 || new Gs();
      }
      getEncryptionKeyIDs() {
        const e2 = [];
        return this.packets.filterByTag(R.packet.publicKeyEncryptedSessionKey).forEach(function(t2) {
          e2.push(t2.publicKeyID);
        }), e2;
      }
      getSigningKeyIDs() {
        const e2 = this.unwrapCompressed(), t2 = e2.packets.filterByTag(R.packet.onePassSignature);
        if (t2.length > 0) return t2.map((e3) => e3.issuerKeyID);
        return e2.packets.filterByTag(R.packet.signature).map((e3) => e3.issuerKeyID);
      }
      async decrypt(e2, t2, r3, n3 = /* @__PURE__ */ new Date(), i3 = F) {
        const s3 = this.packets.filterByTag(R.packet.symmetricallyEncryptedData, R.packet.symEncryptedIntegrityProtectedData, R.packet.aeadEncryptedData);
        if (0 === s3.length) throw Error("No encrypted data found");
        const a3 = s3[0], o3 = a3.cipherAlgorithm, c3 = r3 || await this.decryptSessionKeys(e2, t2, o3, n3, i3);
        let u2 = null;
        const h4 = Promise.all(c3.map(async ({ algorithm: e3, data: t3 }) => {
          if (!L.isUint8Array(t3) || !a3.cipherAlgorithm && !L.isString(e3)) throw Error("Invalid session key for decryption.");
          try {
            const r4 = a3.cipherAlgorithm || R.write(R.symmetric, e3);
            await a3.decrypt(r4, t3, i3);
          } catch (e4) {
            L.printDebugError(e4), u2 = e4;
          }
        }));
        if (U(a3.encrypted), a3.encrypted = null, await h4, !a3.packets || !a3.packets.length) throw u2 || Error("Decryption failed.");
        const f2 = new _ro(a3.packets);
        return a3.packets = new Gs(), f2;
      }
      async decryptSessionKeys(e2, t2, r3, n3 = /* @__PURE__ */ new Date(), i3 = F) {
        let s3, a3 = [];
        if (t2) {
          const e3 = this.packets.filterByTag(R.packet.symEncryptedSessionKey);
          if (0 === e3.length) throw Error("No symmetrically encrypted session key packet found.");
          await Promise.all(t2.map(async function(t3, r4) {
            let n4;
            n4 = r4 ? await Gs.fromBinary(e3.write(), eo, i3) : e3, await Promise.all(n4.map(async function(e4) {
              try {
                await e4.decrypt(t3, i3), a3.push(e4);
              } catch (e5) {
                L.printDebugError(e5), e5 instanceof Pi && (s3 = e5);
              }
            }));
          }));
        } else {
          if (!e2) throw Error("No key or password specified.");
          {
            const t3 = this.packets.filterByTag(R.packet.publicKeyEncryptedSessionKey);
            if (0 === t3.length) throw Error("No public key encrypted session key packet found.");
            await Promise.all(t3.map(async function(t4) {
              await Promise.all(e2.map(async function(e3) {
                let o3;
                try {
                  o3 = (await e3.getDecryptionKeys(t4.publicKeyID, null, void 0, i3)).map((e4) => e4.keyPacket);
                } catch (e4) {
                  return void (s3 = e4);
                }
                let c3 = [R.symmetric.aes256, R.symmetric.aes128, R.symmetric.tripledes, R.symmetric.cast5];
                try {
                  const t5 = await e3.getPrimarySelfSignature(n3, void 0, i3);
                  t5.preferredSymmetricAlgorithms && (c3 = c3.concat(t5.preferredSymmetricAlgorithms));
                } catch {
                }
                await Promise.all(o3.map(async function(e4) {
                  if (!e4.isDecrypted()) throw Error("Decryption key is not decrypted.");
                  if (i3.constantTimePKCS1Decryption && (t4.publicKeyAlgorithm === R.publicKey.rsaEncrypt || t4.publicKeyAlgorithm === R.publicKey.rsaEncryptSign || t4.publicKeyAlgorithm === R.publicKey.rsaSign || t4.publicKeyAlgorithm === R.publicKey.elgamal)) {
                    const n4 = t4.write();
                    await Promise.all((r3 ? [r3] : Array.from(i3.constantTimePKCS1DecryptionSupportedSymmetricAlgorithms)).map(async (t5) => {
                      const r4 = new sa();
                      r4.read(n4);
                      const i4 = { sessionKeyAlgorithm: t5, sessionKey: Fn(t5) };
                      try {
                        await r4.decrypt(e4, i4), a3.push(r4);
                      } catch (e5) {
                        L.printDebugError(e5), s3 = e5;
                      }
                    }));
                  } else try {
                    await t4.decrypt(e4);
                    const n4 = r3 || t4.sessionKeyAlgorithm;
                    if (n4 && !c3.includes(R.write(R.symmetric, n4))) throw Error("A non-preferred symmetric algorithm was used.");
                    a3.push(t4);
                  } catch (e5) {
                    L.printDebugError(e5), s3 = e5;
                  }
                }));
              })), U(t4.encrypted), t4.encrypted = null;
            }));
          }
        }
        if (a3.length > 0) {
          if (a3.length > 1) {
            const e3 = /* @__PURE__ */ new Set();
            a3 = a3.filter((t3) => {
              const r4 = t3.sessionKeyAlgorithm + L.uint8ArrayToString(t3.sessionKey);
              return !e3.has(r4) && (e3.add(r4), true);
            });
          }
          return a3.map((e3) => ({ data: e3.sessionKey, algorithm: e3.sessionKeyAlgorithm && R.read(R.symmetric, e3.sessionKeyAlgorithm) }));
        }
        throw s3 || Error("Session key decryption failed.");
      }
      getLiteralData() {
        const e2 = this.unwrapCompressed().packets.findPacket(R.packet.literalData);
        return e2 && e2.getBytes() || null;
      }
      getFilename() {
        const e2 = this.unwrapCompressed().packets.findPacket(R.packet.literalData);
        return e2 && e2.getFilename() || null;
      }
      getText() {
        const e2 = this.unwrapCompressed().packets.findPacket(R.packet.literalData);
        return e2 ? e2.getText() : null;
      }
      static async generateSessionKey(e2 = [], t2 = /* @__PURE__ */ new Date(), r3 = [], n3 = F) {
        const { symmetricAlgo: i3, aeadAlgo: s3 } = await async function(e3 = [], t3 = /* @__PURE__ */ new Date(), r4 = [], n4 = F) {
          const i4 = await Promise.all(e3.map((e4, i5) => e4.getPrimarySelfSignature(t3, r4[i5], n4)));
          if (e3.length ? i4.every((e4) => e4.features && e4.features[0] & R.features.seipdv2) : n4.aeadProtect) {
            const e4 = { symmetricAlgo: R.symmetric.aes128, aeadAlgo: R.aead.ocb }, t4 = [{ symmetricAlgo: n4.preferredSymmetricAlgorithm, aeadAlgo: n4.preferredAEADAlgorithm }, { symmetricAlgo: n4.preferredSymmetricAlgorithm, aeadAlgo: R.aead.ocb }, { symmetricAlgo: R.symmetric.aes128, aeadAlgo: n4.preferredAEADAlgorithm }];
            for (const e5 of t4) if (i4.every((t5) => t5.preferredCipherSuites && t5.preferredCipherSuites.some((t6) => t6[0] === e5.symmetricAlgo && t6[1] === e5.aeadAlgo))) return e5;
            return e4;
          }
          const s4 = R.symmetric.aes128, a4 = n4.preferredSymmetricAlgorithm;
          return { symmetricAlgo: i4.every((e4) => e4.preferredSymmetricAlgorithms && e4.preferredSymmetricAlgorithms.includes(a4)) ? a4 : s4, aeadAlgo: void 0 };
        }(e2, t2, r3, n3), a3 = R.read(R.symmetric, i3), o3 = s3 ? R.read(R.aead, s3) : void 0;
        await Promise.all(e2.map((e3) => e3.getEncryptionKey().catch(() => null).then((e4) => {
          if (e4 && (e4.keyPacket.algorithm === R.publicKey.x25519 || e4.keyPacket.algorithm === R.publicKey.x448) && !o3 && !L.isAES(i3)) throw Error("Could not generate a session key compatible with the given `encryptionKeys`: X22519 and X448 keys can only be used to encrypt AES session keys; change `config.preferredSymmetricAlgorithm` accordingly.");
        })));
        return { data: Fn(i3), algorithm: a3, aeadAlgorithm: o3 };
      }
      async encrypt(e2, t2, r3, n3 = false, i3 = [], s3 = /* @__PURE__ */ new Date(), a3 = [], o3 = F) {
        if (r3) {
          if (!L.isUint8Array(r3.data) || !L.isString(r3.algorithm)) throw Error("Invalid session key for encryption.");
        } else if (e2 && e2.length) r3 = await _ro.generateSessionKey(e2, s3, a3, o3);
        else {
          if (!t2 || !t2.length) throw Error("No keys, passwords, or session key provided.");
          r3 = await _ro.generateSessionKey(void 0, void 0, void 0, o3);
        }
        const { data: c3, algorithm: u2, aeadAlgorithm: h4 } = r3, f2 = await _ro.encryptSessionKey(c3, u2, h4, e2, t2, n3, i3, s3, a3, o3), l2 = ta.fromObject({ version: h4 ? 2 : 1, aeadAlgorithm: h4 ? R.write(R.aead, h4) : null });
        l2.packets = this.packets;
        const y2 = R.write(R.symmetric, u2);
        return await l2.encrypt(y2, c3, o3), f2.packets.push(l2), l2.packets = new Gs(), f2;
      }
      static async encryptSessionKey(e2, t2, r3, n3, i3, s3 = false, a3 = [], o3 = /* @__PURE__ */ new Date(), c3 = [], u2 = F) {
        const h4 = new Gs(), f2 = R.write(R.symmetric, t2), l2 = r3 && R.write(R.aead, r3);
        if (n3) {
          const t3 = await Promise.all(n3.map(async function(t4, r4) {
            const n4 = await t4.getEncryptionKey(a3[r4], o3, c3, u2), i4 = sa.fromObject({ version: l2 ? 6 : 3, encryptionKeyPacket: n4.keyPacket, anonymousRecipient: s3, sessionKey: e2, sessionKeyAlgorithm: f2 });
            return await i4.encrypt(n4.keyPacket), delete i4.sessionKey, i4;
          }));
          h4.push(...t3);
        }
        if (i3) {
          const t3 = async function(e3, t4) {
            try {
              return await e3.decrypt(t4, u2), 1;
            } catch {
              return 0;
            }
          }, r4 = (e3, t4) => e3 + t4, n4 = async function(e3, s5, a4, o4) {
            const c4 = new oa(u2);
            if (c4.sessionKey = e3, c4.sessionKeyAlgorithm = s5, a4 && (c4.aeadAlgorithm = a4), await c4.encrypt(o4, u2), u2.passwordCollisionCheck) {
              if (1 !== (await Promise.all(i3.map((e4) => t3(c4, e4)))).reduce(r4)) return n4(e3, s5, o4);
            }
            return delete c4.sessionKey, c4;
          }, s4 = await Promise.all(i3.map((t4) => n4(e2, f2, l2, t4)));
          h4.push(...s4);
        }
        return new _ro(h4);
      }
      async sign(e2 = [], t2 = [], r3 = null, n3 = [], i3 = /* @__PURE__ */ new Date(), s3 = [], a3 = [], o3 = [], c3 = F) {
        const u2 = new Gs(), h4 = this.packets.findPacket(R.packet.literalData);
        if (!h4) throw Error("No literal data packet to sign.");
        const f2 = await no(h4, e2, t2, r3, n3, i3, s3, a3, o3, false, c3), l2 = f2.map((e3, t3) => Hs.fromSignaturePacket(e3, 0 === t3)).reverse();
        return u2.push(...l2), u2.push(h4), u2.push(...f2), new _ro(u2);
      }
      compress(e2, t2 = F) {
        if (e2 === R.compression.uncompressed) return this;
        const r3 = new Ys(t2);
        r3.algorithm = e2, r3.packets = this.packets;
        const n3 = new Gs();
        return n3.push(r3), new _ro(n3);
      }
      async signDetached(e2 = [], t2 = [], r3 = null, n3 = [], i3 = [], s3 = /* @__PURE__ */ new Date(), a3 = [], o3 = [], c3 = F) {
        const u2 = this.packets.findPacket(R.packet.literalData);
        if (!u2) throw Error("No literal data packet to sign.");
        return new ka(await no(u2, e2, t2, r3, n3, i3, s3, a3, o3, true, c3));
      }
      async verify(e2, t2 = /* @__PURE__ */ new Date(), r3 = F) {
        const n3 = this.unwrapCompressed(), i3 = n3.packets.filterByTag(R.packet.literalData);
        if (1 !== i3.length) throw Error("Can only verify message with one literal data packet.");
        let s3 = n3.packets;
        o2(s3.stream) && (s3 = s3.concat(await D(s3.stream, (e3) => e3 || [])));
        const a3 = s3.filterByTag(R.packet.onePassSignature).reverse(), c3 = s3.filterByTag(R.packet.signature);
        return a3.length && !c3.length && L.isStream(s3.stream) && !o2(s3.stream) ? (await Promise.all(a3.map(async (e3) => {
          e3.correspondingSig = new Promise((t3, r4) => {
            e3.correspondingSigResolve = t3, e3.correspondingSigReject = r4;
          }), e3.signatureData = P(async () => (await e3.correspondingSig).signatureData), e3.hashed = D(await e3.hash(e3.signatureType, i3[0], void 0, false)), e3.hashed.catch(() => {
          });
        })), s3.stream = v(s3.stream, async (e3, t3) => {
          const r4 = x(e3), n4 = Q(t3);
          try {
            for (let e4 = 0; e4 < a3.length; e4++) {
              const { value: t4 } = await r4.read();
              a3[e4].correspondingSigResolve(t4);
            }
            await r4.readToEnd(), await n4.ready, await n4.close();
          } catch (e4) {
            a3.forEach((t4) => {
              t4.correspondingSigReject(e4);
            }), await n4.abort(e4);
          }
        }), io(a3, i3, e2, t2, false, r3)) : io(c3, i3, e2, t2, false, r3);
      }
      async verifyDetached(e2, t2, r3 = /* @__PURE__ */ new Date(), n3 = F) {
        const i3 = this.unwrapCompressed().packets.filterByTag(R.packet.literalData);
        if (1 !== i3.length) throw Error("Can only verify message with one literal data packet.");
        return io(e2.packets.filterByTag(R.packet.signature), i3, t2, r3, true, n3);
      }
      unwrapCompressed() {
        const e2 = this.packets.filterByTag(R.packet.compressedData);
        return e2.length ? new _ro(e2[0].packets) : this;
      }
      async appendSignature(e2, t2 = F) {
        await this.packets.read(L.isUint8Array(e2) ? e2 : (await $(e2)).data, to, t2);
      }
      write() {
        return this.packets.write();
      }
      armor(e2 = F) {
        const t2 = this.packets[this.packets.length - 1], r3 = t2.constructor.tag === ta.tag ? 2 !== t2.version : this.packets.some((e3) => e3.constructor.tag === Ls.tag && 6 !== e3.version);
        return ee(R.armor.message, this.write(), null, null, null, r3, e2);
      }
    };
    oo = /* @__PURE__ */ L.constructAllowedPackets([Ls]);
    co = class _co {
      constructor(e2, t2) {
        if (this.text = L.removeTrailingSpaces(e2).replace(/\r?\n/g, "\r\n"), t2 && !(t2 instanceof ka)) throw Error("Invalid signature input");
        this.signature = t2 || new ka(new Gs());
      }
      getSigningKeyIDs() {
        const e2 = [];
        return this.signature.packets.forEach(function(t2) {
          e2.push(t2.issuerKeyID);
        }), e2;
      }
      async sign(e2, t2 = [], r3 = null, n3 = [], i3 = /* @__PURE__ */ new Date(), s3 = [], a3 = [], o3 = [], c3 = F) {
        const u2 = new Qs();
        u2.setText(this.text);
        const h4 = new ka(await no(u2, e2, t2, r3, n3, i3, s3, a3, o3, true, c3));
        return new _co(this.text, h4);
      }
      verify(e2, t2 = /* @__PURE__ */ new Date(), r3 = F) {
        const n3 = this.signature.packets.filterByTag(R.packet.signature), i3 = new Qs();
        return i3.setText(this.text), io(n3, [i3], e2, t2, true, r3);
      }
      getText() {
        return this.text.replace(/\r\n/g, "\n");
      }
      armor(e2 = F) {
        const t2 = this.signature.packets.some((e3) => 6 !== e3.version), r3 = { hash: t2 ? Array.from(new Set(this.signature.packets.map((e3) => R.read(R.hash, e3.hashAlgorithm).toUpperCase()))).join() : null, text: this.text, data: this.signature.packets.write() };
        return ee(R.armor.signed, r3, void 0, void 0, void 0, t2, e2);
      }
    };
    Ko = Object.keys(F).length;
    Qo = "object" == typeof e && "crypto" in e ? e.crypto : void 0;
    jo = /* @__PURE__ */ (() => 68 === new Uint8Array(new Uint32Array([287454020]).buffer)[0])() ? (e2) => e2 : function(e2) {
      for (let r3 = 0; r3 < e2.length; r3++) e2[r3] = (t2 = e2[r3]) << 24 & 4278190080 | t2 << 8 & 16711680 | t2 >>> 8 & 65280 | t2 >>> 24 & 255;
      var t2;
      return e2;
    };
    Vo = /* @__PURE__ */ (() => "function" == typeof Uint8Array.from([]).toHex && "function" == typeof Uint8Array.fromHex)();
    qo = /* @__PURE__ */ Array.from({ length: 256 }, (e2, t2) => t2.toString(16).padStart(2, "0"));
    Yo = 48;
    Zo = 57;
    Jo = 65;
    Wo = 70;
    Xo = 97;
    $o = 102;
    ic = class {
    };
    ac = sc;
    cc = /* @__PURE__ */ BigInt(0);
    uc = /* @__PURE__ */ BigInt(1);
    bc = (e2) => "bigint" == typeof e2 && cc <= e2;
    vc = (e2) => (uc << BigInt(e2)) - uc;
    Sc = BigInt(0);
    Kc = BigInt(1);
    Cc = /* @__PURE__ */ BigInt(2);
    Dc = /* @__PURE__ */ BigInt(3);
    Uc = /* @__PURE__ */ BigInt(4);
    Pc = /* @__PURE__ */ BigInt(5);
    xc = /* @__PURE__ */ BigInt(7);
    Qc = /* @__PURE__ */ BigInt(8);
    Mc = /* @__PURE__ */ BigInt(9);
    Rc = /* @__PURE__ */ BigInt(16);
    jc = ["create", "isValid", "is0", "neg", "inv", "sqrt", "sqr", "eql", "add", "sub", "mul", "pow", "div", "addN", "subN", "mulN", "sqrN"];
    $c = class extends ic {
      constructor(e2, t2, r3, n3) {
        super(), this.finished = false, this.length = 0, this.pos = 0, this.destroyed = false, this.blockLen = e2, this.outputLen = t2, this.padOffset = r3, this.isLE = n3, this.buffer = new Uint8Array(e2), this.view = Ho(this.buffer);
      }
      update(e2) {
        Lo(this), Fo(e2 = rc(e2));
        const { view: t2, buffer: r3, blockLen: n3 } = this, i3 = e2.length;
        for (let s3 = 0; s3 < i3; ) {
          const a3 = Math.min(n3 - this.pos, i3 - s3);
          if (a3 !== n3) r3.set(e2.subarray(s3, s3 + a3), this.pos), this.pos += a3, s3 += a3, this.pos === n3 && (this.process(t2, 0), this.pos = 0);
          else {
            const t3 = Ho(e2);
            for (; n3 <= i3 - s3; s3 += n3) this.process(t3, s3);
          }
        }
        return this.length += e2.length, this.roundClean(), this;
      }
      digestInto(e2) {
        Lo(this), No(e2, this), this.finished = true;
        const { buffer: t2, view: r3, blockLen: n3, isLE: i3 } = this;
        let { pos: s3 } = this;
        t2[s3++] = 128, Oo(this.buffer.subarray(s3)), this.padOffset > n3 - s3 && (this.process(r3, 0), s3 = 0);
        for (let e3 = s3; e3 < n3; e3++) t2[e3] = 0;
        !function(e3, t3, r4, n4) {
          if ("function" == typeof e3.setBigUint64) return e3.setBigUint64(t3, r4, n4);
          const i4 = BigInt(32), s4 = BigInt(4294967295), a4 = Number(r4 >> i4 & s4), o4 = Number(r4 & s4), c4 = n4 ? 4 : 0, u3 = n4 ? 0 : 4;
          e3.setUint32(t3 + c4, a4, n4), e3.setUint32(t3 + u3, o4, n4);
        }(r3, n3 - 8, BigInt(8 * this.length), i3), this.process(r3, 0);
        const a3 = Ho(e2), o3 = this.outputLen;
        if (o3 % 4) throw Error("_sha2: outputLen should be aligned to 32bit");
        const c3 = o3 / 4, u2 = this.get();
        if (c3 > u2.length) throw Error("_sha2: outputLen bigger than state");
        for (let e3 = 0; e3 < c3; e3++) a3.setUint32(4 * e3, u2[e3], i3);
      }
      digest() {
        const { buffer: e2, outputLen: t2 } = this;
        this.digestInto(e2);
        const r3 = e2.slice(0, t2);
        return this.destroy(), r3;
      }
      _cloneInto(e2) {
        e2 || (e2 = new this.constructor()), e2.set(...this.get());
        const { blockLen: t2, buffer: r3, length: n3, finished: i3, destroyed: s3, pos: a3 } = this;
        return e2.destroyed = s3, e2.finished = i3, e2.length = n3, e2.pos = a3, n3 % t2 && e2.buffer.set(r3), e2;
      }
      clone() {
        return this._cloneInto();
      }
    };
    eu = /* @__PURE__ */ Uint32Array.from([1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225]);
    tu = /* @__PURE__ */ Uint32Array.from([3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428]);
    ru = /* @__PURE__ */ Uint32Array.from([3418070365, 3238371032, 1654270250, 914150663, 2438529370, 812702999, 355462360, 4144912697, 1731405415, 4290775857, 2394180231, 1750603025, 3675008525, 1694076839, 1203062813, 3204075428]);
    nu = /* @__PURE__ */ Uint32Array.from([1779033703, 4089235720, 3144134277, 2227873595, 1013904242, 4271175723, 2773480762, 1595750129, 1359893119, 2917565137, 2600822924, 725511199, 528734635, 4215389547, 1541459225, 327033209]);
    iu = /* @__PURE__ */ BigInt(2 ** 32 - 1);
    su = /* @__PURE__ */ BigInt(32);
    cu = (e2, t2, r3) => e2 >>> r3;
    uu = (e2, t2, r3) => e2 << 32 - r3 | t2 >>> r3;
    hu = (e2, t2, r3) => e2 >>> r3 | t2 << 32 - r3;
    fu = (e2, t2, r3) => e2 << 32 - r3 | t2 >>> r3;
    lu = (e2, t2, r3) => e2 << 64 - r3 | t2 >>> r3 - 32;
    yu = (e2, t2, r3) => e2 >>> r3 - 32 | t2 << 64 - r3;
    pu = (e2, t2, r3) => (e2 >>> 0) + (t2 >>> 0) + (r3 >>> 0);
    du = (e2, t2, r3, n3) => t2 + r3 + n3 + (e2 / 2 ** 32 | 0) | 0;
    Au = (e2, t2, r3, n3) => (e2 >>> 0) + (t2 >>> 0) + (r3 >>> 0) + (n3 >>> 0);
    wu = (e2, t2, r3, n3, i3) => t2 + r3 + n3 + i3 + (e2 / 2 ** 32 | 0) | 0;
    mu = (e2, t2, r3, n3, i3) => (e2 >>> 0) + (t2 >>> 0) + (r3 >>> 0) + (n3 >>> 0) + (i3 >>> 0);
    bu = (e2, t2, r3, n3, i3, s3) => t2 + r3 + n3 + i3 + s3 + (e2 / 2 ** 32 | 0) | 0;
    ku = /* @__PURE__ */ Uint32Array.from([1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298]);
    Eu = /* @__PURE__ */ new Uint32Array(64);
    vu = class extends $c {
      constructor(e2 = 32) {
        super(64, e2, 8, false), this.A = 0 | eu[0], this.B = 0 | eu[1], this.C = 0 | eu[2], this.D = 0 | eu[3], this.E = 0 | eu[4], this.F = 0 | eu[5], this.G = 0 | eu[6], this.H = 0 | eu[7];
      }
      get() {
        const { A: e2, B: t2, C: r3, D: n3, E: i3, F: s3, G: a3, H: o3 } = this;
        return [e2, t2, r3, n3, i3, s3, a3, o3];
      }
      set(e2, t2, r3, n3, i3, s3, a3, o3) {
        this.A = 0 | e2, this.B = 0 | t2, this.C = 0 | r3, this.D = 0 | n3, this.E = 0 | i3, this.F = 0 | s3, this.G = 0 | a3, this.H = 0 | o3;
      }
      process(e2, t2) {
        for (let r4 = 0; r4 < 16; r4++, t2 += 4) Eu[r4] = e2.getUint32(t2, false);
        for (let e3 = 16; e3 < 64; e3++) {
          const t3 = Eu[e3 - 15], r4 = Eu[e3 - 2], n4 = zo(t3, 7) ^ zo(t3, 18) ^ t3 >>> 3, i4 = zo(r4, 17) ^ zo(r4, 19) ^ r4 >>> 10;
          Eu[e3] = i4 + Eu[e3 - 7] + n4 + Eu[e3 - 16] | 0;
        }
        let { A: r3, B: n3, C: i3, D: s3, E: a3, F: o3, G: c3, H: u2 } = this;
        for (let e3 = 0; e3 < 64; e3++) {
          const t3 = u2 + (zo(a3, 6) ^ zo(a3, 11) ^ zo(a3, 25)) + Wc(a3, o3, c3) + ku[e3] + Eu[e3] | 0, h4 = (zo(r3, 2) ^ zo(r3, 13) ^ zo(r3, 22)) + Xc(r3, n3, i3) | 0;
          u2 = c3, c3 = o3, o3 = a3, a3 = s3 + t3 | 0, s3 = i3, i3 = n3, n3 = r3, r3 = t3 + h4 | 0;
        }
        r3 = r3 + this.A | 0, n3 = n3 + this.B | 0, i3 = i3 + this.C | 0, s3 = s3 + this.D | 0, a3 = a3 + this.E | 0, o3 = o3 + this.F | 0, c3 = c3 + this.G | 0, u2 = u2 + this.H | 0, this.set(r3, n3, i3, s3, a3, o3, c3, u2);
      }
      roundClean() {
        Oo(Eu);
      }
      destroy() {
        this.set(0, 0, 0, 0, 0, 0, 0, 0), Oo(this.buffer);
      }
    };
    Iu = class extends vu {
      constructor() {
        super(28), this.A = 0 | tu[0], this.B = 0 | tu[1], this.C = 0 | tu[2], this.D = 0 | tu[3], this.E = 0 | tu[4], this.F = 0 | tu[5], this.G = 0 | tu[6], this.H = 0 | tu[7];
      }
    };
    Bu = /* @__PURE__ */ (() => ou(["0x428a2f98d728ae22", "0x7137449123ef65cd", "0xb5c0fbcfec4d3b2f", "0xe9b5dba58189dbbc", "0x3956c25bf348b538", "0x59f111f1b605d019", "0x923f82a4af194f9b", "0xab1c5ed5da6d8118", "0xd807aa98a3030242", "0x12835b0145706fbe", "0x243185be4ee4b28c", "0x550c7dc3d5ffb4e2", "0x72be5d74f27b896f", "0x80deb1fe3b1696b1", "0x9bdc06a725c71235", "0xc19bf174cf692694", "0xe49b69c19ef14ad2", "0xefbe4786384f25e3", "0x0fc19dc68b8cd5b5", "0x240ca1cc77ac9c65", "0x2de92c6f592b0275", "0x4a7484aa6ea6e483", "0x5cb0a9dcbd41fbd4", "0x76f988da831153b5", "0x983e5152ee66dfab", "0xa831c66d2db43210", "0xb00327c898fb213f", "0xbf597fc7beef0ee4", "0xc6e00bf33da88fc2", "0xd5a79147930aa725", "0x06ca6351e003826f", "0x142929670a0e6e70", "0x27b70a8546d22ffc", "0x2e1b21385c26c926", "0x4d2c6dfc5ac42aed", "0x53380d139d95b3df", "0x650a73548baf63de", "0x766a0abb3c77b2a8", "0x81c2c92e47edaee6", "0x92722c851482353b", "0xa2bfe8a14cf10364", "0xa81a664bbc423001", "0xc24b8b70d0f89791", "0xc76c51a30654be30", "0xd192e819d6ef5218", "0xd69906245565a910", "0xf40e35855771202a", "0x106aa07032bbd1b8", "0x19a4c116b8d2d0c8", "0x1e376c085141ab53", "0x2748774cdf8eeb99", "0x34b0bcb5e19b48a8", "0x391c0cb3c5c95a63", "0x4ed8aa4ae3418acb", "0x5b9cca4f7763e373", "0x682e6ff3d6b2b8a3", "0x748f82ee5defb2fc", "0x78a5636f43172f60", "0x84c87814a1f0ab72", "0x8cc702081a6439ec", "0x90befffa23631e28", "0xa4506cebde82bde9", "0xbef9a3f7b2c67915", "0xc67178f2e372532b", "0xca273eceea26619c", "0xd186b8c721c0c207", "0xeada7dd6cde0eb1e", "0xf57d4f7fee6ed178", "0x06f067aa72176fba", "0x0a637dc5a2c898a6", "0x113f9804bef90dae", "0x1b710b35131c471b", "0x28db77f523047d84", "0x32caab7b40c72493", "0x3c9ebe0a15c9bebc", "0x431d67c49c100d4c", "0x4cc5d4becb3e42b6", "0x597f299cfc657e2a", "0x5fcb6fab3ad6faec", "0x6c44198c4a475817"].map((e2) => BigInt(e2))))();
    Su = /* @__PURE__ */ (() => Bu[0])();
    Ku = /* @__PURE__ */ (() => Bu[1])();
    Cu = /* @__PURE__ */ new Uint32Array(80);
    Du = /* @__PURE__ */ new Uint32Array(80);
    Uu = class extends $c {
      constructor(e2 = 64) {
        super(128, e2, 16, false), this.Ah = 0 | nu[0], this.Al = 0 | nu[1], this.Bh = 0 | nu[2], this.Bl = 0 | nu[3], this.Ch = 0 | nu[4], this.Cl = 0 | nu[5], this.Dh = 0 | nu[6], this.Dl = 0 | nu[7], this.Eh = 0 | nu[8], this.El = 0 | nu[9], this.Fh = 0 | nu[10], this.Fl = 0 | nu[11], this.Gh = 0 | nu[12], this.Gl = 0 | nu[13], this.Hh = 0 | nu[14], this.Hl = 0 | nu[15];
      }
      get() {
        const { Ah: e2, Al: t2, Bh: r3, Bl: n3, Ch: i3, Cl: s3, Dh: a3, Dl: o3, Eh: c3, El: u2, Fh: h4, Fl: f2, Gh: l2, Gl: y2, Hh: g2, Hl: p2 } = this;
        return [e2, t2, r3, n3, i3, s3, a3, o3, c3, u2, h4, f2, l2, y2, g2, p2];
      }
      set(e2, t2, r3, n3, i3, s3, a3, o3, c3, u2, h4, f2, l2, y2, g2, p2) {
        this.Ah = 0 | e2, this.Al = 0 | t2, this.Bh = 0 | r3, this.Bl = 0 | n3, this.Ch = 0 | i3, this.Cl = 0 | s3, this.Dh = 0 | a3, this.Dl = 0 | o3, this.Eh = 0 | c3, this.El = 0 | u2, this.Fh = 0 | h4, this.Fl = 0 | f2, this.Gh = 0 | l2, this.Gl = 0 | y2, this.Hh = 0 | g2, this.Hl = 0 | p2;
      }
      process(e2, t2) {
        for (let r4 = 0; r4 < 16; r4++, t2 += 4) Cu[r4] = e2.getUint32(t2), Du[r4] = e2.getUint32(t2 += 4);
        for (let e3 = 16; e3 < 80; e3++) {
          const t3 = 0 | Cu[e3 - 15], r4 = 0 | Du[e3 - 15], n4 = hu(t3, r4, 1) ^ hu(t3, r4, 8) ^ cu(t3, 0, 7), i4 = fu(t3, r4, 1) ^ fu(t3, r4, 8) ^ uu(t3, r4, 7), s4 = 0 | Cu[e3 - 2], a4 = 0 | Du[e3 - 2], o4 = hu(s4, a4, 19) ^ lu(s4, a4, 61) ^ cu(s4, 0, 6), c4 = fu(s4, a4, 19) ^ yu(s4, a4, 61) ^ uu(s4, a4, 6), u3 = Au(i4, c4, Du[e3 - 7], Du[e3 - 16]), h5 = wu(u3, n4, o4, Cu[e3 - 7], Cu[e3 - 16]);
          Cu[e3] = 0 | h5, Du[e3] = 0 | u3;
        }
        let { Ah: r3, Al: n3, Bh: i3, Bl: s3, Ch: a3, Cl: o3, Dh: c3, Dl: u2, Eh: h4, El: f2, Fh: l2, Fl: y2, Gh: g2, Gl: p2, Hh: d3, Hl: A2 } = this;
        for (let e3 = 0; e3 < 80; e3++) {
          const t3 = hu(h4, f2, 14) ^ hu(h4, f2, 18) ^ lu(h4, f2, 41), w2 = fu(h4, f2, 14) ^ fu(h4, f2, 18) ^ yu(h4, f2, 41), m2 = h4 & l2 ^ ~h4 & g2, b2 = mu(A2, w2, f2 & y2 ^ ~f2 & p2, Ku[e3], Du[e3]), k2 = bu(b2, d3, t3, m2, Su[e3], Cu[e3]), E2 = 0 | b2, v2 = hu(r3, n3, 28) ^ lu(r3, n3, 34) ^ lu(r3, n3, 39), I2 = fu(r3, n3, 28) ^ yu(r3, n3, 34) ^ yu(r3, n3, 39), B2 = r3 & i3 ^ r3 & a3 ^ i3 & a3, S2 = n3 & s3 ^ n3 & o3 ^ s3 & o3;
          d3 = 0 | g2, A2 = 0 | p2, g2 = 0 | l2, p2 = 0 | y2, l2 = 0 | h4, y2 = 0 | f2, { h: h4, l: f2 } = gu(0 | c3, 0 | u2, 0 | k2, 0 | E2), c3 = 0 | a3, u2 = 0 | o3, a3 = 0 | i3, o3 = 0 | s3, i3 = 0 | r3, s3 = 0 | n3;
          const K2 = pu(E2, I2, S2);
          r3 = du(K2, k2, v2, B2), n3 = 0 | K2;
        }
        ({ h: r3, l: n3 } = gu(0 | this.Ah, 0 | this.Al, 0 | r3, 0 | n3)), { h: i3, l: s3 } = gu(0 | this.Bh, 0 | this.Bl, 0 | i3, 0 | s3), { h: a3, l: o3 } = gu(0 | this.Ch, 0 | this.Cl, 0 | a3, 0 | o3), { h: c3, l: u2 } = gu(0 | this.Dh, 0 | this.Dl, 0 | c3, 0 | u2), { h: h4, l: f2 } = gu(0 | this.Eh, 0 | this.El, 0 | h4, 0 | f2), { h: l2, l: y2 } = gu(0 | this.Fh, 0 | this.Fl, 0 | l2, 0 | y2), { h: g2, l: p2 } = gu(0 | this.Gh, 0 | this.Gl, 0 | g2, 0 | p2), { h: d3, l: A2 } = gu(0 | this.Hh, 0 | this.Hl, 0 | d3, 0 | A2), this.set(r3, n3, i3, s3, a3, o3, c3, u2, h4, f2, l2, y2, g2, p2, d3, A2);
      }
      roundClean() {
        Oo(Cu, Du);
      }
      destroy() {
        Oo(this.buffer), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      }
    };
    Pu = class extends Uu {
      constructor() {
        super(48), this.Ah = 0 | ru[0], this.Al = 0 | ru[1], this.Bh = 0 | ru[2], this.Bl = 0 | ru[3], this.Ch = 0 | ru[4], this.Cl = 0 | ru[5], this.Dh = 0 | ru[6], this.Dl = 0 | ru[7], this.Eh = 0 | ru[8], this.El = 0 | ru[9], this.Fh = 0 | ru[10], this.Fl = 0 | ru[11], this.Gh = 0 | ru[12], this.Gl = 0 | ru[13], this.Hh = 0 | ru[14], this.Hl = 0 | ru[15];
      }
    };
    xu = /* @__PURE__ */ sc(() => new vu());
    Qu = /* @__PURE__ */ sc(() => new Iu());
    Mu = /* @__PURE__ */ sc(() => new Uu());
    Ru = /* @__PURE__ */ sc(() => new Pu());
    Fu = class extends ic {
      constructor(e2, t2) {
        super(), this.finished = false, this.destroyed = false, To(e2);
        const r3 = rc(t2);
        if (this.iHash = e2.create(), "function" != typeof this.iHash.update) throw Error("Expected instance of class which extends utils.Hash");
        this.blockLen = this.iHash.blockLen, this.outputLen = this.iHash.outputLen;
        const n3 = this.blockLen, i3 = new Uint8Array(n3);
        i3.set(r3.length > n3 ? e2.create().update(r3).digest() : r3);
        for (let e3 = 0; e3 < i3.length; e3++) i3[e3] ^= 54;
        this.iHash.update(i3), this.oHash = e2.create();
        for (let e3 = 0; e3 < i3.length; e3++) i3[e3] ^= 106;
        this.oHash.update(i3), Oo(i3);
      }
      update(e2) {
        return Lo(this), this.iHash.update(e2), this;
      }
      digestInto(e2) {
        Lo(this), Fo(e2, this.outputLen), this.finished = true, this.iHash.digestInto(e2), this.oHash.update(e2), this.oHash.digestInto(e2), this.destroy();
      }
      digest() {
        const e2 = new Uint8Array(this.oHash.outputLen);
        return this.digestInto(e2), e2;
      }
      _cloneInto(e2) {
        e2 || (e2 = Object.create(Object.getPrototypeOf(this), {}));
        const { oHash: t2, iHash: r3, finished: n3, destroyed: i3, blockLen: s3, outputLen: a3 } = this;
        return e2.finished = n3, e2.destroyed = i3, e2.blockLen = s3, e2.outputLen = a3, e2.oHash = t2._cloneInto(e2.oHash), e2.iHash = r3._cloneInto(e2.iHash), e2;
      }
      clone() {
        return this._cloneInto();
      }
      destroy() {
        this.destroyed = true, this.oHash.destroy(), this.iHash.destroy();
      }
    };
    Tu = (e2, t2, r3) => new Fu(e2, t2).update(r3).digest();
    Tu.create = (e2, t2) => new Fu(e2, t2);
    Lu = BigInt(0);
    Nu = BigInt(1);
    Vu = /* @__PURE__ */ new WeakMap();
    qu = /* @__PURE__ */ new WeakMap();
    Zu = class {
      constructor(e2, t2) {
        this.BASE = e2.BASE, this.ZERO = e2.ZERO, this.Fn = e2.Fn, this.bits = t2;
      }
      _unsafeLadder(e2, t2, r3 = this.ZERO) {
        let n3 = e2;
        for (; t2 > Lu; ) t2 & Nu && (r3 = r3.add(n3)), n3 = n3.double(), t2 >>= Nu;
        return r3;
      }
      precomputeWindow(e2, t2) {
        const { windows: r3, windowSize: n3 } = Gu(t2, this.bits), i3 = [];
        let s3 = e2, a3 = s3;
        for (let e3 = 0; e3 < r3; e3++) {
          a3 = s3, i3.push(a3);
          for (let e4 = 1; e4 < n3; e4++) a3 = a3.add(s3), i3.push(a3);
          s3 = a3.double();
        }
        return i3;
      }
      wNAF(e2, t2, r3) {
        if (!this.Fn.isValid(r3)) throw Error("invalid scalar");
        let n3 = this.ZERO, i3 = this.BASE;
        const s3 = Gu(e2, this.bits);
        for (let e3 = 0; e3 < s3.windows; e3++) {
          const { nextN: a3, offset: o3, isZero: c3, isNeg: u2, isNegF: h4, offsetF: f2 } = ju(r3, e3, s3);
          r3 = a3, c3 ? i3 = i3.add(Ou(h4, t2[f2])) : n3 = n3.add(Ou(u2, t2[o3]));
        }
        return Yu(r3), { p: n3, f: i3 };
      }
      wNAFUnsafe(e2, t2, r3, n3 = this.ZERO) {
        const i3 = Gu(e2, this.bits);
        for (let e3 = 0; e3 < i3.windows && r3 !== Lu; e3++) {
          const { nextN: s3, offset: a3, isZero: o3, isNeg: c3 } = ju(r3, e3, i3);
          if (r3 = s3, !o3) {
            const e4 = t2[a3];
            n3 = n3.add(c3 ? e4.negate() : e4);
          }
        }
        return Yu(r3), n3;
      }
      getPrecomputes(e2, t2, r3) {
        let n3 = Vu.get(t2);
        return n3 || (n3 = this.precomputeWindow(t2, e2), 1 !== e2 && ("function" == typeof r3 && (n3 = r3(n3)), Vu.set(t2, n3))), n3;
      }
      cached(e2, t2, r3) {
        const n3 = _u(e2);
        return this.wNAF(n3, this.getPrecomputes(n3, e2, r3), t2);
      }
      unsafe(e2, t2, r3, n3) {
        const i3 = _u(e2);
        return 1 === i3 ? this._unsafeLadder(e2, t2, n3) : this.wNAFUnsafe(i3, this.getPrecomputes(i3, e2, r3), t2, n3);
      }
      createCache(e2, t2) {
        zu(t2, this.bits), qu.set(e2, t2), Vu.delete(e2);
      }
      hasCache(e2) {
        return 1 !== _u(e2);
      }
    };
    $u = (e2, t2) => (e2 + (e2 >= 0 ? t2 : -t2) / sh) / t2;
    rh = { Err: class extends Error {
      constructor(e2 = "") {
        super(e2);
      }
    }, _tlv: { encode: (e2, t2) => {
      const { Err: r3 } = rh;
      if (e2 < 0 || e2 > 256) throw new r3("tlv.encode: wrong tag");
      if (1 & t2.length) throw new r3("tlv.encode: unpadded data");
      const n3 = t2.length / 2, i3 = lc(n3);
      if (i3.length / 2 & 128) throw new r3("tlv.encode: long form length too big");
      const s3 = n3 > 127 ? lc(i3.length / 2 | 128) : "";
      return lc(e2) + s3 + i3 + t2;
    }, decode(e2, t2) {
      const { Err: r3 } = rh;
      let n3 = 0;
      if (e2 < 0 || e2 > 256) throw new r3("tlv.encode: wrong tag");
      if (t2.length < 2 || t2[n3++] !== e2) throw new r3("tlv.decode: wrong tlv");
      const i3 = t2[n3++];
      let s3 = 0;
      if (!!(128 & i3)) {
        const e3 = 127 & i3;
        if (!e3) throw new r3("tlv.decode(long): indefinite length not supported");
        if (e3 > 4) throw new r3("tlv.decode(long): byte length is too big");
        const a4 = t2.subarray(n3, n3 + e3);
        if (a4.length !== e3) throw new r3("tlv.decode: length bytes not complete");
        if (0 === a4[0]) throw new r3("tlv.decode(long): zero leftmost byte");
        for (const e4 of a4) s3 = s3 << 8 | e4;
        if (n3 += e3, s3 < 128) throw new r3("tlv.decode(long): not minimal encoding");
      } else s3 = i3;
      const a3 = t2.subarray(n3, n3 + s3);
      if (a3.length !== s3) throw new r3("tlv.decode: wrong value length");
      return { v: a3, l: t2.subarray(n3 + s3) };
    } }, _int: { encode(e2) {
      const { Err: t2 } = rh;
      if (e2 < nh) throw new t2("integer: negative integers are not allowed");
      let r3 = lc(e2);
      if (8 & Number.parseInt(r3[0], 16) && (r3 = "00" + r3), 1 & r3.length) throw new t2("unexpected DER parsing assertion: unpadded hex");
      return r3;
    }, decode(e2) {
      const { Err: t2 } = rh;
      if (128 & e2[0]) throw new t2("invalid signature integer: negative");
      if (0 === e2[0] && !(128 & e2[1])) throw new t2("invalid signature integer: unnecessary leading zero");
      return gc(e2);
    } }, toSig(e2) {
      const { Err: t2, _int: r3, _tlv: n3 } = rh, i3 = wc("signature", e2), { v: s3, l: a3 } = n3.decode(48, i3);
      if (a3.length) throw new t2("invalid signature: left bytes after parsing");
      const { v: o3, l: c3 } = n3.decode(2, s3), { v: u2, l: h4 } = n3.decode(2, c3);
      if (h4.length) throw new t2("invalid signature: left bytes after parsing");
      return { r: r3.decode(o3), s: r3.decode(u2) };
    }, hexFromSig(e2) {
      const { _tlv: t2, _int: r3 } = rh, n3 = t2.encode(2, r3.encode(e2.r)) + t2.encode(2, r3.encode(e2.s));
      return t2.encode(48, n3);
    } };
    nh = BigInt(0);
    ih = BigInt(1);
    sh = BigInt(2);
    ah = BigInt(3);
    oh = BigInt(4);
    Ah = { p: BigInt("0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff"), n: BigInt("0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551"), h: BigInt(1), a: BigInt("0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc"), b: BigInt("0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b"), Gx: BigInt("0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296"), Gy: BigInt("0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5") };
    wh = { p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000ffffffff"), n: BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffc7634d81f4372ddf581a0db248b0a77aecec196accc52973"), h: BigInt(1), a: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000fffffffc"), b: BigInt("0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef"), Gx: BigInt("0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7"), Gy: BigInt("0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f") };
    mh = { p: BigInt("0x1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"), n: BigInt("0x01fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa51868783bf2f966b7fcc0148f709a5d03bb5c9b8899c47aebb6fb71e91386409"), h: BigInt(1), a: BigInt("0x1fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc"), b: BigInt("0x0051953eb9618e1c9a1f929a21a0b68540eea2da725b99b315f3b8b489918ef109e156193951ec7e937b1652c0bd3bb1bf073573df883d2c34f1ef451fd46b503f00"), Gx: BigInt("0x00c6858e06b70404e9cd9e3ecb662395b4429c648139053fb521f828af606b4d3dbaa14b5e77efe75928fe1dc127a2ffa8de3348b3c1856a429bf97e7e31c2e5bd66"), Gy: BigInt("0x011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650") };
    bh = Yc(Ah.p);
    kh = Yc(wh.p);
    Eh = Yc(mh.p);
    vh = dh({ ...Ah, Fp: bh, lowS: false }, xu);
    Ih = dh({ ...wh, Fp: kh, lowS: false }, Ru);
    Bh = dh({ ...mh, Fp: Eh, lowS: false, allowedPrivateKeyLengths: [130, 131, 132] }, Mu);
    Sh = BigInt(0);
    Kh = BigInt(1);
    Ch = BigInt(2);
    Dh = BigInt(7);
    Uh = BigInt(256);
    Ph = BigInt(113);
    xh = [];
    Qh = [];
    Mh = [];
    for (let e2 = 0, t2 = Kh, r3 = 1, n3 = 0; e2 < 24; e2++) {
      [r3, n3] = [n3, (2 * r3 + 3 * n3) % 5], xh.push(2 * (5 * n3 + r3)), Qh.push((e2 + 1) * (e2 + 2) / 2 % 64);
      let i3 = Sh;
      for (let e3 = 0; e3 < 7; e3++) t2 = (t2 << Kh ^ (t2 >> Dh) * Ph) % Uh, t2 & Ch && (i3 ^= Kh << (Kh << /* @__PURE__ */ BigInt(e3)) - Kh);
      Mh.push(i3);
    }
    Rh = ou(Mh, true);
    Fh = Rh[0];
    Th = Rh[1];
    Lh = (e2, t2, r3) => r3 > 32 ? ((e3, t3, r4) => t3 << r4 - 32 | e3 >>> 64 - r4)(e2, t2, r3) : ((e3, t3, r4) => e3 << r4 | t3 >>> 32 - r4)(e2, t2, r3);
    Nh = (e2, t2, r3) => r3 > 32 ? ((e3, t3, r4) => e3 << r4 - 32 | t3 >>> 64 - r4)(e2, t2, r3) : ((e3, t3, r4) => t3 << r4 | e3 >>> 32 - r4)(e2, t2, r3);
    Oh = class _Oh extends ic {
      constructor(e2, t2, r3, n3 = false, i3 = 24) {
        if (super(), this.pos = 0, this.posOut = 0, this.finished = false, this.destroyed = false, this.enableXOF = false, this.blockLen = e2, this.suffix = t2, this.outputLen = r3, this.enableXOF = n3, this.rounds = i3, Ro(r3), !(0 < e2 && e2 < 200)) throw Error("only keccak-f1600 function is supported");
        var s3;
        this.state = new Uint8Array(200), this.state32 = (s3 = this.state, new Uint32Array(s3.buffer, s3.byteOffset, Math.floor(s3.byteLength / 4)));
      }
      clone() {
        return this._cloneInto();
      }
      keccak() {
        jo(this.state32), function(e2, t2 = 24) {
          const r3 = new Uint32Array(10);
          for (let n3 = 24 - t2; n3 < 24; n3++) {
            for (let t4 = 0; t4 < 10; t4++) r3[t4] = e2[t4] ^ e2[t4 + 10] ^ e2[t4 + 20] ^ e2[t4 + 30] ^ e2[t4 + 40];
            for (let t4 = 0; t4 < 10; t4 += 2) {
              const n4 = (t4 + 8) % 10, i4 = (t4 + 2) % 10, s3 = r3[i4], a3 = r3[i4 + 1], o3 = Lh(s3, a3, 1) ^ r3[n4], c3 = Nh(s3, a3, 1) ^ r3[n4 + 1];
              for (let r4 = 0; r4 < 50; r4 += 10) e2[t4 + r4] ^= o3, e2[t4 + r4 + 1] ^= c3;
            }
            let t3 = e2[2], i3 = e2[3];
            for (let r4 = 0; r4 < 24; r4++) {
              const n4 = Qh[r4], s3 = Lh(t3, i3, n4), a3 = Nh(t3, i3, n4), o3 = xh[r4];
              t3 = e2[o3], i3 = e2[o3 + 1], e2[o3] = s3, e2[o3 + 1] = a3;
            }
            for (let t4 = 0; t4 < 50; t4 += 10) {
              for (let n4 = 0; n4 < 10; n4++) r3[n4] = e2[t4 + n4];
              for (let n4 = 0; n4 < 10; n4++) e2[t4 + n4] ^= ~r3[(n4 + 2) % 10] & r3[(n4 + 4) % 10];
            }
            e2[0] ^= Fh[n3], e2[1] ^= Th[n3];
          }
          Oo(r3);
        }(this.state32, this.rounds), jo(this.state32), this.posOut = 0, this.pos = 0;
      }
      update(e2) {
        Lo(this), Fo(e2 = rc(e2));
        const { blockLen: t2, state: r3 } = this, n3 = e2.length;
        for (let i3 = 0; i3 < n3; ) {
          const s3 = Math.min(t2 - this.pos, n3 - i3);
          for (let t3 = 0; t3 < s3; t3++) r3[this.pos++] ^= e2[i3++];
          this.pos === t2 && this.keccak();
        }
        return this;
      }
      finish() {
        if (this.finished) return;
        this.finished = true;
        const { state: e2, suffix: t2, pos: r3, blockLen: n3 } = this;
        e2[r3] ^= t2, 128 & t2 && r3 === n3 - 1 && this.keccak(), e2[n3 - 1] ^= 128, this.keccak();
      }
      writeInto(e2) {
        Lo(this, false), Fo(e2), this.finish();
        const t2 = this.state, { blockLen: r3 } = this;
        for (let n3 = 0, i3 = e2.length; n3 < i3; ) {
          this.posOut >= r3 && this.keccak();
          const s3 = Math.min(r3 - this.posOut, i3 - n3);
          e2.set(t2.subarray(this.posOut, this.posOut + s3), n3), this.posOut += s3, n3 += s3;
        }
        return e2;
      }
      xofInto(e2) {
        if (!this.enableXOF) throw Error("XOF is not possible for this instance");
        return this.writeInto(e2);
      }
      xof(e2) {
        return Ro(e2), this.xofInto(new Uint8Array(e2));
      }
      digestInto(e2) {
        if (No(e2, this), this.finished) throw Error("digest() was already called");
        return this.writeInto(e2), this.destroy(), e2;
      }
      digest() {
        return this.digestInto(new Uint8Array(this.outputLen));
      }
      destroy() {
        this.destroyed = true, Oo(this.state);
      }
      _cloneInto(e2) {
        const { blockLen: t2, suffix: r3, outputLen: n3, rounds: i3, enableXOF: s3 } = this;
        return e2 || (e2 = new _Oh(t2, r3, n3, s3, i3)), e2.state32.set(this.state32), e2.pos = this.pos, e2.posOut = this.posOut, e2.finished = this.finished, e2.rounds = i3, e2.suffix = r3, e2.outputLen = n3, e2.enableXOF = s3, e2.destroyed = this.destroyed, e2;
      }
    };
    Hh = (e2, t2, r3) => sc(() => new Oh(t2, e2, r3));
    zh = /* @__PURE__ */ (() => Hh(6, 136, 32))();
    Gh = /* @__PURE__ */ (() => Hh(6, 72, 64))();
    jh = (e2, t2, r3) => function(e3) {
      const t3 = (t4, r5) => e3(r5).update(rc(t4)).digest(), r4 = e3({});
      return t3.outputLen = r4.outputLen, t3.blockLen = r4.blockLen, t3.create = (t4) => e3(t4), t3;
    }((n3 = {}) => new Oh(t2, e2, void 0 === n3.dkLen ? r3 : n3.dkLen, true));
    Vh = /* @__PURE__ */ (() => jh(31, 136, 32))();
    qh = BigInt(0);
    _h = BigInt(1);
    Yh = BigInt(2);
    Zh = BigInt(8);
    Xh = BigInt(0);
    $h = BigInt(1);
    ef = BigInt(2);
    rf = { p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffffffffffffffffffffffffffffffffffffffffffffffffffff"), n: BigInt("0x3fffffffffffffffffffffffffffffffffffffffffffffffffffffff7cca23e9c44edb49aed63690216cc2728dc58f552378c292ab5844f3"), h: BigInt(4), a: BigInt(1), d: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffffffffffffffffffffffffffffffffffffffffffffffff6756"), Gx: BigInt("0x4f1970c66bed0ded221d15a622bf36da9e146570470f1767ea6de324a3d3a46412ae1af72ab66511433b80e18b00938e2626a82bc70cc05e"), Gy: BigInt("0x693f46716eb6bc248876203756c9c7624bea73736ca3984087789c1e05a0c2d73ad3ff1ce67c39c4fdbd132c4ed7c8ad9808795bf230fa14") };
    nf = Object.assign({}, rf, { d: BigInt("0xd78b4bdc7f0daf19f24f38c29373a2ccad46157242a50f37809b1da3412a12e79ccc9c81264cfe9ad080997058fb61c4243cc32dbaa156b9"), Gx: BigInt("0x79a70b2b70400553ae7c9df416c792c61128751ac92969240c25a07d728bdc93e21f7787ed6972249de732f38496cd11698713093e9c04fc"), Gy: BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffff80000000000000000000000000000000000000000000000000000001") });
    sf = /* @__PURE__ */ sc(() => Vh.create({ dkLen: 114 }));
    af = BigInt(1);
    of = BigInt(2);
    cf = BigInt(3);
    BigInt(4);
    uf = BigInt(11);
    hf = BigInt(22);
    ff = BigInt(44);
    lf = BigInt(88);
    yf = BigInt(223);
    Af = /* @__PURE__ */ (() => Yc(rf.p, { BITS: 456, isLE: true }))();
    wf = /* @__PURE__ */ (() => Yc(rf.n, { BITS: 456, isLE: true }))();
    bf = function(e2) {
      const { CURVE: t2, curveOpts: r3, hash: n3, eddsaOpts: i3 } = function(e3) {
        const t3 = { a: e3.a, d: e3.d, p: e3.Fp.ORDER, n: e3.n, h: e3.h, Gx: e3.Gx, Gy: e3.Gy }, r4 = { Fp: e3.Fp, Fn: Yc(t3.n, e3.nBitLength, true), uvRatio: e3.uvRatio }, n4 = { randomBytes: e3.randomBytes, adjustScalarBytes: e3.adjustScalarBytes, domain: e3.domain, prehash: e3.prehash, mapToCurve: e3.mapToCurve };
        return { CURVE: t3, curveOpts: r4, hash: e3.hash, eddsaOpts: n4 };
      }(e2);
      return function(e3, t3) {
        const r4 = t3.Point;
        return Object.assign({}, t3, { ExtendedPoint: r4, CURVE: e3, nBitLength: r4.Fn.BITS, nByteLength: r4.Fn.BYTES });
      }(e2, Wh(Jh(t2, r3), n3, i3));
    }(/* @__PURE__ */ (() => ({ ...rf, Fp: Af, Fn: wf, nBitLength: wf.BITS, hash: sf, adjustScalarBytes: pf, domain: mf, uvRatio: df }))());
    Jh(nf);
    kf = /* @__PURE__ */ (() => {
      const e2 = rf.p;
      return tf({ P: e2, type: "x448", powPminus2: (t2) => Fc(Tc(gf(t2), of, e2) * t2, e2), adjustScalarBytes: pf });
    })();
    Ef = { p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"), n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"), h: BigInt(1), a: BigInt(0), b: BigInt(7), Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"), Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8") };
    vf = { beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"), basises: [[BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")], [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]] };
    If = /* @__PURE__ */ BigInt(2);
    Bf = Yc(Ef.p, { sqrt: function(e2) {
      const t2 = Ef.p, r3 = BigInt(3), n3 = BigInt(6), i3 = BigInt(11), s3 = BigInt(22), a3 = BigInt(23), o3 = BigInt(44), c3 = BigInt(88), u2 = e2 * e2 * e2 % t2, h4 = u2 * u2 * e2 % t2, f2 = Tc(h4, r3, t2) * h4 % t2, l2 = Tc(f2, r3, t2) * h4 % t2, y2 = Tc(l2, If, t2) * u2 % t2, g2 = Tc(y2, i3, t2) * y2 % t2, p2 = Tc(g2, s3, t2) * g2 % t2, d3 = Tc(p2, o3, t2) * p2 % t2, A2 = Tc(d3, c3, t2) * d3 % t2, w2 = Tc(A2, o3, t2) * p2 % t2, m2 = Tc(w2, r3, t2) * h4 % t2, b2 = Tc(m2, a3, t2) * g2 % t2, k2 = Tc(b2, n3, t2) * u2 % t2, E2 = Tc(k2, If, t2);
      if (!Bf.eql(Bf.sqr(E2), e2)) throw Error("Cannot find square root");
      return E2;
    } });
    Sf = dh({ ...Ef, Fp: Bf, lowS: true, endo: vf }, xu);
    Kf = xu;
    Cf = Qu;
    Df = Yc(BigInt("0xa9fb57dba1eea9bc3e660a909d838d726e3bf623d52620282013481d1f6e5377"));
    Uf = dh({ a: Df.create(BigInt("0x7d5a0975fc2c3057eef67530417affe7fb8055c126dc5c6ce94a4b44f330b5d9")), b: BigInt("0x26dc5c6ce94a4b44f330b5d9bbd77cbf958416295cf7e1ce6bccdc18ff8c07b6"), Fp: Df, n: BigInt("0xa9fb57dba1eea9bc3e660a909d838d718c397aa3b561a6f7901e0e82974856a7"), Gx: BigInt("0x8bd2aeb9cb7e57cb2c4b482ffc81b7afb9de27e1e3bd23c23a4453bd9ace3262"), Gy: BigInt("0x547ef835c3dac4fd97f8461a14611dc9c27745132ded8e545c1d54c72f046997"), h: BigInt(1), lowS: false }, Kf);
    Pf = Mu;
    xf = Ru;
    Qf = Yc(BigInt("0x8cb91e82a3386d280f5d6f7e50e641df152f7109ed5456b412b1da197fb71123acd3a729901d1a71874700133107ec53"));
    Mf = dh({ a: Qf.create(BigInt("0x7bc382c63d8c150c3c72080ace05afa0c2bea28e4fb22787139165efba91f90f8aa5814a503ad4eb04a8c7dd22ce2826")), b: BigInt("0x04a8c7dd22ce28268b39b55416f0447c2fb77de107dcd2a62e880ea53eeb62d57cb4390295dbc9943ab78696fa504c11"), Fp: Qf, n: BigInt("0x8cb91e82a3386d280f5d6f7e50e641df152f7109ed5456b31f166e6cac0425a7cf3ab6af6b7fc3103b883202e9046565"), Gx: BigInt("0x1d1c64f068cf45ffa2a63a81b7c13f6b8847a3e77ef14fe3db7fcafe0cbd10e8e826e03436d646aaef87b2e247d4af1e"), Gy: BigInt("0x8abe1d7520f9c2a45cb1eb8e95cfd55262b70b29feec5864e19c054ff99129280e4646217791811142820341263c5315"), h: BigInt(1), lowS: false }, xf);
    Rf = Yc(BigInt("0xaadd9db8dbe9c48b3fd4e6ae33c9fc07cb308db3b3c9d20ed6639cca703308717d4d9b009bc66842aecda12ae6a380e62881ff2f2d82c68528aa6056583a48f3"));
    Ff = dh({ a: Rf.create(BigInt("0x7830a3318b603b89e2327145ac234cc594cbdd8d3df91610a83441caea9863bc2ded5d5aa8253aa10a2ef1c98b9ac8b57f1117a72bf2c7b9e7c1ac4d77fc94ca")), b: BigInt("0x3df91610a83441caea9863bc2ded5d5aa8253aa10a2ef1c98b9ac8b57f1117a72bf2c7b9e7c1ac4d77fc94cadc083e67984050b75ebae5dd2809bd638016f723"), Fp: Rf, n: BigInt("0xaadd9db8dbe9c48b3fd4e6ae33c9fc07cb308db3b3c9d20ed6639cca70330870553e5c414ca92619418661197fac10471db1d381085ddaddb58796829ca90069"), Gx: BigInt("0x81aee4bdd82ed9645a21322e9c4c6a9385ed9f70b5d916c1b43b62eef4d0098eff3b1f78e2d0d48d50d1687b93b97d5f7c6d5047406a5e688b352209bcb9f822"), Gy: BigInt("0x7dde385d566332ecc0eabfa9cf7822fdf209f70024a57b1aa000c55b881f8111b2dcde494a5f485e5bca4bd88a2763aed1ca2b2fa8f0540678cd1e0f3ad80892"), h: BigInt(1), lowS: false }, Pf);
    Tf = new Map(Object.entries({ nistP256: vh, nistP384: Ih, nistP521: Bh, brainpoolP256r1: Uf, brainpoolP384r1: Mf, brainpoolP512r1: Ff, secp256k1: Sf, x448: kf, ed448: bf }));
    Lf = /* @__PURE__ */ Object.freeze({ __proto__: null, nobleCurves: Tf });
    Nf = /* @__PURE__ */ Uint32Array.from([1732584193, 4023233417, 2562383102, 271733878, 3285377520]);
    Of = /* @__PURE__ */ new Uint32Array(80);
    Hf = class extends $c {
      constructor() {
        super(64, 20, 8, false), this.A = 0 | Nf[0], this.B = 0 | Nf[1], this.C = 0 | Nf[2], this.D = 0 | Nf[3], this.E = 0 | Nf[4];
      }
      get() {
        const { A: e2, B: t2, C: r3, D: n3, E: i3 } = this;
        return [e2, t2, r3, n3, i3];
      }
      set(e2, t2, r3, n3, i3) {
        this.A = 0 | e2, this.B = 0 | t2, this.C = 0 | r3, this.D = 0 | n3, this.E = 0 | i3;
      }
      process(e2, t2) {
        for (let r4 = 0; r4 < 16; r4++, t2 += 4) Of[r4] = e2.getUint32(t2, false);
        for (let e3 = 16; e3 < 80; e3++) Of[e3] = Go(Of[e3 - 3] ^ Of[e3 - 8] ^ Of[e3 - 14] ^ Of[e3 - 16], 1);
        let { A: r3, B: n3, C: i3, D: s3, E: a3 } = this;
        for (let e3 = 0; e3 < 80; e3++) {
          let t3, o3;
          e3 < 20 ? (t3 = Wc(n3, i3, s3), o3 = 1518500249) : e3 < 40 ? (t3 = n3 ^ i3 ^ s3, o3 = 1859775393) : e3 < 60 ? (t3 = Xc(n3, i3, s3), o3 = 2400959708) : (t3 = n3 ^ i3 ^ s3, o3 = 3395469782);
          const c3 = Go(r3, 5) + t3 + a3 + o3 + Of[e3] | 0;
          a3 = s3, s3 = i3, i3 = Go(n3, 30), n3 = r3, r3 = c3;
        }
        r3 = r3 + this.A | 0, n3 = n3 + this.B | 0, i3 = i3 + this.C | 0, s3 = s3 + this.D | 0, a3 = a3 + this.E | 0, this.set(r3, n3, i3, s3, a3);
      }
      roundClean() {
        Oo(Of);
      }
      destroy() {
        this.set(0, 0, 0, 0, 0), Oo(this.buffer);
      }
    };
    zf = /* @__PURE__ */ sc(() => new Hf());
    Gf = /* @__PURE__ */ Uint8Array.from([7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8]);
    jf = /* @__PURE__ */ (() => Uint8Array.from(Array(16).fill(0).map((e2, t2) => t2)))();
    Vf = /* @__PURE__ */ (() => jf.map((e2) => (9 * e2 + 5) % 16))();
    qf = /* @__PURE__ */ (() => {
      const e2 = [[jf], [Vf]];
      for (let t2 = 0; t2 < 4; t2++) for (let r3 of e2) r3.push(r3[t2].map((e3) => Gf[e3]));
      return e2;
    })();
    _f = /* @__PURE__ */ (() => qf[0])();
    Yf = /* @__PURE__ */ (() => qf[1])();
    Zf = /* @__PURE__ */ [[11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8], [12, 13, 11, 15, 6, 9, 9, 7, 12, 15, 11, 13, 7, 8, 7, 7], [13, 15, 14, 11, 7, 7, 6, 8, 13, 14, 13, 12, 5, 5, 6, 9], [14, 11, 12, 14, 8, 6, 5, 5, 15, 12, 15, 14, 9, 9, 8, 6], [15, 12, 13, 13, 9, 5, 8, 6, 14, 11, 12, 11, 8, 6, 5, 5]].map((e2) => Uint8Array.from(e2));
    Jf = /* @__PURE__ */ _f.map((e2, t2) => e2.map((e3) => Zf[t2][e3]));
    Wf = /* @__PURE__ */ Yf.map((e2, t2) => e2.map((e3) => Zf[t2][e3]));
    Xf = /* @__PURE__ */ Uint32Array.from([0, 1518500249, 1859775393, 2400959708, 2840853838]);
    $f = /* @__PURE__ */ Uint32Array.from([1352829926, 1548603684, 1836072691, 2053994217, 0]);
    tl = /* @__PURE__ */ new Uint32Array(16);
    rl = class extends $c {
      constructor() {
        super(64, 20, 8, true), this.h0 = 1732584193, this.h1 = -271733879, this.h2 = -1732584194, this.h3 = 271733878, this.h4 = -1009589776;
      }
      get() {
        const { h0: e2, h1: t2, h2: r3, h3: n3, h4: i3 } = this;
        return [e2, t2, r3, n3, i3];
      }
      set(e2, t2, r3, n3, i3) {
        this.h0 = 0 | e2, this.h1 = 0 | t2, this.h2 = 0 | r3, this.h3 = 0 | n3, this.h4 = 0 | i3;
      }
      process(e2, t2) {
        for (let r4 = 0; r4 < 16; r4++, t2 += 4) tl[r4] = e2.getUint32(t2, true);
        let r3 = 0 | this.h0, n3 = r3, i3 = 0 | this.h1, s3 = i3, a3 = 0 | this.h2, o3 = a3, c3 = 0 | this.h3, u2 = c3, h4 = 0 | this.h4, f2 = h4;
        for (let e3 = 0; e3 < 5; e3++) {
          const t3 = 4 - e3, l2 = Xf[e3], y2 = $f[e3], g2 = _f[e3], p2 = Yf[e3], d3 = Jf[e3], A2 = Wf[e3];
          for (let t4 = 0; t4 < 16; t4++) {
            const n4 = Go(r3 + el(e3, i3, a3, c3) + tl[g2[t4]] + l2, d3[t4]) + h4 | 0;
            r3 = h4, h4 = c3, c3 = 0 | Go(a3, 10), a3 = i3, i3 = n4;
          }
          for (let e4 = 0; e4 < 16; e4++) {
            const r4 = Go(n3 + el(t3, s3, o3, u2) + tl[p2[e4]] + y2, A2[e4]) + f2 | 0;
            n3 = f2, f2 = u2, u2 = 0 | Go(o3, 10), o3 = s3, s3 = r4;
          }
        }
        this.set(this.h1 + a3 + u2 | 0, this.h2 + c3 + f2 | 0, this.h3 + h4 + n3 | 0, this.h4 + r3 + s3 | 0, this.h0 + i3 + o3 | 0);
      }
      roundClean() {
        Oo(tl);
      }
      destroy() {
        this.destroyed = true, Oo(this.buffer), this.set(0, 0, 0, 0, 0);
      }
    };
    nl = zf;
    il = /* @__PURE__ */ sc(() => new rl());
    sl = Array.from({ length: 64 }, (e2, t2) => Math.floor(2 ** 32 * Math.abs(Math.sin(t2 + 1))));
    al = (e2, t2, r3) => e2 & t2 ^ ~e2 & r3;
    ol = /* @__PURE__ */ new Uint32Array([1732584193, 4023233417, 2562383102, 271733878]);
    cl = /* @__PURE__ */ new Uint32Array(16);
    ul = class extends $c {
      constructor() {
        super(64, 16, 8, true), this.A = 0 | ol[0], this.B = 0 | ol[1], this.C = 0 | ol[2], this.D = 0 | ol[3];
      }
      get() {
        const { A: e2, B: t2, C: r3, D: n3 } = this;
        return [e2, t2, r3, n3];
      }
      set(e2, t2, r3, n3) {
        this.A = 0 | e2, this.B = 0 | t2, this.C = 0 | r3, this.D = 0 | n3;
      }
      process(e2, t2) {
        for (let r4 = 0; r4 < 16; r4++, t2 += 4) cl[r4] = e2.getUint32(t2, true);
        let { A: r3, B: n3, C: i3, D: s3 } = this;
        for (let e3 = 0; e3 < 64; e3++) {
          let t3, a3, o3;
          e3 < 16 ? (t3 = al(n3, i3, s3), a3 = e3, o3 = [7, 12, 17, 22]) : e3 < 32 ? (t3 = al(s3, n3, i3), a3 = (5 * e3 + 1) % 16, o3 = [5, 9, 14, 20]) : e3 < 48 ? (t3 = n3 ^ i3 ^ s3, a3 = (3 * e3 + 5) % 16, o3 = [4, 11, 16, 23]) : (t3 = i3 ^ (n3 | ~s3), a3 = 7 * e3 % 16, o3 = [6, 10, 15, 21]), t3 = t3 + r3 + sl[e3] + cl[a3], r3 = s3, s3 = i3, i3 = n3, n3 += Go(t3, o3[e3 % 4]);
        }
        r3 = r3 + this.A | 0, n3 = n3 + this.B | 0, i3 = i3 + this.C | 0, s3 = s3 + this.D | 0, this.set(r3, n3, i3, s3);
      }
      roundClean() {
        cl.fill(0);
      }
      destroy() {
        this.set(0, 0, 0, 0), this.buffer.fill(0);
      }
    };
    hl = new Map(Object.entries({ md5: /* @__PURE__ */ ac(() => new ul()), sha1: nl, sha224: Cf, sha256: Kf, sha384: xf, sha512: Pf, sha3_256: zh, sha3_512: Gh, ripemd160: il }));
    fl = /* @__PURE__ */ Object.freeze({ __proto__: null, nobleHashes: hl });
    ll = "object" == typeof e && "crypto" in e ? e.crypto : void 0;
    yl = {};
    gl = function(e2) {
      var t2, r3 = new Float64Array(16);
      if (e2) for (t2 = 0; t2 < e2.length; t2++) r3[t2] = e2[t2];
      return r3;
    };
    pl = function() {
      throw Error("no PRNG");
    };
    dl = new Uint8Array(32);
    dl[0] = 9;
    Al = gl();
    wl = gl([1]);
    ml = gl([56129, 1]);
    bl = gl([30883, 4953, 19914, 30187, 55467, 16705, 2637, 112, 59544, 30585, 16505, 36039, 65139, 11119, 27886, 20995]);
    kl = gl([61785, 9906, 39828, 60374, 45398, 33411, 5274, 224, 53552, 61171, 33010, 6542, 64743, 22239, 55772, 9222]);
    El = gl([54554, 36645, 11616, 51542, 42930, 38181, 51040, 26924, 56412, 64982, 57905, 49316, 21502, 52590, 14035, 8553]);
    vl = gl([26200, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214]);
    Il = gl([41136, 18958, 6951, 50414, 58488, 44335, 6150, 12099, 55207, 15867, 153, 11085, 57099, 20417, 9344, 11139]);
    Hl = [1116352408, 3609767458, 1899447441, 602891725, 3049323471, 3964484399, 3921009573, 2173295548, 961987163, 4081628472, 1508970993, 3053834265, 2453635748, 2937671579, 2870763221, 3664609560, 3624381080, 2734883394, 310598401, 1164996542, 607225278, 1323610764, 1426881987, 3590304994, 1925078388, 4068182383, 2162078206, 991336113, 2614888103, 633803317, 3248222580, 3479774868, 3835390401, 2666613458, 4022224774, 944711139, 264347078, 2341262773, 604807628, 2007800933, 770255983, 1495990901, 1249150122, 1856431235, 1555081692, 3175218132, 1996064986, 2198950837, 2554220882, 3999719339, 2821834349, 766784016, 2952996808, 2566594879, 3210313671, 3203337956, 3336571891, 1034457026, 3584528711, 2466948901, 113926993, 3758326383, 338241895, 168717936, 666307205, 1188179964, 773529912, 1546045734, 1294757372, 1522805485, 1396182291, 2643833823, 1695183700, 2343527390, 1986661051, 1014477480, 2177026350, 1206759142, 2456956037, 344077627, 2730485921, 1290863460, 2820302411, 3158454273, 3259730800, 3505952657, 3345764771, 106217008, 3516065817, 3606008344, 3600352804, 1432725776, 4094571909, 1467031594, 275423344, 851169720, 430227734, 3100823752, 506948616, 1363258195, 659060556, 3750685593, 883997877, 3785050280, 958139571, 3318307427, 1322822218, 3812723403, 1537002063, 2003034995, 1747873779, 3602036899, 1955562222, 1575990012, 2024104815, 1125592928, 2227730452, 2716904306, 2361852424, 442776044, 2428436474, 593698344, 2756734187, 3733110249, 3204031479, 2999351573, 3329325298, 3815920427, 3391569614, 3928383900, 3515267271, 566280711, 3940187606, 3454069534, 4118630271, 4000239992, 116418474, 1914138554, 174292421, 2731055270, 289380356, 3203993006, 460393269, 320620315, 685471733, 587496836, 852142971, 1086792851, 1017036298, 365543100, 1126000580, 2618297676, 1288033470, 3409855158, 1501505948, 4234509866, 1607167915, 987167468, 1816402316, 1246189591];
    Jl = new Float64Array([237, 211, 245, 92, 26, 99, 18, 88, 214, 156, 247, 162, 222, 249, 222, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16]);
    ey = 64;
    yl.scalarMult = function(e2, t2) {
      if (ty(e2, t2), 32 !== e2.length) throw Error("bad n size");
      if (32 !== t2.length) throw Error("bad p size");
      var r3 = new Uint8Array(32);
      return Nl(r3, e2, t2), r3;
    }, yl.box = {}, yl.box.keyPair = function() {
      var e2 = new Uint8Array(32), t2 = new Uint8Array(32);
      return function(e3, t3) {
        pl(t3, 32), Ol(e3, t3);
      }(e2, t2), { publicKey: e2, secretKey: t2 };
    }, yl.box.keyPair.fromSecretKey = function(e2) {
      if (ty(e2), 32 !== e2.length) throw Error("bad secret key size");
      var t2 = new Uint8Array(32);
      return Ol(t2, e2), { publicKey: t2, secretKey: new Uint8Array(e2) };
    }, yl.sign = function(e2, t2) {
      if (ty(e2, t2), 64 !== t2.length) throw Error("bad secret key size");
      var r3 = new Uint8Array(ey + e2.length);
      return function(e3, t3, r4, n3) {
        var i3, s3, a3 = new Uint8Array(64), o3 = new Uint8Array(64), c3 = new Uint8Array(64), u2 = new Float64Array(64), h4 = [gl(), gl(), gl(), gl()];
        Gl(a3, n3, 32), a3[0] &= 248, a3[31] &= 127, a3[31] |= 64;
        var f2 = r4 + 64;
        for (i3 = 0; i3 < r4; i3++) e3[64 + i3] = t3[i3];
        for (i3 = 0; i3 < 32; i3++) e3[32 + i3] = a3[32 + i3];
        for (Gl(c3, e3.subarray(32), r4 + 32), Xl(c3), Yl(h4, c3), ql(e3, h4), i3 = 32; i3 < 64; i3++) e3[i3] = n3[i3];
        for (Gl(o3, e3, r4 + 64), Xl(o3), i3 = 0; i3 < 64; i3++) u2[i3] = 0;
        for (i3 = 0; i3 < 32; i3++) u2[i3] = c3[i3];
        for (i3 = 0; i3 < 32; i3++) for (s3 = 0; s3 < 32; s3++) u2[i3 + s3] += o3[i3] * a3[s3];
        Wl(e3.subarray(32), u2);
      }(r3, e2, e2.length, t2), r3;
    }, yl.sign.detached = function(e2, t2) {
      for (var r3 = yl.sign(e2, t2), n3 = new Uint8Array(ey), i3 = 0; i3 < n3.length; i3++) n3[i3] = r3[i3];
      return n3;
    }, yl.sign.detached.verify = function(e2, t2, r3) {
      if (ty(e2, t2, r3), t2.length !== ey) throw Error("bad signature size");
      if (32 !== r3.length) throw Error("bad public key size");
      var n3, i3 = new Uint8Array(ey + e2.length), s3 = new Uint8Array(ey + e2.length);
      for (n3 = 0; n3 < ey; n3++) i3[n3] = t2[n3];
      for (n3 = 0; n3 < e2.length; n3++) i3[n3 + ey] = e2[n3];
      return function(e3, t3, r4, n4) {
        var i4, s4 = new Uint8Array(32), a3 = new Uint8Array(64), o3 = [gl(), gl(), gl(), gl()], c3 = [gl(), gl(), gl(), gl()];
        if (r4 < 64) return -1;
        if ($l(c3, n4)) return -1;
        for (i4 = 0; i4 < r4; i4++) e3[i4] = t3[i4];
        for (i4 = 0; i4 < 32; i4++) e3[i4 + 32] = n4[i4];
        if (Gl(a3, e3, r4), Xl(a3), _l(o3, c3, a3), Yl(c3, t3.subarray(32)), jl(o3, c3), ql(s4, o3), r4 -= 64, Sl(t3, 0, s4, 0)) {
          for (i4 = 0; i4 < r4; i4++) e3[i4] = 0;
          return -1;
        }
        for (i4 = 0; i4 < r4; i4++) e3[i4] = t3[i4 + 64];
        return r4;
      }(s3, i3, i3.length, r3) >= 0;
    }, yl.sign.keyPair = function() {
      var e2 = new Uint8Array(32), t2 = new Uint8Array(64);
      return Zl(e2, t2), { publicKey: e2, secretKey: t2 };
    }, yl.sign.keyPair.fromSecretKey = function(e2) {
      if (ty(e2), 64 !== e2.length) throw Error("bad secret key size");
      for (var t2 = new Uint8Array(32), r3 = 0; r3 < t2.length; r3++) t2[r3] = e2[32 + r3];
      return { publicKey: t2, secretKey: new Uint8Array(e2) };
    }, yl.sign.keyPair.fromSeed = function(e2) {
      if (ty(e2), 32 !== e2.length) throw Error("bad seed size");
      for (var t2 = new Uint8Array(32), r3 = new Uint8Array(64), n3 = 0; n3 < 32; n3++) r3[n3] = e2[n3];
      return Zl(t2, r3, true), { publicKey: t2, secretKey: r3 };
    }, yl.setPRNG = function(e2) {
      pl = e2;
    }, function() {
      if (ll && ll.getRandomValues) {
        yl.setPRNG(function(e2, t2) {
          var r3, n3 = new Uint8Array(t2);
          for (r3 = 0; r3 < t2; r3 += 65536) ll.getRandomValues(n3.subarray(r3, r3 + Math.min(t2 - r3, 65536)));
          for (r3 = 0; r3 < t2; r3++) e2[r3] = n3[r3];
          !function(e3) {
            for (var t3 = 0; t3 < e3.length; t3++) e3[t3] = 0;
          }(n3);
        });
      }
    }();
    ry = /* @__PURE__ */ Object.freeze({ __proto__: null, default: yl });
    sy.keySize = sy.prototype.keySize = 24, sy.blockSize = sy.prototype.blockSize = 8, oy.blockSize = oy.prototype.blockSize = 8, oy.keySize = oy.prototype.keySize = 16;
    cy = 4294967295;
    yy.keySize = yy.prototype.keySize = 32, yy.blockSize = yy.prototype.blockSize = 16, gy.prototype.BLOCKSIZE = 8, gy.prototype.SBOXES = [[3509652390, 2564797868, 805139163, 3491422135, 3101798381, 1780907670, 3128725573, 4046225305, 614570311, 3012652279, 134345442, 2240740374, 1667834072, 1901547113, 2757295779, 4103290238, 227898511, 1921955416, 1904987480, 2182433518, 2069144605, 3260701109, 2620446009, 720527379, 3318853667, 677414384, 3393288472, 3101374703, 2390351024, 1614419982, 1822297739, 2954791486, 3608508353, 3174124327, 2024746970, 1432378464, 3864339955, 2857741204, 1464375394, 1676153920, 1439316330, 715854006, 3033291828, 289532110, 2706671279, 2087905683, 3018724369, 1668267050, 732546397, 1947742710, 3462151702, 2609353502, 2950085171, 1814351708, 2050118529, 680887927, 999245976, 1800124847, 3300911131, 1713906067, 1641548236, 4213287313, 1216130144, 1575780402, 4018429277, 3917837745, 3693486850, 3949271944, 596196993, 3549867205, 258830323, 2213823033, 772490370, 2760122372, 1774776394, 2652871518, 566650946, 4142492826, 1728879713, 2882767088, 1783734482, 3629395816, 2517608232, 2874225571, 1861159788, 326777828, 3124490320, 2130389656, 2716951837, 967770486, 1724537150, 2185432712, 2364442137, 1164943284, 2105845187, 998989502, 3765401048, 2244026483, 1075463327, 1455516326, 1322494562, 910128902, 469688178, 1117454909, 936433444, 3490320968, 3675253459, 1240580251, 122909385, 2157517691, 634681816, 4142456567, 3825094682, 3061402683, 2540495037, 79693498, 3249098678, 1084186820, 1583128258, 426386531, 1761308591, 1047286709, 322548459, 995290223, 1845252383, 2603652396, 3431023940, 2942221577, 3202600964, 3727903485, 1712269319, 422464435, 3234572375, 1170764815, 3523960633, 3117677531, 1434042557, 442511882, 3600875718, 1076654713, 1738483198, 4213154764, 2393238008, 3677496056, 1014306527, 4251020053, 793779912, 2902807211, 842905082, 4246964064, 1395751752, 1040244610, 2656851899, 3396308128, 445077038, 3742853595, 3577915638, 679411651, 2892444358, 2354009459, 1767581616, 3150600392, 3791627101, 3102740896, 284835224, 4246832056, 1258075500, 768725851, 2589189241, 3069724005, 3532540348, 1274779536, 3789419226, 2764799539, 1660621633, 3471099624, 4011903706, 913787905, 3497959166, 737222580, 2514213453, 2928710040, 3937242737, 1804850592, 3499020752, 2949064160, 2386320175, 2390070455, 2415321851, 4061277028, 2290661394, 2416832540, 1336762016, 1754252060, 3520065937, 3014181293, 791618072, 3188594551, 3933548030, 2332172193, 3852520463, 3043980520, 413987798, 3465142937, 3030929376, 4245938359, 2093235073, 3534596313, 375366246, 2157278981, 2479649556, 555357303, 3870105701, 2008414854, 3344188149, 4221384143, 3956125452, 2067696032, 3594591187, 2921233993, 2428461, 544322398, 577241275, 1471733935, 610547355, 4027169054, 1432588573, 1507829418, 2025931657, 3646575487, 545086370, 48609733, 2200306550, 1653985193, 298326376, 1316178497, 3007786442, 2064951626, 458293330, 2589141269, 3591329599, 3164325604, 727753846, 2179363840, 146436021, 1461446943, 4069977195, 705550613, 3059967265, 3887724982, 4281599278, 3313849956, 1404054877, 2845806497, 146425753, 1854211946], [1266315497, 3048417604, 3681880366, 3289982499, 290971e4, 1235738493, 2632868024, 2414719590, 3970600049, 1771706367, 1449415276, 3266420449, 422970021, 1963543593, 2690192192, 3826793022, 1062508698, 1531092325, 1804592342, 2583117782, 2714934279, 4024971509, 1294809318, 4028980673, 1289560198, 2221992742, 1669523910, 35572830, 157838143, 1052438473, 1016535060, 1802137761, 1753167236, 1386275462, 3080475397, 2857371447, 1040679964, 2145300060, 2390574316, 1461121720, 2956646967, 4031777805, 4028374788, 33600511, 2920084762, 1018524850, 629373528, 3691585981, 3515945977, 2091462646, 2486323059, 586499841, 988145025, 935516892, 3367335476, 2599673255, 2839830854, 265290510, 3972581182, 2759138881, 3795373465, 1005194799, 847297441, 406762289, 1314163512, 1332590856, 1866599683, 4127851711, 750260880, 613907577, 1450815602, 3165620655, 3734664991, 3650291728, 3012275730, 3704569646, 1427272223, 778793252, 1343938022, 2676280711, 2052605720, 1946737175, 3164576444, 3914038668, 3967478842, 3682934266, 1661551462, 3294938066, 4011595847, 840292616, 3712170807, 616741398, 312560963, 711312465, 1351876610, 322626781, 1910503582, 271666773, 2175563734, 1594956187, 70604529, 3617834859, 1007753275, 1495573769, 4069517037, 2549218298, 2663038764, 504708206, 2263041392, 3941167025, 2249088522, 1514023603, 1998579484, 1312622330, 694541497, 2582060303, 2151582166, 1382467621, 776784248, 2618340202, 3323268794, 2497899128, 2784771155, 503983604, 4076293799, 907881277, 423175695, 432175456, 1378068232, 4145222326, 3954048622, 3938656102, 3820766613, 2793130115, 2977904593, 26017576, 3274890735, 3194772133, 1700274565, 1756076034, 4006520079, 3677328699, 720338349, 1533947780, 354530856, 688349552, 3973924725, 1637815568, 332179504, 3949051286, 53804574, 2852348879, 3044236432, 1282449977, 3583942155, 3416972820, 4006381244, 1617046695, 2628476075, 3002303598, 1686838959, 431878346, 2686675385, 1700445008, 1080580658, 1009431731, 832498133, 3223435511, 2605976345, 2271191193, 2516031870, 1648197032, 4164389018, 2548247927, 300782431, 375919233, 238389289, 3353747414, 2531188641, 2019080857, 1475708069, 455242339, 2609103871, 448939670, 3451063019, 1395535956, 2413381860, 1841049896, 1491858159, 885456874, 4264095073, 4001119347, 1565136089, 3898914787, 1108368660, 540939232, 1173283510, 2745871338, 3681308437, 4207628240, 3343053890, 4016749493, 1699691293, 1103962373, 3625875870, 2256883143, 3830138730, 1031889488, 3479347698, 1535977030, 4236805024, 3251091107, 2132092099, 1774941330, 1199868427, 1452454533, 157007616, 2904115357, 342012276, 595725824, 1480756522, 206960106, 497939518, 591360097, 863170706, 2375253569, 3596610801, 1814182875, 2094937945, 3421402208, 1082520231, 3463918190, 2785509508, 435703966, 3908032597, 1641649973, 2842273706, 3305899714, 1510255612, 2148256476, 2655287854, 3276092548, 4258621189, 236887753, 3681803219, 274041037, 1734335097, 3815195456, 3317970021, 1899903192, 1026095262, 4050517792, 356393447, 2410691914, 3873677099, 3682840055], [3913112168, 2491498743, 4132185628, 2489919796, 1091903735, 1979897079, 3170134830, 3567386728, 3557303409, 857797738, 1136121015, 1342202287, 507115054, 2535736646, 337727348, 3213592640, 1301675037, 2528481711, 1895095763, 1721773893, 3216771564, 62756741, 2142006736, 835421444, 2531993523, 1442658625, 3659876326, 2882144922, 676362277, 1392781812, 170690266, 3921047035, 1759253602, 3611846912, 1745797284, 664899054, 1329594018, 3901205900, 3045908486, 2062866102, 2865634940, 3543621612, 3464012697, 1080764994, 553557557, 3656615353, 3996768171, 991055499, 499776247, 1265440854, 648242737, 3940784050, 980351604, 3713745714, 1749149687, 3396870395, 4211799374, 3640570775, 1161844396, 3125318951, 1431517754, 545492359, 4268468663, 3499529547, 1437099964, 2702547544, 3433638243, 2581715763, 2787789398, 1060185593, 1593081372, 2418618748, 4260947970, 69676912, 2159744348, 86519011, 2512459080, 3838209314, 1220612927, 3339683548, 133810670, 1090789135, 1078426020, 1569222167, 845107691, 3583754449, 4072456591, 1091646820, 628848692, 1613405280, 3757631651, 526609435, 236106946, 48312990, 2942717905, 3402727701, 1797494240, 859738849, 992217954, 4005476642, 2243076622, 3870952857, 3732016268, 765654824, 3490871365, 2511836413, 1685915746, 3888969200, 1414112111, 2273134842, 3281911079, 4080962846, 172450625, 2569994100, 980381355, 4109958455, 2819808352, 2716589560, 2568741196, 3681446669, 3329971472, 1835478071, 660984891, 3704678404, 4045999559, 3422617507, 3040415634, 1762651403, 1719377915, 3470491036, 2693910283, 3642056355, 3138596744, 1364962596, 2073328063, 1983633131, 926494387, 3423689081, 2150032023, 4096667949, 1749200295, 3328846651, 309677260, 2016342300, 1779581495, 3079819751, 111262694, 1274766160, 443224088, 298511866, 1025883608, 3806446537, 1145181785, 168956806, 3641502830, 3584813610, 1689216846, 3666258015, 3200248200, 1692713982, 2646376535, 4042768518, 1618508792, 1610833997, 3523052358, 4130873264, 2001055236, 3610705100, 2202168115, 4028541809, 2961195399, 1006657119, 2006996926, 3186142756, 1430667929, 3210227297, 1314452623, 4074634658, 4101304120, 2273951170, 1399257539, 3367210612, 3027628629, 1190975929, 2062231137, 2333990788, 2221543033, 2438960610, 1181637006, 548689776, 2362791313, 3372408396, 3104550113, 3145860560, 296247880, 1970579870, 3078560182, 3769228297, 1714227617, 3291629107, 3898220290, 166772364, 1251581989, 493813264, 448347421, 195405023, 2709975567, 677966185, 3703036547, 1463355134, 2715995803, 1338867538, 1343315457, 2802222074, 2684532164, 233230375, 2599980071, 2000651841, 3277868038, 1638401717, 4028070440, 3237316320, 6314154, 819756386, 300326615, 590932579, 1405279636, 3267499572, 3150704214, 2428286686, 3959192993, 3461946742, 1862657033, 1266418056, 963775037, 2089974820, 2263052895, 1917689273, 448879540, 3550394620, 3981727096, 150775221, 3627908307, 1303187396, 508620638, 2975983352, 2726630617, 1817252668, 1876281319, 1457606340, 908771278, 3720792119, 3617206836, 2455994898, 1729034894, 1080033504], [976866871, 3556439503, 2881648439, 1522871579, 1555064734, 1336096578, 3548522304, 2579274686, 3574697629, 3205460757, 3593280638, 3338716283, 3079412587, 564236357, 2993598910, 1781952180, 1464380207, 3163844217, 3332601554, 1699332808, 1393555694, 1183702653, 3581086237, 1288719814, 691649499, 2847557200, 2895455976, 3193889540, 2717570544, 1781354906, 1676643554, 2592534050, 3230253752, 1126444790, 2770207658, 2633158820, 2210423226, 2615765581, 2414155088, 3127139286, 673620729, 2805611233, 1269405062, 4015350505, 3341807571, 4149409754, 1057255273, 2012875353, 2162469141, 2276492801, 2601117357, 993977747, 3918593370, 2654263191, 753973209, 36408145, 2530585658, 25011837, 3520020182, 2088578344, 530523599, 2918365339, 1524020338, 1518925132, 3760827505, 3759777254, 1202760957, 3985898139, 3906192525, 674977740, 4174734889, 2031300136, 2019492241, 3983892565, 4153806404, 3822280332, 352677332, 2297720250, 60907813, 90501309, 3286998549, 1016092578, 2535922412, 2839152426, 457141659, 509813237, 4120667899, 652014361, 1966332200, 2975202805, 55981186, 2327461051, 676427537, 3255491064, 2882294119, 3433927263, 1307055953, 942726286, 933058658, 2468411793, 3933900994, 4215176142, 1361170020, 2001714738, 2830558078, 3274259782, 1222529897, 1679025792, 2729314320, 3714953764, 1770335741, 151462246, 3013232138, 1682292957, 1483529935, 471910574, 1539241949, 458788160, 3436315007, 1807016891, 3718408830, 978976581, 1043663428, 3165965781, 1927990952, 4200891579, 2372276910, 3208408903, 3533431907, 1412390302, 2931980059, 4132332400, 1947078029, 3881505623, 4168226417, 2941484381, 1077988104, 1320477388, 886195818, 18198404, 3786409e3, 2509781533, 112762804, 3463356488, 1866414978, 891333506, 18488651, 661792760, 1628790961, 3885187036, 3141171499, 876946877, 2693282273, 1372485963, 791857591, 2686433993, 3759982718, 3167212022, 3472953795, 2716379847, 445679433, 3561995674, 3504004811, 3574258232, 54117162, 3331405415, 2381918588, 3769707343, 4154350007, 1140177722, 4074052095, 668550556, 3214352940, 367459370, 261225585, 2610173221, 4209349473, 3468074219, 3265815641, 314222801, 3066103646, 3808782860, 282218597, 3406013506, 3773591054, 379116347, 1285071038, 846784868, 2669647154, 3771962079, 3550491691, 2305946142, 453669953, 1268987020, 3317592352, 3279303384, 3744833421, 2610507566, 3859509063, 266596637, 3847019092, 517658769, 3462560207, 3443424879, 370717030, 4247526661, 2224018117, 4143653529, 4112773975, 2788324899, 2477274417, 1456262402, 2901442914, 1517677493, 1846949527, 2295493580, 3734397586, 2176403920, 1280348187, 1908823572, 3871786941, 846861322, 1172426758, 3287448474, 3383383037, 1655181056, 3139813346, 901632758, 1897031941, 2986607138, 3066810236, 3447102507, 1393639104, 373351379, 950779232, 625454576, 3124240540, 4148612726, 2007998917, 544563296, 2244738638, 2330496472, 2058025392, 1291430526, 424198748, 50039436, 29584100, 3605783033, 2429876329, 2791104160, 1057563949, 3255363231, 3075367218, 3463963227, 1469046755, 985887462]], gy.prototype.PARRAY = [608135816, 2242054355, 320440878, 57701188, 2752067618, 698298832, 137296536, 3964562569, 1160258022, 953160567, 3193202383, 887688300, 3232508343, 3380367581, 1065670069, 3041331479, 2450970073, 2306472731], gy.prototype.NN = 16, gy.prototype._clean = function(e2) {
      if (e2 < 0) {
        e2 = (2147483647 & e2) + 2147483648;
      }
      return e2;
    }, gy.prototype._F = function(e2) {
      let t2;
      const r3 = 255 & e2, n3 = 255 & (e2 >>>= 8), i3 = 255 & (e2 >>>= 8), s3 = 255 & (e2 >>>= 8);
      return t2 = this.sboxes[0][s3] + this.sboxes[1][i3], t2 ^= this.sboxes[2][n3], t2 += this.sboxes[3][r3], t2;
    }, gy.prototype._encryptBlock = function(e2) {
      let t2, r3 = e2[0], n3 = e2[1];
      for (t2 = 0; t2 < this.NN; ++t2) {
        r3 ^= this.parray[t2], n3 = this._F(r3) ^ n3;
        const e3 = r3;
        r3 = n3, n3 = e3;
      }
      r3 ^= this.parray[this.NN + 0], n3 ^= this.parray[this.NN + 1], e2[0] = this._clean(n3), e2[1] = this._clean(r3);
    }, gy.prototype.encryptBlock = function(e2) {
      let t2;
      const r3 = [0, 0], n3 = this.BLOCKSIZE / 2;
      for (t2 = 0; t2 < this.BLOCKSIZE / 2; ++t2) r3[0] = r3[0] << 8 | 255 & e2[t2 + 0], r3[1] = r3[1] << 8 | 255 & e2[t2 + n3];
      this._encryptBlock(r3);
      const i3 = [];
      for (t2 = 0; t2 < this.BLOCKSIZE / 2; ++t2) i3[t2 + 0] = r3[0] >>> 24 - 8 * t2 & 255, i3[t2 + n3] = r3[1] >>> 24 - 8 * t2 & 255;
      return i3;
    }, gy.prototype._decryptBlock = function(e2) {
      let t2, r3 = e2[0], n3 = e2[1];
      for (t2 = this.NN + 1; t2 > 1; --t2) {
        r3 ^= this.parray[t2], n3 = this._F(r3) ^ n3;
        const e3 = r3;
        r3 = n3, n3 = e3;
      }
      r3 ^= this.parray[1], n3 ^= this.parray[0], e2[0] = this._clean(n3), e2[1] = this._clean(r3);
    }, gy.prototype.init = function(e2) {
      let t2, r3 = 0;
      for (this.parray = [], t2 = 0; t2 < this.NN + 2; ++t2) {
        let n4 = 0;
        for (let t3 = 0; t3 < 4; ++t3) n4 = n4 << 8 | 255 & e2[r3], ++r3 >= e2.length && (r3 = 0);
        this.parray[t2] = this.PARRAY[t2] ^ n4;
      }
      for (this.sboxes = [], t2 = 0; t2 < 4; ++t2) for (this.sboxes[t2] = [], r3 = 0; r3 < 256; ++r3) this.sboxes[t2][r3] = this.SBOXES[t2][r3];
      const n3 = [0, 0];
      for (t2 = 0; t2 < this.NN + 2; t2 += 2) this._encryptBlock(n3), this.parray[t2 + 0] = n3[0], this.parray[t2 + 1] = n3[1];
      for (t2 = 0; t2 < 4; ++t2) for (r3 = 0; r3 < 256; r3 += 2) this._encryptBlock(n3), this.sboxes[t2][r3 + 0] = n3[0], this.sboxes[t2][r3 + 1] = n3[1];
    }, py.keySize = py.prototype.keySize = 16, py.blockSize = py.prototype.blockSize = 8;
    dy = new Map(Object.entries({ tripledes: sy, cast5: oy, twofish: yy, blowfish: py }));
    Ay = /* @__PURE__ */ Object.freeze({ __proto__: null, legacyCiphers: dy });
    ky = new Uint32Array([4089235720, 1779033703, 2227873595, 3144134277, 4271175723, 1013904242, 1595750129, 2773480762, 2917565137, 1359893119, 725511199, 2600822924, 4215389547, 528734635, 327033209, 1541459225]);
    Ey = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3, 11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4, 7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8, 9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13, 2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9, 12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11, 13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10, 6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5, 10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3].map((e2) => 2 * e2));
    Iy = class {
      constructor(e2, t2, r3, n3) {
        const i3 = new Uint8Array(64);
        this.S = { b: new Uint8Array(Ky), h: new Uint32Array(Sy / 4), t0: new Uint32Array(2), c: 0, outlen: e2 }, i3[0] = e2, t2 && (i3[1] = t2.length), i3[2] = 1, i3[3] = 1, r3 && i3.set(r3, 32), n3 && i3.set(n3, 48);
        const s3 = new Uint32Array(i3.buffer, i3.byteOffset, i3.length / Uint32Array.BYTES_PER_ELEMENT);
        for (let e3 = 0; e3 < 16; e3++) this.S.h[e3] = ky[e3] ^ s3[e3];
        if (t2) {
          const e3 = new Uint8Array(Ky);
          e3.set(t2), this.update(e3);
        }
      }
      update(e2) {
        if (!(e2 instanceof Uint8Array)) throw Error("Input must be Uint8Array or Buffer");
        let t2 = 0;
        for (; t2 < e2.length; ) {
          this.S.c === Ky && (my(this.S.t0, this.S.c), vy(this.S, false), this.S.c = 0);
          let r3 = Ky - this.S.c;
          this.S.b.set(e2.subarray(t2, t2 + r3), this.S.c);
          const n3 = Math.min(r3, e2.length - t2);
          this.S.c += n3, t2 += n3;
        }
        return this;
      }
      digest(e2) {
        my(this.S.t0, this.S.c), this.S.b.fill(0, this.S.c), this.S.c = Ky, vy(this.S, true);
        const t2 = e2 || new Uint8Array(this.S.outlen);
        for (let e3 = 0; e3 < this.S.outlen; e3++) t2[e3] = this.S.h[e3 >> 2] >> 8 * (3 & e3);
        return this.S.h = null, t2.buffer;
      }
    };
    Sy = 64;
    Ky = 128;
    Cy = 1024;
    Dy = 205 === new Uint8Array(new Uint16Array([43981]).buffer)[0];
    _y = /* @__PURE__ */ Object.freeze({ __proto__: null, default: async () => Ny((e2) => Oy(0, 0, "AGFzbQEAAAABKwdgBH9/f38AYAABf2AAAGADf39/AGAJf39/f39/f39/AX9gAX8AYAF/AX8CEwEDZW52Bm1lbW9yeQIBkAiAgAQDCgkCAwAABAEFBgEEBQFwAQICBgkBfwFBkIjAAgsHfQoDeG9yAAEBRwACAkcyAAMFZ2V0TFoABBlfX2luZGlyZWN0X2Z1bmN0aW9uX3RhYmxlAQALX2luaXRpYWxpemUAABBfX2Vycm5vX2xvY2F0aW9uAAgJc3RhY2tTYXZlAAUMc3RhY2tSZXN0b3JlAAYKc3RhY2tBbGxvYwAHCQcBAEEBCwEACs0gCQMAAQtYAQJ/A0AgACAEQQR0IgNqIAIgA2r9AAQAIAEgA2r9AAQA/VH9CwQAIAAgA0EQciIDaiACIANq/QAEACABIANq/QAEAP1R/QsEACAEQQJqIgRBwABHDQALC7ceAgt7A38DQCADIBFBBHQiD2ogASAPav0ABAAgACAPav0ABAD9USIF/QsEACACIA9qIAX9CwQAIAMgD0EQciIPaiABIA9q/QAEACAAIA9q/QAEAP1RIgX9CwQAIAIgD2ogBf0LBAAgEUECaiIRQcAARw0ACwNAIAMgEEEHdGoiAEEQaiAA/QAEcCAA/QAEMCIFIAD9AAQQIgT9zgEgBSAF/Q0AAQIDCAkKCwABAgMICQoLIAQgBP0NAAECAwgJCgsAAQIDCAkKC/3eAUEB/csB/c4BIgT9USIJQSD9ywEgCUEg/c0B/VAiCSAA/QAEUCIG/c4BIAkgCf0NAAECAwgJCgsAAQIDCAkKCyAGIAb9DQABAgMICQoLAAECAwgJCgv93gFBAf3LAf3OASIGIAX9USIFQSj9ywEgBUEY/c0B/VAiCCAE/c4BIAggCP0NAAECAwgJCgsAAQIDCAkKCyAEIAT9DQABAgMICQoLAAECAwgJCgv93gFBAf3LAf3OASIKIAogCf1RIgVBMP3LASAFQRD9zQH9UCIFIAb9zgEgBSAF/Q0AAQIDCAkKCwABAgMICQoLIAYgBv0NAAECAwgJCgsAAQIDCAkKC/3eAUEB/csB/c4BIgkgCP1RIgRBAf3LASAEQT/9zQH9UCIMIAD9AARgIAD9AAQgIgQgAP0ABAAiBv3OASAEIAT9DQABAgMICQoLAAECAwgJCgsgBiAG/Q0AAQIDCAkKCwABAgMICQoL/d4BQQH9ywH9zgEiBv1RIghBIP3LASAIQSD9zQH9UCIIIABBQGsiAf0ABAAiB/3OASAIIAj9DQABAgMICQoLAAECAwgJCgsgByAH/Q0AAQIDCAkKCwABAgMICQoL/d4BQQH9ywH9zgEiByAE/VEiBEEo/csBIARBGP3NAf1QIgsgBv3OASALIAv9DQABAgMICQoLAAECAwgJCgsgBiAG/Q0AAQIDCAkKCwABAgMICQoL/d4BQQH9ywH9zgEiBiAI/VEiBEEw/csBIARBEP3NAf1QIgQgB/3OASAEIAT9DQABAgMICQoLAAECAwgJCgsgByAH/Q0AAQIDCAkKCwABAgMICQoL/d4BQQH9ywH9zgEiCCAL/VEiB0EB/csBIAdBP/3NAf1QIg0gDf0NAAECAwQFBgcQERITFBUWF/0NCAkKCwwNDg8YGRobHB0eHyIH/c4BIAcgB/0NAAECAwgJCgsAAQIDCAkKCyAKIAr9DQABAgMICQoLAAECAwgJCgv93gFBAf3LAf3OASIKIAQgBSAF/Q0AAQIDBAUGBxAREhMUFRYX/Q0ICQoLDA0ODxgZGhscHR4f/VEiC0Eg/csBIAtBIP3NAf1QIgsgCP3OASALIAv9DQABAgMICQoLAAECAwgJCgsgCCAI/Q0AAQIDCAkKCwABAgMICQoL/d4BQQH9ywH9zgEiCCAH/VEiB0Eo/csBIAdBGP3NAf1QIgcgCv3OASAHIAf9DQABAgMICQoLAAECAwgJCgsgCiAK/Q0AAQIDCAkKCwABAgMICQoL/d4BQQH9ywH9zgEiDv0LBAAgACAGIA0gDCAM/Q0AAQIDBAUGBxAREhMUFRYX/Q0ICQoLDA0ODxgZGhscHR4fIgr9zgEgCiAK/Q0AAQIDCAkKCwABAgMICQoLIAYgBv0NAAECAwgJCgsAAQIDCAkKC/3eAUEB/csB/c4BIgYgBSAEIAT9DQABAgMEBQYHEBESExQVFhf9DQgJCgsMDQ4PGBkaGxwdHh/9USIFQSD9ywEgBUEg/c0B/VAiBSAJ/c4BIAUgBf0NAAECAwgJCgsAAQIDCAkKCyAJIAn9DQABAgMICQoLAAECAwgJCgv93gFBAf3LAf3OASIJIAr9USIEQSj9ywEgBEEY/c0B/VAiCiAG/c4BIAogCv0NAAECAwgJCgsAAQIDCAkKCyAGIAb9DQABAgMICQoLAAECAwgJCgv93gFBAf3LAf3OASIE/QsEACAAIAQgBf1RIgVBMP3LASAFQRD9zQH9UCIFIA4gC/1RIgRBMP3LASAEQRD9zQH9UCIEIAT9DQABAgMEBQYHEBESExQVFhf9DQgJCgsMDQ4PGBkaGxwdHh/9CwRgIAAgBCAFIAX9DQABAgMEBQYHEBESExQVFhf9DQgJCgsMDQ4PGBkaGxwdHh/9CwRwIAEgBCAI/c4BIAQgBP0NAAECAwgJCgsAAQIDCAkKCyAIIAj9DQABAgMICQoLAAECAwgJCgv93gFBAf3LAf3OASIE/QsEACAAIAUgCf3OASAFIAX9DQABAgMICQoLAAECAwgJCgsgCSAJ/Q0AAQIDCAkKCwABAgMICQoL/d4BQQH9ywH9zgEiCf0LBFAgACAEIAf9USIFQQH9ywEgBUE//c0B/VAiBSAJIAr9USIEQQH9ywEgBEE//c0B/VAiBCAE/Q0AAQIDBAUGBxAREhMUFRYX/Q0ICQoLDA0ODxgZGhscHR4f/QsEICAAIAQgBSAF/Q0AAQIDBAUGBxAREhMUFRYX/Q0ICQoLDA0ODxgZGhscHR4f/QsEMCAQQQFqIhBBCEcNAAtBACEQA0AgAyAQQQR0aiIAQYABaiAA/QAEgAcgAP0ABIADIgUgAP0ABIABIgT9zgEgBSAF/Q0AAQIDCAkKCwABAgMICQoLIAQgBP0NAAECAwgJCgsAAQIDCAkKC/3eAUEB/csB/c4BIgT9USIJQSD9ywEgCUEg/c0B/VAiCSAA/QAEgAUiBv3OASAJIAn9DQABAgMICQoLAAECAwgJCgsgBiAG/Q0AAQIDCAkKCwABAgMICQoL/d4BQQH9ywH9zgEiBiAF/VEiBUEo/csBIAVBGP3NAf1QIgggBP3OASAIIAj9DQABAgMICQoLAAECAwgJCgsgBCAE/Q0AAQIDCAkKCwABAgMICQoL/d4BQQH9ywH9zgEiCiAKIAn9USIFQTD9ywEgBUEQ/c0B/VAiBSAG/c4BIAUgBf0NAAECAwgJCgsAAQIDCAkKCyAGIAb9DQABAgMICQoLAAECAwgJCgv93gFBAf3LAf3OASIJIAj9USIEQQH9ywEgBEE//c0B/VAiDCAA/QAEgAYgAP0ABIACIgQgAP0ABAAiBv3OASAEIAT9DQABAgMICQoLAAECAwgJCgsgBiAG/Q0AAQIDCAkKCwABAgMICQoL/d4BQQH9ywH9zgEiBv1RIghBIP3LASAIQSD9zQH9UCIIIAD9AASABCIH/c4BIAggCP0NAAECAwgJCgsAAQIDCAkKCyAHIAf9DQABAgMICQoLAAECAwgJCgv93gFBAf3LAf3OASIHIAT9USIEQSj9ywEgBEEY/c0B/VAiCyAG/c4BIAsgC/0NAAECAwgJCgsAAQIDCAkKCyAGIAb9DQABAgMICQoLAAECAwgJCgv93gFBAf3LAf3OASIGIAj9USIEQTD9ywEgBEEQ/c0B/VAiBCAH/c4BIAQgBP0NAAECAwgJCgsAAQIDCAkKCyAHIAf9DQABAgMICQoLAAECAwgJCgv93gFBAf3LAf3OASIIIAv9USIHQQH9ywEgB0E//c0B/VAiDSAN/Q0AAQIDBAUGBxAREhMUFRYX/Q0ICQoLDA0ODxgZGhscHR4fIgf9zgEgByAH/Q0AAQIDCAkKCwABAgMICQoLIAogCv0NAAECAwgJCgsAAQIDCAkKC/3eAUEB/csB/c4BIgogBCAFIAX9DQABAgMEBQYHEBESExQVFhf9DQgJCgsMDQ4PGBkaGxwdHh/9USILQSD9ywEgC0Eg/c0B/VAiCyAI/c4BIAsgC/0NAAECAwgJCgsAAQIDCAkKCyAIIAj9DQABAgMICQoLAAECAwgJCgv93gFBAf3LAf3OASIIIAf9USIHQSj9ywEgB0EY/c0B/VAiByAK/c4BIAcgB/0NAAECAwgJCgsAAQIDCAkKCyAKIAr9DQABAgMICQoLAAECAwgJCgv93gFBAf3LAf3OASIO/QsEACAAIAYgDSAMIAz9DQABAgMEBQYHEBESExQVFhf9DQgJCgsMDQ4PGBkaGxwdHh8iCv3OASAKIAr9DQABAgMICQoLAAECAwgJCgsgBiAG/Q0AAQIDCAkKCwABAgMICQoL/d4BQQH9ywH9zgEiBiAFIAQgBP0NAAECAwQFBgcQERITFBUWF/0NCAkKCwwNDg8YGRobHB0eH/1RIgVBIP3LASAFQSD9zQH9UCIFIAn9zgEgBSAF/Q0AAQIDCAkKCwABAgMICQoLIAkgCf0NAAECAwgJCgsAAQIDCAkKC/3eAUEB/csB/c4BIgkgCv1RIgRBKP3LASAEQRj9zQH9UCIKIAb9zgEgCiAK/Q0AAQIDCAkKCwABAgMICQoLIAYgBv0NAAECAwgJCgsAAQIDCAkKC/3eAUEB/csB/c4BIgT9CwQAIAAgBCAF/VEiBUEw/csBIAVBEP3NAf1QIgUgDiAL/VEiBEEw/csBIARBEP3NAf1QIgQgBP0NAAECAwQFBgcQERITFBUWF/0NCAkKCwwNDg8YGRobHB0eH/0LBIAGIAAgBCAFIAX9DQABAgMEBQYHEBESExQVFhf9DQgJCgsMDQ4PGBkaGxwdHh/9CwSAByAAIAQgCP3OASAEIAT9DQABAgMICQoLAAECAwgJCgsgCCAI/Q0AAQIDCAkKCwABAgMICQoL/d4BQQH9ywH9zgEiBP0LBIAEIAAgBSAJ/c4BIAUgBf0NAAECAwgJCgsAAQIDCAkKCyAJIAn9DQABAgMICQoLAAECAwgJCgv93gFBAf3LAf3OASIJ/QsEgAUgACAEIAf9USIFQQH9ywEgBUE//c0B/VAiBSAJIAr9USIEQQH9ywEgBEE//c0B/VAiBCAE/Q0AAQIDBAUGBxAREhMUFRYX/Q0ICQoLDA0ODxgZGhscHR4f/QsEgAIgACAEIAUgBf0NAAECAwQFBgcQERITFBUWF/0NCAkKCwwNDg8YGRobHB0eH/0LBIADIBBBAWoiEEEIRw0AC0EAIRADQCACIBBBBHQiAGoiASAAIANq/QAEACAB/QAEAP1R/QsEACACIABBEHIiAWoiDyABIANq/QAEACAP/QAEAP1R/QsEACACIABBIHIiAWoiDyABIANq/QAEACAP/QAEAP1R/QsEACACIABBMHIiAGoiASAAIANq/QAEACAB/QAEAP1R/QsEACAQQQRqIhBBwABHDQALCxYAIAAgASACIAMQAiAAIAIgAiADEAILewIBfwF+IAIhCSABNQIAIQogBCAFcgRAIAEoAgQgA3AhCQsgACAJNgIAIAAgB0EBayAFIAQbIAhsIAZBAWtBAEF/IAYbIAIgCUYbaiIBIAVBAWogCGxBACAEG2ogAa0gCiAKfkIgiH5CIIinQX9zaiAHIAhscDYCBCAACwQAIwALBgAgACQACxAAIwAgAGtBcHEiACQAIAALBQBBgAgL", e2), (e2) => Oy(0, 0, "AGFzbQEAAAABPwhgBH9/f38AYAABf2AAAGADf39/AGARf39/f39/f39/f39/f39/f38AYAl/f39/f39/f38Bf2ABfwBgAX8BfwITAQNlbnYGbWVtb3J5AgGQCICABAMLCgIDBAAABQEGBwEEBQFwAQICBgkBfwFBkIjAAgsHfQoDeG9yAAEBRwADAkcyAAQFZ2V0TFoABRlfX2luZGlyZWN0X2Z1bmN0aW9uX3RhYmxlAQALX2luaXRpYWxpemUAABBfX2Vycm5vX2xvY2F0aW9uAAkJc3RhY2tTYXZlAAYMc3RhY2tSZXN0b3JlAAcKc3RhY2tBbGxvYwAICQcBAEEBCwEACssaCgMAAQtQAQJ/A0AgACAEQQN0IgNqIAIgA2opAwAgASADaikDAIU3AwAgACADQQhyIgNqIAIgA2opAwAgASADaikDAIU3AwAgBEECaiIEQYABRw0ACwveDwICfgF/IAAgAUEDdGoiEyATKQMAIhEgACAFQQN0aiIBKQMAIhJ8IBFCAYZC/v///x+DIBJC/////w+DfnwiETcDACAAIA1BA3RqIgUgESAFKQMAhUIgiSIRNwMAIAAgCUEDdGoiCSARIAkpAwAiEnwgEUL/////D4MgEkIBhkL+////H4N+fCIRNwMAIAEgESABKQMAhUIoiSIRNwMAIBMgESATKQMAIhJ8IBFC/////w+DIBJCAYZC/v///x+DfnwiETcDACAFIBEgBSkDAIVCMIkiETcDACAJIBEgCSkDACISfCARQv////8PgyASQgGGQv7///8fg358IhE3AwAgASARIAEpAwCFQgGJNwMAIAAgAkEDdGoiDSANKQMAIhEgACAGQQN0aiICKQMAIhJ8IBFCAYZC/v///x+DIBJC/////w+DfnwiETcDACAAIA5BA3RqIgYgESAGKQMAhUIgiSIRNwMAIAAgCkEDdGoiCiARIAopAwAiEnwgEUL/////D4MgEkIBhkL+////H4N+fCIRNwMAIAIgESACKQMAhUIoiSIRNwMAIA0gESANKQMAIhJ8IBFC/////w+DIBJCAYZC/v///x+DfnwiETcDACAGIBEgBikDAIVCMIkiETcDACAKIBEgCikDACISfCARQv////8PgyASQgGGQv7///8fg358IhE3AwAgAiARIAIpAwCFQgGJNwMAIAAgA0EDdGoiDiAOKQMAIhEgACAHQQN0aiIDKQMAIhJ8IBFCAYZC/v///x+DIBJC/////w+DfnwiETcDACAAIA9BA3RqIgcgESAHKQMAhUIgiSIRNwMAIAAgC0EDdGoiCyARIAspAwAiEnwgEUL/////D4MgEkIBhkL+////H4N+fCIRNwMAIAMgESADKQMAhUIoiSIRNwMAIA4gESAOKQMAIhJ8IBFC/////w+DIBJCAYZC/v///x+DfnwiETcDACAHIBEgBykDAIVCMIkiETcDACALIBEgCykDACISfCARQv////8PgyASQgGGQv7///8fg358IhE3AwAgAyARIAMpAwCFQgGJNwMAIAAgBEEDdGoiDyAPKQMAIhEgACAIQQN0aiIEKQMAIhJ8IBFCAYZC/v///x+DIBJC/////w+DfnwiETcDACAAIBBBA3RqIgggESAIKQMAhUIgiSIRNwMAIAAgDEEDdGoiACARIAApAwAiEnwgEUL/////D4MgEkIBhkL+////H4N+fCIRNwMAIAQgESAEKQMAhUIoiSIRNwMAIA8gESAPKQMAIhJ8IBFC/////w+DIBJCAYZC/v///x+DfnwiETcDACAIIBEgCCkDAIVCMIkiETcDACAAIBEgACkDACISfCARQv////8PgyASQgGGQv7///8fg358IhE3AwAgBCARIAQpAwCFQgGJNwMAIBMgEykDACIRIAIpAwAiEnwgEUIBhkL+////H4MgEkL/////D4N+fCIRNwMAIAggESAIKQMAhUIgiSIRNwMAIAsgESALKQMAIhJ8IBFC/////w+DIBJCAYZC/v///x+DfnwiETcDACACIBEgAikDAIVCKIkiETcDACATIBEgEykDACISfCARQv////8PgyASQgGGQv7///8fg358IhE3AwAgCCARIAgpAwCFQjCJIhE3AwAgCyARIAspAwAiEnwgEUL/////D4MgEkIBhkL+////H4N+fCIRNwMAIAIgESACKQMAhUIBiTcDACANIA0pAwAiESADKQMAIhJ8IBFCAYZC/v///x+DIBJC/////w+DfnwiETcDACAFIBEgBSkDAIVCIIkiETcDACAAIBEgACkDACISfCARQv////8PgyASQgGGQv7///8fg358IhE3AwAgAyARIAMpAwCFQiiJIhE3AwAgDSARIA0pAwAiEnwgEUL/////D4MgEkIBhkL+////H4N+fCIRNwMAIAUgESAFKQMAhUIwiSIRNwMAIAAgESAAKQMAIhJ8IBFC/////w+DIBJCAYZC/v///x+DfnwiETcDACADIBEgAykDAIVCAYk3AwAgDiAOKQMAIhEgBCkDACISfCARQgGGQv7///8fgyASQv////8Pg358IhE3AwAgBiARIAYpAwCFQiCJIhE3AwAgCSARIAkpAwAiEnwgEUL/////D4MgEkIBhkL+////H4N+fCIRNwMAIAQgESAEKQMAhUIoiSIRNwMAIA4gESAOKQMAIhJ8IBFC/////w+DIBJCAYZC/v///x+DfnwiETcDACAGIBEgBikDAIVCMIkiETcDACAJIBEgCSkDACISfCARQv////8PgyASQgGGQv7///8fg358IhE3AwAgBCARIAQpAwCFQgGJNwMAIA8gDykDACIRIAEpAwAiEnwgEUIBhkL+////H4MgEkL/////D4N+fCIRNwMAIAcgESAHKQMAhUIgiSIRNwMAIAogESAKKQMAIhJ8IBFC/////w+DIBJCAYZC/v///x+DfnwiETcDACABIBEgASkDAIVCKIkiETcDACAPIBEgDykDACISfCARQv////8PgyASQgGGQv7///8fg358IhE3AwAgByARIAcpAwCFQjCJIhE3AwAgCiARIAopAwAiEnwgEUL/////D4MgEkIBhkL+////H4N+fCIRNwMAIAEgESABKQMAhUIBiTcDAAvdCAEPfwNAIAIgBUEDdCIGaiABIAZqKQMAIAAgBmopAwCFNwMAIAIgBkEIciIGaiABIAZqKQMAIAAgBmopAwCFNwMAIAVBAmoiBUGAAUcNAAsDQCADIARBA3QiAGogACACaikDADcDACADIARBAXIiAEEDdCIBaiABIAJqKQMANwMAIAMgBEECciIBQQN0IgVqIAIgBWopAwA3AwAgAyAEQQNyIgVBA3QiBmogAiAGaikDADcDACADIARBBHIiBkEDdCIHaiACIAdqKQMANwMAIAMgBEEFciIHQQN0IghqIAIgCGopAwA3AwAgAyAEQQZyIghBA3QiCWogAiAJaikDADcDACADIARBB3IiCUEDdCIKaiACIApqKQMANwMAIAMgBEEIciIKQQN0IgtqIAIgC2opAwA3AwAgAyAEQQlyIgtBA3QiDGogAiAMaikDADcDACADIARBCnIiDEEDdCINaiACIA1qKQMANwMAIAMgBEELciINQQN0Ig5qIAIgDmopAwA3AwAgAyAEQQxyIg5BA3QiD2ogAiAPaikDADcDACADIARBDXIiD0EDdCIQaiACIBBqKQMANwMAIAMgBEEOciIQQQN0IhFqIAIgEWopAwA3AwAgAyAEQQ9yIhFBA3QiEmogAiASaikDADcDACADIARB//8DcSAAQf//A3EgAUH//wNxIAVB//8DcSAGQf//A3EgB0H//wNxIAhB//8DcSAJQf//A3EgCkH//wNxIAtB//8DcSAMQf//A3EgDUH//wNxIA5B//8DcSAPQf//A3EgEEH//wNxIBFB//8DcRACIARB8ABJIQAgBEEQaiEEIAANAAtBACEBIANBAEEBQRBBEUEgQSFBMEExQcAAQcEAQdAAQdEAQeAAQeEAQfAAQfEAEAIgA0ECQQNBEkETQSJBI0EyQTNBwgBBwwBB0gBB0wBB4gBB4wBB8gBB8wAQAiADQQRBBUEUQRVBJEElQTRBNUHEAEHFAEHUAEHVAEHkAEHlAEH0AEH1ABACIANBBkEHQRZBF0EmQSdBNkE3QcYAQccAQdYAQdcAQeYAQecAQfYAQfcAEAIgA0EIQQlBGEEZQShBKUE4QTlByABByQBB2ABB2QBB6ABB6QBB+ABB+QAQAiADQQpBC0EaQRtBKkErQTpBO0HKAEHLAEHaAEHbAEHqAEHrAEH6AEH7ABACIANBDEENQRxBHUEsQS1BPEE9QcwAQc0AQdwAQd0AQewAQe0AQfwAQf0AEAIgA0EOQQ9BHkEfQS5BL0E+QT9BzgBBzwBB3gBB3wBB7gBB7wBB/gBB/wAQAgNAIAIgAUEDdCIAaiIEIAAgA2opAwAgBCkDAIU3AwAgAiAAQQhyIgRqIgUgAyAEaikDACAFKQMAhTcDACACIABBEHIiBGoiBSADIARqKQMAIAUpAwCFNwMAIAIgAEEYciIAaiIEIAAgA2opAwAgBCkDAIU3AwAgAUEEaiIBQYABRw0ACwsWACAAIAEgAiADEAMgACACIAIgAxADC3sCAX8BfiACIQkgATUCACEKIAQgBXIEQCABKAIEIANwIQkLIAAgCTYCACAAIAdBAWsgBSAEGyAIbCAGQQFrQQBBfyAGGyACIAlGG2oiASAFQQFqIAhsQQAgBBtqIAGtIAogCn5CIIh+QiCIp0F/c2ogByAIbHA2AgQgAAsEACMACwYAIAAkAAsQACMAIABrQXBxIgAkACAACwUAQYAICw==", e2)) });
    Zy = function() {
      if (qy) return Vy;
      qy = 1;
      const e2 = function() {
        if (zy) return Hy;
        function e3(e4) {
          this.name = "Bzip2Error", this.message = e4, this.stack = Error().stack;
        }
        zy = 1, e3.prototype = Error();
        var t3 = function(t4) {
          throw new e3(t4);
        }, r3 = {};
        return r3.Bzip2Error = e3, r3.crcTable = [0, 79764919, 159529838, 222504665, 319059676, 398814059, 445009330, 507990021, 638119352, 583659535, 797628118, 726387553, 890018660, 835552979, 1015980042, 944750013, 1276238704, 1221641927, 1167319070, 1095957929, 1595256236, 1540665371, 1452775106, 1381403509, 1780037320, 1859660671, 1671105958, 1733955601, 2031960084, 2111593891, 1889500026, 1952343757, 2552477408, 2632100695, 2443283854, 2506133561, 2334638140, 2414271883, 2191915858, 2254759653, 3190512472, 3135915759, 3081330742, 3009969537, 2905550212, 2850959411, 2762807018, 2691435357, 3560074640, 3505614887, 3719321342, 3648080713, 3342211916, 3287746299, 3467911202, 3396681109, 4063920168, 4143685023, 4223187782, 4286162673, 3779000052, 3858754371, 3904687514, 3967668269, 881225847, 809987520, 1023691545, 969234094, 662832811, 591600412, 771767749, 717299826, 311336399, 374308984, 453813921, 533576470, 25881363, 88864420, 134795389, 214552010, 2023205639, 2086057648, 1897238633, 1976864222, 1804852699, 1867694188, 1645340341, 1724971778, 1587496639, 1516133128, 1461550545, 1406951526, 1302016099, 1230646740, 1142491917, 1087903418, 2896545431, 2825181984, 2770861561, 2716262478, 3215044683, 3143675388, 3055782693, 3001194130, 2326604591, 2389456536, 2200899649, 2280525302, 2578013683, 2640855108, 2418763421, 2498394922, 3769900519, 3832873040, 3912640137, 3992402750, 4088425275, 4151408268, 4197601365, 4277358050, 3334271071, 3263032808, 3476998961, 3422541446, 3585640067, 3514407732, 3694837229, 3640369242, 1762451694, 1842216281, 1619975040, 1682949687, 2047383090, 2127137669, 1938468188, 2001449195, 1325665622, 1271206113, 1183200824, 1111960463, 1543535498, 1489069629, 1434599652, 1363369299, 622672798, 568075817, 748617968, 677256519, 907627842, 853037301, 1067152940, 995781531, 51762726, 131386257, 177728840, 240578815, 269590778, 349224269, 429104020, 491947555, 4046411278, 4126034873, 4172115296, 4234965207, 3794477266, 3874110821, 3953728444, 4016571915, 3609705398, 3555108353, 3735388376, 3664026991, 3290680682, 3236090077, 3449943556, 3378572211, 3174993278, 3120533705, 3032266256, 2961025959, 2923101090, 2868635157, 2813903052, 2742672763, 2604032198, 2683796849, 2461293480, 2524268063, 2284983834, 2364738477, 2175806836, 2238787779, 1569362073, 1498123566, 1409854455, 1355396672, 1317987909, 1246755826, 1192025387, 1137557660, 2072149281, 2135122070, 1912620623, 1992383480, 1753615357, 1816598090, 1627664531, 1707420964, 295390185, 358241886, 404320391, 483945776, 43990325, 106832002, 186451547, 266083308, 932423249, 861060070, 1041341759, 986742920, 613929101, 542559546, 756411363, 701822548, 3316196985, 3244833742, 3425377559, 3370778784, 3601682597, 3530312978, 3744426955, 3689838204, 3819031489, 3881883254, 3928223919, 4007849240, 4037393693, 4100235434, 4180117107, 4259748804, 2310601993, 2373574846, 2151335527, 2231098320, 2596047829, 2659030626, 2470359227, 2550115596, 2947551409, 2876312838, 2788305887, 2733848168, 3165939309, 3094707162, 3040238851, 2985771188], r3.array = function(e4) {
          var t4 = 0, r4 = 0, n3 = [0, 1, 3, 7, 15, 31, 63, 127, 255];
          return function(i3) {
            for (var s3 = 0; i3 > 0; ) {
              var a3 = 8 - t4;
              i3 >= a3 ? (s3 <<= a3, s3 |= n3[a3] & e4[r4++], t4 = 0, i3 -= a3) : (s3 <<= i3, s3 |= (e4[r4] & n3[i3] << 8 - i3 - t4) >> 8 - i3 - t4, t4 += i3, i3 = 0);
            }
            return s3;
          };
        }, r3.simple = function(e4, t4) {
          var n3 = r3.array(e4), i3 = false, s3 = 1e5 * r3.header(n3), a3 = new Int32Array(s3);
          do {
            i3 = r3.decompress(n3, t4, a3, s3);
          } while (!i3);
        }, r3.header = function(e4) {
          this.byteCount = new Int32Array(256), this.symToByte = new Uint8Array(256), this.mtfSymbol = new Int32Array(256), this.selectors = new Uint8Array(32768), 4348520 != e4(24) && t3("No magic number found");
          var r4 = e4(8) - 48;
          return (r4 < 1 || r4 > 9) && t3("Not a BZIP archive"), r4;
        }, r3.decompress = function(e4, r4, n3, i3, s3) {
          for (var a3 = -1, o3 = "", c3 = 0; c3 < 6; c3++) o3 += e4(8).toString(16);
          if ("177245385090" == o3) return (0 | e4(32)) !== s3 && t3("Error in bzip2: crc32 do not match"), e4(null), null;
          "314159265359" != o3 && t3("Invalid bzip data");
          var u2 = 0 | e4(32);
          e4(1) && t3("unsupported obsolete version");
          var h4 = e4(24);
          h4 > i3 && t3("Initial position larger than buffer size");
          var f2 = e4(16), l2 = 0;
          for (c3 = 0; c3 < 16; c3++) if (f2 & 1 << 15 - c3) {
            var y2 = e4(16);
            for (d3 = 0; d3 < 16; d3++) y2 & 1 << 15 - d3 && (this.symToByte[l2++] = 16 * c3 + d3);
          }
          var g2 = e4(3);
          (g2 < 2 || g2 > 6) && t3("Invalid bzip data");
          var p2 = e4(15);
          for (0 == p2 && t3("Invalid bzip data"), c3 = 0; c3 < g2; c3++) this.mtfSymbol[c3] = c3;
          for (c3 = 0; c3 < p2; c3++) {
            for (var d3 = 0; e4(1); d3++) d3 >= g2 && t3("Invalid bzip data");
            var A2 = this.mtfSymbol[d3];
            for (y2 = d3 - 1; y2 >= 0; y2--) this.mtfSymbol[y2 + 1] = this.mtfSymbol[y2];
            this.mtfSymbol[0] = A2, this.selectors[c3] = A2;
          }
          var w2, m2, b2, k2, E2 = l2 + 2, v2 = [], I2 = new Uint8Array(258), B2 = new Uint16Array(21);
          for (d3 = 0; d3 < g2; d3++) {
            for (f2 = e4(5), c3 = 0; c3 < E2; c3++) {
              for (; (f2 < 1 || f2 > 20) && t3("Invalid bzip data"), e4(1); ) e4(1) ? f2-- : f2++;
              I2[c3] = f2;
            }
            var S2, K2;
            for (S2 = K2 = I2[0], c3 = 1; c3 < E2; c3++) I2[c3] > K2 ? K2 = I2[c3] : I2[c3] < S2 && (S2 = I2[c3]);
            (w2 = v2[d3] = {}).permute = new Int32Array(258), w2.limit = new Int32Array(21), w2.base = new Int32Array(21), w2.minLen = S2, w2.maxLen = K2;
            var C2 = w2.base, D2 = w2.limit, U2 = 0;
            for (c3 = S2; c3 <= K2; c3++) for (f2 = 0; f2 < E2; f2++) I2[f2] == c3 && (w2.permute[U2++] = f2);
            for (c3 = S2; c3 <= K2; c3++) B2[c3] = D2[c3] = 0;
            for (c3 = 0; c3 < E2; c3++) B2[I2[c3]]++;
            for (U2 = f2 = 0, c3 = S2; c3 < K2; c3++) U2 += B2[c3], D2[c3] = U2 - 1, U2 <<= 1, C2[c3 + 1] = U2 - (f2 += B2[c3]);
            D2[K2] = U2 + B2[K2] - 1, C2[S2] = 0;
          }
          for (c3 = 0; c3 < 256; c3++) this.mtfSymbol[c3] = c3, this.byteCount[c3] = 0;
          for (m2 = b2 = E2 = k2 = 0; ; ) {
            for (E2-- || (E2 = 49, k2 >= p2 && t3("Invalid bzip data"), C2 = (w2 = v2[this.selectors[k2++]]).base, D2 = w2.limit), d3 = e4(c3 = w2.minLen); c3 > w2.maxLen && t3("Invalid bzip data"), !(d3 <= D2[c3]); ) c3++, d3 = d3 << 1 | e4(1);
            ((d3 -= C2[c3]) < 0 || d3 >= 258) && t3("Invalid bzip data");
            var P2 = w2.permute[d3];
            if (0 != P2 && 1 != P2) {
              if (m2) for (m2 = 0, b2 + f2 > i3 && t3("Invalid bzip data"), A2 = this.symToByte[this.mtfSymbol[0]], this.byteCount[A2] += f2; f2--; ) n3[b2++] = A2;
              if (P2 > l2) break;
              for (b2 >= i3 && t3("Invalid bzip data"), c3 = P2 - 1, A2 = this.mtfSymbol[c3], y2 = c3 - 1; y2 >= 0; y2--) this.mtfSymbol[y2 + 1] = this.mtfSymbol[y2];
              this.mtfSymbol[0] = A2, A2 = this.symToByte[A2], this.byteCount[A2]++, n3[b2++] = A2;
            } else m2 || (m2 = 1, f2 = 0), f2 += 0 == P2 ? m2 : 2 * m2, m2 <<= 1;
          }
          for ((h4 < 0 || h4 >= b2) && t3("Invalid bzip data"), d3 = 0, c3 = 0; c3 < 256; c3++) y2 = d3 + this.byteCount[c3], this.byteCount[c3] = d3, d3 = y2;
          for (c3 = 0; c3 < b2; c3++) A2 = 255 & n3[c3], n3[this.byteCount[A2]] |= c3 << 8, this.byteCount[A2]++;
          var x2, Q2, M2, R2 = 0, F2 = 0, T2 = 0;
          for (b2 && (F2 = 255 & (R2 = n3[h4]), R2 >>= 8, T2 = -1); b2; ) {
            for (b2--, Q2 = F2, F2 = 255 & (R2 = n3[R2]), R2 >>= 8, 3 == T2++ ? (x2 = F2, M2 = Q2, F2 = -1) : (x2 = 1, M2 = F2); x2--; ) a3 = 4294967295 & (a3 << 8 ^ this.crcTable[255 & (a3 >> 24 ^ M2)]), r4(M2);
            F2 != Q2 && (T2 = 0);
          }
          return (0 | (a3 = ~a3 >>> 0)) != (0 | u2) && t3("Error in bzip2: crc32 do not match"), 4294967295 & (a3 ^ (s3 << 1 | s3 >>> 31));
        }, Hy = r3;
      }(), t2 = function() {
        if (jy) return Gy;
        jy = 1;
        var e3 = [0, 1, 3, 7, 15, 31, 63, 127, 255];
        return Gy = function(t3) {
          var r3 = 0, n3 = 0, i3 = t3(), s3 = function(a3) {
            if (null === a3 && 0 != r3) return r3 = 0, void n3++;
            for (var o3 = 0; a3 > 0; ) {
              n3 >= i3.length && (n3 = 0, i3 = t3());
              var c3 = 8 - r3;
              0 === r3 && a3 > 0 && s3.bytesRead++, a3 >= c3 ? (o3 <<= c3, o3 |= e3[c3] & i3[n3++], r3 = 0, a3 -= c3) : (o3 <<= a3, o3 |= (i3[n3] & e3[a3] << 8 - a3 - r3) >> 8 - a3 - r3, r3 += a3, a3 = 0);
            }
            return o3;
          };
          return s3.bytesRead = 0, s3;
        };
      }();
      return Vy = function(r3) {
        const n3 = [];
        let i3 = 0, s3 = 0, a3 = false, o3 = false, c3 = null, u2 = null;
        let h4, f2 = 0;
        function l2(t3) {
          if (!a3) try {
            return function(t4) {
              if (s3) {
                const r4 = 1e5 * s3, n4 = new Int32Array(r4), i4 = [], a4 = function(e3) {
                  i4.push(e3);
                };
                return u2 = e2.decompress(c3, a4, n4, r4, u2), null === u2 ? (s3 = 0, false) : (t4(new Uint8Array(i4)), true);
              }
              return s3 = e2.header(c3), u2 = 0, false;
            }(function(e3) {
              t3.enqueue(e3), null !== e3 && (f2 += e3.length);
            });
          } catch (e3) {
            return t3.error(e3), a3 = true, true;
          }
        }
        return new ReadableStream({ start() {
          h4 = r3.getReader();
        }, async pull(e3) {
          try {
            for (; ; ) {
              for (; !(o3 || c3 && i3 - c3.bytesRead + 1 >= 25e3 + 1e5 * (s3 || 4)); ) {
                const { value: e4, done: r4 } = await h4.read();
                r4 ? o3 = true : (n3.push(e4), i3 += e4.length, null === c3 && (c3 = t2(function() {
                  return n3.shift();
                })));
              }
              for (; o3 ? c3 && i3 > c3.bytesRead : c3 && i3 - c3.bytesRead + 1 >= 25e3 + 1e5 * (s3 || 4); ) if (l2(e3)) return;
              if (o3 && !a3 && (!c3 || i3 <= c3.bytesRead)) return void (null === u2 ? e3.close() : e3.error(Error("input stream ended prematurely")));
            }
          } catch (t3) {
            e3.error(t3);
          }
        }, async cancel(e3) {
          await h4.abort(e3);
        } }, { highWaterMark: 0 });
      };
    }();
    Jy = /* @__PURE__ */ t({ __proto__: null, default: /* @__PURE__ */ Yy(Zy) }, [Zy]);
  }
});

// src/index.tsx
var index_exports = {};
__export(index_exports, {
  activate: () => activate,
  hooks: () => hooks,
  onComposeSend: () => onComposeSend,
  onRenderEmailBody: () => onRenderEmailBody,
  slots: () => slots
});
module.exports = __toCommonJS(index_exports);
var import_plugin_host = __toESM(require("@plugin-host"), 1);
var import_react = __toESM(require("react"), 1);

// node_modules/js-base64/base64.mjs
var version = "3.8.0";
var VERSION = version;
var _hasBuffer = typeof Buffer === "function";
var _TD = typeof TextDecoder === "function" ? new TextDecoder("utf-8", { ignoreBOM: true }) : void 0;
var _TE = typeof TextEncoder === "function" ? new TextEncoder() : void 0;
var b64ch = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var b64chs = Array.prototype.slice.call(b64ch);
var b64tab = ((a3) => {
  let tab = {};
  a3.forEach((c3, i3) => tab[c3] = i3);
  return tab;
})(b64chs);
var b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
var _fromCC = String.fromCharCode.bind(String);
var _U8Afrom = typeof Uint8Array.from === "function" ? Uint8Array.from.bind(Uint8Array) : (it2) => new Uint8Array(Array.prototype.slice.call(it2, 0));
var _mkUriSafe = (src) => src.replace(/=/g, "").replace(/[+\/]/g, (m0) => m0 == "+" ? "-" : "_");
var _tidyB64 = (s3) => s3.replace(/[^A-Za-z0-9\+\/]/g, "");
var btoaPolyfill = (bin) => {
  let u32, c0, c1, c22, asc = "";
  const pad = bin.length % 3;
  for (let i3 = 0; i3 < bin.length; ) {
    if ((c0 = bin.charCodeAt(i3++)) > 255 || (c1 = bin.charCodeAt(i3++)) > 255 || (c22 = bin.charCodeAt(i3++)) > 255)
      throw new TypeError("invalid character found");
    u32 = c0 << 16 | c1 << 8 | c22;
    asc += b64chs[u32 >> 18 & 63] + b64chs[u32 >> 12 & 63] + b64chs[u32 >> 6 & 63] + b64chs[u32 & 63];
  }
  return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
};
var _btoa = typeof btoa === "function" ? (bin) => btoa(bin) : _hasBuffer ? (bin) => Buffer.from(bin, "binary").toString("base64") : btoaPolyfill;
var _fromUint8Array = _hasBuffer ? (u8a) => Buffer.from(u8a).toString("base64") : (u8a) => {
  const maxargs = 4096;
  let strs = [];
  for (let i3 = 0, l2 = u8a.length; i3 < l2; i3 += maxargs) {
    strs.push(_fromCC.apply(null, u8a.subarray(i3, i3 + maxargs)));
  }
  return _btoa(strs.join(""));
};
var fromUint8Array = (u8a, urlsafe = false) => urlsafe ? _mkUriSafe(_fromUint8Array(u8a)) : _fromUint8Array(u8a);
var cb_utob = (c3) => {
  if (c3.length < 2) {
    var cc2 = c3.charCodeAt(0);
    return cc2 < 128 ? c3 : cc2 < 2048 ? _fromCC(192 | cc2 >>> 6) + _fromCC(128 | cc2 & 63) : _fromCC(224 | cc2 >>> 12 & 15) + _fromCC(128 | cc2 >>> 6 & 63) + _fromCC(128 | cc2 & 63);
  } else {
    var cc2 = 65536 + (c3.charCodeAt(0) - 55296) * 1024 + (c3.charCodeAt(1) - 56320);
    return _fromCC(240 | cc2 >>> 18 & 7) + _fromCC(128 | cc2 >>> 12 & 63) + _fromCC(128 | cc2 >>> 6 & 63) + _fromCC(128 | cc2 & 63);
  }
};
var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
var utob = (u2) => u2.replace(re_utob, cb_utob);
var _encode = _hasBuffer ? (s3) => Buffer.from(s3, "utf8").toString("base64") : _TE ? (s3) => _fromUint8Array(_TE.encode(s3)) : (s3) => _btoa(utob(s3));
var encode = (src, urlsafe = false) => urlsafe ? _mkUriSafe(_encode(src)) : _encode(src);
var encodeURI = (src) => encode(src, true);
var re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
var cb_btou = (cccc) => {
  switch (cccc.length) {
    case 4:
      var cp = (7 & cccc.charCodeAt(0)) << 18 | (63 & cccc.charCodeAt(1)) << 12 | (63 & cccc.charCodeAt(2)) << 6 | 63 & cccc.charCodeAt(3), offset = cp - 65536;
      return _fromCC((offset >>> 10) + 55296) + _fromCC((offset & 1023) + 56320);
    case 3:
      return _fromCC((15 & cccc.charCodeAt(0)) << 12 | (63 & cccc.charCodeAt(1)) << 6 | 63 & cccc.charCodeAt(2));
    default:
      return _fromCC((31 & cccc.charCodeAt(0)) << 6 | 63 & cccc.charCodeAt(1));
  }
};
var btou = (b2) => b2.replace(re_btou, cb_btou);
var atobPolyfill = (asc) => {
  asc = asc.replace(/\s+/g, "");
  if (!b64re.test(asc))
    throw new TypeError("malformed base64.");
  asc += "==".slice(2 - (asc.length & 3));
  let u24, r1, r22;
  let binArray = [];
  for (let i3 = 0; i3 < asc.length; ) {
    u24 = b64tab[asc.charAt(i3++)] << 18 | b64tab[asc.charAt(i3++)] << 12 | (r1 = b64tab[asc.charAt(i3++)]) << 6 | (r22 = b64tab[asc.charAt(i3++)]);
    if (r1 === 64) {
      binArray.push(_fromCC(u24 >> 16 & 255));
    } else if (r22 === 64) {
      binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255));
    } else {
      binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255));
    }
  }
  return binArray.join("");
};
var _atob = typeof atob === "function" ? (asc) => atob(_tidyB64(asc)) : _hasBuffer ? (asc) => Buffer.from(asc, "base64").toString("binary") : atobPolyfill;
var _toUint8Array = _hasBuffer ? (a3) => _U8Afrom(Buffer.from(a3, "base64")) : (a3) => _U8Afrom(_atob(a3).split("").map((c3) => c3.charCodeAt(0)));
var toUint8Array = (a3) => _toUint8Array(_unURI(a3));
var _decode = _hasBuffer ? (a3) => Buffer.from(a3, "base64").toString("utf8") : _TD ? (a3) => _TD.decode(_toUint8Array(a3)) : (a3) => btou(_atob(a3));
var _unURI = (a3) => _tidyB64(a3.replace(/[-_]/g, (m0) => m0 == "-" ? "+" : "/"));
var decode = (src) => _decode(_unURI(src));
var isValid = (src) => {
  if (typeof src !== "string")
    return false;
  const s3 = src.replace(/\s+/g, "").replace(/={0,2}$/, "");
  return !/[^\s0-9a-zA-Z\+/]/.test(s3) || !/[^\s0-9a-zA-Z\-_]/.test(s3);
};
var _noEnum = (v2) => {
  return {
    value: v2,
    enumerable: false,
    writable: true,
    configurable: true
  };
};
var extendString = function() {
  const _add = (name, body) => Object.defineProperty(String.prototype, name, _noEnum(body));
  _add("fromBase64", function() {
    return decode(this);
  });
  _add("toBase64", function(urlsafe) {
    return encode(this, urlsafe);
  });
  _add("toBase64URI", function() {
    return encode(this, true);
  });
  _add("toBase64URL", function() {
    return encode(this, true);
  });
  _add("toUint8Array", function() {
    return toUint8Array(this);
  });
};
var extendUint8Array = function() {
  const _add = (name, body) => Object.defineProperty(Uint8Array.prototype, name, _noEnum(body));
  _add("toBase64", function(urlsafe) {
    return fromUint8Array(this, urlsafe);
  });
  _add("toBase64URI", function() {
    return fromUint8Array(this, true);
  });
  _add("toBase64URL", function() {
    return fromUint8Array(this, true);
  });
};
var extendBuiltins = () => {
  extendString();
  extendUint8Array();
};
var gBase64 = {
  version,
  VERSION,
  atob: _atob,
  atobPolyfill,
  btoa: _btoa,
  btoaPolyfill,
  fromBase64: decode,
  toBase64: encode,
  encode,
  encodeURI,
  encodeURL: encodeURI,
  utob,
  btou,
  decode,
  isValid,
  fromUint8Array,
  toUint8Array,
  extendString,
  extendUint8Array,
  extendBuiltins
};

// node_modules/@babel/runtime-corejs3/helpers/esm/defineProperty.js
var import_define_property = __toESM(require_define_property5(), 1);

// node_modules/@babel/runtime-corejs3/helpers/esm/typeof.js
var import_symbol = __toESM(require_symbol5(), 1);
var import_iterator = __toESM(require_iterator5(), 1);
function _typeof(o3) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof import_symbol.default && "symbol" == typeof import_iterator.default ? function(o4) {
    return typeof o4;
  } : function(o4) {
    return o4 && "function" == typeof import_symbol.default && o4.constructor === import_symbol.default && o4 !== import_symbol.default.prototype ? "symbol" : typeof o4;
  }, _typeof(o3);
}

// node_modules/@babel/runtime-corejs3/helpers/esm/toPrimitive.js
var import_to_primitive = __toESM(require_to_primitive6(), 1);
function toPrimitive(t2, r3) {
  if ("object" != _typeof(t2) || !t2) return t2;
  var e2 = t2[import_to_primitive.default];
  if (void 0 !== e2) {
    var i3 = e2.call(t2, r3 || "default");
    if ("object" != _typeof(i3)) return i3;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r3 ? String : Number)(t2);
}

// node_modules/@babel/runtime-corejs3/helpers/esm/toPropertyKey.js
function toPropertyKey(t2) {
  var i3 = toPrimitive(t2, "string");
  return "symbol" == _typeof(i3) ? i3 : i3 + "";
}

// node_modules/@babel/runtime-corejs3/helpers/esm/defineProperty.js
function _defineProperty(e2, r3, t2) {
  return (r3 = toPropertyKey(r3)) in e2 ? (0, import_define_property.default)(e2, r3, {
    value: t2,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e2[r3] = t2, e2;
}

// node_modules/mimetext/dist/mimetext.browser.es.js
var import_trim = __toESM(require_trim7(), 1);
var n = class extends Error {
  constructor(e2) {
    let s3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "";
    super(s3), _defineProperty(this, "name", ""), _defineProperty(this, "description", ""), this.name = e2, this.description = s3;
  }
};
var i = class {
  constructor(e2) {
    let s3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : { type: "To" };
    _defineProperty(this, "reSpecCompliantAddr", /(([^<>\r\n]+)\s)?<[^\r\n]+>/), _defineProperty(this, "name", ""), _defineProperty(this, "addr", ""), _defineProperty(this, "type", "To"), this.type = s3.type, this.parse(e2);
  }
  getAddrDomain() {
    if (this.addr.includes("@")) {
      const e2 = this.addr.split("@");
      if (e2.length > 1) return e2[1];
    }
    return "";
  }
  dump() {
    return this.name.length > 0 ? '"'.concat(this.name, '" <').concat(this.addr, ">") : "<".concat(this.addr, ">");
  }
  parse(e2) {
    if (this.isMailboxAddrObject(e2)) return this.addr = e2.addr, "string" == typeof e2.name && (this.name = e2.name), "string" == typeof e2.type && (this.type = e2.type), this;
    if (this.isMailboxAddrText(e2)) {
      const t2 = (0, import_trim.default)(e2).call(e2);
      if (t2.startsWith("<") && t2.endsWith(">")) return this.addr = t2.slice(1, -1), this;
      const n3 = t2.split(" <");
      return n3[0] = /^("|')/.test(n3[0]) ? n3[0].slice(1) : n3[0], n3[0] = /("|')$/.test(n3[0]) ? n3[0].slice(0, -1) : n3[0], n3[1] = n3[1].slice(0, -1), this.name = n3[0], this.addr = n3[1], this;
    }
    if ("string" == typeof e2) return this.addr = e2, this;
    throw new n("MIMETEXT_INVALID_MAILBOX", "Couldn't recognize the input.");
  }
  isMailboxAddrText(e2) {
    return "string" == typeof e2 && this.reSpecCompliantAddr.test(e2);
  }
  isMailboxAddrObject(e2) {
    return this.isObject(e2) && Object.hasOwn(e2, "addr");
  }
  isObject(e2) {
    return !!e2 && e2.constructor === Object;
  }
};
var a = class {
  constructor(e2) {
    _defineProperty(this, "envctx", void 0), _defineProperty(this, "fields", [{ name: "Date", generator: () => (/* @__PURE__ */ new Date()).toUTCString().replace(/GMT|UTC/gi, "+0000") }, { name: "From", required: true, validate: (e3) => this.validateMailboxSingle(e3), dump: (e3) => this.dumpMailboxSingle(e3) }, { name: "Sender", validate: (e3) => this.validateMailboxSingle(e3), dump: (e3) => this.dumpMailboxSingle(e3) }, { name: "Reply-To", validate: (e3) => this.validateMailboxSingle(e3), dump: (e3) => this.dumpMailboxSingle(e3) }, { name: "To", validate: (e3) => this.validateMailboxMulti(e3), dump: (e3) => this.dumpMailboxMulti(e3) }, { name: "Cc", validate: (e3) => this.validateMailboxMulti(e3), dump: (e3) => this.dumpMailboxMulti(e3) }, { name: "Bcc", validate: (e3) => this.validateMailboxMulti(e3), dump: (e3) => this.dumpMailboxMulti(e3) }, { name: "Message-ID", generator: () => "<" + Math.random().toString(36).slice(2) + "@" + this.fields.filter((e3) => "From" === e3.name)[0].value.getAddrDomain() + ">" }, { name: "Subject", required: true, dump: (e3) => "string" == typeof e3 ? "=?utf-8?B?" + this.envctx.toBase64(e3) + "?=" : "" }, { name: "MIME-Version", generator: () => "1.0" }]), this.envctx = e2;
  }
  dump() {
    let e2 = "";
    for (const t2 of this.fields) {
      if (t2.disabled) continue;
      const s3 = void 0 !== t2.value && null !== t2.value;
      if (!s3 && t2.required) throw new n("MIMETEXT_MISSING_HEADER", 'The "'.concat(t2.name, '" header is required.'));
      if (!s3 && "function" != typeof t2.generator) continue;
      s3 || "function" != typeof t2.generator || (t2.value = t2.generator());
      const i3 = Object.hasOwn(t2, "dump") && "function" == typeof t2.dump ? t2.dump(t2.value) : "string" == typeof t2.value ? t2.value : "";
      e2 += "".concat(t2.name, ": ").concat(i3).concat(this.envctx.eol);
    }
    return e2.slice(0, -1 * this.envctx.eol.length);
  }
  toObject() {
    return this.fields.reduce((e2, t2) => (e2[t2.name] = t2.value, e2), {});
  }
  get(e2) {
    const t2 = this.fields.findIndex((t3) => t3.name.toLowerCase() === e2.toLowerCase());
    return -1 !== t2 ? this.fields[t2].value : void 0;
  }
  set(e2, t2) {
    const s3 = (t3) => t3.name.toLowerCase() === e2.toLowerCase();
    if (!!this.fields.some(s3)) {
      const i3 = this.fields.findIndex(s3), a3 = this.fields[i3];
      if (a3.validate && !a3.validate(t2)) throw new n("MIMETEXT_INVALID_HEADER_VALUE", 'The value for the header "'.concat(e2, '" is invalid.'));
      return this.fields[i3].value = t2, this.fields[i3];
    }
    return this.setCustom({ name: e2, value: t2, custom: true, dump: (e3) => "string" == typeof e3 ? e3 : "" });
  }
  setCustom(e2) {
    if (this.isHeaderField(e2)) {
      if ("string" != typeof e2.value) throw new n("MIMETEXT_INVALID_HEADER_FIELD", "Custom header must have a value.");
      return this.fields.push(e2), e2;
    }
    throw new n("MIMETEXT_INVALID_HEADER_FIELD", "Invalid input for custom header. It must be in type of HeaderField.");
  }
  validateMailboxSingle(e2) {
    return e2 instanceof i;
  }
  validateMailboxMulti(e2) {
    return e2 instanceof i || this.isArrayOfMailboxes(e2);
  }
  dumpMailboxMulti(e2) {
    const t2 = (e3) => 0 === e3.name.length ? e3.dump() : "=?utf-8?B?".concat(this.envctx.toBase64(e3.name), "?= <").concat(e3.addr, ">");
    return this.isArrayOfMailboxes(e2) ? e2.map(t2).join(",".concat(this.envctx.eol, " ")) : e2 instanceof i ? t2(e2) : "";
  }
  dumpMailboxSingle(e2) {
    return e2 instanceof i ? ((e3) => 0 === e3.name.length ? e3.dump() : "=?utf-8?B?".concat(this.envctx.toBase64(e3.name), "?= <").concat(e3.addr, ">"))(e2) : "";
  }
  isHeaderField(e2) {
    const t2 = ["name", "value", "dump", "required", "disabled", "generator", "custom"];
    if (this.isObject(e2)) {
      const s3 = e2;
      if (Object.hasOwn(s3, "name") && "string" == typeof s3.name && s3.name.length > 0 && !Object.keys(s3).some((e3) => !t2.includes(e3))) return true;
    }
    return false;
  }
  isObject(e2) {
    return !!e2 && e2.constructor === Object;
  }
  isArrayOfMailboxes(e2) {
    return this.isArray(e2) && e2.every((e3) => e3 instanceof i);
  }
  isArray(e2) {
    return !!e2 && e2.constructor === Array;
  }
};
var r = class extends a {
  constructor(e2) {
    super(e2), _defineProperty(this, "fields", [{ name: "Content-ID" }, { name: "Content-Type" }, { name: "Content-Transfer-Encoding" }, { name: "Content-Disposition" }]);
  }
};
var o = class {
  constructor(e2, s3) {
    let n3 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
    _defineProperty(this, "envctx", void 0), _defineProperty(this, "headers", void 0), _defineProperty(this, "data", void 0), this.envctx = e2, this.headers = new r(this.envctx), this.data = s3, this.setHeaders(n3);
  }
  dump() {
    const e2 = this.envctx.eol;
    return this.headers.dump() + e2 + e2 + this.data;
  }
  isAttachment() {
    const e2 = this.headers.get("Content-Disposition");
    return "string" == typeof e2 && e2.includes("attachment");
  }
  isInlineAttachment() {
    const e2 = this.headers.get("Content-Disposition");
    return "string" == typeof e2 && e2.includes("inline");
  }
  setHeader(e2, t2) {
    return this.headers.set(e2, t2), e2;
  }
  getHeader(e2) {
    return this.headers.get(e2);
  }
  setHeaders(e2) {
    return Object.keys(e2).map((t2) => this.setHeader(t2, e2[t2]));
  }
  getHeaders() {
    return this.headers.toObject();
  }
};
var d = class {
  constructor(e2) {
    _defineProperty(this, "envctx", void 0), _defineProperty(this, "headers", void 0), _defineProperty(this, "boundaries", { mixed: "", alt: "", related: "" }), _defineProperty(this, "validTypes", ["text/html", "text/plain"]), _defineProperty(this, "validContentTransferEncodings", ["7bit", "8bit", "binary", "quoted-printable", "base64"]), _defineProperty(this, "messages", []), this.envctx = e2, this.headers = new a(this.envctx), this.messages = [], this.generateBoundaries();
  }
  asRaw() {
    const e2 = this.envctx.eol, t2 = this.headers.dump(), s3 = this.getMessageByType("text/plain"), i3 = this.getMessageByType("text/html"), a3 = null != i3 ? i3 : null != s3 ? s3 : void 0;
    if (void 0 === a3) throw new n("MIMETEXT_MISSING_BODY", "No content added to the message.");
    const r3 = this.hasAttachments(), o3 = this.hasInlineAttachments(), d3 = o3 && r3 ? "mixed+related" : r3 ? "mixed" : o3 ? "related" : s3 && i3 ? "alternative" : "";
    if ("mixed+related" === d3) {
      const n3 = this.getAttachments().map((t3) => "--" + this.boundaries.mixed + e2 + t3.dump() + e2 + e2).join("").slice(0, -1 * e2.length), a4 = this.getInlineAttachments().map((t3) => "--" + this.boundaries.related + e2 + t3.dump() + e2 + e2).join("").slice(0, -1 * e2.length);
      return t2 + e2 + "Content-Type: multipart/mixed; boundary=" + this.boundaries.mixed + e2 + e2 + "--" + this.boundaries.mixed + e2 + "Content-Type: multipart/related; boundary=" + this.boundaries.related + e2 + e2 + this.dumpTextContent(s3, i3, this.boundaries.related) + e2 + e2 + a4 + "--" + this.boundaries.related + "--" + e2 + n3 + "--" + this.boundaries.mixed + "--";
    }
    if ("mixed" === d3) {
      const n3 = this.getAttachments().map((t3) => "--" + this.boundaries.mixed + e2 + t3.dump() + e2 + e2).join("").slice(0, -1 * e2.length);
      return t2 + e2 + "Content-Type: multipart/mixed; boundary=" + this.boundaries.mixed + e2 + e2 + this.dumpTextContent(s3, i3, this.boundaries.mixed) + e2 + (s3 && i3 ? "" : e2) + n3 + "--" + this.boundaries.mixed + "--";
    }
    if ("related" === d3) {
      const n3 = this.getInlineAttachments().map((t3) => "--" + this.boundaries.related + e2 + t3.dump() + e2 + e2).join("").slice(0, -1 * e2.length);
      return t2 + e2 + "Content-Type: multipart/related; boundary=" + this.boundaries.related + e2 + e2 + this.dumpTextContent(s3, i3, this.boundaries.related) + e2 + e2 + n3 + "--" + this.boundaries.related + "--";
    }
    return "alternative" === d3 ? t2 + e2 + "Content-Type: multipart/alternative; boundary=" + this.boundaries.alt + e2 + e2 + this.dumpTextContent(s3, i3, this.boundaries.alt) + e2 + e2 + "--" + this.boundaries.alt + "--" : t2 + e2 + a3.dump();
  }
  asEncoded() {
    return this.envctx.toBase64WebSafe(this.asRaw());
  }
  dumpTextContent(e2, t2, s3) {
    const n3 = this.envctx.eol, i3 = null != t2 ? t2 : e2;
    let a3 = "";
    return a3 = e2 && t2 && (this.hasInlineAttachments() || this.hasAttachments()) ? "--" + s3 + n3 + "Content-Type: multipart/alternative; boundary=" + this.boundaries.alt + n3 + n3 + "--" + this.boundaries.alt + n3 + e2.dump() + n3 + n3 + "--" + this.boundaries.alt + n3 + t2.dump() + n3 + n3 + "--" + this.boundaries.alt + "--" : e2 && t2 ? "--" + s3 + n3 + e2.dump() + n3 + n3 + "--" + s3 + n3 + t2.dump() : "--" + s3 + n3 + i3.dump(), a3;
  }
  hasInlineAttachments() {
    return this.messages.some((e2) => e2.isInlineAttachment());
  }
  hasAttachments() {
    return this.messages.some((e2) => e2.isAttachment());
  }
  getAttachments() {
    const e2 = (e3) => e3.isAttachment();
    return this.messages.some(e2) ? this.messages.filter(e2) : [];
  }
  getInlineAttachments() {
    const e2 = (e3) => e3.isInlineAttachment();
    return this.messages.some(e2) ? this.messages.filter(e2) : [];
  }
  getMessageByType(e2) {
    const t2 = (t3) => !t3.isAttachment() && !t3.isInlineAttachment() && (t3.getHeader("Content-Type") || "").includes(e2);
    return this.messages.some(t2) ? this.messages.filter(t2)[0] : void 0;
  }
  addAttachment(e2) {
    var t2, s3, i3;
    if (this.isObject(e2.headers) || (e2.headers = {}), "string" != typeof e2.filename) throw new n("MIMETEXT_MISSING_FILENAME", 'The property "filename" must exist while adding attachments.');
    let a3 = (null !== (t2 = e2.headers["Content-Type"]) && void 0 !== t2 ? t2 : e2.contentType) || "none";
    if (false === this.envctx.validateContentType(a3)) throw new n("MIMETEXT_INVALID_MESSAGE_TYPE", 'You specified an invalid content type "'.concat(a3, '".'));
    const r3 = null !== (s3 = null !== (i3 = e2.headers["Content-Transfer-Encoding"]) && void 0 !== i3 ? i3 : e2.encoding) && void 0 !== s3 ? s3 : "base64";
    this.validContentTransferEncodings.includes(r3) || (a3 = "application/octet-stream");
    const o3 = e2.headers["Content-ID"];
    "string" == typeof o3 && o3.length > 2 && !o3.startsWith("<") && !o3.endsWith(">") && (e2.headers["Content-ID"] = "<" + e2.headers["Content-ID"] + ">");
    const d3 = e2.inline ? "inline" : "attachment";
    return e2.headers = Object.assign({}, e2.headers, { "Content-Type": "".concat(a3, '; name="').concat(e2.filename, '"'), "Content-Transfer-Encoding": r3, "Content-Disposition": "".concat(d3, '; filename="').concat(e2.filename, '"') }), this._addMessage({ data: e2.data, headers: e2.headers });
  }
  addMessage(e2) {
    var t2, s3, i3, a3;
    this.isObject(e2.headers) || (e2.headers = {});
    let r3 = (null !== (t2 = e2.headers["Content-Type"]) && void 0 !== t2 ? t2 : e2.contentType) || "none";
    if (!this.validTypes.includes(r3)) throw new n("MIMETEXT_INVALID_MESSAGE_TYPE", "Valid content types are ".concat(this.validTypes.join(", "), ' but you specified "').concat(r3, '".'));
    const o3 = null !== (s3 = null !== (i3 = e2.headers["Content-Transfer-Encoding"]) && void 0 !== i3 ? i3 : e2.encoding) && void 0 !== s3 ? s3 : "7bit";
    this.validContentTransferEncodings.includes(o3) || (r3 = "application/octet-stream");
    const d3 = null !== (a3 = e2.charset) && void 0 !== a3 ? a3 : "UTF-8";
    return e2.headers = Object.assign({}, e2.headers, { "Content-Type": "".concat(r3, "; charset=").concat(d3), "Content-Transfer-Encoding": o3 }), this._addMessage({ data: e2.data, headers: e2.headers });
  }
  _addMessage(e2) {
    const t2 = new o(this.envctx, e2.data, e2.headers);
    return this.messages.push(t2), t2;
  }
  setSender(e2) {
    const t2 = new i(e2, arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : { type: "From" });
    return this.setHeader("From", t2), t2;
  }
  getSender() {
    return this.getHeader("From");
  }
  setRecipients(e2) {
    let t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : { type: "To" };
    const s3 = (this.isArray(e2) ? e2 : [e2]).map((e3) => new i(e3, t2));
    return this.setHeader(t2.type, s3), s3;
  }
  getRecipients() {
    let e2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : { type: "To" };
    return this.getHeader(e2.type);
  }
  setRecipient(e2) {
    let t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : { type: "To" };
    return this.setRecipients(e2, t2);
  }
  setTo(e2) {
    let t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : { type: "To" };
    return this.setRecipients(e2, t2);
  }
  setCc(e2) {
    let t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : { type: "Cc" };
    return this.setRecipients(e2, t2);
  }
  setBcc(e2) {
    let t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : { type: "Bcc" };
    return this.setRecipients(e2, t2);
  }
  setSubject(e2) {
    return this.setHeader("subject", e2), e2;
  }
  getSubject() {
    return this.getHeader("subject");
  }
  setHeader(e2, t2) {
    return this.headers.set(e2, t2), e2;
  }
  getHeader(e2) {
    return this.headers.get(e2);
  }
  setHeaders(e2) {
    return Object.keys(e2).map((t2) => this.setHeader(t2, e2[t2]));
  }
  getHeaders() {
    return this.headers.toObject();
  }
  toBase64(e2) {
    return this.envctx.toBase64(e2);
  }
  toBase64WebSafe(e2) {
    return this.envctx.toBase64WebSafe(e2);
  }
  generateBoundaries() {
    this.boundaries = { mixed: Math.random().toString(36).slice(2), alt: Math.random().toString(36).slice(2), related: Math.random().toString(36).slice(2) };
  }
  isArray(e2) {
    return !!e2 && e2.constructor === Array;
  }
  isObject(e2) {
    return !!e2 && e2.constructor === Object;
  }
};
var h = { toBase64: function(t2) {
  return gBase64.encode(t2);
}, toBase64WebSafe: function(t2) {
  return gBase64.encodeURI(t2);
}, eol: "\r\n", validateContentType: (e2) => e2.length > 0 && e2 };
function c() {
  return new d(h);
}

// src/util.ts
init_openpgp_min();
function generateUUID() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = bytes[6] & 15 | 64;
  bytes[8] = bytes[8] & 63 | 128;
  const hex = Array.from(bytes, (b2) => b2.toString(16).padStart(2, "0"));
  return hex.slice(0, 4).join("") + "-" + hex.slice(4, 6).join("") + "-" + hex.slice(6, 8).join("") + "-" + hex.slice(8, 10).join("") + "-" + hex.slice(10, 16).join("");
}
async function clearArmoredPrivateKeyToPrivateKey(armoredKey) {
  return await Za({
    armoredKey
  });
}

// src/pgp-mime-builder.ts
var CRLF = "\r\n";
function buildMimeMessage(input) {
  const msg = c();
  msg.setSender(input.from);
  msg.setTo(input.to);
  if (input.cc?.length) msg.setCc(input.cc);
  msg.setSubject(input.subject);
  if (input.inReplyTo) msg.setHeader("In-Reply-To", input.inReplyTo);
  if (input.references?.length) msg.setHeader("References", input.references.join(" "));
  if (input.messageId) {
    msg.setHeader("Message-ID", input.messageId);
  }
  if (input.textBody) msg.addMessage({ contentType: "text/plain", data: input.textBody });
  if (input.htmlBody) msg.addMessage({ contentType: "text/html", data: input.htmlBody });
  if (input.attachments?.length) {
    for (const att of input.attachments) {
      msg.addAttachment({ filename: att.filename, contentType: att.contentType, data: base64EncodeRaw(att.content) });
    }
  }
  const rawMimeString = msg.asRaw();
  return new TextEncoder().encode(rawMimeString);
}
function wrapAsPgpMimeEncrypted(pgpEncryptedBlob, input) {
  const boundary = generateBoundary();
  const lines = [];
  lines.push(formatHeader("From", formatAddress(input.from)));
  lines.push(formatHeader("To", input.to.map(formatAddress).join(", ")));
  if (input.cc?.length) lines.push(formatHeader("Cc", input.cc.map(formatAddress).join(", ")));
  lines.push(formatHeader("Subject", encodeHeaderValue(input.subject)));
  lines.push(formatHeader("Date", formatDate(input.date ?? /* @__PURE__ */ new Date())));
  lines.push(formatHeader("Message-ID", input.messageId ?? `<${generateUUID()}@pgp.local>`));
  if (input.inReplyTo) lines.push(formatHeader("In-Reply-To", input.inReplyTo));
  if (input.references?.length) lines.push(formatHeader("References", input.references.join(" ")));
  lines.push("MIME-Version: 1.0");
  lines.push(`Content-Type: multipart/encrypted; protocol="application/pgp-encrypted"; boundary="${boundary}"`);
  lines.push("");
  lines.push(`--${boundary}`);
  lines.push("Content-Type: application/pgp-encrypted");
  lines.push("Content-Description: PGP/MIME version identification");
  lines.push("");
  lines.push("Version: 1");
  lines.push("");
  lines.push(`--${boundary}`);
  lines.push('Content-Type: application/octet-stream; name="encrypted.asc"');
  lines.push("Content-Description: OpenPGP encrypted message");
  lines.push('Content-Disposition: inline; filename="encrypted.asc"');
  lines.push("");
  const headerBytes = new TextEncoder().encode(lines.join(CRLF));
  const closingBytes = new TextEncoder().encode(`${CRLF}--${boundary}--${CRLF}`);
  return new Blob([headerBytes, pgpEncryptedBlob, closingBytes], { type: "message/rfc822" });
}
function wrapAsPgpMimeSigned(clearMimeBytes, pgpSignatureBlob, input) {
  const boundary = generateBoundary();
  const lines = [];
  lines.push(formatHeader("From", formatAddress(input.from)));
  lines.push(formatHeader("To", input.to.map(formatAddress).join(", ")));
  if (input.cc?.length) lines.push(formatHeader("Cc", input.cc.map(formatAddress).join(", ")));
  lines.push(formatHeader("Subject", encodeHeaderValue(input.subject)));
  lines.push(formatHeader("Date", formatDate(input.date ?? /* @__PURE__ */ new Date())));
  lines.push(formatHeader("Message-ID", input.messageId ?? `<${generateUUID()}@pgp.local>`));
  if (input.inReplyTo) lines.push(formatHeader("In-Reply-To", input.inReplyTo));
  if (input.references?.length) lines.push(formatHeader("References", input.references.join(" ")));
  lines.push("MIME-Version: 1.0");
  lines.push(`Content-Type: multipart/signed; micalg=pgp-sha256; protocol="application/pgp-signature"; boundary="${boundary}"`);
  lines.push("");
  lines.push(`--${boundary}`);
  const initialHeaderBytes = new TextEncoder().encode(lines.join(CRLF) + CRLF);
  const middleLines = [];
  middleLines.push("");
  middleLines.push(`--${boundary}`);
  middleLines.push('Content-Type: application/pgp-signature; name="signature.asc"');
  middleLines.push("Content-Description: OpenPGP digital signature");
  middleLines.push('Content-Disposition: attachment; filename="signature.asc"');
  middleLines.push("");
  const middleBytes = new TextEncoder().encode(middleLines.join(CRLF));
  const closingBytes = new TextEncoder().encode(`${CRLF}--${boundary}--${CRLF}`);
  return new Blob([initialHeaderBytes, clearMimeBytes, middleBytes, pgpSignatureBlob, closingBytes], { type: "message/rfc822" });
}
function generateBoundary() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(bytes, (b2) => b2.toString(16).padStart(2, "0")).join("");
  return `----=_Part_${hex}`;
}
function formatAddress(addr) {
  if (addr.name) {
    const escaped = addr.name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `"${escaped}" <${addr.email}>`;
  }
  return addr.email;
}
function formatHeader(name, value) {
  const full = `${name}: ${value}`;
  if (full.length <= 76) return full;
  const parts = [];
  let remaining = full;
  let first = true;
  while (remaining.length > 76) {
    let breakAt = 76;
    const spaceIdx = remaining.lastIndexOf(" ", 76);
    if (spaceIdx > (first ? name.length + 2 : 1)) breakAt = spaceIdx;
    parts.push(remaining.slice(0, breakAt));
    remaining = " " + remaining.slice(breakAt).trimStart();
    first = false;
  }
  parts.push(remaining);
  return parts.join(CRLF);
}
function encodeHeaderValue(value) {
  if (/^[\x20-\x7e]*$/.test(value)) return value;
  const encoded = Array.from(new TextEncoder().encode(value)).map((b2) => {
    if (b2 >= 48 && b2 <= 57 || b2 >= 65 && b2 <= 90 || b2 >= 97 && b2 <= 122) {
      return String.fromCharCode(b2);
    }
    return "=" + b2.toString(16).toUpperCase().padStart(2, "0");
  }).join("");
  return `=?UTF-8?Q?${encoded}?=`;
}
function formatDate(date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const d3 = days[date.getUTCDay()];
  const dd = date.getUTCDate();
  const m2 = months[date.getUTCMonth()];
  const y2 = date.getUTCFullYear();
  const hh2 = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss2 = String(date.getUTCSeconds()).padStart(2, "0");
  return `${d3}, ${dd} ${m2} ${y2} ${hh2}:${mm}:${ss2} +0000`;
}
function base64EncodeRaw(data) {
  const bytes = new Uint8Array(data);
  let binary = "";
  for (let i3 = 0; i3 < bytes.length; i3++) binary += String.fromCharCode(bytes[i3]);
  return btoa(binary);
}

// src/pgp-sign.ts
init_openpgp_min();
async function pgpSignInline(mimeBytes, unlockedPrivateKey) {
  if (!unlockedPrivateKey || !unlockedPrivateKey.isDecrypted || !unlockedPrivateKey.isDecrypted()) {
    throw new Error("Une clé privée OpenPGP valide et déverrouillée est requise pour signer.");
  }
  const message = await ao({ binary: mimeBytes });
  const armoredSignedMessage = await mo({
    message,
    signingKeys: unlockedPrivateKey,
    detached: false
  });
  return new TextEncoder().encode(armoredSignedMessage);
}
async function pgpSignDetached(mimeBytes, unlockedPrivateKey) {
  if (!unlockedPrivateKey || !unlockedPrivateKey.isDecrypted || !unlockedPrivateKey.isDecrypted()) {
    throw new Error("Une clé privée OpenPGP valide et déverrouillée est requise pour signer.");
  }
  const message = await ao({ binary: mimeBytes });
  const armoredSignature = await mo({
    message,
    signingKeys: unlockedPrivateKey,
    detached: true
    // True extrait uniquement le bloc -----BEGIN PGP SIGNATURE-----
  });
  return new Blob([armoredSignature], { type: 'application/pgp-signature; name="signature.asc"' });
}

// src/pgp-encrypt.ts
init_openpgp_min();
async function pgpEncrypt(mimeBytes, recipientPublicKeysArmored, senderPublicKeyArmored, useAes1282) {
  const allKeyStrings = deduplicateKeys([...recipientPublicKeysArmored, senderPublicKeyArmored]);
  if (allKeyStrings.length === 0) {
    throw new Error("Aucune clé publique de destinataire ou d’expéditeur fournie.");
  }
  const encryptionKeys = [];
  for (const keyArmored of allKeyStrings) {
    try {
      const parsedKey = await Za({ armoredKey: keyArmored });
      encryptionKeys.push(parsedKey);
    } catch (e2) {
      console.warn(`Impossible de lire une clé publique, elle sera ignorée: ${e2.message}`);
    }
  }
  if (encryptionKeys.length === 0) {
    throw new Error("Échec du parsing de toutes les clés publiques fournies.");
  }
  const message = await ao({ binary: mimeBytes });
  const algorithm = useAes1282 ? R.symmetric.aes128 : R.symmetric.aes256;
  const encryptedArmored = await Ao({
    message,
    encryptionKeys,
    config: {
      preferredSymmetricAlgorithm: algorithm
    }
  });
  return new Blob([encryptedArmored], { type: "application/pgp-encrypted; charset=utf-8" });
}
function deduplicateKeys(keys) {
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const key of keys) {
    if (!key) continue;
    const trimmed = key.trim();
    if (!seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  }
  return result;
}

// src/pgp-verify.ts
init_openpgp_min();

// src/pgp-key-utils.ts
init_openpgp_min();
function extractEmailAddresses(key) {
  console.log("extract");
  const emails = [];
  const userIDs = key.users || [];
  for (const item of userIDs) {
    if (item.userID) {
      emails.push(item.userID?.email);
    }
  }
  return emails;
}
function classifyCapabilities(key) {
  let canSign = false;
  let canEncrypt = false;
  try {
    if (typeof key.canSign === "function") {
      canSign = key.canSign();
    } else {
      canSign = !!key.keyPacket.algorithm;
    }
    if (typeof key.getEncryptionKeyPacket === "function") {
      canEncrypt = true;
    }
  } catch {
    canSign = false;
    canEncrypt = false;
  }
  if (!canSign && !canEncrypt) {
    try {
      const algName = String(key.getAlgorithmInfo?.().algorithm || "").toLowerCase();
      if (algName.includes("rsa")) {
        canSign = true;
        canEncrypt = true;
      }
    } catch {
    }
  }
  return { canSign, canEncrypt };
}
async function extractKeyInfo(key) {
  console.log(key);
  const fingerprint = key.getFingerprint();
  const keyID = key.getKeyID().toHex().toUpperCase();
  const emails = extractEmailAddresses(key);
  const capabilities = classifyCapabilities(key);
  const primaryUser = await key.getPrimaryUser();
  const subject = primaryUser?.user?.userID?.userID || emails[0] || "Unknown PGP User";
  const creationTimeRaw = key.getCreationTime();
  const creationDate = creationTimeRaw instanceof Date ? creationTimeRaw : new Date(creationTimeRaw);
  const expirationTimeRaw = await key.getExpirationTime();
  let expirationIso = null;
  if (expirationTimeRaw && expirationTimeRaw !== Infinity) {
    const expirationDate = expirationTimeRaw instanceof Date ? expirationTimeRaw : new Date(expirationTimeRaw);
    expirationIso = expirationDate.toISOString();
  }
  const fingerprintMatches = fingerprint.match(/.{1,4}/g);
  const formattedFingerprint = fingerprintMatches ? fingerprintMatches.join(":") : fingerprint;
  let algorithmName = "Unknown";
  try {
    if (typeof key.getAlgorithmInfo === "function") {
      algorithmName = String(key.getAlgorithmInfo().algorithm);
    }
  } catch {
  }
  let armoredPublicKey = "";
  try {
    const publicKeyInstance = key.isPrivate() ? key.toPublic() : key;
    armoredPublicKey = publicKeyInstance.armor();
  } catch (err) {
    console.error("Failed to export armored public key string from instance", err);
  }
  return {
    subject,
    issuer: "Self-Signed (OpenPGP Web of Trust)",
    serialNumber: keyID,
    notBefore: creationDate.toISOString(),
    notAfter: expirationIso,
    fingerprint: formattedFingerprint,
    algorithm: algorithmName,
    keyUsage: capabilities.canSign ? ["digitalSignature"] : [],
    extendedKeyUsage: [],
    emailAddresses: emails,
    capabilities,
    armoredPublicKey
    // Ajout de la propriété attendue par pgp-import.ts
  };
}

// src/pgp-verify.ts
async function pgpVerify(contentBytes, fromHeader, pgpSignatureBlock = null, knownPublicKeys = []) {
  let verificationResult;
  let mimeBytes = contentBytes;
  try {
    if (pgpSignatureBlock) {
      const message = await ao({ binary: contentBytes });
      const signature = await Ea({ armoredSignature: pgpSignatureBlock });
      verificationResult = await bo({
        message,
        signature,
        verificationKeys: knownPublicKeys
        // On passe les clés connues ici pour la validation
      });
    } else {
      const textContent = new TextDecoder("utf-8", { fatal: false }).decode(contentBytes);
      const message = await so({ armoredMessage: textContent });
      verificationResult = await bo({
        message,
        verificationKeys: knownPublicKeys,
        // On passe les clés connues ici aussi
        format: "binary"
      });
      mimeBytes = verificationResult.data;
    }
  } catch (err) {
    return {
      mimeBytes,
      status: {
        isSigned: true,
        isEncrypted: false,
        signatureValid: false,
        signatureError: err instanceof Error ? err.message : "Échec critique du parsing de la signature"
      }
    };
  }
  let signatureValid = false;
  let signatureError = null;
  let signerPublicRecord = null;
  let signerEmailMatch = false;
  try {
    const signatures = verificationResult.signatures;
    if (signatures && signatures.length > 0) {
      const sig = signatures[0];
      try {
        await sig.verified;
        signatureValid = true;
      } catch (err) {
        signatureValid = false;
        signatureError = err instanceof Error ? err.message : "Signature cryptographique invalide";
      }
      const signerKeyID = sig.keyID.toHex().toUpperCase();
      let signingKey = null;
      for (const key of knownPublicKeys) {
        if (key.getKeyID().toHex().toUpperCase() === signerKeyID) {
          signingKey = key;
          break;
        }
      }
      if (signingKey) {
        const keyInfo = await extractKeyInfo(signingKey);
        const signerEmail = keyInfo.emailAddresses[0] ?? "";
        const now = /* @__PURE__ */ new Date();
        const notBefore = new Date(keyInfo.notBefore);
        const notAfter = keyInfo.notAfter ? new Date(keyInfo.notAfter) : null;
        if (now < notBefore && !signatureError) signatureError = "La clé du signataire n’est pas encore valide";
        if (notAfter && now > notAfter && !signatureError) signatureError = "La clé du signataire a expiré";
        if (signatureError) signatureValid = false;
        signerPublicRecord = {
          id: `signer-${keyInfo.fingerprint.replace(/:/g, "")}`,
          email: signerEmail.toLowerCase(),
          publicKey: signingKey.toPublic().armor(),
          issuer: keyInfo.issuer,
          subject: keyInfo.subject,
          notBefore: keyInfo.notBefore,
          notAfter: keyInfo.notAfter,
          fingerprint: keyInfo.fingerprint,
          source: "signed-email"
        };
        if (fromHeader && signerEmail) {
          signerEmailMatch = fromHeader.toLowerCase().trim() === signerEmail.toLowerCase().trim();
        }
      } else {
        signatureValid = false;
        if (!signatureError) {
          signatureError = `Clé publique inconnue ou absente du trousseau local (Key ID: ${signerKeyID}).`;
        }
      }
    } else {
      signatureError = "Aucune signature valide trouvée dans la structure OpenPGP";
    }
  } catch (err) {
    signatureValid = false;
    signatureError = "Erreur lors du traitement des métadonnées de signature: " + (err instanceof Error ? err.message : String(err));
  }
  return {
    mimeBytes,
    status: {
      isSigned: true,
      isEncrypted: false,
      signatureValid,
      signatureError,
      signerCert: signerPublicRecord,
      signerEmailMatch,
      selfSigned: true
    }
  };
}

// src/pgp-decrypt.ts
init_openpgp_min();
var PgpKeyLockedError = class extends Error {
  keyRecordId;
  constructor(message, keyRecordId) {
    super(message);
    this.name = "PgpKeyLockedError";
    this.keyRecordId = keyRecordId;
  }
};
async function pgpDecrypt(input) {
  const { cmsBytes, keyRecords, unlockedKeys } = input;
  console.log("[plugin:smime] : CmsBytes :", cmsBytes);
  const armoredMessage = normalizePgpMessage(cmsBytes);
  console.log("[plugin:smime] : armored :", armoredMessage);
  let parsedMessage;
  try {
    parsedMessage = await so({ armoredMessage });
  } catch (e2) {
    throw new Error("Impossible de parser le message OpenPGP : " + (e2 instanceof Error ? e2.message : String(e2)));
  }
  const matchedRecords = await findMatchingKeyRecords(parsedMessage, keyRecords);
  if (matchedRecords.length === 0) {
    throw new Error("Aucune clé OpenPGP importée ne correspond aux destinataires de ce message chiffré.");
  }
  for (const keyRecord of matchedRecords) {
    const unlockedPrivateKey = unlockedKeys.get(keyRecord.id);
    if (!unlockedPrivateKey) continue;
    try {
      console.log(`Tentative de déchiffrement avec la clé ${keyRecord.id}...`);
      console.log("Clé déverrouillée :", unlockedPrivateKey);
      console.log("Type Clé déverrouillée :", typeof unlockedPrivateKey);
      console.log("Message PGP :", parsedMessage);
      console.log("Message PGP (armored) :", armoredMessage);
      const { data: decryptedBytes } = await wo({
        message: parsedMessage,
        decryptionKeys: await clearArmoredPrivateKeyToPrivateKey(unlockedPrivateKey),
        format: "binary"
        // Pour récupérer un Uint8Array exploitable par src/mime-parse.js
      });
      return { mimeBytes: decryptedBytes, keyRecordId: keyRecord.id };
    } catch (e2) {
      console.warn(`Échec de déchiffrement avec la clé ${keyRecord.id}, tentative suivante...`, e2);
      continue;
    }
  }
  const lockedRecord = (await matchedRecords).find((record) => !unlockedKeys.has(record.id));
  if (lockedRecord) {
    throw new PgpKeyLockedError(
      "La clé PGP est verrouillée. Veuillez saisir votre phrase de passe pour déchiffrer.",
      lockedRecord.id
    );
  }
  throw new Error("Échec du déchiffrement du message avec les clés disponibles.");
}
async function findMatchingKeyRecords(parsedMessage, keyRecords) {
  const encryptionKeyIds = parsedMessage.getEncryptionKeyIDs().map((id) => id.toHex().toUpperCase());
  const matches = [];
  for (const record of keyRecords) {
    if (!record.publicKey) continue;
    try {
      const keyInstance = await Za({ armoredKey: record.publicKey });
      const recordKeyIds = keyInstance.getKeyIDs().map((id) => id.toHex().toUpperCase());
      const hasMatch = recordKeyIds.some((id) => encryptionKeyIds.includes(id));
      if (hasMatch) {
        matches.push(record);
      }
    } catch (err) {
      console.error(`Failed to parse public key for record ${record.id}:`, err);
    }
  }
  return matches;
}
function normalizePgpMessage(raw) {
  if (!raw || typeof raw === "string" && raw.trim() === "") return "";
  let text = typeof raw === "string" ? raw : new TextDecoder("utf-8", { fatal: false }).decode(raw);
  text = text.trim();
  if (text.includes("-----BEGIN PGP MESSAGE-----")) {
    return text;
  }
  const cleanedBase64 = text.replace(/[^A-Za-z0-9+/=]/g, "");
  if (cleanedBase64.length > 32) {
    return `-----BEGIN PGP MESSAGE-----

${cleanedBase64}
-----END PGP MESSAGE-----`;
  }
  return text;
}

// src/pgp-detect.ts
function detectPgp(contentType, bodyStructure, attachments, textBody) {
  const noResult = { type: null, supported: false };
  if (textBody && typeof textBody === "string") {
    if (textBody.includes("-----BEGIN PGP MESSAGE-----")) {
      return { type: "pgp-inline-encrypted", supported: true };
    }
    if (textBody.includes("-----BEGIN PGP SIGNED MESSAGE-----")) {
      return { type: "pgp-inline-signed", supported: true };
    }
  }
  if (contentType) {
    const ct2 = contentType.toLowerCase();
    if (ct2.includes("multipart/encrypted") && ct2.includes('protocol="application/pgp-encrypted"')) {
      const part = findPgpMimePart(bodyStructure, "application/octet-stream");
      return {
        type: "pgp-mime-encrypted",
        blobId: bodyStructure?.blobId || part?.blobId,
        // On préfère le blob global pour le déchiffrement complet
        partId: part?.partId,
        supported: true
      };
    }
    if (ct2.includes("multipart/signed") && ct2.includes('protocol="application/pgp-signature"')) {
      const sigPart = findPgpMimePart(bodyStructure, "application/pgp-signature");
      const contentPart = bodyStructure?.subParts?.[0];
      return {
        type: "pgp-mime-signed",
        blobId: contentPart?.blobId || bodyStructure?.blobId,
        partId: contentPart?.partId || bodyStructure?.partId,
        signatureBlobId: sigPart?.blobId,
        supported: true
      };
    }
  }
  if (bodyStructure) {
    const result = walkBodyStructure(bodyStructure);
    if (result) return result;
  }
  if (attachments) {
    for (const att of attachments) {
      const type = att.type?.toLowerCase() || "";
      const name = att.name?.toLowerCase() || "";
      if (type.includes("application/pgp-encrypted")) {
        return { type: "pgp-mime-encrypted", blobId: att.blobId, partId: att.partId, supported: true };
      }
      if (type.includes("application/pgp-signature")) {
        return { type: "pgp-mime-signed", blobId: att.blobId, partId: att.partId, signatureBlobId: att.blobId, supported: true };
      }
      if (name.endsWith(".pgp") || name.endsWith(".asc")) {
        return { type: "pgp-encrypted-file", blobId: att.blobId, partId: att.partId, supported: true };
      }
      if (name.endsWith(".sig")) {
        return { type: "pgp-signature-file", blobId: att.blobId, partId: att.partId, signatureBlobId: att.blobId, supported: true };
      }
    }
  }
  return noResult;
}
function walkBodyStructure(part) {
  if (!part) return null;
  const type = part.type?.toLowerCase() || "";
  if (type.includes("application/pgp-encrypted")) {
    return { type: "pgp-mime-encrypted", blobId: part.blobId, partId: part.partId, supported: true };
  }
  if (type.includes("application/pgp-signature")) {
    return { type: "pgp-mime-signed", blobId: part.blobId, partId: part.partId, signatureBlobId: part.blobId, supported: true };
  }
  if (type === "multipart/encrypted" || type === "multipart/signed") {
    const subParts = part.subParts || [];
    const hasPgp = subParts.some((sp) => {
      const sType = sp.type?.toLowerCase() || "";
      return sType.includes("application/pgp-encrypted") || sType.includes("application/pgp-signature");
    });
    if (hasPgp) {
      if (type === "multipart/encrypted") {
        const encryptedControlPart = subParts.find((sp) => sp.type?.toLowerCase().includes("application/octet-stream"));
        return {
          type: "pgp-mime-encrypted",
          blobId: part.blobId || encryptedControlPart?.blobId,
          partId: encryptedControlPart?.partId,
          supported: true
        };
      } else {
        const contentPart = subParts[0];
        const signaturePart = subParts.find((sp) => sp.type?.toLowerCase().includes("application/pgp-signature"));
        return {
          type: "pgp-mime-signed",
          blobId: contentPart?.blobId || part.blobId,
          partId: contentPart?.partId || part.partId,
          signatureBlobId: signaturePart?.blobId || null,
          supported: true
        };
      }
    }
  }
  if (part.subParts) {
    for (const sub of part.subParts) {
      const result = walkBodyStructure(sub);
      if (result) return result;
    }
  }
  return null;
}
function findPgpMimePart(bodyStructure, protocolType) {
  if (!bodyStructure) return null;
  const type = bodyStructure.type?.toLowerCase() || "";
  if (type.includes(protocolType)) {
    return bodyStructure;
  }
  if (bodyStructure.subParts) {
    for (const sub of bodyStructure.subParts) {
      const found = findPgpMimePart(sub, protocolType);
      if (found) return found;
    }
  }
  return null;
}

// src/mime-parse.ts
var decoder = new TextDecoder("utf-8", { fatal: false });
function parseMime(bytes) {
  const text = binaryString(bytes);
  if (text.includes("-----BEGIN PGP MESSAGE-----") || text.includes("-----BEGIN PGP SIGNED MESSAGE-----")) {
    return parsePgpInline(text);
  }
  const node = parseEntity(text);
  const out = { html: "", text: "", attachments: [], pgpSignatureBlock: null };
  collect(node, out);
  const sigIndex = out.attachments.findIndex(
    (att) => att.type === "application/pgp-signature" || att.name === "signature.asc"
  );
  if (sigIndex !== -1) {
    const sigAttachment = out.attachments[sigIndex];
    out.pgpSignatureBlock = dataUrlToText(sigAttachment.dataUrl);
    out.attachments.splice(sigIndex, 1);
  }
  if (!out.html && !out.text) {
    const raw = decoder.decode(bytes).trim();
    if (raw) out.text = raw;
  }
  return out;
}
function parsePgpInline(rawText) {
  const cleanText = rawText.trim();
  return {
    html: "",
    text: cleanText,
    // Le moteur crypto-engine l'interceptera pour affichage/traitement
    attachments: [],
    pgpSignatureBlock: cleanText.includes("-----BEGIN PGP SIGNED MESSAGE-----") ? cleanText : null
  };
}
function binaryString(bytes) {
  let s3 = "";
  for (let i3 = 0; i3 < bytes.length; i3++) s3 += String.fromCharCode(bytes[i3]);
  return s3;
}
function parseEntity(raw) {
  const sepMatch = raw.match(/\r?\n\r?\n/);
  const headerText = sepMatch ? raw.slice(0, sepMatch.index) : raw;
  const body = sepMatch && sepMatch.index ? raw.slice(sepMatch.index + (sepMatch[0]?.length ?? 0)) : "";
  const headers = parseHeaders(headerText);
  const ctRaw = headers["content-type"] || "text/plain";
  const { type, params } = parseContentType(ctRaw);
  const cte = (headers["content-transfer-encoding"] || "7bit").trim().toLowerCase();
  const disposition = (headers["content-disposition"] || "").toLowerCase();
  const node = { type, params, cte, disposition, headers, body, children: [] };
  if (type.startsWith("multipart/") && params.boundary) {
    node.children = splitMultipart(body, params.boundary).map(parseEntity);
  }
  return node;
}
function parseHeaders(headerText) {
  const unfolded = headerText.replace(/\r?\n[ \t]+/g, " ");
  const headers = {};
  for (const line of unfolded.split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const name = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    headers[name] = headers[name] ? `${headers[name]}, ${value}` : value;
  }
  return headers;
}
function parseContentType(value) {
  const parts = value.split(";");
  const type = parts[0]?.trim().toLowerCase() || "text/plain";
  const params = {};
  for (let i3 = 1; i3 < parts.length; i3++) {
    const part = parts[i3];
    if (!part) continue;
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const k2 = part.slice(0, eq).trim().toLowerCase();
    let v2 = part.slice(eq + 1).trim();
    if (v2.startsWith('"') && v2.endsWith('"')) v2 = v2.slice(1, -1);
    params[k2] = v2;
  }
  return { type, params };
}
function splitMultipart(body, boundary) {
  const delim = `--${boundary}`;
  const parts = [];
  const segments = body.split(delim);
  for (let i3 = 1; i3 < segments.length; i3++) {
    let seg = segments[i3];
    if (!seg) continue;
    if (seg.startsWith("--")) break;
    seg = seg.replace(/^\r?\n/, "").replace(/\r?\n$/, "");
    parts.push(seg);
  }
  return parts;
}
function decodeBody(node) {
  const { cte, body } = node;
  if (cte === "base64") {
    const cleaned = body.replace(/[^A-Za-z0-9+/=]/g, "");
    try {
      const bin = atob(cleaned);
      const bytes2 = new Uint8Array(bin.length);
      for (let i3 = 0; i3 < bin.length; i3++) bytes2[i3] = bin.charCodeAt(i3);
      return bytes2;
    } catch {
      return new Uint8Array(0);
    }
  }
  if (cte === "quoted-printable") {
    return qpDecode(body);
  }
  const bytes = new Uint8Array(body.length);
  for (let i3 = 0; i3 < body.length; i3++) bytes[i3] = body.charCodeAt(i3) & 255;
  return bytes;
}
function qpDecode(input) {
  const out = [];
  const cleaned = input.replace(/=\r?\n/g, "");
  for (let i3 = 0; i3 < cleaned.length; i3++) {
    const c3 = cleaned[i3];
    if (c3 === "=" && i3 + 2 < cleaned.length) {
      const hex = cleaned.substring(i3 + 1, i3 + 3);
      if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
        out.push(parseInt(hex, 16));
        i3 += 2;
        continue;
      }
    }
    if (c3) out.push(c3.charCodeAt(0) & 255);
  }
  return new Uint8Array(out);
}
function decodeText(node) {
  const bytes = decodeBody(node);
  const charset = (node.params.charset || "utf-8").toLowerCase();
  try {
    return new TextDecoder(charset, { fatal: false }).decode(bytes);
  } catch {
    return decoder.decode(bytes);
  }
}
function filenameFor(node) {
  const cd = node.headers["content-disposition"] || "";
  const m2 = cd.match(/filename\*?=(?:"([^"]+)"|([^;]+))/i);
  if (m2) return (m2[1] || m2[2] || "").trim();
  if (node.params.name) return node.params.name;
  return "attachment";
}
function collect(node, out) {
  const { type, disposition } = node;
  const isAttachment = disposition.includes("attachment") || !type.startsWith("text/") && !type.startsWith("multipart/");
  if (type.startsWith("multipart/")) {
    for (const child of node.children) collect(child, out);
    return;
  }
  if (type === "text/html" && !isAttachment) {
    out.html = decodeText(node);
    return;
  }
  if (type === "text/plain" && !isAttachment) {
    out.text = decodeText(node);
    return;
  }
  const bytes = decodeBody(node);
  out.attachments.push({
    name: filenameFor(node),
    type: type || "application/octet-stream",
    size: bytes.length,
    dataUrl: bytesToDataUrl(bytes, type || "application/octet-stream")
  });
}
function bytesToDataUrl(bytes, type) {
  let binary = "";
  for (let i3 = 0; i3 < bytes.length; i3++) binary += String.fromCharCode(bytes[i3]);
  return `data:${type};base64,${btoa(binary)}`;
}
function dataUrlToText(dataUrl) {
  try {
    const base64Str = dataUrl.split(",")[1];
    return base64Str ? atob(base64Str) : null;
  } catch {
    return null;
  }
}

// src/key-storage.ts
var DB_NAME = "pgp-plugin-store";
var DB_VERSION = 1;
var KEY_RECORDS_STORE = "key-records";
var PUBLIC_CERTS_STORE = "public-certs";
var SESSION_KEYS_STORE = "session-keys";
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(KEY_RECORDS_STORE)) {
        const keyStore = db.createObjectStore(KEY_RECORDS_STORE, { keyPath: "id" });
        keyStore.createIndex("email", "email", { unique: false });
        keyStore.createIndex("accountId", "accountId", { unique: false });
      }
      if (!db.objectStoreNames.contains(PUBLIC_CERTS_STORE)) {
        const certStore = db.createObjectStore(PUBLIC_CERTS_STORE, { keyPath: "id" });
        certStore.createIndex("email", "email", { unique: false });
        certStore.createIndex("accountId", "accountId", { unique: false });
      }
      if (!db.objectStoreNames.contains(SESSION_KEYS_STORE)) {
        db.createObjectStore(SESSION_KEYS_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function txPromise(db, storeName, mode, fn2) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const req = fn2(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function saveKeyRecord(record) {
  const db = await openDB();
  await txPromise(db, KEY_RECORDS_STORE, "readwrite", (s3) => s3.put(record));
}
async function listKeyRecords(accountId) {
  const db = await openDB();
  const all = await txPromise(db, KEY_RECORDS_STORE, "readonly", (s3) => s3.getAll());
  if (!accountId) return all;
  return all.filter((r3) => r3.accountId === accountId || !r3.accountId);
}
async function deleteKeyRecord(id) {
  const db = await openDB();
  await txPromise(db, KEY_RECORDS_STORE, "readwrite", (s3) => s3.delete(id));
}
async function savePublicCert(cert) {
  const db = await openDB();
  await txPromise(db, PUBLIC_CERTS_STORE, "readwrite", (s3) => s3.put(cert));
}
async function listPublicCerts(accountId) {
  const db = await openDB();
  const all = await txPromise(db, PUBLIC_CERTS_STORE, "readonly", (s3) => s3.getAll());
  if (!accountId) return all;
  return all.filter((c3) => c3.accountId === accountId || !c3.accountId);
}
async function deletePublicCert(id) {
  const db = await openDB();
  await txPromise(db, PUBLIC_CERTS_STORE, "readwrite", (s3) => s3.delete(id));
}
async function saveSessionKeys(entry) {
  const db = await openDB();
  await txPromise(db, SESSION_KEYS_STORE, "readwrite", (s3) => s3.put(entry));
}
async function getSessionKeys(id) {
  const db = await openDB();
  return txPromise(db, SESSION_KEYS_STORE, "readonly", (s3) => s3.get(id));
}
async function deleteSessionKeys(id) {
  const db = await openDB();
  await txPromise(db, SESSION_KEYS_STORE, "readwrite", (s3) => s3.delete(id));
}
async function clearSessionKeys() {
  const db = await openDB();
  await txPromise(db, SESSION_KEYS_STORE, "readwrite", (s3) => s3.clear());
}

// src/pgp-import.ts
init_openpgp_min();
var KDF_ITERATIONS = 6e5;
var AES_KEY_LENGTH = 256;
async function importOpenPgpPrivateKey(armoredPrivateKeyText, storagePassphrase, currentPassphrase) {
  if (!armoredPrivateKeyText || typeof armoredPrivateKeyText !== "string") {
    throw new Error("Invalid OpenPGP private key: text block required");
  }
  let privateKey;
  try {
    privateKey = await Za({ armoredKey: armoredPrivateKeyText });
    if (!privateKey.isPrivate()) {
      throw new Error("The provided block is a public key, not a private key");
    }
    if (!privateKey.isDecrypted()) {
      const decryptedKey = await go({
        privateKey,
        passphrase: currentPassphrase
      });
      if (!decryptedKey) {
        throw new Error("Invalid passphrase for this OpenPGP private key");
      }
    }
  } catch (err) {
    throw new Error(`OpenPGP key validation failed: ${err.message}`);
  }
  const keyInfo = await extractKeyInfo(privateKey);
  console.log("keyinfo:", keyInfo);
  const email = (keyInfo.emailAddresses?.[0] ?? "").toLowerCase();
  console.log(email);
  if (!email) {
    throw new Error("OpenPGP private key must be bound to at least one valid email User ID");
  }
  const textBytes = new TextEncoder().encode(armoredPrivateKeyText);
  const { encrypted, salt, iv } = await encryptPrivateKeyData(textBytes.buffer, storagePassphrase);
  const keyRecord = {
    id: generateUUID(),
    email,
    publicKey: keyInfo.armoredPublicKey || "",
    encryptedPrivateKey: encrypted,
    salt,
    iv,
    kdfIterations: KDF_ITERATIONS,
    issuer: keyInfo.issuer || "Self-Signed (OpenPGP Web of Trust)",
    subject: keyInfo.subject || `OpenPGP User <${email}>`,
    serialNumber: keyInfo.serialNumber || keyInfo.fingerprint.substring(0, 16).toUpperCase(),
    notBefore: keyInfo.notBefore,
    notAfter: keyInfo.notAfter || null,
    fingerprint: keyInfo.fingerprint,
    algorithm: keyInfo.algorithm || "RSA/ECC",
    capabilities: {
      canSign: keyInfo.capabilities?.canSign !== false,
      canEncrypt: keyInfo.capabilities?.canEncrypt !== false
    }
  };
  return { keyRecord, keyInfo };
}
async function unlockPrivateKey(record, passphrase) {
  const wrappingKey = await deriveWrappingKey(passphrase, record.salt, record.kdfIterations);
  let rawTextBytes;
  try {
    rawTextBytes = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: record.iv },
      wrappingKey,
      record.encryptedPrivateKey
    );
  } catch {
    throw new Error("Incorrect passphrase");
  }
  const armoredPrivateKeyText = new TextDecoder().decode(rawTextBytes);
  const parsedKey = await Za({ armoredKey: armoredPrivateKeyText });
  let openPgpPrivateKey = parsedKey;
  if (!openPgpPrivateKey.isDecrypted()) {
    try {
      openPgpPrivateKey = await go({
        privateKey: openPgpPrivateKey,
        passphrase
      });
    } catch (err) {
      throw new Error(`Failed to decrypt internal OpenPGP packets: ${err.message}`);
    }
  }
  return {
    unlockedPrivateKey: openPgpPrivateKey.armor(),
    signingKey: openPgpPrivateKey.armor(),
    decryptionKey: openPgpPrivateKey.armor()
  };
}
async function deriveWrappingKey(passphrase, salt, iterations) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: AES_KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}
async function encryptPrivateKeyData(pkcs8Bytes, passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(32)).buffer;
  const iv = crypto.getRandomValues(new Uint8Array(12)).buffer;
  const wrappingKey = await deriveWrappingKey(passphrase, salt, KDF_ITERATIONS);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, wrappingKey, pkcs8Bytes);
  return { encrypted, salt, iv };
}

// src/index.tsx
var h3 = import_react.default.createElement;
var { useState, useEffect, useCallback, useRef } = import_react.default;
var PREFS_KEY = "prefs.v1";
var INTENT_KEY = "composeIntent.v1";
var VERIFY_PREFIX = "verify:";
var DEFAULT_PREFS = { defaultSign: false, defaultEncrypt: false };
async function getPrefs() {
  try {
    const p2 = await import_plugin_host.default.storage.get(PREFS_KEY);
    return { ...DEFAULT_PREFS, ...p2 || {} };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}
async function setPrefs(next) {
  await import_plugin_host.default.storage.set(PREFS_KEY, next);
}
function settings() {
  return import_plugin_host.default.plugin?.settings || {};
}
function useAes128() {
  return settings().encryptionStrength === "aes-128";
}
var NOT_PRIVILEGED_MSG = 'OpenPGP could not start: it is running in the restricted (untrusted) plugin sandbox, where in-browser cryptography and key storage are unavailable. This plugin must be delivered as a signed, admin-approved bundle with "tier": "privileged" so it loads in the same-origin tier. Contact your administrator.';
var _capable = null;
async function isCapable() {
  if (_capable !== null) return _capable;
  try {
    if (typeof indexedDB === "undefined" || !(crypto && crypto.subtle)) throw new Error("missing apis");
    await new Promise((resolve, reject) => {
      let req;
      try {
        req = indexedDB.open("pgp-capability-probe");
      } catch (e2) {
        reject(e2);
        return;
      }
      req.onsuccess = () => {
        try {
          req.result.close();
        } catch {
        }
        resolve(void 0);
      };
      req.onerror = () => reject(req.error || new Error("indexedDB open failed"));
      req.onblocked = () => resolve(void 0);
    });
    _capable = true;
  } catch {
    _capable = false;
  }
  return _capable;
}
function parseAddr(value) {
  if (value && typeof value === "object" && value.email) {
    return { name: value.name || void 0, email: String(value.email) };
  }
  const s3 = String(value || "");
  const m2 = s3.match(/^\s*(?:"?([^"<]*?)"?\s*)?<?\s*([^<>\s]+@[^<>\s]+)\s*>?\s*$/);
  if (m2) return { name: (m2[1] || "").trim() || void 0, email: m2[2] };
  return { email: s3.trim() };
}
function addrList(arr) {
  if (!arr) return [];
  return (Array.isArray(arr) ? arr : [arr]).map(parseAddr).filter((a3) => a3.email);
}
function emailsOf(arr) {
  return addrList(arr).map((a3) => a3.email.toLowerCase());
}
async function blobToBytes(blob) {
  return new Uint8Array(await blob.arrayBuffer());
}
function bytesArrayBuffer(u8) {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
}
async function signingKeyRecordForEmail(fromEmail) {
  const recs = await listKeyRecords();
  const lower = (fromEmail || "").toLowerCase();
  return recs.find((r3) => r3.email === lower && r3.capabilities?.canSign !== false) || recs.find((r3) => r3.email === lower) || void 0;
}
async function recipientKeysFor(emails) {
  const certs = await listPublicCerts();
  const found = [];
  const missing = [];
  for (const email of emails) {
    const c3 = certs.find((pc2) => pc2.email.toLowerCase() === email.toLowerCase());
    if (c3) found.push(c3.publicKey);
    else missing.push(email);
  }
  return { found, missing };
}
async function unlockedDecryptMaps() {
  const recs = await listKeyRecords();
  const unlockedKeys = /* @__PURE__ */ new Map();
  for (const r3 of recs) {
    const s3 = await getSessionKeys(r3.id);
    if (!s3) continue;
    if (s3.unlockedPrivateKey) unlockedKeys.set(r3.id, s3.unlockedPrivateKey);
  }
  return { keyRecords: recs, unlockedKeys };
}
async function resolveIntent(req) {
  const pick = (...vals) => {
    for (const v2 of vals) if (typeof v2 === "boolean") return v2;
    return void 0;
  };
  let sign = pick(req.sign, req.smimeSign, req.intent && req.intent.sign, req.smime && req.smime.sign);
  let encrypt = pick(req.encrypt, req.smimeEncrypt, req.intent && req.intent.encrypt, req.smime && req.smime.encrypt);
  if (sign === void 0 && encrypt === void 0) {
    const stored = await import_plugin_host.default.storage.get(INTENT_KEY) || {};
    const prefs = await getPrefs();
    sign = typeof stored.sign === "boolean" ? stored.sign : prefs.defaultSign;
    encrypt = typeof stored.encrypt === "boolean" ? stored.encrypt : prefs.defaultEncrypt;
  }
  return { sign: !!sign, encrypt: !!encrypt };
}
async function fetchAttachments(req) {
  const list = req.attachments || [];
  const out = [];
  for (const att of list) {
    if (!att || !att.blobId) continue;
    try {
      const bytes = await import_plugin_host.default.jmap.fetchBlob(att.blobId, { name: att.name, type: att.type });
      out.push({
        filename: att.name || "attachment",
        contentType: att.type || "application/octet-stream",
        content: bytes
      });
    } catch (err) {
      import_plugin_host.default.log.warn("attachment fetch failed", att.name, err);
      throw new Error(`Could not read attachment "${att.name || ""}" for encryption`);
    }
  }
  return out;
}
async function onComposeSend(req) {
  if (!req || typeof req !== "object") return void 0;
  const { sign, encrypt } = await resolveIntent(req);
  if (!sign && !encrypt) return void 0;
  if (!await isCapable()) {
    import_plugin_host.default.toast.error("Cannot sign/encrypt: OpenPGP is not running in the privileged tier.");
    return false;
  }
  try {
    const identityId = req.identityId || req.identity || "";
    if (!identityId) throw new Error("No sending identity available");
    const from = parseAddr(req.fromEmail || req.from || (addrList(req.from)[0] || {}).email || "");
    if (!from.email) throw new Error("Could not determine sender address");
    const to2 = addrList(req.to);
    const cc2 = addrList(req.cc);
    const bcc = addrList(req.bcc);
    const allRecipientEmails = [...emailsOf(req.to), ...emailsOf(req.cc), ...emailsOf(req.bcc)];
    let keyRecord = void 0;
    if (sign || encrypt) {
      keyRecord = await signingKeyRecordForEmail(from.email);
    }
    if ((sign || encrypt) && !keyRecord) {
      import_plugin_host.default.toast.error(`No OpenPGP key for ${from.email}. Import one in Settings → Plugins → OpenPGP.`);
      return false;
    }
    const attachments = await fetchAttachments(req);
    const clearMimeBytes = buildMimeMessage({
      from,
      to: to2,
      cc: cc2,
      subject: req.subject || "",
      textBody: req.textBody || req.text || "",
      htmlBody: req.htmlBody || req.html || "",
      inReplyTo: req.inReplyTo,
      references: req.references,
      attachments
    });
    let finalEnvelopeBlob;
    const currentKeyRecord = keyRecord;
    const session = await getSessionKeys(currentKeyRecord.id);
    if (encrypt) {
      const { found, missing } = await recipientKeysFor(allRecipientEmails);
      if (missing.length > 0) {
        import_plugin_host.default.toast.error(`Missing encryption key for: ${missing.join(", ")}`);
        return false;
      }
      let payloadToEncrypt = clearMimeBytes;
      if (sign) {
        if (!session || !session.signingKey) {
          import_plugin_host.default.toast.error("Your OpenPGP key is locked. Unlock it in Settings, then resend.");
          return false;
        }
        payloadToEncrypt = await pgpSignInline(clearMimeBytes, await clearArmoredPrivateKeyToPrivateKey(session.signingKey));
      }
      const encryptedBlob = await pgpEncrypt(payloadToEncrypt, found, currentKeyRecord.publicKey, useAes128());
      finalEnvelopeBlob = wrapAsPgpMimeEncrypted(encryptedBlob, {
        from,
        to: to2,
        cc: cc2,
        subject: req.subject || "",
        inReplyTo: req.inReplyTo,
        references: req.references,
        messageId: req.messageId
      });
    } else if (sign) {
      if (!session || !session.signingKey) {
        import_plugin_host.default.toast.error("Your OpenPGP key is locked. Unlock it in Settings, then resend.");
        return false;
      }
      const signatureBlob = await pgpSignDetached(clearMimeBytes, await clearArmoredPrivateKeyToPrivateKey(session.signingKey));
      const clearMimeBytesBlob = new Blob([clearMimeBytes.slice().buffer], { type: "application/octet-stream" });
      finalEnvelopeBlob = wrapAsPgpMimeSigned(clearMimeBytesBlob, signatureBlob, {
        from,
        to: to2,
        cc: cc2,
        subject: req.subject || "",
        inReplyTo: req.inReplyTo,
        references: req.references,
        messageId: req.messageId
      });
    }
    if (!finalEnvelopeBlob) {
      throw new Error("Cryptographic processing failed to generate an output envelope.");
    }
    const rawBytes = await blobToBytes(finalEnvelopeBlob);
    const envelopeRecipients = [.../* @__PURE__ */ new Set([...allRecipientEmails])];
    await import_plugin_host.default.jmap.sendRaw(bytesArrayBuffer(rawBytes), identityId, { envelopeRecipients });
    import_plugin_host.default.toast.success(
      encrypt && sign ? "Message signed, encrypted and sent (PGP/MIME)" : encrypt ? "Message encrypted and sent (PGP/MIME)" : "Message signed and sent (PGP/MIME)"
    );
    await import_plugin_host.default.storage.set(INTENT_KEY, {});
    return false;
  } catch (err) {
    import_plugin_host.default.log.error("onComposeSend failed", err);
    import_plugin_host.default.toast.error(`OpenPGP send failed: ${err && err.message ? err.message : String(err)}`);
    return false;
  }
}
async function maybeAutoImportSigner(status) {
  if (settings().autoImportSignerCerts === false) return;
  const cert = status && status.signerCert;
  if (!cert || !status.signatureValid || !cert.email) return;
  try {
    const existing = (await listPublicCerts()).some((c3) => c3.fingerprint === cert.fingerprint);
    if (!existing) {
      await savePublicCert({
        id: generateUUID(),
        email: cert.email,
        publicKey: cert.publicKey,
        issuer: cert.issuer,
        subject: cert.subject,
        notBefore: cert.notBefore,
        notAfter: cert.notAfter,
        fingerprint: cert.fingerprint,
        source: "signed-email"
      });
    }
  } catch (err) {
    import_plugin_host.default.log.warn("auto-import signer key failed", err);
  }
}
function statusNoticeHtml(message, tone) {
  const color = tone === "error" ? "var(--color-destructive, #dc2626)" : tone === "ok" ? "var(--color-success, #16a34a)" : "var(--color-muted-foreground, #64748b)";
  return `<div style="padding:12px;border:1px solid ${color};border-radius:8px;color:${color};font-size:14px;">${message}</div>`;
}
async function persistVerifyStatus(emailId, status) {
  if (!emailId) return;
  try {
    await import_plugin_host.default.storage.set(VERIFY_PREFIX + emailId, status);
  } catch {
  }
}
async function onRenderEmailBody(body, ctx) {
  if (!ctx) return void 0;
  if (!await isCapable()) return void 0;
  const detection = detectPgp(ctx.contentType, ctx.bodyStructure, ctx.attachments, ctx.textBody);
  if (!detection.type) return void 0;
  if (!detection.supported) {
    const status = {
      isSigned: detection.type === "pgp-signature-file" || detection.type === "pgp-mime-signed",
      isEncrypted: false,
      unsupportedReason: `Unsupported OpenPGP layout (${detection.type})`
    };
    await persistVerifyStatus(ctx.id, status);
    return void 0;
  }
  const blobId = detection.blobId || ctx.blobId;
  if (!blobId) return void 0;
  const fromEmail = (addrList(ctx.from)[0] || {}).email;
  try {
    const raw = await import_plugin_host.default.jmap.fetchBlob(blobId);
    console.log(raw);
    const pgpMessageContent = normalizePgpMessage(raw);
    if (detection.type === "pgp-mime-encrypted" || detection.type === "pgp-inline-encrypted" || detection.type === "pgp-encrypted-file") {
      const { keyRecords, unlockedKeys } = await unlockedDecryptMaps();
      let result;
      try {
        result = await pgpDecrypt({ cmsBytes: new TextEncoder().encode(pgpMessageContent), keyRecords, unlockedKeys });
      } catch (err) {
        if (err instanceof PgpKeyLockedError) {
          const status2 = { isEncrypted: true, decryptionSuccess: false, decryptionError: "locked" };
          await persistVerifyStatus(ctx.id, status2);
          return {
            ...body,
            handledBy: "openpgp",
            html: statusNoticeHtml("🔒 This message is encrypted. Unlock your OpenPGP key in Settings to read it.", "muted"),
            text: "This message is encrypted. Unlock your OpenPGP key to read it.",
            attachments: [],
            verification: status2
          };
        }
        const status = { isEncrypted: true, decryptionSuccess: false, decryptionError: String(err) };
        await persistVerifyStatus(ctx.id, status);
        return {
          ...body,
          handledBy: "openpgp",
          html: statusNoticeHtml(`🔒 Could not decrypt this PGP message: ${status.decryptionError}`, "error"),
          text: `Could not decrypt this PGP message: ${status.decryptionError}`,
          attachments: [],
          verification: status
        };
      }
      let innerBytes = result.mimeBytes;
      const verification = { isEncrypted: true, decryptionSuccess: true };
      try {
        const v2 = await pgpVerify(innerBytes, fromEmail);
        if (v2.status && v2.status.signatureValid) {
          innerBytes = v2.mimeBytes;
          Object.assign(verification, v2.status, { isEncrypted: true, decryptionSuccess: true });
          await maybeAutoImportSigner(v2.status);
        }
      } catch {
      }
      const parsed = parseMime(innerBytes);
      await persistVerifyStatus(ctx.id, verification);
      return {
        ...body,
        handledBy: "openpgp",
        html: parsed.html || "",
        text: parsed.text || "",
        attachments: parsed.attachments,
        verification
      };
    }
    if (detection.type === "pgp-mime-signed" || detection.type === "pgp-inline-signed" || detection.type === "pgp-signature-file") {
      const signatureBlock = detection.signatureBlobId ? await import_plugin_host.default.jmap.fetchBlob(detection.signatureBlobId) : null;
      const signatureString = signatureBlock ? new TextDecoder().decode(signatureBlock) : null;
      const v2 = await pgpVerify(new TextEncoder().encode(pgpMessageContent), fromEmail, signatureString);
      await maybeAutoImportSigner(v2.status);
      const parsed = parseMime(v2.mimeBytes);
      await persistVerifyStatus(ctx.id, v2.status);
      return {
        ...body,
        handledBy: "openpgp",
        html: parsed.html || "",
        text: parsed.text || "",
        attachments: parsed.attachments,
        verification: v2.status
      };
    }
  } catch (err) {
    import_plugin_host.default.log.error("onRenderEmailBody failed", err);
    return void 0;
  }
  return void 0;
}
var card = {
  border: "1px solid var(--color-border, #e2e8f0)",
  borderRadius: "8px",
  padding: "12px",
  background: "var(--color-card, #fff)",
  color: "var(--color-foreground, #0f172a)"
};
var btn = {
  font: "inherit",
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid var(--color-input, #cbd5e1)",
  background: "var(--color-muted, #f1f5f9)",
  color: "var(--color-foreground, #0f172a)",
  cursor: "pointer"
};
var btnPrimary = { ...btn, background: "var(--color-primary, #2563eb)", color: "#fff", border: "1px solid var(--color-primary, #2563eb)" };
function fmtDate(iso) {
  try {
    return iso ? new Date(iso).toLocaleDateString() : "Never expires";
  } catch {
    return iso;
  }
}
function isExpired(iso) {
  if (!iso) return false;
  try {
    return iso ? new Date(iso).getTime() < Date.now() : false;
  } catch {
    return false;
  }
}
function ComposerToolbar() {
  const [intent, setIntent] = useState({ sign: false, encrypt: false });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!await isCapable()) {
          if (alive) setReady(false);
          return;
        }
        const stored = await import_plugin_host.default.storage.get(INTENT_KEY) || {};
        const prefs = await getPrefs();
        if (alive) {
          setIntent({
            sign: typeof stored.sign === "boolean" ? stored.sign : !!prefs.defaultSign,
            encrypt: typeof stored.encrypt === "boolean" ? stored.encrypt : !!prefs.defaultEncrypt
          });
        }
        const recs = await listKeyRecords();
        if (alive) setReady(recs.length > 0);
      } catch {
        if (alive) setReady(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  const update = useCallback(async (next) => {
    setIntent(next);
    await import_plugin_host.default.storage.set(INTENT_KEY, next);
  }, []);
  const toggle = (key) => update({ ...intent, [key]: !intent[key] });
  const pill = (active) => ({
    ...btn,
    background: active ? "var(--color-primary, #2563eb)" : "var(--color-muted, #f1f5f9)",
    color: active ? "#fff" : "var(--color-foreground, #0f172a)",
    border: active ? "1px solid var(--color-primary, #2563eb)" : "1px solid var(--color-input, #cbd5e1)"
  });
  if (!ready) {
    return h3(
      "span",
      { style: { fontSize: "12px", color: "var(--color-muted-foreground, #64748b)" } },
      "OpenPGP: import a key in Settings to sign/encrypt"
    );
  }
  return h3(
    "div",
    { style: { display: "inline-flex", gap: "6px", alignItems: "center" } },
    h3("button", {
      type: "button",
      style: pill(intent.sign),
      title: "Digitally sign this message",
      onClick: () => toggle("sign")
      // Validé par TypeScript
    }, intent.sign ? "✓ Sign" : "Sign"),
    h3("button", {
      type: "button",
      style: pill(intent.encrypt),
      title: "Encrypt this message to its recipients",
      onClick: () => toggle("encrypt")
      // Validé par TypeScript
    }, intent.encrypt ? "✓ Encrypt" : "Encrypt")
  );
}
function EmailBanner(props) {
  const email = props && props.email;
  const [status, setStatus] = useState(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!email || !email.id) {
        setLoaded(true);
        return;
      }
      let s3 = await import_plugin_host.default.storage.get(VERIFY_PREFIX + email.id);
      if (!s3) {
        const ct2 = email.headers && (email.headers["Content-Type"] || email.headers["content-type"]);
        const ctStr = Array.isArray(ct2) ? ct2[0] : ct2;
        if (ctStr && ctStr.includes("multipart/encrypted")) {
          s3 = { isEncrypted: true };
        } else if (ctStr && ctStr.includes("multipart/signed")) {
          s3 = { isSigned: true };
        }
      }
      if (alive) {
        setStatus(s3 || null);
        setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [email && email.id]);
  if (!loaded || !status) return null;
  const rows = [];
  const warnSelfSigned = settings().warnOnSelfSigned !== false;
  if (status.isEncrypted) {
    if (status.decryptionSuccess) rows.push(["🔓", "Decrypted via OpenPGP", "ok"]);
    else if (status.decryptionError === "locked") rows.push(["🔒", "Encrypted — unlock your PGP key to read", "warn"]);
    else if (status.decryptionError) rows.push(["🔒", `Encrypted — ${status.decryptionError}`, "error"]);
    else rows.push(["🔒", "Encrypted OpenPGP message", "muted"]);
  }
  if (status.isSigned || status.signerCert) {
    if (status.signatureValid) {
      const who = status.signerCert && status.signerCert.email ? ` by ${status.signerCert.email}` : "";
      const mismatch = status.signerEmailMatch === false ? " ⚠ signer ≠ From" : "";
      const ss2 = warnSelfSigned && status.selfSigned ? " (self-signed key)" : "";
      rows.push(["🛡️", `PGP Signature valid${who}${ss2}${mismatch}`, status.signerEmailMatch === false ? "warn" : "ok"]);
    } else if (status.signatureError) {
      rows.push(["⚠️", `PGP Signature invalid: ${status.signatureError}`, "error"]);
    } else {
      rows.push(["✍️", "Signed OpenPGP message", "muted"]);
    }
  }
  if (status.unsupportedReason) rows.push(["ℹ️", status.unsupportedReason, "muted"]);
  if (rows.length === 0) return null;
  const toneColor = (tone) => tone === "ok" ? "var(--color-success, #16a34a)" : tone === "error" ? "var(--color-destructive, #dc2626)" : tone === "warn" ? "var(--color-warning, #d97706)" : "var(--color-muted-foreground, #64748b)";
  return h3(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: "4px", margin: "4px 0" } },
    rows.map(
      ([icon, text, tone], i3) => h3("div", {
        key: i3,
        style: {
          display: "flex",
          gap: "8px",
          alignItems: "center",
          padding: "6px 10px",
          borderRadius: "6px",
          fontSize: "13px",
          border: `1px solid ${toneColor(tone)}`,
          color: toneColor(tone),
          background: "var(--color-muted, rgba(100,116,139,0.06))"
        }
      }, h3("span", null, icon), h3("span", null, text))
    )
  );
}
function SettingsSection() {
  const [keys, setKeys] = useState([]);
  const [certs, setCerts] = useState([]);
  const [prefs, setPrefsState] = useState(DEFAULT_PREFS);
  const [unlocked, setUnlocked] = useState({});
  const [busy, setBusy] = useState(false);
  const [capable, setCapable] = useState(true);
  const [unlockingKeyId, setUnlockingKeyId] = useState(null);
  const [unlockPassphrase, setUnlockPassphrase] = useState("");
  const [hasPrivateFile, setHasPrivateFile] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const fileRef = useRef(null);
  const certFileRef = useRef(null);
  const refresh = useCallback(async () => {
    if (!await isCapable()) {
      setCapable(false);
      return;
    }
    const [k2, c3, p2] = await Promise.all([listKeyRecords(), listPublicCerts(), getPrefs()]);
    setKeys(k2);
    setCerts(c3);
    setPrefsState(p2);
    const u2 = {};
    for (const rec of k2) {
      u2[rec.id] = !!await getSessionKeys(rec.id);
    }
    setUnlocked(u2);
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  if (!capable) {
    return h3(
      "div",
      { style: { ...card, borderColor: "var(--color-destructive, #dc2626)", color: "var(--color-destructive, #dc2626)", maxWidth: "720px" } },
      h3("div", { style: { fontWeight: 600, marginBottom: "6px" } }, "OpenPGP is not active"),
      h3("div", { style: { fontSize: "13px", lineHeight: 1.5 } }, NOT_PRIVILEGED_MSG)
    );
  }
  function handleFileChange() {
    const file = fileRef.current && fileRef.current.files && fileRef.current.files[0];
    setHasPrivateFile(!!file);
  }
  async function importKeyFile() {
    const file = fileRef.current && fileRef.current.files && fileRef.current.files[0];
    if (!file) return;
    if (!passphrase.trim()) {
      import_plugin_host.default.toast.error("Please enter the OpenPGP passphrase to decrypt this private key.");
      return;
    }
    setBusy(true);
    try {
      const text = new TextDecoder().decode(await file.arrayBuffer());
      const { keyRecord } = await importOpenPgpPrivateKey(text, passphrase, passphrase);
      await saveKeyRecord(keyRecord);
      import_plugin_host.default.toast.success(`Imported OpenPGP key for ${keyRecord.email || "identity"}`);
      if (fileRef.current) fileRef.current.value = "";
      setHasPrivateFile(false);
      setPassphrase("");
      await refresh();
    } catch (err) {
      const error = err;
      import_plugin_host.default.toast.error(`Import failed: ${error?.message ? error.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }
  function initiateUnlock(rec) {
    setUnlockingKeyId(rec.id);
    setUnlockPassphrase("");
  }
  async function confirmUnlock(rec) {
    if (!unlockPassphrase.trim()) {
      import_plugin_host.default.toast.error("Please enter your passphrase.");
      return;
    }
    setBusy(true);
    try {
      const { unlockedPrivateKey, signingKey, decryptionKey } = await unlockPrivateKey(rec, unlockPassphrase);
      await saveSessionKeys({
        id: rec.id,
        unlockedPrivateKey,
        signingKey,
        decryptionKey
      });
      import_plugin_host.default.toast.success(`Unlocked ${rec.email || "key"}`);
      setUnlockingKeyId(null);
      setUnlockPassphrase("");
      await refresh();
    } catch (err) {
      const error = err;
      import_plugin_host.default.toast.error(error?.message ? error.message : "Unlock failed");
    } finally {
      setBusy(false);
    }
  }
  async function lock(rec) {
    await deleteSessionKeys(rec.id);
    import_plugin_host.default.toast.info(`Locked ${rec.email || "key"}`);
    await refresh();
  }
  async function removeKey(rec) {
    const ok = await import_plugin_host.default.ui.confirm({
      title: "Delete OpenPGP key",
      message: `Delete the private key and public identity for ${rec.email || "this identity"}? You will no longer be able to decrypt mail encrypted to it.`,
      danger: true,
      confirmLabel: "Delete"
    });
    if (!ok) return;
    await deleteSessionKeys(rec.id);
    await deleteKeyRecord(rec.id);
    import_plugin_host.default.toast.success("Key deleted");
    await refresh();
  }
  async function importCertFile() {
    const file = certFileRef.current && certFileRef.current.files && certFileRef.current.files[0];
    if (!file) return;
    setBusy(true);
    try {
      const text = new TextDecoder().decode(await file.arrayBuffer());
      const openpgp = await Promise.resolve().then(() => (init_openpgp_min(), openpgp_min_exports));
      const readKey = await openpgp.readKey({ armoredKey: text });
      const info = await extractKeyInfo(readKey);
      const email = (info.emailAddresses[0] || "").toLowerCase();
      if (!email) throw new Error("Key has no valid email address associated");
      await savePublicCert({
        id: generateUUID(),
        email,
        publicKey: text,
        issuer: info.issuer,
        subject: info.subject,
        notBefore: info.notBefore,
        notAfter: info.notAfter,
        fingerprint: info.fingerprint,
        source: "manual"
      });
      import_plugin_host.default.toast.success(`Imported public key for ${email}`);
      if (certFileRef.current) certFileRef.current.value = "";
      await refresh();
    } catch (err) {
      const error = err;
      import_plugin_host.default.toast.error(`Key import failed: ${error?.message ? error.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }
  async function removeCert(c3) {
    await deletePublicCert(c3.id);
    await refresh();
  }
  async function setPref(key, value) {
    const next = { ...prefs, [key]: value };
    setPrefsState(next);
    await setPrefs(next);
  }
  return h3(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: "16px", maxWidth: "720px" } },
    h3(
      "div",
      null,
      h3("h3", { style: { margin: "0 0 4px", fontSize: "15px", fontWeight: 600 } }, "Your OpenPGP keys"),
      h3(
        "p",
        { style: { margin: "0 0 8px", fontSize: "13px", color: "var(--color-muted-foreground, #64748b)" } },
        "Import an armored OpenPGP private key (.asc/.key). The key remains encrypted locally in your browser sandbox."
      ),
      h3(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" } },
        h3(
          "div",
          { style: { display: "flex", gap: "8px", alignItems: "center" } },
          h3("input", {
            ref: fileRef,
            type: "file",
            accept: ".asc,.key,.pgp",
            style: { fontSize: "13px" },
            onChange: handleFileChange
          }),
          h3("button", { type: "button", style: btn, disabled: busy, onClick: importKeyFile }, "Import private key")
        ),
        hasPrivateFile && h3("input", {
          type: "password",
          placeholder: "Enter OpenPGP key passphrase...",
          value: passphrase,
          disabled: busy,
          onChange: (e2) => setPassphrase(e2.target.value),
          style: {
            padding: "6px 10px",
            fontSize: "13px",
            borderRadius: "4px",
            border: "1px solid var(--color-border, #e2e8f0)",
            maxWidth: "320px",
            marginTop: "4px"
          }
        })
      ),
      keys.length === 0 ? h3("div", { style: { ...card, fontSize: "13px", color: "var(--color-muted-foreground, #64748b)" } }, "No keys imported yet.") : h3(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "8px" } },
        keys.map((rec) => h3(
          "div",
          { key: rec.id, style: { ...card, display: "flex", flexDirection: "column", gap: "10px" } },
          h3(
            "div",
            { style: { display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" } },
            h3(
              "div",
              null,
              h3("div", { style: { fontWeight: 600, fontSize: "14px" } }, rec.email || rec.subject || "OpenPGP User"),
              h3(
                "div",
                { style: { fontSize: "12px", color: "var(--color-muted-foreground, #64748b)" } },
                `${rec.algorithm} · created ${fmtDate(rec.notBefore)}${rec.notAfter ? ` · expires ${fmtDate(rec.notAfter)}` : " · no expiration"}${isExpired(rec.notAfter) ? " · EXPIRED" : ""}`
              ),
              h3(
                "div",
                { style: { fontSize: "11px", fontFamily: "monospace", color: "var(--color-muted-foreground, #64748b)", wordBreak: "break-all" } },
                rec.fingerprint
              ),
              h3(
                "div",
                { style: { fontSize: "11px", color: "var(--color-muted-foreground, #64748b)" } },
                `${rec.capabilities && rec.capabilities.canSign ? "sign" : ""}${rec.capabilities && rec.capabilities.canSign && rec.capabilities.canEncrypt ? " · " : ""}${rec.capabilities && rec.capabilities.canEncrypt ? "encrypt" : ""}`
              )
            ),
            h3(
              "div",
              { style: { display: "flex", gap: "6px", alignItems: "flex-start" } },
              unlocked[rec.id] ? h3("button", { type: "button", style: btn, disabled: busy, onClick: () => lock(rec) }, "🔓 Lock") : h3("button", { type: "button", style: btnPrimary, disabled: busy, onClick: () => initiateUnlock(rec) }, "🔒 Unlock"),
              h3("button", {
                type: "button",
                style: { ...btn, color: "var(--color-destructive, #dc2626)", borderColor: "var(--color-destructive, #dc2626)" },
                disabled: busy,
                onClick: () => removeKey(rec)
              }, "Delete")
            )
          ),
          // Insertion conditionnelle du bloc de saisie SOUS les détails de la clé concernée
          unlockingKeyId === rec.id && h3(
            "div",
            { style: { display: "flex", gap: "8px", alignItems: "center", marginTop: "4px", borderTop: "1px dashed var(--color-border, #e2e8f0)", paddingTop: "8px" } },
            h3("input", {
              type: "password",
              placeholder: "Enter passphrase to unlock...",
              value: unlockPassphrase,
              disabled: busy,
              onChange: (e2) => setUnlockPassphrase(e2.target.value),
              style: {
                padding: "4px 8px",
                fontSize: "13px",
                borderRadius: "4px",
                border: "1px solid var(--color-border, #e2e8f0)",
                flex: 1,
                maxWidth: "240px"
              }
            }),
            h3("button", { type: "button", style: btnPrimary, disabled: busy, onClick: () => confirmUnlock(rec) }, "OK"),
            h3("button", { type: "button", style: btn, disabled: busy, onClick: () => setUnlockingKeyId(null) }, "Cancel")
          )
        ))
      )
    ),
    h3(
      "div",
      null,
      h3("h3", { style: { margin: "0 0 4px", fontSize: "15px", fontWeight: 600 } }, "Recipient public keys"),
      h3(
        "p",
        { style: { margin: "0 0 8px", fontSize: "13px", color: "var(--color-muted-foreground, #64748b)" } },
        "Public keys (ASCII Armored) of contacts you send encrypted mail to. Signer keys extracted from valid signed messages are verified and captured automatically."
      ),
      h3(
        "div",
        { style: { display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" } },
        h3("input", { ref: certFileRef, type: "file", accept: ".asc,.key,.pub", style: { fontSize: "13px" } }),
        h3("button", { type: "button", style: btn, disabled: busy, onClick: importCertFile }, "Import public key")
      ),
      certs.length === 0 ? h3("div", { style: { ...card, fontSize: "13px", color: "var(--color-muted-foreground, #64748b)" } }, "No recipient public keys collected.") : h3(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "6px" } },
        certs.map((c3) => h3(
          "div",
          { key: c3.id, style: { ...card, display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" } },
          h3(
            "div",
            null,
            h3("div", { style: { fontWeight: 600, fontSize: "13px" } }, c3.email || c3.subject),
            h3(
              "div",
              { style: { fontSize: "11px", color: "var(--color-muted-foreground, #64748b)" } },
              `${c3.source} · expires ${fmtDate(c3.notAfter)}${isExpired(c3.notAfter) ? " · EXPIRED" : ""}`
            )
          ),
          h3("button", { type: "button", style: { ...btn, color: "var(--color-destructive, #dc2626)" }, onClick: () => removeCert(c3) }, "Remove")
        ))
      )
    ),
    h3(
      "div",
      null,
      h3("h3", { style: { margin: "0 0 8px", fontSize: "15px", fontWeight: 600 } }, "Defaults for new messages"),
      h3(
        "label",
        { style: { display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", marginBottom: "6px" } },
        h3("input", { type: "checkbox", checked: !!prefs.defaultSign, onChange: (e2) => setPref("defaultSign", e2.target.checked) }),
        "Sign new messages by default"
      ),
      h3(
        "label",
        { style: { display: "flex", gap: "8px", alignItems: "center", fontSize: "13px" } },
        h3("input", { type: "checkbox", checked: !!prefs.defaultEncrypt, onChange: (e2) => setPref("defaultEncrypt", e2.target.checked) }),
        "Encrypt new messages by default (when all recipients have verified keys)"
      )
    )
  );
}
var hooks = {
  onComposeSend,
  onRenderEmailBody,
  async onAfterLogout() {
    if (settings().lockOnLogout === false) return;
    try {
      await clearSessionKeys();
    } catch (err) {
      import_plugin_host.default.log.warn("clearSessionKeys failed", err);
    }
  },
  async onAccountSwitch() {
    if (settings().lockOnLogout === false) return;
    try {
      await clearSessionKeys();
    } catch (err) {
      import_plugin_host.default.log.warn("clearSessionKeys failed", err);
    }
  }
};
var slots = {
  "composer-toolbar": { component: ComposerToolbar, order: 70 },
  "email-banner": { component: EmailBanner, order: 20 },
  "settings-section": { component: SettingsSection, order: 100 }
};
async function activate(api) {
  if (!await isCapable()) {
    api.log.error(NOT_PRIVILEGED_MSG);
    try {
      api.toast.error("OpenPGP needs the privileged tier — see plugin logs.");
    } catch {
    }
    return;
  }
  try {
    await clearSessionKeys();
  } catch (err) {
    api.log.warn("OpenPGP: clearSessionKeys failed", err);
  }
  let keyCount = 0;
  try {
    keyCount = (await listKeyRecords()).length;
  } catch (err) {
    api.log.warn("OpenPGP: listKeyRecords failed", err);
  }
  api.log.info(`OpenPGP plugin activated (${keyCount} key${keyCount === 1 ? "" : "s"} available)`);
}
/*! Bundled license information:

openpgp/dist/openpgp.min.mjs:
  (*! OpenPGP.js v6.3.1 - 2026-06-04 - this is LGPL licensed code, see LICENSE/our website https://openpgpjs.org/ for more information. *)
  (*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) *)
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
