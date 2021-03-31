const app = require("express")()
const server = require('http').createServer(app)
const io = new require("socket.io")(server)

const info = require("./JSON/auctionInfo.json")

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({extended: true});

server.listen(3000, () => {
    console.log("Server started at: http://localhost:3000");
})

userSocets = []

io.sockets.on('connection', (socket) => {
    let name = 'U' + (socket.id).toString().substr(1,4)
    info["participants"][Object.keys(info["participants"]).length] = {
        "Name": name,
        "Money": "1000000"
    }

    userSocets.push(socket)

    socket.broadcast.emit('userJoined', {'name': name, 'time': (new Date).toLocaleTimeString()})
    socket.emit('updateUserId', name)

    socket.on("disconnect", () => {
        socket.broadcast.emit('disconnectUser', name)

        let libraryLen = userSocets.length

        let deleteInd = userSocets.indexOf(socket)

        if (info["auctionImg"][info["curImgInd"]] === undefined)
            return

        if (info["participants"][deleteInd.toString()]["Name"] === info["auctionImg"][info["curImgInd"]]["who"])
        {
            info["auctionImg"][info["curImgInd"]]["who"] = "none"
            info["auctionImg"][info["curImgInd"]]["curPrice"] = "20000"
            socket.broadcast.emit("logUpdatePrice", info["auctionImg"][info["curImgInd"]]["curPrice"])
            socket.broadcast.emit("updateCurPrice")
            socket.broadcast.emit("toDefaultPrice")
        }

        for (let i = userSocets.indexOf(socket); i < libraryLen; ++i)
            info["participants"][i.toString()] = info["participants"][(i + 1).toString()]

        userSocets.splice(userSocets.indexOf(socket), 1)
        delete info["participants"][(libraryLen - 1).toString()]
    })

    socket.on('raise', (newPrice) => {
        info["auctionImg"][info["curImgInd"]]["curPrice"] = newPrice
        info["auctionImg"][info["curImgInd"]]["who"] = name

        socket.broadcast.emit('userRaise', {'name': name, 'time': (new Date).toLocaleTimeString(),
                                                     'newPrice': newPrice})
        io.sockets.emit("logUpdatePrice", newPrice)
        io.sockets.emit("updateCurPrice")
    })

    socket.on("updateImg", () => {
        if (info["auctionImg"][info["curImgInd"]] === undefined)
            return

        let who = info["auctionImg"][info["curImgInd"]]["who"]

        if (who !== "none")
        {
            info["alreadySold"][Object.keys(info["alreadySold"]).length] = info["auctionImg"][info["curImgInd"]]

            for (let i = 0; i < Object.keys(info["participants"]).length; ++i)
                if (info["participants"][i.toString()]["Name"] === who) {
                    info["participants"][i.toString()]["Money"] = (parseInt(info["participants"][i.toString()]["Money"]) -
                        parseInt(info["auctionImg"][info["curImgInd"]]["curPrice"])).toString()

                    io.sockets.emit("logBuyInfo", info["auctionImg"][info["curImgInd"]])
                    userSocets[i].emit("updateHistory", info["auctionImg"][info["curImgInd"]])
                    info["curImgInd"] = parseInt(info["curImgInd"]) + 1
                    if (info["auctionImg"][info["curImgInd"]] === undefined)
                    {
                        io.sockets.emit("noImagesMore")
                        userSocets[i].emit("updateUserMoney", info["participants"][i.toString()]["Money"])
                        break
                    }

                    io.sockets.emit("updateNewImg", info["auctionImg"][info["curImgInd"]])
                    userSocets[i].emit("updateUserMoney", info["participants"][i.toString()]["Money"])
                    io.sockets.emit("logUpdatePrice", "20000")
                    io.sockets.emit("updateCurPrice")
                }
        }
        else {
            io.sockets.emit("logNotBuyInfo", info["auctionImg"][info["curImgInd"]])
            info["curImgInd"] = parseInt(info["curImgInd"]) + 1
            if (info["auctionImg"][info["curImgInd"]] === undefined)
            {
                io.sockets.emit("noImagesMore")
                return
            }
            io.sockets.emit("updateNewImg", info["auctionImg"][info["curImgInd"]])
            io.sockets.emit("logUpdatePrice", "20000")
            io.sockets.emit("updateCurPrice")

        }
    })
})



app.set("view engine", "pug");
app.set("views", "pug")

app.get("/", (req, res, next) => {
    res.render("index.pug", {library: info})
    next()
})

app.get("/user", (req, res, next) => {
    let imgId;

    let cur = new Date().getTime()

    if (cur > Date.parse(info["endTime"]))
    {
        res.redirect("/auctionEnd")
        next()
        return
    }

    if (cur < Date.parse(info["startTime"]))
    {
        res.render("auctionWait.pug", {info: info})
        next()
        return
    }

    for (let i = 0; i < Object.keys(info["auctionImg"]).length; ++i)
    {
        let imgStartDate = new Date(info["auctionImg"][i.toString()]["startTime"]).getTime()
        let imgEndTime = new Date(info["auctionImg"][i.toString()]["endTime"]).getTime()

        if (cur >= imgStartDate && cur < imgEndTime)
        {
            imgId = i
            break
        }
    }

    info["curImgInd"] = imgId.toString()
    res.render("user.pug", {curImg: info["auctionImg"][imgId.toString()], info: info , curImgInd: info["curImgInd"]})
    next()
})

app.post("/", urlencodedParser, (req, res, next) => {
    if (req.body.Name === info["adminKey"])
    {
        res.redirect("/admin")
        next()
    }
    else if (req.body.Name === info["userKey"])
    {
        res.redirect("/user")
        next()
    }

})

app.get("/admin", (req, res, next) => {
    res.render("admin.pug", {library: info})
    next()
})

app.get("/alreadySold", (req, res, next) => {
    res.render("alreadySold.pug", {library: info})
    next()
})

app.get("/auctionEnd", (req, res, next) => {
    res.render("auctionEnd.pug")
    next()
})