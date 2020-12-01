let a = true
let b = new Error('an error')

console.log(a || b)
console.log(b || a)
