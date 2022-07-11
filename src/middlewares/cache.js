const redisClient = require("../config/redis");
const catchAsync = require("../utils/catchAsync");
const logger = require("../config/logger");

const setCache = (seconds) =>
    catchAsync(async (req, res, next) => {
        // return next();
        if (req.query.cache == "false" || req.method !== "GET") return next();

        const data = await redisClient.get(req.originalUrl);
        if (data) {
            logger.info(`Cached ${req.originalUrl}`);
            res.send(JSON.parse(data));
        } else {
            const send = res.send.bind(res);

            // wrapper send response function
            res.send = function (body) {
                if (body && body instanceof Object)
                    redisClient.setEx(req.originalUrl, seconds, JSON.stringify(body));
                send(body);
            };
            next();
        }
    });

const deleteCache = catchAsync(async (req, res, next) => {
    if (req.query.cache == "false") return next();
    logger.info(`Delete ${req.originalUrl}`);
    await redisClient.del(req.originalUrl);
    next();
});

module.exports = { setCache, deleteCache };
