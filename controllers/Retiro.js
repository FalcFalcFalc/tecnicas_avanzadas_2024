import{ DataTypes, Model } from 'sequelize';

export class Retiro extends Model {
    async cerrar(estacion) {
        this.estacion_end = estacion.estacion_id;
        this.time_end = DataTypes.NOW;
    }
}

export default Retiro;
