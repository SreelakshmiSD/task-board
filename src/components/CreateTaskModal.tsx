"use client";

import React from "react";
import CreateTaskForm from "./CreateTaskForm";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStatus?: string;
  initialStage?: string;
  onTaskCreated?: () => void; // Callback to refresh parent component's task list
  defaultValues?: {
    title?: string;
    description?: string;
    progress?: number;
    priority?: string;
    estimated_hours?: string;
  };
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  initialStatus,
  initialStage,
  onTaskCreated,
  defaultValues,
}: CreateTaskModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <CreateTaskForm
          onClose={onClose}
          initialStatus={initialStatus}
          initialStage={initialStage}
          onTaskCreated={onTaskCreated}
          defaultValues={defaultValues}
        />
      </div>
    </div>
  );
}
