let mapManager = {
    mapData: null,
    tLayer: null,
    xCount: 0,
    yCount: 0,
    tSize: {x: 19, y: 19},
    mapSize: {x: 240, y: 400},
    tilesets: [],
    imgLoaded: false,
    imgLoadCount: 0,
    jsonLoaded: false,
    view: {x: 0, y:0, w: 1280, h: 1024},

    clear(){
        this.mapData = null;
        this.tLayer = null;
        this.xCount = 500;
        this.yCount = 500;
        this.tSize = {x:20, y:20};
        this.mapSize = {x: 240, y: 400};
        this.tilesets = [];
        this.imgLoaded = false;
        this.imgLoadCount = 0;
        this.jsonLoaded = false;
        this.view = {x:0,y:0,w:1280,h:1024}
    },
    loadMap(path) {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function(){
            if(request.readyState === 4 && request.status === 200)
            {
                mapManager.parseMap(request.responseText);
            }
        };
        request.open("GET", path, true);
        request.send();
    },

    parseMap(tilesJSON) {
        this.mapData = JSON.parse(tilesJSON);
        this.xCount = this.mapData.width;
        this.yCount = this.mapData.height;
        this.tSize.x = this.mapData.tilewidth;
        this.tSize.y = this.mapData.tileheight;
        this.mapSize.x = this.xCount * this.tSize.x;
        this.mapSize.y = this.yCount * this.tSize.y;
        for (let i = 0; i < this.mapData.tilesets.length; i++) {
            const img = new Image();
            img.onload = () => {
                this.imgLoadCount += 1;
                if (this.imgLoadCount === this.mapData.tilesets.length) {
                    this.imgLoaded = true;
                }
            };
            img.src = this.mapData.tilesets[i].image;
            const t = this.mapData.tilesets[i];
            const ts = {
                firstgid: t.firstgid,
                image: img,
                name: t.name,
                xCount: Math.floor(t.imagewidth / this.tSize.x),
                yCount: Math.floor(t.imageheight / this.tSize.y)
            };
            this.tilesets.push(ts);
        }
        this.jsonLoaded = true;
    },

    draw(ctx) {
        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(function () {
                mapManager.draw(ctx);
            }, 100);
        }
        else {
            if (this.tLayer === null)
                for (let id = 0; id < this.mapData.layers.length; id++) {
                    const layer = this.mapData.layers[id];
                    if (layer.type === "tilelayer") {
                        this.tLayer = layer;
                        break;
                    }
                }
            for (let i = 0; i < this.tLayer.data.length; i++) {
                if (this.tLayer.data[i] !== 0) {
                    const tile = this.getTile(this.tLayer.data[i]);
                    let pX = (i % this.xCount) * this.tSize.x;
                    let pY = Math.floor(i / this.xCount) * this.tSize.y;
                    ctx.drawImage(tile.img, tile.px, tile.py,
                        this.tSize.x, this.tSize.y, pX, pY, this.tSize.x, this.tSize.y)
                }
            }
        }
    },

    getTile(tileIndex) {
        const tile = {
            img: null,
            px: 0,
            py: 0
        };
        const tileset = this.getTileset(tileIndex)
        tile.img = tileset.image;
        const id = tileIndex - tileset.firstgid;
        const x = id % tileset.xCount;
        const y = Math.floor(id / tileset.xCount);
        tile.px = x * this.tSize.x;
        tile.py = y * this.tSize.y;
        return tile;
    },

    getTileset(tileIndex) {
        for (let i = this.tilesets.length - 1; i >= 0; i--)
        {
            if (this.tilesets[i].firstgid <= tileIndex)
            {
                return this.tilesets[i];
            }
        }
        return null;
    },

    drawCount(){
        document.getElementById('counter').innerHTML = "Очков: "+ gameManager.collectedBon;
    },

    drawScoreboard()
    {
        let arr = [];
        let tableInd = 1;

        for (let i = 0; i < localStorage.length; ++i)
        {
            let nick = localStorage.key(i);
            let nickScore = localStorage[localStorage.key(i)];

            if (nick !== 'username')
                arr[i] = [nick, nickScore];
        }

        arr.sort(function (elem1, elem2) {return elem2[1] - elem1[1];})

        arr.forEach(function (elem) {
            let curNickname = document.getElementById("Table" + (tableInd++).toString());
            let curScore = document.getElementById("Table" + (tableInd++).toString());

            curNickname.textContent = elem[0];
            curScore.textContent = elem[1];
        })
    },

    parseEntities(){
        if(!this.imgLoaded || !this.jsonLoaded)
        {
            setTimeout(function(){mapManager.parseEntities();},100);
        }
        else
        {
            for(let j = 0;j < this.mapData.layers.length; j++)
                if(this.mapData.layers[j].type === 'objectgroup')
                {
                    const entities = this.mapData.layers[j];
                    for(let i = 0; i < entities.objects.length; i++)
                    {
                        const e = entities.objects[i];
                        try {
                            const obj = Object.create(gameManager.factory[e.type]);
                            obj.name = e.name;
                            obj.pos_x = e.x;
                            obj.pos_y = e.y;
                            obj.size_x = e.width;
                            obj.size_y = e.height;
                            gameManager.entities.push(obj);
                            if (obj.name === "player")
                                gameManager.initPlayer(obj);
                        } catch (ex) {
                            console.log("Error while creating: [" + e.id + "] " + e.type + ", " + ex);
                        }
                    }
                }
        }
    },

    getTilesetIdx(x, y){
        const wX = x;
        const wY = y;
        const idx = Math.floor(wY / this.tSize.y) * this.xCount + Math.floor(wX / this.tSize.x);
        return this.tLayer.data[idx];
    }
};



