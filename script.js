const canvas = document.getElementById("canvas");

/** @type {CanvasRenderingContext2D} */
const context = canvas.getContext("2d");

let last_time = performance.now(), delta_time = 0, key = [], objects = [], did_detected_all_collisions = false, levels = [], current_level = 0, filtered_levels = [];
let loaded = false;
const max_levels = 2;
let all_sprite_frames = [], all_textures = [];
let seconds = 0;
let drawned_tip = false, tip_opacity = 1;
let started_walking = false;
let reseting = false, delayed_reset = false;
let started_playing = false;
let current_song_i = current_level + 1;
let current_song = new Audio(`./songs/${current_song_i}.mp3`);
let finished_playing_video = false, finished_playing_video_2 = true;
let objects_backup = [];
let already_played_the_fucking_video = false;

if (!localStorage.getItem("skipped")) {
    localStorage.setItem("skipped", "false");
}

const level_1_tips = [
    "Movimentação: A e D e espaço para pular",
    "Alguns objetos podem ser empurrados!!!",
    "aperte R para resetar o level",
];

const canvas_extra = {
    width: 0,
    height: 0
}

const lose_canvas_popup = {
    text: "Voce Perdeu",
    opacicity: 0,
    triggered: false,
    can_show: false
};

const win_canvas_popup = {
    text: "Level concluido",
    opacicity: 0,
    triggered: false,
    can_show: false
};

const object_placeholder = { 
    x: 0,
    y: 0,
    w: 20,
    h: 5,
    color: "red",
    types: ["solid", "pushable", "finish", "player"],
    type: "solid",
    can_move: [true, true, true, true] // array de booleanos left, right, up, down
};

const world = {
    x: 0,
    y: 0,
    w: canvas.width,
    h: canvas.height
};

const sprite_info = {
    x: 0,
    y: 0,
    n: 1,
    floor_n: 1,
    max: 6,
    speed: 9,
    w: 49,
    h: 61,
    reversed: false,
    jump: false,
    jump_height: 0,
    jump_max: 76,
    jump_speed: 240,
    can_move: [], // array de booleanos left, right, up, down
    doing_360: false,
    doing_360_speed: 500,
    doing_360_max: 360,
    doing_360_n: 1,
    last_collision: "",
    falling: false
};

let need_to_resize = true;

function is_on_mobile() {
    return window.mobileCheck = function() {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    }();
}

const original_pos = [];
let created_og = false;

function resize_canvas() {

    if (!is_on_mobile() || !need_to_resize) {
        return;
    }

    console.log("resizing");

    const width = window.innerWidth;
    const height = window.innerHeight;

    let diff = [800 - width, 600 - height];

    if (diff[0] < 0) {
        diff[0] = +diff[0];
    }

    if (diff[1] < 0) {
        diff[1] = +diff[1];
    }

    canvas_extra.width = 800 - diff[0];
    canvas_extra.height = 600 - diff[1];

    if (canvas_extra.width > 800) {
        canvas_extra.width = 800;
    }

    if (canvas_extra.height > 600) {
        canvas_extra.height = 600;
    }

    canvas.width = canvas_extra.width;
    canvas.height = canvas_extra.height - 100;

    // container do canvas
    document.querySelector(".canvasShit").style.alignItems = "start";

    if (!created_og) {

        sprite_info.og_x = sprite_info.x;
        sprite_info.og_y = sprite_info.y;

        sprite_info.og_w = sprite_info.w;
        sprite_info.og_h = sprite_info.h;

        created_og = true;
    }

    const scaleX = canvas.width / 800; 
    const scaleY = canvas.height / 600; 

    sprite_info.x = sprite_info.og_x * scaleX;
    sprite_info.y = sprite_info.og_y * scaleY;

    sprite_info.w = sprite_info.og_w * scaleX;
    sprite_info.h = sprite_info.og_h * scaleY;

    world.w = canvas.width;
    world.h = canvas.height;

    if (!objects) {
        return;
    }

    for (let i = 0; i < objects.length; i++) {

        const object = objects[i];
        
        if (!original_pos[i]) {
            original_pos[i] = {
                x: object.x,
                y: object.y,
                w: object.w,
                h: object.h
            };
        }
        
        if (!original_pos[i]) {
            continue;
        }

        object.x = original_pos[i].x * scaleX;
        object.y = original_pos[i].y * scaleY;

        object.w = original_pos[i].w * scaleX;
        object.h = original_pos[i].h * scaleY;    
    }

    need_to_resize = false;
}

