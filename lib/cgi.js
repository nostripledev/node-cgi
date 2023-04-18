const { stdout } = process;
const proc = require('./proc');

module.exports = async () => {
    stdout.write(proc(process.env)); // eslint-disable-line no-process-env
};
