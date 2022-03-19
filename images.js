const path = require('path');
const mime = require('mime-types'); //需npm安装
const fs = require('fs');
const router = require('koa-router')()

router.prefix('/')

router.get('/public/images', async (ctx, next) => {
	console.log(ctx.url)
    let filePath = path.join(__dirname, ctx.url); //图片地址
	let file = null;
	try {
	    file = fs.readFileSync(filePath); //读取文件
	} catch (error) {
		//如果服务器不存在请求的图片，返回默认图片
	    filePath = path.join(__dirname, '/public/images/test2.png'); //默认图片地址
	    file = fs.readFileSync(filePath); //读取文件	    
	}

	let mimeType = mime.lookup(filePath); //读取图片文件类型
	ctx.set('content-type', mimeType); //设置返回类型
	ctx.body = file; //返回图片
})

module.exports = router