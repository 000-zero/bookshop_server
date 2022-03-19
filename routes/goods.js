const router = require('koa-router')()
const Goods = require("../models/goods")
const Categories = require("../models/categories")
const { QueryTypes,Op } = require('sequelize');
const { sequelize } = require("../db/index")
const Collect = require("../models/collect")
const jwt = require('jwt-simple')
const SECRET = 'shared-secret'; // demo，可更换

router.prefix('/api/goods')

router.get('/', async function (ctx, next) {

  //获取商品id
  var goods_id = ctx.request.query.goods

  //查询商品详情
  if (goods_id != null) {

    try {
      var payload = jwt.decode(ctx.state.token.split(' ')[1], SECRET);
      console.log(payload)
    } catch (Error) {
      payload = null
      console.log("token已经过期")
    }

    if (ctx.state.token != "Bearer" && payload != null) {

      var collect = await Collect.findAll({
        where: {
          user_id: payload.id,
          goods_id: goods_id
        }
      })
      if (collect.length == 0) {
        await Collect.create({
          user_id: payload.id,
          goods_id,
          is_collect: 0
        })
        collect = await Collect.findAll({
          where: {
            user_id: payload.id,
            goods_id: goods_id
          }
        })
      }
      // console.log(collect[0])
    } else {
      const payload = null
      var collect = [is_collect=0]
    }

    const goods = await Goods.findAll({
      where: { id: goods_id }
    })

    const like_goods = await Goods.findAll( {
      where:{
        category_id:goods[0].category_id,
        id:{[Op.ne]:goods_id}
      }
    })

    //商品信息插入是否收藏判断
    goods[0].dataValues.is_collect = collect[0].is_collect
    // console.log(goods[0])
    //test
    goods[0].dataValues.comments = []

    ctx.body = {
      goods: goods[0],
      like_goods
    }
  } else {

    //商品列表
    const categories = await Categories.findAll({
      where: {
        pid: 0
      }
    })

    //文学分类
    const goods_literature = await sequelize.query("select * from goods_literature", { type: QueryTypes.SELECT })
    //文化分类
    const goods_culture = await sequelize.query("select * from goods_culture", { type: QueryTypes.SELECT })
    //流行分类
    const goods_Popularity = await sequelize.query("select * from goods_Popularity", { type: QueryTypes.SELECT })

    //添加子元素
    categories[0].dataValues.children = goods_literature
    categories[1].dataValues.children = goods_culture
    categories[2].dataValues.children = goods_Popularity
    // console.log(categories[0])

    //页数索引
    var current_page = ctx.request.query.category_id ? (ctx.request.query.page - 1) * 6 : 0;
    var category_id = ctx.request.query.category_id

    var data = await Goods.findAll()


    //进入商品展示的数据
    if (category_id != null) {
      data = await Goods.findAll({
        where: {
          category_id: category_id
        }
      })
      ctx.body = {
        categories,
        goods: { current_page, data }
      }
    } else {
      ctx.body = {
        categories,
        goods: { current_page, data }
      }
    }
  }
})


router.post('/addGoods', async function (ctx, next) {
  
  const {name,categories,price,stock,is_recommend,author,imageUrl,information} = ctx.request.body

  // if(1<categories<5) return 

  await Goods.create({
    category_id:categories,
    title:name,
    price:price,
    stock:stock,
    cover:imageUrl,
    details:information,
    is_recommend:is_recommend
  })


  ctx.body = {
    msg:"上传成功"
  }
})

module.exports = router
