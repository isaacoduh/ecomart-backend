const mongoose = require("mongoose");
const UserModel = require("../models/user.model");
const AddressModel = require("../models/address.model");

const createUserAccount = async ({ email, password, phone, salt }) => {
  const user = new UserModel.create({
    email,
    password,
    salt,
    phone,
    address: [],
  });
  const userResult = await user.save();
  return userResult;
};

const createUserAddress = async ({
  _id,
  street,
  postalCode,
  city,
  country,
}) => {
  const profile = await UserModel.findById(_id);
  if (profile) {
    const newAddress = new AddressModel({ street, postalCode, city, country });
    await newAddress.save();
    profile.address.push(newAddress);
  }

  return await profile.save();
};

const findUserByEmail = async ({ email }) => {
  const existingUser = await UserModel.findOne({ email: email });
  return existingUser;
};

const findUserById = async ({ id }) => {
  const existingUser = await UserModel.findById(id).populate("address");
  return existingUser;
};

const wishList = async (userId) => {
  const profile = await UserModel.findById(userId).populate("wishlist");
  return profile.wishlist;
};

const addWishListItem = async (
  userId,
  { _id, name, desc, price, available, banner }
) => {
  const product = { _id, name, desc, price, available, banner };
  const profile = await UserModel.findById(userId).populate("wishlist");
  if (profile) {
    let wishlist = profile.wishlist;
    if (wishlist.length > 0) {
      let isExist = false;
      wishlist.map((item) => {
        if (item._id.toString() === product._id.toString()) {
          const index = wishlist.indexOf(item);
          wishlist.splice(index, 1);
          isExist = true;
        }
      });

      if (!isExist) {
        wishlist.push(product);
      }
    } else {
      wishlist.push(product);
    }
    profile.wishlist = wishlist;
  }
  const profileResult = await profile.save();
  return profileResult.wishlist;
};

const addCartItem = async (
  userId,
  { _id, name, price, banner },
  quantity,
  isRemove
) => {
  const profile = await UserModel.findById(userId).populate("cart");
  if (profile) {
    const cartItem = { product: { _id, name, price, banner }, unit: quantity };
    let cartItems = profile.cart;

    if (cartItems.length > 0) {
      let isExist = false;
      cartItems.map((item) => {
        if (item.product._id.toString() === _id.toString()) {
          if (isRemove) {
            cartItems.ssplice(cartItems.indexOf(item), 1);
          }
          item.unit = quantity;
        }
        isExist = true;
      });

      if (!isExist) {
        cartItems.push(cartItem);
      }
    } else {
      cartItems.push(cartItem);
    }
    profile.cart = cartItems;
    return await profile.save();
  }

  throw new Error("Unable to add to cart");
};

const addOrderToProfile = async (customerId, order) => {
  const profile = await UserModel.findById(customerId);
  if (profile) {
    if (profile.orders == undefined) {
      profile.orders = [];
    }
    profile.orders.push(order);
    profile.cart = [];
    const profileResult = await profile.save();
    return profileResult;
  }
  throw new Error("Unable to add to order");
};

module.exports = {
  addOrderToProfile,
  addCartItem,
  addWishListItem,
  wishList,
  findUserByEmail,
  findUserById,
  createUserAddress,
  createUserAccount,
};
