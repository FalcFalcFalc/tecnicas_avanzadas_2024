import { DataTypes, Model } from 'sequelize';
import sequelizeConnection from '../middleware/sequelizeConnection.js';

export class Barrio extends Model {}
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
        sequelize: sequelizeConnection,
        createdAt: false,
        updatedAt: false,
        modelName: 'Barrio'
    }
)

