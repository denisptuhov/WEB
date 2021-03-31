function store(src)
{
    localStorage["user-name"] = src.value;
}

function read()
{
    let player = document.getElementById("Player");
    player.textContent = "Player " + localStorage["user-name"];
}

read();