const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('user', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            surName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
    });
}