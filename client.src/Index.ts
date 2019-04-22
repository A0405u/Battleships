import Field from "./Field.js";
import Ship from "./Ship.js";

let p1data: Field;
let p2data: Field;

let ships: Array<Ship> = new Array(20);

const socket = new WebSocket( 'ws://localhost:8080');

let submitted: boolean = false;

let ready: boolean = false;

let id: number = -1;

let session: number;

let current: boolean;

const p1field = document.getElementById("p1field") as HTMLFormElement;
const p2field = document.getElementById("p2field") as HTMLFormElement;

let p1ships = 10;
let p2ships = 10;

const rwindow = document.querySelector( ".rightwindow" ) as HTMLElement | null;

document.addEventListener("DOMContentLoaded", () => { 
    main();
  });

function main() {

    const form = document.getElementById("login") as HTMLFormElement | null;

    if (!form || !socket)
        return;

    form.addEventListener( "submit", ( event ) => {

        event.preventDefault();

        const input = form.elements.namedItem("name") as HTMLInputElement;

        if(input.value){

            const window = document.getElementById("start");

            if (window)
                window.classList.add("removed");
            
            const loading = document.getElementById("loading");

            if (loading)
                loading.classList.remove("removed");

            const name = document.getElementById("p1name") as HTMLElement;

            if(name)
                name.textContent = input.value;

            socket.send( input.value );
        }
        else
            return;
    });

    socket.onmessage = ( event ) => { //получаем id сессии

        session = event.data;

        console.log(session);

        socket.onmessage = ( event ) => {

            current = (event.data === "true");

            socket.onmessage = ( event ) => { //получаем имя противника и переходим к игре

                const name = document.getElementById("p2name") as HTMLElement;
                
                if(name)
                    name.textContent = event.data;

                const loading = document.getElementById("loading");

                if (loading)
                    loading.classList.add("removed");

                const main = document.querySelector("main");

                if (main)
                    main.classList.remove("removed");

                socket.onmessage = ( event ) =>
                {
                    if ( event.data == "ready" )
                        ready = true;

                    if (submitted)
                        turn();
                }
            }
        }
    };

//    const lwindow = document.querySelector( ".leftwindow" ) as HTMLElement | null;

    if (!p1field || !p2field)
        return;

    p1data = new Field(p1field);

    p2data = new Field(p2field);

    init(ships);

    let button = document.getElementById("submit") as HTMLButtonElement | null;

    if (button)
        button.addEventListener( "click", () => {

            if (button && !button.disabled){

                button.setAttribute("disabled", "disabled");
                button.classList.add("submitted");
                button.textContent = "Waiting for another player...";

                submitted = true;

                socket.send( p1data.export() );

                if (ready)
                    turn();
            }
        });

    p2field.addEventListener('submit', ( event ) => {
        event.preventDefault();

        if (!submitted)
            return;
    });

    p1field.addEventListener('click', ( event ) => {

        if(submitted)
            return;

        let target = event.target as HTMLButtonElement | null;

        if (!target)
            return;

        if(id < 0){
            if(target.matches(".ship")){

                id = Number(target.id);
                p1data.ship(ships[id].position, ships[id], "Grab")
                ships[id].grab(event);
                placed();
            }
            return;
        }

        if (!target.dataset.value)
            return;

        let position = target.dataset.value;

        if(p1data.ship(position, ships[id], "Place")){

            ships[id].place(position, 1);
            placed();
            id = -1;
        }
    });

    p2field.addEventListener( 'click', ( event ) => {

        let target = event.target as HTMLButtonElement | null;

        if ( !target || !target.dataset.value)
            return;
        
        if (target.matches(".miss"))
            return;

        if (target.matches(".hit"))
            return;

        if (current && ready && submitted)
            shot( target.dataset.value );
    });

    if (!rwindow)
        return;

    rwindow.addEventListener( "click", ( event ) => {

        event.preventDefault();

        if (id >= 0){ // возвращаем текущий корабль на место, если таковой имеется

            ships[id].return();
            id = -1;
            return;
        }

        let target = event.target as HTMLElement | null;

        if (!target)
            return;

        if(target.matches(".hidden")) // если нажали по уже взятому кораблю
            return;

        if(!target.matches(".ship")) // проверка на нажатие по подходящему кораблю
        {
            if (target.matches( ".regular" ) ){ // нажимаем на клетки корабля а не на сам блок
                target = target.closest(".ship") as HTMLElement | null;
                if (!target)
                    return;
            }
            else
                return;
        }

        id = Number(target.id); // запоминаем id текущего корабля

        ships[id].grab(event); // берем его
    });

    document.addEventListener( "mousemove", ( event ) => {

        if (id < 0)
            return;

        ships[id].move(event);

        check(event);
    });

    document.addEventListener( "contextmenu", ( event ) => {

        if (id >= 0){

            event.preventDefault();

            ships[id].flip();

            check(event);
        }

    });
}

