import { createFileRoute } from "@tanstack/react-router";

const ORIGIN = "https://studystark.testwave.cc";
const EXTERNAL_PROXY_PREFIX = "/api/proxy/__external/";
const ALLOWED_EXTERNAL_HOSTS = new Set(["vidcloud.eu.org", "vidyarays.com", "studystark.testwave.cc"]);
const NEW_TELEGRAM = "https://t.me/+SvWSdC034SVkN2U1";
const NEW_TELEGRAM_B64 = "aHR0cHM6Ly90Lm1lLytTdldTZEMwMzRTVmtOMlUx";
const OLD_TELEGRAM_B64 = "aHR0cHM6Ly90Lm1lL3N0dWR5c3Rhcms=";
const NEW_WHATSAPP = "https://whatsapp.com/channel/0029VbCbDOt0VycLRqoBz82x";
const NEW_SUPPORT = "https://t.me/Pw_studynetwork_bot";
const NEW_KEYGEN_LINK = "https://t.me/c/3927989728/114";
const NEW_LOGO = "/__l5e/assets-v1/ad4dfabf-85aa-4544-a0aa-a41bc4d727a1/pw-logo.jpg";
const EXTERNAL_LOGO = "http://pwstudynetwork.freepage.cc/logo.png";
const MAINTENANCE_URL = "http://pwstudynetwork.freepage.cc/maintenance/";
const BRAND_NAME = "Pw Study Network";
const VIDYARAYS_SESSION_COOKIE = "PWSN_VIDYARAYS_PHPSESSID";

function toProxyPath(value: string, base = ORIGIN) {
  try {
    const parsed = new URL(value, base);
    if (parsed.origin === ORIGIN) {
      return `/api/proxy/${parsed.pathname.replace(/^\/+/, "")}${parsed.search}${parsed.hash}`;
    }
    if (ALLOWED_EXTERNAL_HOSTS.has(parsed.hostname)) {
      return `${EXTERNAL_PROXY_PREFIX}${parsed.hostname}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    return value;
  } catch {
    return value;
  }
}

function resolveTarget(requestUrl: URL, splat: string) {
  const normalizedSplat = requestUrl.pathname.endsWith("/") && splat && !splat.endsWith("/") ? `${splat}/` : splat;

  if (splat.startsWith("__external/")) {
    const rest = normalizedSplat.slice("__external/".length);
    const slashIndex = rest.indexOf("/");
    const host = slashIndex === -1 ? rest : rest.slice(0, slashIndex);
    const path = slashIndex === -1 ? "/" : `/${rest.slice(slashIndex + 1)}`;

    if (!ALLOWED_EXTERNAL_HOSTS.has(host)) {
      return null;
    }

    return new URL(`https://${host}${path}${requestUrl.search}`);
  }

  return new URL(`${ORIGIN}/${normalizedSplat}${requestUrl.search}`);
}

function rewriteRequestCookieHeader(cookie: string, targetHost: string) {
  const cookies = cookie
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const eq = part.indexOf("=");
      return eq === -1 ? [part, ""] : [part.slice(0, eq), part.slice(eq + 1)];
    });

  if (targetHost === "vidyarays.com") {
    return cookies
      .flatMap(([name, value]) => {
        if (name === "PHPSESSID") return [];
        if (name === VIDYARAYS_SESSION_COOKIE) return [`PHPSESSID=${value}`];
        return [`${name}=${value}`];
      })
      .join("; ");
  }

  return cookies
    .flatMap(([name, value]) => (name === VIDYARAYS_SESSION_COOKIE ? [] : [`${name}=${value}`]))
    .join("; ");
}

function rewriteSetCookieHeader(setCookie: string, targetHost: string) {
  let rewritten = setCookie
    .replace(/^PHPSESSID=/i, targetHost === "vidyarays.com" ? `${VIDYARAYS_SESSION_COOKIE}=` : "PHPSESSID=")
    .replace(/;\s*secure/gi, "")
    .replace(/;\s*domain=[^;]*/gi, "")
    .replace(/;\s*samesite=none/gi, "; SameSite=Lax");

  if (!/;\s*samesite=/i.test(rewritten)) {
    rewritten += "; SameSite=Lax";
  }

  if (targetHost !== "vidyarays.com" && /^PHPSESSID=/i.test(rewritten) && !/;\s*httponly/i.test(rewritten)) {
    rewritten += "; HttpOnly";
  }

  return rewritten;
}

