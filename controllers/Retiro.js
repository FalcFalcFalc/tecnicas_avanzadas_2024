const { DataTypes, Model } = require('sequelize');
const { sequelizeConnection } = require('../middleware/sequelizeConnection')
const { Bicicleta } = require('Bicicleta')
const { Estacion } = require('Estacion')
const { Usuario } = require('Usuario')



class Retiro extends Model {
    cerrar(estacion) {
        this.estacion_end = estacion.estacion_id;
        this.time_end = DataTypes.NOW;
    }
}
Retiro.init(
    {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references:{
                model: Usuario,
                key: 'user_id',
                deferrable: Deferrable.INITIALLY_DEFERRED
            }
        },
        bici_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references:{
                model: Bicicleta,
                key: 'bicicleta_id',
                deferrable: Deferrable.INITIALLY_DEFERRED
            }
        },
        time_start: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            primaryKey: true 
        },
        estacion_start: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references:{
                model: Estacion,
                key: 'estacion_id',
                deferrable: Deferrable.INITIALLY_DEFERRED
            }
        },
        time_end: {
            type: DataTypes.DATE,
            defaultValue: null
        },
        estacion_end: {
            type: DataTypes.INTEGER,
            defaultValue: null,
            references:{
                model: Estacion,
                key: 'estacion_id',
                deferrable: Deferrable.INITIALLY_DEFERRED
            }
        },
        deuda_generada: {
            type: DataTypes.INTEGER,
            defaultValue: null
        },
    },
    {
        sequelizeConnection,
        modelName: 'Retiro'
    }
)

module.exports = Retiro;
