import express from 'express'
import { config } from 'dotenv'
import { writeContent, writeTitle, writeStyle, Content, Style, sleep } from './utils'
import { getBodyTime, getTitleTime } from './times'
import template from '../content.json'

config()

const { PORT = 4000 } = process.env

export const server = express()

const style = template.style as Style
const content = template.content as Content

server.get('/', async (req: express.Request, res: express.Response) => {
  const titleTime = getTitleTime()
  await writeTitle(res, 'The Slowest Website', titleTime)
  const bodyTime = getBodyTime()
  const promises = [writeContent(res, content, bodyTime), writeStyle(res, style, bodyTime)]
  await Promise.all(promises)
  res.end()
})

server.get('/test', async (req: express.Request, res: express.Response) => {
  res.write('test...')
  await sleep(10000)
  res.end('done!')
})

export const port = PORT
