import { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";

type Props = {
    open: boolean;
    onClose?: () => void;
}

export default function LoginDialog({ open, onClose }: Props) {
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = () => {
        setLoading(true);
        const base = import.meta.env.VITE_BACKEND_API_URL;
        window.location.href = `${base}/api/auth/google`;
    };

    return (
        <Modal open={open} onClose={onClose} title="Login">
            <div className="flex flex-col items-center">
                <div className="w-30 h-30 theme-border rounded-full mt-15 mb-10"></div>
                <p className="mb-3 theme-h1 text-center"> Welcome to Cover Pepper</p>
                <p className="mb-15 text-center">Let’s cook up some cover letters</p>

                <Button onClick={handleGoogleLogin}>{loading ? "Redirecting…" : "Continue with Google"}</Button>
            </div>
        </Modal>
    );
}