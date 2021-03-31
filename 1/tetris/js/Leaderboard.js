
function fillTable()
{
    let arr = [];
    let tableInd = 1;

    for (let i = 0; i < localStorage.length; ++i)
    {
        let nick = localStorage.key(i);
        let nickScore = localStorage[localStorage.key(i)];
        arr[i] = [nick, nickScore];
    }

    arr.sort(function (elem1, elem2) {return elem2[1] - elem1[1];})

    arr.forEach(function (elem) {
        let curNickname = document.getElementById("Table" + (tableInd++).toString());
        let curScore = document.getElementById("Table" + (tableInd++).toString());

        curNickname.textContent = elem[0];
        curScore.textContent = elem[1];
    })

}

fillTable();