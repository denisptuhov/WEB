$(document).ready(() => {
    let deleteButtons = $(".delete")
    for (let i = 0; i < deleteButtons.length; ++i)
    {
        $(deleteButtons[i]).click(() =>{
            $.get(`/participants/delete/${i + 1}`)
            document.location.reload()
        })
    }
})