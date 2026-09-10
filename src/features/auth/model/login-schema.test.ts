import { describe, expect, it } from 'vitest';
import { loginSchema } from './login-schema';

describe('loginSchema', () => {
  it.each(['', 'foo', 'foo@'])('rejects an invalid email (%s)', (email) => {
    const result = loginSchema.safeParse({ email, password: '1234567' });
    expect(result.success).toBe(false);
  });

  it('rejects a password with exactly 6 characters', () => {
    const result = loginSchema.safeParse({ email: 'a@a.com', password: '123456' });
    expect(result.success).toBe(false);
  });

  it('accepts a password with 7 characters', () => {
    const result = loginSchema.safeParse({ email: 'a@a.com', password: '1234567' });
    expect(result.success).toBe(true);
  });

  it('does not throw for a valid combination', () => {
    expect(() => loginSchema.parse({ email: 'a@a.com', password: '1234567' })).not.toThrow();
  });
});
