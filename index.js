
const { Barrio } = require('./controllers/Barrio');
const { Bicicleta } = require('./controllers/Bicicleta');
const { Usuario } = require('./controllers/Usuario');
const { Retiro } = require('./controllers/Retiro');
const { Estacion } = require('./controllers/Estacion');

const express = require("express");
const app = express();

const mysql = require('mysql')
const connection = mysql.createConnection({
  host:     "localhost",
  user:     "root",
  password: "contraseña12345",
  database: "db_tp"
});
connection.connect();

const http = require("http").createServer(app);
const cors = require("cors");
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const uri = process.env.MONGO_URI;

/******/
const { userInfo } = require("os");

app.use(cors());
app.use(express.json());

  app.get("/barrios/", async (req, res) => {
    const query = await Barrio.findAll({})
    res.status(200).json(query);
    /**
     * 
     connection.query(`SELECT * FROM barrio`,function(err,rows,fields){
      if(err) {
        res.status(501).send(err.message);;
      }
      else{
        console.log("Mostrando barrios");
      res.status(200).json(rows);
    }
  })
  */
  });

  app.get("/barrios/:id/", async (req, res) => {
    const {id} = req.params;
    connection.query(`SELECT * FROM barrio WHERE barrio_id = ${id}`,function(err,rows,fields){
      if(err) {
        res.status(501).send(err.message);;
      }
      else{
        console.log("Mostrando barrio " + id);

        res.status(200).json(rows[0]);
      }
    })
  });

  app.get("/barrios/:id/estaciones/", async (req, res) => {
    const {id} = req.params;
    connection.query(`SELECT * FROM estacion WHERE barrio_id = ${id}`,function(err,rows,fields){
      if(err) {
        res.status(501).send(err.message);;
      }
      else{
        console.log("Mostrando estaciones del barrio " + id);
        res.status(200).json(rows);
      }
    })
  });
  
  app.get("/bicicletas/", async (req, res) => {
    connection.query(`SELECT * FROM bicicleta`,function(err,rows,fields){
      if(err) {
        console.log(err.message);
        res.status(501).send(err.message);;
      }
      else{
        console.log("Mostrando bicicletas");
        res.status(200).json(rows);
      }
    })
  });

  app.get("/bicicletas/:id/", async (req, res) => {
    const {id} = req.params;
    connection.query(`SELECT * FROM bicicleta WHERE bicicleta_id = ${id}`,function(err,rows,fields){
      if(err) {
        res.status(501).send(err.message);;
      }
      else{
        console.log("Mostrando bicicleta " + id);
        res.status(200).json(rows[0]);
      }
    })
  });

  app.get("/estaciones/", async (req, res) => {
    connection.query(`SELECT * FROM estacion`,function(err,rows,fields){
      if(err) {
        console.log(err.message);
        res.status(501).send(err.message);;
      }
      else{
        console.log("Mostrando estaciones");
        res.status(200).json(rows);
      }
    })
  });

  app.get("/estaciones/:id/", async (req, res) => {
    const {id} = req.params;
    connection.query(`SELECT * FROM estacion WHERE estacion_id = ${id}`,function(err,rows,fields){
      if(err) {
        res.status(501).send(err.message);;
      }
      else{
        console.log("Mostrando estacion" + id);
        res.status(200).json(rows[0]);
      }
    })
  });

  app.get("/estaciones/:id/bicicletas/", async (req, res) => {
    const {id} = req.params;
    connection.query(`SELECT * FROM bicicleta b WHERE b.estacion_id = ${id}`,function(err,rows,fields){
      if(err) {
        res.status(501).send(err.message);;
      }
      else{
        console.log("Mostrando bicicletas en la estacion" + id);
        res.status(200).json(rows);
      }
    })
  });

  app.get("/estaciones/:id/retiros/", async (req, res) => {
    const {id} = req.params;
    connection.query(`SELECT * FROM retiro WHERE estacion_end = ${id}`,function(err,rows,fields){
      if(err) {
        res.status(501).send(err.message);;
      }
      else{
        console.log("Mostrando retiros realizados en la estacion" + id);
        res.status(200).json(rows);
      }
    })
  });

  app.get("/estaciones/:id/usuarios/", async (req, res) => {
    const {id} = req.params;
    connection.query(`SELECT * FROM estacion e, retiro r WHERE e.estacion_id IN(r.estacion_start, r.estacion_end) AND r.user_id = ${id}`,function(err,rows,fields){
      if(err) {
        res.status(501).send(err.message);;
      }
      else{
        console.log("Mostrando usuarios que hayan usado la estacion " + id);
        res.status(200).json(rows);
      }
    })
  });

  app.get("/usuarios/", async (req, res) => {
    connection.query(`SELECT * FROM usuario`,function(err,rows,fields){
      if(err) {
        console.log(err.message);
        res.status(501).send(err.message);;
      }
      else{
        console.log("Mostrando usuarios");
        res.status(200).json(rows);
      }
    })
  });

  app.get("/usuarios/:id/", async (req, res) => {
    const {id} = req.params;
    connection.query(`SELECT * FROM usuario WHERE user_id = ${id}`,function(err,rows,fields){
      if(err) {
        res.status(501).send(err.message);;
      }
      else{
        console.log("Mostrando usuario " + id);
        res.status(200).json(rows[0]);
      }
    })
  });

  app.get("/usuarios/:id/bicicletas/", async (req, res) => {
    const {id} = req.params;
    connection.query(`SELECT * FROM bicicleta b, retiro r WHERE b.bicicleta_id = r.bici_id AND r.user_id = ${id}`,function(err,rows,fields){
      if(err) {
        res.status(501).send(err.message);;
      }
      else{
        console.log("Mostrando bicicletas utilizadas por el usuario " + id);
        res.status(200).json(rows);
      }
    })
  });

  app.get("/retiros/", async (req, res) => {
    connection.query(`SELECT * FROM retiro`,function(err,rows,fields){
      if(err) {
        res.status(501).send(err.message);;
      }
      else{
        console.log("Mostrando retiros");
        res.status(200).json(rows);
      }
    })
  });

  app.get("/retiros/abiertos", async (req, res) => {
    connection.query(`SELECT * FROM retiro WHERE time_end IS NULL`,function(err,rows,fields){
      if(err) {
        res.status(501).send(err.message);;
      }
      else{
        console.log("Mostrando retiros abiertos");
        res.status(200).json(rows);
      }
    })
  });

  app.get("/retiros/cerrados", async (req, res) => {
    connection.query(`SELECT * FROM retiro WHERE time_end IS NOT NULL`,function(err,rows,fields){
      if(err) {
        res.status(501).send(err.message);;
      }
      else{
        console.log("Mostrando retiros cerrados");
        res.status(200).json(rows);
      }
    })
  });

