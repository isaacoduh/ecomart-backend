const dotenv = require("dotenv");

if (process.env.NODE_ENV === "development") {
  const configFile = `./env.${process.env.NODE_ENV}`;
  dotenv.config({ path: configFile });
}

module.exports = {
  PORT: process.env.PORT,
  DB_URL: process.env.MONGO_URI,
  APP_SECRET: process.env.APP_SECRET,
  EXCHANGE_NAME: process.env.EXCHANGE_NAME,
  MSG_QUEUE_URL: process.env.MSG_QUEUE_URL,
  USER_SERVICE: "user_service",
  ORDER_SERVICE: "order_service",
};
