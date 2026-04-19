import { useState } from 'react';
import { Plus, Pencil, Trash2, RotateCcw } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import Modal from './Modal';
import { Tooltip } from './Tooltip';

export default function ProfileSelector() {
  const { profiles, activeId, switchProfile, createProfile, deleteProfile, renameProfile, resetProfile } = useSettings();
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const activeProfile = profiles.find(p => p.id === activeId);

  const handleRenameOpen = () => {
    setRenameValue(activeProfile?.name || '');
    setShowRename(true);
  };

  const handleRenameConfirm = () => {
    if (renameValue.trim()) {
      renameProfile(activeId, renameValue.trim());
    }
    setShowRename(false);
  };

  const handleDeleteConfirm = () => {
    deleteProfile(activeId);
    setShowDelete(false);
  };

  const btnBase = 'p-1.5 transition-colors';
  const btnNormal = `${btnBase} text-zinc-500 hover:bg-zinc-50`;
  const btnDanger = `${btnBase} text-rose-500 hover:bg-rose-50`;
  const divider = 'border-r border-zinc-200';

  return (
    <>
      <div className="inline-flex items-center rounded-lg border border-zinc-200 overflow-hidden">
        <Tooltip content="Switch between saved configuration profiles. Each profile stores its own settings independently.">
          <select
            value={activeId}
            onChange={e => switchProfile(e.target.value)}
            className="appearance-none px-2.5 py-1.5 text-sm font-semibold bg-white cursor-pointer border-none outline-none"
          >
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </Tooltip>
        <div className={divider} />
        <Tooltip content="Create a new profile with default settings.">
          <button onClick={createProfile} className={btnNormal}>
            <Plus size={14} />
          </button>
        </Tooltip>
        <div className={divider} />
        <Tooltip content="Rename the current profile.">
          <button onClick={handleRenameOpen} className={btnNormal}>
            <Pencil size={14} />
          </button>
        </Tooltip>
        <div className={divider} />
        <Tooltip content="Reset all settings in this profile back to their defaults.">
          <button onClick={() => setShowReset(true)} className={btnNormal}>
            <RotateCcw size={14} />
          </button>
        </Tooltip>
        {profiles.length > 1 && (
          <>
            <div className={divider} />
            <Tooltip content="Permanently delete this profile. This cannot be undone.">
              <button onClick={() => setShowDelete(true)} className={btnDanger}>
                <Trash2 size={14} />
              </button>
            </Tooltip>
          </>
        )}
      </div>

      <Modal open={showRename} onClose={() => setShowRename(false)} title="Rename Profile">
        <input
          type="text"
          value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleRenameConfirm(); }}
          className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button onClick={() => setShowRename(false)}
            className="px-3 py-1.5 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50">Cancel</button>
          <button onClick={handleRenameConfirm}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-violet-500 text-white">Rename</button>
        </div>
      </Modal>

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete Profile">
        <p className="text-sm text-zinc-600">
          Delete <strong>{activeProfile?.name}</strong>? This can't be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setShowDelete(false)}
            className="px-3 py-1.5 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50">Cancel</button>
          <button onClick={handleDeleteConfirm}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-rose-500 text-white">Delete</button>
        </div>
      </Modal>

      <Modal open={showReset} onClose={() => setShowReset(false)} title="Reset Settings">
        <p className="text-sm text-zinc-600">
          Reset <strong>{activeProfile?.name}</strong> to default settings? Your current settings will be lost.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setShowReset(false)}
            className="px-3 py-1.5 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50">Cancel</button>
          <button onClick={() => { resetProfile(); setShowReset(false); }}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-violet-500 text-white">Reset</button>
        </div>
      </Modal>
    </>
  );
}
