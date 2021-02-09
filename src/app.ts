import express from 'express'
import { config } from 'dotenv'
import { writeContent, writeTitle, writeStyle, Content, Style, ResponseState } from './utils'
import { getBodyTime, getTitleTime } from './times'

config()

const { PORT } = process.env

export const server = express()

const style = {
  body: {
    width: '80%',
    'max-width': '64rem',
    margin: 'auto',
    'padding-top': '30px',
    'background-color': '#ddd',
    color: '#222',
    'font-family': 'sans-serif',
  },
  h1: {
    'font-weight': 'bold',
  },
} as Style

const content = [
  ['h1', 'The slowest website'],
  ['p', 'This website is really, really slow. I mean you really need to wait for it to be loaded.'],
  ['h2', 'Why?'],
  [
    'p',
    'Nice question: I really had nothing better to do. Also, I currently own this amazing domain, so why not?',
  ],
  [
    'p',
    'Also, if you have the patience to wait, at the end of the loading process you will actually find a nice surprise!',
  ],
  ['h2', 'It does not work.'],
  [
    'p',
    "Yeah you should be using Chrome, since it's the only browser that really really wants to render something (anything!) and will even adapt to the most gruesome html.",
  ],
  ['h2', "It does not work even if I'm using Chrome."],
  ['p', 'Yeah I actually suck, but who cares.'],
  ['h2', 'How fucking long does it take to load this website?'],
  ['p', "A lot. Like, around 10 minutes. But, you know, it's 'by design'!"],
  [
    'p',
    "Also, I don't want you to think that its slowness is caused by the size of the page (really small) or by some huge asset (only used HTML and like 3 styles since fuck CSS).",
  ],
  ['h2', 'So, how does it work?'],
  [
    'p',
    "Nice of you to ask that, I'll briefly explain! I mean briefly as in in a few words, but actually the time it will take to load all of the words will be a lot...",
  ],
  [
    'p',
    'Yeah this explanation was not only useless, but must have added almost a minute to you, the reader, could have avoided it...',
  ],
  ['h2', 'Wait, why is the style changing while the page is loading?'],
  ['p', "Because it's being sent little by little just like the text, but we need to focus!"],
  ['h2', 'Also the page title was loaded character by character, was that js?'],
  [
    'p',
    'No, simply HTML: it turns out that Chrome, when it receives a <title> tag, will write its content inside the page title even before the </title> closing tag arrives! But we need to focus on the explanation!',
  ],
  ['h2', 'Right, you were explaining how it works'],
  [
    'p',
    "Ok, it's really simple: I'm simply sending the data little by little, and the browser (Chrome) is doing all of the work! While the connection is open, I'm simply sending character by character the page.",
  ],
] as Content

server.get('/', async (req: express.Request, res: express.Response) => {
  const titleTime = getTitleTime()
  const responseState: ResponseState = {
    writingTag: false,
  }
  await writeTitle(res, responseState, 'The Slowest Website', titleTime)
  const bodyTime = getBodyTime()
  const promises = [
    writeContent(res, responseState, content, bodyTime),
    writeStyle(res, responseState, style, bodyTime),
  ]
  await Promise.all(promises)
  res.end()
})

export const port = PORT
