builtInElements.forEach(element => {
    let el2 = document.createElement('li');
    el2.innerText = element.tag;
    document.getElementById('tag-list').appendChild(el2);
});
if (score == 20) {

    let el2 = document.createElement('li');
    el2.innerText = score + " is je score";
    document.getElementById('tag-list').appendChild(el2);
}