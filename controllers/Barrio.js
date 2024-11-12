import { DataTypes, Model } from 'sequelize';


const BarrioModule = (() => {
    class Barrio extends Model {
        static initialize(sequelize){
            Barrio.init(
              {
                barrio_id: {
                  type: DataTypes.INTEGER,
                  allowNull: false,
                  autoIncrement: true,
                  primaryKey: true,
                  unique: true,
                },
                nombre: {
                  type: DataTypes.STRING,
                  allowNull: false,
                },
              },
              {
                sequelize: sequelize,
                createdAt: false,
                updatedAt: false,
                modelName: "Barrio",
              }
            );
        }
    }
    return Barrio;
})();

export default BarrioModule;