import express from 'express'
import { shuffle, sumBy } from 'lodash'
import { v4 } from 'uuid'

export type Style = Record<string, Record<string, number | string>>
type Element = [string, string]
export type Content = Element[]

const entitiesDict = {
  '>': '&gt;',
  '<': '&lt;',
  '/': '&sol;',
}

const MULTIPLIER_THRESHOLD = 0.4

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

function replaceWithEntities(letter: string) {
  return entitiesDict[letter] || letter
}

function interpolate(from: number, to: number, value: number): number {
  return from + (to - from) * value
}

function getMultiplier(value: number): number {
  if (value < MULTIPLIER_THRESHOLD) return interpolate(0.5, 10, value)
  return interpolate(0.5, 10, value) + value / (1 - value)
}

async function writeText(
  res: express.Response,
  text: string,
  timeForLetter: number,
  totalLetters: number,
  usedLetters: number,
) {
  const letters = text.split('').map(replaceWithEntities)
  for (const idx in letters) {
    const letterIdx = Number(idx)
    const letter = letters[letterIdx]
    const totalUsedPart = (letterIdx + usedLetters) / totalLetters
    const multiplier = getMultiplier(totalUsedPart)
    console.log('multiplier', multiplier, totalUsedPart)
    res.write(letter)
    await sleep(timeForLetter * multiplier)
  }
  return letters.length
}

function getElementLength(elem: Element) {
  return elem[0].length + 2 + elem[1].length + elem[0].length + 3
}

export async function writeTitle(res: express.Response, title: string, time: number) {
  const letters = title.split('').map(replaceWithEntities)
  const timeForLetter = time / letters.length
  res.write(`<title>`)
  for (const letter of letters) {
    res.write(letter)
    await sleep(timeForLetter)
  }
  res.write(`</title>`)
}

export async function writeContent(res: express.Response, content: Content, time: number) {
  const totalContentLength = sumBy(content, getElementLength)
  const timeForLetter = time / totalContentLength
  let usedLetters = 0
  for (const [tag, text] of content) {
    const fakeTagClass = `s_${v4().split('-').join('')}`
    const fakeTagStyle = `<style> .${fakeTagClass} { display: none } </style>`

    res.write(`<span class=${fakeTagClass}>`)
    usedLetters += await writeText(res, `<${tag}>`, timeForLetter, totalContentLength, usedLetters)

    res.write(`</span>`)

    res.write(`<${tag}>`)
    usedLetters += await writeText(res, text, timeForLetter, totalContentLength, usedLetters)
    res.write(`</${tag}>`)

    res.write(`<span class=${fakeTagClass}>`)
    usedLetters += await writeText(res, `</${tag}>`, timeForLetter, totalContentLength, usedLetters)
    res.write(`</span>`)

    res.write(fakeTagStyle)
  }
}

export async function writeStyle(res: express.Response, style: Style, time: number) {
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
    res.write(styleString)
    await sleep(timeForStyle)
  }
}
