const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// CREATE ONE DOCUMENT
// @param {Model}: Model name for which the document will be created
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'sucess',
      data: {
        newDoc,
      },
    });
  });

// GET ALL DOCUMENTS
// @param {Model}: Model name for which the document will be created
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.param.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sorting()
      .limitFields()
      .paginateResults();

    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        docs,
      },
    });
  });

// GET ONE DOCUMENT
// @param {Model}: Model name for which the document will be created
exports.getOne = (Model, popOtions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOtions) query = query.populate(popOtions);

    const doc = await query;
    if (!doc) return next(new AppError('No document found for this id!', 400));

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

// UPDATE ONE DOCUMENT
// @param {Model}: Model name for which the document will be created
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body);
    if (!doc) return next(new AppError('No document found for this id!', 400));

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

// DELETE ONE DOCUMENT
// @param {Model}: Model name for which the document will be created
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError('No document found for this id!', 400));

    res.status(200).json({
      status: 'success',
      data: [],
    });
  });
