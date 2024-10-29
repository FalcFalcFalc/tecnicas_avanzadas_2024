import{ Sequelize, DataTypes, Model, Deferrable } from 'sequelize';
import sequelizeConnection from '../middleware/sequelizeConnection.js';


import { Barrio } from './Barrio.js';
import { Bicicleta } from './Bicicleta.js';
import { Usuario } from './Usuario.js';
import { Estacion } from './Estacion.js';
import { Retiro } from './Retiro.js';

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
        bicicleta_id: {
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
        sequelize: sequelizeConnection,
        createdAt: false,
        updatedAt: false,
        modelName: 'Retiro'
    }
)

Bicicleta.hasMany(Retiro,{foreignKey: 'bicicleta_id'});
Retiro.belongsTo(Bicicleta, { foreignKey: 'bicicleta_id', as: 'bicicleta', type: 'hasMany' });

export { Barrio } ;
export { Estacion } ;
export { Bicicleta } ;
export { Usuario } ;
export { Retiro } ;