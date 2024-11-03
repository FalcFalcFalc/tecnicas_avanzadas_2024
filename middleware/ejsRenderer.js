import ejs from 'ejs';


export default async function createHtml(page,data) {
    let template = await ejs.renderFile(`./views/${page}.ejs`,data);
    let header = await ejs.renderFile('./views/inicio.ejs');
    return header + '\n' + template;
}