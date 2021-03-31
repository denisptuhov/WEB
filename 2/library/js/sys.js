let modal = document.getElementById("takeModal")
let overlay = document.getElementById("overlay")
let form = document.getElementById("modalForm")
let takeButtons = document.getElementsByClassName("take")

for (let i = 0; i < takeButtons.length; ++i)
{
    takeButtons[i].onclick = () => {
        modal.style.display = "block"
        overlay.style.display = "block"
        form.action = "/take/" + takeButtons[i].className[takeButtons[i].className.length - 1]
    }
}

overlay.onclick = () => {
    modal.style.display = "none"
    overlay.style.display = "none"
}

let deleteButtons = document.getElementsByClassName('delete')
for (let i = 0; i < deleteButtons.length; ++i)
{
    deleteButtons[i].onclick = () =>
    {
        let xhr = new XMLHttpRequest();
        xhr.open('DELETE', '/book/' + (i + 1).toString())
        xhr.send()
        document.location.reload()
    }
}

let dateSort = document.getElementById("dateSort")
let inSort = document.getElementById("inSort")

dateSort.onclick = () => {

    let xhr = new XMLHttpRequest();
    xhr.open('GET', './dateSort')
    xhr.send()
    document.location.reload()
}

inSort.onclick = () => {

    let xhr = new XMLHttpRequest();
    xhr.open('GET', './inSort')
    xhr.send()
    document.location.reload()
}
