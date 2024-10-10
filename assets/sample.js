process.stdin.on('data', (data) => {
  process.stdout.write(`sample heard main.`);
  process.stdout.write(`sample heard main say: ${data}`);
});

process.stdout.write('sample YELLS!');
