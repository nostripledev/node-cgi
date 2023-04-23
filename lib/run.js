const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { PassThrough } = require('stream');
const run = require('./run');

const DEFAULT_RENDER_FNS = {
  '.pug.nd': x => require('pug').render(x),
  '.md.nd': x => require('marked')(x)
};

module.exports = async (env, options) => {
  const { render: renderFns = DEFAULT_RENDER_FNS } = options || {};

  const filename = env.PATH_TRANSLATED;

  const readStream = fs.createReadStream(filename, 'utf-8');
  const passThrough = new PassThrough();
  readStream.pipe(passThrough);

  let content = '';
  const echo = x => { content += String(x); };

  const headers = {
    'Content-Type': 'text/html'
  };
  
  const glob = {
    env,
    header: (key, value) => { headers[key] = value; },
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

  const context = {
    ...glob,
    write: (x) => passThrough.write(x),
    console: console,
  };

  passThrough.on('end', () => {
    run(content, context);
    const ext = path.extname(filename);
    const renderFn = renderFns[ext] || getRenderFn(filename, renderFns);
    if (renderFn) {
      const renderedContent = renderFn(context[TXTS_ID]);
      passThrough.end(renderedContent);
    } else {
      passThrough.end();
    }
  });

  const TXTS_ID = '__TXTS__';
  context[TXTS_ID] = [];

  const getRenderFn = (name, renderFns) => {
    for (const ext in renderFns) {
      if (name.endsWith(ext)) {
        return renderFns[ext];
      }
    }
    return null;
  };
};
