/* Jest setup — native module mocks so screens render in Node. */

// AsyncStorage → in-memory mock shipped by the package
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Safe area — render children in a plain View with zero insets
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 390, height: 844 };
  return {
    __esModule: true,
    SafeAreaProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    SafeAreaView: ({ children, ...props }) => React.createElement(View, props, children),
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: { insets, frame },
  };
});

// expo-blur — BlurView renders as a plain View
jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  const BlurView = (props) => React.createElement(View, props, props?.children);
  return { __esModule: true, BlurView };
});

// expo-image — fall back to the RN Image
jest.mock('expo-image', () => {
  const { Image } = require('react-native');
  return { __esModule: true, Image };
});

// react-native-svg (pulled in by lucide-react-native) — every tag becomes a View
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const make = (name) => {
    const Component = (props) => React.createElement(View, props, props?.children);
    Component.displayName = name;
    return Component;
  };
  const target = { __esModule: true };
  return new Proxy(target, {
    get: (t, key) => (key in t ? t[key] : make(String(key))),
  });
});
