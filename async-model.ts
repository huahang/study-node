import { AsyncModel, link } from "@jacobbubu/scuttlebutt-pull";
import { printAsyncKeyValue, delay } from "./utils";

const main = async function () {
  const a = new AsyncModel({ id: "A", accept: { whitelist: ["foo"] } });
  const b = new AsyncModel({ id: "B", accept: { whitelist: ["foo"] } });

  // in a <-> b relationship, a is read-only and b is write-only
  const s1 = a.createStream({ name: "a->b" });
  const s2 = b.createStream({ name: "b->a" });

  link(s1, s2);

  await delay(1000);
  await printAsyncKeyValue(a, "foo");
  await delay(1000);
  await printAsyncKeyValue(b, "foo");
  await delay(1000);
  console.log(`--- set 'foo'@${a.id}`);
  await a.set("foo", "changed by A");
  await delay(1000);
  await printAsyncKeyValue(a, "foo");
  await delay(1000);
  await printAsyncKeyValue(b, "foo");
  await delay(1000);
  console.log(`--- set 'foo'@${b.id}`);
  await b.set("foo", "changed by B");
  await delay(1000);
  await printAsyncKeyValue(a, "foo");
  await delay(1000);
  await printAsyncKeyValue(b, "foo");
  await delay(1000);
  console.log(`--- set 'ignored'@${a.id}`);
  await a.set("ignored", "changed by A");
  await delay(1000);
  await printAsyncKeyValue(a, "ignored");
  await delay(1000);
  await printAsyncKeyValue(b, "ignored");
};

main();
