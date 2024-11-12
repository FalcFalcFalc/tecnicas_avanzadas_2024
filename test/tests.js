//import { assert, expect, should } from 'chai';
import assert from "assert";
import { Barrio, Bicicleta, Usuario, Estacion, Retiro } from "../controllers/Models.js";
import { addMinutes } from "../middleware/calculadoraDeDeuda.js";

describe("Tests", async () => {
    let retiro;
    let estacion;
    let bicicleta;
    let usuario;
    let deudaBase = 50;

    let r;
    
    beforeEach(async () => {
        estacion = await Estacion.create({
            barrio_id: 1,
            capacidad: 100
        });
        bicicleta = await Bicicleta.create({
            estacion_id: estacion?.estacion_id,
            bicicleta_codigo: "ZZZ999"
        });
        usuario = await Usuario.create({
            nombre: 'Pruebancio', apellido: 'Testalez',
            username: 'test', password: 'test', admin: false
        });

        usuario.agregarDeuda(deudaBase);
        usuario.save();
    });

    afterEach(async () => {
        await retiro?.destroy();
        await r?.destroy();
        await usuario?.destroy();
        await bicicleta?.destroy();
        await estacion?.destroy();
    });

    it("Retiro y devolución funcionando", async () => {
        assert.equal(bicicleta.estacion_id, estacion.estacion_id);

        retiro = await usuario.retirarBici(bicicleta);
        assert.equal(retiro.time_end, null);
        assert.equal(retiro.user_id, usuario.user_id);

        assert.equal(bicicleta.estacion_id, null);
        assert.equal(retiro.estacion_start, estacion.estacion_id);

        r = await estacion.devolverBici(bicicleta);

        assert.equal(bicicleta.estacion_id, estacion.estacion_id);
        assert.equal(retiro.bicicleta_id, r.bicicleta_id);
        assert.notEqual(r.time_end, null);

    });
    it("Menos de media hora cuesta gratis", async ()=>{
        bicicleta.estacion_id = null;
        await bicicleta.save();

        retiro = await Retiro.create({
            user_id: usuario.user_id,
            bicicleta_id: bicicleta.bicicleta_id,
            estacion_start: estacion.estacion_id,
            time_start: addMinutes(new Date(),-30),
            time_end: null,
            estacion_end: null,
            deuda_generada: null
        });

        let r = await estacion.devolverBici(bicicleta);

        assert.equal(retiro.user_id,r.user_id);
        assert.equal(retiro.bicicleta_id,r.bicicleta_id);
        assert.equal(new Date(retiro.time_start).setMilliseconds(0),new Date(r.time_start).setMilliseconds(0));

        assert.equal(r.deuda_generada,0)
        assert.equal(usuario.deuda_actual,deudaBase+r.deuda_generada)
    })
    it("Más de media hora genera deuda", async ()=>{
        bicicleta.estacion_id = null;
        await bicicleta.save();

        const noTiempoDeGracia = 100;
        retiro = await Retiro.create({
            user_id: usuario.user_id,
            bicicleta_id: bicicleta.bicicleta_id,
            estacion_start: estacion.estacion_id,
            time_start: addMinutes(new Date(),-30-noTiempoDeGracia),
            time_end: null,
            estacion_end: null,
            deuda_generada: null
        });

        let r = await estacion.devolverBici(bicicleta);

        assert.equal(retiro.user_id,r.user_id);
        assert.equal(retiro.bicicleta_id,r.bicicleta_id);
        assert.equal(new Date(retiro.time_start).setMilliseconds(0),new Date(r.time_start).setMilliseconds(0));

        const deudaEsperada = noTiempoDeGracia * process.env.PRECIO_POR_MINUTO;
        usuario = await Usuario.findByPk(usuario.user_id);

        assert.equal(r.deuda_generada,deudaEsperada)
        assert.equal(usuario.deuda_actual,deudaBase+r.deuda_generada)
    })
});


//https://devox.me/PREG/c3e2da79-ac99