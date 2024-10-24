const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

class Barrio extends Model {}
Barrio.init(
    {
        barrio_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize: sequelize,
        modelName: 'Barrio'
    }
)

console.log(Barrio === sequelize.models.Barrio); // true

module.exports = Barrio;
