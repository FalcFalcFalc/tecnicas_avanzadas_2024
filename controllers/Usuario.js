const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

class Usuario extends Model {
    nombreCompleto() {
        return [this.nombre.toUpperCase(), this.apellido.toUpperCase()].join(' ')
    }
    agregarDeuda(valor){
        this.deuda_actual += valor;
        this.deuda_historica += valor;
    }
    pagarDeuda(valor){
        this.deuda_actual -= valor;
    }
    checkContrasena(pass){
        return this.password == pass.hashCode;
    }
    retirarBici(biciId){
        let bici = Bicicleta.findOne({bicicleta_id:biciId})
        bici.retirar();
        Retiro.create({bicicleta_id:biciId,user_id:this.user_id})
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
        sequelize: sequelize,
        modelName: 'Usuario'
    }
)

module.exports = Usuario;
