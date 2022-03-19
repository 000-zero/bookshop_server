const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

//
const index = require('./routes')
const users = require('./routes/users')
const images = require('./images')
const goods = require('./routes/goods')
const cart = require('./routes/cart')
const collect = require('./routes/collect')
const address = require('./routes/address')
const orders = require('./routes/orders')
const comments = require('./routes/comments')
//

//
const koajwt = require('koa-jwt');
const jwt = require('jwt-simple')
const jsonwebtoken = require('jsonwebtoken');
const koabody = require('koa-body');
const SECRET = 'shared-secret'; // demo，可更换
//

//跨域处理，设置响应头
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', '*');
  ctx.set('Access-Control-Allow-Methods', '*');
  ctx.set("Access-Control-Allow-Credentials", "true");
  if (ctx.method == 'OPTIONS') {
    ctx.body = 200;
  } else {
    await next();
  }
});

//token签发和验证
app.use(koabody({
  multipart: true,
  formidable: {
      maxFileSize: 200*1024*1024    // 设置上传文件大小最大限制，默认2M
  }
}));


//设置token成全局变量
app.use(async (ctx, next) => {
  //解密token,获取用户信息
  let token = ctx.header.authorization
  ctx.state.token = token
  await next()
})

// 中间件对token进行验证
app.use(async (ctx, next) => {
  let token = ctx.header.authorization;
  // let payload = await util.promisify(jsonwebtoken.verify)(token.split(' ')[1], SECRET);
  return next().catch((err) => {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        msg: err.message
      }
    } else {
      throw err;
    }
  })
});

app.use(koajwt({ secret: SECRET }).unless({
  // 登录接口不需要验证
  path: [/^\/api\/users\/login/,
    /^\/api\/index/,
    /^\/api\/index\/manage/,
    /^\/api\/users\/register/,
    /^\/api\/users\/list/,
    /^\/api\/users\/is_locked/,
    /^\/api\/orders\/list/,
    /^\/api\/orders\/?/,
    /^\/api\/login/,
    /^\/api\/goods/,
    /^\/api\/goods\/goods-detail/,
    /^\/api\/users\/uploadfile/]
}));

// routes
app.use(users.routes(), users.allowedMethods())
app.use(index.routes(), index.allowedMethods())
app.use(images.routes(), images.allowedMethods())
app.use(goods.routes(), goods.allowedMethods())
app.use(cart.routes(), cart.allowedMethods())
app.use(collect.routes(), collect.allowedMethods())
app.use(address.routes(), address.allowedMethods())
app.use(orders.routes(), orders.allowedMethods())
app.use(comments.routes(), comments.allowedMethods())

onerror(app)



// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})



//



// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

//

//

module.exports = app
