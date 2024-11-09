//import { assert, expect, should } from 'chai';
import assert from "assert";
import { Barrio, Bicicleta, Usuario, Estacion, Retiro } from "../controllers/Models.js";

describe("Bicicleta", async () => {
    /**
     const estacionLlena = await Estacion.create({
        barrio_id: 1,
        capacidad: 1
    });
    const bicicletaFija = await Bicicleta.create({
        bicicleta_id: 1,
        estacion_id: estacionLlena.estacion_id
    });
    */

   describe("Retiros", async () => {
        let estacionDisponible;
        let bicicleta;
        let usuario;
        
        beforeEach(async () => {
            estacionDisponible = await Estacion.create({
                barrio_id: 1,
                capacidad: 100
            });
            bicicleta = await Bicicleta.create({
                estacion_id: estacionDisponible?.estacion_id,
                bicicleta_codigo: "ZZZ999"
            });
            usuario = await Usuario.create({
                nombre: 'Pruebancio', apellido: 'Testalez',
                username: 'test', password: 'test', admin: false
            });
        });
        afterEach(async () => {
            await usuario?.destroy()
            await bicicleta?.destroy()
            await estacionDisponible?.destroy()
        });
        it("Sacar la bici a pasear", async () => {
            assert.equal(bicicleta.estacion_id, estacionDisponible.estacion_id);

            let r1 = await usuario.retirarBici(bicicleta);
            assert.equal(r1.time_end, null);
            assert.equal(r1.user_id, usuario.user_id);

            assert.equal(bicicleta.estacion_id, null);
            assert.equal(r1.estacion_start, estacionDisponible.estacion_id);

            let r2 = await estacionDisponible.devolverBici(bicicleta);

            assert.equal(bicicleta.estacion_id, estacionDisponible.estacion_id);
            assert.equal(r1.bicicleta_id, r2.bicicleta_id);
            assert.notEqual(r2.time_end, null);

            r2.destroy();
        });
    });
});
