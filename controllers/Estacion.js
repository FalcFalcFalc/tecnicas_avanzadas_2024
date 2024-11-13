import { DataTypes, Model, Deferrable } from 'sequelize';
import Barrio from './Barrio.js';
import Bicicleta from './Bicicleta.js';
import Retiro from './Retiro.js';

const EstacionModule = (() => {
	class Estacion extends Model {
		/**
		 * Devuelve la bicicleta y devuelve el retiro cerrado
		 * @returns Retiro
		 */
		async devolverBici(bici) {
			let retiro = await Retiro.retiroAbiertoDe(bici);

			if (retiro == null) {
				throw new Error(`La bici ${bici.bicicleta_id} no estaba retirada`);
			}

			if ((await this.cantidadDeEspaciosLibres()) < 1) {
				throw new Error(`La estacion está llena`); // esto sería raro que se use de forma real
			}

			await retiro.cerrar(this);
			bici.devolver(this);

			await retiro.save();
			await bici.save();

			return retiro;
		}

		toString() {
			return `Estacion #${this.estacion_id} con capacidad ${this.capacidad}`;
		}

		/**
		 * Devuelve Capacidad - # (Bicicletas en la estacion)
		 * @returns cantidad de espacios libres
		 */
		async cantidadDeEspaciosLibres() {
			let bicis = await Bicicleta.findAll({
				where: {
					estacion_id: this.estacion_id,
				},
			});
			return this.capacidad - bicis.length;
		}
		static initialize(sequelize) {
			Estacion.init(
				{
					estacion_id: {
						type: DataTypes.INTEGER,
						allowNull: false,
						autoIncrement: true,
						primaryKey: true,
						unique: true,
					},
					barrio_id: {
						type: DataTypes.INTEGER,
						allowNull: false,
						references: {
							model: Barrio,
							key: 'barrio_id',
							deferrable: Deferrable.INITIALLY_DEFERRED,
						},
					},
					capacidad: {
						type: DataTypes.INTEGER,
						allowNull: false,
					},
				},
				{
					sequelize: sequelize,
					createdAt: false,
					updatedAt: false,
					modelName: 'Estacion',
				}
			);
		}
	}
	return Estacion;
})();

export default EstacionModule;
