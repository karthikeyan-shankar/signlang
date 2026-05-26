/**
 * Normalizes a list of 21 3D hand landmarks.
 * 
 * 1. Translation: Translates all coordinates relative to the wrist (landmark 0) at (0,0,0).
 * 2. Scaling: Scales all coordinates relative to the distance between wrist (0) and middle finger knuckle (9).
 */
export function normalizeLandmarks(landmarks) {
  if (!landmarks || landmarks.length !== 21) return null;

  const wrist = landmarks[0];
  
  // 1. Translate relative to wrist (index 0)
  const translated = landmarks.map(lm => ({
    x: lm.x - wrist.x,
    y: lm.y - wrist.y,
    z: lm.z - wrist.z
  }));

  // 2. Calculate palm size (wrist to middle finger base) as the scale factor
  const middleBase = translated[9];
  const scale = Math.sqrt(
    middleBase.x * middleBase.x + 
    middleBase.y * middleBase.y + 
    middleBase.z * middleBase.z
  );

  if (scale === 0) return translated;

  // 3. Scale all coordinates relative to palm size
  return translated.map(lm => ({
    x: translated.indexOf(lm) === 0 ? 0 : lm.x / scale,
    y: translated.indexOf(lm) === 0 ? 0 : lm.y / scale,
    z: translated.indexOf(lm) === 0 ? 0 : lm.z / scale
  }));
}

/**
 * Calculates the average Euclidean distance between two landmark arrays.
 * Pre-normalizes the template to guarantee they are compared on the exact same mathematical scale.
 * Returns a similarity score between 0.0 and 1.0.
 */
export function calculateSimilarity(liveNormalized, templateLandmarks) {
  if (!liveNormalized || !templateLandmarks || liveNormalized.length !== 21 || templateLandmarks.length !== 21) {
    return 0;
  }

  // Double-normalize both arrays to ensure identical scaling and origin translation
  const templateNormalized = normalizeLandmarks(templateLandmarks);
  if (!templateNormalized) return 0;

  let totalDistance = 0;

  for (let i = 0; i < 21; i++) {
    const live = liveNormalized[i];
    const template = templateNormalized[i];

    const dx = live.x - template.x;
    const dy = live.y - template.y;
    const dz = live.z - template.z;

    totalDistance += Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  const averageDistance = totalDistance / 21;
  
  // Convert average distance into a percentage score.
  // High quality matches have an average distance of 0.15 - 0.25.
  // Using 0.70 as a normalized divisor ensures smooth, natural grading.
  const similarity = Math.max(0, 1 - (averageDistance / 0.70));
  return similarity;
}
