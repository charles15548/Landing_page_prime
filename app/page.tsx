import SeriesReferenceAnimation from "./_components/series-reference/SeriesReferenceAnimation";
import ExerciseProgressChart from "./_components/progress-chart/ExerciseProgressChart";
import {
  ActivityTracker,
  DownloadTrackedLink,
} from "./_components/analytics/ActivityTracker";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-yellow-500/30">
      <ActivityTracker />

      {/* --- HERO SECTION --- */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center overflow-hidden">
        {/* Glow de fondo para el estilo Premium */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full h-[300px] bg-white/5 blur-[120px] rounded-full" />

        <div className="z-10 animate-fade-in">
          <div className="flex justify-center mb-6">
            {/* Agregamos drop-shadow-xl y especificamos el color blanco con opacidad */}
            <Image
              src="/ic_launcher.png"
              alt="PRIME Logo"
              width={120} // Equivalente a w-30 (30 * 4px)
              height={120}
              className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            />
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            TU VIAJE MARCIAL <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">
              COMIENZA AQUÍ
            </span>
          </h1>

          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            Entrena con rutinas optimizadas y logra progreso real en Taekwondo.
          </p>

          <DownloadTrackedLink
            source="hero_cta"
            href="https://play.google.com/store/apps/details?id=com.prime.app_tkd&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <button className="relative overflow-hidden group px-8 py-4 rounded-full font-bold text-lg text-black bg-white bg-gradient-to-b from-white to-zinc-200 border border-zinc-200 hover:border-white/80 shadow-[0_4px_14px_0_rgba(255,255,255,0.15)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.25)] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.03] active:translate-y-0.5 active:scale-[0.98]">
              {/* El contenido del reflejo y el texto que ya tenemos */}
              <span className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                DESCARGAR PRIME
              </span>
            </button>
          </DownloadTrackedLink>
        </div>

        {/* Mockup Principal */}
        {/* Mockup Principal */}
        <div className="mt-12 relative z-10 w-full max-w-[280px] mx-auto aspect-[9/9] rounded-[2.5rem] overflow-hidden border-4 border-zinc-800 drop-shadow-[0_35px_35px_rgba(255,255,255,0.1)]">
          <video
            src="/banner.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* --- INTERACTIVE FEATURES SECTION --- */}
      <section className="px-6 py-20 space-y-24 max-w-xl mx-auto">
        {/* Feature 1 */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="inline-block p-3 rounded-2xl bg-zinc-900 border border-white/10">
            <span className="text-2xl">⚡</span>
          </div>
          <h2 className="text-2xl font-bold">
            Ajusta el tiempo y repeticiones
          </h2>
          <p className="text-gray-500">
            Interfaz interactiva para seguir tu ritmo de entrenamiento en tiempo
            real.
          </p>
          <div className="w-full rounded-3xl border border-white/5 bg-zinc-900 p-3 flex justify-center">
            <SeriesReferenceAnimation />
          </div>
        </div>

        {/* Feature 2: Logros */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="inline-block p-3 rounded-2xl bg-zinc-900 border border-white/10">
            <span className="text-2xl">🏆</span>
          </div>
          <h2 className="text-2xl font-bold">Logra progreso real</h2>
          <p className="text-gray-500">
            Sigue tu plan y visualiza tu evolución como peleador.
          </p>
          <div className="w-full rounded-3xl border border-white/5 bg-zinc-900 p-3 flex justify-center">
            <ExerciseProgressChart />
          </div>
        </div>
      </section>

      {/* --- DOWNLOAD FOOTER --- */}
      <footer className="bg-zinc-950 border-t border-white/5 px-6 py-16 text-center">
        <h3 className="text-xl font-bold mb-4 p-2">
          ÚNETE A LA COMUNIDAD MARCIAL
        </h3>

        <div className="flex flex-col sm:flex-row  justify-center items-center mb-4">
          <DownloadTrackedLink
            source="footer_badge"
            href="https://play.google.com/store/apps/details?id=com.prime.app_tkd&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="
    inline-block transition-all duration-150 
    active:transform active:scale-95 active:translate-y-1 
    hover:brightness-110
  "
          >
            <Image
              src="/playstore.png"
              alt="Google Play Store"
              width={140}
              height={140}
              className="object-contain drop-shadow-lg active:drop-shadow-sm"
            />
          </DownloadTrackedLink>
        </div>

        <div className="space-y-4 opacity-40">
          <div className="flex justify-center space-x-6 text-xs font-medium">
            <a
              href="https://big-birch-0ff.notion.site/Privacy-Policy-for-PRIME-30df2520377a80fbaf4df31bc1371a4c"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Términos
            </a>
          </div>
          <p className="text-[10px]">© 2026 PRIME APP </p>
        </div>
      </footer>
    </div>
  );
}
