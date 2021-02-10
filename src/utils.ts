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

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

function replaceWithEntities(letter: string) {
  return entitiesDict[letter] || letter
}

async function writeText(res: express.Response, text: string, time: number) {
  const letters = text.split('').map(replaceWithEntities)
  const timeForLetter = time / letters.length
  for (const letter of letters) {
    res.write(letter)
    await sleep(timeForLetter)
  }
}

function getElementLength(elem: Element) {
  return elem[0].length + 2 + elem[1].length + elem[0].length + 3
}

export async function writeTitle(res: express.Response, title: string, time: number) {
  res.write(`<title>`)
  await writeText(res, title, time)
  res.write(`</title>`)
}

export async function writeContent(res: express.Response, content: Content, time: number) {
  const totalContentLength = sumBy(content, getElementLength)
  console.log('totalContentLength', totalContentLength)
  const timeForLetter = time / totalContentLength
  for (const [tag, text] of content) {
    const fakeTagClass = `s_${v4().split('-').join('')}`
    const fakeTagStyle = `<style> .${fakeTagClass} { display: none } </style>`

    res.write(`<span class=${fakeTagClass}>`)
    await writeText(res, `<${tag}>`, timeForLetter * (tag.length + 2))
    res.write(`</span>`)

    res.write(`<${tag}>`)
    await writeText(res, text, timeForLetter * text.length)
    res.write(`</${tag}>`)

    res.write(`<span class=${fakeTagClass}>`)
    await writeText(res, `</${tag}>`, timeForLetter * (tag.length + 3))
    res.write(`</span>`)

    res.write(fakeTagStyle)
  }
}

export async function writeStyle(res: express.Response, style: Style, timeForStyle: number) {
  const allStyles: string[] = []
  for (const [selector, styles] of Object.entries(style)) {
    for (const [styleKey, styleValue] of Object.entries(styles)) {
      const singleStyle = `<style>${selector} {${styleKey}: ${styleValue}}</style>`
      allStyles.push(singleStyle)
    }
  }
  const shuffled = shuffle(allStyles)
  for (const styleString of shuffled) {
    res.write(styleString)
    await sleep(timeForStyle)
  }
}
