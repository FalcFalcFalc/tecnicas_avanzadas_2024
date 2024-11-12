//import { assert, expect, should } from 'chai';
import assert from 'assert';
import { Barrio, Bicicleta, Usuario, Estacion, Retiro } from '../controllers/Models.js';
import { addMinutes } from '../middleware/calculadoraDeDeuda.js';

describe('Tests', async () => {
	let retiro;
	let estacion;
	let bicicleta;
	let usuario;
	let deudaBase = 50;

	let r;

	beforeEach(async () => {
		estacion = await Estacion.create({
			barrio_id: 1,
			capacidad: 100,
		});
		bicicleta = await Bicicleta.create({
			estacion_id: estacion?.estacion_id,
			bicicleta_codigo: 'ZZZ999',
		});
		usuario = await Usuario.create({
			nombre: 'Pruebancio',
			apellido: 'Testalez',
			username: 'test',
			password: 'test',
			admin: false,
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

	// TESTS POSITIVOS
	it('Retiro y devolución funcionando', async () => {
		assert.equal(bicicleta.estacion_id, estacion.estacion_id, 'Bicicleta no asignada correctamente al inicio');

		retiro = await usuario.retirarBici(bicicleta);
		assert.equal(retiro.time_end, null, 'Retiro cerrado prematuramente');
		assert.equal(retiro.user_id, usuario.user_id, 'Usuario incorrecto en el retiro');

		assert.equal(bicicleta.estacion_id, null, 'Bicicleta no retirada');
		assert.equal(retiro.estacion_start, estacion.estacion_id, 'Estacion errónea pre devolucion');

		r = await estacion.devolverBici(bicicleta);

		assert.equal(bicicleta.estacion_id, estacion.estacion_id, 'Estacion errónea post devolucion');
		assert.equal(retiro.bicicleta_id, r.bicicleta_id, 'Bicicleta errónea');
		assert.notEqual(r.time_end, null, 'Retiro no cerrado');
	});
	it('Menos de media hora cuesta gratis', async () => {
		bicicleta.estacion_id = null;
		await bicicleta.save();

		retiro = await Retiro.create({
			user_id: usuario.user_id,
			bicicleta_id: bicicleta.bicicleta_id,
			estacion_start: estacion.estacion_id,
			time_start: addMinutes(new Date(), -30),
			time_end: null,
			estacion_end: null,
			deuda_generada: null,
		});

		let r = await estacion.devolverBici(bicicleta);
		assert.notEqual(r, null, 'Retiro nulo al devolver');
		assert.equal(retiro.user_id, r.user_id, 'Usuario erróneo');
		assert.equal(retiro.bicicleta_id, r.bicicleta_id, 'Bicicleta errónea');
		assert.equal(
			new Date(retiro.time_start).setMilliseconds(0),
			new Date(r.time_start).setMilliseconds(0),
			'Tiempos de salida distintos'
		);
		assert.equal(r.deuda_generada, 0, 'Deuda generada distinta de 0');
		assert.equal(
			usuario.deuda_actual,
			deudaBase + r.deuda_generada,
			'Al usuario no se le acredito correctamente la deuda'
		);
	});
	it('Más de media hora genera deuda', async () => {
		bicicleta.estacion_id = null;
		await bicicleta.save();

		const noTiempoDeGracia = 100;
		retiro = await Retiro.create({
			user_id: usuario.user_id,
			bicicleta_id: bicicleta.bicicleta_id,
			estacion_start: estacion.estacion_id,
			time_start: addMinutes(new Date(), -30 - noTiempoDeGracia),
			time_end: null,
			estacion_end: null,
			deuda_generada: null,
		});

		let r = await estacion.devolverBici(bicicleta);
		assert.notEqual(r, null, 'Retiro nulo al devolver');
		assert.equal(retiro.user_id, r.user_id, 'Usuario erróneo');
		assert.equal(retiro.bicicleta_id, r.bicicleta_id, 'Bicicleta errónea');
		assert.equal(
			new Date(retiro.time_start).setMilliseconds(0),
			new Date(r.time_start).setMilliseconds(0),
			'Tiempos de salida distintos'
		);

		const deudaEsperada = noTiempoDeGracia * process.env.PRECIO_POR_MINUTO;
		usuario = await Usuario.findByPk(usuario.user_id);

		assert.equal(r.deuda_generada, deudaEsperada, `Deuda distinta de ${deudaEsperada}`);
		assert.equal(
			usuario.deuda_actual,
			deudaBase + r.deuda_generada,
			'Al usuario no se le acredito correctamente la deuda'
		);
	});

	// TESTS NEGATIVOS
	it('Estacion llena', async () => {
		retiro = await usuario.retirarBici(bicicleta);
		estacion.capacidad = 0;
		await estacion.save();
		try {
			r = await estacion.devolverBici(bicicleta);
			assert.fail('Estando la estacion sin capacidad, la bicicleta se pudo devolver');
		} catch (error) {
			// Resultado esperado
		}
	});
	it('Devolver bicicleta no retirada', async () => {
		try {
			r = await estacion.devolverBici(bicicleta);
			assert.fail('Estando la bicicleta si retirar, se pudo devolver');
		} catch (error) {
			// Resultado esperado
		}
	});
	it('Retirar bicicleta con retiro abierto', async () => {
		retiro = await usuario.retirarBici(bicicleta);
		try {
			r = await usuario.retirarBici(bicicleta);
			assert.fail('Teniendo un retiro abierto, el usuario pudo retirar');
		} catch (error) {
			// Resultado esperado
		}
	});
});
