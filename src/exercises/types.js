/**
 * @typedef {Object} ExerciseDescriptor
 * @property {string} id                           // 'tuner', 'matchPitch', 'identifyNote'
 * @property {string} slug                         // url path: 'tuner', 'match-pitch', 'identify-note'
 * @property {string} name                         // 'Tuner', 'Match Pitch', 'Identify Note'
 * @property {string} shortDesc                    // sidebar tooltip line
 * @property {string} longDesc                     // header tagline
 * @property {React.ComponentType} icon            // lucide icon component
 * @property {'cyan'|'violet'|'amber'} accent      // header icon background
 * @property {boolean} needsMic
 * @property {boolean} needsTone
 * @property {string|null} stateMachineMermaid
 * @property {React.ComponentType} Component
 * @property {React.ComponentType=} SettingsPanel
 */

/**
 * @typedef {Object} ExerciseRuntime
 * @property {ReturnType<import('../services/TonePlayerProvider').useTonePlayerService>} tonePlayer
 * @property {ReturnType<import('../services/PitchDetectorProvider').usePitchDetectorControl>|null} detectorCtrl
 * @property {{state: object}|null} detectorState
 * @property {{status:string, error:any, start:Function, stop:Function}} mic
 * @property {{ global: object, exercise: object, derived: object,
 *              setGlobal: Function, setExercise: Function }} settings
 */
