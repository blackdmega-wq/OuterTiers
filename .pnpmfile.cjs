// .pnpmfile.cjs
// Strips esbuild's postinstall so pnpm never blocks it.
// esbuild >=0.21 loads its binary from @esbuild/<platform> at runtime
// so the postinstall is not needed for the binary to work.
function readPackage(pkg) {
  if (pkg.name === 'esbuild') {
    delete pkg.scripts;
  }
  return pkg;
}

module.exports = { hooks: { readPackage } };
