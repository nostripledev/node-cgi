const fs = require('fs');
const path = require('path');
const run = require('./run');

const DEFAULT_RENDER_FNS = {
  '.pug.nd': x => require('pug').render(x),
  '.md.nd': x => require('marked')(x)
};

module.exports = async (env, options) => {
  const { render: renderFns = DEFAULT_RENDER_FNS } = options || {};

  const filename = env.PATH_TRANSLATED;
  const src = await fs.promises.readFile(filename, 'utf-8');

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

  run(src, glob);

  const ext = path.extname(filename);
  const renderFn = renderFns[ext] || (await getRenderFn(filename, renderFns));
  if (renderFn) {
    content = await renderFn(content);
  }

  const headersStr = Object.entries(headers).map(([key, value]) => `${key}: ${value}\r\n`).join('');
  const response = `${headersStr}\r\n${content}`;
  return response;
};

const getRenderFn = async (name, renderFns) => {
  if (!renderFns) {
    return null;
  }

  const ext = path.extname(name);
  const renderFn = renderFns[ext];

  if (renderFn) {
    return renderFn;
  }

  const renderFnPromises = Object.values(renderFns).map(fn => fn(name));
  const resolvedRenderFns = await Promise.all(renderFnPromises);
  const foundFn = resolvedRenderFns.find(fn => fn);

  return foundFn || null;
};
