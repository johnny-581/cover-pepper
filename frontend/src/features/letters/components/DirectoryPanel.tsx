import { useLetters } from "@/features/letters/hooks";
import LetterList from "@/features/letters/components/LetterList";
import { useUI } from "@/features/letters/store";
import Button from "@/components/Button";
import AccountMenu from "./AccountMenu";

export default function DirectoryPanel() {
    const { data } = useLetters();
    const { setGenerateOpen } = useUI();


    return (
        <aside className="w-[280px] border-r-[1.5px] border-gray bg-almost-white flex flex-col">
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