const express = require('express');
const router = express.Router();
const Cart = require('./models/Cart');
const Product = require('./models/Product');

// Show cart
router.get('/', async (req, res) => {
  const cart = await Cart.findOne() || { items: [], totalQuantity: 0, totalPrice: 0 };
  res.render('cart/index', { cart });
});

// Add to cart
router.post('/add/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  let cart = await Cart.findOne();

  if (!cart) {
    cart = new Cart({ items: [] });
  }

  const existingItem = cart.items.find(item => item.productId.equals(product._id));
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.items.push({ productId: product._id, quantity: 1 });
  }

  cart.totalQuantity++;
  cart.totalPrice += product.price;

  await cart.save();
  res.redirect('/cart');
});

// Clear cart
router.post('/clear', async (req, res) => {
  await Cart.deleteMany({});
  res.redirect('/cart');
});

module.exports = router;
