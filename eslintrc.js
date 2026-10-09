module.exports = {
  root: true,
  extends: ['universe/native', 'universe/shared/typescript-analysis'],
  rules: {
    'no-console': { error: 'warn', allow: ['warn', 'error'] },
  },
};
