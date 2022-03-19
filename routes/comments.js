const router = require('koa-router')()
const Comments = require("../models/comments")
const User = require("../models/users")
const HasLike = require("../models/hasLike")
const jwt = require('jwt-simple')

const SECRET = 'shared-secret'; // demo，可更换

//删除评论
router.prefix('/api/comments')

//获取用户的全部收藏
router.get('/:goods_id', async function (ctx, next) {

    //判断token是否过期
    try {
        var payload = jwt.decode(ctx.state.token.split(' ')[1], SECRET);
        // console.log(payload)
    } catch (Error) {
        payload = null
        console.log("token已经过期")
    }

    const goods_id = ctx.params.goods_id

    // var commentList = new Array();
    const commentList = await Comments.findAll({
        attributes: ['id', 'user_id', 'parentId', 'goods_id', 'goods_id', 'content', 'likeNum', 'createdAt'],
        where: {
            goods_id
        }
    })

    var user = new Array();
    var haslike = new Array();
    for (let i = 0; i < commentList.length; i++) {
        user[i] = await User.findAll({
            attributes: ['name', 'acatar', 'id'],
            where: {
                id: commentList[i].user_id
            }
        })
        if (commentList[i].user_id == payload.id) {
            commentList[i].dataValues.owner = true
        } else {
            commentList[i].dataValues.owner = false
        }

        haslike[i] = await HasLike.findAll({
            where: {
                comment_id: commentList[i].id
            }
        })

        for(let x = 0; x<haslike[i].length;x++){
            console.log(haslike[i][x].user_id)
            if(haslike[i][x].hasLike == true && haslike[i][x].user_id == payload.id){
                commentList[i].dataValues.hasLike = true
                break
            }else{
                commentList[i].dataValues.hasLike = false
            }
        }
        // console.log(haslike[i][0].user_id)
        // console.log(payload.id)
        // console.log(haslike[i][0].user_id == payload.id)
        // if (haslike[i][0].hasLike == true && haslike[i][0].user_id == payload.id) {
        //     commentList[i].dataValues.hasLike = true
        // } else {
        //     commentList[i].dataValues.hasLike = false
        // }

        commentList[i].dataValues.avatarUrl = user[i][0].acatar
        commentList[i].dataValues.nickName = user[i][0].name
        commentList[i].dataValues.createTime = user[i][0].createdAt
    }

    // console.log(haslike[0][1].dataValues)
    // for(let x;x<haslike[0].length;x++){
    //     if(haslike[0][x].user_id == payload.id && haslike[0][x].hasLike == true){
    //         haslike[0][x].dataValues.comment_id
    //     }else{
    //         haslike[0][x].dataValues.comment_id
    //     }
    // }

    ctx.body = {
        data: {
            "commentList": commentList
        }
    }
})

//添加评论
router.post('/addComments', async (ctx, next) => {
    //判断token是否过期
    try {
        var payload = jwt.decode(ctx.state.token.split(' ')[1], SECRET);
        // console.log(payload)
    } catch (Error) {
        payload = null
        console.log("token已经过期")
    }

    const {
        content,
        pId,
        goods_id
    } = ctx.request.body

    if (pId != null) {
        var userId = await Comments.findAll({
            attributes: ['user_id'],
            where: {
                id: pId
            }
        })
    } else {
        var userId = [{
            user_id: null
        }]
    }

    await Comments.create({
        user_id: payload.id,
        goods_id,
        parentId: userId[0].user_id,
        content
    })

    const comment = await Comments.findAll({
        where: {
            user_id: payload.id,
            goods_id,
            parentId: userId[0].user_id,
            content
        }
    })

    await HasLike.create({
        user_id: payload.id,
        comment_id: comment[comment.length - 1].id
    })


    ctx.body = {
        content,
        parentId: userId[0].user_id,
        goods_id
    }
})

//删除评论
router.delete('/:commentId', async (ctx, next) => {
    const commentId = await ctx.params.commentId
    console.log(commentId)
    await Comments.destroy({
        where: {
            id: commentId
        }
    }).then(
        await HasLike.destroy({
            where: {
                comment_id: commentId
            }
        }),
        ctx.body = {
            msg: 'success'
        }
    )

})

//评论点赞
router.post('/haslike', async (ctx, next) => {
    //判断token是否过期
    try {
        var payload = jwt.decode(ctx.state.token.split(' ')[1], SECRET);
        // console.log(payload)
    } catch (Error) {
        payload = null
        console.log("token已经过期")
    }

    const {
        commentId
    } = await ctx.request.body

    var haslike = await HasLike.findAll({
        where: {
            user_id: payload.id,
            comment_id: commentId
        }
    })

    if (haslike.length == 0) {
        await HasLike.create({
            user_id: payload.id,
            comment_id: commentId
        })
        haslike = await HasLike.findAll({
            where: {
                user_id: payload.id,
                comment_id: commentId
            }
        })
    }
    ////

    // const haslike = await HasLike.findAll({
    //     where: {
    //         comment_id: commentId
    //     }
    // })

    const comment = await Comments.findAll({
        where: {
            id: commentId
        }
    })

    var likeNum = comment[0].likeNum
    var if_haslike = haslike[0].hasLike ? false : true

    if (if_haslike == false && 0 < likeNum) {
        likeNum--
    } else if (if_haslike == true) {
        likeNum++
    }

    await HasLike.update({
        hasLike: if_haslike
    }, {
        where: {
            user_id: payload.id,
            comment_id: commentId
        }
    })

    await Comments.update({
        likeNum
    }, {
        where: {
            id: commentId
        }
    })

    ctx.body = {
        msg: 'success'
    }
})

module.exports = router