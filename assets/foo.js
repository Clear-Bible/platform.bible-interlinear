process.on('message', (message) => {
  console.log('Message from parent:', message);
  process.send('CHILD TO PARENT MESSAGE');
});

// Handle cleanup if the child process is terminated
process.on('exit', () => {
  console.log('Child process is exiting...');
});

// Optional error handling
process.on('error', (err) => {
  console.error('An error occurred in the child process:', err);
});
