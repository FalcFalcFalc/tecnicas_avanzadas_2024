/**
 * Filtra arrays utilizando criterio asincrónico, ideal para utilizar con métodos del objecto mismo
 * @param {Array<T>} query 
 * @param {(elem:T)=>Promise<Boolean>} criterio 
 * @returns Array<T>
 */
export default async function filterQuery(query, criterio) {
    return (await Promise.all( // filter no funciona correctamente de forma asincronica
        query
        .map( // asi que mapeo todos los elementos a un array de conjuntos entre el elemento en si, y el resultado del criterio de fitlrado
          async(n) => ({
            objeto: n,
            criterio: await criterio(n)
          })
        )
      )) // al cerrarse este parentesis, se ejecutan todas las promesas y se puede trabajar sincronicamente
      .filter(e => e.criterio) // filtro en base al criterio
      .map(o => o.objeto); // y obtengo nuevamente el objeto
}