async function handle(request: Request, splat: string) {
  const url = new URL(request.url);
  const targetUrl = resolveTarget(url, splat);
  if (!targetUrl) {
    return new Response("Unsupported proxy target", { status: 400 });
  }
  if (/\/(?:images\/)?(?:logo|favicon|apple-touch-icon|android-chrome|mstile)[^/]*\.(?:png|jpe?g|webp|svg|ico)$/i.test(targetUrl.pathname)) {
    return Response.redirect(new URL(NEW_LOGO, url.origin).toString(), 302);
  }
  const target = targetUrl.toString();

  const headers = new Headers();
  headers.set(
    "user-agent",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  );
  headers.set("accept", request.headers.get("accept") ?? "*/*");
  headers.set("accept-language", "en-US,en;q=0.9");
  const requestPath = targetUrl.pathname || "/";
  const requestDir = requestPath.endsWith("/") ? requestPath : requestPath.replace(/\/[^/]*$/, "/");
  const incomingReferer = request.headers.get("referer") ?? "";
  headers.set(
    "referer",
    targetUrl.hostname === "vidyarays.com"
      ? "https://www.google.com/search?q=VidyaRays"
      : incomingReferer.includes("/api/proxy/__external/vidyarays.com")
        ? "https://vidyarays.com/"
      : `${ORIGIN}${requestDir}`,
  );
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", rewriteRequestCookieHeader(cookie, targetUrl.hostname));
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const range = request.headers.get("range");
  if (range) headers.set("range", range);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetch(target, init);
  const ct = upstream.headers.get("content-type") ?? "";

  const respHeaders = new Headers();
  for (const [k, v] of upstream.headers.entries()) {
    const lk = k.toLowerCase();
    if (
      lk === "content-security-policy" ||
      lk === "content-security-policy-report-only" ||
      lk === "x-frame-options" ||
      lk === "content-encoding" ||
      lk === "content-length" ||
      lk === "transfer-encoding" ||
      lk === "strict-transport-security"
    ) {
      continue;
    }
    if (lk === "set-cookie") {
      respHeaders.append(k, rewriteSetCookieHeader(v, targetUrl.hostname));
      continue;
    }
    respHeaders.set(k, v);
  }

  const location = upstream.headers.get("location");
  if (location && upstream.status >= 300 && upstream.status < 400) {
    respHeaders.set("location", toProxyPath(location, target));
    return new Response(null, { status: upstream.status, headers: respHeaders });
  }

  // Rewrite JS to swap telegram URL
  if (
    ct.includes("javascript") ||
    splat.endsWith(".js") ||
    splat.includes("yaha-ayiye-radhe")
  ) {
    let text = await upstream.text();
    text = text.split(OLD_TELEGRAM_B64).join(NEW_TELEGRAM_B64);
    text = text.split("https://t.me/studystark").join(NEW_TELEGRAM);
    text = text.split("https://vidcloud.eu.org/images/logo.png").join(NEW_LOGO);
    text = text.split("https://studystark.testwave.cc/images/logo.png").join(NEW_LOGO);
    text = text.split("/images/logo.png").join(NEW_LOGO);
    text = text.replace(/(["'`(])images\/logo\.png/gi, `$1${NEW_LOGO}`);
    text = text.replace(/https:\/\/vidyarays\.com\//g, `${EXTERNAL_PROXY_PREFIX}vidyarays.com/`);
    text = text.replace(/https:\/\/vidcloud\.eu\.org\//g, `${EXTERNAL_PROXY_PREFIX}vidcloud.eu.org/`);
    text = text.replace(/https?:\/\/(?:www\.)?youtube\.com\/[^"'\s)]*/gi, NEW_KEYGEN_LINK);
    text = text.replace(/https?:\/\/youtu\.be\/[^"'\s)]*/gi, NEW_KEYGEN_LINK);
    return new Response(text, { status: upstream.status, headers: respHeaders });
  }

  if (ct.includes("application/json") || splat.endsWith("api.php")) {
    let text = await upstream.text();
    text = text.split("https:\\/\\/vidyarays.com\\/").join(`${EXTERNAL_PROXY_PREFIX}vidyarays.com/`);
    text = text.split("https:\\/\\/vidcloud.eu.org\\/").join(`${EXTERNAL_PROXY_PREFIX}vidcloud.eu.org/`);
    text = text.replace(/https:\/\/vidyarays\.com\//g, `${EXTERNAL_PROXY_PREFIX}vidyarays.com/`);
    text = text.replace(/https:\/\/vidcloud\.eu\.org\//g, `${EXTERNAL_PROXY_PREFIX}vidcloud.eu.org/`);
    text = text.replace(/https?:\/\/(?:www\.)?youtube\.com\/[^"'\s)\\]*/gi, NEW_KEYGEN_LINK);
    text = text.replace(/https?:\\?\/\\?\/(?:www\.)?youtube\.com\\?\/[^"'\s)\\]*/gi, NEW_KEYGEN_LINK);
    text = text.replace(/https?:\/\/youtu\.be\/[^"'\s)\\]*/gi, NEW_KEYGEN_LINK);
    return new Response(text, { status: upstream.status, headers: respHeaders });
  }

  // Inject override into HTML as a safety net
  if (ct.includes("text/html") || splat === "" || splat.endsWith(".html")) {
    let html = await upstream.text();
    const upstreamUrl = (() => {
      try {
        return new URL(upstream.url);
      } catch {
        return new URL(`${ORIGIN}/${splat}`);
      }
    })();
    const upstreamOrigin = upstreamUrl.origin;
    const upstreamPath = upstreamUrl.pathname || "/";
    const upstreamDir = upstreamPath.endsWith("/") ? upstreamPath : upstreamPath.replace(/\/[^/]*$/, "/");
    const proxyBaseHref = upstreamOrigin === ORIGIN
      ? `/api/proxy${upstreamDir}`
      : `${EXTERNAL_PROXY_PREFIX}${upstreamUrl.hostname}${upstreamDir}`;
    const htmlBaseHref = proxyBaseHref;
    // Server-side text + logo replacements (covers static pages like
    // /batch-donate/ where the brand is hard-coded in the HTML).
    html = html.replace(/Study\s*Stark/g, BRAND_NAME);
    html = html.replace(/StudyStark/g, "PwStudyNetwork");
    html = html.replace(/VidCloud/g, BRAND_NAME);
    html = html.replace(/Stark\s*\/\s*PW\s*Team/gi, BRAND_NAME);
    html = html.replace(/\bStark\b/g, BRAND_NAME);
    // Google search pages refuse to render in iframes. The key flow sends the
    // user to Google only to open VidyaRays, so keep that step inside the proxy.
    html = html.replace(/https:\/\/www\.google\.com\/search\?q=VidyaRays/g, `${EXTERNAL_PROXY_PREFIX}vidyarays.com/`);
    html = html.split("https:\\/\\/vidyarays.com\\/").join(`${EXTERNAL_PROXY_PREFIX}vidyarays.com/`);
    html = html.split("https:\\/\\/vidcloud.eu.org\\/").join(`${EXTERNAL_PROXY_PREFIX}vidcloud.eu.org/`);
    html = html.split("https://vidcloud.eu.org/images/logo.png").join(NEW_LOGO);
    html = html.split("https://studystark.testwave.cc/images/logo.png").join(NEW_LOGO);
    html = html.split("/images/logo.png").join(NEW_LOGO);
    html = html.replace(/(["'`(])images\/logo\.png/gi, `$1${NEW_LOGO}`);
    html = html.replace(/\b(src|href|srcset)=(['"])([^'"]*(?:logo|favicon|apple-touch-icon|android-chrome|mstile)[^'"]*)\2/gi, (_m, attr, quote, value) => {
      if (String(value).includes(NEW_LOGO)) return `${attr}=${quote}${value}${quote}`;
      return `${attr}=${quote}${NEW_LOGO}${quote}`;
    });
    // Replace YouTube tutorial links (used in key-generation flow) with our Telegram link.
    html = html.replace(/https?:\/\/(?:www\.)?youtube\.com\/[^"'\s<>)]*/gi, NEW_KEYGEN_LINK);
    html = html.replace(/https?:\/\/youtu\.be\/[^"'\s<>)]*/gi, NEW_KEYGEN_LINK);
    // Point vidcloud absolute URLs (e.g. Add Batches) to their external proxy path.
    html = html.replace(/https:\/\/vidcloud\.eu\.org\//g, `${EXTERNAL_PROXY_PREFIX}vidcloud.eu.org/`);
    // Cloudflare Rocket Loader is unavailable inside the proxied iframe; its
    // guard wrappers make inline button handlers no-op and its own script 404s.
    html = html.replace(/<script\s+src=["']\/cdn-cgi\/scripts\/[^"']*rocket-loader\.min\.js["'][\s\S]*?<\/script>/gi, "");
    html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (block) =>
      block.includes("challenge-platform") ? "" : block,
    );
    html = html.replace(/if \(!window\.__cfRLUnblockHandlers\) return false;\s*/g, "");
    html = html.replace(/\sdata-cf-modified-[^=\s]+=("[^"]*"|'[^']*')/gi, "");
    // Root-relative src/href/action values should hit vidcloud via our proxy,
    // not this app directly (which causes 404s).
    html = html.replace(/\b(src|href|action)=(['"])\/(?!\/|__l5e\/|api\/proxy\/|@vite\/|src\/)([^'"]*)\2/gi, (_m, attr, quote, path) => {
      const rewritten = upstreamOrigin === ORIGIN ? `/api/proxy/${path}` : toProxyPath(`${upstreamOrigin}/${path}`);
      return `${attr}=${quote}${rewritten}${quote}`;
    });
    html = html.replace(/\b(src|href|action)=(['"])(https:\/\/vidyarays\.com\/[^'"]*)\2/gi, (_m, attr, quote, absoluteUrl) => {
      return `${attr}=${quote}${toProxyPath(absoluteUrl)}${quote}`;
    });
    html = html.split("window.location.href = 'redirect.php?server_id=' + serverId;").join(
      `window.location.href = '${proxyBaseHref}redirect.php?server_id=' + serverId;`,
    );
    // Replace the inline atom-logo SVG on /batch-donate/ with the new logo image.
    html = html.replace(
      /<div class="logo-shell">[\s\S]*?<\/div>/,
      `<div class="logo-shell" style="overflow:hidden;background:#fff;"><img src="${NEW_LOGO}" alt="${BRAND_NAME}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;"></div>`,
    );
    // Defuse Cloudflare Rocket Loader: it rewrites script type to
    // "<token>-text/javascript" and relies on its loader to execute them.
    // Without the loader, nothing runs. Restore normal script execution.
    html = html.replace(
      /type=(["'])[a-f0-9]{16,}-text\/javascript\1/gi,
      'type="text/javascript"',
    );
    // Neutralize the site's anti-embed / hostname check. The obfuscated app.js
    // wipes the document or calls location.replace('about:blank') when the
    // hostname isn't in its allowlist. Override the dangerous sinks before any
    // other script runs.
    const headInject = `<script>(function(){
      window.__cfRLUnblockHandlers = true;
      // Brand text/URL rewriting intercepted at the lowest DOM level so
      // React/Vue reconcilers can't "fix" it back to the original.
      var BRAND_NAME=${JSON.stringify(BRAND_NAME)};
      var NEW_LOGO_URL=${JSON.stringify(NEW_LOGO)};
      var UPSTREAM_ORIGIN=${JSON.stringify(upstreamOrigin)};
      var EXTERNAL_PROXY_PREFIX=${JSON.stringify(EXTERNAL_PROXY_PREFIX)};
      // Rewrite any logo/favicon URL to our brand logo BEFORE the browser
      // fetches it, so the old logo never flashes.
      function isLogoUrl(u){
        if(!u||typeof u!=='string') return false;
        if(u.indexOf(NEW_LOGO_URL)!==-1) return false;
        return /(logo|favicon|studystark|vidcloud)/i.test(u);
      }
      try{
        var imgSrc=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
        if(imgSrc&&imgSrc.set){
          Object.defineProperty(HTMLImageElement.prototype,'src',{configurable:true,get:imgSrc.get,set:function(v){ return imgSrc.set.call(this, isLogoUrl(v)?NEW_LOGO_URL:v); }});
        }
      }catch(e){}
      try{
        var linkHref=Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype,'href');
        if(linkHref&&linkHref.set){
          Object.defineProperty(HTMLLinkElement.prototype,'href',{configurable:true,get:linkHref.get,set:function(v){
            try{ var rel=(this.getAttribute&&this.getAttribute('rel'))||''; if(/icon/i.test(rel)&&isLogoUrl(v)) return linkHref.set.call(this,NEW_LOGO_URL);}catch(e){}
            return linkHref.set.call(this,v);
          }});
        }
      }catch(e){}
      try{
        var oSetAttr=Element.prototype.setAttribute;
        Element.prototype.setAttribute=function(name,value){
          try{
            var ln=(name||'').toLowerCase();
            if((ln==='src'||ln==='data-src'||ln==='srcset')&&this instanceof HTMLImageElement&&isLogoUrl(value)) return oSetAttr.call(this,name,NEW_LOGO_URL);
            if(ln==='href'&&this instanceof HTMLLinkElement){ var rel=(this.getAttribute&&this.getAttribute('rel'))||''; if(/icon/i.test(rel)&&isLogoUrl(value)) return oSetAttr.call(this,name,NEW_LOGO_URL); }
          }catch(e){}
          return oSetAttr.call(this,name,value);
        };
      }catch(e){}
      // VidyaRays clears every cookie with JS before continuing. In this
      // proxied iframe all sites share localhost, so that also deletes the
      // VidCloud verification session and causes access_denied at verify.php.
      try{
        var cookieDesc=Object.getOwnPropertyDescriptor(Document.prototype,'cookie')||Object.getOwnPropertyDescriptor(HTMLDocument.prototype,'cookie');
        if(cookieDesc&&cookieDesc.set&&cookieDesc.get){
          var protectedCookieNames=['PHPSESSID','vidyays','wppro_steps',${JSON.stringify(VIDYARAYS_SESSION_COOKIE)}];
          Object.defineProperty(document,'cookie',{configurable:true,get:function(){return cookieDesc.get.call(document);},set:function(v){
            try{
              var name=String(v||'').split('=')[0].trim();
              var isDelete=/expires\s*=\s*Thu,\s*01\s*Jan\s*1970/i.test(String(v||''))||/max-age\s*=\s*0/i.test(String(v||''));
              if(isDelete&&protectedCookieNames.indexOf(name)!==-1){ return; }
            }catch(e){}
            return cookieDesc.set.call(document,v);
          }});
        }
      }catch(e){}
      function rewriteStr(s){
        if(typeof s!=='string'||!s) return s;
        if(/Study\\s*Stark/i.test(s)) s=s.replace(/Study\\s*Stark/gi,BRAND_NAME);
        if(/STUDY\\s*STARK/.test(s)) s=s.replace(/STUDY\\s*STARK/g,BRAND_NAME.toUpperCase());
        if(/VidCloud/.test(s)) s=s.replace(/VidCloud/g,BRAND_NAME);
        return s;
      }
      try{
        var cdProto=CharacterData.prototype;
        var nvDesc=Object.getOwnPropertyDescriptor(cdProto,'data')||Object.getOwnPropertyDescriptor(Node.prototype,'nodeValue');
        if(nvDesc&&nvDesc.set){
          var origSet=nvDesc.set;
          Object.defineProperty(cdProto,'data',{configurable:true,get:nvDesc.get,set:function(v){return origSet.call(this,rewriteStr(v));}});
          Object.defineProperty(Node.prototype,'nodeValue',{configurable:true,get:nvDesc.get,set:function(v){return origSet.call(this,rewriteStr(v));}});
        }
      }catch(e){}
      try{
        var tcDesc=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');
        if(tcDesc&&tcDesc.set){
          var oSet=tcDesc.set;
          Object.defineProperty(Node.prototype,'textContent',{configurable:true,get:tcDesc.get,set:function(v){return oSet.call(this,rewriteStr(v));}});
        }
      }catch(e){}
      try{
        var ihDesc=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
        if(ihDesc&&ihDesc.set){
          var oSetIH=ihDesc.set;
          Object.defineProperty(Element.prototype,'innerHTML',{configurable:true,get:ihDesc.get,set:function(v){
            try{ if((this===document.documentElement||this===document.body)&&(v===''||v==null)) return; }catch(e){}
            return oSetIH.call(this,rewriteStr(v));
          }});
        }
      }catch(e){}
      try{
        var oCT=Document.prototype.createTextNode;
        Document.prototype.createTextNode=function(v){ return oCT.call(this,rewriteStr(v)); };
      }catch(e){}
      // Spoof hostname for the embedded site's anti-embed check.
      // The obfuscated app.js compares window.location.hostname.toLowerCase()
      // against an allowlist that includes vidcloud.eu.org / studystark.com,
      // and wipes the page when our localhost / *.lovable.app doesn't match.
      try {
        var oTL = String.prototype.toLowerCase;
        var realHost = (window.location && window.location.hostname) ? oTL.call(window.location.hostname) : '';
        String.prototype.toLowerCase = function(){
          var r = oTL.call(this);
          if (realHost && r === realHost) {
            return 'vidcloud.eu.org';
          }
          return r;
        };
      } catch(e){}
      // Also try to redefine location.hostname / host / origin in case the
      // check reads them as properties directly.
      try {
        var lp = Object.getPrototypeOf(window.location);
        ['hostname','host'].forEach(function(k){
          var d = Object.getOwnPropertyDescriptor(lp, k);
          if (d && d.configurable !== false) {
            Object.defineProperty(lp, k, { configurable:true, get:function(){ return 'vidcloud.eu.org'; }, set:d.set });
          }
        });
        var od = Object.getOwnPropertyDescriptor(lp, 'origin');
        if (od && od.configurable !== false) {
          Object.defineProperty(lp, 'origin', { configurable:true, get:function(){ return 'https://vidcloud.eu.org'; } });
        }
      } catch(e){}
      function isBlank(u){ try { return typeof u==='string' && /about:blank/i.test(u); } catch(e){ return false; } }
      try {
        var lp = Object.getPrototypeOf(window.location) || Location.prototype;
        var hrefDesc = Object.getOwnPropertyDescriptor(lp, 'href');
        if (hrefDesc && hrefDesc.set) {
          Object.defineProperty(lp, 'href', {
            configurable: true,
            get: hrefDesc.get,
            set: function(v){ if(isBlank(v)) return; return hrefDesc.set.call(this, v); }
          });
        }
      } catch(e){}
      try {
        var origReplace = window.location.replace.bind(window.location);
        Object.defineProperty(window.location, 'replace', {
          value: function(u){ if(isBlank(u)) return; return origReplace(u); },
          configurable: true, writable: true
        });
      } catch(e){}
      try {
        var origAssign = window.location.assign.bind(window.location);
        Object.defineProperty(window.location, 'assign', {
          value: function(u){ if(isBlank(u)) return; return origAssign(u); },
          configurable: true, writable: true
        });
      } catch(e){}
      try {
        var ow = window.open;
        window.open = function(u){ if(isBlank(u)) return null; return ow.apply(window, arguments); };
      } catch(e){}
      try {
        // innerHTML override is installed earlier (with brand rewriting + blank-wipe guard).
      } catch(e){}
      // Route the embedded site's relative/root-relative requests back
      // through our proxy so /api/*, /batch-donate/, etc. hit vidcloud
      // instead of returning 404 from our own app.
      try {
        var PREFIX='/api/proxy/';
        function rewriteUrl(u){
          try{
            if(u==null) return u;
            if(u instanceof URL) u=u.href;
            if(typeof u!=='string') return u;
            if(u.indexOf(PREFIX)===0 || u.indexOf('/api/proxy/')===0) return u;
            if(/^https?:\\/\\/www\\.google\\.com\\/search\\?q=VidyaRays/i.test(u)){
              return EXTERNAL_PROXY_PREFIX + 'vidyarays.com/';
            }
            if(/^https?:\\/\\/vidyarays\\.com/i.test(u)){
              var vu = new URL(u);
              return EXTERNAL_PROXY_PREFIX + 'vidyarays.com' + vu.pathname + vu.search + vu.hash;
            }
            if(/^https?:\\/\\/vidcloud\\.eu\\.org/i.test(u)){
              var vc = new URL(u);
              return EXTERNAL_PROXY_PREFIX + 'vidcloud.eu.org' + vc.pathname + vc.search + vc.hash;
            }
            if(u.charAt(0)==='/' && u.charAt(1)!=='/'){
              // root-relative -> route through proxy
              if(UPSTREAM_ORIGIN==='https://vidyarays.com'){
                return EXTERNAL_PROXY_PREFIX + 'vidyarays.com/' + u.replace(/^\\/+/,'');
              }
              return PREFIX + u.replace(/^\\/+/,'');
            }
            return u;
          }catch(e){ return u; }
        }
        var oFetch = window.fetch;
        window.fetch = function(input, init){
          try {
            if (typeof input === 'string' || input instanceof URL) {
              input = rewriteUrl(input);
            } else if (input && input.url) {
              var nu = rewriteUrl(input.url);
              if (nu !== input.url) input = new Request(nu, input);
            }
          } catch(e){}
          return oFetch.call(this, input, init);
        };
        var oOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(m,u){
          arguments[1] = rewriteUrl(u);
          return oOpen.apply(this, arguments);
        };
        // Ensure a <base> so relative URLs also resolve under the proxy.
        try {
          if (!document.querySelector('base')) {
            var b = document.createElement('base');
            b.href = ${JSON.stringify(proxyBaseHref)};
            (document.head||document.documentElement).insertBefore(b, (document.head||document.documentElement).firstChild);
          }
        } catch(e){}
      } catch(e){}
    })();</script>`;
    const bodyInject = `<script>(function(){
      var NEW_TG=${JSON.stringify(NEW_TELEGRAM)};
      var NEW_WA=${JSON.stringify(NEW_WHATSAPP)};
      var NEW_SUP=${JSON.stringify(NEW_SUPPORT)};
      var NEW_KEYGEN=${JSON.stringify(NEW_KEYGEN_LINK)};
      var NEW_LOGO=${JSON.stringify(NEW_LOGO)};
      var EXT_LOGO=${JSON.stringify(EXTERNAL_LOGO)};
      var MAINT=${JSON.stringify(MAINTENANCE_URL)};
      var BRAND=${JSON.stringify(BRAND_NAME)};
      var UPSTREAM_ORIGIN=${JSON.stringify(upstreamOrigin)};
      var EXTERNAL_PROXY_PREFIX=${JSON.stringify(EXTERNAL_PROXY_PREFIX)};
      var TEXT_MAP=[
        [/Stark\\s*\\/\\s*PW\\s*Team/gi, BRAND],
        [/Study\\s*Stark/gi, BRAND],
        [/STUDY\\s*STARK/g, BRAND.toUpperCase()],
        [/VidCloud/g, BRAND],
        [/studystark/gi, 'pwstudynetwork'],
        [/\\bStark\\b/g, BRAND]
      ];
      function fixLinks(){
        document.querySelectorAll('a[href]').forEach(function(a){
          var h=a.getAttribute('href')||'';
          var t=(a.textContent||'').trim().toLowerCase();
          if(/add\\s*batch/i.test(t)){ a.href=MAINT; a.target='_blank'; }
          else if(/whatsapp|wa\\.me/i.test(h) || /whats?app/.test(t)){ a.href=NEW_WA; a.target='_blank'; }
          else if(/contact\\s*support|need\\s*help/i.test(t) || /support/i.test(h)){ a.href=NEW_SUP; a.target='_blank'; }
          else if(/youtube\\.com|youtu\\.be/i.test(h) || /youtube|watch\\s*tutorial|watch\\s*video/i.test(t)){ a.href=NEW_KEYGEN; a.target='_blank'; }
          else if(/t\\.me|telegram\\.me|telegram/i.test(h) || /telegram/.test(t)){ a.href=NEW_TG; a.target='_blank'; }
        });
        document.querySelectorAll('button').forEach(function(b){
          var t=(b.textContent||'').trim().toLowerCase();
          if(/add\\s*batch/i.test(t) && !b.dataset.pwsnPatched){
            b.dataset.pwsnPatched='1';
            b.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); window.open(MAINT,'_blank'); },true);
          }
        });
        var btn=document.getElementById('join-tg-popup-btn'); if(btn) btn.href=NEW_TG;
      }
      function fixImages(){
        document.querySelectorAll('img').forEach(function(img){
          var src=img.getAttribute('src')||'';
          if(/\\/images\\/logo\\.png|vidcloud\\.eu\\.org\\/images\\/logo/i.test(src)){
            if(img.src.indexOf(NEW_LOGO)===-1) img.src=NEW_LOGO;
            return;
          }
          var s=src+' '+(img.alt||'')+' '+(img.className||'');
          if(/studystark|study[-_ ]?stark|logo|favicon|brand/i.test(s)){
            if(img.src!==location.origin+NEW_LOGO && img.src!==NEW_LOGO){
              img.src=NEW_LOGO;
            }
          }
        });
      }
      function fixText(){
        var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null);
        var n;var nodes=[];while((n=walker.nextNode())){nodes.push(n);}
        nodes.forEach(function(node){
          if(node.parentNode && /SCRIPT|STYLE/.test(node.parentNode.nodeName)) return;
          var v=node.nodeValue; if(!v) return; var nv=v;
          TEXT_MAP.forEach(function(p){ nv=nv.replace(p[0],p[1]); });
          if(nv!==v) node.nodeValue=nv;
        });
        // Title + favicon
        if(document.title && /Study\\s*Stark|VidCloud/i.test(document.title)){
          document.title=BRAND;
        }
        var link=document.querySelector("link[rel*='icon']");
        if(link && link.href!==location.origin+NEW_LOGO){ link.href=NEW_LOGO; }
      }
      function ensureAnkitFooter(){
        if(document.getElementById('pwsnAnkitFooter')) return;
        var footer=document.createElement('div');
        footer.id='pwsnAnkitFooter';
        footer.textContent='Ankit';
        footer.style.cssText='width:100%;padding:18px 0 22px;text-align:center;font-weight:800;font-size:13px;color:#94a3b8;background:#020617;letter-spacing:0;';
        document.body.appendChild(footer);
      }
      function proxifyUrl(u){
        if(!u) return u;
        if(u.indexOf('https://vidyarays.com/')===0) return EXTERNAL_PROXY_PREFIX+'vidyarays.com/'+u.slice('https://vidyarays.com/'.length);
        if(u.indexOf('https://vidcloud.eu.org/')===0) return '/api/proxy/'+u.slice('https://vidcloud.eu.org/'.length);
        if(u.charAt(0)==='/' && UPSTREAM_ORIGIN==='https://vidyarays.com') return EXTERNAL_PROXY_PREFIX+'vidyarays.com'+u;
        return u;
      }
      function ensureContinueButton(){
        if(UPSTREAM_ORIGIN!=='https://vidyarays.com' || document.getElementById('footerBtn') || document.getElementById('pwsnFallbackContinue')) return;
        if(!/You are On Step|Scroll Down and Click On Continue/i.test(document.body.innerText||'')) return;
        var wrap=document.createElement('div');
        wrap.style.cssText='position:fixed;left:0;right:0;bottom:18px;z-index:2147483647;text-align:center;pointer-events:none;';
        var btn=document.createElement('button');
        btn.id='pwsnFallbackContinue';
        btn.textContent='CONTINUE';
        btn.style.cssText='pointer-events:auto;border:0;border-radius:10px;padding:12px 28px;background:#0b63ce;color:#fff;font-weight:800;box-shadow:0 10px 28px rgba(0,0,0,.28);';
        btn.onclick=function(){
          btn.disabled=true; btn.textContent='PROCESSING...';
          fetch('/api.php?action=wppro_add_post_cookie').then(function(r){return r.json();}).then(function(res){
            if(res && res.success){
              if(res.is_last && res.finalUrl){ location.href=proxifyUrl(res.finalUrl); return; }
              if(res.next_url){ location.href=proxifyUrl(res.next_url); return; }
            }
            location.reload();
          }).catch(function(){ btn.disabled=false; btn.textContent='CONTINUE'; });
        };
        wrap.appendChild(btn); document.body.appendChild(wrap);
      }
      function run(){ try{fixLinks();fixImages();fixText();ensureContinueButton();ensureAnkitFooter();}catch(e){} }
      run();
      setInterval(run,800);
      // Observe DOM changes for popups/dynamic content
      try{
        var mo=new MutationObserver(function(){ run(); });
        mo.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
      }catch(e){}
    })();</script>`;
    const baseTag = `<base href="${htmlBaseHref}">`;
    if (html.includes("<head>")) {
      html = html.replace("<head>", "<head>" + headInject + baseTag);
    } else {
      html = headInject + baseTag + html;
    }
    if (html.includes("</body>")) {
      html = html.replace("</body>", bodyInject + "</body>");
    } else {
      html += bodyInject;
    }
    return new Response(html, { status: upstream.status, headers: respHeaders });
  }

  return new Response(upstream.body, { status: upstream.status, headers: respHeaders });
}

export const Route = createFileRoute("/api/proxy/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => handle(request, params._splat ?? ""),
      POST: async ({ request, params }) => handle(request, params._splat ?? ""),
      HEAD: async ({ request, params }) => handle(request, params._splat ?? ""),
    },
  },
});