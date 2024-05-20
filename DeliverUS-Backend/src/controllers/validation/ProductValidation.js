import { check } from 'express-validator'
import { Restaurant, Product } from '../../models/models.js'
import { checkFileIsImage, checkFileMaxSize } from './FileValidationHelper.js'

const maxFileSize = 2000000 // around 2Mb

const checkRestaurantExists = async (value, { req }) => {
  try {
    const restaurant = await Restaurant.findByPk(req.body.restaurantId)
    if (restaurant === null) {
      return Promise.reject(new Error('The restaurantId does not exist.'))
    } else { return Promise.resolve() }
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}
const checkNotFiveHighlightedCreate = async (value, { req }) => {
  if (value) {
    try {
      const highlightedProductsSameRestaurant = await Product.count({ where: { restaurantId: req.body.restaurantId, highlighted: true } })
      if (highlightedProductsSameRestaurant === 5) {
        return Promise.reject(new Error('There are already 5 highlighted products'))
      } else {
        return Promise.resolve()
      }
    } catch (err) {
      return Promise.reject(new Error(err))
    }
  }
}

const checkNotFiveHighlightedUpdate = async (value, { req }) => {
  if (value) {
    try {
      let highlightedProductsSameRestaurant = 0
      const productToUpdate = await Product.findByPk(req.params.productId)
      if (req.body.restaurantId === null) {
        highlightedProductsSameRestaurant = await Product.count({ where: { restaurantId: productToUpdate.restaurantId, highlighted: true } })
      } else {
        highlightedProductsSameRestaurant = await Product.count({ where: { restaurantId: req.body.restaurantId, highlighted: true } })
      }
      if (highlightedProductsSameRestaurant === 5) {
        return Promise.reject(new Error('There are already 5 highlighted products'))
      } else {
        return Promise.resolve()
      }
    } catch (err) {
      return Promise.reject(new Error(err))
    }
  }
}

const create = [
  check('name').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('description').optional({ checkNull: true, checkFalsy: true }).isString().isLength({ min: 1 }).trim(),
  check('price').exists().isFloat({ min: 0 }).toFloat(),
  check('order').default(null).optional({ nullable: true }).isInt().toInt(),
  check('availability').optional().isBoolean().toBoolean(),
  check('highlighted').exists().isBoolean().toBoolean(),
  check('highlighted').custom(checkNotFiveHighlightedCreate),
  check('productCategoryId').exists().isInt({ min: 1 }).toInt(),
  check('restaurantId').exists().isInt({ min: 1 }).toInt(),
  check('restaurantId').custom(checkRestaurantExists),
  check('image').custom((value, { req }) => {
    return checkFileIsImage(req, 'image')
  }).withMessage('Please upload an image with format (jpeg, png).'),
  check('image').custom((value, { req }) => {
    return checkFileMaxSize(req, 'image', maxFileSize)
  }).withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB')
]

const update = [
  check('name').exists().isString().isLength({ min: 1, max: 255 }),
  check('description').optional({ nullable: true, checkFalsy: true }).isString().isLength({ min: 1 }).trim(),
  check('price').exists().isFloat({ min: 0 }).toFloat(),
  check('order').default(null).optional({ nullable: true }).isInt().toInt(),
  check('availability').optional().isBoolean().toBoolean(),
  check('highlighted').exists().isBoolean().toBoolean(),
  check('highlighted').custom(checkNotFiveHighlightedUpdate),
  check('productCategoryId').exists().isInt({ min: 1 }).toInt(),
  check('restaurantId').not().exists(),
  check('image').custom((value, { req }) => {
    return checkFileIsImage(req, 'image')
  }).withMessage('Please upload an image with format (jpeg, png).'),
  check('image').custom((value, { req }) => {
    return checkFileMaxSize(req, 'image', maxFileSize)
  }).withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB'),
  check('restaurantId').not().exists()
]

export { create, update }
