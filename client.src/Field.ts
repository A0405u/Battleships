import Ship from "./Ship.js";

type Action = "Grab" | "Place";

enum Status {

    Free = 0,
    Ship = 1,
    Miss = 2,
    Hit = 3,
}

export default class Field {
    
    data: Array<Array<Status>>;
    elements: Array<Array<HTMLElement>>;

    constructor(field: HTMLElement){

        this.data = new Array(10);
        this.elements = new Array(10);

        for(let i = 0; i < 10; i++){

            this.data[i] = new Array(10);
            this.elements[i] = new Array(10);
        }

        let squares = field.querySelectorAll(".square");

        for(let i = 0; i < 10; i++){

            for(let j = 0; j < 10; j++){

                this.data[i][j] = Status.Free;
                this.elements[i][j] =  squares[i*10+j] as HTMLElement;
            }
        }
    }

    import(data: string)
    {
        let array = data.split("");

        for (let i = 0; i < 10; i++)
            for (let j = 0; j < 10; j++)
                this.data[i][j] = Number(array[i*10+j]);
    }

    update()
    {
        for (let i = 0; i < 10; i++)
            for (let j = 0; j < 10; j++){
                if(this.data[i][j] == Status.Hit)
                    this.elements[i][j].classList.add("hit");
                if(this.data[i][j] == Status.Miss)
                    this.elements[i][j].classList.add("miss");
            }
    }

    ship(position: string, ship: Ship, action: Action){

        if(action !== "Grab")
            if(!this.check(position, ship))
                return;

        let x = this.x(position);
        let y = this.y(position);

        for (let k = 0; k < ship.decks; k++){

            this.data[y][x] = action === "Place" ? Status.Ship : Status.Free;

            if (ship.direction === "Horisontal")
                x++;
            else
                y++;
        }
        return true;
    }

    check(position: string, ship: Ship){

        let x = this.x(position);
        let y = this.y(position);

        for (let k = 0; k < ship.decks; k++){

            if(this.data[y][x] !== Status.Free)
                return false;

            if(ship.direction === "Horisontal")
                x++;
            else
                y++;
                
            if (x > 9 || y > 9){
                if (++k != ship.decks)
                    return false;
                break;
            }
        }
        
        let posx = this.x(position);
        let posy = this.y(position);

        let sizex = 3;
        let sizey = 3;

        if(ship.direction === "Horisontal"){
            sizex = ship.decks + 2;
            x--;
        }
        else{
            sizey = ship.decks + 2;
            y--;
        }

        if(posx == 0 || posx == 9 || x == 0 || x == 9)
            sizex--;
        if(posy == 0 || posy == 9 || y == 0 || y == 9)
            sizey--;

        if(posx != 0)
            posx--;
        if(posy != 0)
            posy--;

        x = posx;

        for(let i = 0; i < sizey; i++){
            for(let j = 0; j < sizex; j++){
                if(this.data[posy][posx] > 0)
                    return false;
                posx++;
            }
            posx = x;
            posy++;
        }
        
        return true;
    }

    x(position: string){
        return position.charCodeAt(0) - 65;
    }
    
    y(position: string){
        return Number(position.slice(1)) - 1;
    }

    export(){
        let string = "";
        for (var i = 0; i < 10; i++) 
            for (var j = 0; j < 10; j++)
                string += this.data[i][j];
        return string;
    }

    log(){
        let s = "";
        for (let i = 0; i < 10; i++){
            for (let j = 0; j < 10; j++)
                s += this.data[i][j];
            s += "\n";
        }
        console.log(s);
    }

}

export { Field };