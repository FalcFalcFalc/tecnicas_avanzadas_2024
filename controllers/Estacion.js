const { Sequelize, DataTypes, Model, Deferrable } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

const { Barrio } = require('./Barrio')

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
        sequelize: sequelize,
        modelName: 'Estacion'
    }
)

module.exports = Estacion;
