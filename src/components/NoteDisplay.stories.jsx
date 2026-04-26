import NoteDisplay from './NoteDisplay';

export default { title: 'NoteDisplay' };

export const NormalScientific = () => <div className="p-8"><NoteDisplay midi={60} notation="scientific" /></div>;
export const NormalSolfege    = () => <div className="p-8"><NoteDisplay midi={60} notation="solfege" /></div>;
export const LargeScientific  = () => <div className="p-8"><NoteDisplay midi={69} size="large" notation="scientific" /></div>;
export const LargeSolfege     = () => <div className="p-8"><NoteDisplay midi={69} size="large" notation="solfege" /></div>;
export const Null             = () => <div className="p-8"><NoteDisplay midi={null} /></div>;
export const Sharp            = () => <div className="p-8"><NoteDisplay midi={61} notation="scientific" /></div>;
