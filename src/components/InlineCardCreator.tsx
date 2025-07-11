"use client";

import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface InlineCardCreatorProps {
  onSave: (title: string) => void;
  onCancel: () => void;
  placeholder?: string;
  defaultTitle?: string;
}

export default function InlineCardCreator({
  onSave,
  onCancel,
  placeholder = "Enter a title or paste a link",
  defaultTitle = "",
}: InlineCardCreatorProps) {
  const [title, setTitle] = useState(defaultTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mt-3">
      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="
          w-full px-3 py-2 
          border border-gray-300 rounded-md 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          text-black text-sm
          resize-none
        "
      />

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="
            px-3 py-1.5 text-sm font-medium
            bg-blue-600 text-white rounded-md
            hover:bg-blue-700 
            disabled:bg-gray-300 disabled:cursor-not-allowed
            transition-colors duration-200
          "
        >
          Add card
        </button>
        
        <button
          onClick={onCancel}
          className="
            p-1.5 text-gray-500 hover:text-gray-700
            hover:bg-gray-100 rounded-md
            transition-colors duration-200
          "
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
