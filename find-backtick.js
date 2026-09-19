const fs = require('fs');

const src = fs.readFileSync(process.argv[2], 'utf8');

let mode = 'code';

const modeStack = [];
const exprDepthStack = [];

let line = 1, col = 1, i = 0;

const events = [];

function adv() {
  if (src[i] === '\n') { line++; col = 1; }
  else { col++; }
  i++;
}

while (i < src.length) {
  const c = src[i], c2 = src[i + 1];

  if (mode === 'line_comment') {
    if (c === '\n') mode = modeStack.pop();
    adv(); continue;
  }

  if (mode === 'block_comment') {
    if (c === '*' && c2 === '/') {
      adv(); adv();
      mode = modeStack.pop();
      continue;
    }
    adv(); continue;
  }

  if (mode === 'str1' || mode === 'str2') {
    if (c === '\\') { adv(); adv(); continue; }

    const q = mode === 'str1' ? "'" : '"';

    if (c === q) {
      mode = modeStack.pop();
      adv();
      continue;
    }

    if (c === '\n') {
      events.push({
        line,
        col,
        type: 'WARN: newline inside quote string'
      });
    }

    adv();
    continue;
  }

  if (mode === 'template') {
    if (c === '\\') { adv(); adv(); continue; }

    if (c === '`') {
      events.push({
        line,
        col,
        type: 'close-template'
      });
      mode = modeStack.pop();
      adv();
      continue;
    }

    if (c === '$' && c2 === '{') {
      exprDepthStack.push(0);
      modeStack.push('template');
      mode = 'code';
      adv(); adv();
      continue;
    }

    adv();
    continue;
  }

  // mode === 'code'

  if (c === '/' && c2 === '/') {
    modeStack.push(mode);
    mode = 'line_comment';
    adv(); adv();
    continue;
  }

  if (c === '/' && c2 === '*') {
    modeStack.push(mode);
    mode = 'block_comment';
    adv(); adv();
    continue;
  }

  if (c === "'") {
    modeStack.push(mode);
    mode = 'str1';
    adv();
    continue;
  }

  if (c === '"') {
    modeStack.push(mode);
    mode = 'str2';
    adv();
    continue;
  }

  if (c === '`') {
    events.push({
      line,
      col,
      type: 'open-template'
    });
    modeStack.push(mode);
    mode = 'template';
    adv();
    continue;
  }

  if (exprDepthStack.length) {
    if (c === '{') {
      exprDepthStack[exprDepthStack.length - 1]++;
      adv();
      continue;
    }

    if (c === '}') {
      if (exprDepthStack[exprDepthStack.length - 1] > 0) {
        exprDepthStack[exprDepthStack.length - 1]--;
        adv();
        continue;
      }

      exprDepthStack.pop();
      mode = modeStack.pop();

      events.push({
        line,
        col,
        type: 'close-${}'
      });

      adv();
      continue;
    }
  }

  adv();
}

console.log('=== backtick / template events ===');
events.forEach(e =>
  console.log(`${e.type.padEnd(16)} line ${e.line}, col ${e.col}`)
);

console.log('=== EOF state ===');
console.log(
  'mode:',
  mode,
  '| modeStack depth:',
  modeStack.length,
  modeStack
);
