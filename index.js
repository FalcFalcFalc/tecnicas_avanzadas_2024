import "dotenv/config";
import { Op } from "sequelize";
import bodyParser from "body-parser";
import express, { json } from "express";
import http from "http";
import session from "express-session";
import { isAuthenticated, isAdmin } from "./middleware/auth-middleware.js";
import createHtml from './middleware/ejsRenderer.js'
import filterQuery from "./middleware/queryFiltering.js";
import {
  Barrio,
  Bicicleta,
  Usuario,
  Estacion,
  Retiro,
} from "./controllers/Models.js";

const app = express();
app.use(json());
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 },
  })
);

http.createServer(app);

const PORT = 5000;
const server = app.listen(process.env.PORT || PORT);

// OBTENCION DE RECURSOS

app.get("/barrios/", async (req, res) => {
  let query = await Barrio.findAll({});
  let html = await createHtml('table',{data:query});
  res.status(200).send(html);
});

app.get("/barrios/:id/", async (req, res) => {
  let { id } = req.params;
  let query = await Barrio.findOne({
    where: {
      barrio_id: id,
    },
  });
  let html = await createHtml('table',{data:query});
  res.status(200).send(html);
});

app.get("/barrios/:id/estaciones/", async (req, res) => {
  let { id } = req.params;
  let query = await Estacion.findAll({
    where: {
      barrio_id: id,
    },
  });
  let html = await createHtml('table',{data:query});
  res.status(200).send(html);
});

app.get("/barrios/:id/estaciones/libres", async (req, res) => {
  let { id } = req.params;
  let query = await Estacion.findAll({
    where: {
      barrio_id: id,
    },
  });
  let filteredQuery = await filterQuery(
    query,
    async (n) => (await n.cantidadDeEspaciosLibres()) > 0
  );
  let html = await createHtml('table',{data:filteredQuery});
  res.status(200).send(html);
});

app.get("/bicicletas/", async (req, res) => {
  let query = await Bicicleta.findAll({});
  let html = await createHtml('table',{data:query});
  res.status(200).send(html);
});

app.get("/bicicletas/:id/", async (req, res) => {
  let { id } = req.params;
  let query = await Bicicleta.findAll({
    where: {
      bicicleta_id: id,
    },
  });
  let html = await createHtml('table',{data:query});
  res.status(200).send(html);
});

app.get("/estaciones/", async (req, res) => {
  let query = await Estacion.findAll();
  let html = await createHtml('table',{data:query});
  res.status(200).send(html);
});

app.get("/estaciones/libres/", async (req, res) => {
  let filteredQuery = await filterQuery(
    await Estacion.findAll(),
    async (n) => (await n.cantidadDeEspaciosLibres()) > 0
  );

  let html = await createHtml('table',{data:filteredQuery});
  res.status(200).send(html);});

app.get("/estaciones/:id/", async (req, res) => {
  let { id } = req.params;
  let query = await Estacion.findAll({
    where: {
      estacion_id: id,
    },
  });
  let html = await createHtml('table',{data:query});
  res.status(200).send(html);
});

app.get("/estaciones/:id/bicicletas/", async (req, res) => {
  let { id } = req.params;
  let query = await Bicicleta.findAll({
    where: {
      estacion_id: id,
    },
  });
  let html = await createHtml('table',{data:query});
  res.status(200).send(html);
});

app.get("/estaciones/:id/retiros/", async (req, res) => {
  let { id } = req.params;
  let query = await Retiro.findAll({
    where: {
      [Op.or]: [{ estacion_end: id }, { estacion_start: id }],
    },
  });
  let html = await createHtml('table',{data:query});
  res.status(200).send(html);
});

app.get("/estaciones/:id/usuarios/", async (req, res) => {
  let { id } = req.params;
  let query = await Usuario.findAll({
    where: {
      estacion_id: id,
    },
  });
  let html = await createHtml('table',{data:query});
  res.status(200).send(html);
});

app.get("/usuarios/", async (req, res) => {
  let query = await Usuario.findAll();
  let html = await createHtml('table',{data:query});
  res.status(200).send(html);
});

app.get("/usuarios/:id/", async (req, res) => {
  let { id } = req.params;
  let query = await Usuario.findAll({
    where: {
      user_id: id,
    },
  });
  let html = await createHtml('table',{data:query});
  res.status(200).send(html);
});

app.get("/usuarios/:id/bicicletas/", async (req, res) => {
  let { id } = req.params;
  let query = await Bicicleta.findAll({
    include: [
      {
        model: Retiro,
        required: true,
        attributes: [],
        where: {
          user_id: id,
        },
      },
    ],
  });
  let html = await createHtml('table',{data:query});
  res.status(200).send(html);
});

app.get("/retiros/", async (req, res) => {
  let query = await Retiro.findAll();
  let html = await createHtml('table',{data:query});
  res.status(200).send(html);
});

app.get("/retiros/abiertos", async (req, res) => {
  let query = await Retiro.findAll({
    attributes: ["user_id", "bicicleta_id", "time_start", "estacion_start"],
    where: {
      time_end: null,
    },
    order: [["time_start", "DESC"]],
  });
  let html = await createHtml('table',{data:query});
  res.status(200).send(html);
});

