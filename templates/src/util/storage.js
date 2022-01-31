export function setStorage(key, value) {
  localStorage.setItem(key, value);
}

export function getStorage(key) {
  const defaults = {
    theme: 'light',
    language: 'english'
  }

  const defaultValue = defaults[key];

  let storageValue = localStorage.getItem(key);
  let validatedValue = null;

  if (storageValue === 'true') {
    validatedValue = true;
  } else if (storageValue === 'false') {
    validatedValue = false;
  } else {
    validatedValue = storageValue;
  }

  if (validatedValue == null && defaultValue != null) {
      localStorage.setItem(key, defaultValue);
      return defaultValue;
  }

  return validatedValue;
}
