import 'dotenv/config'
import { Op } from 'sequelize';
import bodyParser from 'body-parser';
import cors from "cors";
import express, { json } from "express";
import http from "http"
import session from 'express-session';
import isAuthenticated from './middleware/auth-middleware.js'

import { Barrio, Bicicleta, Usuario, Estacion, Retiro } from './controllers/Models.js';

const app = express();
app.use(cors());
app.use(json());
app.use(bodyParser.json());
app.set('view engine', 'jade');
app.use(session({
  secret: process.env.SESSION_KEY, 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 } 
}));

http.createServer(app);

const PORT = 5000;
app.listen(process.env.PORT || PORT);

  app.get("/barrios/", async (req, res) => {
    let query = await Barrio.findAll({})
    res.status(200).json(query);
  });

  app.get("/barrios/:id/", async (req, res) => {
    let {id} = req.params;
    let query = await Barrio.findOne({
      where: {
        barrio_id: id
      }
    });
    res.status(200).json(query);
  });

  app.get("/barrios/:id/estaciones/", async (req, res) => {
    let {id} = req.params;
    let query = await Estacion.findAll({
      where: {
        barrio_id: id
      }
    });
    res.status(200).json(query);
  });

  app.get("/bicicletas/", async (req, res) => {
    let query = await Bicicleta.findAll({})
    res.status(200).json(query);
  });

  app.get("/bicicletas/:id/", async (req, res) => {
    let {id} = req.params;
    let query = await Bicicleta.findAll({
      where: {
        bicicleta_id: id
      }
    });
    res.status(200).json(query);
  });

  app.get("/estaciones/", async (req, res) => {
    let query = await Estacion.findAll()
    res.status(200).json(query);
  });

  app.get("/estaciones/:id/", async (req, res) => {
    let {id} = req.params;
    let query = await Estacion.findAll({
      where: {
        estacion_id: id
      }
    });
    res.status(200).json(query);
  });

  app.get("/estaciones/:id/bicicletas/", async (req, res) => {
    let {id} = req.params;
    let query = await Bicicleta.findAll({
      where: {
        estacion_id: id
      }
    });
    res.status(200).json(query);
  });

  app.get("/estaciones/:id/retiros/", async (req, res) => {
    let {id} = req.params;
    let query = await Retiro.findAll({
      where: {
        [Op.or]: [
          {estacion_end: id},
          {estacion_start: id}
        ]
      }
    })
    res.status(200).json(query);
  });

  app.get("/estaciones/:id/usuarios/", async (req, res) => {
    let {id} = req.params;
    let query = await Usuario.findAll({
      where: {
        estacion_id: id
      }
    });
    res.status(200).json(query);
  });

  app.get("/usuarios/", async (req, res) => {
    let query = await Usuario.findAll()
    res.status(200).json(query);
  });

  app.get("/usuarios/:id/", async (req, res) => {
    let {id} = req.params;
    let query = await Usuario.findAll({
      where: {
        user_id: id
      }
    });
    res.status(200).json(query);
  });

  app.get("/usuarios/:id/bicicletas/", async (req, res) => {
    let {id} = req.params;
    let query = await Bicicleta.findAll({
      include: [
        { 
          model: Retiro,
          required: true,
          attributes: [],
          where: {
            user_id: id
          },
        }
      ],
    });
    res.status(200).json(query);
  });

  app.get("/retiros/", async (req, res) => {
    let query = await Retiro.findAll()
    res.status(200).json(query);
  });

  app.get("/retiros/abiertos", async (req, res) => {
    let query = await Retiro.findAll({
      where: {
        time_end:null
      }
    });
    res.status(200).json(query);
  });

  app.get("/retiros/cerrados", async (req, res) => {
    let query = await Retiro.findAll({
      where: {
        [Op.not]: {time_end:null}
      }
    });
    res.status(200).json(query);
  });

// GET - POST - DELETE - PUT - PATCH 

  
  app.post("/usuarios/", async(req,res) => {
    const nombre = req.headers.nombre;
    const apellido = req.headers.apellido;
    const username = req.headers.username;
    const password = req.headers.password;
    
    res.status(200).send(await Usuario.create({
      nombre: nombre,
      apellido: apellido,
      username: username,
      password: password
    }));
  }); 

  app.post("/retiros/", async(req,res) => {
    isAuthenticated(req,res, async () => {
      const bicicleta_id = req.headers.bicicleta_id;
      const { id }      = req.session.user;
  
      const user = await Usuario.findByPk(id);
      if(user === null) {
        res.status(501).send('Usuario no encontrado');
        return;
      }
      
      const bici = await Bicicleta.findByPk(bicicleta_id);
      if(bici === null) {
        res.status(501).send('Bicicleta no encontrada');
        return;
      }
      
      res.status(200).send(await user.retirarBici(bici));
    })

  }); 

  app.patch("/retiros/", async(req,res) => {
    isAuthenticated(req,req,async()=>{
      const bicicleta_id = req.headers.bicicleta_id;
      const estacion_id = req.headers.estacion_id; // por cuestiones de seguridad debería ser una cookie instalada dentro
                                                  //  de cada sistema de procesamiento interno de la estacion

      const estacion = await Estacion.findByPk(estacion_id);
      if(estacion === null) {
        res.status(501).send('Estacion no encontrada');
        return;
      }
      
      const bici = await Bicicleta.findByPk(bicicleta_id);
      if(bici === null) {
        res.status(501).send('Bicicleta no encontrada');
        return;
      }
      
      res.status(200).send(await estacion.devolverBici(bici));
    })
  });
  
  app.post("/login", async(req,res)=>{
    isAuthenticated(req,res,async()=>{
      const username = req.headers.username;
      const password = req.headers.password;
      let u = await Usuario.findOne({
        where: {
          username: username
        }
      });


      if(await u.loginAttemp(password)){
        req.session.user = { id: u.user_id }; 
        res.status(200).send("Inicio de sesión exitoso");
      }
      else {
        res.status(401).send("Credenciales incorrectas");
      }
    },true);
  });

  app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(501).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid'); 
        res.status(200).send('Logged out successfully');
    });
});

