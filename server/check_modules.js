'use strict';
require('dotenv').config();
try {
    const validateEnv = require('./config/env');
    const config = validateEnv();
    console.log('✅ env.js loaded and validated');
    require('./config/diagnostics')(config).then(() => {
        console.log('✅ diagnostics.js completed');
        process.exit(0);
    }).catch(err => {
        console.error('❌ diagnostics.js failed:', err);
        process.exit(1);
    });
} catch (err) {
    console.error('❌ Module check failed:', err);
    process.exit(1);
}
