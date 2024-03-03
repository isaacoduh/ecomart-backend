const userRepository = require("../repository/user.repository");
const {
  validatePassword,
  generateSignature,
  formatData,
  generateSalt,
  generatePassword,
} = require("../utils");
const signin = async (payload) => {
  const { email, password } = payload;
  const existingUser = await userRepository.findUserByEmail({ email });
  if (existingUser) {
    const validPassword = await validatePassword(
      password,
      existingUser.password,
      existingUser.salt
    );
    if (validPassword) {
      const token = await generateSignature({
        email: existingUser.email,
        _id: existingUser._id,
      });
      return formatData({ id: existingUser._id, token });
    }
  }
};

const signup = async (payload) => {
  const { email, password, phone } = payload;
  let salt = await generateSalt();
  let userPassword = await generatePassword(password, salt);
  const existingUser = await userRepository.createUserAccount({
    email,
    password: userPassword,
    phone,
    salt,
  });
  const token = await generateSignature({
    email: email,
    _id: existingUser._id,
  });
  return formatData({ id: existingUser._id, token });
};

const addNewAddress = async (_id, payload) => {
  const { street, postalCode, city, country } = payload;
  const addressResult = await userRepository.createUserAddress({
    _id,
    street,
    postalCode,
    city,
    country,
  });

  return formatData(addressResult);
};

const getProfile = async (id) => {
  const existingUser = await userRepository.findUserById({ id });
  return formatData(existingUser);
};

const getShoppingDetails = async (id) => {
  const existingUser = await userRepository.findUserById({ id });
  if (existingUser) {
    return formatData(existingUser);
  }
  return formatData({ message: "Error" });
};

const getWishList = async (userId) => {
  const wishListItems = await userRepository.wishList(userId);
  return formatData(wishListItems);
};

const addToWishList = async (userId, product) => {
  const wishlistResult = await userRepository.addWishListItem(userId, product);
  return formatData(wishlistResult);
};

const manageCart = async (userId, product, quantity, isRemove) => {
  const cartResult = await userRepository.addCartItem(
    userId,
    product,
    quantity,
    isRemove
  );
  return formatData(cartResult);
};

const manageOrder = async (userId, order) => {
  const orderResult = await userRepository.addOrderToProfile(userId, order);
  return formatData(orderResult);
};

const SubscribeEvents = async (payload) => {
  console.log("Trigerring... User Events");
  payload = JSON.parse(payload);
  const { event, data } = payload;
  const { userId, product, order, quantity } = data;
  switch (event) {
    case "ADD_TO_WISHLIST":
    case "REMOVE_FROM_WISHLIST":
      addToWishList(userId, product);
      break;
    case "ADD_TO_CART":
      manageCart(userId, product, quantity, false);
      break;
    case "REMOVE_FROM_CART":
      manageCart(userId, product, quantity, true);
      break;
    case "CREATE_ORDER":
      manageOrder(userId, order);
      break;
    default:
      break;
  }
};

module.exports = {
  signin,
  signup,
  addNewAddress,
  getProfile,
  getShoppingDetails,
  SubscribeEvents,
  manageCart,
  manageOrder,
  addToWishList,
  getWishList,
};
