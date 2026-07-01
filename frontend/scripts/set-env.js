const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL || 'http://localhost:8080/api';
const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');

const envDirectory = path.resolve(__dirname, '../src/environments');

if (!fs.existsSync(envDirectory)) {
  fs.mkdirSync(envDirectory, { recursive: true });
}

const envConfigFile = `export const environment = {
  production: ${isProd},
  apiUrl: '${apiUrl}'
};
`;

fs.writeFileSync(path.join(envDirectory, 'environment.ts'), envConfigFile);
fs.writeFileSync(path.join(envDirectory, 'environment.prod.ts'), envConfigFile);

console.log(`[set-env] Generated environment files with apiUrl: ${apiUrl}`);
