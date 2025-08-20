let score = 0;
if (getUrlBasedGlobalVariable("score")) {
    score = getUrlBasedGlobalVariable("score");
}

function klik() {
    score++;
    document.getElementById("score").innerHTML = score;
    setUrlBasedGlobalVariable("score", score);
}