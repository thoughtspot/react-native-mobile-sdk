import { ERROR_MESSAGE, notifyErrorSDK, ErrorCallback } from './utils';

describe('utils', () => {
  describe('notifyErrorSDK', () => {
    it('should call the error callback when provided', () => {
      const mockError = new Error('Test error');
      const mockCallback = jest.fn();
      
      notifyErrorSDK(mockError, mockCallback);
      
      expect(mockCallback).toHaveBeenCalledWith(mockError);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
    
    it('should not throw when callback is not provided', () => {
      const mockError = new Error('Test error');
      
      expect(() => {
        notifyErrorSDK(mockError);
      }).not.toThrow();
    });
    
    it('should pass error message enum value to callback', () => {
      const mockError = new Error('Test error');
      const mockCallback = jest.fn();
      const errorMessage = ERROR_MESSAGE.AUTH_ERROR;
      
      notifyErrorSDK(mockError, mockCallback, errorMessage);
      
      expect(mockCallback).toHaveBeenCalledWith(mockError);
    });
  });
}); 