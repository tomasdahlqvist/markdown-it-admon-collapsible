# markdown-it-admon-collapsible

> **Note:** This package is a fork of [markdown-it-admon](https://github.com/commenthol/markdown-it-admon) with added support for collapsible blocks (???), inspired by Material for MkDocs.
> Plugin for creating admonitions for [markdown-it](https://github.com/markdown-it/markdown-it) markdown parser.

With this plugin you can have collapsible admonitions:

- Admonition blocks: Use !!! to create styled info/warning/note blocks
- Collapsible blocks: Use ??? to create blocks with a toggle, collapsed or expanded
- ???+ starts the block expanded
- All admonition and collapsible types from Material for MkDocs are supported
- Toggle button and styles included

Examples:

```markdown
!!! note
  This is an admonition

??? warning "Collapsible Warning"
  This block can be expanded/collapsed

???+ info "Expanded Info"
  This block starts expanded
```

Markdown syntax is inspired by [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/reference/admonitions/) and supports both admonition blocks (!!!) and collapsible blocks (???).

[rST][] suggests the following "types": `attention`, `caution`, `danger`, `error`, `hint`, `important`, `note`, `tip`, and `warning`; however, you’re free to use whatever you want.

A styles file does support the following admonition types: Credits go to [vscode-markdown-extended][].

```text
'note',
'summary', 'abstract', 'tldr',
'info', 'todo',
'tip', 'hint',
'success', 'check', 'done',
'question', 'help', 'faq',
'warning', 'attention', 'caution',
'failure', 'fail', 'missing',
'danger', 'error', 'bug',
'example', 'snippet',
'quote', 'cite'
```

![Admonition types](./docs/admonition-types.png)

## Installation

node.js:

```bash
npm install markdown-it-admon-collapsible --save
```

## API

```js
const md = require('markdown-it')()
             .use(require('markdown-it-admon-collapsible') [, options]);
```

Plugin Options

- `render`: (optional) Custom render function.
- `validate`: (optional) Custom validation function. If provided, this function will be used to validate the parameters for admonitions.

### Example usage

```js
const md = require('markdown-it')();
const admonitionPlugin = require('markdown-it-admon-collapsible');

md.use(admonitionPlugin, {
  validate: function(params) {
    // Custom validation logic
    return params.startsWith('note');
  }
});
```

## License

[MIT](./LICENSE)

## References

- [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/reference/admonitions/)
- [vscode-markdown-extended][vscode-markdown-extended]
- [rST]: https://docutils.sourceforge.io/docs/ref/rst/directives.html#specific-admonitions
- [vscode-markdown-extended]: https://github.com/qjebbs/vscode-markdown-extended
