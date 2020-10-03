function loadAllLive2dCharacter() {
    $.ajax({
        cache: true,
        url: "./live2d/json/character.json",
        dataType: "JSON",
        success: function (result) {
            initData(result)
        }
    });
}

function initData(character) {
    var character_name = [];
    for (let name in character) {
        character_name.push(name);
    }
    var app = new Vue({
        el: "#app",
        data: {
            items: character_name
        },
        methods: {
            loadCharacter: function (event) {
                var name = event.currentTarget;
                loadlive2d("live2d-model", "./live2d/model/" + character[name.innerHTML] + "/model.json");
            }
        }
    })
    loadlive2d("live2d-model", "./live2d/model/" + character[character_name[0]] + "/model.json");
}

loadAllLive2dCharacter()