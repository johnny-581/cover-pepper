"use client";
import { redirect } from "next/navigation";
import { listLetters } from "@/features/letters/api";
import { Letter } from "@/features/letters/types";
import EmptyState from "../EmptyState";
import { useLetters } from "@/features/letters/hooks";

export default function LettersList() {
    const {data: letters} = useLetters()

    if (!letters?.length) return <EmptyState />;

    redirect(`/letters/${letters[0].id}`);
}
