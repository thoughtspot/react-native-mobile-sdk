import { EmbedBridge, EmbedMessage } from './event-bridge';
import { MSG_TYPE } from './constants';

const mockInjectJavaScript = jest.fn();
const mockWebViewRef = {
  current: {
    injectJavaScript: mockInjectJavaScript
  }
};

jest.mock('./init', () => ({
  authFunctionCache: jest.fn().mockResolvedValue('mock-auth-token')
}));

describe('EmbedBridge', () => {
  let eventBridge: EmbedBridge;

  beforeEach(() => {
    jest.clearAllMocks();
    eventBridge = new EmbedBridge(mockWebViewRef as any);
  });

  it('should initialize with empty events and pendingReplies', () => {
    expect(eventBridge['events']).toEqual({});
    expect(eventBridge['pendingReplies']).toEqual({});
  });

  it('should register event handlers', () => {
    const callback = jest.fn();
    eventBridge.registerEmbedEvent('testEvent', callback);
    
    expect(eventBridge['events']['testEvent']).toEqual([callback]);
    
    const callback2 = jest.fn();
    eventBridge.registerEmbedEvent('testEvent', callback2);
    
    expect(eventBridge['events']['testEvent']).toEqual([callback, callback2]);
  });

  it('should trigger event and return promise', async () => {
    const spy = jest.spyOn(eventBridge, 'sendMessage');
    const eventPromise = eventBridge.trigger('testEvent', { test: true });
    
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      type: MSG_TYPE.HOST_EVENT,
      eventName: 'testEvent',
      payload: { test: true }
    }));
    
    const eventId = spy.mock.calls[0][0].eventId;
    eventBridge.handleMessage({
      type: MSG_TYPE.HOST_EVENT_REPLY,
      eventId,
      payload: { success: true }
    });
    
    const result = await eventPromise;
    expect(result).toEqual({ success: true });
  });

  it('should handle REQUEST_AUTH_TOKEN message', async () => {
    const spy = jest.spyOn(eventBridge, 'sendMessage');
    
    eventBridge.handleMessage({ type: MSG_TYPE.REQUEST_AUTH_TOKEN });
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(spy).toHaveBeenCalledWith({
      type: MSG_TYPE.AUTH_TOKEN_RESPONSE,
      token: 'mock-auth-token'
    });
  });

  it('should handle EMBED_EVENT without responder', () => {
    const handler = jest.fn();
    eventBridge.registerEmbedEvent('testEvent', handler);
    
    eventBridge.handleMessage({
      type: MSG_TYPE.EMBED_EVENT,
      eventName: 'testEvent',
      payload: { data: 'test' }
    });
    
    expect(handler).toHaveBeenCalledWith({ data: 'test' });
  });

  it('should handle EMBED_EVENT with responder', () => {
    const handler = jest.fn((data, respond) => {
      respond({ response: 'test' });
    });
    
    eventBridge.registerEmbedEvent('testEvent', handler);
    
    const spy = jest.spyOn(eventBridge, 'sendMessage');
    
    eventBridge.handleMessage({
      type: MSG_TYPE.EMBED_EVENT,
      eventName: 'testEvent',
      payload: { data: 'test' },
      eventId: 'test-id',
      hasResponder: true
    });
    
    expect(handler).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith({
      type: MSG_TYPE.EMBED_EVENT_REPLY,
      eventId: 'test-id',
      payload: { response: 'test' }
    });
  });

  it('should handle HOST_EVENT_REPLY message', () => {
    const resolver = jest.fn();
    eventBridge['pendingReplies']['test-id'] = resolver;
    
    eventBridge.handleMessage({
      type: MSG_TYPE.HOST_EVENT_REPLY,
      eventId: 'test-id',
      payload: { success: true }
    });
    
    expect(resolver).toHaveBeenCalledWith({ success: true });
    expect(eventBridge['pendingReplies']).not.toHaveProperty('test-id');
  });

  it('should handle unknown message type', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    eventBridge.handleMessage({
      type: 'UNKNOWN_TYPE' as any
    });
    
    expect(consoleSpy).toHaveBeenCalledWith(
      "Type of the message is unknown from the Shell app", 
      'UNKNOWN_TYPE'
    );
    
    consoleSpy.mockRestore();
  });

  it('should send message by injecting JavaScript', () => {
    const message: EmbedMessage = {
      type: MSG_TYPE.INIT,
      payload: { test: true }
    };
    
    eventBridge.sendMessage(message);
    
    const expectedJs = `window.postMessage(${JSON.stringify(message)}, "*");true;`;
    expect(mockInjectJavaScript).toHaveBeenCalledWith(expectedJs);
  });

  it('should return undefined when trigger is called without webViewRef', async () => {
    const emptyBridge = new EmbedBridge(null);
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const result = await emptyBridge.trigger('testEvent');
    
    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith("webview is not ready for host event");
    
    consoleSpy.mockRestore();
  });

  it('should destroy and clear all references', () => {
    eventBridge.registerEmbedEvent('testEvent', jest.fn());
    eventBridge['pendingReplies']['test-id'] = jest.fn();
    
    eventBridge.destroy();
    
    expect(eventBridge['events']).toEqual({});
    expect(eventBridge['pendingReplies']).toEqual({});
    expect(eventBridge['webViewRef']).toBeNull();
  });
}); 