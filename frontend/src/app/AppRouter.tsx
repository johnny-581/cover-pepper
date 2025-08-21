import { Route, Routes, Navigate } from "react-router-dom";
import AppLayout from "@/app/AppLayout";
import EditorPanel from "@/features/editor/components/EditorPanel";

export default function AppRouter() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/app/letters/:id?" element={<EditorPanel />} />
            </Route>
            <Route path="*" element={<Navigate to="/app/letters" replace />} />
        </Routes>
    );
}