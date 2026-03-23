import 'piccolore';
import { k as decodeKey } from './chunks/astro/server_Cfxm_v33.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_BaHdN416.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///D:/Programming/Projects/Site-1/visit/","cacheDir":"file:///D:/Programming/Projects/Site-1/visit/node_modules/.astro/","outDir":"file:///D:/Programming/Projects/Site-1/visit/dist/","srcDir":"file:///D:/Programming/Projects/Site-1/visit/src/","publicDir":"file:///D:/Programming/Projects/Site-1/visit/public/","buildClientDir":"file:///D:/Programming/Projects/Site-1/visit/dist/client/","buildServerDir":"file:///D:/Programming/Projects/Site-1/visit/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"contacts/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/contacts","isIndex":false,"type":"page","pattern":"^\\/contacts\\/?$","segments":[[{"content":"contacts","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/contacts.astro","pathname":"/contacts","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"gallery/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/gallery","isIndex":false,"type":"page","pattern":"^\\/gallery\\/?$","segments":[[{"content":"gallery","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/gallery.astro","pathname":"/gallery","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"masters/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/masters","isIndex":false,"type":"page","pattern":"^\\/masters\\/?$","segments":[[{"content":"masters","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/masters.astro","pathname":"/masters","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"privacy/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/privacy","isIndex":false,"type":"page","pattern":"^\\/privacy\\/?$","segments":[[{"content":"privacy","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/privacy.astro","pathname":"/privacy","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"services/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/services","isIndex":false,"type":"page","pattern":"^\\/services\\/?$","segments":[[{"content":"services","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/services.astro","pathname":"/services","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"social/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/social","isIndex":false,"type":"page","pattern":"^\\/social\\/?$","segments":[[{"content":"social","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/social.astro","pathname":"/social","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/webhooks/booking","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/webhooks\\/booking\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"webhooks","dynamic":false,"spread":false}],[{"content":"booking","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/webhooks/booking.ts","pathname":"/api/webhooks/booking","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://your-beauty-salon.com","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["D:/Programming/Projects/Site-1/visit/src/pages/gallery.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/gallery@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["D:/Programming/Projects/Site-1/visit/src/pages/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/index@_@astro",{"propagation":"in-tree","containsHead":false}],["D:/Programming/Projects/Site-1/visit/src/pages/masters.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/masters@_@astro",{"propagation":"in-tree","containsHead":false}],["D:/Programming/Projects/Site-1/visit/src/pages/services.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/services@_@astro",{"propagation":"in-tree","containsHead":false}],["D:/Programming/Projects/Site-1/visit/src/pages/social.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/social@_@astro",{"propagation":"in-tree","containsHead":false}],["D:/Programming/Projects/Site-1/visit/src/pages/contacts.astro",{"propagation":"none","containsHead":true}],["D:/Programming/Projects/Site-1/visit/src/pages/privacy.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/api/webhooks/booking@_@ts":"pages/api/webhooks/booking.astro.mjs","\u0000@astro-page:src/pages/contacts@_@astro":"pages/contacts.astro.mjs","\u0000@astro-page:src/pages/gallery@_@astro":"pages/gallery.astro.mjs","\u0000@astro-page:src/pages/masters@_@astro":"pages/masters.astro.mjs","\u0000@astro-page:src/pages/privacy@_@astro":"pages/privacy.astro.mjs","\u0000@astro-page:src/pages/services@_@astro":"pages/services.astro.mjs","\u0000@astro-page:src/pages/social@_@astro":"pages/social.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_DXveWvQr.mjs","D:/Programming/Projects/Site-1/visit/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_C5aRG0kq.mjs","D:\\Programming\\Projects\\Site-1\\visit\\.astro\\content-assets.mjs":"chunks/content-assets_DleWbedO.mjs","D:\\Programming\\Projects\\Site-1\\visit\\.astro\\content-modules.mjs":"chunks/content-modules_Dz-S_Wwv.mjs","\u0000astro:data-layer-content":"chunks/_astro_data-layer-content_DurL20CF.mjs","@/react/SiteHeader":"_astro/SiteHeader.rxOHsw4Z.js","@/react/SiteFooter":"_astro/SiteFooter.hcdv6d2A.js","@/react/HeroSection":"_astro/HeroSection.B8se-9hc.js","@/react/StatsSection":"_astro/StatsSection.CoMzXAHp.js","@/react/AboutSection":"_astro/AboutSection.CwKdQxxI.js","@/react/ServicesList":"_astro/ServicesList.BIMviKYr.js","@/react/MastersList":"_astro/MastersList.BCpKIOx1.js","@/react/GallerySection":"_astro/GallerySection.CcOpoY25.js","@astrojs/react/client.js":"_astro/client.Bk2yuRBg.js","D:/Programming/Projects/Site-1/visit/src/pages/gallery.astro?astro&type=script&index=0&lang.ts":"_astro/gallery.astro_astro_type_script_index_0_lang.gz_W0Z6q.js","D:/Programming/Projects/Site-1/visit/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts":"_astro/Layout.astro_astro_type_script_index_0_lang.Hv_t4uxf.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["D:/Programming/Projects/Site-1/visit/src/pages/gallery.astro?astro&type=script&index=0&lang.ts","document.addEventListener(\"DOMContentLoaded\",()=>{const a=document.querySelectorAll(\".filter-btn\"),l=document.querySelectorAll(\".gallery-item\");a.forEach(t=>{t.addEventListener(\"click\",()=>{const c=t.getAttribute(\"data-filter\");a.forEach(e=>e.classList.remove(\"active\")),t.classList.add(\"active\"),l.forEach(e=>{const r=e.getAttribute(\"data-category\");c===\"all\"||r===c?e.classList.remove(\"hidden\"):e.classList.add(\"hidden\")})})})});"],["D:/Programming/Projects/Site-1/visit/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts","(function(){function n(){var o=document.querySelectorAll(\"[data-reveal]\");if(o.length){var i=new IntersectionObserver(function(e){e.forEach(function(t){t.isIntersecting&&(t.target.classList.add(\"is-visible\"),i.unobserve(t.target))})},{threshold:.07,rootMargin:\"0px 0px -40px 0px\"});o.forEach(function(e){i.observe(e)})}}document.readyState===\"loading\"?document.addEventListener(\"DOMContentLoaded\",n):n()})();"]],"assets":["/_astro/contacts.BhfDTcmz.css","/favicon.svg","/og-default.jpg","/admin/index.html","/images/about.jpg","/images/director.jpg","/images/gallery-1.jpg","/images/gallery-2.jpg","/images/gallery-3.jpg","/images/gallery-4.jpg","/images/gallery-5.jpg","/images/gallery-6.jpg","/images/hero.jpg","/images/README.md","/_astro/AboutSection.CwKdQxxI.js","/_astro/client.Bk2yuRBg.js","/_astro/GallerySection.CcOpoY25.js","/_astro/HeroSection.B8se-9hc.js","/_astro/index.Cs-REvGi.js","/_astro/index.yBjzXJbu.js","/_astro/jsx-runtime.D3GSbgeI.js","/_astro/MastersList.BCpKIOx1.js","/_astro/ServicesList.BIMviKYr.js","/_astro/SiteFooter.hcdv6d2A.js","/_astro/SiteHeader.rxOHsw4Z.js","/_astro/StatsSection.CoMzXAHp.js","/admin/assets/brace-fold.es-f2e3735d.js","/admin/assets/closebrackets.es-e969742b.js","/admin/assets/codemirror.es-52e8b92d.js","/admin/assets/codemirror.es2-5884f31a.js","/admin/assets/comment.es-39699bae.js","/admin/assets/dialog.es-dffe62e7.js","/admin/assets/dialog.es2-02b3b4e7.js","/admin/assets/foldgutter.es-b6cee46a.js","/admin/assets/forEachState.es-b2033c2b.js","/admin/assets/hint.es-5c84ccf5.js","/admin/assets/hint.es2-9365d412.js","/admin/assets/index-37a2ed40.js","/admin/assets/index-75ebd2e6.js","/admin/assets/index-946138f4.css","/admin/assets/info-addon.es-c9b2027b.js","/admin/assets/info.es-5310186e.js","/admin/assets/javascript.es-3c6957c5.js","/admin/assets/jump-to-line.es-d901ea33.js","/admin/assets/jump.es-6113c6b1.js","/admin/assets/lint.es-fe7166bb.js","/admin/assets/lint.es2-ac868f08.js","/admin/assets/lint.es3-126cb7e3.js","/admin/assets/matchbrackets.es-97d2e827.js","/admin/assets/matchbrackets.es2-f53f57e6.js","/admin/assets/mode-indent.es-057a4f6a.js","/admin/assets/mode.es-65b90817.js","/admin/assets/mode.es2-49e15fe3.js","/admin/assets/mode.es3-bf8c63e3.js","/admin/assets/SchemaReference.es-e37a5dd1.js","/admin/assets/search.es-1c15f5ea.js","/admin/assets/searchcursor.es-b1a352a2.js","/admin/assets/searchcursor.es2-cbfe7cae.js","/admin/assets/show-hint.es-b981493e.js","/admin/assets/sublime.es-e2a3eb60.js","/uploads/1774291562757-qk99ju-images-1.jpg","/uploads/1774291573125-faiuw0-tatuazh-gub-ombre-foto-do-i-posle.jpg","/uploads/3.png","/uploads/brows-after.jpg","/uploads/image6.jpg","/uploads/images.jpg","/uploads/Non solo sopracciglia – è arte sul tuo viso ✨📍Brow design • Labbra soft • Eyeliner definito.jpg","/uploads/service-image.png","/uploads/unnamed (1).jpg","/contacts/index.html","/gallery/index.html","/masters/index.html","/privacy/index.html","/services/index.html","/social/index.html","/index.html"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"actionBodySizeLimit":1048576,"serverIslandNameMap":[],"key":"6LVvbF3IEvWZeMhOLoNRajQhuUdl/8cFC2VErGnmPP0="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
