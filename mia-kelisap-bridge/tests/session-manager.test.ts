import { describe, it, expect } from 'vitest';

describe('SessionManager', () => {
  it('should return disconnected for unknown user', async () => {
    const { sessionManager } = await import('../src/services/session-manager.js');
    const status = sessionManager.getStatus('unknown-user');
    expect(status.status).toBe('disconnected');
    expect(status.userId).toBe('unknown-user');
  });
});
