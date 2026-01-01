/* eslint-env mocha */
const assert = require('assert')
const mdit = require('markdown-it')
const admonitionPlugin = require('..')

describe('admonitionPlugin configurable validation', function () {
  it('uses default validation if no custom function is provided', function () {
    const md = mdit().use(admonitionPlugin)
    // Default validation: tag required
    const valid = md.render('!!! note\n    content')
    const invalid = md.render('!!! \n    content')
    assert(valid.includes('admonition note'))
    assert(!invalid.includes('admonition'))
  })

  it('uses custom validation function from options', function () {
    // Custom validation: only allow "custom" tag
    const customValidate = params => params.trim().split(' ', 1)[0] === 'custom'
    const md = mdit().use(admonitionPlugin, { validate: customValidate })
    const valid = md.render('!!! custom\n    content')
    const invalid = md.render('!!! note\n    content')
    assert(valid.includes('admonition custom'))
    assert(!invalid.includes('admonition note'))
  })

  it('custom validation can reject all tags', function () {
    const md = mdit().use(admonitionPlugin, { validate: () => false })
    const out = md.render('!!! note\n    content')
    assert(!out.includes('admonition'))
  })

  it('covers plugin branch for options.validate', function () {
    let called = false
    const customValidate = () => { called = true; return true }
    const md = mdit().use(admonitionPlugin, { validate: customValidate })
    md.render('!!! note\n    content')
    assert(called)
  })

  it('covers plugin branch for no options.validate', function () {
    const md = mdit().use(admonitionPlugin)
    const html = md.render('!!! note\n    content')
    assert(html.includes('admonition note'))
  })
})
