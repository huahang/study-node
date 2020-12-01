import * as Net from 'net';
import * as Readline from 'readline';
import * as Pull from 'pull-stream';
import * as ToPull from '@huahang/stream-to-pull-stream';
import { MessageDecoder, MessageEncoder } from './codec';
import { PushableDuplex } from '@jacobbubu/pull-pushable-duplex'
import Checker from '@jacobbubu/pull-stream-protocol-checker'

let port: number = 8080
let client: Net.Socket = new Net.Socket()

client.on('error', (err: Error) => {
    console.log(`Hit an error! ${err}`)
    process.exit(0)
})

client.on('timeout', () => {
    console.log('Socket timeout!')
    process.exit(1)
})

client.connect(port, '127.0.0.1', function () {
    console.log('Connected.')
    let peer: Pull.Duplex<Buffer, Buffer> = ToPull.duplex(client)

    const readline: Readline.Interface = Readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'Client> '
    });
    readline.prompt();
    readline.on('line', (line: string) => {
        line = line.trim().toLowerCase()
        switch (line) {
            case '':
                readline.prompt()
                break;
            case 'close':
            case 'exit':
            case 'quit':
                readline.emit('close')
                break;
            default:
                duplex.push(line)
                break;
        }
    }).on('close', () => {
        console.log('Bye!');
        client.end(function () {
            process.exit(0)
        })
    });

    let duplex = new PushableDuplex<string, string, any>({
        allowHalfOpen: false,
        onReceived: (message: string) => {
            console.log(`Server> ${message}`)
            readline.prompt();
        },
        onFinished: (err: Pull.Abort) => {
            console.log('Finished.')
            client.end(function () {
                process.exit(0)
            })
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
