export const checkIsNumber = (val: string | number | undefined) => {
  const reg = /^\d+.?\d*/;
  if (typeof val === 'number') {
    val = val.toString();
  }
  if (val) {
    return reg.test(val);
  }
  return false;
};

export const checkIsPercentage = (val: string) => {
  return /^\d+(\.\d+)?%$/.test(val);
};

export const checkIsGitRepoURL = (val: string) => {
  const isGitUrl = require('is-git-url');
  return isGitUrl(val);
};

export const defaultFontFamily =
  '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif';

export const monospaceFontFamily = 'Consolas, monaco, monospace';

export const checkHasUndefinedProperty = (obj: any) => {
  for (const key in obj) {
    if (obj[key] === undefined) return true;
  }
  return false;
};
