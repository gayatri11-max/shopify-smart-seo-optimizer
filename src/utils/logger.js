const COLORS = { reset: '\x1b[0m', red: '\x1b[31m', yellow: '\x1b[33m', green: '\x1b[32m', cyan: '\x1b[36m', dim: '\x1b[2m' };

function paint(color, msg) {
  return `${COLORS[color] || ''}${msg}${COLORS.reset}`;
}

export const log = {
  info: (msg) => console.log(paint('cyan', 'i ') + msg),
  warn: (msg) => console.log(paint('yellow', '! ') + msg),
  error: (msg) => console.error(paint('red', 'x ') + msg),
  success: (msg) => console.log(paint('green', '✓ ') + msg),
  dim: (msg) => console.log(paint('dim', msg)),
};

export { paint };
