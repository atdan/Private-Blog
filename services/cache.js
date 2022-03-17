const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')
const keys = require('../config/keys')
// const redisUrl = 'redis://127.0.0.1:6379'

const client = redis.createClient(keys.redisUrl)
client.hGet = util.promisify(client.hGet)
const exec = mongoose.Query.prototype.exec;

// Use options to make it reusable
mongoose.Query.prototype.cache = function (options = {}){
    this.useCache = true;
    // Handle case if a key is  not passed
    this.hashKey = JSON.stringify(options.key || '');
    // To make sure it's chainable
    return this;
}

mongoose.Query.prototype.exec = async function () {
    if (!this.useCache){
        console.log('this.useCache = false')
        return await exec.apply(this, arguments)
    }
    console.log('this.useCache = true')

    //To not modify the content of getQuery
    const key = JSON.stringify(
        Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name
        })
    );

    console.log('key')
    console.log(key)
    // See if we have a value for "key" in redis
    const cacheValue = await client.hGet(this.hashKey, key);

    // If we do, return that
    if (cacheValue) {
        const doc = JSON.parse(cacheValue)

        console.log('Coming from cache')
        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc)
    }

    console.log('Coming from mongo')
    // Otherwise, issue the query and store the result in redis
    const result = await exec.apply(this, arguments);
    client.hSet(this.hashKey,key, JSON.stringify(result), 'EX', 10)
    return result;
}

module.exports = {
    // to clear cache for a user
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}
