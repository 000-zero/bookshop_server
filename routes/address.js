const router = require('koa-router')()
const Address = require('../models/address')
const jwt = require('jwt-simple')

const SECRET = 'shared-secret'; // demo，可更换

router.prefix('/api/address')

//获取地址列表
router.get('/', async (ctx, next) => {
    //判断token是否过期
    try {
        var payload = jwt.decode(ctx.state.token.split(' ')[1], SECRET);
        // console.log(payload)
    } catch (Error) {
        payload = null
        console.log("token已经过期")
    }

    const address = await Address.findAll({
        where: {
            user_id: payload.id
        }
    })

    ctx.body = {
        data: address,
        mag: "test"
    }
})

router.post('/', async (ctx, next) => {
    //判断token是否过期
    try {
        var payload = jwt.decode(ctx.state.token.split(' ')[1], SECRET);
        // console.log(payload)
    } catch (Error) {
        payload = null
        console.log("token已经过期")
    }

    const { name, province, city, address, county, phone, is_default } = ctx.request.body
    //正则表达式 判断手机号格式
    var regExp = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/
    var flag = regExp.test(phone);
    if (flag && name.length != 0 && province.length != 0 && city.length != 0 && address.length != 0 && phone.length != 0) {
        if (is_default == 1) {
            await Address.update(
                { is_default: 0 },
                {
                    where: {
                        user_id: payload.id
                    }
                }
            )
        }
        await Address.create({
            user_id: payload.id, name, province, city, address, county, phone, is_default
        })
        ctx.body = {
            msg: "创建成功"
        }
    } else if (name.length == 0 || province.length == 0 || city.length == 0 || address.length == 0 || phone.length == 0) {
        ctx.status = 422
        ctx.body = {
            errors: "地址相关信息不能为空"
        }
    } else if (flag == false) {
        ctx.status = 422
        ctx.body = {
            errors: "手机号码格式不对"
        }
    }
})

//获取地址信息
router.get('/:id', async (ctx, next) => {
    const id = ctx.params.id
    const address = await Address.findAll({
        where: {
            id
        }
    })
    ctx.body = {
        address: address[0]
    }
})

//更新地址信息
router.put('/:address', async (ctx, next) => {
    const id = ctx.params.address

    //判断token是否过期
    try {
        var payload = jwt.decode(ctx.state.token.split(' ')[1], SECRET);
        // console.log(payload)
    } catch (Error) {
        payload = null
        console.log("token已经过期")
    }

    const { name, province, city, address, county, phone, is_default } = ctx.request.body
    //正则表达式 判断手机号格式
    var regExp = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/
    var flag = regExp.test(phone);
    if (flag && name.length != 0  && address.length != 0 && phone.length != 0) {
        //判断是不是默认地址
        if (is_default == 1) {
            await Address.update(
                { is_default: 0 },
                {
                    where: {
                        user_id: payload.id
                    }
                }
            )
        }
        await Address.update(
            {user_id: payload.id, name, province, city, address, county, phone, is_default},
            {
                where:{
                    id
                }
            }
        )
        ctx.body = {
            msg: "更新成功"
        }
    } else if (name.length == null || address.length == null || phone.length == null) {
        ctx.status = 422
        ctx.body = {
            errors: "地址相关信息不能为空"
        }
    } else if (flag == false) {
        ctx.status = 422
        ctx.body = {
            errors: "手机号码格式不对"
        }
    }else {
        ctx.status = 422
        ctx.body = {
            errors:"修改失败，地址相关信息不能为空"
        }
    }

})

//删除地址
router.delete('/:address', async (ctx, next) => {
    const id = await ctx.params.address    
    await Address.destroy({
        where:{
          id
        }
      })
    ctx.body = {
        msg:"删除成功"
    }
})



module.exports = router