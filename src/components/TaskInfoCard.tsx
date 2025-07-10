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
  // Define variant styles with more vibrant colors and important flags
  const variantStyles = {
    default: "!bg-gray-800 !text-white !border-gray-700",
    blue: "!bg-blue-800 !text-blue-100 !border-blue-600",
    green: "!bg-green-800 !text-green-100 !border-green-600",
    purple: "!bg-purple-800 !text-purple-100 !border-purple-600",
  };

  const buttonVariantStyles = {
    default:
      "!text-gray-300 hover:!text-white hover:!bg-gray-700 !border-gray-500 hover:!border-gray-400",
    blue: "!text-blue-300 hover:!text-blue-100 hover:!bg-blue-700 !border-blue-500 hover:!border-blue-400",
    green:
      "!text-green-300 hover:!text-green-100 hover:!bg-green-700 !border-green-500 hover:!border-green-400",
    purple:
      "!text-purple-300 hover:!text-purple-100 hover:!bg-purple-700 !border-purple-500 hover:!border-purple-400",
  };

  return (
    <div
      className={`
        ${variantStyles[variant]} rounded-lg p-4 mt-3 shadow-sm
        border
        ${className}
      `}
    >
      {/* Message */}
      <div className="flex items-start gap-2 mb-3">
        {showCopyIcon && (
          <Copy className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
        )}
        <p className="text-sm text-gray-200 leading-relaxed">{message}</p>
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
