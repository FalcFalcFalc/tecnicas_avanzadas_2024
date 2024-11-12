import "dotenv/config";
import { Sequelize, DataTypes, Model, Deferrable } from "sequelize";
import sequelizeConnection from "../middleware/sequelizeConnection.js";
import calcularDeuda from "../middleware/calculadoraDeDeuda.js";

export class Barrio extends Model { }
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
    sequelize: sequelizeConnection,
    createdAt: false,
    updatedAt: false,
    modelName: "Barrio",
  }
);

export class Estacion extends Model {
  /**
   * Devuelve la bicicleta y devuelve el retiro cerrado
   * @returns Retiro
   */
  async devolverBici(bici) {
    let retiro = await bici.getUltimoRetiro();

    if (retiro == null) {
      throw new Error(`La bici ${bici.bicicleta_id} no estaba retirada`);
    }

    if (this.cantidadDeEspaciosLibres() < 1) {
      throw new Error(`La estacion está llena`); // esto sería raro que se use de forma real
    }

    retiro.cerrar(this);
    bici.devolver(this);

    await retiro.save();
    await bici.save();

    return retiro;
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
}
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
        key: "barrio_id",
        deferrable: Deferrable.INITIALLY_DEFERRED,
      },
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeConnection,
    createdAt: false,
    updatedAt: false,
    modelName: "Estacion",
  }
);

export class Bicicleta extends Model {
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
  /**
   * Devuelve un retiro abierto
   * Por como funciona el sistema, solo puede haber uno
   * @returns Retiro
   */
  async getUltimoRetiro() {
    return await Retiro.findOne({
      where: {
        bicicleta_id: this.bicicleta_id,
        estacion_end: null,
      },
    });
  }
}
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
    sequelize: sequelizeConnection,
    createdAt: false,
    updatedAt: false,
    modelName: "Bicicleta",
  }
);

export class Usuario extends Model {
  /**
   * @returns nombre completo de la persona en mayusculas
   */
  nombreCompleto() {
    return [this.nombre.toUpperCase(), this.apellido.toUpperCase()].join(" ");
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
  async loginAttemp(pw) {
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

    console.log()
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
      throw new Error("El usuario tiene un retiro abierto");
    }
    else {
      let e = b.retirar();
      
      if (e) {
        await b.save();
        
        return await Retiro.create({
          bicicleta_id: b.bicicleta_id,
          user_id: this.user_id,
          estacion_start: e,
        });
      }
      else {
        throw new Error(`Bicicleta ${b.bicicleta_id} está siendo utilizada por ${(await b.getUltimoRetiro()).user_id}`);
      }

    }
  }
}
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

        this.setDataValue("password", hash.toString(16));
      },
    },
    admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize: sequelizeConnection,
    createdAt: false,
    updatedAt: false,
    modelName: "Usuario",
  }
);

export class Retiro extends Model {
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
    ${(this.time_end ? `To ${this.time_end} - ${this.estacion_end}`: "")}`;
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
}
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
    sequelize: sequelizeConnection,
    createdAt: false,
    updatedAt: false,
    modelName: "Retiro",
  }
);

Bicicleta.hasMany(Retiro, { foreignKey: "bicicleta_id" });
Retiro.belongsTo(Bicicleta, {
  foreignKey: "bicicleta_id",
  as: "Bicicleta",
  type: "hasMany",
});
