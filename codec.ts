import * as pull from "pull-stream";

function extractMessage(buffer: Buffer): { message: string, buffer: Buffer } {
    const LF: number = "\n".charCodeAt(0)
    let cursor: number = 0
    while (cursor < buffer.length) {
        let c: number = buffer[cursor]
        if (c == LF) {
            let message: string = buffer.slice(0, cursor).toString()
            buffer = (cursor == (buffer.length - 1)) ?
                Buffer.alloc(0) : buffer.slice(cursor + 1, buffer.length)
            return {
                message: message,
                buffer: buffer
            }
        }
        cursor++
    }
    return {
        message: null,
        buffer: buffer
    }
}

export let MessageEncoder: pull.Through<string, Buffer> = function (read: pull.Source<string>): pull.Source<Buffer> {
    var callbacks: pull.SourceCallback<Buffer>[] = []
    return function (sinkSideEnd: pull.Abort, sinkSideCB: pull.SourceCallback<Buffer>): void {
        callbacks.push(sinkSideCB)
        read(sinkSideEnd, function (sourceSideEnd: pull.Abort, message: string) {
            let callback: pull.SourceCallback<Buffer> = callbacks.shift()
            if (sourceSideEnd) {
                callback(sourceSideEnd, null)
                return
            }
            callback(sourceSideEnd, Buffer.from(message + "\n", "utf8"))
        })
    }
}

export let MessageDecoder: pull.Through<Buffer, string> = function (read: pull.Source<Buffer>): pull.Source<string> {
    let buffer: Buffer = Buffer.alloc(0)
    return function (sinkSideEnd: pull.Abort, sinkSideCB: pull.SourceCallback<string>): void {
        let result = extractMessage(buffer)
        if (result.message != null) {
            buffer = result.buffer
            sinkSideCB(null, result.message)
            return
        }
        read(sinkSideEnd, function more(sourceSideEnd: pull.Abort, data: Buffer) {
            if (sourceSideEnd) {
                sinkSideCB(sourceSideEnd, null)
                return
            }
            buffer = Buffer.concat([buffer, data], buffer.length + data.length)
            let result = extractMessage(buffer)
            if (result.message != null) {
                buffer = result.buffer
                sinkSideCB(null, result.message)
                return
            }
            read(sinkSideEnd, more)
        })
    }
}
