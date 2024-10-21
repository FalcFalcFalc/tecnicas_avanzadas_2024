const express = require("express");
const app = express();
const port = 3000;
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
const UsrController = require('./controllers/user');
const AuthController = require('./controllers/auth');
const Middleware = require('./middleware/auth-middleware');
const MailController = require('./controllers/mail');

app.use(cors());
app.use(express.json());
app.set('json spaces', 2)

  app.get("/barrios/", (req, res) => {
    connection.query(`SELECT * FROM barrio`,function(err,rows,fields){
      if(err) {
        console.log(err.message);
        res.status(err.code);
      }
      else{
        console.log("OK");
        res.status(200).json(rows);
      }
    })
  });

  app.get("/barrios/:id/", (req, res) => {
    const {id} = req.params;
    connection.query(`SELECT * FROM barrio WHERE barrio_id = ${id}`,function(err,rows,fields){
      if(err) {
        res.status(err.code);
      }
      else{
        res.status(200).json(rows[0]);
      }
    })
  });

  app.get("/barrios/:id/estaciones/", (req, res) => {
    const {id} = req.params;
    connection.query(`SELECT * FROM estacion WHERE barrio_id = ${id}`,function(err,rows,fields){
      if(err) {
        res.status(err.code);
      }
      else{
        res.status(200).json(rows);
      }
    })
  });
  
  app.get("/bicicletas/", (req, res) => {
    connection.query(`SELECT * FROM bicicleta`,function(err,rows,fields){
      if(err) {
        console.log(err.message);
        res.status(err.code);
      }
      else{
        console.log("OK");
        res.status(200).json(rows);
      }
    })
  });

  app.get("/bicicletas/:id/", (req, res) => {
    const {id} = req.params;
    connection.query(`SELECT * FROM bicicleta WHERE bicicleta_id = ${id}`,function(err,rows,fields){
      if(err) {
        res.status(err.code);
      }
      else{
        res.status(200).json(rows[0]);
      }
    })
  });

  app.get("/estaciones/", (req, res) => {
    connection.query(`SELECT * FROM estacion`,function(err,rows,fields){
      if(err) {
        console.log(err.message);
        res.status(err.code);
      }
      else{
        console.log("OK");
        res.status(200).json(rows);
      }
    })
  });

  app.get("/estaciones/:id/", (req, res) => {
    const {id} = req.params;
    connection.query(`SELECT * FROM estacion WHERE estacion_id = ${id}`,function(err,rows,fields){
      if(err) {
        res.status(err.code);
      }
      else{
        res.status(200).json(rows[0]);
      }
    })
  });

  app.get("/estaciones/:id/bicicletas/", (req, res) => {
    const {id} = req.params;
    connection.query(`SELECT * FROM bicicleta b WHERE b.estacion_id = ${id}`,function(err,rows,fields){
      if(err) {
        res.status(err.code);
      }
      else{
        res.status(200).json(rows);
      }
    })
  });

  app.get("/estaciones/:id/retiros/", (req, res) => {
    const {id} = req.params;
    connection.query(`SELECT * FROM retiro WHERE estacion_salida = ${id}`,function(err,rows,fields){
      if(err) {
        res.status(err.code);
      }
      else{
        res.status(200).json(rows);
      }
    })
  });

  app.get("/estaciones/:id/usuarios/", (req, res) => {
    const {id} = req.params;
    connection.query(`SELECT * FROM estacion e, retiro r WHERE e.estacion_id IN [r.estacion_salida, r.estacion_llegada] AND r.user_id = ${id}`,function(err,rows,fields){
      if(err) {
        res.status(err.code);
      }
      else{
        res.status(200).json(rows);
      }
    })
  });

  app.get("/usuarios/", (req, res) => {
    connection.query(`SELECT * FROM usuario`,function(err,rows,fields){
      if(err) {
        console.log(err.message);
        res.status(err.code);
      }
      else{
        console.log("OK");
        res.status(200).json(rows);
      }
    })
  });

  app.get("/usuarios/:id/", (req, res) => {
    const {id} = req.params;
    connection.query(`SELECT * FROM usuario WHERE user_id = ${id}`,function(err,rows,fields){
      if(err) {
        res.status(err.code);
      }
      else{
        res.status(200).json(rows[0]);
      }
    })
  });

  app.get("/usuarios/:id/bicicletas/", (req, res) => {
    const {id} = req.params;
    connection.query(`SELECT * FROM bicicleta b, retiro r WHERE b.bicicleta_id = r.bicicleta_id AND r.user_id = ${id}`,function(err,rows,fields){
      if(err) {
        res.status(err.code);
      }
      else{
        res.status(200).json(rows);
      }
    })
  });

  app.get("/retiros/", (req, res) => {
    connection.query(`SELECT * FROM retiro`,function(err,rows,fields){
      if(err) {
        res.status(err.code);
      }
      else{
        res.status(200).json(rows);
      }
    })
  });

// GET - POST - DELETE - PUT - PATCH 

  app.post("/retiros/",(req,res) => {
    res.send("INSERT INTO retiro (bicicleta_id, user_id) VALUES {...}"); //me gustaría mejor usar un procedure
  });

  app.patch("/retiros/",(req,res) => {
      res.send("UPDATE retiro (bicicleta_id, estacion_llegada) VALUES {...} WHERE estacion_llegada IS NULL and bicicleta_id = ${id}"); //me gustaría mejor usar un procedure
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
MailController.sendMail();

http.listen(PORT, () => {
  console.log(`Listening to ${PORT}`);
});
