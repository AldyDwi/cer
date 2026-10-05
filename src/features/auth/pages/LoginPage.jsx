import LoginForm from "../components/LoginForm";

function LoginPage() {
    return (
        <div className="min-h-screen bg-cream-light">
            <div className="grid min-h-screen lg:grid-cols-2">
                {/* Left Side */}
                <div className="hidden lg:flex flex-col justify-between bg-dark p-12 text-white">
                    <div>
                        <div className="mb-12 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-brand font-black text-dark">
                                R
                            </div>

                            <span className="text-xl font-bold">
                                Reka-CER
                            </span>
                        </div>

                        <div className="max-w-lg">
                            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-lime-brand">
                                Media Pembelajaran
                            </p>

                            <h1 className="text-5xl font-black leading-tight">
                                Rekonstruksi
                                <br />
                                <span className="text-lime-brand">
                                    Claim, Evidence,
                                </span>
                                <br />
                                and Reasoning.
                            </h1>

                            <p className="mt-6 max-w-md text-base leading-7 text-white/70">
                                Susun hubungan antara claim, evidence, dan
                                reasoning melalui aktivitas pembelajaran
                                yang terstruktur.
                            </p>
                        </div>
                    </div>

                    <p className="text-sm text-white/40">
                        © 2026 Reka-CER
                    </p>
                </div>

                {/* Right Side */}
                <div className="flex items-center justify-center p-6 sm:p-10">
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="mb-10 flex items-center gap-3 lg:hidden">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-brand font-black text-dark">
                                R
                            </div>

                            <span className="text-xl font-bold text-dark">
                                Reka-CER
                            </span>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-dark">
                                Selamat datang!
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Masuk untuk melanjutkan aktivitas pembelajaran
                                Reka-CER.
                            </p>
                        </div>

                        <LoginForm />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;