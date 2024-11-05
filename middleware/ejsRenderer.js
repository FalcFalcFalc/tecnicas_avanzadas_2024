import ejs from 'ejs';

/**
 * Si data es un array, elimina el ultimo objeto y renderiza la página en base 
 * @param {String} page nombre de la página a renderizar
 * @param {any} data data para que utilice el archivo .ejs
 * @param {Request} req request
 * @returns HTML String
 */
export default async function createHtml(page,data,req) {
    let hasNextPage = false;
    let params;
    if(req && data){
        params = req.query
        let keys = Object.keys(data);
        let itemCount = params.items || process.env.DEFAULT_ITEM_COUNT;
        hasNextPage = keys.length > itemCount;
        
        if (keys.length > 0 && hasNextPage) {
            let lastKey = keys[keys.length - 1];
            delete data[lastKey];
        }
        data = data?.filter(Boolean)
    }
    let template = await ejs.renderFile(`./views/${page}.ejs`,{data:data});
    let html = await ejs.renderFile('./views/inicio.ejs',{template:template,params:params,hasNextPage:hasNextPage});
    return html;
}