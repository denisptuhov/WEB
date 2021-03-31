let express = require("express");
let path = require("path");
let bodyParser = require("body-parser");
let library = require("./public/bookList.json");
let {writeFileSync} = require('fs');

const server = express();
const urlencodedParser = bodyParser.urlencoded({extended: true});

server.set("view engine", "pug");
server.set("views", path.join(__dirname, "views"));
server.use(express.static(path.join(__dirname, "public")));
server.use(bodyParser.json());


server.get("/", (req, res, next) => {
    res.render("main.pug", {library:library})
    next()
});

server.post("/", urlencodedParser, (req, res, next) => {
    library[(Object.keys(library).length + 1).toString()] =
        {
            "Author" : req.body.BookAuthor,
            "Name" : req.body.BookName,
            "ReleaseDate" : req.body.BookReleaseDate,
            "InLibrary" : true,
            "BackInLibraryDate" : "",
            "Who" : ""
        }

    saveJSON("./public/bookList.json")
    res.redirect("/")
    next()
});

server.get("/inSort", (req, res, next) => {
    let arr = []
    for (let i = 0; i < Object.keys(library).length; ++i)
        arr[i] = library[(i + 1).toString()]

    arr.sort((a, b) => {
        if (a['InLibrary'] && !b['InLibrary'])
            return 1
        if (!a['InLibrary'] && b['InLibrary'])
            return -1
        return 0
    })

    for (let i = 1; i <= arr.length; ++i)
        library[i] = arr[i - 1]

    saveJSON("./public/bookList.json")

    res.redirect("/")
    next()
});

server.get("/dateSort", (req, res, next) => {
    let arr = []
    for (let i = 0; i < Object.keys(library).length; ++i)
        arr[i] = library[(i + 1).toString()]

    arr.sort((a, b) => {
        if (a["BackInLibraryDate"] === "")
            return 1
        if (b["BackInLibraryDate"] === "")
            return -1

        let aa = new Date(a["BackInLibraryDate"])
        let bb = new Date(b["BackInLibraryDate"])

        return aa-bb

    })

    for (let i = 1; i <= arr.length; ++i)
        library[i] = arr[i - 1]

    saveJSON("./public/bookList.json")

    res.redirect("/")
    next()
});

server.delete("/book/:id", (req, res, next) =>
{
    let libraryLen = Object.keys(library).length

    for (let i = parseInt(req.params.id); i < libraryLen; ++i) {
        library[i.toString()] = library[(i + 1).toString()]
    }
    delete library[libraryLen.toString()]

    saveJSON("./public/bookList.json")
    next()
});

server.get("/create", (req, res, next) => {
    res.render("createBook.pug")
    next()
});

server.get("/edit/:id", (req, res, next) => {
    res.render("editBook.pug", {name:req.params.id.toString(), library:library[req.params.id]})
    next()
});

server.post("/edit/:id", urlencodedParser, (req, res, next) => {
    library[req.params.id].Author = req.body.BookAuthor
    library[req.params.id].Name = req.body.BookName
    library[req.params.id].ReleaseDate = req.body.BookReleaseDate

    saveJSON("./public/bookList.json")
    res.redirect("/")
    next()
});

server.post("/take/:id", urlencodedParser, (req, res, next) => {
    library[req.params.id]["InLibrary"] = false
    library[req.params.id]["BackInLibraryDate"] = req.body.BackInLibraryDate
    library[req.params.id]["Who"] = req.body.Who

    saveJSON("./public/bookList.json")
    res.redirect("/")
    next()
});

server.listen(3000, () => {
    console.log("Server started at: http://localhost:3000");
});

function saveJSON(url)
{
    const fs = require("fs")
    writeFileSync(url, JSON.stringify(library, null, 4), 'utf-8', (err) => {
        if(err) throw err;
    });
}

module.exports = server
