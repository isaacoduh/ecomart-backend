const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const amqplib = require("amqplib");

const {
  APP_SECRET,
  EXCHANGE_NAME,
  MSG_QUEUE_URL,
  USER_SERVICE,
} = require("../config");

const generateSalt = async () => {
  return await bcrypt.genSalt();
};

const generatePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

const validatePassword = async (password, savedPassword, salt) => {
  return (await generatePassword(password, salt)) === savedPassword;
};

const generateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

const validateSignature = async (req) => {
  try {
    const signature = req.get("Authorization");
    console.log(signature);
    const payload = jwt.verify(signature.split(" ")[1], APP_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const formatData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not Found!");
  }
};

const createChannel = async () => {
  try {
    const connection = await amqplib.connect(MSG_QUEUE_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(EXCHANGE_NAME, "direct", { durable: true });
    return channel;
  } catch (error) {
    throw error;
  }
};

const PublishMessage = (channel, service, msg) => {
  channel.publish(EXCHANGE_NAME, service, Buffer.from(msg));
  console.log("Sent From User Service: ", msg);
};

const SubscribeMessage = async (channel, service) => {
  await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
  const q = await channel.assertQueue("", { exclusive: true });
  console.log(`Waiting for Messages in QUEUE: ${q.queue}`);
  channel.bindQueue(q.queue, EXCHANGE_NAME, USER_SERVICE);

  channel.consume(
    q.queue,
    (msg) => {
      if (msg.content) {
        console.log("the message is:", msg.content.toString());
        service.SubscribeEvents(msg.content.toString());
      }
      console.log("[X] received");
    },
    { noAck: true }
  );
};

module.exports = {
  SubscribeMessage,
  PublishMessage,
  createChannel,
  formatData,
  validateSignature,
  generateSignature,
  validatePassword,
  generateSalt,
  generatePassword,
};
