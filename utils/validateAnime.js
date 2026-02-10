const Joi = require('joi');

const validateAnime = (data) => {
    const schema = Joi.object({
        title: Joi.string().min(1).max(100).required(),
        status: Joi.string().valid('Watching', 'Completed', 'Plan to Watch'),
        rating: Joi.number().min(1).max(10),
        episodesWatched: Joi.number().min(0)
    });
    return schema.validate(data);
};

module.exports = validateAnime;