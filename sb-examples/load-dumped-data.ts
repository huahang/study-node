import * as Pull from "pull-stream";
import { Model } from "@jacobbubu/scuttlebutt-pull";

const data = [
  `{"id":"A","clock":{"A":1599396592709}}\n`,
  `[["foo","bar"],1599396592709,"A","A"]\n`,
  `"SYNC"\n`,
  "\n",
];

const main = () => {
  const a = new Model({ id: "A" });
  a.on("unstream", (streams) => {
    console.log("data stream finished", streams);
  });
  const s1 = a.createSinkStream({ wrapper: "json" });
  s1.on("synced", () => {
    console.log("SYNCED", a.toJSON());
  });
  Pull(Pull.values(data), s1.sink);
};

main();
