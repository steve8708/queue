/* queue.js v0.0.2 */ 
(function() {
  var queue,
    __slice = [].slice;

  queue = {
    VERSION: '0.0.2',
    forceSync: false,
    _kill: false,
    delayUpdate: function(time, callback, context) {
      return this.queueUpdate(time, context ? callback.bind(context) : callback);
    },
    setTimeout: function(time, callback) {
      if (this.forceSync) {
        return callback();
      } else {
        return window.setTimeout(callback, time);
      }
    },
    kill: function() {
      return this._kill = true;
    },
    revive: function() {
      return this._kill = false;
    },
    queueUpdate: function(delay, callback) {
      var pushCallback,
        _this = this;
      pushCallback = function() {
        var thisQueue, _base;
        thisQueue = (_base = _this.updateQueue)[delay] != null ? (_base = _this.updateQueue)[delay] : _base[delay] = [];
        return thisQueue.push(callback);
      };
      if (this.updateQueue) {
        return pushCallback();
      } else {
        this.updateQueue = {};
        pushCallback();
        return this.setTimeout(0, function() {
          var time, updateList, _results;
          queue = _this.updateQueue;
          _this.updateQueue = null;
          _results = [];
          for (time in queue) {
            updateList = queue[time];
            _results.push((function(updateList, time) {
              return _this.setTimeout(time, function() {
                var options, _i, _len;
                for (_i = 0, _len = updateList.length; _i < _len; _i++) {
                  options = updateList[_i];
                  if (_this._kill) {
                    return;
                  }
                  options.callback();
                }
              });
            })(updateList, time));
          }
          return _results;
        });
      }
    },
    batchUpdate: function(timeout, callback, context) {
      var _this = this;
      if (context) {
        callback = callback.bind(context);
      }
      batchUpdate.push(callback);
      if (batchUpdate.length < 2) {
        return this.setTimeout(timeout, function() {
          var batchUpdate, _i, _len, _results;
          queue = batchUpdate;
          batchUpdate = [];
          _results = [];
          for (_i = 0, _len = queue.length; _i < _len; _i++) {
            callback = queue[_i];
            _results.push(_this.queueUpdate(0, callback));
          }
          return _results;
        });
      }
    },
    next: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.nextUpdate.apply(this, args);
    },
    delay: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.delayUpdate.apply(this, args);
    },
    updateList: function(array, context) {
      var item, nextDelay, returnVal, _i, _len;
      if (typeof array[0] === "function") {
        this.nextUpdate(array.shift().bind(context));
      }
      nextDelay = 0;
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        item = array[_i];
        if (typeof item === "number") {
          nextDelay += item;
        } else if (typeof item === "function") {
          returnVal = this.delayUpdate(nextDelay++, item);
        }
      }
      return returnVal;
    },
    update: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.updateList.apply(this, args);
    },
    nextUpdate: function(callback, context) {
      return this.queueUpdate(0, context ? callback.bind(context) : callback);
    }
  };

  if (typeof define === 'function' && define.amd) {
    define('queue', queue);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = queue;
  } else {
    this.queue = queue;
  }

}).call(this);
