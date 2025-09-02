import logo from "@/assets/logo.png";

export default function Header() {
    return (
        <header className="flex items-center px-2 py-1">
            {/* <div className="w-10 h-10 theme-border rounded-full"></div> */}
            <img src={logo} alt="logo" className="h-10 rounded p-1 pl-2" />
            <div className="text-[28px] font-sans tracking-normal pl-2 tracking-tighter">Cover Pepper</div>
        </header>
    );
}