import * as Net from "net";
import * as Pull from "pull-stream";
import * as ToPull from "@huahang/stream-to-pull-stream";
import { MessageDecoder, MessageEncoder } from "./codec";
import { Delay } from "./delay";
import { PushableDuplex } from "@jacobbubu/pull-pushable-duplex";
import Checker from "@jacobbubu/pull-stream-protocol-checker";

const port = 8080;
const server: Net.Server = new Net.Server();
server.listen(port, function () {
  console.log(
    "Server listening for connection requests on socket localhost: " + port
  );
});

let clientCount = 0;
server.on("connection", function (socket: Net.Socket) {
  clientCount++;
  console.log(`Client #${clientCount} connected.`);

  const peer: Pull.Duplex<Buffer, Buffer> = ToPull.duplex(socket, function () {
    console.log(`Client #${clientCount} write finished.`);
  });
  let messageCount = 0;

  const duplex = new PushableDuplex<string, string, any>({
    allowHalfOpen: false,
    onReceived: (message: string) => {
      messageCount++;
      message = message.trim().toUpperCase();
      if (message == "KILL") {
        process.exit(0);
        return;
      }
      duplex.push(`msg-${messageCount}( ${message} )`);
    },
    onFinished: (err: Pull.Abort) => {
      if (err) {
        console.log(`Hit an error: ${err}`);
      }
      console.log(`Client #${clientCount} finished.`);
    },
  });

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
  );
});

function getProbe() {
  return Checker({
    forbidExtraRequests: true,
    enforceStreamTermination: true,
    notifyEagerly: true,
  });
}
