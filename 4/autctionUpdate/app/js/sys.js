function convertDistance(distance)
{
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return [hours, minutes, seconds]
}

function updateSlider(slider, newPrice, curPrice)
{
    slider.slider({
        range: "min",
        value: 37,
        min: parseInt(curPrice.text().slice(19)) + 1,
        max: parseInt($("#userMoney").text().slice(6)),
        slide: function( event, ui ) {
            newPrice.val(ui.value);
        }
    });
    newPrice.val(slider.slider( "value" ) );
}


$(document).ready(() => {
    socket = io.connect()

    let logDiv = $("#logDiv")
    let raiseForm = $("#raiseForm")
    let newPrice = $("#amount")
    let curPrice = $("#curPrice")
    let priceSlider = $("#slider")
    let userMoney = $("#userMoney")
    let curImgEndTime = $("#curImgEndTime")
    let curImg = $("#img")
    let infoBlock = $("#infoBlock")
    let noMoreImages = $("#noMoreImages")
    let noMoney = $("#noMoney")
    let history = $("#history")

    updateSlider(priceSlider, newPrice, curPrice)

    socket.on('userJoined', (data) => {
        let br = $("<br>")
        let txt = $("<label></label>").text(data.time + ":  " +
            data.name + "  присоединяется к вашей пати");
        logDiv.append(txt)
        logDiv.append(br)
    })

    socket.on('updateUserId', (id) => {
        $("#userName").text("Your ID: " + id)
    })

    socket.on('userRaise', (data) => {
        let br = $("<br>")
        let txt = $("<label></label>").text(data.time + ":  " +
            data.name + " повышает ставку до " + data.newPrice);
        logDiv.append(txt)
        logDiv.append(br)
    })

    socket.on('logUpdatePrice', (newPrice) =>
    {
        console.log(newPrice)
        curPrice.text("Наибольшая ставка: " + newPrice)
    })

    socket.on("toDefaultPrice", () => {
        let br = $("<br>")
        let txt = $("<label></label>").text("Цена сброшена до начальной");
        logDiv.append(txt)
        logDiv.append(br)
    })

    socket.on('updateCurPrice', () => {
        let userM = parseInt(userMoney.text().slice(6))
        let curPriceM = parseInt(curPrice.text().slice(19)) + 1

        if (userM < curPriceM) {
            noMoney.css("display", "block")
            infoBlock.css("display", "none")
        }
        else {
            noMoney.css("display", "none")
            infoBlock.css("display", "block")
            updateSlider(priceSlider, newPrice, curPrice)
        }
    })

    socket.on("updateUserMoney", (money) => {
        userMoney.text("Ca$h: " + money)
    })

    socket.on("updateNewImg", (img) => {
        curImgEndTime.text(img["endTime"])
        curImg.attr("src", img["Url"])

    })

    socket.on("logBuyInfo", (img) => {
        let br = $("<br>")
        let br2 = $("<br>")
        let txt = $("<label></label>").text(img["endTime"].slice(12) + ":  Лот " + img["Name"] + " продан");
        let txt2 = $("<label></label>").text("Покупатель: "+ img["who"])
        logDiv.append(txt)
        logDiv.append(br)
        logDiv.append(txt2)
        logDiv.append(br2)
    })

    socket.on("logNotBuyInfo", (img) => {
        let br = $("<br>")
        let txt = $("<label></label>").text(img["endTime"].slice(12) + ":  Лот " + img["Name"] + " не продан");
        logDiv.append(txt)
        logDiv.append(br)
    })

    socket.on("updateHistory", (img) => {
        let elem = $("<img>").attr("src", img["Url"])
        let br = $("<br>")
        let br2 = $("<br>")
        let txt = $("<label></label>").text("Price: " + img["curPrice"])

        history.append(elem)
        history.append(br)
        history.append(txt)
        history.append(br2)
    })

    socket.on("disconnectUser", (name) => {
        let br = $("<br>")
        let txt =  $("<label></label>").text("Пользователь " + name + " покинул нас")
        logDiv.append(txt)
        logDiv.append(br)
    })

    socket.on("noImagesMore", () => {
        curImg.css("display", "none")
        infoBlock.css("display", "none")
        noMoreImages.css("display", "block")
    })


    raiseForm.submit((event) => {
        event.preventDefault()

        let incorrectValue = $("#incorrectValue")
        let curPriceMoney = parseInt(curPrice.text().slice(19)) + 1
        if (newPrice.val() <= curPriceMoney)
            incorrectValue.css("display", "block")
        else {
            incorrectValue.css("display", "none")
            socket.emit("raise", newPrice.val())
        }
    })


    $("#accordion").accordion({
        heightStyle: "content"
    })


    let auctionEndTime = Date.parse($("#auctionEndTime").text())
    let auctionIntervalId = setInterval(() => {
        let curImgEndT = Date.parse(curImgEndTime.text())
        let cur = new Date().getTime()

        let auctionDistance = auctionEndTime - cur
        let curImgDistance = curImgEndT - cur

        let auctionParams = convertDistance(auctionDistance)
        let curImgParams = convertDistance(curImgDistance)

        let auctionHours = auctionParams[0],
            auctionMinutes = auctionParams[1],
            auctionSeconds = auctionParams[2]

        let curImgHours = curImgParams[0],
            curImgMinutes = curImgParams[1],
            curImgSeconds = curImgParams[2]

        $("#auctionTimer").val(auctionHours.toString() + "h " + auctionMinutes.toString() + "m " + auctionSeconds.toString() + "s")

        if (curImgDistance >= 0)
            $("#curImgTimer").val(curImgHours.toString() + "h " + curImgMinutes.toString() + "m " + curImgSeconds.toString() + "s")

        if (curImgDistance <= 0)
            socket.emit("updateImg")
        if (auctionDistance <= 0) {
            document.location.href = "/auctionEnd"
            clearInterval(auctionIntervalId)
        }

    }, 1000)
})
