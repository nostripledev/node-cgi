const { stdout } = process;
const proc = require('./proc');
const util = require('util');

const env = process.env;
const promisifiedProc = util.promisify(proc);

module.exports = async () => {
  console.log(await promisifiedProc(env));
};