app.get("/retiros/abiertos/bicicletas/", async (req, res) => {
  let query = await Retiro.findAll({
    attributes: [],
    where: {
      time_end: null,
    },
    order: [["time_start", "DESC"]],
    include: [
      {
        model: Bicicleta,
        required: true,
        attributes: ["bicicleta_id", "bicicleta_codigo"],
        as: "Bicicleta",
      },
    ],
  });
  let html = await createHtml('table',{data:query});
  res.status(200).send(html);
});

app.get("/retiros/cerrados", async (req, res) => {
  let query = await Retiro.findAll({
    where: {
      [Op.not]: { time_end: null },
    },
    order: [["time_end", "DESC"]],
  });
  let html = await createHtml('table',{data:query});
  res.status(200).send(html);
});

app.get("/test/", async (req, res) => {
  let query = await Promise.all(
    await Usuario.findAll({
      attributes: [
        "user_id",
        "nombre",
        "apellido"
      ],
    })
  );

  
  
  let html = await createHtml('table',{data:query});
  res.status(200).send(html);
});

// CREACION DE RECURSOS

app.post("/estaciones/", async (req, res) => {
  isAdmin(req, res, async () => {
    const barrio_id = req.headers.barrio_id;
    const capacidad = req.headers.capacidad;

    if ((await Barrio.findByPk(barrio_id)) === null) {
      res.status(404).send("El barrio indicado no existe");
      return;
    }

    res.status(200).send(
      await Estacion.create({
        barrio_id: barrio_id,
        capacidad: capacidad,
      })
    );
  });
});

app.post("/barrios/", async (req, res) => {
  isAdmin(req, res, async () => {
    const nombre = req.headers.nombre;

    res.status(200).send(
      await Barrio.create({
        nombre: nombre,
      })
    );
  });
});

app.post("/usuarios/", async (req, res) => {
  isAdmin(req, res, async () => {
    const nombre = req.headers.nombre;
    const apellido = req.headers.apellido;
    const username = req.headers.username;
    const password = req.headers.password;

    res.status(200).send(
      await Usuario.create({
        nombre: nombre,
        apellido: apellido,
        username: username,
        password: password,
      })
    );
  });
});

app.post("/bicicletas/", async (req, res) => {
  isAdmin(req, res, async () => {
    const estacion_id = req.headers.estacion_id;
    const bicicleta_codigo = req.headers.bicicleta_codigo;

    if ((await Estacion.findByPk(estacion_id)) === null) {
      res.status(404).send("La estacion indicada no existe");
      return;
    }

    res.status(200).send(
      await Bicicleta.create({
        estacion_id: estacion_id,
        bicicleta_codigo: bicicleta_codigo,
      })
    );
  });
});

// MODELO DE NEGOCIO

app.post("/retiros/", async (req, res) => {
  isAuthenticated(req, res, async () => {
    const bicicleta_id = req.headers.bicicleta_id;
    const { id } = req.session.user.id;

    let user = await Usuario.findByPk(id);

    console.log(user);

    if (user === null) {
      res.status(404).send("El usuario indicado no existe"); // sería raro que entre acá porque está logueado
      return;
    }

    const bici = await Bicicleta.findByPk(bicicleta_id);
    if (bici === null) {
      res.status(404).send("El bicicleta indicado no existe");
      return;
    }

    res.status(200).send(await user.retirarBici(bici));
  });
});

app.patch("/retiros/", async (req, res) => {
  // no autentico pero debido a que este no debería ser un endpoint publico
  const bicicleta_id = req.headers.bicicleta_id;
  const estacion_id = req.headers.estacion_id;
  // por cuestiones de seguridad esto (↑) debería ser una cookie instalada dentro
  // de cada sistema de procesamiento interno de la estacion

  const estacion = await Estacion.findByPk(estacion_id);
  if (estacion === null) {
    res.status(404).send("La estacion indicada no existe");
    return;
  }

  const bici = await Bicicleta.findByPk(bicicleta_id);
  if (bici === null) {
    res.status(404).send("La bicicleta indicada no existe");
    return;
  }

  res.status(200).send(await estacion.devolverBici(bici));
});

app.patch("/deudas/", async (req, res) => {
  isAdmin(req, res, async () => {
    let query = await Retiro.findAll({
      where: {
        [Op.not]: { time_end: null },
      },
    });
    let rec = 0;
    for (let r of query) {
      rec += await r.generarDeuda();
      r.save();
    }
    res.status(200).send("Recuadado: $" + rec);
  });
});

// LOGIN

app.post("/login", async (req, res) => {
  isAuthenticated(
    // en este caso busco que no esté autenticado, mirar la línea ...
    req,
    res,
    async () => {
      const username = req.headers.username;
      const password = req.headers.password;
      let u = await Usuario.findOne({
        where: {
          username: username,
        },
      });

      if (await u.loginAttemp(password)) {
        req.session.user = { id: u.user_id, admin: u.admin };
        res.status(200).send("Inicio de sesión exitoso");
      } else {
        res.status(401).send("Credenciales incorrectas");
      }
    },
    true // <- este true invierte como funciona el método de autenticacion
  );
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(501).send("Hubo un error inesperado, pero no es tu culpa!");
    }
    res.clearCookie("connect.sid");
    res.status(200).send("Sesión cerrada correctamente.");
  });
});
