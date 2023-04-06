const Sequelize = require('sequelize');

const sequelize = require('../../config/database');

const tableName = 'categories';

const Category = sequelize.define('Category', {
    name: {
        type: Sequelize.STRING,
        unique: false,
    },
    type: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: '0'
    },
    parent_id: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: '0'
    }
}, {
    tableName
});

// eslint-disable-next-line
Category.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    return values;
};

module.exports = Category;
