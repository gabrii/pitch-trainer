// Piano note names as used in sample filenames (flat notation, distinct from NOTE_NAMES sharps)
const FLAT_NOTE_LABELS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Full piano range covered by the bundled samples
const SAMPLE_MIDI_MIN = 21; // A0
const SAMPLE_MIDI_MAX = 108; // C8

function noteLabel(midi) {
  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${FLAT_NOTE_LABELS[noteIndex]}${octave}`;
}

function sampleUrl(midi, dynamic) {
  return `${import.meta.env.BASE_URL}samples/piano/Piano.${dynamic}.${noteLabel(midi)}.mp3`;
}

/** Returns true if a sample file exists for the given MIDI note. */
export function hasSample(midi) {
  return midi >= SAMPLE_MIDI_MIN && midi <= SAMPLE_MIDI_MAX;
}

// Cache: midi number → Promise<ArrayBuffer> (raw bytes, context-independent)
const arrayBufferCache = new Map();

function fetchArrayBuffer(midi) {
  if (arrayBufferCache.has(midi)) return arrayBufferCache.get(midi);

  const promise = fetch(sampleUrl(midi, 'ff'))
    .then(r => r.ok ? r : fetch(sampleUrl(midi, 'mf')))
    .then(r => {
      if (!r.ok) throw new Error(`Sample not found for MIDI ${midi}`);
      return r.arrayBuffer();
    })
    .catch(err => {
      arrayBufferCache.delete(midi);
      throw err;
    });

  arrayBufferCache.set(midi, promise);
  return promise;
}

/**
 * Load and decode the piano sample for a MIDI note.
 * The ArrayBuffer is cached across calls; decoding is per AudioContext so a
 * recreated context always gets a fresh AudioBuffer.
 */
export async function loadSample(midi, audioContext) {
  const arrayBuffer = await fetchArrayBuffer(midi);
  // decodeAudioData consumes the buffer, so we must slice a copy each time
  return audioContext.decodeAudioData(arrayBuffer.slice(0));
}
