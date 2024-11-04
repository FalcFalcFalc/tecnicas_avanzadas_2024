import ejs from 'ejs';

export default async function createHtml(page,query,req) {
    let params = req.query
    let keys = Object.keys(query);
    let itemCount = params.items || process.env.DEFAULT_ITEM_COUNT;

    console.log(`${keys.length} > ${itemCount}`)
    const hasNextPage = keys.length > itemCount;

    if (keys.length > 0 && hasNextPage) {
        let lastKey = keys[keys.length - 1];
        delete query[lastKey];
    }

    query = query.filter(Boolean)

    let template = await ejs.renderFile(`./views/${page}.ejs`,{query:query});
    let html = await ejs.renderFile('./views/inicio.ejs',{template:template,params:params,hasNextPage:hasNextPage});
    return html;
}