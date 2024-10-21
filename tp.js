
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "token de mongodb";

const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');

const http = require("http").createServer(app);
const cors = require("cors");
require('dotenv').config();
const PORT = process.env.PORT || 5000;

/******/
const UsrController = require('./controllers/user');
const AuthController = require('./controllers/auth');
const Middleware = require('./middleware/auth-middleware');
const MailController = require('./controllers/mail');
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


app.use(cors());
app.use(express.json());

  app.get("/barrio/", (req, res) => {
    //res.send("SELECT * FROM barrio");
    res.status(200).json(`SELECT * FROM barrio`);
  });

  app.get("/barrio/:id/estacion/", (req, res) => {
    const {id} = req.params;
    //res.send("SELECT * FROM barrio");
    res.status(200).json(`SELECT * FROM estacion WHERE barrio_id = ${id}`);
  });

  app.get("/estacion/", (req, res) => {
    //res.send("SELECT * FROM estacion");
    res.status(200).json(`SELECT * FROM estacion`);
  });

  app.get("/estacion/:id/retiros/", (req, res) => {
    const {id} = req.params;
    //res.send("SELECT * FROM estacion");
    res.status(200).json(`SELECT * FROM retiros WHERE estacion_salida = ${id}`);
  });

  app.get("/usuario/", (req, res) => {
    //res.send("SELECT * FROM usuario");
    res.status(200).json(`SELECT * FROM usuario`);
  });

  app.get("/estacion/:id/usuario/", (req, res) => {
    const {id} = req.params;
    //res.send("SELECT * FROM usuario");
    res.status(200).json(`SELECT * FROM estacion e, retiro r WHERE e.estacion_id IN [r.estacion_salida, r.estacion_llegada] AND r.user_id = ${id}`);
  });

  app.get("/usuario/:id/bicicletas/", (req, res) => {
    const {id} = req.params;
    //res.send("SELECT * FROM usuario");
    res.status(200).json(`SELECT * FROM bicicleta b, retiro r WHERE b.bici_id = r.bici_id AND r.user_id = ${id}`);
  });

  app.get("/estacion/:id/bicicleta/", (req, res) => {
    const {id} = req.params;
    //res.send("SELECT * FROM bicicleta");
    res.status(200).json(`SELECT * FROM bicicleta WHERE estacion_id = ${id}`);
  });

  app.get("/bicicleta/", (req, res) => {
    //res.send("SELECT * FROM bicicleta");
    res.status(200).json(`SELECT * FROM bicicleta`);
  });

  app.get("/bicicleta/paraReparar/", (req, res) => {
    //res.send("SELECT * FROM bicicleta");
    res.status(200).json(`SELECT * FROM bicicleta WHERE dañada = true`);
  });

  app.get("/retiro/", (req, res) => {
    //res.send("SELECT * FROM retiro");
    res.status(200).json(`SELECT * FROM retiro`);
  });

// GET - POST - DELETE - PUT - PATCH 

  app.post("/retiro/",(req,res) => {
    res.send("INSERT INTO retiro (bici_id, user_id) VALUES {...}"); //me gustaría mejor usar un procedure
  });

  app.patch("/retiro/",(req,res) => {
      res.send("UPDATE retiro (bici_id, estacion_llegada) VALUES {...} WHERE estacion_llegada IS NULL and bici_id = ${id}"); //me gustaría mejor usar un procedure
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

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
