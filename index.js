import express, { json } from "express";
import http from "http"
import cors from "cors";
import { Op } from 'sequelize';
import { Barrio, Bicicleta, Usuario, Estacion, Retiro } from './controllers/Models.js';

const PORT = 5000;
const app = express();
app.use(cors());
app.use(json());

http.createServer(app);

app.listen(PORT)

  app.get("/barrios/", async (req, res) => {
    let query = await Barrio.findAll({})
    res.status(200).json(query);
  });

  app.get("/barrios/:id/", async (req, res) => {
    let {id} = req.params;
    let query = await Barrio.findOne({where:{barrio_id: id}})
    res.status(200).json(query);
  });

  app.get("/barrios/:id/estaciones/", async (req, res) => {
    let {id} = req.params;
    let query = await Estacion.findAll({where:{barrio_id: id}})
    res.status(200).json(query);
  });

  app.get("/bicicletas/", async (req, res) => {
    let query = await Bicicleta.findAll({})
    res.status(200).json(query);
  });

  app.get("/bicicletas/:id/", async (req, res) => {
    let {id} = req.params;
    let query = await Bicicleta.findAll({where:{bicicleta_id: id}})
    res.status(200).json(query);
  });

  app.get("/estaciones/", async (req, res) => {
    let query = await Estacion.findAll()
    res.status(200).json(query);
  });

  app.get("/estaciones/:id/", async (req, res) => {
    let {id} = req.params;
    let query = await Estacion.findAll({where:{estacion_id: id}})
    res.status(200).json(query);
  });

  app.get("/estaciones/:id/bicicletas/", async (req, res) => {
    let {id} = req.params;
    let query = await Bicicleta.findAll({where:{estacion_id: id}})
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
    let query = await Usuario.findAll({where:{estacion_id: id}})
    res.status(200).json(query);
  });

  app.get("/usuarios/", async (req, res) => {
    let query = await Usuario.findAll()
    res.status(200).json(query);
  });

  app.get("/usuarios/:id/", async (req, res) => {
    let {id} = req.params;
    let query = await Usuario.findAll({where:{user_id: id}})
    res.status(200).json(query);
  });

  app.get("/usuarios/:id/bicicletas/", async (req, res) => {
    let {id} = req.params;
    let query = await Bicicleta.findAll(
      {
        include: [
          { 
            model: Retiro,
            required: true,
            attributes: [],
            where:{
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
    let query = await Retiro.findAll({where:{time_end:null}})
    res.status(200).json(query);
  });

  app.get("/retiros/cerrados", async (req, res) => {
    let query = await Retiro.findAll({where:{[Op.not]:{time_end:null}}})
    res.status(200).json(query);
  });

// GET - POST - DELETE - PUT - PATCH 

  app.post("/retiros/", async(req,res) => {
    const bicicleta_id = req.headers.bicicleta_id;
    const user_id = req.headers.user_id;
    connection.query(`call db_tp.ABRIR_RETIRO(${bicicleta_id},${user_id});`,function(err,rows,fields){
      if(err) {
        console.log("Intento fallido de creacion de bici " + bicicleta_id + " por parte del usuario " + user_id)
    res.status(501).send(err.message);
      }
      else{
        const msg = "Bicicleta "+bicicleta_id+" retirada por "+user_id
        console.log(msg)
    res.status(200).send(msg);
      }
  });
  }); 

  app.patch("/retiros/", async(req,res) => {
    const bicicleta_id = req.headers.bicicleta_id;
    const esta_id = req.headers.estacion_id;
    connection.query(`call db_tp.CERRAR_RETIRO(${bicicleta_id},${esta_id});`,function(err,rows,fields){
      if(err){
        console.log("Intento fallido de creacion de bici " + bicicleta_id + " en la estacion " + esta_id)
    res.status(501).send(err.message);
      }
      else{
        let msg = ""
        if(rows.keys.count>0){
          msg = "Bicicleta "+bicicleta_id+" devuelta en por "+esta_id;
        }
        else{
          msg = "Bicicleta "+bicicleta_id+" no tenia un retiro abierto";
          
        }
          console.log(msg)
    res.status(200).send(msg);
      }
  });
  });