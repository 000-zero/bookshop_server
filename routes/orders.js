const router = require('koa-router')()
const jsonwebtoken = require('jsonwebtoken');
const Goods = require("../models/goods")
const Address = require("../models/address")
const Cart = require("../models/cart")
const Orders = require("../models/orders")
const Users = require("../models/users")
const OrderDetails = require('../models/order_details')
const Order_details = require("../models/order_details")
const jwt = require('jwt-simple');

const SECRET = 'shared-secret'; // demo，可更换

router.prefix('/api/orders')

//订单预览
router.get('/preview', async (ctx, next) => {
    //判断token是否过期
    try {
        var payload = jwt.decode(ctx.state.token.split(' ')[1], SECRET);
        // console.log(payload)
    } catch (Error) {
        payload = null
        console.log("token已经过期")
    }

    //获取用户地址信息
    const address = await Address.findAll({
        where: {
            user_id: payload.id,
            is_default: 1
        }
    })

    var cart = await Cart.findAll({
        where: {
            user_id: payload.id,
            is_checked: 1
        }
    })

    var goods = new Array();

    for (var i = 0; i < cart.length; i++) {
        goods[i] = await Goods.findAll({
            attributes: ['id', 'title', 'price', 'cover'],
            where: {
                id: cart[i].goods_id
            }
        })
        cart[i].dataValues.goods = goods[i][0]
    }

    ctx.body = {
        address,
        cart
    }


})

//生成订单
router.post('/', async (ctx, next) => {

    //判断token是否过期
    try {
        var payload = jwt.decode(ctx.state.token.split(' ')[1], SECRET);
        // console.log(payload)
    } catch (Error) {
        payload = null
        console.log("token已经过期")
    }

    const {
        address_id,
        totalPrice
    } = ctx.request.body
    var status = 1

    //生成订单号
    const data = new Date()
    const order_no = "" + payload.id + data.getTime()

    await Orders.create({
        user_id: payload.id,
        order_no,
        amount: totalPrice,
        address_id,
        status
    })

    const order = await Orders.findAll({
        where: {
            order_no
        }
    })

    var carts = new Array()
    var goods = new Array();

    carts = await Cart.findAll({
        where: {
            user_id: order[0].user_id,
            is_checked: 1
        }
    })

    //获取用户购物车的物品信息
    for (let i = 0; i < carts.length; i++) {
        goods[i] = await Goods.findAll({
            attributes: ['id', 'title', 'price', 'cover'],
            where: {
                id: carts[i].goods_id
            }
        })
        await Order_details.create({
            order_id: order[0].id,
            goods_id: goods[i][0].id,
            price: goods[i][0].price,
            num: carts[i].num,
            createdAt: data
        })
    }

    //更改提交订单后的购物车商品状态
    await Cart.destroy({
        where: {
            user_id: payload.id,
            is_checked: 1
        }
    })
    // console.log(goods[0])

    ctx.body = {
        order: order[0]
    }
});

//支付
router.post('/pay', async (ctx, next) => {

    //判断token是否过期
    try {
        var payload = jwt.decode(ctx.state.token.split(' ')[1], SECRET);
        // console.log(payload)
    } catch (Error) {
        payload = null
        console.log("token已经过期")
    }

    const {
        password,
        orders_id
    } = ctx.request.body

    // 支付时间
    const data = new Date()
    const Month = data.getMonth() + 1
    var pay_time = '' + data.getFullYear() + '-' + Month + '-' + data.getDay() + '  ' + data.getHours() + ':' + data.getMinutes() + ':' + data.getSeconds()


    if (password != null) {
        if (password == payload.password) {
            var status = 2
            await Orders.update({
                status,
                pay_time
            }, {
                where: {
                    id: orders_id
                }
            })
            ctx.body = {
                msg: '支付成功'
            }
        } else {
            ctx.status = 422
            ctx.body = {
                errors: "支付密码错误"
            }
        }
    } else {
        ctx.status = 422
        ctx.body = {
            errors: "密码不能为空"
        }
    }
});

