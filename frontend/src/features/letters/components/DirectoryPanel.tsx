import { useLetters } from "@/features/letters/hooks";
import LetterList from "@/features/letters/components/LetterList";
import { useUI } from "@/features/letters/store";
import Button from "@/components/Button";
import AccountMenu from "./AccountMenu";

export default function DirectoryPanel() {
    const { data } = useLetters();
    const { setGenerateOpen } = useUI();


    return (
        <aside className="w-[280px] theme-border-right bg-almost-white flex flex-col inset-shadow-sm/10 rounded-l-2xl">
            <div className="p-5">
                <Button fullWidth onClick={() => setGenerateOpen(true)}>
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