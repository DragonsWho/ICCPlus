// This line creates a new scope for the code, preventing variable name collisions with other scripts.
// It also passes in the global object (window in browsers) as "e" for efficiency.
(function(global) {
  // A queue to store the IDs of modules that are waiting to be loaded.
  var modulesToLoad = [];

  // This object keeps track of the loading status of each chunk.
  //  - undefined: The chunk hasn't started loading yet.
  //  - [resolve, reject]: The chunk is currently being loaded.
  //  - 0: The chunk has been successfully loaded.
  var chunkLoadingStatus = {
    app: 0 // The main "app" chunk is already loaded.
  };

  // A dictionary to store loaded modules, using module IDs as keys.
  var loadedModules = {};

  /**
   * This function is called by webpack to load a chunk.
   *
   * @param {Array} chunkData An array containing:
   *   - An array of module IDs required by this chunk.
   *   - An object containing factories for the chunk's modules.
   *   - An array of chunk IDs this chunk depends on.
   * @returns {Promise} A promise that resolves when the chunk and its dependencies are loaded.
   */
  function loadChunk(chunkData) {
    var moduleIds = chunkData[0];
    var moduleFactories = chunkData[1];
    var chunkDependencies = chunkData[2];

    var resolvedModules = [];

    // Iterate over the module IDs required by this chunk.
    for (var i = 0; i < moduleIds.length; i++) {
      var moduleId = moduleIds[i];

      // Check if the module is already loaded.
      if (chunkLoadingStatus.hasOwnProperty(moduleId) && chunkLoadingStatus[moduleId]) {
        // If loaded, add its resolve function to the queue and mark it as loaded.
        resolvedModules.push(chunkLoadingStatus[moduleId][0]);
        chunkLoadingStatus[moduleId] = 0;
      }
    }

    // Add the module factories to the global scope.
    for (var moduleId in moduleFactories) {
      if (moduleFactories.hasOwnProperty(moduleId)) {
        global[moduleId] = moduleFactories[moduleId];
      }
    }

    // Call the webpack runtime callback if it's defined.
    if (typeof p === 'function') {
      p(chunkData);
    }

    // Resolve all module promises in the queue.
    while (resolvedModules.length > 0) {
      resolvedModules.shift()();
    }

    // Add this chunk's dependencies to the loading queue.
    modulesToLoad.push.apply(modulesToLoad, chunkDependencies || []);

    // Load the next chunk in the queue and return the promise.
    return loadNextChunk();
  }

  /**
   * Loads the next available chunk from the queue.
   *
   * @returns {Promise} A promise that resolves when the next chunk is loaded.
   */
  function loadNextChunk() {
    var promise;

    // Iterate through the modules to load.
    for (var i = 0; i < modulesToLoad.length; i++) {
      var chunkId = modulesToLoad[i];
      var isChunkReady = true;

      // Check if all dependencies for this chunk are loaded.
      for (var j = 1; j < chunkId.length; j++) {
        var dependencyId = chunkId[j];
        if (chunkLoadingStatus[dependencyId] !== 0) {
          isChunkReady = false;
          break;
        }
      }

      // If the chunk is ready, remove it from the queue and load it.
      if (isChunkReady) {
        modulesToLoad.splice(i--, 1);
        promise = loadModule(loadModule.s = chunkId[0]);
        break;
      }
    }

    // Return the promise, or undefined if no chunk is ready to load yet.
    return promise;
  }

  /**
   * Constructs the path to a chunk file.
   *
   * @param {string} chunkName The name of the chunk.
   * @returns {string} The path to the chunk file.
   */
  function getChunkPath(chunkName) {
    var chunkMap = {
      "chunk-2d0e6102": "09695d49"
    };
    var chunkHash = chunkMap[chunkName] || chunkName;
    return "js/" + chunkHash + ".js";
  }

  /**
   * Loads a module by its ID.
   *
   * @param {string} moduleId The ID of the module to load.
   * @returns {object} The exports of the loaded module.
   */
  function loadModule(moduleId) {
    // Check if the module is already loaded.
    if (loadedModules[moduleId]) {
      return loadedModules[moduleId].exports;
    }

    // Create a new module object.
    var module = loadedModules[moduleId] = {
      i: moduleId, // Module ID
      l: false, // Loaded flag
      exports: {} // Exports object
    };

    // Call the module factory function to execute the module code.
    global[moduleId].call(module.exports, module, module.exports, loadModule);

    // Mark the module as loaded.
    module.l = true;

    // Return the module exports.
    return module.exports;
  }

  // Define properties and methods on the loadModule function, which acts as the webpack runtime.
  loadModule.e = function(chunkId) {
    // This function is used to load a chunk on demand.
    var promises = [];
    var chunkStatus = chunkLoadingStatus[chunkId];

    // If the chunk is not loaded:
    if (chunkStatus !== 0) {
      if (chunkStatus) {
        // If the chunk is being loaded, add its promise to the list.
        promises.push(chunkStatus[2]);
      } else {
        // Otherwise, create a new promise and start loading the chunk.
        var promise = new Promise((resolve, reject) => {
          chunkLoadingStatus[chunkId] = [resolve, reject];
        });
        promises.push(chunkStatus[2] = promise);

        // Create a script tag to load the chunk.
        var script = document.createElement('script');
        script.charset = 'utf-8';
        script.timeout = 120;
        if (loadModule.nc) {
          script.setAttribute('nonce', loadModule.nc);
        }
        script.src = getChunkPath(chunkId);

        // Handle loading errors.
        var onError = function(event) {
          script.onerror = script.onload = null;
          clearTimeout(timeout);
          var error = new Error('Loading chunk ' + chunkId + ' failed.\n(' + event.type + ': ' + script.src + ')');
          error.name = 'ChunkLoadError';
          error.type = event.type;
          error.request = script.src;
          chunkStatus[1](error);
          chunkLoadingStatus[chunkId] = undefined;
        };

        // Set a timeout to handle cases where the chunk takes too long to load.
        var timeout = setTimeout(function() {
          onError({
            type: 'timeout',
            target: script
          });
        }, 120000);

        // Attach event listeners for load and error events.
        script.onerror = script.onload = onError;

        // Append the script tag to the head of the document to start loading the chunk.
        document.head.appendChild(script);
      }
    }

    // Return a promise that resolves when all promises in the list are resolved.
    return Promise.all(promises);
  };

  // Set up the webpack runtime.
  loadModule.m = global; // Modules are stored in the global scope.
  loadModule.c = loadedModules; // Access to loaded modules.
  loadModule.d = function(exports, name, getter) {
    // Define a getter function for a property on an export object.
    if (!loadModule.o(exports, name)) {
      Object.defineProperty(exports, name, {
        enumerable: true,
        get: getter
      });
    }
  };
  loadModule.r = function(exports) {
    // Mark an object as a module with default export.
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, {
        value: 'Module'
      });
    }
    Object.defineProperty(exports, '__esModule', {
      value: true
    });
  };
  loadModule.t = function(value, mode) {
    // This function is used to load modules in different modes.
