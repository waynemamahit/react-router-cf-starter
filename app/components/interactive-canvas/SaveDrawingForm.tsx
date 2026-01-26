import { useState } from 'react';

interface SaveDrawingFormProps {
  onSave: (name: string) => Promise<boolean>;
  isSaving: boolean;
  error: string | null;
}

export function SaveDrawingForm({ onSave, isSaving, error }: SaveDrawingFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const success = await onSave(name);
    if (success) {
      setName('');
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-center w-full">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Drawing name"
          className="px-3 py-2 border border-gray-300 rounded text-sm flex-1 min-w-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
          disabled={isSaving}
          aria-label="Drawing name"
        />
        <button
          type="submit"
          disabled={isSaving || !name.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap h-9 flex items-center"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </form>
      {error && (
        <p className="text-red-500 text-xs" role="alert">{error}</p>
      )}
    </div>
  );
}
