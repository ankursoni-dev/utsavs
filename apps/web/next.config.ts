import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  // Standalone output bundles only what's required at runtime — the production
  // Docker image copies `.next/standalone` and runs `node apps/web/server.js`.
  output: 'standalone',
  // In a pnpm monorepo, the file tracer needs the workspace root to follow
  // workspace deps (e.g. @repo/shared-types) into the standalone bundle.
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // Typed routes are useful for navigation primitives in the design system.
  typedRoutes: true,
};

export default nextConfig;
