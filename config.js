const databaseConfig = {
  host: "114.55.94.207",
  user: "root",
  password: "123456",
  name: "book_shop",
  rebuild: false, // 是否每次重启服务器时重建数据库
  logging: false // 是否再控制台输出建表语句
}

module.exports = {
  databaseConfig
}
