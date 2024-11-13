const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('classroom', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
    });
}