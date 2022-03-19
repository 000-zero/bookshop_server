const router = require('koa-router')()
const Collect = require("../models/collect")
const jwt = require('jwt-simple')

const SECRET = 'shared-secret'; // demo，可更换

router.prefix('/api/collect')


//获取用户的全部收藏
router.get('/', async function (ctx, next) {
  const all_collect = await Collect.findAll({
    where: {
      user_id: payload.id
    }
  })

  ctx.body = {
    all_collect
  }

})

//添加和取消收藏
router.post('/goods', async function (ctx, next) {

  //解密token,获取用户信息
  let token = ctx.header.authorization
  let payload = jwt.decode(token.split(' ')[1], SECRET);

  //获取商品的
  const goods_id = ctx.request.body.goods
  console.log(goods_id)

  //
  const if_colect = await Collect.findAll({
    where: {
      user_id: payload.id,
      goods_id: goods_id
    }
  })
  //判断是否需要新增新的用户与商品的关联
  if (if_colect.length != 0) {
    await Collect.update(
      { is_collect: if_colect[0].is_collect ? 0 : 1 },
      {
        where: {
          user_id: payload.id,
          goods_id,
        }
      }
    )
  } else {
    await Collect.create({
      user_id: payload.id,
      goods_id,
      is_collect: 1
    })
  }

  ctx.body = {
    code:200
  }
})

module.exports = router
