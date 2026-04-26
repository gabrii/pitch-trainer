import PhasePill from './PhasePill';

export default { title: 'PhasePill' };

export const Idle            = () => <div className="p-8"><PhasePill phase="idle" /></div>;
export const PlayingTone     = () => <div className="p-8"><PhasePill phase="playing_tone" /></div>;
export const Listening       = () => <div className="p-8"><PhasePill phase="listening" /></div>;
export const Success         = () => <div className="p-8"><PhasePill phase="success" /></div>;
export const Silence         = () => <div className="p-8"><PhasePill phase="silence" /></div>;
export const ReplayingUser   = () => <div className="p-8"><PhasePill phase="replaying_user" /></div>;
export const ReplayingTarget = () => <div className="p-8"><PhasePill phase="replaying_target" /></div>;
export const AwaitingInput   = () => <div className="p-8"><PhasePill phase="awaiting_input" /></div>;
export const CorrectRevealed = () => <div className="p-8"><PhasePill phase="correct_revealed" /></div>;
export const WithHint        = () => <div className="p-8"><PhasePill phase="silence" hint="Right note! Try to hold it longer." /></div>;
