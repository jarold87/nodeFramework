/**
 * @param client
 * @constructor
 */
function MongoDbRepository (client) {
    this.client = client;
    this.errors = [];
}

MongoDbRepository.prototype = {

    indexExists: function (collection, indexName, callback) {
        this.client.getConnection(function(err, db) {
            if (err) {
                console.log(err);
                callback();
            } else {
                db.collection(collection)
                    .indexExists(indexName, function(err, ret) {
                        db.close();
                        if (err) {
                            return callback(err, ret);
                        }
                        callback(null, ret);
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
        this.client.getConnection(function(err, db) {
            if (err) {
                console.log(err);
                callback();
            } else {
                db.collection(collection)
                    .createIndexes(index, function(err, ret) {
                        db.close();
                        if (err) {
                            return callback(err, ret);
                        }
                        callback(null, ret);
                    });
            }
        });
    },

    insert: function (document, collection, callback) {
        this.client.getConnection(function(err, db) {
            if (err) {
                console.log(err);
                callback();
            } else {
                db.collection(collection)
                    .insertOne(document, function(err) {
                        db.close();
                        if (err) {
                            return callback(false);
                        }
                        callback(true);
                    });
            }
        });
    },

    insertMany: function (documents, collection, callback) {
        this.client.getConnection(function(err, db) {
            if (err) {
                console.log(err);
                callback();
            } else {
                db.collection(collection)
                    .insertMany(documents, function(err) {
                        db.close();
                        if (err) {
                            console.log(err);
                            return callback(false);
                        }
                        callback(true);
                    });
            }
        });
    },

    update: function(document, collection, key, value, callback) {
        var query = {};
        query[key] = value;
        this.client.getConnection(function(err, db) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                db.collection(collection)
                    .findOneAndUpdate(query, document, function(err, d) {
                        db.close();
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            callback(null, d);
                        }
                    });
            }

        });
    },

    selectedFind: function (collection, query, select, skip, limit, callback) {
        this.client.getConnection(function(err, db) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                db.collection(collection)
                    .find(query, select)
                    .skip(skip)
                    .limit(limit)
                    .toArray(function(err, d) {
                        db.close();
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            callback(null, d);
                        }
                    });
            }
        })
    },

    find: function (collection, query, skip, limit, callback) {
        this.client.getConnection(function(err, db) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                db.collection(collection)
                    .find(query)
                    .skip(skip)
                    .limit(limit)
                    .toArray(function(err, d) {
                        db.close();
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            callback(null, d);
                        }
                    });
            }
        })
    },

    sortedFind: function (collection, query, skip, limit, sort, callback) {
        this.client.getConnection(function(err, db) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                db.collection(collection)
                    .find(query)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .toArray(function(err, d) {
                        db.close();
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            callback(null, d);
                        }
                    });
            }
        })
    },

    selectedAndSortedFind: function (collection, query, select, skip, limit, sort, callback) {
        this.client.getConnection(function(err, db) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                db.collection(collection)
                    .find(query, select)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .toArray(function(err, d) {
                        db.close();
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            callback(null, d);
                        }
                    });
            }
        })
    },

    distinct: function (collection, field, query, callback) {
        this.client.getConnection(function(err, db) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                db.collection(collection)
                    .distinct(field, query, {}, function (err, d) {
                        db.close();
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            callback(null, d);
                        }
                    });
            }
        })
    },

    count: function(collection, query, callback) {
        this.client.getConnection(function(err, db) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                db.collection(collection)
                    .count(query, function(err, d) {
                        db.close();
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            callback(null, d);
                        }
                    });
            }
        })
    },

    dbList: function (callback) {
        this.client.getConnection(function(err, db) {
            var adminDb = db.admin();
            adminDb.listDatabases().then(function(dbs) {
                db.close();
                callback(dbs);
            });
        });
    },

    truncate: function(collection, callback) {
        this.removeMany(collection, {},
            function(r) {
                callback(r);
            }
        );
    },

    removeMany: function(collection, query, callback) {
        this.client.getConnection(function(err, db) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                db.collection(collection)
                    .deleteMany(query, function(err, d) {
                        db.close();
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            callback(null, d);
                        }
                    });
            }
        })
    }

};

module.exports = MongoDbRepository;