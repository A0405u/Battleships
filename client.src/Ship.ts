type Direction = "Vertical" | "Horisontal";

type Condition = "Broken" | "Regular";

let x : number;
let y : number;

export default class Ship {

    position: string = "";
    decks: number;
    direction: Direction;
    player: 1 | 2;
    element: HTMLElement;
    origin: HTMLElement | null;
    condition: Condition = "Regular";

    constructor(el: HTMLElement, plr: 1 | 2, org: HTMLElement | null) {

        this.element = el;
        this.player = plr;
        this.decks = el.childElementCount;
        this.origin = org;

        if (el.style.flexDirection === "row")
            this.direction = "Horisontal";
        else
            this.direction = "Vertical";

    }

    grab(event: MouseEvent){

        document.body.appendChild( this.element.cloneNode(true) );
        
        if (this.origin == null){
        
            this.element.classList.add( "hidden" );
    
            this.origin = this.element;
    
        }
        else{

            this.element.remove();

            this.position = "";
        }

        this.element = document.querySelector("body>.ship") as HTMLElement;

        this.element.classList.remove("placed");

        this.element.classList.add( "grabbed" );

        x = (this.origin.getBoundingClientRect().right - this.origin.getBoundingClientRect().left) / 2; 
        y = (this.origin.getBoundingClientRect().bottom - this.origin.getBoundingClientRect().top) / this.decks / 2;

        this.move(event);
    }

    move(event: MouseEvent){

        this.element.style.left = ( event.clientX - x ) + "px";
        this.element.style.top = ( event.clientY - y ) + "px";
    }

    placeable(){
        if (!this.element.classList.contains("placeable"))
            this.element.classList.add("placeable");
    }

    restricted(){
        this.element.classList.remove("placeable");
    }

    flip(){

        if (this.direction === "Vertical"){

            this.direction = "Horisontal";
            this.element.style.flexDirection = "row";
        }
        else{

            this.direction = "Vertical";
            this.element.style.flexDirection = "column";
        }
    }

    return(){

        this.element.remove();

        if(!this.origin)
            return;

        this.origin.classList.remove('hidden');

        this.element = this.origin;

        this.origin = null;

        this.direction = "Vertical";
    }

    place(value: string, player: number) : void {

        this.position = value;
        
        this.element.remove();

        this.element.classList.add("placed");

        if(this.element.classList.contains("grabbed"))
            this.element.classList.remove("grabbed");

        let field = document.getElementById("p" + player + "field");

        if (!field)
            return;

        field.appendChild(this.element);

        this.element.style.left = (value.charCodeAt(0) - 65) * 10 + "%";

        this.element.style.top = (Number(value.slice(1)) - 1) * 10 + "%";

    } 

    break ()
    {
        this.condition = "Broken";
        this.element.classList.add("broken");
    }

}