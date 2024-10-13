import { Request, Response } from "express"
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
app.use(bodyParser.json())

const APP_DB_NAME = 'mongodb://localhost/task1'
mongoose.connect(APP_DB_NAME)

// створення схеми товару
const ProductSchema = new mongoose.Schema({
  'Name': {
    type: String,
    required: true
  },
  'Price': {
    type: Number,
    required: true
  },
  'Producer': {
    type: String,
    required: false
  }
})

// Middleware для перевірки додатної ціни та форматування
ProductSchema.pre('save', function (this: typeof mongoose.Document, next: Function) {
  if (this.Price <= 0) {
    return next(new Error('Ціна повинна бути додатним числом'))
  }
  // Форматування до двох десяткових чисел
  this.Price = parseFloat(this.Price.toFixed(2))
  next()
})

// створення моделі
const Product = mongoose.model('Product', ProductSchema)

// оновлення ціни продукту
const updateProductPrice = async (req: Request, res: Response) => {
  const { price } = req.body
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).send('може бути встановлено лише додатнє число.')
  }
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { Price: parseFloat(price.toFixed(2)) },
    { new: true }
  )
  res.json(updatedProduct);
}

app.patch('/products/:id', updateProductPrice)
app.put('/products/:id', updateProductPrice)

// отримання продукту за ID
const getProduct = async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id)
  res.json(product)
}
app.get('/product/:id', getProduct)

// DELETE для видалення продукту
const deleteProduct = async (req: Request, res: Response) => {
  await Product.findByIdAndDelete(req.params.id)
  res.json({ message: 'продукт видалено' })
}

app.delete('/products/:id', deleteProduct)

// отримання всіх продуктів
const getAllProducts = async (req: Request, res: Response) => {
  const products = await Product.find()
  res.json(products)
}
app.get('/products', getAllProducts)

// якщо пусто
app.get('/', (req: Request, res: Response) => {
  res.send('Головна сторінка')
})

// Перевірка
const newProduct = new Product({
  Name: 'Product1',
  Price: 100,
  Producer: 'Producer1'
})

newProduct.save().then(() => {
  app.listen(3000, () => {
    console.log('Сервер працює на порту 3000');
  })
})

module.exports = Product;
