"use client";

import { useEffect } from "react";
import { useUI } from "@/components/dialogs/store";

export default function UnauthedGate() {
  const { setLoginOpen } = useUI();

  useEffect(() => {
    setLoginOpen(true);
  }, [setLoginOpen]);

  return null; // or a landing page that includes your <LoginDialog />
}
