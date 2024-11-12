import "dotenv/config";
import { Op } from "sequelize";
import bodyParser from "body-parser";
import express, { json } from "express";
import http from "http";
import session from "express-session";

import getPaginacion from "./middleware/paginacion.js";
import { isAuthenticated, isAdmin } from "./middleware/auth-middleware.js";
import createHtml from "./middleware/ejsRenderer.js";
import filterQuery from "./middleware/queryFiltering.js";

import { Barrio, Bicicleta, Usuario, Estacion, Retiro } from "./controllers/Models.js";

const app = express();
app.use(json());
app.use(express.urlencoded({ extended: true }));
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

async function displayError(res, error) {
  let html = await createHtml("mensaje", error);
  res.status(200).send(html);
}

function error(res) {
  return (error) => displayError(res, error).then();
}

// OBTENCION DE RECURSOS

app.get("/barrios/", async (req, res) => {
  let pagOptions = getPaginacion(req);
  let params = {
    order: ["barrio_id"],
    ...pagOptions,
  };
  let query = await Barrio.findAll(params);
  let html = await createHtml("table", query, req);
  res.status(200).send(html);
});

app.get("/barrios/:id/", async (req, res) => {
  let { id } = req.params;
  let params = {
    where: {
      barrio_id: id,
    },
  };

  let query = await Barrio.findOne(params);
  let html = await createHtml("table", query, req);
  res.status(200).send(html);
});

app.get("/barrios/:id/estaciones/", async (req, res) => {
  let { id } = req.params;
  let params = {
    where: {
      barrio_id: id,
    },
  };

  let query = await Estacion.findAll(params);
  let html = await createHtml("table", query, req);
  res.status(200).send(html);
});

app.get("/barrios/:id/estaciones/libres", async (req, res) => {
  let { id } = req.params;
  let params = {
    where: {
      barrio_id: id,
    },
  };
  let filteredQuery = await filterQuery(
    await Estacion.findAll(params),
    async (n) => (await n.cantidadDeEspaciosLibres()) > 0
  );
  let html = await createHtml("table", filteredQuery, req);
  res.status(200).send(html);
});

app.get("/bicicletas/", async (req, res) => {
  let pagOptions = getPaginacion(req);

  let query = await Bicicleta.findAll(pagOptions);
  let html = await createHtml("table", query, req);
  res.status(200).send(html);
});

app.get("/bicicletas/:id/", async (req, res) => {
  let { id } = req.params;
  let params = {
    where: {
      bicicleta_id: id,
    },
  };

  let query = await Bicicleta.findAll(params);
  let html = await createHtml("table", query, req);
  res.status(200).send(html);
});

app.get("/estaciones/", async (req, res) => {
  let pagOptions = getPaginacion(req);

  let query = await Estacion.findAll(pagOptions);
  let html = await createHtml("table", query, req);
  res.status(200).send(html);
});

app.get("/estaciones/form", async (req, res) => {
  let html = await createHtml("devolver");
  res.status(200).send(html);
});

app.get("/estaciones/libres/", async (req, res) => {
  let pagOptions = getPaginacion(req);

  let filteredQuery = await filterQuery(
    await Estacion.findAll(pagOptions),
    async (n) => (await n.cantidadDeEspaciosLibres()) > 0
  );

  let html = await createHtml("table", filteredQuery, req);
  res.status(200).send(html);
});

app.get("/estaciones/:id/", async (req, res) => {
  let { id } = req.params;
  let params = {
    where: {
      estacion_id: id,
    },
  };

  let query = await Estacion.findAll(params);
  let html = await createHtml("table", query, req);
  res.status(200).send(html);
});

app.get("/estaciones/:id/bicicletas/", async (req, res) => {
  let pagOptions = getPaginacion(req);
  let { id } = req.params;
  let params = {
    where: {
      estacion_id: id,
    },
    ...pagOptions,
  };

  let query = await Bicicleta.findAll(params);
  let html = await createHtml("table", query, req);
  res.status(200).send(html);
});

app.get("/estaciones/:id/retiros/", async (req, res) => {
  let pagOptions = getPaginacion(req);
  let { id } = req.params;
  let params = {
    where: {
      [Op.or]: [{ estacion_end: id }, { estacion_start: id }],
    },
    ...pagOptions,
  };
  let query = await Retiro.findAll(params);
  let html = await createHtml("table", query, req);
  res.status(200).send(html);
});

app.get("/estaciones/:id/usuarios/", async (req, res) => {
  let { id } = req.params;
  let query = await Usuario.findAll({
    where: {
      estacion_id: id,
    },
  });
  let html = await createHtml("table", query, req);
  res.status(200).send(html);
});

app.get("/usuarios/", async (req, res) => {
  let pagOptions = getPaginacion(req);

  let query = await Usuario.findAll(pagOptions);
  let html = await createHtml("table", query, req);
  res.status(200).send(html);
});

app.get("/usuarios/:id/", async (req, res) => {
  let { id } = req.params;
  let params = {
    where: {
      user_id: id,
    },
  };
  let query = await Usuario.findAll(params);
  let html = await createHtml("table", query, req);
  res.status(200).send(html);
});

app.get("/usuarios/:id/bicicletas/", async (req, res) => {
  let pagOptions = getPaginacion(req);
  let { id } = req.params;
  let params = {
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
    ...pagOptions,
  };
  let query = await Bicicleta.findAll(params);
  let html = await createHtml("table", query, req);
  res.status(200).send(html);
});

app.get("/retiros/", async (req, res) => {
  isAdmin(
    req,
    async () => {
      let pagOptions = getPaginacion(req);
      let params = {
        order: [["time_start", "DESC"]],
        ...pagOptions,
      };
      let query = await Retiro.findAll(params);
      let html = await createHtml("table", query, req);
      res.status(200).send(html);
    },
    error(res)
  );
});

