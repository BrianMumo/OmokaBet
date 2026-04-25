module.exports = {
  apps: [{
    name: 'omokabet',
    script: './server/server.js',
    cwd: '/var/www/omokabet',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
    },
  }],
};
