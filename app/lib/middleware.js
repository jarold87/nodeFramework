module.exports.handleOnAborted = (err, req, res, next) => {
    if (err.code === 'ECONNABORTED') {
        return;
    }
    next(err);
};