function turn(){

    let button = document.getElementById("submit");

    if (button){
        if (current)
            button.textContent = "Your turn!";
        else
        {
            let p2 = document.getElementById("p2name");
            if (p2)
                button.textContent = p2.textContent + "'s turn!";
        }   
    }    

    if(p1ships === 0 || p2ships === 0)
    {
        if (p1ships === 0){
            let p = document.querySelector("#finish>p");
            if (p)
                p.textContent = "YOU LOSE!"
        }
        let window = document.querySelector("main");
        if( window )
            window.classList.add("removed");

        window = document.getElementById("end")
        if(window)
            window.classList.remove("removed");
    }

    socket.onmessage = ( event ) => {

        if (current)
        {
            if(event.data != ""){
                const ship = find(Number(event.data.slice(0, 1)));
                if (ship){
                    if(Number(event.data.slice(1, 2)) === 1)
                        ship.flip();  
                    ship.place(event.data.slice(2), 2);
                    ship.break();
                }
                p2ships--;
            }
        }
        else 
        {
            if(event.data != ""){
                for (let ship of ships)
                    if(ship.position === event.data.slice(2)){
                        ship.break();
                        break;
                    }
                p1ships--;
            }
        }
        socket.send("ready");
        socket.onmessage = ( event ) => {

            if (current){
                p2data.import(event.data);
                p2data.update();
                current = false;
            }
            else{
                p1data.import(event.data)
                p1data.update()
                current = true;
            }
            turn();
        }
    }
}

function shot( value : string ) : void {

    if (current)
        socket.send( value );
}

function init(ships: Array<Ship>){

    for (let i = 0; i < 10; i++){

        let element = document.getElementById(i.toString()) as HTMLElement;
        ships[i] = new Ship(element, 1, null);
    }

    for (let i = 10; i < 20; i++){

        let element = document.getElementById(i.toString()) as HTMLElement;
        ships[i] = new Ship(element, 2, null);
    }
}

function check(event: MouseEvent){
    let target = event.target as HTMLElement;

    if(target){
        if(rwindow && rwindow.contains(target)){
            ships[id].placeable();
            return;
        }
        if(p2field && p2field.contains(target))
            return;
        if(target.matches(".square")){
            if(target.dataset.value){
                if(p1data.check(target.dataset.value, ships[id])){
                    ships[id].placeable();
                    return;
                }
            }
        }
    }
    ships[id].restricted();
}

function find(decks: number): Ship | null{

    for (let i = 10; i < 20; i++){
        if (ships[i].element.childElementCount === decks){
            if (ships[i].element.matches(".removed")){
                ships[i].element.classList.remove("removed");
                return ships[i];
            }
        }
    }
    return null;
}

function placed(){

    let button = document.getElementById("submit");

    if (!button)
        return;

    if(p1field && p1field.childElementCount > 10){

        button.removeAttribute('disabled');
        button.textContent = "SUBMIT";

        return true;
    }
    button.setAttribute("disabled", "disabled");
    button.textContent = "ARRANGE YOUR SHIPS";

    return false;
}