//获取用户订单列表
router.get('/', async (ctx, next) => {
    //判断token是否过期
    try {
        var payload = jwt.decode(ctx.state.token.split(' ')[1], SECRET);
        // console.log(payload)
    } catch (Error) {
        payload = null
        console.log("token已经过期")
    }

    let {
        current,
        status,
        page
    } = ctx.request.query

    const orders = await Orders.findAll({
        where: {
            user_id: payload.id,
            status: status
        }
    }, {
        offset: (page - 1) * 6,
        limit: 6
    })

    //更改时间输出格式
    for (let i = 0; i < orders.length; i++) {
        orders[i].dataValues.created_at = JSON.parse(JSON.stringify(orders[i].createdAt).replace(/[A-Z]/, " ").replace(/\.\d{3}[A-Z]/, ""))
    }

    ctx.body = {
        data: orders
    }
});

//管理员获取用户订单详细信息
router.get('/orderDetails', async (ctx, next) => {
    const {
        userId,
        orderID
    } = ctx.request.query

    //获取用户邮箱和id
    const Uid_email_acatar = await Users.findAll({
        attributes:['id','email','acatar'],
        where:{
            id:userId
        }
    })

    //获取订单状态
    const status = await Orders.findAll({
        attributes:['status'],
        where:{
            id:orderID
        }
    })

    //获取地址信息
    const address = await Address.findAll({
        where: {
            user_id: userId,
            is_default: 1
        }
    })

    //订单详情
    const order_details = await Order_details.findAll({
        where: {
            order_id: orderID
        }
    })

    let order_goods = new Array();
    //商品信息
    for (let i = 0; i < order_details.length; i++) {
        order_goods[i] = await Goods.findAll({
            where: {
                id: order_details[i].goods_id
            }
        })
        order_details[i].dataValues.goods = order_goods[i][0]
    }

    ctx.body = {
        address: address[0],
        order_details,
        Uid_email_acatar:Uid_email_acatar[0],
        status:status[0]
    }
})

//获取所有订单列表
router.get('/list', async (ctx, next) => {
    var {
        page
    } = ctx.request.query
    console.log(page)

    const order = await Orders.findAll()

    const OrderList = await Orders.findAll({
        offset: (page - 1) * 8,
        limit: 8
    })
    ctx.body = {
        data: {
            OrderList
        },
        pageTotal: order.length,
        pageSize: OrderList.length,
    }
});

//订单详情
router.get('/:order_id', async (ctx, next) => {
    //判断token是否过期
    try {
        var payload = jwt.decode(ctx.state.token.split(' ')[1], SECRET);
        // console.log(payload)
    } catch (Error) {
        payload = null
        console.log("token已经过期")
    }

    const order_id = ctx.params.order_id

    //获取地址信息
    const address = await Address.findAll({
        where: {
            user_id: payload.id,
            is_default: 1
        }
    })

    //订单信息
    const order = await Orders.findAll({
        where: {
            id: order_id
        }
    })

    //订单详情
    const order_details = await Order_details.findAll({
        where: {
            order_id
        }
    })

    let order_goods = new Array();
    //商品信息
    for (let i = 0; i < order_details.length; i++) {
        order_goods[i] = await Goods.findAll({
            where: {
                id: order_details[i].goods_id
            }
        })
        order_details[i].dataValues.goods = order_goods[i][0]
    }

    console.log(order_id)
    ctx.body = {
        address: address[0],
        order_details,
        order: order[0]
    }
})

//删除订单
router.delete('/:order_id', async (ctx, next) => {
    const id = await ctx.params.order_id
    console.log(id)

    await Orders.destroy({
        where: {
            id
        }
    })

    await OrderDetails.destroy({
        where: {
            order_id: id
        }
    })
    ctx.body = {
        msg: "删除成功"
    }
})

//改变订单状态
router.post('/status',async (ctx,next)=>{
    const {status,id} = ctx.request.body
    await Orders.update({
        status
    },{
        where:{
            id
        }
    })
    ctx.body = {
        msg:"success"
    }
})

module.exports = router