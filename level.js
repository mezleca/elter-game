const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const object_placeholder = { 
    x: 0,
    y: 0,
    w: 20,
    h: 5,
    color: "red",
    types: ["solid", "pushable", "finish", "player"],
    type: "solid",
    can_move: [true, true, true, true]
};

let objects = [];
let current_object = 0;
let current_type = "solid";
let mouse_down = false;
let mouse_x = 0;
let mouse_y = 0;
let mouse_x2 = 0;
let mouse_y2 = 0;

const file_input = document.getElementById('file_input');

// le o arquivo e passa para os objetos caso o arquivo for valido
file_input.addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = () => {
        let data = JSON.parse(reader.result);

        // verifica se o arquivo eh valido
        if (data.length == 0) {
            alert("arquivo invalido");
            return;
        }

        objects = data;
        console.log(objects);
    };

    reader.readAsText(file_input.files[0]);
});   

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // green bg
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // desenha todos os objetos
    for (let i = 0; i < objects.length; i++) {
        ctx.fillStyle = objects[i].color;
        ctx.fillRect(objects[i].x, objects[i].y, objects[i].w, objects[i].h);
    }

    // desenha o objeto atual
    ctx.fillStyle = current_object.color;
    ctx.fillRect(current_object.x, current_object.y, current_object.w, current_object.h);

    // desenha o retangulo de selecao
    if (mouse_down && current_type) {
        ctx.strokeStyle = "black";
        ctx.strokeRect(mouse_x, mouse_y, mouse_x2 - mouse_x, mouse_y2 - mouse_y);
    }

    // desenha o tipo atual
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(current_type, 10, 20);
}

function update() {
    draw();
    requestAnimationFrame(update);
}

function download() {
    let a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(objects)], {type: "text/plain"}));
    a.download = "level.json";
    a.click();
}

const button = document.getElementById('save');
button.addEventListener('click', download, false);

// eventos para mouse 

canvas.addEventListener('mousedown', (e) => {

    mouse_down = true;
    mouse_x = e.offsetX;
    mouse_y = e.offsetY;
});

canvas.addEventListener('mouseup', (e) => {

    if (!current_type) {
        return;
    }

    mouse_down = false;
    mouse_x2 = e.offsetX;
    mouse_y2 = e.offsetY;

    // cria um objeto
    let obj = Object.assign({}, object_placeholder);
    obj.x = mouse_x;
    obj.y = mouse_y;
    obj.w = mouse_x2 - mouse_x;
    obj.h = mouse_y2 - mouse_y;
    obj.type = current_type;

    if (obj.w == 0 || obj.h == 0) {
        console.log("objeto invalido");
        return;
    }

    if (obj.w < 0 || obj.h < 0) {
        console.log("objeto negativo");
        return;
    }

    // caso ja tenha um objeto com o tipo player, remove o antigo e adiciona o novo
    if (obj.type == "player") {
        objects = objects.filter((obj) => {
            return obj.type != "player";
        });
    }

    // cores: solid = red, pushable = blue, finish = yellow, player = green
    if (obj.type == "solid") {
        obj.color = "red";
    } else if (obj.type == "pushable") {
        obj.color = "blue";
    } else if (obj.type == "finish") {
        obj.color = "yellow";
    } else if (obj.type == "player") {
        obj.color = "black";
    }

    objects.push(obj);
    console.log(objects);
});

const get_closest_object = (objs, x, y) => {
    for (let i = 0; i < objs.length; i++) {
        if (x > objs[i].x && x < objs[i].x + objs[i].w && y > objs[i].y && y < objs[i].y + objs[i].h) {
            return i;
        }
    }

    return -1;
};

canvas.addEventListener('mousemove', (e) => {

    mouse_x2 = e.offsetX;
    mouse_y2 = e.offsetY;

    if (last_key == "Control") {

        console.log(mouse_down, current_object_selected > 0);
        
        if (current_object_selected == 0) {
            current_object_selected = get_closest_object(objects, mouse_x, mouse_y);
        }

        if (current_object_selected == -1) {
            return;
        }

        if (mouse_down && current_object_selected != -1) {
            objects[current_object_selected].x = mouse_x2 - objects[current_object_selected].w / 2;
            objects[current_object_selected].y = mouse_y2 - objects[current_object_selected].h / 2;
        }
    }
});

// eventos para teclado
let current_object_selected = 0, last_key = 0;

document.addEventListener('keydown', (e) => {

    current_object_selected = 0;

    switch (e.key) {
        case "1":
            current_type = "solid";
            last_key = "1";
            break;
        case "2":
            current_type = "pushable";
            last_key = "2";
            break;
        case "3":
            current_type = "finish";
            last_key = "3";
            break;
        case "4":
            current_type = "player";
            last_key = "4";
            break;
        case "Backspace":
            last_key = "Backspace";
            current_type = 0;
            break;
        case "Control":
            last_key = "Control";
            current_type = 0;
            break;
    }

    if (last_key == "Backspace") {
        for (let i = 0; i < objects.length; i++) {
            if (mouse_x > objects[i].x && mouse_x < objects[i].x + objects[i].w && mouse_y > objects[i].y && mouse_y < objects[i].y + objects[i].h) {
                objects.splice(i, 1);
                break;
            }
        }   
    }
});

// debug info
console.log("level.js loaded");
console.log("objects: " + objects.length);

update();