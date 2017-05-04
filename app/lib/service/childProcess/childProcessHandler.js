var ChildProcess = {};
var events = require('events');
var cp = require('child_process');

ChildProcess.Property = {
    childLimit: 10,
    env: null,
    port: null,
    children: [],
    childWorker: null,
    bootstrap: null,
    emitters: [],
    history: []
};

ChildProcess.Create = {

    setEnv: function(env) {
        ChildProcess.Property.env = env;
    },

    setPort: function(port) {
        ChildProcess.Property.port = port;
    },

    setChildWorker: function(childWorker) {
        ChildProcess.Property.childWorker = childWorker
    },

    setBootstrapScript: function(script) {
        ChildProcess.Property.bootstrap = script;
    }

};

ChildProcess.Private = {

    getChild: function(taskId, callback) {
        var key = 0;
        if (!ChildProcess.Property.children.length || ChildProcess.Property.children.length < ChildProcess.Property.childLimit) {
            key = this.createChild(taskId);
        } else {
            key = this.getNextChild(taskId);
        }
        callback(key, ChildProcess.Property.children[key].child);
    },

    getNextChild: function(taskId) {
        if (!ChildProcess.Property.children[0]) {
            return this.createChild(taskId);
        }
        var next = { key: 0, value: ChildProcess.Property.children[0].tasks.length };
        for (var i = 1; i < ChildProcess.Property.children.length; i++) {
            if (ChildProcess.Property.children[i].tasks.length < next.value) {
                next = { key: i, value: ChildProcess.Property.children[i].tasks.length };
            }
        }
        ChildProcess.Property.children[next.key].tasks.push(taskId);
        return next.key;
    },

    createChild: function(taskId) {
        var nextKey = ChildProcess.Property.children.length;
        var child = cp.fork(ChildProcess.Property.childWorker);
        child.on('message', function(data) {
            child.kill();
            ChildProcess.Private.emit(data);
        });
        child.on('close', function () {
            delete ChildProcess.Property.children[nextKey];
        });
        ChildProcess.Property.children.push({
            child: child,
            tasks: [taskId]
        });
        return nextKey;
    },

    addEmitter: function(taskId, emitter, info) {
        ChildProcess.Property.emitters[taskId] = emitter;
        this.addHistory(taskId, 'start: ' + info);
    },

    emit: function(data) {
        var childKey = data.childKey;
        var taskId = data.taskId;
        if(ChildProcess.Property.emitters[taskId]) {
            this.addHistory(taskId, 'finish');
            if (data.result === false) {
                this.addHistory(taskId, 'ERROR');
                ChildProcess.Property.emitters[taskId].emit('error', data);
            }
            ChildProcess.Property.emitters[taskId].emit('get', data);
            ChildProcess.Property.emitters[taskId].removeAllListeners();
            delete ChildProcess.Property.emitters[taskId];
            ChildProcess.Property.children[childKey].tasks.splice(
                ChildProcess.Property.children[childKey].tasks.indexOf(taskId),
                1
            );
        }
    },

    addHistory: function(taskId, event) {
        var history = {
            taskId: taskId,
            event: event,
            time: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
        };
        ChildProcess.Property.history.push(history);
        if (Object.keys(ChildProcess.Property.history).length > 100) {
            delete history[Object.keys(ChildProcess.Property.history)[0]];
        }
    },

    getHistory: function() {
        return ChildProcess.Property.history;
    }

};

ChildProcess.Public = {

    runChildProcessScript: function(script, args, info, callback) {
        var emitter = new events.EventEmitter();
        var taskId = Math.random();
        ChildProcess.Private.addEmitter(taskId, emitter, info);
        ChildProcess.Private.getChild(taskId, function(childKey, child) {
            child.send(
                {
                    env: ChildProcess.Property.env,
                    port: ChildProcess.Property.port,
                    bootstrap: ChildProcess.Property.bootstrap,
                    childKey: childKey,
                    taskId: taskId,
                    script: script,
                    args: args
                }
            );
        });
        callback(emitter);
    },

    getHistory: function() {
        return ChildProcess.Property.history;
    },

    logChildren: function() {
        for (var i = 0; i < ChildProcess.Property.children.length; i++) {
            console.log(
                i + ' | ' +
                ChildProcess.Property.children[i].tasks.toString()
            );
        }
    }

};

Object.preventExtensions(ChildProcess.Public);

module.exports = ChildProcess;