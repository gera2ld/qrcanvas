const QrCanvas = {
  props: {
    options: Object,
  },
  render(createElement) {
    return createElement('canvas');
  },
  methods: {
    render(options) {
      // Render only if mounted, skip SSR.
      if (!this.mounted) return;
      const qroptions = Object.assign({}, options);
      qroptions.reuseCanvas = this.$el;
      qrcanvas(qroptions);
    },
  },
  watch: {
    options: 'render',
  },
  mounted() {
    this.mounted = true;
    this.render(this.options);
  },
};

const themes = {
  classic: {
    colorFore: '#000000',
    colorBack: '#ffffff',
    colorOut: '#000000',
    colorIn: '#000000',
  },
  light: {
    colorFore: '#0d86ff',
    colorBack: '#ffffff',
    colorOut: '#ff8080',
    colorIn: '#0059b3',
  },
  dark: {
    colorFore: '#4169e1',
    colorBack: '#ffffff',
    colorOut: '#cd5c5c',
    colorIn: '#191970',
  },
};

const STORE_KEY = 'userSettings';
const data = {
  settings: Object.assign({
    qrtext: 'https://gerald.top',
    cellSize: 6,
    effect: '',
    effectValue: 100,
    typeNumber: 1,
    logo: false,
    logoType: 'image',
    logoText: 'Gerald',
    logoSize: 15,
    logoClearEdges: 3,
    logoMargin: 0,
  }, themes.classic, loadData()),
  effects: [
    { title: 'None', value: '' },
    { title: 'Liquid', value: 'liquid' },
    { title: 'Round', value: 'round' },
    { title: 'Image', value: 'image' },
  ],
  themes: Object.keys(themes),
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
}

function dumpData(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

new Vue({
  components: {
    QrCanvas,
  },
  data,
  computed: {
    options() {
      const { settings } = this;
      const { colorFore, colorBack, colorOut, colorIn } = settings;
      const options = {
        cellSize: +settings.cellSize,
        foreground: [
          // foreground color
          {style: colorFore},
          // outer squares of the positioner
          {row: 0, rows: 7, col: 0, cols: 7, style: colorOut},
          {row: -7, rows: 7, col: 0, cols: 7, style: colorOut},
          {row: 0, rows: 7, col: -7, cols: 7, style: colorOut},
          // inner squares of the positioner
          {row: 2, rows: 3, col: 2, cols: 3, style: colorIn},
          {row: -5, rows: 3, col: 2, cols: 3, style: colorIn},
          {row: 2, rows: 3, col: -5, cols: 3, style: colorIn},
        ],
        background: colorBack,
        data: settings.qrtext,
        typeNumber: +settings.typeNumber,
      };
      if (settings.logo) {
        options.logo = {
          clearEdges: +settings.logoClearEdges,
          size: settings.logoSize / 100,
          margin: +settings.logoMargin,
        };
        if (settings.logoType === 'image') {
          options.logo.image = this.$refs.logo;
        } else {
          const fontFamily = settings.logoFont;
          if (fontFamily) options.logo.fontFamily = fontFamily;
          const fontStyle = [
            settings.logoItalic && 'italic',
            settings.logoBold && 'bold',
          ].filter(Boolean).join(' ');
          Object.assign(options.logo, {
            text: settings.logoText,
            color: settings.logoColor,
            fontStyle,
          });
        }
      }
      if (settings.effect) {
        options.effect = {
          key: settings.effect,
          value: settings.effectValue / 100,
        };
        if (settings.effect === 'image') {
          options.background = [colorBack, this.$refs.effect];
        }
      }
      dumpData(settings);
      return options;
    },
  },
  methods: {
    loadImage(e, ref) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        this.$refs[ref].src = reader.result;
      };
      reader.readAsDataURL(file);
    },
    loadTheme(key) {
      Object.assign(this.settings, themes[key]);
    },
  },
}).$mount('#app');
