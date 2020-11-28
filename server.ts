import * as Net from 'net';
import * as Pull from 'pull-stream';
import { MessageDecoder, MessageEncoder } from './codec';
import { Delay } from './delay';
import { PushableDuplex } from '@jacobbubu/pull-pushable-duplex'
import Checker from '@jacobbubu/pull-stream-protocol-checker'

const ToPull = require('stream-to-pull-stream');

let port: number = 8080
let server: Net.Server = new Net.Server()
server.listen(port, function () {
    console.log(
        'Server listening for connection requests on socket localhost: ' + port
    )
});
let clientCount: number = 0

server.on('connection', function (socket: Net.Socket) {
    clientCount++
    console.log(`Client #${clientCount} connected.`)

    let peer: Pull.Duplex<Buffer, Buffer> = ToPull.duplex(socket, function () {
        console.log(`Client #${clientCount} write finished.`)
    })
    let messageCount: number = 0

    let duplex = new PushableDuplex<string, string, any>({
        allowHalfOpen: false,
        onReceived: (message: string) => {
            messageCount++
            message = message.trim().toUpperCase()
            if (message == "KILL") {
                process.exit(0)
                return
            }
            duplex.push(
                `msg-${messageCount}( ${message} )`
            )
        },
        onFinished: (err: Pull.Abort) => {
            console.log(`Client #${clientCount} finished.`)
        },
    })

    Pull(
        duplex,
        getProbe(),
        MessageEncoder,
        getProbe(),
        peer,
        getProbe(),
        MessageDecoder,
        getProbe(),
        Delay(500),
        getProbe(),
        duplex
    )
})

function getProbe() {
    return Checker({
        forbidExtraRequests: true,
        enforceStreamTermination: true,
        notifyEagerly: true,
    })
}
