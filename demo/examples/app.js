const menu = $('#menu');
const content = $('#content');
const LOADER = '<div class="loading loading-lg"></div>';
const demos = [
  { name: 'Simple', path: 'simple' },
  { name: 'Text', path: 'text' },
  { name: 'Logo', path: 'logo' },
  { name: 'Pure color', path: 'pure-color' },
  { name: 'Colorful', path: 'colorful' },
];
let active;
demos.forEach(item => {
  menu.append(createElement('li', {
    className: 'menu-item',
  }, [
    item.el = createElement('a', {
      href: `#${item.path}`,
      textContent: item.name,
    }),
  ]));
});

window.addEventListener('hashchange', handleHashChange, false);
handleHashChange();

FallbackJs.ok();

function handleHashChange() {
  const path = window.location.hash.slice(1);
  const item = demos.find(item => item.path === path) || demos[0];
  showDemo(item);
}

function showDemo(item) {
  if (active) active.el.classList.remove('active');
  active = item;
  active.el.classList.add('active');
  content.innerHTML = LOADER;
  loadResource(item)
  .then(item => {
    content.innerHTML = '';
    let container;
    let code;
    content.append(
      createElement('h3', { textContent: item.name }),
      container = createElement('div', {
        className: 'my-2 text-center',
      }),
      createElement('pre', {
        className: 'code',
      }, [
        code = createElement('code', {
          textContent: item.code,
        }),
      ]),
    );
    hljs.highlightBlock(code);
    const fn = new Function('container', item.code);
    container.innerHTML = LOADER;
    fn({
      appendChild: canvas => {
        container.innerHTML = '';
        container.append(canvas);
      },
    });
  });
}

function loadResource(item) {
  if (item.code) return Promise.resolve(item);
  return fetch(`data/${item.path}.js`)
  .then(res => res.text())
  .then(code => {
    item.code = code;
    return item;
  });
}

function $(selector) {
  return document.querySelector(selector);
}

function createElement(tagName, props, children) {
  const el = document.createElement(tagName);
  if (props) {
    Object.keys(props).forEach(key => {
      const value = props[key];
      if (key === 'on') {
        bindEvents(el, value);
      } else {
        el[key] = value;
      }
    });
  }
  if (children) {
    children.forEach(child => {
      el.append(child);
    });
  }
  return el;
}

function bindEvents(el, events) {
  if (events) {
    Object.keys(events).forEach(type => {
      const handle = events[type];
      if (handle) el.addEventListener(type, handle);
    });
  }
  return el;
}
