module.exports = {
  apps: [{
    name: "server",
    script: "index.js",
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
    },
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    merge_logs: true,
    log_file: "logs/server.log",
    error_file: "logs/error.log",
    time: true,
    error: "logs/error.log",
    out: "logs/out.log",
    log: "logs/combined.log",
    restart_delay: 4000,
    max_restarts: 10
  }]
}; 