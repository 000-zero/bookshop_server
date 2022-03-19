const router = require('koa-router')()
const Cart = require("../models/cart")
const Goods = require("../models/goods")
const jwt = require('jwt-simple')

const SECRET = 'shared-secret'; // demo，可更换

router.prefix('/api/carts')

router.get('/', async function (ctx, next) {

  //判断token是否过期
  try {
    var payload = jwt.decode(ctx.state.token.split(' ')[1], SECRET);
    // console.log(payload)
  } catch (Error) {
    payload = null
    console.log("token已经过期")
  }
  //获取参数
  const { include} = ctx.request.query

  if (include == "goods" && payload != null && ctx.state.token != "Bearer") {
    //获取购物车列表
    var cart = await Cart.findAll({
      where: {
        user_id: payload.id,
      }
    })

    var goods = new Array();

    //获取该用户的购物车的商品
    for (var i = 0; i < cart.length; i++) {
      goods[i] = await Goods.findAll({
        where: {
          id: cart[i].goods_id
        }
      })
      cart[i].dataValues.goods = goods[i][0]
    }

    //如果用户的购物车不为空
    if (cart.length != null) {
      ctx.body = {
        data: cart
      }
    } else {
      ctx.body = {
        data: { num: 0 }
      }
    }
  }else{
    //获取购物车列表
    var cart = await Cart.findAll({
      where: {
        user_id: payload.id,
      }
    })

    ctx.body = {
      data:cart
    }
  }

})

//添加购物车
router.post('/', async function (ctx, next) {

  //判断token是否过期
  try {
    var payload = jwt.decode(ctx.state.token.split(' ')[1], SECRET);
    // console.log(payload)
  } catch (Error) {
    payload = null
    console.log("token已经过期")
  }

  const goods_id = ctx.request.body.goods_id

  var cart = await Cart.findAll({
    where: {
      user_id: payload.id,
      goods_id
    }
  })

  //判断用户购物车是否为空
  if (cart.length == 0) {
    await Cart.create({
      user_id: payload.id,
      goods_id,
      num:0
    })
    cart = await Cart.findAll({
      where: {
        user_id: payload.id,
        goods_id
      }
    })
  }

  var cart_num = cart[0].num

  cart_num++

  await Cart.update(
    { num: cart_num },
    {
      where: {
        user_id: payload.id,
        goods_id
      }
    }
  )

  ctx.body = {
    code: "200"
  }
})

// 购物车数量改变
router.put('/num', async (ctx, next) => {

    const {value,name} = await ctx.request.body

  //调用更新购物车数量接口
  await Cart.update(
    {num:value },
    {
      where: {
        id: name
      }
    }
  )
    ctx.body = {
      code:200,
      msg:'更改购物车商品数量成功'
    }

})

// 删除购物车商品
router.delete('/del/:cart_id', async (ctx, next) => {
  const carts_id = await ctx.params.cart_id
  
  await Cart.destroy({
    where:{
      id:carts_id
    }
  })

  ctx.body = {code:"204"}

})

// 购物车数量改变
router.post('/checked', async (ctx, next) => {
  const carts_id = await ctx.request.body.carts_id
  
  const cart = await Cart.findAll({
    where:{
      id:carts_id
    }
  })

  var is_checked = cart[0].is_checked == 1 ? 0 : 1

  await Cart.update(
    {is_checked},
    {
      where:{
        id:carts_id
      }
    }
  )
  
  ctx.body = {
    msg:"13214"
  }
})

//更改购物车是否全部选中状态
router.post("/allcheck", async (ctx,next) =>{

  //判断token是否过期
  try {
    var payload = jwt.decode(ctx.state.token.split(' ')[1], SECRET);
    // console.log(payload)
  } catch (Error) {
    payload = null
    console.log("token已经过期")
  }

  const allcheck = ctx.request.body.allcheck
  console.log(allcheck)

  await Cart.update(
    {is_checked:allcheck ? 1 : 0},
    {
      where:{
        user_id:payload.id
      }
    }
  )

  ctx.body = {
    msg:"success"
  }
})

module.exports = router
