$(document).ready(() => {
    let auctionStartTime = Date.parse($("#auctionStartTime").text())

    let intervalId = setInterval(() => {
        let cur = new Date().getTime()

        let distance = auctionStartTime - cur
        console.log(distance)
        if (distance <= 0)
        {
            clearInterval(intervalId)
            document.location.href = "/user"
            return
        }

        let dHours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let dMinutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let dSeconds = Math.floor((distance % (1000 * 60)) / 1000);

        $("#timer").val(dHours.toString() + "h " + dMinutes.toString() + "m " + dSeconds.toString() + "s")

    }, 1000)
})