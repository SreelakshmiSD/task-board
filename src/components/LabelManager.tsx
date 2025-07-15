"use client";

import { useState, useEffect } from "react";
import {
  labelStorageService,
  TrelloLabel,
} from "@/lib/services/labelStorageService";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";

interface LabelManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LabelManager({ isOpen, onClose }: LabelManagerProps) {
  const [labels, setLabels] = useState<TrelloLabel[]>([]);
  const [editingLabel, setEditingLabel] = useState<TrelloLabel | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    emoji: "",
    color: "bg-blue-500",
    textColor: "text-white",
    category: "custom" as TrelloLabel["category"],
    priority: 1,
  });

  // Set client-side flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isOpen && isClient) {
      loadLabels();
    }
  }, [isOpen, isClient]);

  const loadLabels = () => {
    if (!isClient) return;

    try {
      const allLabels = labelStorageService.getAllLabels();
      setLabels(allLabels || []);
    } catch (error) {
      // Silently handle errors and set empty array
      setLabels([]);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    const labelData = {
      id: editingLabel?.id || formData.name.toLowerCase().replace(/\s+/g, "-"),
      name: formData.name,
      emoji: formData.emoji,
      color: formData.color,
      textColor: formData.textColor,
      category: formData.category,
      priority: formData.priority,
      isActive: true,
    };

    labelStorageService.saveLabel(labelData);
    loadLabels();
    resetForm();
  };

  const handleDelete = (labelId: string) => {
    if (confirm("Are you sure you want to delete this label?")) {
      labelStorageService.deleteLabel(labelId);
      loadLabels();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      emoji: "",
      color: "bg-blue-500",
      textColor: "text-white",
      category: "custom",
      priority: 1,
    });
    setEditingLabel(null);
    setIsCreating(false);
  };

  const startEdit = (label: TrelloLabel) => {
    setEditingLabel(label);
    setFormData({
      name: label.name,
      emoji: label.emoji,
      color: label.color,
      textColor: label.textColor,
      category: label.category,
      priority: label.priority,
    });
    setIsCreating(true);
  };

  const colorOptions = [
    { name: "Red", value: "bg-red-500", text: "text-white" },
    { name: "Yellow", value: "bg-yellow-500", text: "text-black" },
    { name: "Green", value: "bg-green-500", text: "text-white" },
    { name: "Blue", value: "bg-blue-500", text: "text-white" },
    { name: "Purple", value: "bg-purple-500", text: "text-white" },
    { name: "Orange", value: "bg-orange-500", text: "text-white" },
    { name: "Pink", value: "bg-pink-500", text: "text-white" },
    { name: "Indigo", value: "bg-indigo-500", text: "text-white" },
    { name: "Gray", value: "bg-gray-500", text: "text-white" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">🏷️ Manage Trello Labels</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Add New Label Button */}
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 mb-4 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              Add New Label
            </button>
          )}

          {/* Create/Edit Form */}
          {isCreating && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium mb-3">
                {editingLabel ? "Edit Label" : "Create New Label"}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="Label name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) =>
                      setFormData({ ...formData, emoji: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="🔴"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Color
                  </label>
                  <select
                    value={formData.color}
                    onChange={(e) => {
                      const selected = colorOptions.find(
                        (c) => c.value === e.target.value
                      );
                      setFormData({
                        ...formData,
                        color: e.target.value,
                        textColor: selected?.text || "text-white",
                      });
                    }}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  >
                    {colorOptions.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as TrelloLabel["category"],
                      })
                    }
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="priority">Priority</option>
                    <option value="type">Type</option>
                    <option value="status">Status</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">
                  Priority (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: parseInt(e.target.value),
                    })
                  }
                  className="w-20 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Preview */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">
                  Preview
                </label>
                <div
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${formData.color} ${formData.textColor}`}
                >
                  {formData.emoji && <span>{formData.emoji}</span>}
                  <span>{formData.name || "Label Name"}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={resetForm}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Labels List */}
          <div className="space-y-2">
            <h3 className="font-medium">Existing Labels</h3>
            {labels.map((label) => (
              <div
                key={label.id}
                className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${label.color} ${label.textColor}`}
                  >
                    <span>{label.emoji}</span>
                    <span>{label.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {label.category} • Priority: {label.priority}
                  </span>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(label)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(label.id)}
                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
