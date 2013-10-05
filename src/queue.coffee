# Queue - - - - - - - - - - - - - - - - - - - - - - - - - -

queue =
  VERSION: '0.0.2'

  forceSync: false
  _kill: false

  delayUpdate: (time, callback, context) ->
    @queueUpdate time, if context then callback.bind context else callback

  setTimeout: (time, callback) ->
    if @forceSync
      callback()
    else
      window.setTimeout callback, time

  kill: ->
    @_kill = true

  revive: ->
    @_kill = false

  queueUpdate: (delay, callback) ->
    pushCallback = =>
      thisQueue = @updateQueue[delay] ?= []
      thisQueue.push callback

    if @updateQueue
      pushCallback()
    else
      @updateQueue = {}
      pushCallback()
      @setTimeout 0, =>
        queue = @updateQueue
        @updateQueue = null

        for time, updateList of queue
          do (updateList, time) =>
            @setTimeout time, =>
              for options in updateList
                return if @_kill
                options.callback()

  batchUpdate: (timeout, callback, context) ->
    callback = callback.bind(context)  if context
    batchUpdate.push callback
    if batchUpdate.length < 2
      @setTimeout timeout, =>
        queue = batchUpdate
        batchUpdate = []
        for callback in queue
          @queueUpdate 0, callback

  next: (args...) ->
    @nextUpdate args...

  delay: (args...) ->
    @delayUpdate args...

  updateList: (array, context) ->
    if typeof array[0] is "function"
      @nextUpdate array.shift().bind context

    nextDelay = 0
    for item in array
      if typeof item is "number"
        nextDelay += item
      else if typeof item is "function"
        returnVal = @delayUpdate nextDelay++, item

    returnVal

  update: (args...) ->
    @updateList args...

  nextUpdate: (callback, context) ->
    @queueUpdate 0, if context then callback.bind context else callback


# Export - - - - - - - - - - - - - - - - - - - - - - - - - -

if typeof define is 'function' and define.amd
  define 'queue', queue
else if typeof module isnt 'undefined' and module.exports
  module.exports = queue
else
  @queue = queue
