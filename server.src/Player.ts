import Session from './Session.js';
type WebSocket = import('ws');

type Direction = "Vertical" | "Horisontal";

enum Status {

    Free = 0,
    Ship = 1,
    Miss = 2,
    Hit = 3,
}

export default class Player {

    name: string;
    data: Array<Array<Status>>;
    socket: WebSocket;
    session: Session;

    constructor(name: string, socket: WebSocket, session: Session){
        this.name = name;
        this.socket = socket;
        this.session = session;
        this.data = new Array(10);
            for(let i = 0; i < 10; i++)
                this.data[i] = new Array (10);
    }

    import(data: string)
    {
        let array = data.split("");

        for (let i = 0; i < 10; i++)
            for (let j = 0; j < 10; j++)
                this.data[i][j] = Number(array[i*10+j]);
    }

    export(): string
    {
        let string = "";
        for (var i = 0; i < 10; i++) 
            for (var j = 0; j < 10; j++)
                string += this.data[i][j];
        return string;
    }

    x(position: string){
        return position.charCodeAt(0) - 65;
    }
    
    y(position: string){
        return Number(position.slice(1)) - 1;
    }

    strike(data: string): string
    {
        let x = this.x(data);
        let y = this.y(data);

        console.log(x, y);

        if(this.data[y][x] == Status.Free){
            this.data[y][x] = Status.Miss;
            return "";
        }
        if(this.data[y][x] == Status.Ship){
            this.data[y][x] = Status.Hit;
            return this.hit(x, y);
        }
        return "";
    }

    hit(x: number, y: number): string
    {
        let direction: Direction = "Vertical";
        let maxx = x;
        let maxy = y;
        let decks = 0;

        for ( let i = x; i < 9; i++){
            if (this.data[y][i+1] === Status.Miss || this.data[y][i+1] === Status.Free)
                break;
            maxx = i+1;
        }
        for ( let i = y; i < 9; i++){
            if (this.data[i+1][x] === Status.Miss || this.data[i+1][x] === Status.Free)
                break;
            maxy = i+1;
        }

        if (this.data[maxy][maxx-1] === Status.Ship || this.data[maxy][maxx-1] === Status.Hit)
            direction = "Horisontal";

        if (direction === "Horisontal")
        {
            let i = maxx;
            do
            {
                if (this.data[y][i] === Status.Ship)
                    return "";
                if (this.data[y][i] != Status.Hit)
                    break;
                decks++;
                i--;
            }
            while (i>=0);
            x = ++i;
        }
        else
        {
            let i = maxy
            do
            {
                if (this.data[i][x] === Status.Ship)
                    return "";
                if (this.data[i][x] != Status.Hit)
                    break;
                decks++;
                i--;
            }
            while (i>=0);
            y = ++i;
        }

        let posx = x;
        let posy = y;

        let sizex = 3;
        let sizey = 3;

        if(direction === "Horisontal")
            sizex = decks + 2;
        else
            sizey = decks + 2;

        if(x == 0 || x == 9 || maxx == 0 || maxx == 9)
            sizex--;
        if(y == 0 || y == 9 || maxy == 0 || maxy == 9)
            sizey--;

        if(x != 0)
            x--;
        if(y != 0)
            y--;

        for(let i = 0; i < sizey; i++){
            for(let j = 0; j < sizex; j++){
                if(this.data[y][x] === Status.Free)
                    this.data[y][x] = Status.Miss;
                x++;
            }
            x -= sizex;
            y++;
        }
        
        return decks.toString() + (direction === "Horisontal" ? 1 : 0) + String.fromCharCode(posx + 65) + (posy + 1).toString();
    }
}