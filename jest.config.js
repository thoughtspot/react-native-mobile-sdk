module.exports = {
    "preset": "react-native",
    "transformIgnorePatterns": [
      "/node_modules/(?!(@react-native|react-native)/).*/"
    ],
    "coveragePathIgnorePatterns": [
      "node_modules",
      "src/types.ts"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 60,
        "functions": 75,
        "lines": 75,
        "statements": 75
      }
    },
    "moduleFileExtensions": [
      "js",
      "json",
      "jsx",
      "ts",
      "tsx",
      "node",
      "android.js",
      "ios.js"
    ]
  };