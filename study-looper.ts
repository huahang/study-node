import looper from '@jacobbubu/looper'

let next = looper(() => {
  console.log(`Time: ${new Date()}`)
  // async
  setTimeout(next, 1000)
  // sync
  // next()
})
next()
