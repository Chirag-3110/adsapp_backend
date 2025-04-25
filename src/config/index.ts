const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: path.resolve(__dirname, '../', `environments/${process.env.NODE_ENV}.env`)
});
console.log(
  process.env.DB,
  path.resolve(__dirname, '../', `environments/${process.env.NODE_ENV}.env`)
);
const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT || 3000,
  DB: process.env.DB || 'mongo_dev_url',
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

export default config;