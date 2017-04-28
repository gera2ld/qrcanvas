const config = {
  colorDark: 'black',
  colorLight: 'white',
};

export function getConfig(key) {
  return config[key];
}

export function setConfig(key, val) {
  config[key] = val;
}
