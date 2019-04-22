import Player from './Player.js';

export default class Session {

    id: number;
    p1: Player | null;
    p2: Player | null;
    current: number;

    constructor(){
        this.id = Date.now() + Math.floor(Math.random() * 1000 );
        this.p1 = null;
        this.p2 = null;
        this.current = 1;
    }

    nextTurn (){
        this.current = this.current % 2 + 1;
    }
}