module.exports = new Array(500).fill(null).map((_, i) => ({
  id: String(i),
  name: `user-${i}`
}))