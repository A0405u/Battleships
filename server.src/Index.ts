import Player from './Player.js';
import Session from './Session.js';
import WebSocket from 'ws';

const server = new WebSocket.Server({
        port: 8080,
    },
    () => {
        const address = server.address();

        console.log(
            'WebSocket in listening on port '
            + (
                typeof address === 'string'
                ? address
                : address.port
            )
        );
    }
);

const sessions: Session[] = []; //хранилище сессий

let session: Session | null;

const players: Player[] = [];

server.on( 'connection', ( ws ) => {

        ws.onmessage = function ( event ) { onLogin( event.target, event.data) }
//        ws.on( 'message', onLogin );
    }
);

function onLogin( socket: WebSocket, data: WebSocket.Data ): void
{
    if ( typeof data !== 'string')
    {
        dataError(socket);
        return;
    }

    if (session && session.p1){

        let player = new Player(data, socket, session);
        players.push(player);
        
        session.p2 = player;
        
        socket.send(session.id);

        socket.send("false");
        
        session.p1.socket.send(session.p2.name);
        session.p2.socket.send(session.p1.name);

        session = null;
    }
    else{

        session = new Session;
        sessions.push(session);
    
        let player = new Player(data, socket, session);
        players.push(player);

        session.p1 = player;
    
        socket.send(session.id);

        socket.send("true");
    }

    socket.onmessage = function( event ) { onSubmit( event.target, event.data  ); }
}

function onSubmit( socket: WebSocket, data: WebSocket.Data ):void
{
    let player = find(socket);

    if( !player ) {
        return;
    }

    if ( typeof data !== 'string')
    {
        dataError(socket);
        return;
    }

    player.import(data);

    if (player.session.p1 === player){
        if(player.session.p2){
            player.session.p2.socket.send( "ready" );
        }
    }
    else{
        if(player.session.p1){
            player.session.p1.socket.send( "ready" );
        }
    }

    socket.onmessage = function( event ) { onShot( event.target, event.data  ); }
}

function Shoot(shooter: Player, victim: Player, data: string ): void
{
    let string = victim.strike(data);

    shooter.socket.send(string);
    victim.socket.send(string);

    string = victim.export();

    shooter.socket.onmessage = function() {
        shooter.socket.send(string); 
        shooter.socket.onmessage = function( event ) { onShot( event.target, event.data  ); }
    }
    victim.socket.onmessage = function() {
        victim.socket.send(string); 
        victim.socket.onmessage = function( event ) { onShot( event.target, event.data  ); }
    }
}

function onShot( socket: WebSocket, data: WebSocket.Data ): void
{
    let player = find(socket);

    if( !player )
        return;

    let session = player.session;

    if( !session )
        return;

    if ( typeof data !== 'string')
    {
        dataError(socket);
        return;
    }

    if (session.current == 1)
    {
        if(session.p1 && session.p2){

            Shoot(session.p1, session.p2, data);
            session.nextTurn();
        }
    }
    else
    {
        if(session.p1 && session.p2){

            Shoot(session.p2, session.p1, data);
            session.nextTurn();
        }
    }
}

function dataError( socket: WebSocket)
{
    socket.send(
        JSON.stringify( {
            message: "Wrong data type",
        })
    );
}

function find(client: WebSocket): Player | null{

    for (var i = 0; i < players.length; i++)
    {
        if (players[i].socket === client)
            return players[i];
    }
    return null;
}