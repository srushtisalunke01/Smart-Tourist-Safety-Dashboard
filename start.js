const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Launching SafeTour AI Full-Stack Suite...');

const runProcess = (command, args, cwd, label, colorCode) => {
  const fullCommand = `${command} ${args.join(' ')}`;
  const child = spawn(fullCommand, { 
    cwd, 
    shell: true,
    env: { ...process.env, FORCE_COLOR: 'true' }
  });

  child.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      console.log(`\x1b[${colorCode}m[${label}]\x1b[0m ${line}`);
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      console.error(`\x1b[31m[${label} Error]\x1b[0m ${line}`);
    });
  });

  child.on('close', (code) => {
    console.log(`[${label}] process exited with code ${code}`);
  });

  return child;
};

// Start Backend on Port 5000
const backendDir = path.join(__dirname, 'backend');
const backendProcess = runProcess('npm', ['run', 'dev'], backendDir, 'Backend', '36'); // Cyan label

// Start Frontend on Port 3000
const frontendDir = path.join(__dirname, 'frontend');
const frontendProcess = runProcess('npm', ['run', 'dev'], frontendDir, 'Frontend', '35'); // Magenta label

// Helper to cleanly kill child processes and their sub-processes (especially on Windows)
const killProcess = (child) => {
  if (!child) return;
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', child.pid, '/f', '/t']);
  } else {
    child.kill();
  }
};

// Handle termination signals to kill child processes cleanly
const cleanExit = () => {
  console.log('\n🛑 Stopping SafeTour AI Services...');
  killProcess(backendProcess);
  killProcess(frontendProcess);
  process.exit();
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
