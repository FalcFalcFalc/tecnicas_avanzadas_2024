import "dotenv/config";
import { Sequelize, DataTypes, Model, Deferrable } from "sequelize";
import sequelizeConnection from "../middleware/sequelizeConnection.js";
import calcularDeuda from "../middleware/calculadoraDeDeuda.js";

export class Barrio extends Model {}
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
  async devolverBici(bici) {
    let retiro = await bici.getUltimoRetiro();

    if (retiro == null) {
      return `La bici ${bici.bicicleta_id} no estaba retirada`;
    }

    if (this.cantidadDeEspaciosLibres() < 1) {
      return `La estacion está llena`; // esto sería raro que se use de forma real
    }

    retiro.cerrar(this);
    bici.devolver(this);

    retiro.save();
    bici.save();

    return `Bicicleta ${bici.bicicleta_id} devuelta en en ${this.estacion_id}`;
  }

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
  async retirar() {
    let e = await Estacion.findByPk(this.estacion_id).finally(() => {
      this.estacion_id = null;
    });
    return e;
  }
  async devolver(estacion) {
    this.estacion_id = estacion.estacion_id;
  }
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
  nombreCompleto() {
    return [this.nombre.toUpperCase(), this.apellido.toUpperCase()].join(" ");
  }

  async getUltimoRetiro() {
    return await Retiro.findOne({
      where: {
        user_id: this.user_id,
        estacion_end: null,
      },
    });
  }

  async loginAttemp(pw) {
    // dado que la encripcion de la contraseña es solo de ida,
    // si modelo un usuario con tan solo la contraseña, este
    // se poblara con la misma encriptacion y puedo corroborar
    // que tengan la misma contraseña manteniendo la seguridad
    // del usuario y su clave sin duplicar el codigo de encriptacion

    let l = Usuario.build({ password: pw });
    return this.password == l.password;
  }

  async agregarDeuda(valor) {
    this.deuda_actual += valor;
    this.deuda_historica += valor;
  }

  async pagarDeuda(valor) {
    this.deuda_actual -= valor;
  }

  async checkContrasena(pass) {
    return this.password == pass.hashCode;
  }

  async retirarBici(b) {
    let r = await this.getUltimoRetiro();
    if (r === null) {
      let e = await b.retirar();

      if (e === null) {
        return `Bicicleta ${b.bicicleta_id} está siendo utilizada por ${(
          await Usuario.findByPk((await b.getUltimoRetiro()).user_id)
        ).nombreCompleto()}`;
      }

      await Retiro.create({
        bicicleta_id: b.bicicleta_id,
        user_id: this.user_id,
        estacion_start: e.estacion_id,
      });
      await b.save();
      return `Bicicleta ${b.bicicleta_id} retirada por ${this.nombreCompleto()}`;
    } else {
      return "El usuario tiene un retiro abierto";
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
  async cerrado() {
    return this.estacion_end != null;
  }
  async generarDeuda() {
    if (this.deuda_generada || this.time_end === null) {
      return 0;
    }
    let u = await Usuario.findByPk(this.user_id);
    if (u) {
      let deuda = calcularDeuda(this.time_start, this.time_end);
      this.deuda_generada += deuda;
      u.agregarDeuda(deuda);
      u.save();
      return deuda;
    }
    return null;
  }

  async cerrar(estacion) {
    this.estacion_end = estacion.estacion_id;
    this.time_end = Sequelize.fn("NOW");

    this.generarDeuda();
    this.save();
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
