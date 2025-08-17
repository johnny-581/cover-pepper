import { Route, Routes, Navigate } from "react-router-dom";
import AppLayout from "@/app/layouts/AppLayout";
import { useAuth } from "@/features/auth/useAuth";
import LoginPage from "@/features/auth/LoginDialog";
import EditorPanel from "@/features/editor/components/EditorPanel";

export default function AppRouter() {
    const { isLoading, user } = useAuth();

    if (isLoading) return <div className="p-6 text-sm">Loading…</div>;

    return (
        <Routes>
            {!user ? (
                <>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </>
            ) : (
                <>
                    <Route element={<AppLayout />}>
                        <Route path="/app/letters/:id?" element={<EditorPanel />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/app/letters" replace />} />
                </>
            )}
        </Routes>
    );
}