window.onresize = () => { need_to_resize = true };

const start = async () => {

    for (let i = 1; i <= 6; i++) {
        const img = new Image();
        img.src = `./frames/${i}.png`;
        all_sprite_frames.push(img);
    }

    for (let i = 1; i <= 7; i++) {
        const img = new Image();
        const extension = i == 4 ? "png" : "jpg";
        img.src = `./textures/${i}.${extension}`;
        all_textures.push(img);
    }

    levels.push([{"x":227,"y":540,"w":166,"h":32,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":431,"y":492,"w":212,"h":27,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":674,"y":451,"w":122,"h":25,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":744,"y":387,"w":45,"h":65,"color":"yellow","types":["solid","pushable","finish","player"],"type":"finish","can_move":[true,true,true,true]},{"x":39,"y":535,"w":32,"h":57,"color":"black","types":["solid","pushable","finish","player"],"type":"player","can_move":[true,true,true,true]},{"x":139,"y":569,"w":46,"h":27,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]}]);
    levels.push([{"x":47,"y":553,"w":218,"h":28,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":326,"y":544,"w":233,"h":24,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":596,"y":508,"w":169,"h":28,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":454,"y":420,"w":132,"h":27,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":699,"y":454,"w":68,"h":25,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":637,"y":406,"w":30,"h":32,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":334,"y":449,"w":77,"h":16,"color":"blue","types":["solid","pushable","finish","player"],"type":"pushable","can_move":[true,true,true,true]},{"x":75,"y":286,"w":38,"h":75,"color":"yellow","types":["solid","pushable","finish","player"],"type":"finish","can_move":[true,true,true,true]},{"x":62,"y":493,"w":23,"h":49,"color":"black","types":["solid","pushable","finish","player"],"type":"player","can_move":[true,true,true,true]},{"x":74,"y":361,"w":150,"h":38,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]}])
    levels.push([{"x":65,"y":562,"w":161,"h":22,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":269,"y":532,"w":221,"h":21,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":531,"y":492,"w":201,"h":21,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":423,"y":410,"w":110,"h":23,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":536,"y":448,"w":49,"h":43,"color":"blue","types":["solid","pushable","finish","player"],"type":"pushable","can_move":[true,true,true,true]},{"x":283,"y":378,"w":114,"h":24,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":158,"y":351,"w":97,"h":25,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":58.5,"y":355.5,"w":85,"h":31,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":4.5,"y":320,"w":41,"h":14,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":75,"y":300,"w":66,"h":10,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":244,"y":269,"w":122,"h":16,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":434.5,"y":200,"w":401,"h":22,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":762,"y":131,"w":30,"h":55,"color":"yellow","types":["solid","pushable","finish","player"],"type":"finish","can_move":[true,true,true,true]},{"x":383.5,"y":222,"w":23,"h":24,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]},{"x":168.5,"y":280,"w":39,"h":12,"color":"red","types":["solid","pushable","finish","player"],"type":"solid","can_move":[true,true,true,true]}]);
    
    const level = levels[current_level];

    levels.map((l) => {
        filtered_levels.push(l.filter((a) => {return a.type != "player"}));
    });

    objects = filtered_levels[current_level];
    objects_backup = [...filtered_levels];

    if (level.length == 0) {
        console.log("Level vazio");
    }
    else {
        objects.filter((a) => {a.type != "player"});
        console.log("Objects: " + objects);
    }
    
}

start().then(() => {
    loaded = true;
    console.log("Loaded!");
    resize_canvas();
});

// add event listeners
document.addEventListener('keydown', (evento) => {
    const tecla = evento.key.toLowerCase();

    if (tecla == "r") {
        reseting = true;
    }

    started_walking = true;

    if (!started_playing && finished_playing_video && finished_playing_video_2) {
        current_song.play();
        current_song.volume = 0.1;
        started_playing = true;
    }

    // Adiciona a tecla se não estiver no objeto
    if (!key[tecla]) {
        key[tecla] = true;
    }
});

const get_object = (x, y) => {
    // pega o objeto mais proximo do eixo x e y.
    for (let i = 0; i < objects.length; i++) {
        if (x > objects[i].x && x < objects[i].x + objects[i].w && y > objects[i].y && y < objects[i].y + objects[i].h) {
            return objects[i];
        }
    }

    return null;
}

// event listener para o get_object
canvas.addEventListener('click', (evento) => {

    const rect = canvas.getBoundingClientRect();
    const x = evento.clientX - rect.left;
    const y = evento.clientY - rect.top;

    const obj = get_object(x, y);

    if (obj) {
        console.log(obj);
    }
});

document.addEventListener('keyup', (evento) => {
    const tecla = evento.key.toLowerCase();

    // Remove a tecla se estiver no objeto
    if (key[tecla]) {
        key[tecla] = false;
    }
});

// caso o player aperte a tecla g um console.log é executado com a posição do player e do objeto formatado
document.addEventListener('keydown', (evento) => {

    if (objects) {
        return;
    }

    const tecla = evento.key.toLowerCase();

    if (tecla == "g") {
        console.log(`x: ${sprite_info.x} y: ${sprite_info.y + sprite_info.h - 1.4}`);
        console.log("Objects: ");
        for (let i = 0; i < objects.length; i++) {
            console.log(`x: ${objects[i].x} y: ${objects[i].y - objects[i].h}`);
        }       
    }
});

let dou_a_bunda_d = false; // direita
let dou_a_bunda_e = false; // esquerda

document.getElementById("esquerda").addEventListener("mousedown", () => {
    dou_a_bunda_e = true;
    if (!started_playing && finished_playing_video && finished_playing_video_2) {
        current_song.play();
        current_song.volume = 0.1;
        started_playing = true;
        update_timer();
    }
});

document.getElementById("esquerda").addEventListener("mouseup", () => {
    dou_a_bunda_e = false;
    console.log("soltou esquerda");
});

document.getElementById("direita").addEventListener("mousedown", () => {
    dou_a_bunda_d = true;
    if (!started_playing && finished_playing_video && finished_playing_video_2) {
        current_song.play();
        current_song.volume = 0.1;
        started_playing = true;
        update_timer();
    }
});

document.getElementById("direita").addEventListener("mouseup", () => {
    dou_a_bunda_d = false;
    console.log("soltou direita");
});

document.getElementById("pular").addEventListener("click", () => {
    sprite_info.jump = true;
    sprite_info.jump_height = 0;
});

document.getElementById("wow").addEventListener("click", () => {
    sprite_info.doing_360 = true;
})

function collision(object1, object2) {

    return !(
         object1.x > object2.x + object2.w  ||
         object1.x + object1.w < object2.x  ||
         object1.y > object2.y + object2.h  ||
         object1.y + object1.h < object2.y 
     )
}

seconds = 30;
const update_timer = () => {

    if (!started_walking || !objects || !finished_playing_video) {
        return;
    }

    seconds -= delta_time;

    // renderiza no canvas o tempo restante
    context.fillStyle = "white";
    context.font = "42px Arial";
    context.fillText(Math.floor(seconds), canvas.width - 58, 42);
};

const update_popup = () => {
    
    if (!lose_canvas_popup.triggered) {
        return;
    }

    if (lose_canvas_popup.opacicity != 1) {
        lose_canvas_popup.opacicity += delta_time * 0.4;
    }

    context.fillStyle = "rgba(255, 255, 255," + lose_canvas_popup.opacicity + ")";
    context.font = "30px Arial";
    context.fillText(lose_canvas_popup.text, (canvas.width / 2) - 80, canvas.height / 2);
};

const update_popup_2 = () => {
        
    if (!win_canvas_popup.triggered) {
        return;
    }

    if (win_canvas_popup.opacicity != 1) {
        win_canvas_popup.opacicity += delta_time * 0.5;
    }

    context.fillStyle = "rgba(255, 255, 255," + win_canvas_popup.opacicity + ")";
    context.font = "30px Arial";
    context.fillText(win_canvas_popup.text, (canvas.width / 2) - 100, canvas.height / 2);
}

let last_enemy_pos = [0, 0, 0, 0];  

// detecta a colisao entre dois objetos, obj1 e obj2.
const detect_collision = (player, enemy) => {
    if(collision(player, enemy)){
        // Most of this stuff would probably be good to keep stored inside the player
        // along side their x and y position. That way it doesn't have to be recalculated
        // every collision check.

        last_enemy_pos = [enemy.x, enemy.y, enemy.w, enemy.h];
       
        var playerHalfW = player.w/2
        var playerHalfH = player.h/2
        var enemyHalfW = enemy.w/2
        var enemyHalfH = enemy.h/2
        var playerCenterX = player.x + player.w/2
        var playerCenterY = player.y + player.h/2
        var enemyCenterX = enemy.x + enemy.w/2
        var enemyCenterY = enemy.y + enemy.h/2
    
        // Calculate the distance between centers
        var diffX = playerCenterX - enemyCenterX
        var diffY = playerCenterY - enemyCenterY
    
        // Calculate the minimum distance to separate along X and Y
        var minXDist = playerHalfW + enemyHalfW
        var minYDist = playerHalfH + enemyHalfH
    
        // Calculate the depth of collision for both the X and Y axis
        var depthX = diffX > 0 ? minXDist - diffX : -minXDist - diffX
        var depthY = diffY > 0 ? minYDist - diffY : -minYDist - diffY
    
        // Now that you have the depth, you can pick the smaller depth and move
        // along that axis.
        if(depthX != 0 && depthY != 0){
          if(Math.abs(depthX) < Math.abs(depthY)){
            // Collision along the X axis. React accordingly
            if(depthX > 0){
                return "esquerda";
            }
            else{
                return "direita";
            }
          }
          else{
            // Collision along the Y axis.
            if(depthY > 0){
               return "cima";
            }
            else{
               return "baixo";
            }
          }
        }
      }
};


// stick player to the floor by default
sprite_info.y = world.h - sprite_info.h + 1.4;

const do_jump = () => {

    if (!sprite_info.jump) {
        return;
    }

    if (!sprite_info.falling) {
        sprite_info.jump_height += sprite_info.jump_speed * delta_time;
        sprite_info.y -= sprite_info.jump_speed * delta_time;
    } else {
        sprite_info.y += sprite_info.jump_speed * delta_time;
    }

    function reset_jump() {
        sprite_info.jump = false;
        sprite_info.jump_speed = 300;
        sprite_info.jump_height = 0;
        sprite_info.falling = false;
    }

    const ground = world.h - sprite_info.h + 1.4;

    // caso o player bater a cabeça no objeto, para o pulo
    if (!sprite_info.can_move[2] && !sprite_info.falling) {
        sprite_info.falling = true;
    }

    // se o player chegar no limite do pulo, inicia a queda
    if (sprite_info.jump_height >= sprite_info.jump_max) {
        sprite_info.falling = true;
    }

    // se o player colidir com a parte de baixo do objeto, para o pulo
    if (!sprite_info.can_move[3] && sprite_info.falling) {
        reset_jump();
    }

    // se o player chegar no chão, para o pulo
    if (sprite_info.y >= ground) {
        reset_jump();
    }
}

const merge_objects = (obj1, obj2) => {
    // TODO
};

const do_360 = () => {
    
    if (!sprite_info.doing_360) {
        return;
    }
    
    if (sprite_info.reversed) {
        sprite_info.doing_360_n -= sprite_info.doing_360_speed * delta_time;
    }
    else {
        sprite_info.doing_360_n += sprite_info.doing_360_speed * delta_time;
    }

    if (sprite_info.doing_360_n >= sprite_info.doing_360_max || sprite_info.doing_360_n <= -sprite_info.doing_360_max) {
        sprite_info.doing_360_n = 1;
        sprite_info.doing_360 = false;
    }
}

// update the position of the movable object position based on the colission between the player and the object
const update_object_position = () => {

    if (!objects) {
        return;
    }

    // verifica colisao entre objetos, se colidir atualiza as posições da variavel can_move do objeto right, left, up, down
    for(let i = 0; i < objects.length; i++) {

        for(let j = 0; j < objects.length; j++) {

            if (i != j) {

                const object_collision = () => {
                    return detect_collision(objects[i], objects[j]);
                }

                const collision = object_collision();

                if (objects[i].type != "pushable") {
                    break;
                }

                if (collision == "cima") {
                    objects[i].can_move[2] = false;
                    break;
                }
                if (collision == "baixo") {
                    objects[i].can_move[3] = false;
                    console.log("nao pode mover para baixo");
                    break;
                }
                if (collision == "esquerda") {
                    objects[i].can_move[0] = false;
                    break;
                }
                if (collision == "direita") {
                    objects[i].can_move[1] = false;
                    break;
                }
            }
        }
    }

    for (let i = 0; i < objects.length; i++) {

        const push_object = (player, object) => {
            
            if (object.type != "pushable") {
                return;
            }

            const collision = detect_collision(player, object);

            if (collision) {
                // caso o player colida com o objeto e o objeto nao esteja colidindo com outro objeto, empurra o objeto
                if (collision === "cima" && object.can_move[2]) {
                    object.y -= player.jump_speed * delta_time;

                } else if (collision === "esquerda" && object.can_move[0]) {
                    object.x -= player.jump_speed * delta_time;
                } else if (collision === "direita" && object.can_move[1]) {
                    object.x += player.jump_speed * delta_time;
                }
            }
        }

        push_object(sprite_info, objects[i]);
    }
}

const draw_object = (obj, using_texture, id) => { 

    const texture_image = all_textures[id];
    const texture = using_texture ? context.createPattern(texture_image, null) : obj.color;

    context.fillStyle = texture;
    context.fillRect(obj.x, obj.y, obj.w, obj.h);

    if (id != 5) {
        context.strokeRect(obj.x, obj.y, obj.w, obj.h);
    }
}

const spawn_object = (x, y, w, h, color, type) => {
    const obj = { x, y, w, h, color, type, can_move: [true, true, true, true] };
    objects.push(obj);
    return obj;
}

const draw_glow_effect = (img, x, y, w, h) => {
    context.save();
    context.filter = "blur(5px)";
    context.drawImage(img, x, y, w, h);
    context.restore();
};

let last_tip = "", passed_tip = false;

const draw_tip = () => {
    
    function reset_tip() {
        tip_opacity = 1;
        drawned_tip = false;
        passed_tip = false;
        last_tip = level_1_tips[Math.floor(Math.random() * level_1_tips.length)]; 
    };

    if (tip_opacity <= 0) {
        return;
    }

    if (!last_tip) {
        reset_tip();
    }

    if (passed_tip) {
        tip_opacity -= delta_time * 0.5;
    }

    if (sprite_info.x > 150 && !drawned_tip) {
        passed_tip = true;
    }
    
    context.fillStyle = "rgba(255, 255, 255," + tip_opacity + ")";
    context.font = "18px Arial";
    context.fillText(last_tip, canvas.width / 3, canvas.height - 100, canvas.width / 2);
}

document.getElementById("video2").addEventListener("ended", () => {
    finished_playing_video_2 = true;
});

const update_animation = (key) => {

    if (!context) {
        return;
    }

    if (key["q"]) {
        sprite_info.doing_360 = true;
    }

    do_360();

    if ((key["d"] || key["a"]) && !sprite_info.jump) {
        sprite_info.n += delta_time * sprite_info.speed;
    }

    if (key[" "] && !sprite_info.jump && sprite_info.can_move[2]) {
        sprite_info.jump = true;
        sprite_info.jump_height = 0;
    }

    do_jump();

    update_object_position();

    // caso não esteja andando, volta para o frame 1
    if (!key["d"] && !key["a"]) {
        sprite_info.n = 1;
    }

    sprite_info.floor_n = Math.floor(sprite_info.n);

    if (sprite_info.n > sprite_info.max) {
        sprite_info.n = 1;
        sprite_info.floor_n = 1;
    }

    // se o player nao estiver andando, volta para o frame 3
    if (!key["d"] && !key["a"]) {
        sprite_info.floor_n = 3; // idle frame
    }

    if (key["d"] && !sprite_info.jump) {
        sprite_info.reversed = false;
    }

    if (key["a"] && !sprite_info.jump) {
        sprite_info.reversed = true;
    }

    const current_img = all_sprite_frames[sprite_info.floor_n - 1];

    if (sprite_info.doing_360) {

        const current_img = all_sprite_frames[sprite_info.floor_n - 1];

        // make the 360 animation with canvas
        context.save();
        context.translate(sprite_info.x + sprite_info.w / 2, sprite_info.y + sprite_info.h / 2);
        context.rotate(sprite_info.doing_360_n * Math.PI / 180);
        draw_glow_effect(current_img, -sprite_info.w / 2, -sprite_info.h / 2, sprite_info.w, sprite_info.h);
        context.drawImage(current_img, -sprite_info.w / 2, -sprite_info.h / 2, sprite_info.w, sprite_info.h);
        context.restore(); 
    }

    const ground = world.h - sprite_info.h + 1.4;

    // caso o player nao esteja no chao, nao esteja pulando e nao esteja coliidindo com a parte de baixo de cima do objeto, inicia a queda

    if (sprite_info.y < ground && !sprite_info.jump && sprite_info.can_move[3]) {
        sprite_info.y += sprite_info.jump_speed * delta_time;
    }

    if (sprite_info.reversed && !sprite_info.doing_360) {
        // caso estiver andando para a esquerda, inverte a png mas continua desenhando no mesmo lugar
        context.save();
        context.scale(-1, 1);
        draw_glow_effect(current_img, -sprite_info.x  - sprite_info.w, sprite_info.y, sprite_info.w, sprite_info.h);
        context.drawImage(current_img, -sprite_info.x  - sprite_info.w, sprite_info.y, sprite_info.w, sprite_info.h);
        context.restore();        
    }
    else {
        if (!sprite_info.doing_360) {
            draw_glow_effect(current_img, sprite_info.x, sprite_info.y, sprite_info.w, sprite_info.h);
            context.drawImage(current_img, sprite_info.x, sprite_info.y, sprite_info.w, sprite_info.h);
        }
    }
}

let alerted = false;

const game_loop = (current_time) => {

    // delta_time 
    delta_time = (current_time - last_time) / 1000;

    if (!context) {
        return;
    }

    // clear
    context.clearRect(0, 0, canvas.width, canvas.height);

    // que se foda, desempenho vai pro krl mas to com preguica de colocar pra dar resize so quando necessario
    resize_canvas();

    // draw floor + sky
    if (objects) {

        const color = "green";
        context.fillStyle = color;

        // render floor with grass texture
        const texture_image = all_textures[2];
        const texture = context.createPattern(texture_image, "repeat");
        context.fillStyle = texture;
        context.fillRect(world.x, world.h - 10, world.w, 25);

        // draw sky (blue color for now)
        context.fillStyle = context.createPattern(all_textures[4], "no-repeat");;
        context.fillRect(world.x, world.y, world.w, world.h - 10); 

        // draw sun in the left up corner
        const texture_image_1 = all_textures[3];
        const texture_1 = context.createPattern(texture_image_1, "no-repeat");
        context.fillStyle = texture_1;
        context.fillRect(10, 15, 0.31 * canvas.width, 0.41 * canvas.height);    
    }

    if (objects) {

        objects.forEach(object => {

            if (object.type == "player") {
                return;
            }
    
            if (object.type == "pushable") {
                 draw_object(object, true, 0);
            } 
            else if (object.type == "solid") {
                draw_object(object, true, 1);
            }
            else {
                draw_object(object, true, 6);
            }
        });     
    }
    else {
        
        const video = document.getElementById("video2");
        video.play();

        if (!finished_playing_video_2) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        else {

            video.pause();

            context.drawImage(all_textures[5], 0, 0, canvas.width, canvas.height);

            context.fillStyle = "black";
            context.font = "30px Arial";
            context.fillText("Parabens ELTER!!!!!", (canvas.width / 2) - 30, canvas.height / 2);
            context.fillText("Voce terminou o jogo", (canvas.width / 2) - 40, canvas.height / 2 + 30);
        }      
    }

    if (seconds <= 0 && !alerted) {
        lose_canvas_popup.triggered = true;
        delayed_reset = true;
        setInterval(() => {
            window.location.reload();
        }, 1000 * 3);
        alerted = true;
    }

    if (objects) {

        for (let i = 0; i < objects.length; i++) {

            const collision = detect_collision(sprite_info, objects[i]);

            did_detected_all_collisions = false;

            sprite_info.can_move[0] = true;
            sprite_info.can_move[1] = true;
            sprite_info.can_move[2] = true;
            sprite_info.can_move[3] = true;

            // caso o objeto seja finnish, para o loop e da load no proximo level e posiciona o player no inicio do level
            if ((objects[i].type == "finish" && collision && !delayed_reset) || (reseting && !delayed_reset)) {

                if (current_level >= levels.length - 1 && !alerted && !reseting) {
                    alert("Voce Finalizou o jogo!!!!!");
                    alerted = true;
                    break;
                }

                if (!alerted && !reseting) {
                    if (!win_canvas_popup.triggered) {
                        const interval = setInterval(() => {
                            win_canvas_popup.triggered = false;
                            win_canvas_popup.can_show = false;
                            win_canvas_popup.opacicity = 0;
                            alerted = false;
                            console.log("resetando");
                            clearInterval(interval);
                        }, 1000 * 2);
                    }
                    win_canvas_popup.triggered = true;
                    alerted = true;
                    break;
                }

                sprite_info.x = 0;
                sprite_info.y = canvas.height - sprite_info.h + 2;

                current_song.currentTime = 0;
                current_song.pause();

                if (current_level < levels.length - 1) {
                     current_song = new Audio(`./songs/${reseting ? current_level + 1 : current_level + 2}.mp3`);
                }
                else {
                    finished_playing_video_2 = false;
                }

                started_playing = false;

                lose_canvas_popup.triggered = false;
                lose_canvas_popup.can_show = false;
                lose_canvas_popup.opacicity = 0;
                
                if (!reseting) {

                    current_song.currentTime = 0;
                    current_level++;
                    objects = objects_backup[current_level];

                    sprite_info.x = 0;
                    sprite_info.y = canvas.height - sprite_info.h + 2;

                    if (objects) {

                        for (let i = 0; i < objects.length; i++) {

                            const object = objects[i];
    
                            original_pos[i] = {
                                x: object.x,
                                y: object.y,
                                w: object.w,
                                h: object.h
                            };
    
                        }
                    }
                              
                    need_to_resize = true;
                }
                else {
                    console.log("Resetando level");
                    reseting = false;
                    objects = objects_backup[current_level];
                }                

                seconds = 30;
                key = [];
                started_walking = false;
                break;
            }

            if (collision == "cima") {
                sprite_info.can_move[2] = false;
            }

            if (collision == "baixo") {
                sprite_info.can_move[3] = false;
            }

            if (collision == "esquerda") {
                sprite_info.can_move[0] = false;
            }

            if (collision == "direita") {
                sprite_info.can_move[1] = false;
            }

            if (i == objects.length - 1) {
                did_detected_all_collisions = true;
            }

            if (collision) {
                sprite_info.last_collision = collision;
                did_detected_all_collisions = true;
                break;
            }
        }
    }

    // draw
    update_animation(key);
    update_timer();
    draw_tip();
    update_popup();
    update_popup_2();

    // update position
    if ((key["d"] && sprite_info.can_move[1]) || (dou_a_bunda_e && sprite_info.can_move[1])) {
        sprite_info.x += 100 * delta_time * 2;
    }

    if ((key["a"] && sprite_info.can_move[0]) || (dou_a_bunda_d && sprite_info.can_move[0])) {
        sprite_info.x -= 100 * delta_time * 2;
    }

    // update last time
    last_time = current_time;

    requestAnimationFrame(game_loop);
};

let iter = 0;
let initialized_video = false;
const video = document.getElementById("video");

const button = document.getElementById("button");
button.addEventListener('click', () => {

    document.querySelector(".canvasShit").style.display = "flex";
    button.style.display = "none";

    const interval = setInterval(() => {

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "white";
        context.font = "30px Arial";
        context.fillText("Loading...", (canvas.width / 2) - 30, canvas.height / 2);
    
        if (loaded && iter >= 1) {

            clearInterval(interval);

            video.play();

            const video_interval = setInterval(() => {

                if (localStorage.getItem("skipped") == "true") {
                    video.pause();
                    finished_playing_video = true;
                }

                if (finished_playing_video) {
                    console.log("Finished playing video");
                    localStorage.setItem("skipped", "true");
                    need_to_resize = true;
                    document.querySelector(".control-container").style.display = "flex";
                    sprite_info.x = 0;
                    sprite_info.y = canvas.height - sprite_info.h + 2;
                    clearInterval(video_interval);
                    requestAnimationFrame(game_loop);
                }
                else {

                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    console.log("Playing video");
            
                    video.addEventListener('ended', () => {
                        finished_playing_video = true;
                    });
                }
            }, 1000 / 30);
        }
         iter++;  
    }, 100);
});