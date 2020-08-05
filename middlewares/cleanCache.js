const {clearHash} = require('../services/cache')
// dump cache only after the request is run
module.exports = async (req, res, next) => {

    await next()

    clearHash(req.user.id)
}
