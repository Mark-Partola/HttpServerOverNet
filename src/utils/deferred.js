// @flow

export default () => {
  const exporting = {};

  exporting.promise = new Promise((res, rej) => {
    exporting.resolve = res;
    exporting.reject = rej;
  });

  return exporting;
};
