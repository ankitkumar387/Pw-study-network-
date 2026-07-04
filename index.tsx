import { createFileRoute } from "@tanstack/react-router";
import pwLogo from "@/assets/pw-logo.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pw Study Network" },
      { name: "description", content: "Pw Study Network batches and tools." },
      { property: "og:title", content: "Pw Study Network" },
      { property: "og:description", content: "Pw Study Network batches and tools." },
    ],
    links: [
      { rel: "icon", href: pwLogo.url, type: "image/jpeg" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col h-screen w-screen">
      <div className="relative shrink-0 bg-slate-950 px-2 pt-2 pb-2">
        <header className="relative w-full group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur-md opacity-40" />
          <div className="relative flex items-center justify-between w-full h-14 bg-slate-900/85 backdrop-blur-xl border border-white/10 rounded-2xl px-2.5 shadow-2xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex items-center justify-center w-9 h-9 shrink-0">
                <div className="absolute inset-0 bg-blue-500 rounded-lg rotate-6 opacity-25" />
                <img src={pwLogo.url} alt="PW" className="relative w-full h-full rounded-lg object-cover border border-blue-400/40 shadow-lg" />
              </div>
              <div className="flex flex-col -space-y-0.5 min-w-0">
                <span className="text-[13px] font-bold text-white tracking-tight truncate">Pw Study Network</span>
                <span className="text-[9px] font-semibold text-blue-400 uppercase tracking-widest">Premium Access</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <a href="https://t.me/+SvWSdC034SVkN2U1" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/25 active:scale-90 transition">
                <svg className="w-4 h-4 text-sky-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.96-.75 3.78-1.65 6.31-2.74 7.58-3.27 3.61-1.51 4.35-1.77 4.84-1.78.11 0 .35.03.5.16.12.1.16.23.18.33.02.08.03.23.02.3z"/></svg>
              </a>
              <a href="https://whatsapp.com/channel/0029VbCbDOt0VycLRqoBz82x" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/25 active:scale-90 transition">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .01 5.403.007 12.04c0 2.12.552 4.189 1.597 6.011L0 24l6.135-1.61a11.782 11.782 0 005.912 1.599h.005c6.637 0 12.042-5.403 12.045-12.04a11.799 11.799 0 00-3.483-8.482z"/></svg>
              </a>
              <a href="https://www.instagram.com/pw_study_network_official" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500/15 via-pink-500/15 to-purple-500/15 border border-pink-500/25 active:scale-90 transition">
                <svg className="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>
        </header>
      </div>
      <iframe
        src="/api/proxy/#batches"
        title="Pw Study Network"
        className="flex-1 w-full border-0 block"
        allow="fullscreen; clipboard-read; clipboard-write; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
