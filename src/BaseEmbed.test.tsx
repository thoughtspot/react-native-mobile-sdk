import React, { useState } from 'react';
import { render, act } from '@testing-library/react-native';
import { BaseEmbed, TSEmbedRef } from './BaseEmbed';
import { MSG_TYPE } from './constants';
import { EmbedEvent } from './types';

jest.mock('react-native-webview', () => ({
  WebView: jest.fn((props: any) => {
    if (props.ref) {
      props.ref.current = {
        injectJavaScript: jest.fn()
      };
    }
    return null;
  })
}));

const mockSendMessage = jest.fn();
const mockHandleMessage = jest.fn();
const mockRegisterEmbedEvent = jest.fn();
const mockTrigger = jest.fn().mockResolvedValue('triggered');
const mockSetPendingHandlers = jest.fn();

const originalUseState = React.useState;


jest.mock('use-deep-compare-effect', () => {
  return {
    __esModule: true,
    default: jest.fn()
  };
});

jest.mock('./utils', () => ({
  notifyErrorSDK: jest.fn(),
  ERROR_MESSAGE: {
    EVENT_ERROR: 'event-error',
    INIT_ERROR: 'init-error'
  }
}));

jest.mock('./event-bridge', () => ({
  EmbedBridge: jest.fn().mockImplementation(() => ({
    sendMessage: mockSendMessage,
    handleMessage: mockHandleMessage,
    registerEmbedEvent: mockRegisterEmbedEvent,
    trigger: mockTrigger
  }))
}));

describe('BaseEmbed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    (React.useState as any) = originalUseState;
  });

  it('Normal render', () => {
    render(<BaseEmbed typeofEmbed="test" embedType="test" />);
  });

  it('Render with props', () => {
    const onLoadHandler = jest.fn();
    const onSavePersonalisedViewHandler = jest.fn();
    const mockConsoleInfo = jest.fn();
    console.info = mockConsoleInfo;
    
    render(
      <BaseEmbed 
        typeofEmbed="test" 
        embedType="test"
        onLoad={onLoadHandler}
        onSavePersonalisedView={onSavePersonalisedViewHandler}
        customProp="value"
      />
    );
    const webViewProps = require('react-native-webview').WebView.mock.calls[0][0];

    act(() => {
      webViewProps.onMessage({
        nativeEvent: {
          data: JSON.stringify({ type: MSG_TYPE.INIT_VERCEL_SHELL })
        }
      });
    });

    expect(mockConsoleInfo).toHaveBeenCalledWith("Waiting for Vercel shell to load...");
  });

  it('Render the webview', () => {
    const onLoadHandler = jest.fn();
    const onSavePersonalisedViewHandler = jest.fn();
    const mockConsoleInfo = jest.fn();
    console.info = mockConsoleInfo;

    const Wrapper = () => {
      return (
        <BaseEmbed
          typeofEmbed="test"
          embedType="test"
          onLoad={onLoadHandler}
          onSavePersonalisedView={onSavePersonalisedViewHandler}
          customProp="value"
        />
      );
    };

    render(<Wrapper />);
    expect(require('react-native-webview').WebView).toHaveBeenCalled();
    
    const webViewProps = require('react-native-webview').WebView.mock.calls[0][0];
    
    expect(webViewProps.testID).toBe('test-webview');
    expect(webViewProps.source.uri).toBeDefined();
    expect(typeof webViewProps.onMessage).toBe('function');
    expect(typeof webViewProps.onError).toBe('function');
    expect(typeof webViewProps.onHttpError).toBe('function');
    expect(webViewProps.style).toEqual({ flex: 1 });
    
    expect(mockConsoleInfo).not.toHaveBeenCalledWith("Waiting for Vercel shell to load...");
  });

  it('Process handlers when INIT_VERCEL_SHELL message is received', () => {
    jest.spyOn(React, 'useState')
        .mockImplementationOnce(() => [null, jest.fn()])
        .mockImplementationOnce(() => [true, jest.fn()])
        .mockImplementationOnce(() => [{}, jest.fn()])
        .mockImplementationOnce(() => [[['load', jest.fn()]], jest.fn()])
        .mockImplementationOnce(() => [true, jest.fn()]);

    const onLoadHandler = jest.fn();

    render(
      <BaseEmbed 
        typeofEmbed="test" 
        embedType="testEmbed"
        onLoad={onLoadHandler}
      />
    );
    
    const webViewProps = require('react-native-webview').WebView.mock.calls[0][0];
    
    act(() => {
      webViewProps.onMessage({
        nativeEvent: {
          data: JSON.stringify({ type: MSG_TYPE.INIT_VERCEL_SHELL })
        }
      });
    });
    
    expect(mockRegisterEmbedEvent).toHaveBeenCalledWith(
        EmbedEvent.Load, expect.any(Function)
      );
    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: MSG_TYPE.INIT })
    );
  });

  it('Populates pendingHandlers correctly from event props', () => {
    const onLoadHandler = jest.fn();
    const mockSetPendingHandlers = jest.fn();

        jest.spyOn(React, 'useState')
        .mockImplementationOnce(() => [null, jest.fn()])
        .mockImplementationOnce(() => [true, jest.fn()])
        .mockImplementationOnce(() => [{}, jest.fn()])
        .mockImplementationOnce(() => [[], mockSetPendingHandlers])
        .mockImplementationOnce(() => [true, jest.fn()]);


    render(
        <BaseEmbed 
        typeofEmbed="test" 
        embedType="testEmbed"
        onLoad={onLoadHandler}
        />
    );
    
    const webViewProps = require('react-native-webview').WebView.mock.calls[0][0];
    
    act(() => {
        webViewProps.onMessage({
        nativeEvent: {
            data: JSON.stringify({ type: MSG_TYPE.INIT_VERCEL_SHELL })
        }
        });
    });

    expect(mockSetPendingHandlers).toHaveBeenCalled();
  });
  
});

