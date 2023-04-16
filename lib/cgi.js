const { stdout } = process;
const proc = require('./proc');

module.exports = () => {
    stdout.write(proc(process.env)); // eslint-disable-line no-process-env
};
