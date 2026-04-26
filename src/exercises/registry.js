import tuner from './tuner/index.jsx';
import matchPitch from './matchPitch/index.jsx';
import identifyNote from './identifyNote/index.jsx';

export const EXERCISES = [tuner, matchPitch, identifyNote];
export const EXERCISES_BY_ID   = Object.fromEntries(EXERCISES.map(e => [e.id, e]));
export const EXERCISES_BY_SLUG = Object.fromEntries(EXERCISES.map(e => [e.slug, e]));
