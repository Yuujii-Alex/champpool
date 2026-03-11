export default function Loading() {
  return (
    <main className="min-h-screen pb-16 text-slate-100">
      <div className="sticky top-0 z-30 w-full border-b border-white/6 bg-[#0c0d10f2] px-4 py-4 backdrop-blur md:px-8 xl:px-10">
        <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="h-10 w-56 animate-pulse rounded-md bg-white/8" />
          <div className="grid gap-3 lg:flex-1 lg:grid-cols-[110px_minmax(0,1fr)_140px]">
            <div className="h-11 animate-pulse rounded-md bg-white/8" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-11 animate-pulse rounded-md bg-white/8" />
              <div className="h-11 animate-pulse rounded-md bg-white/8" />
            </div>
            <div className="h-11 animate-pulse rounded-md bg-white/8" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mt-6 flex items-center gap-3 rounded-md border-l-2 border-[#d6aa4c] bg-[#171a1f] px-4 py-3 text-sm text-slate-100">
          <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          Loading the next profile snapshot.
        </div>

        <section className="mt-10 animate-pulse rounded-md bg-[#101317] p-8 shadow-[0_16px_32px_rgba(0,0,0,0.18)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="size-24 rounded-full bg-white/8" />
              <div className="space-y-3">
                <div className="h-10 w-72 rounded-md bg-white/8" />
                <div className="h-5 w-80 rounded-md bg-white/8" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
              <div className="h-24 rounded-md bg-white/8" />
              <div className="h-24 rounded-md bg-white/8" />
              <div className="h-24 rounded-md bg-white/8" />
              <div className="h-24 rounded-md bg-white/8" />
            </div>
          </div>
        </section>

        <section className="mt-8 animate-pulse rounded-md bg-[#101317] p-7 shadow-[0_16px_32px_rgba(0,0,0,0.18)]">
          <div className="h-10 w-64 rounded-md bg-white/8" />
          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            <div className="min-h-92 rounded-md bg-white/8" />
            <div className="min-h-92 rounded-md bg-white/8" />
            <div className="min-h-92 rounded-md bg-white/8" />
          </div>
        </section>
      </div>
    </main>
  );
}