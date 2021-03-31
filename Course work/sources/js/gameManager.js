let gameManager = {
    factory: {},
    entities: [],
    player: null,
    laterKill: [],
    started: false,
    collectedBon: 0,
    result: [],
    is_bullet: false,
    enemyXMove: 1,
    updateCnt: 0,
    directionChanged: false,
    intervalId: 0,
    lvlNum: "",


    initPlayer(obj)
    {
        this.player = obj;
    },

    kill(obj)
    {
        this.laterKill.push(obj);
    },

    initGame(){
        if(!this.started) {
            this.entities.forEach(function (e)
            {
                if (e.name === "bullet")
                    e.move_y = -1
            })
            this.started = true;
        }
    },

    update()
    {
        if(this.player === null)
            return;
        this.player.move_x = 0;
        this.player.move_y = 0;

        if (eventsManager.action["left"])
            this.player.move_x = -1;
        if (eventsManager.action["right"])
            this.player.move_x = 1;

        if (eventsManager.action["up"] && this.is_bullet === false)
        {
            let obj = Object.create(this.factory["bullet"]);
            obj.size_x = 8;
            obj.size_y = 9;
            obj.pos_x = this.player.pos_x + obj.size_x;
            obj.pos_y = this.player.pos_y - obj.size_y;
            obj.name = "bullet";
            obj.move_y = -1
            gameManager.entities.push(obj);
            soundManager.play("sound/shoot.mp3")

            this.is_bullet = true
        }

        if (this.directionChanged)
        {
            this.enemyXMove *= -1
            this.entities.forEach(function (e) {
                if (e.name.match(/enemy[\d*]/))
                    e.move_y = 1
            })
            this.entities.reverse()
            this.directionChanged = false
        }

        if (this.updateCnt === 10) {
            this.entities.forEach(function (e) {
                if (e.name.match(/enemy[\d*]/) && e.move_y === 0)
                    e.move_x = gameManager.enemyXMove
            })
            this.updateCnt = 0
        }

        this.entities.forEach(function (e) {
            e.update()
        })

        this.entities.forEach(function (e) {
            if (e.name.match(/enemy[\d*]/)) {
                e.move_y = 0
                e.move_x = 0
            }
        })

        for(let i = 0; i < this.laterKill.length; i++)
        {
            const idx = this.entities.indexOf(this.laterKill[i]);
            if(idx > -1){
                let check = this.entities[idx].name;
                if (check === "bullet")
                    this.is_bullet = false
                this.entities.splice(idx, 1);
            }
        }

        if(this.laterKill.length > 0)
            this.laterKill.length = 0;

        let noEnemiesMore = true
        this.entities.forEach(function (e)
        {
            if (e.name.match(/enemy[\d*]/))
                noEnemiesMore = false
        })

        mapManager.draw(ctx);
        this.draw(ctx);

        if (noEnemiesMore) {
            this.onGameOver("win")
        }

        ++this.updateCnt
    },

    onGameOver(result)
    {
        if (result === "win") {
            soundManager.play("sound/win.mp3")
            setTimeout(() => {alert("Congratulations, you win!")}, 10)
        }
        else {
            soundManager.play("sound/lose.mp3")
            setTimeout(() => {alert("Oops, you lose!")}, 10)
        }

        let userName = localStorage['username'];
        let score = this.collectedBon
        localStorage.removeItem('username')

        for (let i = 0; i < localStorage.length; ++i)
            if (localStorage.key(i) === userName)
            {
                if (localStorage[i] < score)
                    localStorage[i] = score;
                this.end()
                return;
            }

        if (localStorage.length < 3) {
            localStorage[userName] = score;
            this.end()
            return;
        }


        let min = {
            nickname: "player",
            score: -1
        };

        for (let i = 0; i < localStorage.length; ++i) {
            let curScore = parseInt(localStorage[localStorage.key(i)]);
            if (min.score === -1 || min.score > curScore) {
                min.score = curScore;
                min.nickname = localStorage.key(i);
            }
        }

        if (min.score < score) {
            localStorage.removeItem(min.nickname);
            localStorage[userName] = score;
        }

        this.end()
    },

    end()
    {
      /*  let levels = document.getElementsByName("level")
        levels.forEach(function (e)
        {
            e.disabled = false
        })
        document.getElementById("start").disabled = false*/
        clearInterval(this.intervalId)
        mapManager.drawScoreboard()
        gameManager.reload("maps/tilemap2.json")
        gameManager.play()
    },

    reload(jsonName)
    {
        this.lvlNum = jsonName
        mapManager.drawScoreboard()
        gameManager.clear()
        mapManager.clear()
        gameManager.loadAll(jsonName)
        gameManager.initGame()
    },

    clear()
    {
        this.started = false;
        eventsManager.action["space"] = false;
        eventsManager.action["left"] = false;
        eventsManager.action["right"] = false;
        this.player = null
        this.entities.length = 0
        this.enemyXMove = 1
        this.collectedBon = 0
    },

    draw(ctx)
    {
        for (let e = 0; e < this.entities.length; e++)
            this.entities[e].draw(ctx);
    },

    loadAll(jsonName)
    {
        this.factory['Player'] = Player;
        this.factory['Enemy'] = Enemy;
        this.factory['bullet'] = Bullet
        mapManager.loadMap(jsonName);
        spriteManager.loadAtlas("./maps/sprites.json", "./img/spritesheet.png");
        mapManager.parseEntities();
        mapManager.draw(ctx);
        eventsManager.setup();
        mapManager.drawCount();
        soundManager.init();
        soundManager.loadArray(['sound/shoot.mp3', 'sound/lose.mp3', 'sound/win.mp3', 'sound/destroy.mp3', 'sound/start.mp3']);
    },

    play()
    {
        soundManager.play('sound/start.mp3')
        this.intervalId = setInterval(updateWorld, 50);
    },

};

function updateWorld()
{
    gameManager.update();
}
for(let i = 0; i < 5; i++) {
    gameManager.result[i] = {
        name: ' ',
        score: 0
    };
}
