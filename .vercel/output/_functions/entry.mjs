import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CFX1pa8B.mjs';
import { manifest } from './manifest_y2BpVJjW.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin.astro.mjs');
const _page2 = () => import('./pages/api/webhooks/booking.astro.mjs');
const _page3 = () => import('./pages/contacts.astro.mjs');
const _page4 = () => import('./pages/gallery.astro.mjs');
const _page5 = () => import('./pages/masters.astro.mjs');
const _page6 = () => import('./pages/privacy.astro.mjs');
const _page7 = () => import('./pages/services.astro.mjs');
const _page8 = () => import('./pages/social.astro.mjs');
const _page9 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin.astro", _page1],
    ["src/pages/api/webhooks/booking.ts", _page2],
    ["src/pages/contacts.astro", _page3],
    ["src/pages/gallery.astro", _page4],
    ["src/pages/masters.astro", _page5],
    ["src/pages/privacy.astro", _page6],
    ["src/pages/services.astro", _page7],
    ["src/pages/social.astro", _page8],
    ["src/pages/index.astro", _page9]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "2f0e16c8-0a95-4690-882e-4e69f968d96a",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
