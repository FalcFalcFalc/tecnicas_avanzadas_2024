import 'dotenv/config';
import Barrio from "./Barrio.js";
import Estacion from "./Estacion.js";
import Bicicleta from "./Bicicleta.js";
import Retiro from "./Retiro.js";
import Usuario from "./Usuario.js";

import sequelizeConnection from '../middleware/sequelizeConnection.js';

Barrio.initialize(sequelizeConnection);
Estacion.initialize(sequelizeConnection);
Usuario.initialize(sequelizeConnection);
Bicicleta.initialize(sequelizeConnection);
Retiro.initialize(sequelizeConnection);

Bicicleta.associate({ Retiro });

export { Bicicleta, Retiro, Barrio, Estacion, Usuario };
