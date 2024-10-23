const { DataTypes, Model } = require('sequelize');
const { sequelizeConnection } = require('../middleware/sequelizeConnection')
const { Barrio } = require('Barrio')

class Estacion extends Model {
    devolverBici(bici) {
        let retiro = bici.getUltimoRetiro();

        retiro.cerrar(this);
        bici.devolver(this);
    }
}
Estacion.init(
    {
        estacion_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        barrio_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references:{
                model: Barrio,
                key: 'barrio_id',
                deferrable: Deferrable.INITIALLY_DEFERRED
            }
        },
        capacidad: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    },
    {
        sequelizeConnection,
        modelName: 'Estacion'
    }
)

module.exports = Estacion;
