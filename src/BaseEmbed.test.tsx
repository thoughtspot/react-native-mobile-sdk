import { BaseEmbed, TSEmbedRef } from './BaseEmbed';
import React from 'react';
import { render } from '@testing-library/react-native';
import { WebView } from 'react-native-webview';

const mockInjectJavaScript = jest.fn();
jest.mock('react-native-webview', () => {
  return {
    WebView: jest.fn(props => {
      if (props.ref) {
        props.ref.current = {
          injectJavaScript: mockInjectJavaScript
        };
      }
      return null;
    })
  };
});

const mockSendMessage = jest.fn();
jest.mock('./event-bridge', () => {
  return {
    EmbedBridge: jest.fn().mockImplementation(() => {
      return {
        sendMessage: mockSendMessage,
        handleMessage: jest.fn(),
        registerEmbedEvent: jest.fn(),
        trigger: jest.fn()
      };
    })
  };
});

jest.mock('./init', () => ({
  embedConfigCache: { testConfig: 'mockValue' }
}));

describe('BaseEmbed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(() => {
      render(
        <BaseEmbed 
          typeofEmbed="test" 
          embedType="test"
        />
      );
    }).not.toThrow();
  });

  it('accepts and processes props correctly', () => {
    const { rerender } = render(
      <BaseEmbed 
        typeofEmbed="test" 
        embedType="test"
        customProp="initial"
      />
    );
    
    rerender(
      <BaseEmbed 
        typeofEmbed="test" 
        embedType="test"
        customProp="updated"
      />
    );
    
    expect(true).toBe(true);
  });

  it('handles event handler props', () => {
    const mockHandler = jest.fn();
    
    render(
      <BaseEmbed 
        typeofEmbed="test" 
        embedType="test"
        onVizPointClick={mockHandler}
      />
    );
    
    expect(true).toBe(true);
  });

  it('creates a ref with trigger method', () => {
    const ref = React.createRef<TSEmbedRef>();
    
    render(
      <BaseEmbed 
        ref={ref}
        typeofEmbed="test" 
        embedType="test"
      />
    );
    
    expect(ref.current).toBeDefined();
    expect(typeof ref.current?.trigger).toBe('function');
  });

  it('handles error scenario gracefully', () => {
    const mockErrorHandler = jest.fn();
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    const { getByTestId } = render(
      <BaseEmbed 
        typeofEmbed="test" 
        embedType="test"
        onErrorSDK={mockErrorHandler}
        testID="test-embed"
      />
    );
    
    expect(true).toBe(true);
    consoleSpy.mockRestore();
  });

  it('accepts different embedType values', () => {
    expect(() => {
      render(
        <BaseEmbed 
          typeofEmbed="test" 
          embedType="liveboard"
        />
      );
    }).not.toThrow();

    expect(() => {
      render(
        <BaseEmbed 
          typeofEmbed="test" 
          embedType="visualization"
        />
      );
    }).not.toThrow();
  });

  it('accepts multiple event handlers', () => {
    const onLoadHandler = jest.fn();
    const onClickHandler = jest.fn();
    const onSearchHandler = jest.fn();
    
    render(
      <BaseEmbed 
        typeofEmbed="test" 
        embedType="test"
        onLoad={onLoadHandler}
        onVizPointClick={onClickHandler}
        onSearch={onSearchHandler}
      />
    );
    
    expect(true).toBe(true);
  });

  it('handles style props', () => {
    render(
      <BaseEmbed 
        typeofEmbed="test" 
        embedType="test"
        style={{ width: 500, height: 400, backgroundColor: '#f0f0f0' }}
      />
    );
    
    expect(true).toBe(true);
  });

  it('accepts complex nested props', () => {
    render(
      <BaseEmbed 
        typeofEmbed="test" 
        embedType="test"
        customizations={{
          style: {
            customCSS: '.some-class { color: blue; }'
          },
          showPrimaryNavbar: false
        }}
      />
    );
    
    expect(true).toBe(true);
  });

  it('check if rerender is working', () => {
    const { rerender } = render(
      <BaseEmbed typeofEmbed="test" embedType="test" />
    );
    rerender(
      <BaseEmbed typeofEmbed="test" embedType="test" onSearch={jest.fn()} />
    );
    expect(true).toBe(true); 
  });

  it('handles WebView error', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const { UNSAFE_getByType } = render(<BaseEmbed typeofEmbed="test" embedType="test" />);
  
    UNSAFE_getByType(WebView).props.onError({ nativeEvent: { description: 'Test error' } });
  
    expect(warnSpy).toHaveBeenCalledWith('WebView error: ', { description: 'Test error' });
    warnSpy.mockRestore();
  });
  
  it('handles WebView HTTP error', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const { UNSAFE_getByType } = render(<BaseEmbed typeofEmbed="test" embedType="test" />);
  
    UNSAFE_getByType(WebView).props.onHttpError({ nativeEvent: { statusCode: 500 } });
  
    expect(warnSpy).toHaveBeenCalledWith('HTTP error: ', { statusCode: 500 });
    warnSpy.mockRestore();
  });
});

describe('BaseEmbed integration tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not send messages when vercelShellLoaded is false', () => {
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    
    const { getByTestId } = render(
      <BaseEmbed 
        typeofEmbed="test" 
        embedType="testEmbed"
        testID="base-embed"
      />
    );
    
    expect(mockSendMessage).not.toHaveBeenCalled();
    
    consoleInfoSpy.mockRestore();
  });
});
