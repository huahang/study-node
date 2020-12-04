import { Model, link } from "@jacobbubu/scuttlebutt-pull";
import { delay, printKeyValue } from "./utils";

const main = async () => {
  const a = new Model({ id: "A" });
  const b = new Model({ id: "B" });

  // in a <-> b relationship, a is read-only and b is write-only
  const s1 = a.createSourceStream({ name: "a->b" });
  const s2 = b.createSinkStream({ name: "b->a" });

  a.set("foo", "changed by A");

  s1.on("synced", () => {
    console.log("s1 synced");
    printKeyValue(a, "foo");
    printKeyValue(b, "foo");
  });

  s2.on("synced", () => {
    console.log("s2 synced");
    printKeyValue(a, "foo");
    printKeyValue(b, "foo");
  });

  link(s1, s2);

  await delay(5000);

  b.set("foo", "changed by B");
  console.log("--- change@B");
  printKeyValue(a, "foo");
  printKeyValue(b, "foo");
};

main();
