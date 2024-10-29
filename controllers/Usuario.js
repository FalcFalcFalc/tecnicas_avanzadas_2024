import { DataTypes, Model } from 'sequelize';
import sequelizeConnection from '../middleware/sequelizeConnection.js';

export class Usuario extends Model {
async nombreCompleto(){
    return [this.nombre.toUpperCase(), this.apellido.toUpperCase()].join(' ')
}
async agregarDeuda(valor){
    this.deuda_actual += valor;
    this.deuda_historica += valor;
}
async pagarDeuda(valor){
    this.deuda_actual -= valor;
}
async checkContrasena(pass){
    return this.password == pass.hashCode;
}
async retirarBici(biciId){
    let bici = Bicicleta.findOne({bicicleta_id:biciId})
    await bici.retirar();
    await Retiro.build({bicicleta_id:biciId,user_id:this.user_id})
    await bici.save();
}
}
Usuario.init(
    {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            unique: true 
        },
        deuda_actual: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        deuda_historica: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        apellido: {
            type: DataTypes.STRING,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            set(value) {
                this.setDataValue('password', value.hashCode);
            }
        }
    },
    {
        sequelize: sequelizeConnection,
        createdAt: false,
        updatedAt: false,
        modelName: 'Usuario'
    }
);
export default Usuario;
