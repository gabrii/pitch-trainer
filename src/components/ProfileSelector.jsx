import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import Modal from './Modal';

export default function ProfileSelector() {
  const { profiles, activeId, switchProfile, createProfile, deleteProfile, renameProfile } = useSettings();
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
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
  const btnNormal = `${btnBase} text-slate-500 hover:bg-slate-50`;
  const btnDanger = `${btnBase} text-red-500 hover:bg-red-50`;
  const divider = 'border-r border-slate-200';

  return (
    <>
      <div className="inline-flex items-center rounded-lg border border-slate-200 overflow-hidden">
        <select
          value={activeId}
          onChange={e => switchProfile(e.target.value)}
          className="appearance-none px-2.5 py-1.5 text-sm font-semibold bg-white cursor-pointer border-none outline-none"
        >
          {profiles.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <div className={divider} />
        <button onClick={createProfile} className={btnNormal} title="New profile">
          <Plus size={14} />
        </button>
        <div className={divider} />
        <button onClick={handleRenameOpen} className={btnNormal} title="Rename profile">
          <Pencil size={14} />
        </button>
        {profiles.length > 1 && (
          <>
            <div className={divider} />
            <button onClick={() => setShowDelete(true)} className={btnDanger} title="Delete profile">
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>

      <Modal open={showRename} onClose={() => setShowRename(false)} title="Rename Profile">
        <input
          type="text"
          value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleRenameConfirm(); }}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button onClick={() => setShowRename(false)}
            className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50">Cancel</button>
          <button onClick={handleRenameConfirm}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-teal-400 text-teal-900">Rename</button>
        </div>
      </Modal>

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete Profile">
        <p className="text-sm text-slate-600">
          Delete <strong>{activeProfile?.name}</strong>? This can't be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setShowDelete(false)}
            className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50">Cancel</button>
          <button onClick={handleDeleteConfirm}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-500 text-white">Delete</button>
        </div>
      </Modal>
    </>
  );
}
