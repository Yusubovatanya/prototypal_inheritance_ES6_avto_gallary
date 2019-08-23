const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)

// Add custom routes before JSON Server router
server.use(jsonServer.bodyParser)
server.post('/user', (req, res) => {
    const {user} = require("./db"); //подключения файла в Node.js
    console.log(req.body.login);
    console.log(req.body.password);
    if(req.body.login == user.login && req.body.password == user.password) {
        res.jsonp({status:true})
        console.log(resultAuthorization);
    } else {
        res.sendStatus(401);
    }
})

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
// server.use((req, res, next) => {
//   if (req.method === 'POST') {
//     req.body.createdAt = Date.now()
//   }
//   // Continue to JSON Server router
//   next()
// })

// Use default router
server.use(router)
server.listen(3000, () => {
  console.log('JSON Server is running')
})