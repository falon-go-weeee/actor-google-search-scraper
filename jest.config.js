// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
    testEnvironment: 'node',
    preset: 'ts-jest',
    testMatch: [
        '**/__tests__/(*.)+(spec|test).js',
    ],
};
