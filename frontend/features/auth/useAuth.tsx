"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../lib/axios";
import { useRouter } from "next/navigation";

type MeResponse = {
  user: null | { id: string; name?: string; email?: string };
};

export function useAuth() {
  const router = useRouter();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async (): Promise<MeResponse["user"]> => {
      const res = await axios.get<MeResponse>("/api/auth/me"); // ensures the client sends cookie with the request
      return res.data.user;
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      await axios.post("/api/auth/logout");
    },
    onSuccess: () => {
      qc.clear();
      router.push("/");
      router.refresh();
    },
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    logout: logout.mutate,
  };
}
