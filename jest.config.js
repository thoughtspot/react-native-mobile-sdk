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
        "branches": 70,
        "functions": 85,
        "lines": 90,
        "statements": 90
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