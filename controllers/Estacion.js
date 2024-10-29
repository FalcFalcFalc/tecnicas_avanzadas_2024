import{ Sequelize, DataTypes, Model, Deferrable } from 'sequelize';
import sequelizeConnection from '../middleware/sequelizeConnection.js';

import { Barrio } from './Barrio.js'

export class Estacion extends Model {
    async devolverBici(bici) {
        let retiro = await bici.getUltimoRetiro();

        retiro.cerrar(this);
        bici.devolver(this);

        retiro.save();
        bici.save()
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
        sequelize: sequelizeConnection,
        createdAt: false,
        updatedAt: false,
        modelName: 'Estacion'
    }
)

export default Estacion;
