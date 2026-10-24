const { spawn } = require('child_process');
const path = require('path');

console.log('==================================================');
console.log('   MENJALANKAN SISTEM UNDANGAN PERNIKAHAN');
console.log('   - Backend API : http://localhost:5000');
console.log('   - Frontend App: http://localhost:5173');
console.log('==================================================\n');

// Start backend
const backend = spawn('node', ['backend/server.js'], {
  stdio: 'inherit',
  shell: true
});

// Start frontend
const frontend = spawn('npm', ['run', 'dev', '--prefix', 'frontend'], {
  stdio: 'inherit',
  shell: true
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
