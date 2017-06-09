var lupus = require('lupus');

/**
 * @param client
 * @constructor
 */
function MongoDbRepository (client) {
    this.client = client;
    this.log = 1;
}

MongoDbRepository.prototype = {

    addToErrorLog: function (method, err) {
        if (this.log === 1) {
            var msgPrefix = new Date().toISOString() + ' ';
            console.error(msgPrefix + '! ERROR detected in MongoDb Repository (' + method + ') !');
            console.log(msgPrefix + err.message);
        }
    },

    getConnectionNumber: function (callback) {
        var self = this;
        this.client.getConnection(function(err, db) {
            if (err) {
                self.addToErrorLog('getConnection', err);
                callback(true, 0);
            } else {
                var adminDb = db.admin();
                adminDb.serverStatus().then(function(r) {
                    db.close();
                    callback(false, r.connections.current);
                }).catch(function (err) {
                    db.close();
                    self.addToErrorLog('getConnectionNumber', err);
                    callback(true, 0);
                });
            }
        });
    },

    dropDatabase: function (callback) {
        var self = this;
        this.client.getConnection(function(err, db) {
            if (err) {
                self.addToErrorLog('getConnection', err);
                callback(true, false);
            } else {
                db.dropDatabase(function (err, r) {
                    db.close();
                    if (err) {
                        self.addToErrorLog('dropDatabase', err);
                        return callback(true, false);
                    }
                    callback(false, true);
                });
            }
        });
    },

    getCollectionNames: function (callback) {
        var self = this;
        this.client.getConnection(function(err, db) {
            if (err) {
                self.addToErrorLog('getConnection', err);
                callback(true, []);
            } else {
                db.collections().then(function(l) {
                    db.close();
                    var d = [];
                    lupus(0, l.length, function (i) {
                        d.push(l[i]['s']['name']);
                    }, function () {
                        callback(false, d);
                    });
                }).catch(function (err) {
                    db.close();
                    self.addToErrorLog('getCollectionNames', err);
                    callback(true, []);
                });
            }
        });
    },

    indexExists: function (collection, indexName, callback) {
        var self = this;
        this.client.getConnection(function(err, db) {
            if (err) {
                self.addToErrorLog('getConnection', err);
                callback(true, false);
            } else {
                db.collection(collection)
                    .indexExists(indexName, function(err, ret) {
                        db.close();
                        if (err) {
                            self.addToErrorLog('indexExists', err);
                            return callback(true, false);
                        }
                        callback(false, ret);
                    });
            }
        });
    },

    /**
     * @param collection
     * @param index | [{ "key": { "date": 1 }, "name": "date" }]
     * @param callback
     */
    setIndex: function (collection, index, callback) {
        var self = this;
        this.client.getConnection(function(err, db) {
            if (err) {
                self.addToErrorLog('getConnection', err);
                callback(true, false);
            } else {
                db.collection(collection)
                    .createIndexes(index, function(err, ret) {
                        db.close();
                        if (err) {
                            self.addToErrorLog('setIndex', err);
                            return callback(true, false);
                        }
                        callback(false, true);
                    });
            }
        });
    },

    insert: function (document, collection, callback) {
        var self = this;
        this.client.getConnection(function(err, db) {
            if (err) {
                self.addToErrorLog('getConnection', err);
                callback(true, false);
            } else {
                db.collection(collection)
                    .insertOne(document, function(err) {
                        db.close();
                        if (err) {
                            self.addToErrorLog('insert', err);
                            return callback(true, false);
                        }
                        callback(false, true);
                    });
            }
        });
    },

    insertMany: function (documents, collection, callback) {
        var self = this;
        this.client.getConnection(function(err, db) {
            if (err) {
                self.addToErrorLog('getConnection', err);
                callback(true, false);
            } else {
                db.collection(collection)
                    .insertMany(documents, function(err) {
                        db.close();
                        if (err) {
                            self.addToErrorLog('insertMany', err);
                            return callback(true, false);
                        }
                        callback(false, true);
                    });
            }
        });
    },

    update: function(document, collection, key, value, callback) {
        var self = this;
        var query = {};
        query[key] = value;
        this.client.getConnection(function(err, db) {
            if (err) {
                self.addToErrorLog('getConnection', err);
                callback(true, false);
            } else {
                db.collection(collection).findOneAndUpdate(query, document)
                    .then(function() {
                        db.close();
                        callback(false, true);
                    }).catch(function (err) {
                    db.close();
                    self.addToErrorLog('update', err);
                    callback(true, false);
                });
            }

        });
    },

    upsert: function (collection, filter, update, callback) {
        var self = this;
        this.client.getConnection(function(err, db) {
            if (err) {
                self.addToErrorLog('getConnection', err);
                callback(true, false, null);
            } else {
                db.collection(collection)
                    .update(filter, update, { upsert: true }, function(err, d) {
                        db.close();
                        if (err) {
                            self.addToErrorLog('upsert', err);
                            callback(true, false, null);
                        } else {
                            callback(false, true, d);
                        }
                    });
            }

        });
    },

    find: function (collection, query, skip, limit, callback) {
        var self = this;
        this.client.getConnection(function(err, db) {
            if (err) {
                self.addToErrorLog('getConnection', err);
                callback(true, []);
            } else {
                db.collection(collection)
                    .find(query)
                    .skip(skip)
                    .limit(limit)
                    .toArray()
                    .then(function(r) {
                        db.close();
                        callback(false, r);
                    }).catch(function (err) {
                    db.close();
                    self.addToErrorLog('find', err);
                    callback(true, []);
                });
            }
        })
    },

    selectedFind: function (collection, query, select, skip, limit, callback) {
        var self = this;
        this.client.getConnection(function(err, db) {
            if (err) {
                self.addToErrorLog('getConnection', err);
                callback(true, []);
            } else {
                db.collection(collection)
                    .find(query, select)
                    .skip(skip)
                    .limit(limit)
                    .toArray()
                    .then(function(r) {
                        db.close();
                        callback(false, r);
                    }).catch(function (err) {
                    db.close();
                    self.addToErrorLog('selectedFind', err);
                    callback(true, []);
                });
            }
        })
    },

    sortedFind: function (collection, query, skip, limit, sort, callback) {
        var self = this;
        this.client.getConnection(function(err, db) {
            if (err) {
                self.addToErrorLog('getConnection', err);
                callback(true, []);
            } else {
                db.collection(collection)
                    .find(query)
                    .skip(skip)
                    .limit(limit)
                    .sort(sort)
                    .toArray()
                    .then(function(r) {
                        db.close();
                        callback(false, r);
                    }).catch(function (err) {
                    db.close();
                    self.addToErrorLog('sortedFind', err);
                    callback(true, []);
                });
            }
        })
    },

    selectedAndSortedFind: function (collection, query, select, skip, limit, sort, callback) {
        var self = this;
        this.client.getConnection(function(err, db) {
            if (err) {
                self.addToErrorLog('getConnection', err);
                callback(true, []);
            } else {
                db.collection(collection)
                    .find(query, select)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .toArray()
                    .then(function(r) {
                        db.close();
                        callback(false, r);
                    }).catch(function (err) {
                    db.close();
                    self.addToErrorLog('selectedAndSortedFind', err);
                    callback(true, []);
                });
            }
        })
    },

    count: function(collection, query, callback) {
        var self = this;
        this.client.getConnection(function(err, db) {
            if (err) {
                self.addToErrorLog('getConnection', err);
                callback(true, 0);
            } else {
                db.collection(collection)
                    .count(query, function(err, d) {
                        db.close();
                        if (err) {
                            self.addToErrorLog('count', err);
                            callback(true, 0);
                        }
                        callback(false, d);
                    });
            }
        })
    },

    dbList: function (callback) {
        var self = this;
        this.client.getConnection(function(err, db) {
            if (err) {
                self.addToErrorLog('getConnection', err);
                callback(true, []);
            } else {
                var adminDb = db.admin();
                adminDb.listDatabases().then(function(dbs) {
                    db.close();
                    if (
                        !dbs || !Object.keys(dbs).length
                        || Object.keys(dbs).indexOf('databases') < 0 || !dbs.databases.length
                    ) {
                        return callback(true, []);
                    }
                    var d = [];
                    lupus(0, dbs.databases.length, function (i) {
                        if (
                            dbs.databases[i].name !== 'admin'
                            && dbs.databases[i].name !== 'config'
                        ) {
                            d.push(dbs.databases[i].name);
                        }
                    }, function () {
                        callback(false, d);
                    });
                }).catch(function (err) {
                    db.close();
                    self.addToErrorLog('dblist', err);
                    callback(true, []);
                });
            }
        });
    },

    truncate: function(collection, callback) {
        var self = this;
        this.client.getConnection(function(err, db) {
            if (err) {
                self.addToErrorLog('getConnection', err);
                callback(true, false);
            } else {
                db.collection(collection)
                    .deleteMany({})
                    .then(function() {
                        db.close();
                        callback(false, true);
                    }).catch(function (err) {
                    db.close();
                    self.addToErrorLog('truncate', err);
                    callback(true, false);
                });
            }
        })
    },

    removeMany: function(collection, query, callback) {
        var self = this;
        this.client.getConnection(function(err, db) {
            if (err) {
                self.addToErrorLog('getConnection', err);
                callback(true, false);
            } else {
                db.collection(collection)
                    .deleteMany(query)
                    .then(function() {
                        db.close();
                        callback(false, true);
                    }).catch(function (err) {
                    db.close();
                    self.addToErrorLog('truncate', err);
                    callback(true, false);
                });
            }
        })
    },

    distinct: function (collection, field, query, callback) {
        var self = this;
        this.client.getConnection(function(err, db) {
            if (err) {
                self.addToErrorLog('getConnection', err);
                callback(true, []);
            } else {
                db.collection(collection)
                    .distinct(field, query, {}, function (err, d) {
                        db.close();
                        if (err) {
                            self.addToErrorLog('distinct', err);
                            return callback(true, []);
                        }
                        callback(false, d);
                    });
            }
        })
    }

};

module.exports = MongoDbRepository;