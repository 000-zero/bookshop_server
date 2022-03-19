const router = require('koa-router')()
const Db = require('../db/index')
const {
  Op
} = require("sequelize");
const Goods = require("../models/goods")
const Slides = require("../models/slides")
const Users = require("../models/users")
// const HasLike = require("../models/hasLike")
const Orders = require("../models/orders")
const Categories = require("../models/categories");
const {
  sequelize
} = require('../db/index');
// const users = require("../models/users")


router.prefix('/api/index')
// //模型关联数据库
// HasLike.sync({ alter: true })
//查看数据库是否成功
console.log(Db.connectTest())

router.get('/', async (ctx, next) => {
  const categories = await Categories.findAll();
  const slides = await Slides.findAll();
  var current_page = ctx.request.query.page ? (ctx.request.query.page - 1) * 6 : 0;
  // var one = 1 * current_page
  let goods = await Goods.findAll({
    offset: current_page,
    limit: 6
  });
  let sales = ctx.request.query.sales;
  let recommend = ctx.request.query.recommed;
  let latest = ctx.request.query.new;
  console.log(sales, recommend, latest);


  // console.log(categories.every(categories => categories instanceof Categories)); // true
  // ctx.body = [JSON.stringify(categories, null, 2),JSON.stringify(slides, null, 2)]

  if (recommend == 1) {
    goods = await Goods.findAll({
      where: {
        is_recommend: 1
      }
    })
  } else if (latest == 1) {
    goods = await Goods.findAll({
      order: [
        ['updatedAt', 'DESC']
      ]
    })
  } else if (sales == 1) {
    goods = await Goods.findAll({
      order: [
        ['sales', 'DESC']
      ]
    })
  }


  ctx.body = {
    "categories": categories,
    "goods": {
      "current_page": current_page ? current_page : 1,
      "data": goods
    },
    "slides": slides
  }
})


router.get('/manage', async (ctx, next) => {
  const user = await Users.findAll()
  const goods = await Goods.findAll()
  const orders = await Orders.findAll()

  const administrator = await Users.findAll({
    where:{
      Role:1
    }
  })

  var amount = 0
  for(let i = 0;i < orders.length ;i++){
    amount += orders[0].amount
  }

  ctx.body = {
    data: {
      user_num: user.length,
      goods_num:goods.length,
      orders_mun:orders.length,
      amount:amount,
      administrator_num:administrator.length
    }
  }
})

module.exports = router