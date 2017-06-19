module.exports = (container) => {
    return (req, res, next) => {
        console.log(container.getEnv());
        next();
    };
};