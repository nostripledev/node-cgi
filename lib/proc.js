const fs = require('fs');
const path = require('path');

const run = require('./run');

const DEFAULTS = {
    render: {
        '.pug.nd': x => require('pug').render(x),
        '.md.nd': x => require('marked')(x)
    }
};

const get_render_fn = (name, map) => {
    return map[Object.keys(map).filter(ext => name.endsWith(ext))[0]];
};

module.exports = (env, options) => {
    const settings = {...DEFAULTS, ...options};

    const filename = env.PATH_TRANSLATED;
    const src = fs.readFileSync(filename, 'utf-8');

    let content = '';
    const write = x => {content += String(x);};

    const hdrs = {};
    const header = (key, value) => {hdrs[key] = value;};
    header.plain = () => header('Content-Type', 'text/plain');
    header.html = () => header('Content-Type', 'text/html');
    header.json = () => header('Content-Type', 'application/json');
    header.html();

    const glob = {
        env,
        header,
        write,
        require: id => {
            if (id.includes('/') || !id.endsWith('.php++')) { // Sécurité pour n'inclure que des fichiers avec l'extension "php++"
                throw new Error(`Invalid module path: ${id}`);
            }
            id = path.resolve(path.dirname(filename), id);
            return require(id);
        },
        echo: write // Ajout de la fonction "echo" en utilisant la fonction "write"
    };
    glob.global = glob;

    run(src, glob);

    const fn = get_render_fn(filename, settings.render);
    if (typeof fn === 'function') {
        content = fn(content);
    }

    header('Content-Length', content.length);
    return Object.keys(hdrs)
        .map(key => `${key}: ${hdrs[key]}\r\n`)
        .join('') + '\r\n' + content;
};
