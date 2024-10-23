const { DataTypes, Model } = require('sequelize');
const { sequelizeConnection } = require('../middleware/sequelizeConnection')

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
        sequelizeConnection,
        modelName: 'Barrio'
    }
)

module.exports = Barrio;
