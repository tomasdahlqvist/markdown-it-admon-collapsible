/*
const ADMONITION_TAGS = [
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
]
*/

const capitalize = ([first, ...rest], lowerRest = false) =>
  first.toUpperCase() + rest.join('')

function getTag (params) {
  const [tag = '', ..._title] = params.trim().split(' ')

  /* c8 ignore next 3 */
  if (!tag) {
    return {}
  }

  const joined = _title.join(' ');
  let title;
  if (!joined) {
    title = capitalize(tag);
  } else if (joined === '""') {
    title = '';
  } else if ((joined.startsWith('"') && joined.endsWith('"')) || (joined.startsWith("'") && joined.endsWith("'"))) {
    title = joined.slice(1, -1);
  } else {
    title = joined;
  }
  return { tag: tag.toLowerCase(), title };
}

function validate (params) {
  const [tag = ''] = params.trim().split(' ', 1)
  return !!tag
}


function renderDefault(tokens, idx, _options, env, slf) {
  return slf.renderToken(tokens, idx, _options, env, slf);
}

function renderCollapsibleOpen(tokens, idx) {
  const token = tokens[idx];
  const classes = token.attrs ? token.attrs.find(a => a[0] === 'class')[1] : '';
  return `<div class="${classes}">\n`;
}

function renderCollapsibleTitleOpen(tokens, idx) {
  const token = tokens[idx];
  const expanded = tokens[idx - 1]?.meta?.expanded;
  // Add toggle button
  return `<p class="admonition-title"><button class="collapsible-toggle" tabindex="0">${expanded ? '&#x2212;' : '&#x2b;'}</button>`;
}

function renderCollapsibleTitleClose() {
  return '</p>\n';
}

function renderCollapsibleContentOpen(tokens, idx) {
  return '<div class="collapsible-content">\n';
}

function renderCollapsibleContentClose() {
  return '</div>\n';
}


const minMarkers = 3;
const markerTypes = [
  { str: '!', type: 'admonition' },
  { str: '?', type: 'collapsible' }
];


function admonition(state, startLine, endLine, silent) {
  let pos, nextLine, token;
  const start = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];

  // Determine marker type
  let markerType = null;
  for (const type of markerTypes) {
    if (state.src.substr(start, type.str.length) === type.str.repeat(type.str.length)) {
      markerType = type;
      break;
    }
  }
  if (!markerType) return false;

  const markerStr = markerType.str;
  const markerLen = markerStr.length;
  const markerChar = markerStr.charCodeAt(0);

  // Check out the rest of the marker string
  for (pos = start + 1; pos <= max; pos++) {
    if (markerStr[(pos - start) % markerLen] !== state.src[pos]) {
      break;
    }
  }

  const markerCount = Math.floor((pos - start) / markerLen);
  if (markerCount < minMarkers) return false;
  const markerPos = pos - ((pos - start) % markerLen);
  let params = state.src.slice(markerPos, max);
  let markup = state.src.slice(start, markerPos);

  // Collapsible: check for plus sign
  let isCollapsible = markerType.type === 'collapsible';
  let expanded = false;
  if (isCollapsible && params.trim().startsWith('+')) {
    expanded = true;
    params = params.trim().slice(1).trim();
    markup += '+';
  }

  if (!validate(params)) return false;
  if (silent) return true;

  const oldParent = state.parentType;
  const oldLineMax = state.lineMax;
  const oldIndent = state.blkIndent;

  let blkStart = pos;
  for (; blkStart < max; blkStart += 1) {
    if (state.src[blkStart] !== ' ') break;
  }
  state.parentType = 'admonition';
  state.blkIndent += blkStart - start;

  let wasEmpty = false;
  nextLine = startLine;
  for (;;) {
    nextLine++;
    if (nextLine >= endLine) break;
    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];
    const isEmpty = state.sCount[nextLine] < state.blkIndent;
    if (isEmpty && wasEmpty) break;
    wasEmpty = isEmpty;
    if (pos < max && state.sCount[nextLine] < state.blkIndent) break;
  }
  state.lineMax = nextLine;

  const { tag, title } = getTag(params);

  // Use different token for collapsible
  const openType = isCollapsible ? 'collapsible_open' : 'admonition_open';
  const closeType = isCollapsible ? 'collapsible_close' : 'admonition_close';

  token = state.push(openType, 'div', 1);
  token.markup = markup;
  token.block = true;
  token.attrs = [['class', `admonition ${tag}${isCollapsible ? ' collapsible' : ''}${expanded ? ' expanded' : ''}`]];
  token.meta = { tag, expanded };
  token.content = title;
  token.info = params;
  token.map = [startLine, nextLine];

  if (title) {
    const titleMarkup = markup + ' ' + tag;
    token = state.push(isCollapsible ? 'collapsible_title_open' : 'admonition_title_open', 'p', 1);
    token.markup = titleMarkup;
    token.attrs = [['class', 'admonition-title']];
    token.map = [startLine, startLine + 1];

    token = state.push('inline', '', 0);
    token.content = title;
    token.map = [startLine, startLine + 1];
    token.children = [];

    token = state.push(isCollapsible ? 'collapsible_title_close' : 'admonition_title_close', 'p', -1);
    token.markup = titleMarkup;
  }

  state.md.block.tokenize(state, startLine + 1, nextLine);

  token = state.push(closeType, 'div', -1);
  token.markup = state.src.slice(start, pos);
  token.block = true;

  state.parentType = oldParent;
  state.lineMax = oldLineMax;
  state.blkIndent = oldIndent;
  state.line = nextLine;

  return true;
}

module.exports = function admonitionPlugin(md, options = {}) {
  const render = options.render || renderDefault;

  md.renderer.rules.admonition_open = render;
  md.renderer.rules.admonition_close = render;
  md.renderer.rules.admonition_title_open = render;
  md.renderer.rules.admonition_title_close = render;

  // Collapsible rendering
  md.renderer.rules.collapsible_open = renderCollapsibleOpen;
  md.renderer.rules.collapsible_close = (tokens, idx) => '</div>';
    md.renderer.rules.collapsible_close = (tokens, idx) => '</div>\n';
  md.renderer.rules.collapsible_title_open = renderCollapsibleTitleOpen;
  md.renderer.rules.collapsible_title_close = renderCollapsibleTitleClose;

  // Wrap content in collapsible-content div
  const origBlockTokenize = md.block.tokenize;
  md.block.tokenize = function(state, startLine, endLine) {
    if (state.parentType === 'admonition' && state.tokens.length > 0) {
      const lastToken = state.tokens[state.tokens.length - 1];
      if (lastToken.type === 'collapsible_title_close') {
        state.tokens.push({ type: 'collapsible_content_open' });
        origBlockTokenize.call(this, state, startLine, endLine);
        state.tokens.push({ type: 'collapsible_content_close' });
        return;
      }
    }
    origBlockTokenize.call(this, state, startLine, endLine);
  };
  md.renderer.rules.collapsible_content_open = renderCollapsibleContentOpen;
  md.renderer.rules.collapsible_content_close = renderCollapsibleContentClose;

  md.block.ruler.before('fence', 'admonition', admonition, {
    alt: ['paragraph', 'reference', 'blockquote', 'list']
  });
}
