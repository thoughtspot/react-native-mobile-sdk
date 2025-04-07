import { renderHook } from '@testing-library/react-native';
import { useLiveboardRef } from './useLiveboardRef';

describe('useLiveboardRef', () => {
  it('should return a ref object initialized with null', () => {
    const { result } = renderHook(() => useLiveboardRef());
    expect(result.current).toHaveProperty('current');
    expect(result.current.current).toBeNull();
  });
  
  it('should maintain the same ref object between renders', () => {
    const { result, rerender } = renderHook(() => useLiveboardRef());
    const initialRef = result.current;
    rerender({});
    expect(result.current).toBe(initialRef);
  });
  
  it('should be mutable like a normal ref', () => {
    const { result } = renderHook(() => useLiveboardRef());
    const mockValue = { trigger: jest.fn() };
    result.current.current = mockValue;
    expect(result.current.current).toBe(mockValue);
  });
}); 