import * as esbuild from 'esbuild';
import fs from 'node:fs/promises';

// This pacth the produced file. Indeed, the @serenity-kit/opaque dependy use WASM and some function insed use new Function inside.
// This is not allowed in CSP and will break the app. So we replace it with a function that return globalThis instead.
// When upgrading @serenity-kit/opaque, we must check if this patch is still needed and work properly.
const fixNewFunctionPostBuildPlugin = {
  name: 'fix-new-function-post-build',
  setup(build) {
    build.onEnd(async (result) => {
      if (result.errors.length > 0) return;

      const outfile = build.initialOptions.outfile || 'dist/index.js';
      
      try {
        let contents = await fs.readFile(outfile, 'utf8');
        if (contents.includes('new Function')) {
          contents = contents.replace(
            /new\s+Function\s*\([^;]*\)/g,
            'function() { return globalThis; }'
          );
          await fs.writeFile(outfile, contents, 'utf8');
          console.log('[Bulwark CSP Compliance] "new Function()" removed from the bundle for CSP compliance.');
        } else {
          console.log('[Bulwark CSP Compliance] no "new Function()" found in the bundle.');
        }
      } catch (err) {
        console.error('[Bulwark CSP Compliance] Error while cleaning the bundle :', err);
      }
    });
  },
};

const options = {
  entryPoints: ['./src/index.tsx'],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  charset: 'utf8',
  outfile: 'dist/index.js',
  external: [
    'react',
    'react-dom',
    'react-dom/client',
    'react/jsx-runtime',
    '@plugin-host',
  ],
  plugins: [fixNewFunctionPostBuildPlugin],
};

if (process.argv.includes('--watch')) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(options);
}