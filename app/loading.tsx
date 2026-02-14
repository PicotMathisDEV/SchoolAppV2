export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="relative">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-sm font-bold text-slate-600 tracking-wide animate-pulse">
        CHARGEMENT DES DONNÉES...
      </p>
    </div>
  );
}
