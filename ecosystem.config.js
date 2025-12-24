module.exports = {
  apps: [
    {
      name: 'nestjs-backend',
      script: './dist/main.js', // Path to your compiled NestJS entry point
      instances: '1', // Use all CPU cores (cluster mode)
      exec_mode: 'cluster',

      // --- Logging Configuration ---
      // log_type: 'json', // Crucial: Forces PM2 to output pure JSON
      merge_logs: true, // Combines logs from all CPU instances into one file
      out_file: './logs/app-out.log', // Standard logs (info, debug)
      error_file: './logs/app-err.log', // Error logs

      // --- Environment Variables ---
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        // You can also put your OTLP Collector URL here for Step 3
        OTEL_EXPORTER_OTLP_ENDPOINT: 'http://localhost:4318',
      },
    },
  ],
};
