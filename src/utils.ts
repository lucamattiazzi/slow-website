import express, { response } from 'express'
import { shuffle, sumBy } from 'lodash'

export type Style = Record<string, Record<string, number | string>>
export type Content = [string, string][]
export interface ResponseState {
  writingTag: boolean
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

async function writeText(res: express.Response, text: string, time: number) {
  const letters = text.split('')
  const timeForLetter = time / letters.length
  for (const letter of letters) {
    res.write(letter)
    await sleep(timeForLetter)
  }
}

export async function writeContent(
  res: express.Response,
  state: ResponseState,
  content: Content,
  time: number,
) {
  const totalText = content.reduce<number>((acc, [tag, text]) => {
    const length = tag.length + text.length + 5 // 5 are the characters <></> that complete a tag
    return acc + length
  }, 0)
  const timeForLetter = time / totalText
  console.log('timeForLetter', timeForLetter)
  for (const [tag, text] of content) {
    state.writingTag = true
    await writeText(res, `<${tag}>`, timeForLetter * (tag.length + 2))
    state.writingTag = false
    await writeText(res, text, timeForLetter * text.length)
    state.writingTag = true
    await writeText(res, `</${tag}>`, timeForLetter * (tag.length + 3))
    state.writingTag = false
  }
}

export async function writeTitle(
  res: express.Response,
  state: ResponseState,
  title: string,
  time: number,
) {
  const content = [['title', title]] as Content
  return writeContent(res, state, content, time)
}

export async function writeStyle(
  res: express.Response,
  state: ResponseState,
  style: Style,
  time: number,
) {
  const allStyles: string[] = []
  for (const [selector, styles] of Object.entries(style)) {
    for (const [styleKey, styleValue] of Object.entries(styles)) {
      const singleStyle = `<style>${selector} {${styleKey}: ${styleValue}}</style>`
      allStyles.push(singleStyle)
    }
  }
  const shuffled = shuffle(allStyles)
  const timeForStyle = time / shuffled.length
  for (const styleString of shuffled) {
    while (state.writingTag) await sleep(10)
    res.write(styleString)
    await sleep(timeForStyle)
  }
}
