import { describe, it, expect } from 'vite-plus/test';
import { assertSafeExternalUrl, isPrivateIpAddress, normalizeExternalHttpUrl } from './url-safety';

describe('normalizeExternalHttpUrl', () => {
  it('defaults schemeless domains to HTTPS', () => {
    expect(normalizeExternalHttpUrl('example.com/path').href).toBe('https://example.com/path');
  });

  it('rejects unsupported protocols', () => {
    expect(() => normalizeExternalHttpUrl('file:///etc/passwd')).toThrow(/HTTP and HTTPS/);
  });

  it('rejects embedded credentials', () => {
    expect(() => normalizeExternalHttpUrl('https://user:pass@example.com')).toThrow(/credentials/);
  });
});

describe('isPrivateIpAddress', () => {
  it('detects private and local IPv4 ranges', () => {
    expect(isPrivateIpAddress('127.0.0.1')).toBe(true);
    expect(isPrivateIpAddress('10.1.2.3')).toBe(true);
    expect(isPrivateIpAddress('172.16.0.1')).toBe(true);
    expect(isPrivateIpAddress('192.168.1.1')).toBe(true);
    expect(isPrivateIpAddress('169.254.169.254')).toBe(true);
  });

  it('allows public IPv4 addresses', () => {
    expect(isPrivateIpAddress('8.8.8.8')).toBe(false);
  });

  it('detects local and unique-local IPv6 ranges', () => {
    expect(isPrivateIpAddress('::1')).toBe(true);
    expect(isPrivateIpAddress('fd00::1')).toBe(true);
    expect(isPrivateIpAddress('fe80::1')).toBe(true);
  });
});

describe('assertSafeExternalUrl', () => {
  it('rejects localhost without DNS lookup', async () => {
    await expect(assertSafeExternalUrl('http://localhost')).rejects.toThrow(/Local hostnames/);
  });

  it('rejects private IP literals', async () => {
    await expect(assertSafeExternalUrl('http://127.0.0.1')).rejects.toThrow(/Private IP/);
  });
});
