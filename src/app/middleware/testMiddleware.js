module.exports = (req, res, next) => {
    console.log('mw');
    next();
};