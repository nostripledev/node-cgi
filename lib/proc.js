const fs = require('fs');
const path = require('path');
const run = require('./run');

const DEFAULT_RENDER_FNS = {
    '.pug.nd': x => require('pug').render(x),
    '.md.nd': x => require('marked')(x)
};

const getRenderFn = (name, renderFns) => {
    const ext = Object.keys(renderFns).find(ext => name.endsWith(ext));
    return ext ? renderFns[ext] : null;
};

module.exports = (env, options) => {
    const settings = {...DEFAULTS, ...options};

    const filename = env.PATH_TRANSLATED;
    const src = fs.readFileSync(filename, 'utf-8');

    let content = '';
    const echo = x => {content += String(x);};

    const hdrs = {};
    const header = (key, value) => {hdrs[key] = value;};
    header.plain = () => header('Content-Type', 'text/plain');
    header.html = () => header('Content-Type', 'text/html');
    header.json = () => header('Content-Type', 'application/json');
    header.html();

    const glob = {
        env,
        header,
        echo,
        require: id => {
            if (id.includes('/') || !id.endsWith('.php++')) {
                throw new Error(`Invalid module path: ${id}`);
            }
            id = path.resolve(path.dirname(filename), id);
            return require(id);
        },
        global: null,
    };
    glob.global = glob;

    run(src, glob);

    const renderFn = getRenderFn(filename, settings.render);
    if (renderFn) {
        content = renderFn(content);
    }

    const contentLength = content.length;
    header('Content-Length', contentLength);
    const headersStr = Object.entries(hdrs).map(([key, value]) => `${key}: ${value}\r\n`).join('');
    return `${headersStr}\r\n${content}`;
};
