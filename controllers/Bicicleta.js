import{ Sequelize, DataTypes, Model, Deferrable } from 'sequelize';
import sequelizeConnection from '../middleware/sequelizeConnection.js';


import { Estacion } from './Estacion.js'
import { Retiro } from './Retiro.js';

export class Bicicleta extends Model {
    async retirar(){
        this.estacion_id = null
    }
    async devolver(estacion){
        this.estacion_id = estacion.estacion_id
    }
    async getUltimoRetiro(){
        return await Retiro.findOne({
            where: {
                bicicleta_id: this.bicicleta_id,
                estacion_end: null
            }
        });
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
        bicicleta_codigo: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    },
    {
        sequelize: sequelizeConnection,
        createdAt: false,
        updatedAt: false,
        modelName: 'Bicicleta'
    }
)

export default Bicicleta;
