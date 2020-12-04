import looper from "@jacobbubu/looper";

const next = looper(() => {
  console.log(`Time: ${new Date()}`);
  // async
  setTimeout(next, 1000);
  // sync
  // next()
});
next();
