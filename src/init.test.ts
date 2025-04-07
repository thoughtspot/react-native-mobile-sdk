import { init, embedConfigCache, authFunctionCache } from './init';
import { AuthType } from './types';

beforeEach(() => {
  (global as any).embedConfigCache = null;
  (global as any).authFunctionCache = null;
});

describe('init', () => {
  it('should store the embed config and auth function in cache', () => {
    const mockAuthFn = jest.fn().mockResolvedValue('test-token');
    const config = {
      thoughtSpotHost: 'testhost',
      authType: AuthType.TrustedAuthTokenCookieless,
      getAuthToken: mockAuthFn,
    };

    init(config);

    expect(embedConfigCache).toEqual({
      ...config,
      getTokenFromSDK: true,
    });
    expect(authFunctionCache).toBe(mockAuthFn);
  });

  it('should set getTokenFromSDK flag to true', () => {
    const config = {
        thoughtSpotHost: 'testhost',
        authType: AuthType.None,
    };
    init(config);
    expect(embedConfigCache?.getTokenFromSDK).toBe(true);
  });
});
