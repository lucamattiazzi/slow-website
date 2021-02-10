function randomizeTime(time: number, perc: number = 0.5) {
  return function () {
    const constPart = time * (1 - perc)
    return constPart + 2 * Math.random() * time * perc
  }
}

export const getTitleTime = randomizeTime(1000)
export const getBodyTime = randomizeTime(1000 * 60 * 1)
