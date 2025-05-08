import MockAdapter from 'axios-mock-adapter';
import { ACI } from '../src/client';
import { ValidationError } from '../src/exceptions';

describe('ACI Client', () => {
  let client: ACI;
  let mock: MockAdapter;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    client = new ACI({ apiKey: mockApiKey });
    mock = new MockAdapter(client['client']);
  });

  afterEach(() => {
    mock.reset();
  });

  describe('retry functionality', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    afterEach(() => {
      // Clear all timers after each test to prevent interference
      jest.clearAllTimers();
    });

    it('should retry on network errors', async () => {
      mock.onGet('/apps/search').networkErrorOnce();
      mock.onGet('/apps/search').replyOnce(200, { data: 'success' });

      const searchPromise = client.apps.search({});
      await jest.runAllTimersAsync(); // Ensure timers related to retry delays are processed
      const result = await searchPromise;

      expect(mock.history.get.length).toBe(2);
      expect(mock.history.get[0].url).toBe('/apps/search');
      expect(mock.history.get[1].url).toBe('/apps/search');
      expect(result).toEqual({ data: 'success' });
    });

    it('should retry on 429 status code', async () => {
      let attemptCount = 0;
      mock.onGet('/apps/search').reply(() => {
        attemptCount++;
        if (attemptCount === 1) {
          return [429, { message: 'Rate limit exceeded' }];
        }
        return [200, { data: 'success' }];
      });

      const searchPromise = client.apps.search({});
      await jest.runAllTimersAsync();
      const result = await searchPromise;

      expect(mock.history.get.length).toBe(2);
      expect(mock.history.get[0].url).toBe('/apps/search');
      expect(mock.history.get[1].url).toBe('/apps/search');
      expect(result).toEqual({ data: 'success' });
    });

    it('should retry on 5xx status codes', async () => {
      let attemptCount = 0;
      mock.onGet('/apps/search').reply(() => {
        attemptCount++;
        if (attemptCount === 1) {
          return [500, { message: 'Internal server error' }];
        }
        return [200, { data: 'success' }];
      });

      const searchPromise = client.apps.search({});
      await jest.runAllTimersAsync();
      const result = await searchPromise;

      expect(mock.history.get.length).toBe(2);
      expect(mock.history.get[0].url).toBe('/apps/search');
      expect(mock.history.get[1].url).toBe('/apps/search');
      expect(result).toEqual({ data: 'success' });
    });

    it('should not retry on 4xx status codes (except 429)', async () => {
      mock.onGet('/apps/search').reply(400, { message: 'Bad request' });

      const searchPromise = client.apps.search({});
      // No timers expected to run here as no retry should occur
      await expect(searchPromise).rejects.toThrow(ValidationError);
      expect(mock.history.get.length).toBe(1);
      expect(mock.history.get[0].url).toBe('/apps/search');
    });
  });
});
