import { DataTypes, Model } from 'sequelize';
import Retiro from './Retiro.js';

const UsuarioModule = (() => {
	class Usuario extends Model {
		/**
		 * @returns nombre completo de la persona en mayusculas
		 */
		nombreCompleto() {
			return [this.nombre.toUpperCase(), this.apellido.toUpperCase()].join(' ');
		}

		/**
		 * Devuelve un retiro abierto
		 * Por como funciona el sistema, solo puede haber uno
		 * @returns Retiro
		 */
		async getUltimoRetiro() {
			return await Retiro.findOne({
				where: {
					user_id: this.user_id,
					estacion_end: null,
				},
			});
		}

		/**
		 * Chequea si la contraseña es correcta
		 * @returns true or false
		 */
		loginAttemp(pw) {
			// dado que la encripcion de la contraseña es solo de ida,
			// si modelo un usuario con tan solo la contraseña, este
			// se poblara con la misma encriptacion y puedo corroborar
			// que tengan la misma contraseña manteniendo la seguridad
			// del usuario y su clave sin duplicar el codigo de encriptacion

			let l = Usuario.build({ password: pw });
			return this.password == l.password;
		}

		/**
		 * Agrega la deuda a los dos campos de deuda
		 * @returns void
		 */
		agregarDeuda(valor) {
			this.deuda_actual += valor;
			this.deuda_historica += valor;

			console.log();
		}

		/**
		 * Resta la deuda de la deuda actual
		 * @returns void
		 */
		pagarDeuda(valor) {
			this.deuda_actual -= valor;
		}

		/**
		 * Simula la accion del usuario retirando la bicicleta
		 * @returns devuelve un retiro o un error
		 */
		async retirarBici(b) {
			let r = await this.getUltimoRetiro();
			if (r != null) {
				throw new Error('El usuario tiene un retiro abierto');
			} else {
				let e = b.retirar();

				if (e) {
					await b.save();

					return await Retiro.create({
						bicicleta_id: b.bicicleta_id,
						user_id: this.user_id,
						estacion_start: e,
					});
				} else {
					throw new Error(
						`Bicicleta ${b.bicicleta_id} está siendo utilizada por ${(await b.getUltimoRetiro()).user_id}`
					);
				}
			}
		}
		static initialize(sequelize) {
			Usuario.init(
				{
					user_id: {
						type: DataTypes.INTEGER,
						allowNull: false,
						autoIncrement: true,
						primaryKey: true,
						unique: true,
					},
					deuda_actual: {
						type: DataTypes.INTEGER,
						allowNull: true,
						defaultValue: 0,
					},
					deuda_historica: {
						type: DataTypes.INTEGER,
						allowNull: true,
						defaultValue: 0,
					},
					nombre: {
						type: DataTypes.STRING,
						allowNull: false,
					},
					apellido: {
						type: DataTypes.STRING,
						allowNull: false,
					},
					username: {
						type: DataTypes.STRING,
						allowNull: false,
						unique: true,
					},
					password: {
						type: DataTypes.STRING,
						allowNull: false,
						set(value) {
							// esto es un código que encontré online para crear un hashing
							// estaba acostumbrado a poder hacer 'hola mundo'.hashCode() en
							// java pero aca no habia algo como eso y preferí hacerlo rapido
							// sin utilizar ningun paquete, en un producto final si usaría uno
							// para mejorar la seguridad

							let hash = 0;
							for (let i = 0; i < value.length; i++) {
								let char = value.charCodeAt(i);
								hash = (hash << 5) - hash + char;
								hash |= 0;
							}

							this.setDataValue('password', hash.toString(16));
						},
					},
					admin: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: false,
					},
				},
				{
					sequelize: sequelize,
					createdAt: false,
					updatedAt: false,
					modelName: 'Usuario',
				}
			);
		}
	}
	return Usuario;
})();

export default UsuarioModule;
