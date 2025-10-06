// This is here to make sure module.exports is defined before importing
// GlslCanvas, since it tries to add its contents to an undefined
// global variable. Since it is imported as an NPM package here, GlslCanvas
// cannot be directly modified.

window.exports = {};
window.module = {exports: {}};