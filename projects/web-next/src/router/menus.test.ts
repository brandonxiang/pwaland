import { describe, expect, it } from 'vite-plus/test';
import { dataRoutes } from './menus';

describe('dataRoutes', () => {
  it('does not include deprecated categories and about routes', () => {
    const paths = dataRoutes.map((route) => route.path);

    expect(paths).not.toContain('/categories');
    expect(paths).not.toContain('/about');
  });
});
