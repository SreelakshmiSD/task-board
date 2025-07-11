"use client";

import React from "react";
import { Plus, Copy } from "lucide-react";

interface TaskInfoCardProps {
  message?: string;
  onAddCard?: () => void;
  showCopyIcon?: boolean;
  className?: string;
  variant?: "default" | "blue" | "green" | "purple";
  buttonText?: string;
}

export default function TaskInfoCard({
  message = "Tasks from Daily Tasks are copied here on a daily basis.",
  onAddCard,
  showCopyIcon = true,
  className = "",
  variant = "default",
  buttonText = "Add a card",
}: TaskInfoCardProps) {
  console.log("🎨 TaskInfoCard received variant:", variant);

  // Define variant styles with white backgrounds and colored borders
  const getVariantStyles = (variant: string) => {
    const styleMap = {
      default: {
        backgroundColor: "#ffffff", // white background
        color: "#374151", // gray-700 text
        borderColor: "#d1d5db", // gray-300 border
      },
      blue: {
        backgroundColor: "#ffffff", // white background
        color: "#1e40af", // blue-800 text
        borderColor: "#3b82f6", // blue-500 border
      },
      green: {
        backgroundColor: "#ffffff", // white background
        color: "#166534", // green-800 text
        borderColor: "#10b981", // green-500 border
      },
      purple: {
        backgroundColor: "#ffffff", // white background
        color: "#7c3aed", // purple-600 text
        borderColor: "#8b5cf6", // purple-500 border
      },
    };
    return styleMap[variant as keyof typeof styleMap] || styleMap.default;
  };

  const variantStyles = {
    default: "bg-gray-800 text-white border-gray-700",
    blue: "bg-blue-800 text-blue-100 border-blue-600",
    green: "bg-green-800 text-green-100 border-green-600",
    purple: "bg-purple-800 text-purple-100 border-purple-600",
  };

  const buttonVariantStyles = {
    default:
      "!text-gray-600 hover:!text-gray-800 hover:!bg-gray-50 !border-gray-300 hover:!border-gray-400",
    blue: "!text-blue-600 hover:!text-blue-800 hover:!bg-blue-50 !border-blue-300 hover:!border-blue-400",
    green:
      "!text-green-600 hover:!text-green-800 hover:!bg-green-50 !border-green-300 hover:!border-green-400",
    purple:
      "!text-purple-600 hover:!text-purple-800 hover:!bg-purple-50 !border-purple-300 hover:!border-purple-400",
  };

  return (
    <div
      className={`rounded-lg p-4 mt-3 shadow-sm border ${className}`}
      style={getVariantStyles(variant)}
    >
      {/* Message */}
      <div className="flex items-start gap-2 mb-3">
        {showCopyIcon && (
          <Copy className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
        )}
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
      </div>

      {/* Add Card Button */}
      <button
        onClick={onAddCard}
        className={`
          flex items-center gap-2 w-full
          text-left text-sm
          rounded-md px-2 py-2
          transition-colors duration-200
          border border-dashed
          ${buttonVariantStyles[variant]}
        `}
      >
        <Plus className="w-4 h-4" />
        <span>{buttonText}</span>
      </button>
    </div>
  );
}
