import React from "react";
import { AlertTriangle, AlertCircle, HelpCircle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "danger" | "warning" | "info";
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  type = "danger",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  const getIconAndColors = () => {
    switch (type) {
      case "danger":
        return {
          icon: AlertCircle,
          bg: "from-rose-50 to-rose-100",
          iconColor: "text-rose-600",
          confirmBg: "bg-rose-600 hover:bg-rose-700",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          bg: "from-amber-50 to-amber-100",
          iconColor: "text-amber-600",
          confirmBg: "bg-amber-600 hover:bg-amber-700",
        };
      default:
        return {
          icon: HelpCircle,
          bg: "from-indigo-50 to-indigo-100",
          iconColor: "text-indigo-600",
          confirmBg: "bg-indigo-600 hover:bg-indigo-700",
        };
    }
  };

  const Icon = getIconAndColors().icon;
  const colors = getIconAndColors();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
            >
              <Icon className={`w-6 h-6 ${colors.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 text-lg mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-600">{message}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-sm font-medium text-white ${colors.confirmBg} rounded-xl transition-all duration-200 shadow-sm hover:shadow`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
