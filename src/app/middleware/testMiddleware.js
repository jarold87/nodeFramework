module.exports = (container) => {
    return (req, res, next) => {
        console.log(container.getPort());
        next();
    };
};