import Button from "@/components/Button";
import { useUI } from "@/components/dialogs/store";
import AlertDialog from "@/components/dialogs/AlertDialog";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AccountMenu() {
  const { isLogoutConfirmOpen, setLogoutConfirmOpen } = useUI();
  const router = useRouter();
  const supabase = createClient();

  // should later extract to a LogoutButton component
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <>
      <div className="flex p-3 items-center justify-between border-t-[1px] border-theme-medium-gray">
        <Button variant="ghost" onClick={() => setLogoutConfirmOpen(true)}>
          Logout
        </Button>
      </div>

      <AlertDialog
        open={isLogoutConfirmOpen}
        message="Sure you want to logout?"
        onConfirm={() => {
          handleLogout();
          setLogoutConfirmOpen(false);
        }}
        onCancel={() => setLogoutConfirmOpen(false)}
      ></AlertDialog>
    </>
  );
}
