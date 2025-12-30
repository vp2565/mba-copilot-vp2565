'use client';

import { RotateCcw, Settings as SettingsIcon, X } from 'lucide-react';
import { useState } from 'react';
import type { ChatSettings } from '../types';
import { AVAILABLE_MODELS, DEFAULT_SETTINGS } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ChatSettings;
  onSave: (settings: ChatSettings) => void;
}

const STORAGE_KEY = 'mba-copilot-settings';

export function loadSettings(): ChatSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: ChatSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export default function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<ChatSettings>(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    saveSettings(localSettings);
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-columbia-600" />
            <h2 className="text-lg font-semibold text-slate-800">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Chat Model
            </label>
            <select
              value={localSettings.chat_model}
              onChange={(e) => setLocalSettings({ ...localSettings, chat_model: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-columbia-500 bg-white"
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              GPT-4o is more capable but costs more. GPT-4o Mini is recommended for most use cases.
            </p>
          </div>

          {/* Top-K */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Documents to Retrieve: {localSettings.top_k}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={localSettings.top_k}
              onChange={(e) => setLocalSettings({ ...localSettings, top_k: parseInt(e.target.value) })}
              className="w-full accent-columbia-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1 (focused)</span>
              <span>10 (broad)</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              How many document chunks to retrieve for each question. More chunks = more context but potentially more noise.
            </p>
          </div>

          {/* Min Score */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Minimum Relevance: {Math.round(localSettings.min_score * 100)}%
            </label>
            <input
              type="range"
              min="20"
              max="90"
              step="5"
              value={localSettings.min_score * 100}
              onChange={(e) => setLocalSettings({ ...localSettings, min_score: parseInt(e.target.value) / 100 })}
              className="w-full accent-columbia-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>20% (very lenient)</span>
              <span>90% (very strict)</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Only include chunks with at least this similarity score. Lower (30-40%) works better for general questions. Higher (70%+) for specific lookups.
            </p>
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              System Prompt
            </label>
            <textarea
              value={localSettings.system_prompt}
              onChange={(e) => setLocalSettings({ ...localSettings, system_prompt: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-columbia-500 text-sm font-mono"
              placeholder="Instructions for the AI..."
            />
            <p className="text-xs text-slate-500 mt-1">
              Customize how the AI responds. This sets the AI&apos;s personality and behavior.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-columbia-600 text-white rounded-lg hover:bg-columbia-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}