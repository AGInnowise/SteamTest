function ts() {
  return new Date().toISOString();
}
const logger = {
  info: (msg, meta) => console.log(`[INFO] ${ts()} ${msg}`, meta ?? ''),
  step: (msg) => console.log(`\n=== ${msg} ===`),
  error: (msg, meta) => console.error(`[ERROR] ${ts()} ${msg}`, meta ?? ''),
};
module.exports = { logger };