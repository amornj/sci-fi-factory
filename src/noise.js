import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';

export const simplex = new SimplexNoise();

const _heightCache = new Map();
const _HEIGHT_CACHE_MAX = 32768;

export function getTerrainHeight(x, z) {
  const gx = Math.round(x);
  const gz = Math.round(z);
  const key = gx * 100003 + gz;
  const cached = _heightCache.get(key);
  if (cached !== undefined) return cached;

  let h = 0;
  h += simplex.noise(gx * 0.003, gz * 0.003) * 40;
  h += simplex.noise(gx * 0.008, gz * 0.008) * 20;
  h += simplex.noise(gx * 0.02, gz * 0.02) * 8;
  h += simplex.noise(gx * 0.06, gz * 0.06) * 3;
  const dist = Math.sqrt(gx * gx + gz * gz);
  if (dist < 40) h *= dist / 40;

  if (_heightCache.size >= _HEIGHT_CACHE_MAX) {
    const first = _heightCache.keys().next().value;
    _heightCache.delete(first);
  }
  _heightCache.set(key, h);
  return h;
}
