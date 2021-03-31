const fs = require('fs');

const express = require("express")
const server = express()

const https = require("https")
httpsOptions = {
    key: fs.readFileSync("../keys/example.key"),
    cert: fs.readFileSync("../keys/example.csr")
}

https.createServer(httpsOptions, server).listen(3000, () => {
    console.log("Server started at: https://localhost:3000");
})

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({extended: true});

let paintings = require("../JSON/paintings.json")
let participants = require("../JSON/participants.json")
let auctionSettings = require("../JSON/auctionSettings.json")


server.set("view engine", "pug");
server.set("views", "../pug")

server.get("/", (req, res, next) => {
    res.render("index.pug", {library: paintings})
    next()
})

server.get('/painting/:id', (req, res, next) => {
    res.render("editPainting.pug", {name: req.params.id, library: paintings[req.params.id]})
    next()
})

server.post("/painting/:id", urlencodedParser, (req, res, next) => {
    if (parseInt(req.body.PaintingStartPrice) < 0)
    {
        res.redirect("/")
        next()
    }

    paintings[req.params.id].Name = req.body.PaintingName
    paintings[req.params.id].Author = req.body.PaintingAuthor
    paintings[req.params.id].StartPrice = req.body.PaintingStartPrice
    paintings[req.params.id].MinRate = req.body.PaintingMinRate
    paintings[req.params.id].MaxRate = req.body.PaintingMaxRate

    saveJSON('../JSON/paintings.json', paintings)
    res.redirect("/")
    next()
})

server.get('/participants/', (req, res, next) => {
    res.render("participants/participants.pug", {library: participants})
    next()
})

server.get('/participants/delete/:id', (req, res, next) => {
    let participantsCnt = Object.keys(participants).length

    for (let i = parseInt(req.params.id); i < participantsCnt; ++i) {
        participants[i.toString()] = participants[(i + 1).toString()]
    }
    delete participants[participantsCnt.toString()]

    saveJSON('../JSON/participants.json', participants)
    res.end()
    next()
})

server.get('/participants/edit/:id', (req, res, next) => {
    res.render("participants/editParticipant.pug", {name: req.params.id, library: participants[req.params.id]})
    next()
})

server.post("/participants/edit/:id", urlencodedParser, (req, res, next) => {
    participants[req.params.id].Name = req.body.ParticipantName
    participants[req.params.id].Money = req.body.ParticipantMoney

    saveJSON('../JSON/participants.json', participants)
    res.redirect(`/participants/`)
    next()
})

server.get("/participants/create", (req, res, next) => {
    res.render("participants/createParticipant.pug")
    next()
})

server.post("/participants/create", urlencodedParser, (req, res, next) => {
    participants[(Object.keys(participants).length + 1).toString()] =
        {
            "Name" : req.body.ParticipantName,
            "Money" : req.body.ParticipantMoney,
        }

    saveJSON('../JSON/participants.json', participants)
    res.redirect(`/participants/`)
    next()
})

server.get("/auctionSettings", (req, res, next) => {
    res.render("auctionSettings/auctionSettings.pug", {library: auctionSettings})
    next()
})

server.get("/auctionSettings/edit", (req, res, next) => {
    res.render("auctionSettings/editAuctionSettings.pug", {library: auctionSettings})
    next()
})

server.post("/auctionSettings/edit", urlencodedParser, (req, res, next) => {
    auctionSettings = {
        "date" : req.body.auctionSettingsDate,
        "time" : req.body.auctionSettingsTime,
        "timeout" : req.body.auctionSettingsTimeout,
        "timeInterval" : req.body.auctionSettingsTimeInterval,
        "studyingInformationTime" : req.body.auctionSettingsStudying
    }

    saveJSON('../JSON/auctionSettings.json', auctionSettings)
    res.redirect(`/auctionSettings`)
    next()
})

function saveJSON(url, obj)
{
    const fs = require("fs")
    fs.writeFileSync(url, JSON.stringify(obj, null, 4), 'utf-8', (err) => {
        if(err) throw err;
    });
}
