import LoginForm from "../components/LoginForm";

function LoginPage() {
  return (
    <main className="h-screen w-full overflow-hidden bg-dark">
      <div className="flex h-full w-full flex-col md:flex-row">
        {/* =====================================================
            LEFT — BRAND / CER INTRODUCTION
        ====================================================== */}
        <section className="relative hidden h-full w-full overflow-hidden bg-dark md:flex md:w-1/2 xl:w-[60%]">
          {/* Decorative background */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-lime-brand/10 blur-3xl" />

            <div className="absolute bottom-30 -right-20 h-96 w-96 rounded-full bg-lime-brand/5 blur-3xl" />

            <div className="absolute right-[15%] top-[18%] h-2 w-2 rounded-full bg-lime-brand/60" />

            <div className="absolute right-[23%] top-[30%] h-1.5 w-1.5 rounded-full bg-white/20" />

            <div className="absolute bottom-[22%] left-[12%] h-1.5 w-1.5 rounded-full bg-lime-brand/40" />
          </div>

          {/* Main content */}
          <div className="relative z-10 flex h-full w-full flex-col justify-between px-8 py-8 lg:px-10 xl:px-12">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-brand text-lg font-black text-dark shadow-lg shadow-lime-brand/10">
                R
              </div>

              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Reka-CER
                </h1>

                <p className="text-xs text-white/40">
                  Learning Platform
                </p>
              </div>
            </div>

            {/* Hero */}
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime-brand/20 bg-lime-brand/5 px-3.5 py-2">
                <span className="h-2 w-2 rounded-full bg-lime-brand" />

                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-lime-brand">
                  Media Pembelajaran
                </span>
              </div>

              <h2 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-white lg:text-5xl xl:text-6xl">
                Rekonstruksi
                <br />

                <span className="text-lime-brand">
                  Claim, Evidence,
                </span>

                <br />

                and Reasoning.
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-white/55 lg:text-base">
                Susun hubungan antara claim, evidence, dan
                reasoning melalui aktivitas pembelajaran yang
                terstruktur.
              </p>

              {/* CER visual */}
              <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
                <CerVisualCard
                  number="01"
                  title="Claim"
                  description="Pernyataan"
                  active
                />

                <CerVisualCard
                  number="02"
                  title="Evidence"
                  description="Bukti"
                />

                <CerVisualCard
                  number="03"
                  title="Reasoning"
                  description="Penjelasan"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/30">
                © 2026 Reka-CER
              </p>

              <div className="hidden items-center gap-2 lg:flex">
                <span className="h-px w-8 bg-white/10" />

                <span className="text-xs text-white/30">
                  Learn • Reconstruct • Understand
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT — LOGIN
        ====================================================== */}
        <section className="flex h-full w-full flex-1 items-center justify-center overflow-hidden bg-cream-light md:w-1/2 md:flex-none md:rounded-l-[2.75rem] xl:w-[40%]">
          <div className="flex h-full w-full max-w-xl flex-col justify-center px-6 py-8 sm:px-10 lg:px-12 xl:px-14">
            {/* Mobile brand */}
            <div className="mb-10 flex items-center gap-3 md:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-dark text-lg font-black text-lime-brand">
                R
              </div>

              <div>
                <p className="text-lg font-bold text-dark">
                  Reka-CER
                </p>

                <p className="text-xs text-gray-400">
                  Learning Platform
                </p>
              </div>
            </div>

            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}

function CerVisualCard({
  number,
  title,
  description,
  active = false,
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 backdrop-blur-sm transition ${
        active
          ? "border-lime-brand/30 bg-lime-brand/[0.07]"
          : "border-white/10 bg-white/2.5"
      }`}
    >
      {/* Number */}
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
          active
            ? "bg-lime-brand text-dark"
            : "bg-white/10 text-white/50"
        }`}
      >
        {number}
      </div>

      <p
        className={`mt-4 text-sm font-bold ${
          active ? "text-lime-brand" : "text-white/80"
        }`}
      >
        {title}
      </p>

      <p className="mt-1 text-xs text-white/30">
        {description}
      </p>

      {/* Decorative line */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${
          active
            ? "w-full bg-lime-brand"
            : "w-1/3 bg-white/10"
        }`}
      />
    </div>
  );
}

export default LoginPage;