// GET - POST - DELETE - PUT - PATCH 

  app.post("/retiros/",(req,res) => {
    const bici_id = req.headers.bicicleta_id;
    const user_id = req.headers.user_id;
    connection.query(`call db_tp.ABRIR_RETIRO(${bici_id},${user_id});`,function(err,rows,fields){
      if(err) {
        console.log("Intento fallido de creacion de bici " + bici_id + " por parte del usuario " + user_id)
        res.status(501).send(err.message);
      }
      else{
        const msg = "Bicicleta "+bici_id+" retirada por "+user_id
        console.log(msg)
        res.status(200).send(msg);
      }
    });
  }); 

  app.patch("/retiros/",(req,res) => {
    const bici_id = req.headers.bicicleta_id;
    const esta_id = req.headers.estacion_id;
    connection.query(`call db_tp.CERRAR_RETIRO(${bici_id},${esta_id});`,function(err,rows,fields){
      if(err){
        console.log("Intento fallido de creacion de bici " + bici_id + " en la estacion " + esta_id)
        res.status(501).send(err.message);
      }
      else{
        let msg = ""
        if(rows.keys.count>0){
          msg = "Bicicleta "+bici_id+" devuelta en por "+esta_id;
        }
        else{
          msg = "Bicicleta "+bici_id+" no tenia un retiro abierto";
          
        }
          console.log(msg)
          res.status(200).send(msg);
      }
    });
  });

app.post("/auth/login", async (req,res) => {

    const email = req.body.email;
    const password = req.body.password;
    try{
      const result = await AuthController.login(email,password);
      if(result){
        res.status(200).json(result);
      }else{
        res.status(401).send("No puede estar aqui")
      }
    }catch(error){
        res.status(500).send("Error");
    }  
})

/* Manda un mail */

http.listen(PORT, () => {
  console.log(`Listening to ${PORT}`);
});
