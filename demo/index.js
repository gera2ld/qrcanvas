/* global qrcanvas, Vue */
/* eslint-disable object-curly-newline */

const size = 256;

const QrCanvas = {
  props: {
    options: Object,
  },
  render: h => h('canvas', {
    attrs: { width: size, height: size },
  }),
  methods: {
    update(options) {
      const qroptions = Object.assign({}, options, {
        canvas: this.$el,
      });
      qrcanvas.qrcanvas(qroptions);
    },
  },
  watch: {
    options: 'update',
  },
  mounted() {
    this.update(this.options);
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

const correctLevels = ['L', 'M', 'Q', 'H'];

const data = {
  settings: Object.assign({
    qrtext: 'https://gerald.top',
    cellSize: 6,
    padding: 0,
    effect: '',
    effectValue: 100,
    logo: false,
    logoType: 'image',
    logoText: 'Gerald',
    logoClearEdges: 3,
    logoMargin: 0,
    logoColor: '#000000',
    correctLevel: 0,
  }, themes.classic),
  effects: [
    { title: 'None', value: '' },
    { title: 'Fusion', value: 'fusion' },
    { title: 'Round', value: 'round' },
    { title: 'Spot', value: 'spot' },
  ],
  themes: Object.keys(themes),
  options: {},
};

new Vue({
  components: {
    QrCanvas,
  },
  data,
  watch: {
    settings: {
      deep: true,
      handler: 'update',
    },
  },
  methods: {
    update() {
      const { settings } = this;
      const {
        colorFore, colorBack, colorOut, colorIn,
      } = settings;
      const options = {
        cellSize: +settings.cellSize,
        padding: +settings.padding,
        foreground: [
          // foreground color
          { style: colorFore },
          // outer squares of the positioner
          { row: 0, rows: 7, col: 0, cols: 7, style: colorOut },
          { row: -7, rows: 7, col: 0, cols: 7, style: colorOut },
          { row: 0, rows: 7, col: -7, cols: 7, style: colorOut },
          // inner squares of the positioner
          { row: 2, rows: 3, col: 2, cols: 3, style: colorIn },
          { row: -5, rows: 3, col: 2, cols: 3, style: colorIn },
          { row: 2, rows: 3, col: -5, cols: 3, style: colorIn },
        ],
        background: colorBack,
        data: settings.qrtext,
        correctLevel: correctLevels[settings.correctLevel] || 'L',
      };
      if (settings.logo) {
        if (settings.logoType === 'image') {
          options.logo = {
            image: this.$refs.logo,
          };
        } else {
          options.logo = {
            text: settings.logoText,
            options: {
              fontStyle: [
                settings.logoBold && 'bold',
                settings.logoItalic && 'italic',
              ].filter(Boolean).join(' '),
              fontFamily: settings.logoFont,
              color: settings.logoColor,
            },
          };
        }
      }
      if (settings.effect) {
        options.effect = {
          type: settings.effect,
          value: settings.effectValue / 100,
        };
        if (settings.effect === 'spot') {
          options.background = [colorBack, this.$refs.effect];
        }
      }
      this.options = options;
    },
    loadImage(e, ref) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        this.$refs[ref].src = reader.result;
        this.options = Object.assign({}, this.options);
      };
      reader.readAsDataURL(file);
    },
    loadTheme(key) {
      Object.assign(this.settings, themes[key]);
    },
  },
  mounted() {
    this.update();
  },
}).$mount('#app');
