import { useState } from "react";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);

    const handleGoogle = () => {
        setLoading(true);
        const base = import.meta.env.VITE_BACKEND_API_URL;
        window.location.href = `${base}/auth/google`;
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="border border-grayline p-8 w-[360px]">
                <h1 className="text-lg font-medium mb-4">Welcome to Cover Pepper</h1>
                <button
                    onClick={handleGoogle}
                    disabled={loading}
                    className="w-full border border-black px-4 py-2 text-sm disabled:opacity-60"
                >
                    {loading ? "Redirecting…" : "Continue with Google"}
                </button>
            </div>
        </div>
    );
}