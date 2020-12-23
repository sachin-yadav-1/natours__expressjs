const Tour = require('../models/tourModel');
const factory = require('./handlerFactory');

// ROUTE HANDLERS
exports.createNewTour = factory.createOne(Tour);
exports.getAllTours = factory.getAll(Tour);
exports.getOneTour = factory.getOne(Tour);
exports.updateOneTour = factory.updateOne(Tour);
exports.deleteOneTour = factory.deleteOne(Tour);
