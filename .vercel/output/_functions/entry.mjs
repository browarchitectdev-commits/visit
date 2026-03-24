import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_C0Ix4kUh.mjs';
import { manifest } from './manifest_96-cNx1w.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/webhooks/booking.astro.mjs');
const _page2 = () => import('./pages/contacts.astro.mjs');
const _page3 = () => import('./pages/gallery.astro.mjs');
const _page4 = () => import('./pages/masters.astro.mjs');
const _page5 = () => import('./pages/privacy.astro.mjs');
const _page6 = () => import('./pages/services.astro.mjs');
const _page7 = () => import('./pages/social.astro.mjs');
const _page8 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/webhooks/booking.ts", _page1],
    ["src/pages/contacts.astro", _page2],
    ["src/pages/gallery.astro", _page3],
    ["src/pages/masters.astro", _page4],
    ["src/pages/privacy.astro", _page5],
    ["src/pages/services.astro", _page6],
    ["src/pages/social.astro", _page7],
    ["src/pages/index.astro", _page8]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "48d5cc06-761c-4233-85d8-5f33d1cc10e3",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
