const { DataTypes, Model } = require('sequelize');
const { sequelizeConnection } = require('../middleware/sequelizeConnection')
const { Estacion } = require('Estacion')

class Bicicleta extends Model {
    retirar(){
        this.estacion_id = null
    }
    devolver(estacion){
        this.estacion_id = estacion.estacion_id
    }
    getUltimoRetiro(){
        return Retiro.findOne({bicicleta_id: this.bicicleta_id, estacion_end: null})
    }
}
Bicicleta.init(
    {
        bicicleta_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        estacion_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references:{
                model: Estacion,
                key: 'estacion_id',
                deferrable: Deferrable.INITIALLY_DEFERRED
            }
        },
        bici_codigo: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    },
    {
        sequelizeConnection,
        modelName: 'Bicicleta'
    }
)

module.exports = Bicicleta;
