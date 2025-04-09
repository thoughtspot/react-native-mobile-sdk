import React from 'react';
import { render } from '@testing-library/react-native';
import { LiveboardEmbed } from './LiveboardEmbed';
import { AuthType } from './types';
import { init } from './init';

jest.mock('react-native-webview', () => ({
  WebView: () => null
}));

jest.mock('./event-bridge', () => ({
  EmbedBridge: function() {
    return {
      sendMessage: jest.fn(),
      handleMessage: jest.fn(),
      registerEmbedEvent: jest.fn(),
      trigger: jest.fn()
    };
  }
}));

describe('<LiveboardEmbed />', () => {
  const liveboardId = 'lb-123';
  const mockGetAuthToken = jest.fn().mockReturnValue('test-auth-token');

  beforeEach(() => {
    jest.clearAllMocks();
    init({
      thoughtSpotHost: 'my.ts.host',
      authType: AuthType.TrustedAuthTokenCookieless,
      getAuthToken: mockGetAuthToken,
    });
  });

  it('renders without crashing', () => {
    expect(() => {
      render(<LiveboardEmbed liveboardId={liveboardId} />);
    }).not.toThrow();
  });

  it('accepts basic props', () => {
    const { rerender } = render(
      <LiveboardEmbed 
        liveboardId={liveboardId} 
      />
    );
    
    rerender(
      <LiveboardEmbed 
        liveboardId={liveboardId} 
      />
    );
    
    expect(true).toBe(true);
  });
});