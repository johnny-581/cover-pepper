import { useLetters } from "@/features/letters/hooks";
import LetterList from "@/features/letters/components/LetterList";
import { useUI } from "@/features/letters/store";
import Button from "@/components/Button";
import AccountMenu from "./AccountMenu";

export default function DirectoryPanel() {
    const { data } = useLetters();
    const { setGenerateOpen } = useUI();


    return (
        <aside className="w-[280px] theme-border-right bg-almost-white flex flex-col rounded-l-2xl shadow-[inset_0px_0px_6px_0px_rgba(0,0,0,0.1)]">
            <div className="p-5">
                <Button className="w-full" onClick={() => setGenerateOpen(true)}>
                    New Letter
                </Button>
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
                <LetterList letters={data ?? []} />
            </div>

            <AccountMenu />
        </aside>
    );
}