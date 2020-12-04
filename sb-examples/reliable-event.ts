import { ReliableEvent, link } from "@jacobbubu/scuttlebutt-pull";
import { delay } from "./utils";

const main = async () => {
  const a = new ReliableEvent({ id: "A" });
  const b = new ReliableEvent({ id: "B" });

  // in a <-> b relationship, a is read-only and b is write-only
  const s1 = a.createStream({ name: "a->b" });
  const s2 = b.createStream({ name: "b->a" });

  link(s1, s2);

  b.on("ota", (event) => {
    console.log(`Received@${b.id} (ota): ${event}`);
  });

  b.on("CRITICAL", (event) => {
    console.log(`Received@${b.id} (CRITICAL): ${event}`);
  });

  await delay(1000);
  a.push("ota", "ota has started");

  await delay(1000);
  a.push("ota", "30% progress");

  await delay(1000);
  a.push("ota", "70% progress");

  await delay(1000);
  a.push("ota", "100% done");

  await delay(1000);
  a.push("CRITICAL", "The 🔋 is about to 💥!");
};

main();
