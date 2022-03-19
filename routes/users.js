const router = require('koa-router')()
const jsonwebtoken = require('jsonwebtoken');
const Users = require("../models/users")
const Address = require("../models/address")
const jwt = require('jwt-simple')
const fs = require('fs');
const path = require('path');

router.prefix('/api/users')

const SECRET = 'shared-secret'; // demo，可更换

//登录
router.post('/login', async function (ctx, next) {

  console.log(ctx.request.body.role)

  const users = await Users.findAll({
    where: {
      email: ctx.request.body.email,
      password: ctx.request.body.password
    }
  });

  ctx.state.users = users

  const findResult = await Users.findAll({
    where: {
      email: ctx.request.body.email
    }
  });

  //判断用户是否存在
  if (findResult.length == 0) {
    ctx.status = 422;
    ctx.body = {
      errors: "用户不存在"
    }
  } else {
    if (users.length == 0) {
      ctx.status = 422
      ctx.body = {
        errors: "用户密码错误"
      }
    } else {

      let userToken = {
        id: users[0].id,
        name: users[0].name,
        email: users[0].email,
        password: users[0].password
      };

      if (ctx.request.body.role == 1) {
        if (users[0].Role == 1) {
          ctx.body = {
            statusCode: 200,
            data: {
              msg: "登陆成功"
            },
            token: jsonwebtoken.sign(
              userToken, // 加密userToken, 等同于上面解密的userToken
              SECRET, {
                expiresIn: '24h'
              } // 有效时长1小时
            )
          }
        } else {
          ctx.status = 422;
          ctx.body = {
            errors: "用户权限不足"
          }
        }
      } else {
        ctx.body = {
          statusCode: 200,
          data: {
            msg: "登陆成功"
          },
          token: jsonwebtoken.sign(
            userToken, // 加密userToken, 等同于上面解密的userToken
            SECRET, {
              expiresIn: '24h'
            } // 有效时长1小时
          )
        }
      }



      const user_token = jsonwebtoken.sign(
        userToken, // 加密userToken, 等同于上面解密的userToken
        SECRET, {
          expiresIn: '24h'
        } // 有效时长1小时
      )


      await Users.update({
        remember_token: user_token
      }, {
        where: {
          id: users[0].id
        }
      })


    }
  }

})
//注册
router.post('/register', async function (ctx, next) {
  const user_register = await Users.build({
    name: ctx.request.body.name,
    email: ctx.request.body.email,
    password: ctx.request.body.password,
  })
  if (ctx.request.body.password == ctx.request.body.password_confirmation) {
    ctx.body = {
      msg: "两次密码不一致"
    }
  } else {
    ctx.body = {
      code: 200,
      msg: '注册成功',
    }
    user_register.save()
  }
})
//获取和更新用户信息
router.get('/information', async (ctx, next) => {

  //解密token,获取用户信息
  let token = ctx.header.authorization
  let payload = jwt.decode(token.split(' ')[1], SECRET);

  const {
    name,
    email,
    phone,
    password,
    acatar
  } = await ctx.request.query

  //更新用户信息
  await Users.update({
    name,
    email,
    password,
    phone,
    acatar
  }, {
    where: {
      id: payload.id
    }
  })

  const user = await Users.findAll({
    where: {
      id: payload.id
    }
  })

  // console.log(payload)
  ctx.body = {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    acatar_url: user[0].acatar
  }
})

//退出登录
router.post('/logout', async (ctx, next) => {

  //解密token,获取用户信息
  let token = ctx.header.authorization
  let payload = jwt.decode(token.split(' ')[1], SECRET);

  ctx.header.authorization = null

  console.log("test")

  await Users.update({
    remember_token: null
  }, {
    where: {
      id: payload.id
    }
  })

  ctx.body = {
    code: 201,
    msg: "退出成功"
  }
})

//上传用户头像
router.post('/uploadfile', async (ctx, next) => {

  const user_id = ctx.request.body.user_id
  console.log(user_id)

  //上传单个文件
  const file = ctx.request.files.file; // 获取上传文件
  // 创建可读流
  const reader = fs.createReadStream(file.path);
  let filePath = path.join(__dirname, '../public/acatar/') + `${file.name}`;
  console.log(filePath)
  // 创建可写流
  const upStream = fs.createWriteStream(filePath);
  // 可读流通过管道写入可写流
  reader.pipe(upStream);

  await Users.update({
    acatar: filePath
  }, {
    where: {
      id: user_id
    }
  })

  return ctx.body = "上传成功！";
});

//获取用户列表
router.get('/list', async (ctx, next) => {
  const UserList = await Users.findAll()

  let address = new Array();

  for (let i = 0; i < UserList.length; i++) {
    address[i] = await Address.findAll({
      attributes: ['name', 'province', 'city', 'county', 'address', 'phone'],
      where: {
        user_id: UserList[i].id,
        is_default: 1
      }
    })
    UserList[i].dataValues.address = ''+ address[i][0].province + address[i][0].city + address[i][0].county + address[i][0].address
  }

  ctx.body = {
    data: {
      UserList,
      address,
      pageTotal: UserList.length
    }
  }
});

//用户是否禁用
router.post('/is_locked', async (ctx, next) => {
  const {
    id,
    is_locked
  } = ctx.request.body

  console.log(is_locked)
  await Users.update({
    is_locked
  }, {
    where: {
      id
    }
  })

  ctx.body = {
    msg: 'success'
  }
})


module.exports = router