/* eslint-env mocha */
const assert = require('assert')
const mdit = require('markdown-it')

describe('admonitionPlugin internal tests', function () {
  it('covers silent branch in admonition', function () {
    // Directly test the admonition function with silent = true
    const md = mdit()
    require('..')(md)
    const admonition = require('..').admonition
    const state = {
      src: '!!! note',
      bMarks: [0],
      tShift: [0],
      eMarks: ['!!! note'.length],
      sCount: [0],
      parentType: '',
      blkIndent: 0,
      lineMax: 1,
      md
    }
    const result = admonition(state, 0, 1, true)
    assert(result === true)
  })
})
