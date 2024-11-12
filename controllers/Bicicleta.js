import { DataTypes, Model, Deferrable } from "sequelize";
import Estacion from "./Estacion.js";


const BicicletaModule = (() => {
    class Bicicleta extends Model {
        /**
         * Elimina la estacion de la bicicleta y devuelve la id de la estacion
         * @returns estacion_id
         */
        retirar() {
            let e = Number(this.estacion_id);
            this.estacion_id = null;
            return e;
        }
        /**
         * Asigna la nueva estacion a la bicicleta
         * @returns void
         */
        async devolver(estacion) {
            this.estacion_id = estacion.estacion_id;
        }
        static initialize(sequelize) {
            Bicicleta.init(
                {
                    bicicleta_id: {
                        type: DataTypes.INTEGER,
                        allowNull: false,
                        autoIncrement: true,
                        primaryKey: true,
                        unique: true,
                    },
                    estacion_id: {
                        type: DataTypes.INTEGER,
                        allowNull: true,
                        references: {
                            model: Estacion,
                            key: "estacion_id",
                            deferrable: Deferrable.INITIALLY_DEFERRED,
                        },
                    },
                    bicicleta_codigo: {
                        type: DataTypes.STRING,
                        allowNull: false,
                        unique: true,
                    },
                },
                {
                    sequelize: sequelize,
                    createdAt: false,
                    updatedAt: false,
                    modelName: "Bicicleta",
                }
            );
        }
        static associate(models) {
            Bicicleta.hasMany(models.Retiro, { foreignKey: "bicicleta_id" });
        }
    }
    return Bicicleta;
})();

export default BicicletaModule;