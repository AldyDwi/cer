function CerPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse">
      {/* =========================================
          ACTIVITY INFORMATION SKELETON
      ========================================== */}
      <section className="rounded-3xl border border-cream-border bg-white p-6 shadow-sm lg:p-8">
        {/* Title */}
        <div className="h-8 w-2/3 rounded-lg bg-gray-200 sm:w-1/2" />

        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
          {/* LEFT */}
          <div className="space-y-5">
            {/* Materi */}
            <SkeletonInfoRow
              labelWidth="w-16"
              valueWidth="w-72"
            />

            {/* Durasi */}
            <SkeletonInfoRow
              labelWidth="w-16"
              valueWidth="w-24"
            />

            {/* Deskripsi */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="h-4 w-20 shrink-0 rounded bg-gray-200" />

              <div className="flex-1 space-y-2">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-4/5 rounded bg-gray-200" />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col items-start gap-4 lg:items-end">
            {/* Status */}
            <div className="flex items-center gap-3">
              <div className="h-4 w-12 rounded bg-gray-200" />
              <div className="h-8 w-24 rounded-xl bg-gray-200" />
            </div>

            {/* Rekap */}
            <div className="h-10 w-28 rounded-xl bg-gray-200" />
          </div>
        </div>
      </section>

      {/* =========================================
          TRIPLET HEADER SKELETON
      ========================================== */}
      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-6 w-32 rounded-lg bg-gray-200" />

            <div className="h-4 w-72 max-w-full rounded bg-gray-200" />
          </div>

          <div className="h-10 w-36 rounded-xl bg-gray-200" />
        </div>

        {/* =====================================
            TRIPLET CARD SKELETON
        ====================================== */}
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <TripletSkeleton numberWidth="w-10" />
          <TripletSkeleton numberWidth="w-10" />
          <TripletSkeleton numberWidth="w-10" />
          <TripletSkeleton numberWidth="w-10" />
        </div>
      </section>
    </div>
  );
}

function SkeletonInfoRow({
  labelWidth,
  valueWidth,
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`h-4 shrink-0 rounded bg-gray-200 ${labelWidth}`}
      />

      <div
        className={`h-4 rounded bg-gray-200 ${valueWidth}`}
      />
    </div>
  );
}

function TripletSkeleton() {
  return (
    <div className="flex h-26 items-center gap-4 rounded-2xl border border-cream-border bg-white p-4 shadow-sm sm:p-5">
      {/* Number */}
      <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-200" />

      {/* Claim */}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3 w-12 rounded bg-gray-200" />
        <div className="h-4 w-4/5 rounded bg-gray-200" />
      </div>

      {/* Chevron */}
      <div className="h-8 w-8 shrink-0 rounded-lg bg-gray-200" />
    </div>
  );
}

export default CerPageSkeleton;