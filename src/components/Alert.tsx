import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  AlertTriangle,
} from "lucide-react";

interface AlertProps {
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onDismiss?: () => void;
  duration?: number; // Auto-dismiss in ms
}

const Alert: React.FC<AlertProps> = ({
  title,
  message,
  type = "info",
  onDismiss,
  duration,
}) => {
  const [visible, setVisible] = useState(true);

  const getIconAndColors = () => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle2,
          bg: "from-emerald-50 to-emerald-100",
          border: "border-emerald-200",
          text: "text-emerald-800",
          iconColor: "text-emerald-600",
        };
      case "error":
        return {
          icon: AlertCircle,
          bg: "from-rose-50 to-rose-100",
          border: "border-rose-200",
          text: "text-rose-800",
          iconColor: "text-rose-600",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          bg: "from-amber-50 to-amber-100",
          border: "border-amber-200",
          text: "text-amber-800",
          iconColor: "text-amber-600",
        };
      default:
        return {
          icon: Info,
          bg: "from-indigo-50 to-indigo-100",
          border: "border-indigo-200",
          text: "text-indigo-800",
          iconColor: "text-indigo-600",
        };
    }
  };

  const Icon = getIconAndColors().icon;
  const colors = getIconAndColors();

  React.useEffect(() => {
    if (duration && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, visible, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className={`bg-white/80 backdrop-blur-sm rounded-2xl border ${colors.border} p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`w-5 h-5 ${colors.iconColor}`} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
            <p className={`text-sm ${colors.text}`}>{message}</p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={() => {
              setVisible(false);
              onDismiss();
            }}
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
