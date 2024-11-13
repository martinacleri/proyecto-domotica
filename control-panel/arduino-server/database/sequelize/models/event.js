// Este modelo almacenará los registros de los cambios de estado para las luces y las persianas, así como la detección de presencia.

const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('event', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            mode: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            lights: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            shutters: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            timestamp: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            scheduleEndTime: {
                type: DataTypes.DATE,
                allowNull: true,
            }
    });
}
