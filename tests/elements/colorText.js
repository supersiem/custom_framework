const colorText = {
    "tags": [
        {
            "tag": "rood",
            "code": rood
        },
        {
            "tag": "groen",
            "code": groen
        }
    ]
};
function rood(element) {
    element.innerHTML = `<span style="color: red;">${element.innerHTML}</span>`;
    changeTag(element, 'p');
}
function groen(element) {
    element.innerHTML = `<span style="color: green;">${element.innerHTML}</span>`;
    changeTag(element, 'p');
}