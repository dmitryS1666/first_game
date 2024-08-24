(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // node_modules/@capacitor/core/dist/index.js
  var createCapacitorPlatforms, initPlatforms, CapacitorPlatforms, addPlatform, setPlatform, ExceptionCode, CapacitorException, getPlatformId, createCapacitor, initCapacitorGlobal, Capacitor2, registerPlugin, Plugins, WebPlugin, encode, decode, CapacitorCookiesPluginWeb, CapacitorCookies, readBlobAsBase64, normalizeHttpHeaders, buildUrlParams, buildRequestInit, CapacitorHttpPluginWeb, CapacitorHttp;
  var init_dist = __esm({
    "node_modules/@capacitor/core/dist/index.js"() {
      createCapacitorPlatforms = (win) => {
        const defaultPlatformMap = /* @__PURE__ */ new Map();
        defaultPlatformMap.set("web", { name: "web" });
        const capPlatforms = win.CapacitorPlatforms || {
          currentPlatform: { name: "web" },
          platforms: defaultPlatformMap
        };
        const addPlatform2 = (name, platform) => {
          capPlatforms.platforms.set(name, platform);
        };
        const setPlatform2 = (name) => {
          if (capPlatforms.platforms.has(name)) {
            capPlatforms.currentPlatform = capPlatforms.platforms.get(name);
          }
        };
        capPlatforms.addPlatform = addPlatform2;
        capPlatforms.setPlatform = setPlatform2;
        return capPlatforms;
      };
      initPlatforms = (win) => win.CapacitorPlatforms = createCapacitorPlatforms(win);
      CapacitorPlatforms = /* @__PURE__ */ initPlatforms(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
      addPlatform = CapacitorPlatforms.addPlatform;
      setPlatform = CapacitorPlatforms.setPlatform;
      (function(ExceptionCode2) {
        ExceptionCode2["Unimplemented"] = "UNIMPLEMENTED";
        ExceptionCode2["Unavailable"] = "UNAVAILABLE";
      })(ExceptionCode || (ExceptionCode = {}));
      CapacitorException = class extends Error {
        constructor(message, code, data) {
          super(message);
          this.message = message;
          this.code = code;
          this.data = data;
        }
      };
      getPlatformId = (win) => {
        var _a, _b;
        if (win === null || win === void 0 ? void 0 : win.androidBridge) {
          return "android";
        } else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
          return "ios";
        } else {
          return "web";
        }
      };
      createCapacitor = (win) => {
        var _a, _b, _c, _d, _e;
        const capCustomPlatform = win.CapacitorCustomPlatform || null;
        const cap = win.Capacitor || {};
        const Plugins2 = cap.Plugins = cap.Plugins || {};
        const capPlatforms = win.CapacitorPlatforms;
        const defaultGetPlatform = () => {
          return capCustomPlatform !== null ? capCustomPlatform.name : getPlatformId(win);
        };
        const getPlatform = ((_a = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _a === void 0 ? void 0 : _a.getPlatform) || defaultGetPlatform;
        const defaultIsNativePlatform = () => getPlatform() !== "web";
        const isNativePlatform = ((_b = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _b === void 0 ? void 0 : _b.isNativePlatform) || defaultIsNativePlatform;
        const defaultIsPluginAvailable = (pluginName) => {
          const plugin = registeredPlugins.get(pluginName);
          if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) {
            return true;
          }
          if (getPluginHeader(pluginName)) {
            return true;
          }
          return false;
        };
        const isPluginAvailable = ((_c = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _c === void 0 ? void 0 : _c.isPluginAvailable) || defaultIsPluginAvailable;
        const defaultGetPluginHeader = (pluginName) => {
          var _a2;
          return (_a2 = cap.PluginHeaders) === null || _a2 === void 0 ? void 0 : _a2.find((h) => h.name === pluginName);
        };
        const getPluginHeader = ((_d = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _d === void 0 ? void 0 : _d.getPluginHeader) || defaultGetPluginHeader;
        const handleError = (err) => win.console.error(err);
        const pluginMethodNoop = (_target, prop, pluginName) => {
          return Promise.reject(`${pluginName} does not have an implementation of "${prop}".`);
        };
        const registeredPlugins = /* @__PURE__ */ new Map();
        const defaultRegisterPlugin = (pluginName, jsImplementations = {}) => {
          const registeredPlugin = registeredPlugins.get(pluginName);
          if (registeredPlugin) {
            console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
            return registeredPlugin.proxy;
          }
          const platform = getPlatform();
          const pluginHeader = getPluginHeader(pluginName);
          let jsImplementation;
          const loadPluginImplementation = async () => {
            if (!jsImplementation && platform in jsImplementations) {
              jsImplementation = typeof jsImplementations[platform] === "function" ? jsImplementation = await jsImplementations[platform]() : jsImplementation = jsImplementations[platform];
            } else if (capCustomPlatform !== null && !jsImplementation && "web" in jsImplementations) {
              jsImplementation = typeof jsImplementations["web"] === "function" ? jsImplementation = await jsImplementations["web"]() : jsImplementation = jsImplementations["web"];
            }
            return jsImplementation;
          };
          const createPluginMethod = (impl, prop) => {
            var _a2, _b2;
            if (pluginHeader) {
              const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find((m) => prop === m.name);
              if (methodHeader) {
                if (methodHeader.rtype === "promise") {
                  return (options) => cap.nativePromise(pluginName, prop.toString(), options);
                } else {
                  return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
                }
              } else if (impl) {
                return (_a2 = impl[prop]) === null || _a2 === void 0 ? void 0 : _a2.bind(impl);
              }
            } else if (impl) {
              return (_b2 = impl[prop]) === null || _b2 === void 0 ? void 0 : _b2.bind(impl);
            } else {
              throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
            }
          };
          const createPluginMethodWrapper = (prop) => {
            let remove;
            const wrapper = (...args) => {
              const p = loadPluginImplementation().then((impl) => {
                const fn = createPluginMethod(impl, prop);
                if (fn) {
                  const p2 = fn(...args);
                  remove = p2 === null || p2 === void 0 ? void 0 : p2.remove;
                  return p2;
                } else {
                  throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
                }
              });
              if (prop === "addListener") {
                p.remove = async () => remove();
              }
              return p;
            };
            wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
            Object.defineProperty(wrapper, "name", {
              value: prop,
              writable: false,
              configurable: false
            });
            return wrapper;
          };
          const addListener = createPluginMethodWrapper("addListener");
          const removeListener = createPluginMethodWrapper("removeListener");
          const addListenerNative = (eventName, callback) => {
            const call = addListener({ eventName }, callback);
            const remove = async () => {
              const callbackId = await call;
              removeListener({
                eventName,
                callbackId
              }, callback);
            };
            const p = new Promise((resolve) => call.then(() => resolve({ remove })));
            p.remove = async () => {
              console.warn(`Using addListener() without 'await' is deprecated.`);
              await remove();
            };
            return p;
          };
          const proxy = new Proxy({}, {
            get(_, prop) {
              switch (prop) {
                // https://github.com/facebook/react/issues/20030
                case "$$typeof":
                  return void 0;
                case "toJSON":
                  return () => ({});
                case "addListener":
                  return pluginHeader ? addListenerNative : addListener;
                case "removeListener":
                  return removeListener;
                default:
                  return createPluginMethodWrapper(prop);
              }
            }
          });
          Plugins2[pluginName] = proxy;
          registeredPlugins.set(pluginName, {
            name: pluginName,
            proxy,
            platforms: /* @__PURE__ */ new Set([
              ...Object.keys(jsImplementations),
              ...pluginHeader ? [platform] : []
            ])
          });
          return proxy;
        };
        const registerPlugin2 = ((_e = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _e === void 0 ? void 0 : _e.registerPlugin) || defaultRegisterPlugin;
        if (!cap.convertFileSrc) {
          cap.convertFileSrc = (filePath) => filePath;
        }
        cap.getPlatform = getPlatform;
        cap.handleError = handleError;
        cap.isNativePlatform = isNativePlatform;
        cap.isPluginAvailable = isPluginAvailable;
        cap.pluginMethodNoop = pluginMethodNoop;
        cap.registerPlugin = registerPlugin2;
        cap.Exception = CapacitorException;
        cap.DEBUG = !!cap.DEBUG;
        cap.isLoggingEnabled = !!cap.isLoggingEnabled;
        cap.platform = cap.getPlatform();
        cap.isNative = cap.isNativePlatform();
        return cap;
      };
      initCapacitorGlobal = (win) => win.Capacitor = createCapacitor(win);
      Capacitor2 = /* @__PURE__ */ initCapacitorGlobal(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
      registerPlugin = Capacitor2.registerPlugin;
      Plugins = Capacitor2.Plugins;
      WebPlugin = class {
        constructor(config) {
          this.listeners = {};
          this.retainedEventArguments = {};
          this.windowListeners = {};
          if (config) {
            console.warn(`Capacitor WebPlugin "${config.name}" config object was deprecated in v3 and will be removed in v4.`);
            this.config = config;
          }
        }
        addListener(eventName, listenerFunc) {
          let firstListener = false;
          const listeners = this.listeners[eventName];
          if (!listeners) {
            this.listeners[eventName] = [];
            firstListener = true;
          }
          this.listeners[eventName].push(listenerFunc);
          const windowListener = this.windowListeners[eventName];
          if (windowListener && !windowListener.registered) {
            this.addWindowListener(windowListener);
          }
          if (firstListener) {
            this.sendRetainedArgumentsForEvent(eventName);
          }
          const remove = async () => this.removeListener(eventName, listenerFunc);
          const p = Promise.resolve({ remove });
          return p;
        }
        async removeAllListeners() {
          this.listeners = {};
          for (const listener in this.windowListeners) {
            this.removeWindowListener(this.windowListeners[listener]);
          }
          this.windowListeners = {};
        }
        notifyListeners(eventName, data, retainUntilConsumed) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            if (retainUntilConsumed) {
              let args = this.retainedEventArguments[eventName];
              if (!args) {
                args = [];
              }
              args.push(data);
              this.retainedEventArguments[eventName] = args;
            }
            return;
          }
          listeners.forEach((listener) => listener(data));
        }
        hasListeners(eventName) {
          return !!this.listeners[eventName].length;
        }
        registerWindowListener(windowEventName, pluginEventName) {
          this.windowListeners[pluginEventName] = {
            registered: false,
            windowEventName,
            pluginEventName,
            handler: (event) => {
              this.notifyListeners(pluginEventName, event);
            }
          };
        }
        unimplemented(msg = "not implemented") {
          return new Capacitor2.Exception(msg, ExceptionCode.Unimplemented);
        }
        unavailable(msg = "not available") {
          return new Capacitor2.Exception(msg, ExceptionCode.Unavailable);
        }
        async removeListener(eventName, listenerFunc) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            return;
          }
          const index = listeners.indexOf(listenerFunc);
          this.listeners[eventName].splice(index, 1);
          if (!this.listeners[eventName].length) {
            this.removeWindowListener(this.windowListeners[eventName]);
          }
        }
        addWindowListener(handle) {
          window.addEventListener(handle.windowEventName, handle.handler);
          handle.registered = true;
        }
        removeWindowListener(handle) {
          if (!handle) {
            return;
          }
          window.removeEventListener(handle.windowEventName, handle.handler);
          handle.registered = false;
        }
        sendRetainedArgumentsForEvent(eventName) {
          const args = this.retainedEventArguments[eventName];
          if (!args) {
            return;
          }
          delete this.retainedEventArguments[eventName];
          args.forEach((arg) => {
            this.notifyListeners(eventName, arg);
          });
        }
      };
      encode = (str) => encodeURIComponent(str).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
      CapacitorCookiesPluginWeb = class extends WebPlugin {
        async getCookies() {
          const cookies = document.cookie;
          const cookieMap = {};
          cookies.split(";").forEach((cookie) => {
            if (cookie.length <= 0)
              return;
            let [key, value] = cookie.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
            key = decode(key).trim();
            value = decode(value).trim();
            cookieMap[key] = value;
          });
          return cookieMap;
        }
        async setCookie(options) {
          try {
            const encodedKey = encode(options.key);
            const encodedValue = encode(options.value);
            const expires = `; expires=${(options.expires || "").replace("expires=", "")}`;
            const path = (options.path || "/").replace("path=", "");
            const domain = options.url != null && options.url.length > 0 ? `domain=${options.url}` : "";
            document.cookie = `${encodedKey}=${encodedValue || ""}${expires}; path=${path}; ${domain};`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async deleteCookie(options) {
          try {
            document.cookie = `${options.key}=; Max-Age=0`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearCookies() {
          try {
            const cookies = document.cookie.split(";") || [];
            for (const cookie of cookies) {
              document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${(/* @__PURE__ */ new Date()).toUTCString()};path=/`);
            }
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearAllCookies() {
          try {
            await this.clearCookies();
          } catch (error) {
            return Promise.reject(error);
          }
        }
      };
      CapacitorCookies = registerPlugin("CapacitorCookies", {
        web: () => new CapacitorCookiesPluginWeb()
      });
      readBlobAsBase64 = async (blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result;
          resolve(base64String.indexOf(",") >= 0 ? base64String.split(",")[1] : base64String);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
      normalizeHttpHeaders = (headers = {}) => {
        const originalKeys = Object.keys(headers);
        const loweredKeys = Object.keys(headers).map((k) => k.toLocaleLowerCase());
        const normalized = loweredKeys.reduce((acc, key, index) => {
          acc[key] = headers[originalKeys[index]];
          return acc;
        }, {});
        return normalized;
      };
      buildUrlParams = (params, shouldEncode = true) => {
        if (!params)
          return null;
        const output = Object.entries(params).reduce((accumulator, entry) => {
          const [key, value] = entry;
          let encodedValue;
          let item;
          if (Array.isArray(value)) {
            item = "";
            value.forEach((str) => {
              encodedValue = shouldEncode ? encodeURIComponent(str) : str;
              item += `${key}=${encodedValue}&`;
            });
            item.slice(0, -1);
          } else {
            encodedValue = shouldEncode ? encodeURIComponent(value) : value;
            item = `${key}=${encodedValue}`;
          }
          return `${accumulator}&${item}`;
        }, "");
        return output.substr(1);
      };
      buildRequestInit = (options, extra = {}) => {
        const output = Object.assign({ method: options.method || "GET", headers: options.headers }, extra);
        const headers = normalizeHttpHeaders(options.headers);
        const type = headers["content-type"] || "";
        if (typeof options.data === "string") {
          output.body = options.data;
        } else if (type.includes("application/x-www-form-urlencoded")) {
          const params = new URLSearchParams();
          for (const [key, value] of Object.entries(options.data || {})) {
            params.set(key, value);
          }
          output.body = params.toString();
        } else if (type.includes("multipart/form-data") || options.data instanceof FormData) {
          const form = new FormData();
          if (options.data instanceof FormData) {
            options.data.forEach((value, key) => {
              form.append(key, value);
            });
          } else {
            for (const key of Object.keys(options.data)) {
              form.append(key, options.data[key]);
            }
          }
          output.body = form;
          const headers2 = new Headers(output.headers);
          headers2.delete("content-type");
          output.headers = headers2;
        } else if (type.includes("application/json") || typeof options.data === "object") {
          output.body = JSON.stringify(options.data);
        }
        return output;
      };
      CapacitorHttpPluginWeb = class extends WebPlugin {
        /**
         * Perform an Http request given a set of options
         * @param options Options to build the HTTP request
         */
        async request(options) {
          const requestInit = buildRequestInit(options, options.webFetchExtra);
          const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
          const url = urlParams ? `${options.url}?${urlParams}` : options.url;
          const response = await fetch(url, requestInit);
          const contentType = response.headers.get("content-type") || "";
          let { responseType = "text" } = response.ok ? options : {};
          if (contentType.includes("application/json")) {
            responseType = "json";
          }
          let data;
          let blob;
          switch (responseType) {
            case "arraybuffer":
            case "blob":
              blob = await response.blob();
              data = await readBlobAsBase64(blob);
              break;
            case "json":
              data = await response.json();
              break;
            case "document":
            case "text":
            default:
              data = await response.text();
          }
          const headers = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });
          return {
            data,
            headers,
            status: response.status,
            url: response.url
          };
        }
        /**
         * Perform an Http GET request given a set of options
         * @param options Options to build the HTTP request
         */
        async get(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "GET" }));
        }
        /**
         * Perform an Http POST request given a set of options
         * @param options Options to build the HTTP request
         */
        async post(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "POST" }));
        }
        /**
         * Perform an Http PUT request given a set of options
         * @param options Options to build the HTTP request
         */
        async put(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PUT" }));
        }
        /**
         * Perform an Http PATCH request given a set of options
         * @param options Options to build the HTTP request
         */
        async patch(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PATCH" }));
        }
        /**
         * Perform an Http DELETE request given a set of options
         * @param options Options to build the HTTP request
         */
        async delete(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "DELETE" }));
        }
      };
      CapacitorHttp = registerPlugin("CapacitorHttp", {
        web: () => new CapacitorHttpPluginWeb()
      });
    }
  });

  // node_modules/@capacitor/screen-orientation/dist/esm/web.js
  var web_exports = {};
  __export(web_exports, {
    ScreenOrientationWeb: () => ScreenOrientationWeb
  });
  var ScreenOrientationWeb;
  var init_web = __esm({
    "node_modules/@capacitor/screen-orientation/dist/esm/web.js"() {
      init_dist();
      ScreenOrientationWeb = class extends WebPlugin {
        constructor() {
          super();
          if (typeof screen !== "undefined" && typeof screen.orientation !== "undefined") {
            screen.orientation.addEventListener("change", () => {
              const type = screen.orientation.type;
              this.notifyListeners("screenOrientationChange", { type });
            });
          }
        }
        async orientation() {
          if (typeof screen === "undefined" || !screen.orientation) {
            throw this.unavailable("ScreenOrientation API not available in this browser");
          }
          return { type: screen.orientation.type };
        }
        async lock(options) {
          if (typeof screen === "undefined" || !screen.orientation || !screen.orientation.lock) {
            throw this.unavailable("ScreenOrientation API not available in this browser");
          }
          try {
            await screen.orientation.lock(options.orientation);
          } catch (_a) {
            throw this.unavailable("ScreenOrientation API not available in this browser");
          }
        }
        async unlock() {
          if (typeof screen === "undefined" || !screen.orientation || !screen.orientation.unlock) {
            throw this.unavailable("ScreenOrientation API not available in this browser");
          }
          try {
            screen.orientation.unlock();
          } catch (_a) {
            throw this.unavailable("ScreenOrientation API not available in this browser");
          }
        }
      };
    }
  });

  // src/roulette.js
  var rouletteSegments = [2, 200, 5e3, 400, 500, 600, 1.5, 800];
  var rouletteCanvas;
  var rouletteCtx;
  var isSpinning = false;
  var score = 0;
  var rouletteImage = new Image();
  rouletteImage.src = "res/roulette-image.png";
  var roulettePointerImage = new Image();
  roulettePointerImage.src = "res/pointer.png";
  function setupRoulette() {
    rouletteCanvas = document.getElementById("rouletteCanvas");
    rouletteCtx = rouletteCanvas.getContext("2d");
    drawRoulette();
    drawPointer();
    document.getElementById("spinButton").addEventListener("click", spinRoulette);
    document.getElementById("currentBetRoulette").textContent = bet;
    document.getElementById("scoreValueRoulette").textContent = score || 0;
    checkFirstRun();
    document.getElementById("balanceValueRoulette").textContent = localStorage.getItem("currentScore") || 0;
  }
  var rotationAngle = 22.5 * (Math.PI / 180);
  function drawRoulette() {
    const radius = rouletteCanvas.width / 2;
    const angle = 2 * Math.PI / rouletteSegments.length;
    rouletteCtx.clearRect(0, 0, rouletteCanvas.width, rouletteCanvas.height);
    rouletteCtx.save();
    rouletteCtx.translate(radius, radius);
    rouletteCtx.rotate(rotationAngle);
    rouletteCtx.drawImage(rouletteImage, -radius, -radius, rouletteCanvas.width, rouletteCanvas.height);
    rouletteCtx.rotate(-rotationAngle);
    for (let i = 0; i < rouletteSegments.length; i++) {
      const startAngle = i * angle;
      const endAngle = startAngle + angle;
      const midAngle = (startAngle + endAngle) / 2;
      rouletteCtx.save();
      rouletteCtx.rotate(midAngle);
      rouletteCtx.translate(0, -radius / 2);
      rouletteCtx.restore();
    }
    rouletteCtx.restore();
  }
  function drawPointer() {
    const pointerX = rouletteCanvas.width / 2;
    const pointerY = 0;
    const pointerSize = 20;
    if (roulettePointerImage.complete) {
      rouletteCtx.drawImage(
        roulettePointerImage,
        pointerX - pointerSize / 2,
        // Центрируем изображение по оси X
        pointerY,
        // Стрелка у верхней части рулетки
        30,
        // Ширина стрелки
        75
        // Высота стрелки
      );
    } else {
      roulettePointerImage.onload = () => {
        rouletteCtx.drawImage(
          roulettePointerImage,
          pointerX - pointerSize / 2,
          pointerY,
          pointerSize,
          pointerSize
        );
      };
    }
  }
  function spinRoulette() {
    if (isSpinning) return;
    isSpinning = true;
    const spinDuration = 3e3;
    const segmentAngle = 360 / rouletteSegments.length;
    const winningSegment = Math.floor(Math.random() * rouletteSegments.length);
    const targetAngle = winningSegment * segmentAngle;
    const adjustedTargetAngle = (targetAngle + 22.5) % 360;
    const totalSpinAngle = 360 * 3 + (360 - adjustedTargetAngle);
    let startTime = null;
    function animate(time) {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      const currentAngle = totalSpinAngle * progress;
      rouletteCtx.clearRect(0, 0, rouletteCanvas.width, rouletteCanvas.height);
      rouletteCtx.save();
      rouletteCtx.translate(rouletteCanvas.width / 2, rouletteCanvas.height / 2);
      rouletteCtx.rotate(currentAngle * Math.PI / 180);
      rouletteCtx.translate(-rouletteCanvas.width / 2, -rouletteCanvas.height / 2);
      drawRoulette();
      rouletteCtx.restore();
      drawPointer();
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        handleRouletteResult(winningSegment);
        isSpinning = false;
      }
    }
    requestAnimationFrame(animate);
  }
  function handleRouletteResult(winningSegment) {
    const segmentAngle = 360 / rouletteSegments.length;
    let result;
    let currentBet = parseFloat(document.getElementById("currentBetRoulette").innerText);
    const adjustedTargetAngle = (winningSegment * segmentAngle + 112) % 360;
    score = rouletteSegments[winningSegment];
    if (score === 2 || score === 1.5) {
      result = parseFloat(score) * currentBet;
    } else {
      result = parseFloat(score) + currentBet;
    }
    let newScore = parseInt(localStorage.getItem("currentScore")) + score + result;
    saveScore(newScore);
    const finalScore = document.getElementById("finalScore");
    finalScore.textContent = `+${result}`;
    navigateTo("winPage");
  }

  // src/bonus.js
  var timer;
  var gameOver = false;
  var canvas;
  var ctx;
  var canvasWidth;
  var canvasHeight;
  var basketWidth;
  var basketHeight;
  var gameDuration = 15;
  var tracks = [];
  var basketX;
  var eggs = [];
  var score2 = 0;
  var colorProperties = {
    blue: { score: 5 },
    brown: { score: 15 },
    yellow: { score: 10 },
    earth: { score: 25 },
    green: { score: 2 },
    indigo: { score: 0 },
    orange: { score: -5 },
    purple: { score: -10 },
    pink: { score: -2 },
    red: { score: 0, gameOver: true }
    // red: {score: 0}
  };
  var ballImages = {};
  var basketImage = new Image();
  basketImage.src = "res/new_platform.png";
  var flashImage = new Image();
  flashImage.src = "res/flash.png";
  var trackImage = new Image();
  trackImage.src = "res/track.png";
  var touchFlag = false;
  var flashFlag = false;
  var trackWidth = 30;
  var trackHeight = 80;
  function startGame() {
    document.getElementById("failPlatform").style.display = "none";
    startTimer();
    if (canvas) {
      canvas.style.display = "block";
      gameOver = false;
      gameLoop();
    }
  }
  function endGame(isVictory) {
    canvas.style.display = "none";
    timerDisplay("none");
    let currentBet = parseInt(document.getElementById("currentBet").innerText, 10);
    if (isVictory) {
      let newScore = parseInt(localStorage.getItem("currentScore")) + score2 + currentBet;
      saveScore(newScore);
      const finalScore = document.getElementById("finalScore");
      finalScore.textContent = `+${score2}`;
      navigateTo("winPage");
    } else {
      let newScore = parseInt(localStorage.getItem("currentScore")) - currentBet;
      saveScore(newScore);
      navigateTo("failPage");
    }
    gameOver = true;
    clearInterval(timer);
  }
  function startTimer() {
    let timeRemaining = gameDuration;
    document.getElementById("seconds").textContent = `${timeRemaining}`;
    timer = setInterval(() => {
      timeRemaining--;
      if (timeRemaining >= 10) {
        document.getElementById("seconds").textContent = `${timeRemaining}`;
      } else {
        document.getElementById("seconds").textContent = `0${timeRemaining}`;
      }
      if (timeRemaining <= 0) {
        endGame(score2 >= 0);
      }
    }, 1e3);
  }
  function addTrack(x, y) {
    tracks.push({ x, y, startTime: Date.now() });
  }
  function drawBasket() {
    ctx.drawImage(basketImage, basketX, canvasHeight - basketHeight - 130, basketWidth, basketHeight);
  }
  function drawFlashes() {
    if (flashFlag) {
      ctx.globalAlpha = 1;
      ctx.drawImage(flashImage, basketX, canvasHeight - basketHeight - 50 - 150, basketWidth, basketHeight);
      setTimeout(() => {
        flashFlag = false;
      }, 200);
    }
  }
  function drawTracks() {
    const currentTime = Date.now();
    ctx.globalAlpha = 0.1;
    tracks.forEach((track) => {
      const elapsed = currentTime - track.startTime;
      if (elapsed < 200 && !flashFlag) {
        ctx.drawImage(trackImage, track.x, track.y - 120, trackWidth, trackHeight * 2.5);
      }
    });
    ctx.globalAlpha = 1;
    if (flashFlag) {
      tracks = [];
    } else {
      tracks = tracks.filter((track) => currentTime - track.startTime < 200);
    }
  }
  function drawEggs() {
    eggs.forEach((egg) => {
      const img = ballImages[egg.color];
      if (img) {
        ctx.drawImage(img, egg.x - 25, egg.y - 25, 75, 75);
      } else {
        ctx.beginPath();
        ctx.arc(egg.x, egg.y, 25, 0, Math.PI * 2);
        ctx.fillStyle = egg.color;
        ctx.fill();
      }
    });
  }
  function updateEggs() {
    eggs.forEach((egg) => {
      egg.y += egg.speed;
      addTrack(egg.x, egg.y - 75);
      if (egg.y > canvasHeight) {
        eggs = eggs.filter((e) => e !== egg);
      }
    });
  }
  function handleCollision() {
    flashFlag = false;
    touchFlag = false;
    eggs.forEach((egg) => {
      if (egg.y > canvasHeight - basketHeight - 150 && egg.x > basketX && egg.x < basketX + basketWidth) {
        const properties = colorProperties[egg.color];
        score2 += properties.score;
        updateScoreDisplay();
        if (properties.gameOver) {
          endGame(false);
        }
        eggs = eggs.filter((e) => e !== egg);
        touchFlag = true;
        flashFlag = true;
      }
    });
  }
  function timerDisplay(state) {
    document.getElementById("timer").style.display = state;
    document.getElementById("seconds").textContent = gameDuration;
  }
  function updateScoreDisplay() {
    document.getElementById("scoreValue").textContent = score2;
  }
  function gameLoop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawTracks();
    drawFlashes();
    drawBasket();
    drawEggs();
    updateEggs();
    handleCollision();
    requestAnimationFrame(gameLoop);
  }

  // src/planetCatcher.js
  var timerPC;
  var gameOver2 = false;
  var canvasPC;
  var ctxPC;
  var canvasPCWidth;
  var canvasPCHeight;
  var basketPCWidth;
  var basketPCHeight;
  var basketSpeed;
  var eggSpeedBase;
  var eggSpeedVariance;
  var leftPipeWidth;
  var leftPipeHeight;
  var rightPipeWidth;
  var rightPipeHeight;
  var eggInterval = 1e3;
  var gameDuration2 = 15;
  var basketPosition = "left";
  var eggs2 = [];
  var score3 = 0;
  var colors = ["blue", "brown", "yellow", "earth", "green", "indigo", "orange", "purple", "pink", "red"];
  var colorProperties2 = {
    blue: { score: 5 },
    brown: { score: 15 },
    yellow: { score: 10 },
    earth: { score: 25 },
    green: { score: 2 },
    indigo: { score: 0 },
    orange: { score: -5 },
    purple: { score: -10 },
    pink: { score: -2 },
    // red: {score: 0, gameOver: true}
    red: { score: 0 }
  };
  var ballImages2 = {};
  var ballImageNames = [
    "blue_ball.png",
    "brown_ball.png",
    "yellow_ball.png",
    "earth_ball.png",
    "green_ball.png",
    "indigo_ball.png",
    "orange_ball.png",
    "pink_ball.png",
    "purple_ball.png",
    "red_ball.png"
  ];
  var basketImage2 = new Image();
  basketImage2.src = "res/astro_left.png";
  var flashImage2 = new Image();
  flashImage2.src = "res/flash.png";
  var leftPipeImage = new Image();
  leftPipeImage.src = "res/l_pipe.png";
  var rightPipeImage = new Image();
  rightPipeImage.src = "res/r_pipe.png";
  var flashes = [];
  function setupGamePC() {
    canvasPC = document.getElementById("planetCatcherCanvas");
    setTimeout(() => {
      activateOrientationCheck();
    }, 450);
    if (!canvasPC) {
      console.error("Canvas element not found");
      return;
    }
    canvasPC.addEventListener("touchstart", (event) => {
      if (gameOver2) return;
      const touchX = event.touches[0].clientX;
      if (touchX < canvasPCWidth / 2) {
        basketPosition = "left";
      } else {
        basketPosition = "right";
      }
    });
    ctxPC = canvasPC.getContext("2d");
    if (!ctxPC) {
      console.error("Canvas context not found");
      return;
    }
    resizeCanvasPC();
    window.addEventListener("resize", resizeCanvasPC);
    basketPCWidth = 400;
    basketPCHeight = 392;
    basketSpeed = canvasPCWidth * 0.02;
    eggSpeedBase = canvasPCHeight * 5e-3;
    eggSpeedVariance = canvasPCHeight * 3e-3;
    ballImageNames.forEach((fileName) => {
      const color = fileName.split("_")[0];
      const img = new Image();
      img.src = `res/balls/${fileName}`;
      ballImages2[color] = img;
    });
    const startButton = document.getElementById("startButton");
    if (startButton) startButton.addEventListener("click", startGamePC);
    setInterval(addEgg, eggInterval);
    document.getElementById("currentBet").textContent = bet;
    document.getElementById("scoreValue").textContent = 0;
    checkFirstRun();
    document.getElementById("balanceValue").textContent = localStorage.getItem("currentScore") || 0;
    document.getElementById("failPlatformBlock").style.display = "none";
    document.getElementById("failPlatform").style.display = "none";
    document.getElementById("play").style.display = "none";
    document.getElementById("failPlatformAstroBlock").style.display = "block";
    document.getElementById("failPlatformAstro").style.display = "block";
    document.getElementById("playPC").style.display = "inline-block";
    timerDisplay2("block");
  }
  function resizeCanvasPC() {
    canvasPCWidth = window.innerWidth;
    canvasPCHeight = window.innerHeight;
    canvasPC.width = canvasPCWidth;
    canvasPC.height = canvasPCHeight;
    basketPCWidth = canvasPCWidth * 0.2;
    basketPCHeight = canvasPCHeight * 0.05;
    basketSpeed = canvasPCWidth * 0.02;
    eggSpeedBase = canvasPCHeight * 5e-3;
    eggSpeedVariance = canvasPCHeight * 3e-3;
    leftPipeWidth = canvasPCWidth * 0.32;
    leftPipeHeight = canvasPCHeight * 0.3;
    rightPipeWidth = leftPipeWidth;
    rightPipeHeight = leftPipeHeight;
  }
  function drawPipes() {
    ctxPC.drawImage(leftPipeImage, 0, 28, leftPipeWidth, leftPipeHeight);
    ctxPC.drawImage(rightPipeImage, canvasPCWidth - rightPipeWidth, 28, rightPipeWidth, rightPipeHeight);
  }
  function startGamePC() {
    setupGamePC();
    score3 = 0;
    eggs2 = [];
    basketPosition = "left";
    updateScoreDisplay2();
    startTimerPC();
    canvasPC.style.display = "block";
    gameOver2 = false;
    document.getElementById("failPlatformAstroBlock").style.display = "none";
    gameLoopPC();
  }
  function endGame2(isVictory) {
    canvasPC.style.display = "none";
    timerDisplay2("none");
    document.getElementById("pipeRight").style.display = "block";
    document.getElementById("pipeLeft").style.display = "block";
    let currentBet = parseInt(document.getElementById("currentBet").innerText, 10);
    if (isVictory) {
      let newScore = parseInt(localStorage.getItem("currentScore")) + score3 + currentBet;
      saveScore(newScore);
      const finalScore = document.getElementById("finalScore");
      finalScore.textContent = `+${score3}`;
      navigateTo("winPage");
    } else {
      let newScore = parseInt(localStorage.getItem("currentScore")) - currentBet;
      saveScore(newScore);
      navigateTo("failPage");
    }
    gameOver2 = true;
    clearInterval(timerPC);
  }
  function startTimerPC() {
    let timeRemaining = gameDuration2;
    document.getElementById("seconds").textContent = `${timeRemaining}`;
    timerPC = setInterval(() => {
      timeRemaining--;
      if (timeRemaining >= 10) {
        document.getElementById("seconds").textContent = `${timeRemaining}`;
      } else {
        document.getElementById("seconds").textContent = `0${timeRemaining}`;
      }
      if (timeRemaining <= 0) {
        endGame2(score3 >= 0);
      }
    }, 1e3);
  }
  function drawBasket2() {
    let basketX2 = basketPosition === "left" ? canvasPCWidth * 0.25 - basketPCWidth / 2 : canvasPCWidth * 0.75 - basketPCWidth / 2;
    ctxPC.save();
    if (basketPosition === "right") {
      ctxPC.scale(-1, 1);
      basketX2 = -basketX2 - basketPCWidth;
    }
    ctxPC.drawImage(basketImage2, basketX2 + 105, canvasPCHeight - basketPCHeight - 130, basketPCWidth, basketPCHeight);
    ctxPC.restore();
  }
  function calculateParabola(egg) {
    let time = egg.time;
    let xStart = egg.startX;
    let yStart = egg.startY;
    let xEnd = egg.fromLeft ? canvasPCWidth / 8 : canvasPCWidth - 60;
    let horizontalRange = canvasPCWidth * 0.08;
    xEnd = egg.fromLeft ? xEnd + horizontalRange : xEnd - horizontalRange;
    let yEnd = canvasPCHeight * 0.3;
    let transitionTime = 20;
    let totalDuration = 140;
    if (time < transitionTime) {
      let t = time / transitionTime;
      egg.x = xStart + (xEnd - xStart) * t;
      egg.y = yStart - (yStart - yEnd) * (1 - t * t);
    } else {
      let t = (time - transitionTime) / (totalDuration - transitionTime);
      egg.x = xEnd;
      egg.y = yEnd + (canvasPCHeight - yEnd - basketPCHeight - 100) * t;
    }
    egg.time++;
  }
  function drawEggs2() {
    eggs2.forEach((egg) => {
      const img = ballImages2[egg.color];
      if (img) {
        ctxPC.save();
        ctxPC.translate(egg.x, egg.y);
        const rotationDirection = egg.fromLeft ? 1 : -1;
        ctxPC.rotate(rotationDirection * egg.time * Math.PI / 180);
        ctxPC.translate(-egg.x, -egg.y);
        ctxPC.drawImage(img, egg.x - 50, egg.y - 50, 70, 70);
        ctxPC.restore();
      }
      calculateParabola(egg);
      egg.time++;
    });
    flashes.forEach((flash) => {
      ctxPC.save();
      ctxPC.globalAlpha = flash.alpha;
      ctxPC.drawImage(flashImage2, flash.x - 50, flash.y - 50, 100, 100);
      ctxPC.fillStyle = "white";
      ctxPC.font = "700 30px Montserrat";
      ctxPC.textAlign = "left";
      ctxPC.textBaseline = "middle";
      ctxPC.globalAlpha = flash.textAlpha;
      ctxPC.fillText(flash.text, flash.x + flash.textOffsetX, flash.y + flash.textOffsetY);
      ctxPC.restore();
      flash.alpha -= 0.05;
      flash.textAlpha = Math.max(flash.textAlpha - 0.02, 0);
      flash.textOffsetY -= 1;
    });
    flashes = flashes.filter((flash) => flash.alpha > 0 || flash.textAlpha > 0);
  }
  function gameLoopPC() {
    if (gameOver2) return;
    ctxPC.clearRect(0, 0, canvasPCWidth, canvasPCHeight);
    drawPipes();
    drawBasket2();
    drawEggs2();
    handleCollision2();
    requestAnimationFrame(gameLoopPC);
    document.getElementById("pipeRight").style.display = "none";
    document.getElementById("pipeLeft").style.display = "none";
  }
  function handleCollision2() {
    eggs2.forEach((egg) => {
      let basketX2 = basketPosition === "left" ? canvasPCWidth * 0.25 : canvasPCWidth * 0.75;
      if (egg.y > canvasPCHeight - basketPCHeight - 50 && egg.x > basketX2 - basketPCWidth / 2 && egg.x < basketX2 + basketPCWidth / 2) {
        const properties = colorProperties2[egg.color];
        score3 += properties.score;
        updateScoreDisplay2();
        if (properties.gameOver) {
          endGame2(false);
        }
        flashes.push({
          x: egg.x,
          y: egg.y,
          alpha: 1,
          // Прозрачность вспышки
          text: properties.score,
          // Значение для отображения
          textAlpha: 1,
          // Прозрачность текста
          textOffsetX: 60,
          // Смещение текста по X относительно вспышки
          textOffsetY: 0,
          // Смещение текста по Y
          textDuration: 150
          // Длительность отображения текста
        });
        eggs2 = eggs2.filter((e) => e !== egg);
      }
    });
  }
  function updateScoreDisplay2() {
    document.getElementById("scoreValue").textContent = score3;
  }
  function addEgg() {
    if (gameOver2) return;
    const fromLeft = Math.random() > 0.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const startX = fromLeft ? 70 : canvasPCWidth - 65;
    const startY = 265;
    eggs2.push({
      x: startX,
      y: startY,
      startX,
      // Сохраняем начальную позицию по X
      startY,
      // Сохраняем начальную позицию по Y
      color,
      fromLeft,
      time: 0,
      // Время траектории
      rotationSpeed: Math.random() * 2 + 1
      // Случайная скорость вращения
    });
  }
  document.addEventListener("keydown", (event) => {
    if (gameOver2) return;
    if (event.key === "ArrowLeft") {
      basketPosition = "left";
    } else if (event.key === "ArrowRight") {
      basketPosition = "right";
    }
  });
  function timerDisplay2(state) {
    document.getElementById("timer").style.display = state;
    document.getElementById("seconds").textContent = gameDuration2;
  }
  function activateOrientationCheck() {
    if (isElementVisible("gameContainer")) {
      window.addEventListener("orientationchange", checkOrientation);
      checkOrientation();
    } else {
      window.removeEventListener("orientationchange", checkOrientation);
    }
  }
  setInterval(activateOrientationCheck, 1e3);

  // src/slotMachine.js
  var canvasSlot = document.getElementById("slotCanvas");
  var ctxSlot = canvasSlot.getContext("2d");
  var columnCount = 4;
  var ballsPerColumn = 10;
  var ballRadius = 30;
  var columnWidth = canvasSlot.width / columnCount;
  var ballSpacing = 15;
  var isSpinning2 = false;
  var score4 = 0;
  var topMargin = 30;
  var bottomMargin = 35;
  var visibleBallCount = 3;
  var ballTotalHeight = ballRadius * 2 + ballSpacing;
  var highlightedColumns = [];
  var ballImageNames2 = [
    "blue_ball.png",
    "brown_ball.png",
    "yellow_ball.png",
    "indigo_ball.png",
    "orange_ball.png",
    "pink_ball.png"
  ];
  var columns = Array.from({ length: columnCount }, () => []);
  var speeds = Array(columnCount).fill(0);
  var slotBackground;
  var ballImages3 = [];
  function loadImages(callback) {
    let imagesLoaded = 0;
    slotBackground = new Image();
    slotBackground.src = "res/slotBg.png";
    slotBackground.onload = () => {
      imagesLoaded++;
      if (imagesLoaded === ballImageNames2.length) {
        callback();
      }
    };
    ballImageNames2.forEach((name, index) => {
      const img = new Image();
      img.src = `res/balls/${name}`;
      img.onload = () => {
        ballImages3[index] = img;
        imagesLoaded++;
        if (imagesLoaded === ballImageNames2.length) {
          callback();
        }
      };
    });
  }
  function activateOrientationCheck2() {
    ensureLandscapeOrientation();
    window.addEventListener("orientationchange", () => {
      ensureLandscapeOrientation();
      resizeCanvas(true);
    });
    window.addEventListener("resize", () => {
      ensureLandscapeOrientation();
      resizeCanvas(true);
    });
    if (isElementVisible("slotMachineContainer")) {
      checkOrientation();
    } else {
      window.removeEventListener("orientationchange", checkOrientation);
      window.removeEventListener("resize", checkOrientation);
    }
  }
  function ensureLandscapeOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight;
    const container = document.getElementById("slotMachineContainer");
    const canvas2 = document.getElementById("slotCanvas");
    if (isLandscape) {
      container.classList.remove("rotate");
      canvas2.classList.remove("rotate");
    } else {
      container.classList.add("rotate");
      canvas2.classList.add("rotate");
    }
  }
  function initSlotMachine() {
    ensureLandscapeOrientation();
    document.getElementById("slotMachineContainer").addEventListener("click", spin);
    resizeCanvas();
    setTimeout(() => {
      activateOrientationCheck2();
    }, 450);
    document.getElementById("spinSlotButton").addEventListener("click", spin);
    for (let col = 0; col < columnCount; col++) {
      for (let i = 0; i < ballsPerColumn; i++) {
        const ball = {
          imgIndex: i % ballImages3.length,
          imgName: ballImageNames2[i % ballImageNames2.length],
          // Сохраняем имя изображения
          y: i * ballTotalHeight
          // Располагаем шары за пределами видимой области
        };
        columns[col].push(ball);
      }
    }
    drawColumns();
    document.getElementById("currentBetSlot").textContent = bet;
    document.getElementById("scoreValueSlot").textContent = score4 || 0;
    checkFirstRun();
    document.getElementById("balanceValueSlot").textContent = localStorage.getItem("currentScore") || 0;
  }
  function drawColumns() {
    if (slotBackground.complete) {
      ctxSlot.clearRect(0, 0, canvasSlot.width, canvasSlot.height);
      ctxSlot.drawImage(slotBackground, 0, 0, canvasSlot.width, canvasSlot.height);
    }
    for (let col = 0; col < columnCount; col++) {
      const visibleStartY = topMargin;
      const visibleEndY = canvasSlot.height - bottomMargin;
      const isHighlighted = highlightedColumns.includes(col);
      for (let i = 0; i < ballsPerColumn; i++) {
        const ball = columns[col][i];
        if (ball && ball.imgIndex !== void 0 && ballImages3[ball.imgIndex]) {
          const img = ballImages3[ball.imgIndex];
          if (img.complete) {
            const x = col * columnWidth + columnWidth / 2 - ballRadius;
            const y = ball.y % (ballsPerColumn * ballTotalHeight) - ballRadius;
            const isVisible = y + ballRadius >= visibleStartY && y + ballRadius <= visibleEndY;
            ctxSlot.globalAlpha = isVisible ? 1 : 0;
            if (isHighlighted && isVisible) {
              ctxSlot.drawImage(ballImages3[ballImageNames2.length - 2], col * columnWidth, visibleStartY, columnWidth, visibleEndY - visibleStartY);
            }
            ctxSlot.drawImage(img, x, y, ballRadius * 2, ballRadius * 2);
            if (isHighlighted && isVisible) {
              ctxSlot.drawImage(ballImages3[ballImageNames2.length - 1], x, y, ballRadius * 2, ballRadius * 2);
            }
          }
        }
      }
    }
    ctxSlot.globalAlpha = 1;
  }
  function updateColumns() {
    for (let col = 0; col < columnCount; col++) {
      for (let i = 0; i < ballsPerColumn; i++) {
        columns[col][i].y += speeds[col];
      }
    }
  }
  function smoothStopOnLine(columnIndex) {
    const visibleHeight = canvasSlot.height - topMargin - bottomMargin;
    const ballTotalHeight2 = ballRadius * 2 + ballSpacing;
    const visibleBallHeight = ballTotalHeight2 * visibleBallCount;
    const column = columns[columnIndex];
    column.forEach((ball) => {
      const ballHeight = ballRadius * 2 + ballSpacing;
      let correctedY = ball.y - topMargin;
      correctedY = Math.floor(correctedY / ballHeight) * ballHeight + topMargin;
      ball.finalY = correctedY + topMargin;
    });
    let animationFrame = 0;
    const maxFrames = 30;
    const animationInterval = 1e3 / 60;
    const animation = setInterval(() => {
      animationFrame++;
      const progress = animationFrame / maxFrames;
      if (progress >= 1) {
        clearInterval(animation);
        columns[columnIndex].forEach((ball) => {
          ball.y = ball.finalY;
        });
        drawColumns();
        return;
      }
      columns[columnIndex].forEach((ball) => {
        ball.y = ball.y + (ball.finalY - ball.y) * progress;
      });
      drawColumns();
    }, animationInterval);
  }
  function getVisibleBallsInSecondLine() {
    const ballHeight = ballRadius * 2 + ballSpacing;
    const secondLineY = topMargin + ballHeight;
    const visibleStartY = topMargin;
    const visibleEndY = canvasSlot.height - bottomMargin;
    const ballCounts = {};
    const ballNames = {};
    for (let col = 0; col < columnCount; col++) {
      const ballsInColumn = columns[col];
      const visibleBalls = ballsInColumn.filter((ball) => {
        const y = ball.y % (ballsPerColumn * ballTotalHeight) - ballRadius;
        return y >= secondLineY - ballRadius && y <= secondLineY + ballRadius && y + ballRadius >= visibleStartY && y - ballRadius <= visibleEndY;
      });
      visibleBalls.forEach((ball) => {
        const ballName = ball.imgName;
        if (ballCounts[ballName]) {
          ballCounts[ballName]++;
        } else {
          ballCounts[ballName] = 1;
        }
        if (!ballNames[col]) {
          ballNames[col] = [];
        }
        ballNames[col].push(ballName);
      });
    }
    return { ballCounts, ballNames };
  }
  function calculateMultiplier(ballCounts) {
    let multiplier = 0;
    Object.values(ballCounts).forEach((count) => {
      if (count >= 2) {
        switch (count) {
          case 2:
            multiplier += 0.75;
            break;
          case 3:
            multiplier += 1.5;
            break;
          case 4:
            multiplier += 2;
            break;
        }
      }
    });
    if (multiplier > 0 && ballCounts["pink_ball.png"]) {
      multiplier *= 3;
    }
    return multiplier;
  }
  function displayResult(ballNames, multiplier) {
    if (multiplier > 0) {
      console.log("You win! Multiplier:", multiplier);
    } else {
      console.log("You lose.");
    }
    Object.entries(ballNames).forEach(([col, names]) => {
      console.log(`Column ${parseInt(col) + 1}: ${names.join(", ")}`);
    });
  }
  function endGame3() {
    const { ballCounts, ballNames } = getVisibleBallsInSecondLine();
    const multiplier = calculateMultiplier(ballCounts);
    displayResult(ballNames, multiplier);
  }
  function spin() {
    if (isSpinning2) return;
    isSpinning2 = true;
    speeds = Array(columnCount).fill(10);
    const stopDelays = [1e3, 1300, 1600, 1900];
    const animation = setInterval(() => {
      updateColumns();
      drawColumns();
    }, 1e3 / 60);
    stopDelays.forEach((delay, index) => {
      setTimeout(() => {
        speeds[index] = 0;
        smoothStopOnLine(index);
        if (index === columnCount - 1) {
          setTimeout(() => {
            clearInterval(animation);
            isSpinning2 = false;
            endGame3();
          }, 100);
        }
      }, delay);
    });
  }
  loadImages(initSlotMachine);
  function resizeCanvas(animate = false) {
    const isLandscape = window.innerWidth > window.innerHeight;
    const canvasWidth2 = isLandscape ? window.innerWidth * 0.75 : window.innerHeight * 0.75;
    const canvasHeight2 = isLandscape ? window.innerHeight * 0.7 : window.innerWidth * 0.7;
    if (animate && isSpinning2) {
      canvasSlot.classList.add("rotate");
    }
    canvasSlot.width = canvasWidth2;
    canvasSlot.height = canvasHeight2;
    columnWidth = canvasSlot.width / columnCount;
    ballRadius = canvasWidth2 / 20;
    drawColumns();
    if (animate && isSpinning2) {
      setTimeout(() => {
        canvasSlot.classList.remove("rotate");
      }, 500);
    }
  }

  // node_modules/@capacitor/screen-orientation/dist/esm/index.js
  init_dist();
  var ScreenOrientation = registerPlugin("ScreenOrientation", {
    web: () => Promise.resolve().then(() => (init_web(), web_exports)).then((m) => new m.ScreenOrientationWeb())
  });

  // src/main.js
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      await StatusBar.setBackgroundColor({ color: "transparent" });
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.show();
    } catch (error) {
      console.error("Error setting status bar:", error);
    }
  });
  var deposit = 1e3;
  var bet = 50;
  function saveScore(score5) {
    localStorage.setItem("currentScore", score5);
  }
  document.getElementById("homeButton").addEventListener(
    "click",
    () => navigateTo("mainPage")
  );
  document.getElementById("settingButton").addEventListener(
    "click",
    () => navigateTo("settingsPage")
  );
  document.getElementById("menuButton").addEventListener(
    "click",
    () => navigateTo("mainMenu")
  );
  document.getElementById("winMenuButton").addEventListener(
    "click",
    () => navigateTo("mainMenu")
  );
  document.getElementById("failMenuButton").addEventListener(
    "click",
    () => navigateTo("mainMenu")
  );
  document.getElementById("play").addEventListener(
    "click",
    () => startGame()
  );
  document.getElementById("playPC").addEventListener(
    "click",
    () => startGamePC()
  );
  document.getElementById("minusBet").addEventListener(
    "click",
    () => minusBet("currentBet")
  );
  document.getElementById("plusBet").addEventListener(
    "click",
    () => plusBet("currentBet")
  );
  document.getElementById("minusBetRoulette").addEventListener(
    "click",
    () => minusBet("currentBetRoulette")
  );
  document.getElementById("plusBetRoulette").addEventListener(
    "click",
    () => plusBet("currentBetRoulette")
  );
  document.getElementById("minusBetSlot").addEventListener(
    "click",
    () => minusBet("currentBetSlot")
  );
  document.getElementById("plusBetSlot").addEventListener(
    "click",
    () => plusBet("currentBetSlot")
  );
  function checkFirstRun() {
    const isFirstRun = localStorage.getItem("firstRun");
    if (!isFirstRun) {
      localStorage.setItem("firstRun", "false");
      localStorage.setItem("currentScore", deposit);
    }
  }
  function navigateTo(...args) {
    const overlay = document.getElementById("overlay");
    const preloader = document.getElementById("preloader");
    overlay.style.display = "block";
    preloader.style.display = "block";
    console.log(args);
    if (args[1] === void 0) {
      showHidePage(overlay, preloader, args[0]);
    } else {
      switch (args[1]) {
        case "bonus":
          navigateTo("mainPage");
          break;
        case "roulette":
          console.log("roulette");
          showHidePage(overlay, preloader, "rouletteContainer");
          setupRoulette();
          break;
        case "planetCatcher":
          navigateTo("mainPage");
          break;
        case "slotMachine":
          console.log("slotMachine");
          showHidePage(overlay, preloader, "slotMachineContainer");
          initSlotMachine();
          break;
        default:
          console.log("default");
          navigateTo("mainPage");
      }
    }
  }
  function showHidePage(overlay, preloader, page) {
    setTimeout(() => {
      document.querySelectorAll(".page").forEach((page2) => page2.style.display = "none");
      document.getElementById(page).style.display = "block";
      overlay.style.display = "none";
      preloader.style.display = "none";
    }, 400);
  }
  function minusBet(elementId) {
    let currentBet = parseInt(document.getElementById(elementId).innerText, 10);
    if (currentBet - 50 > 0 && deposit > currentBet - 50) {
      document.getElementById(elementId).textContent = currentBet - 50;
    } else {
      alert("The rate must be lower than your deposit.");
    }
  }
  function plusBet(elementId) {
    let currentBet = parseInt(document.getElementById(elementId).innerText, 10);
    if (deposit > currentBet + 50) {
      document.getElementById(elementId).textContent = currentBet + 50;
    } else {
      alert("The bet must not exceed your deposit.");
    }
  }
  function checkOrientation() {
    const orientationMessage = document.getElementById("orientationMessage");
    const slotMachineContainer = document.getElementById("slotMachineContainer");
    const gameContainer = document.getElementById("gameContainer");
  }
  function isElementVisible(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return false;
    let style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  // src/mainMenu.js
  document.addEventListener("DOMContentLoaded", () => {
    let isInitialLoad = true;
    const miniRocket = document.getElementById("miniRocket");
    const listItems = document.querySelectorAll(".levels li");
    function onElementVisible() {
      listItems.forEach((item) => {
        item.addEventListener("touchstart", addShineClass);
        item.addEventListener("touchend", removeShineClass);
        item.addEventListener("mouseover", addShineClass);
        item.addEventListener("mouseout", removeShineClass);
        item.addEventListener("click", () => {
          moveRocketToItem(item);
        });
      });
      miniRocket.style.top = "0";
      moveRocketToItem(listItems[listItems.length - 1]);
      isInitialLoad = false;
    }
    const element = document.getElementById("mainMenu");
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          if (element.style.display !== "none") {
            onElementVisible();
          }
        }
      }
    });
    const config = { attributes: true };
    observer.observe(element, config);
    function moveRocketToItem(item) {
      const rect = item.getBoundingClientRect();
      const rocketRect = miniRocket.getBoundingClientRect();
      const offsetX = 50;
      const offsetY = rect.top + rect.height / 2 - rocketRect.height / 2;
      miniRocket.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      listItems.forEach((li) => li.classList.remove("active"));
      item.classList.add("active");
      if (!isInitialLoad) {
        setTimeout(() => {
          const levelNumber = item.getAttribute("value");
          navigateTo("gameContainer", levelNumber);
          isInitialLoad = true;
        }, 250);
      }
    }
    function addShineClass(event) {
      event.currentTarget.classList.add("shinePlanet");
    }
    function removeShineClass(event) {
      event.currentTarget.classList.remove("shinePlanet");
    }
  });
  function activateOrientationCheck3() {
    if (isElementVisible("mainMenu")) {
      window.addEventListener("orientationchange", checkOrientation);
    } else {
      window.removeEventListener("orientationchange", checkOrientation);
    }
  }
  setInterval(activateOrientationCheck3, 1e3);
})();
/*! Bundled license information:

@capacitor/core/dist/index.js:
  (*! Capacitor: https://capacitorjs.com/ - MIT License *)
*/
