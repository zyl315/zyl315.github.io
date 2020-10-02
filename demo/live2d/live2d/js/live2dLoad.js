function loadAllLive2dCharacter() {
    $.ajax({
        cache: true,
        url: "./live2d/json/character.json",
        dataType: "JSON",
        success: function (result) {
            console.log(result);

        }
    });
}


function initElementUI() {
    var app = new Vue({
        el: "#app",
        data: {
            items: ["Pio", "tia", "miku"]
        },
        methods: {
            loadCharacter: function (event) {
                var name = event.currentTarget;
                loadlive2d("live2d-model", "./live2d/model/" + name.innerHTML + "/model.json");
            }
        }
    })
}

function init() {
    loadAllLive2dCharacter();
    initElementUI();
    loadlive2d("live2d-model", "./live2d/model/" + "Pio" + "/model.json");
}


init()