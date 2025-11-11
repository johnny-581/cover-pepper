import Sidebar from "@/components/Sidebar";

export default function LettersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen flex font-sans text-theme-black text-[16px]">
      <Sidebar />
      {children}
    </div>
  );
}