app.get("/retiros/form", async (req, res) => {
  isAuthenticated(
    req,
    async () => {
      let html = await createHtml("retirar");
      res.status(200).send(html);
    },
    error(res)
  );
});

app.get("/retiros/abiertos", async (req, res) => {
  let pagOptions = getPaginacion(req);
  let params = {
    attributes: ["user_id", "bicicleta_id", "time_start", "estacion_start"],
    where: {
      time_end: null,
    },
    order: [["time_start", "DESC"]],
    ...pagOptions,
  };
  let query = await Retiro.findAll(params);

  let html = await createHtml("table", query, req);
  res.status(200).send(html);
});

app.get("/retiros/cerrados", async (req, res) => {
  let pagOptions = getPaginacion(req);
  let params = {
    where: {
      [Op.not]: { time_end: null },
    },
    order: [["time_end", "DESC"]],
    ...pagOptions,
  };

  let query = await Retiro.findAll(params);
  let html = await createHtml("table", query, req);
  res.status(200).send(html);
});

// CREACION DE RECURSOS

app.post("/estaciones/", async (req, res) => {
  isAdmin(
    req,
    async () => {
      const barrio_id = req.headers.barrio_id;
      const capacidad = req.headers.capacidad;

      if ((await Barrio.findByPk(barrio_id))) {
        res.status(200).send(
          await Estacion.create({
            barrio_id: barrio_id,
            capacidad: capacidad,
          })
        );
      }
      else {
        res.status(404).send("El barrio indicado no existe");
        return;
      }

    },
    error(res)
  );
});

app.post("/barrios/", async (req, res) => {
  isAdmin(
    req,
    async () => {
      const nombre = req.headers.nombre;

      res.status(200).send(
        await Barrio.create({
          nombre: nombre,
        })
      );
    },
    error(res)
  );
});

app.post("/usuarios/", async (req, res) => {
  isAdmin(
    req,
    async () => {
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
    },
    error(res)
  );
});

app.post("/bicicletas/", async (req, res) => {
  isAdmin(
    req,
    async () => {
      const estacion_id = req.headers.estacion_id;
      const bicicleta_codigo = req.headers.bicicleta_codigo;

      if ((await Estacion.findByPk(estacion_id))) {
        res.status(200).send(
          await Bicicleta.create({
            estacion_id: estacion_id,
            bicicleta_codigo: bicicleta_codigo,
          })
        );
      }
      else {
        res.status(404).send("La estacion indicada no existe");
        return;
      }
    },
    error(res)
  );
});

// MODELO DE NEGOCIO

app.post("/retiros/", async (req, res) => {
  isAuthenticated(
    req,
    async () => {
      const bicicleta_codigo = req.body.bicicleta_codigo;
      const { id } = req.session.user;

      let mensaje = "Error desconocido";
      let user = await Usuario.findByPk(id);
      if (user) {
        const bici = await Bicicleta.findOne({ where: { bicicleta_codigo: bicicleta_codigo } });

        if (bici) {
          try {
            mensaje = (await user.retirarBici(bici)).toString();
          } catch (error) {
            mensaje = error
          }
        }
        else {
          mensaje = "El bicicleta indicado no existe";
        }

      }
      else {
        mensaje = "El usuario indicado no existe"; // sería raro que entre acá porque está logueado
      }

      let html = await createHtml("mensaje", mensaje);
      res.status(200).send(html);
    },
    error(res)
  );
});

app.post("/retiros/abiertos/", async (req, res) => {
  // no autentico pero debido a que este no debería ser un endpoint publico
  const bicicleta_id = req.body.bicicleta_id;
  const estacion_id = req.body.estacion_id;
  // por cuestiones de seguridad esto (↑) debería ser una cookie instalada dentro
  // de cada sistema de procesamiento interno de la estacion

  let mensaje = "Error desconocido";
  const estacion = await Estacion.findByPk(estacion_id);
  if (estacion) {
    const bici = await Bicicleta.findOne({ where: { bicicleta_id: bicicleta_id } });

    if (bici) {
      try {
        mensaje = (await estacion.devolverBici(bici)).toString();
      } catch (error) {
        mensaje = error
      }
    } else {
      mensaje = "La bicicleta indicada no existe";
    }

  }
  else {
    mensaje = "La estacion indicada no existe";
  }

  let html = await createHtml("mensaje", mensaje);
  res.status(200).send(html);
});

app.post("/deudas/", async (req, res) => {
  isAdmin(
    req,
    async () => {
      let query = await Retiro.findAll({
        where: {
          [Op.not]: { time_end: null },
        },
      });
      let rec = 0;
      for (let r of query) {
        rec += await r.generarDeuda();
        await r.save();
      }
      res.status(200).send("Recuadado: $" + rec);
    },
    error(res)
  );
});

// LOGIN

app.get("/login/", async (req, res) => {
  let html = await createHtml("login", req.session);
  res.status(200).send(html);
});

app.post("/login/", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  let u = await Usuario.findOne({
    where: {
      username: username,
    },
  });

  if (await u?.loginAttemp(password)) {
    req.session.user = { id: u.user_id, admin: u.admin };
    let html = await createHtml("mensaje", "Login exitoso");
    res.status(200).send(html);
  } else {
    res.status(401).redirect("/login/");
  }
});

app.get("/logout", async (req, res) => {
  req.session.destroy(async (err) => {
    if (err) {
      return res
        .status(501)
        .send("Hubo un error inesperado, pero no es tu culpa!");
    }
    res.clearCookie("connect.sid");
    res
      .status(200)
      .send(await createHtml("mensaje", "Sesión cerrada correctamente."));
  });
});
