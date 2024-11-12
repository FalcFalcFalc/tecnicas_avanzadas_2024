import { DataTypes, Model, Deferrable } from "sequelize";
import calcularDeuda from "../middleware/calculadoraDeDeuda.js";
import Usuario from "./Usuario.js";
import Bicicleta from "./Bicicleta.js";
import Estacion from "./Estacion.js";

const RetiroModule = (() => {
    class Retiro extends Model {
        /**
         * @returns devuelve true si la estacion está cerrada
         */
        async cerrado() {
            return this.estacion_end != null;
        }
        toString() {
            return `Bicicleta: ${this.bicicleta_id} 
          Usuario: ${this.user_id} 
          From: ${this.time_start} - ${this.estacion_start} 
          ${this.time_end ? `To ${this.time_end} - ${this.estacion_end}` : ""}`;
        }
        /**
         * @returns Calcula la deuda y se la asigna al usuario
         */
        async generarDeuda() {
            if (this.deuda_generada || this.time_end === null) {
                return 0;
            }
            let u = await Usuario.findByPk(this.user_id);
            if (u) {
                let deuda = calcularDeuda(this.time_start, this.time_end);
                this.deuda_generada = deuda;

                u.agregarDeuda(deuda);
                await u.save();
                return deuda;
            }
            return null;
        }

        /**
         *
         * @returns
         */
        async cerrar(estacion) {
            this.estacion_end = estacion.estacion_id;
            this.time_end = new Date();

            this.deuda_generada = await this.generarDeuda();

            await this.save();
        }
        
        /**
         * Devuelve un retiro abierto
         * Por como funciona el sistema, solo puede haber uno
         * @returns Retiro
        */
        static async retiroAbiertoDe(bici){
            return await Retiro.findOne({
                where: {
                    bicicleta_id: bici.bicicleta_id,
                    estacion_end: null,
                },
            });
        }
        static initialize(sequelize) {
            Retiro.init(
                {
                    user_id: {
                        type: DataTypes.INTEGER,
                        allowNull: false,
                        primaryKey: true,
                        references: {
                            model: Usuario,
                            key: "user_id",
                            deferrable: Deferrable.INITIALLY_DEFERRED,
                        },
                    },
                    bicicleta_id: {
                        type: DataTypes.INTEGER,
                        allowNull: false,
                        primaryKey: true,
                        references: {
                            model: Bicicleta,
                            key: "bicicleta_id",
                            deferrable: Deferrable.INITIALLY_DEFERRED,
                        },
                    },
                    time_start: {
                        type: DataTypes.DATE,
                        allowNull: false,
                        defaultValue: DataTypes.NOW,
                        primaryKey: true,
                    },
                    estacion_start: {
                        type: DataTypes.INTEGER,
                        allowNull: false,
                        references: {
                            model: Estacion,
                            key: "estacion_id",
                            deferrable: Deferrable.INITIALLY_DEFERRED,
                        },
                    },
                    time_end: {
                        type: DataTypes.DATE,
                        defaultValue: null,
                        allowNull: true,
                    },
                    estacion_end: {
                        type: DataTypes.INTEGER,
                        defaultValue: null,
                        references: {
                            model: Estacion,
                            key: "estacion_id",
                            deferrable: Deferrable.INITIALLY_DEFERRED,
                        },
                    },
                    deuda_generada: {
                        type: DataTypes.INTEGER,
                        defaultValue: null,
                    },
                },
                {
                    sequelize: sequelize,
                    createdAt: false,
                    updatedAt: false,
                    modelName: "Retiro",
                }
            );
        }
    }
    return Retiro;
})();

export default RetiroModule
