function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60 * 1000); //calculado en MS -> 1000 ms = 1 seg -> 60 seg = 1 min
}

export default function calcularDeuda(start, end) {
    const startTime = addMinutes(new Date(start),30);
    const endTime   =  new Date(end);

    console.log(endTime + " - " + startTime);
    let diffInMinutes = Math.floor((endTime - startTime) / (1000 * 60));

    if (diffInMinutes < 0) {
        diffInMinutes = 0;
    }

    const result = diffInMinutes * process.env.PRECIO_POR_MINUTO;

    return result;
}