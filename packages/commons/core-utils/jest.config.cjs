/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  testMatch: [ "**/?(*.)+(spec|test).ts?(x)" ],
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
};