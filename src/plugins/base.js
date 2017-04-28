const plugins = [];

export function register(plugin) {
  plugins.push(plugin);
}

export function apply(qrcanvas) {
  plugins.forEach(plugin => {
    plugin(qrcanvas);
  });
}
