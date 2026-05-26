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
 * Computes strictly in the 2D Silhouette Plane (x and y axes), ignoring noisy z-depth coordinates.
 * Returns a similarity score between 0.0 and 1.0.
 */
export function calculateSimilarity(liveNormalized, templateLandmarks) {
  if (!liveNormalized || !templateLandmarks || liveNormalized.length !== 21 || templateLandmarks.length !== 21) {
    return 0;
  }

  // Pre-normalize the template to guarantee they are compared on the exact same mathematical scale
  const templateNormalized = normalizeLandmarks(templateLandmarks);
  if (!templateNormalized) return 0;

  let totalDistance = 0;

  for (let i = 0; i < 21; i++) {
    const live = liveNormalized[i];
    const template = templateNormalized[i];

    // Compute strictly in the 2D plane (x & y coordinates).
    // The z coordinate represents depth relative to the wrist, which is highly noisy
    // and varies wildly based on camera angle and hand tilt.
    const dx = live.x - template.x;
    const dy = live.y - template.y;

    totalDistance += Math.sqrt(dx * dx + dy * dy);
  }

  const averageDistance = totalDistance / 21;
  
  // Convert 2D average distance into a percentage score.
  // In 2D space, a strong match has an average coordinate deviation under 0.18.
  // Using 0.40 as the max expected 2D distance divisor yields highly responsive, natural results.
  const similarity = Math.max(0, 1 - (averageDistance / 0.40));
  return similarity;
}
