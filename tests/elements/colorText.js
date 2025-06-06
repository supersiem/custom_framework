const colorText = {
    "tags": [
        {
            "tag": "rood",
            "code": rood
        }
    ]
};
function rood(element) {
    element.innerHTML = `<span style="color: red;">${element.innerHTML}</span>`;
    changeTag(element, 'p');
}
