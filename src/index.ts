import { server, port } from './app'

server.listen(port, () => {
  console.log(`Wella! the-slowest-website is listening to localhost:${port}`)
})
