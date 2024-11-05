/**
 * En base al request genera un objeto FindOptions para paginar queries de sequelize
 * @param {Request} req 
 * @returns FindOptions
 */
export default function getPaginacion(req){
    let items = Number(req.query.items || process.env.DEFAULT_ITEM_COUNT);
    let page = Number((req.query.page - 1) * items || process.env.DEFAULT_PAGE);

    return {
        limit: items+1, // para poder obtener 
        offset: page,
        subQuery:false
      }
}