const vm = require('vm');

module.exports = async (src, glob) => {
  const START_MARK = '<?';
  const END_MARK = '?>';
  const TYPE_RE = /^(\S*)\s/;
  const TXTS_ID = '__TXTS__';

  const codeParts = [];
  const txts = [];

  const appCode = (x) => {
    codeParts.push(`${x.trim()};`);
  };
  const appEval = (x) => {
    appCode(`echo(${x})`);
  };
  const appText = (x) => {
    appEval(`${TXTS_ID}[${txts.length}]`);
    txts.push(x);
  };

  let endIdx = 0;
  while (true) {
    const startIdx = src.indexOf(START_MARK, endIdx);
    if (startIdx < 0) {
      break;
    }

    appText(src.slice(endIdx, startIdx));

    endIdx = src.indexOf(END_MARK, startIdx);
    if (endIdx < 0) {
      endIdx = src.length;
    }

    const inner = src.slice(startIdx + START_MARK.length, endIdx);
    endIdx += END_MARK.length;

    const match = inner.match(TYPE_RE);
    const type = match?.[1];
    if (type === 'php++' || !type) {
      let phpCode = inner.slice(match[0].length);
      phpCode = phpCode.replace(/\$([a-zA-Z_]\w*)/g, 'var_$1');
      appCode(phpCode);
    } else if (type === '=') {
      let phpCode = inner.slice(match[0].length);
      phpCode = phpCode.replace(/\$([a-zA-Z_]\w*)/g, 'var_$1');
      appEval(phpCode);
    } else {
      appText(src.slice(startIdx, endIdx));
    }
  }

  appText(src.slice(endIdx));

  const code = codeParts.join('\n');
  const context = {
    ...glob,
    [TXTS_ID]: txts,
    write: (x) => txts.push(x),
    console: console,
  };

  const script = new vm.Script(code);
  script.runInNewContext(context);

  return txts.join('');
};
