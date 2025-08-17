import Modal from "./Modal";

type Props = {
    open: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }: Props) {
    return (
        <Modal open={open} onClose={onCancel} title={title ?? "Confirm"}>
            <p className="text-sm mb-4">{message}</p>
            <div className="flex justify-end gap-2">
                <button className="px-3 py-1 border border-black text-sm" onClick={onCancel}>
                    Cancel
                </button>
                <button className="px-3 py-1 border border-black bg-black text-white text-sm" onClick={onConfirm}>
                    Confirm
                </button>
            </div>
        </Modal>
    );
}