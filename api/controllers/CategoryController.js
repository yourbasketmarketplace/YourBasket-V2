const Category = require('../models/Category');

const CategoryController = () => {
    const create = async (req, res) => {
        // body is part of a form-data
        const {
            body
        } = req;

        try {
            const category = await Category.create({
                name: body.name
            });

            if (!category) {
                return res.status(400).json({
                    msg: 'Bad Request: Model not found'
                });
            }

            return res.status(200).json({
                category
            });
        } catch (err) {
            // better save it to log file
            console.error(err);

            return res.status(500).json({
                msg: 'Internal server error'
            });
        }
    };

    const getAll = async (req, res) => {
        try {
            const categories = await Category.findAll();
            return res.status(200).json({
                categories
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                msg: 'Internal server error'
            });
        }
    };

    const get = async (req, res) => {
        // params is part of an url
        const id = req.params.id;

        try {
            const category = await Category.findOne({
                where: {
                    id,
                },
            });

            if (!category) {
                return res.status(400).json({
                    msg: 'Bad Request: Model not found'
                });
            }

            return res.status(200).json({
                category
            });
        } catch (err) {
            // better save it to log file
            console.error(err);

            return res.status(500).json({
                msg: 'Internal server error'
            });
        }
    };


    const update = async (req, res) => {
        // params is part of an url
        const id = req.params.id;

        // body is part of form-data
        const {
            body
        } = req;

        try {
            const category = await Category.findById(id);

            if (!category) {
                return res.status(400).json({
                    msg: 'Bad Request: Model not found'
                });
            }

            const updatedCategory = await category.update({
                name: body.name,
            });

            return res.status(200).json({
                updatedCategory
            });

        } catch (err) {
            // better save it to log file
            console.error(err);

            return res.status(500).json({
                msg: 'Internal server error'
            });
        }
    };


    const destroy = async (req, res) => {
        // params is part of an url
        const id = req.params.id;

        try {
            const category = Category.findById(id);

            if (!category) {
                return res.status(400).json({
                    msg: 'Bad Request: Model not found'
                })
            }

            await category.destroy();

            return res.status(200).json({
                msg: 'Successfully destroyed model'
            });
        } catch (err) {
            // better save it to log file
            console.error(err);

            return res.status(500).json({
                msg: 'Internal server error'
            });
        }
    };

    return {
        create,
        getAll,
        get,
        update,
        destroy
    };
}

module.exports = CategoryController;