/**
 * Agrega minutos a una fecha
 * @param {Date} date 
 * @param {Number} minutes 
 * @returns Date
 */
export function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60 * 1000); //calculado en MS -> 1000 ms = 1 seg -> 60 seg = 1 min
}

/**
 * En base a end - start + 30' devuelve el precio de la utilizacion de una bicicleta por esos rangos de tiempo
 * @param {Date} start tiempo de inicio
 * @param {Date} end tiempo de fin
 * @returns Number
 */
export default function calcularDeuda(start, end) {
    const startTime = addMinutes(new Date(start),30);
    const endTime   =  new Date(end);

    let diffInMinutes = Math.floor((endTime - startTime) / (1000 * 60));

    if (diffInMinutes < 0) {
        diffInMinutes = 0;
    }
    
    console.log("++++++++++"+Number(process.env.PRECIO_POR_MINUTO))
    const result = diffInMinutes * Number(process.env.PRECIO_POR_MINUTO);
    return result;
}