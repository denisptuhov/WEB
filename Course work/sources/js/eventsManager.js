let eventsManager = {
    bind: [],
    action: [],
    setup: function(){
        this.bind[37] = 'left';
        this.bind[39] = 'right';
        this.bind[38] = 'up';

        document.body.addEventListener("keydown",e =>this.onKeyDown(e));
        document.body.addEventListener("keyup",e => this.onKeyUp(e));
    },
    onKeyDown: function(event) {
        const action = eventsManager.bind[event.keyCode];
        if (action && gameManager.started)
            eventsManager.action[action] = true;
    },
    onKeyUp: function(event){
        const action = eventsManager.bind[event.keyCode];
        if (action)
            eventsManager.action[action] = false;
    },
};
