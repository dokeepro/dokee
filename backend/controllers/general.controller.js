const General = require('../models/general.model');

const updateGeneral = async (req, res) => {
    let general = await General.findOne();
    if (!general) {
        general = new General();
    }
    Object.assign(general, req.body);
    await general.save();
    res.json(general);
};

module.exports = { updateGeneral };