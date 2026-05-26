/**
 * Normalizes a list of hand landmarks.
 * 
 * 1. Translation: Translates all coordinates relative to the wrist (landmark 0) at (0,0,0).
 * 2. Scaling: Scales all coordinates relative to the distance between wrist (0) and middle finger knuckle (9).
 */
export function normalizeLandmarks(landmarks) {
  // Convert array-like objects to native JS arrays for absolute safety
  const lmArray = Array.from(landmarks || []);
  if (lmArray.length < 10 || !lmArray[0] || !lmArray[9]) {
    return null;
  }

  const wrist = lmArray[0];
  
  // 1. Translate relative to wrist (index 0)
  const translated = lmArray.map(lm => ({
    x: lm.x - wrist.x,
    y: lm.y - wrist.y,
    z: lm.z - wrist.z
  }));

  // 2. Calculate palm size (wrist to middle finger base, index 9) as the scale factor
  const middleBase = translated[9];
  const scale = Math.sqrt(
    middleBase.x * middleBase.x + 
    middleBase.y * middleBase.y + 
    middleBase.z * middleBase.z
  );

  if (scale === 0) return translated;

  // 3. Scale all coordinates relative to palm size using safe map index parameter
  return translated.map((lm, idx) => ({
    x: idx === 0 ? 0 : lm.x / scale,
    y: idx === 0 ? 0 : lm.y / scale,
    z: idx === 0 ? 0 : lm.z / scale
  }));
}

/**
 * Calculates the average Euclidean distance between two landmark arrays.
 * Evaluates both normal and horizontally reflected versions to support left/right hands and mirroring.
 * Computes strictly in the 2D Silhouette Plane (x and y axes) for maximum noise-free precision.
 * Returns a similarity score between 0.0 and 1.0.
 */
export function calculateSimilarity(liveNormalized, templateLandmarks) {
  const live = Array.from(liveNormalized || []);
  const template = Array.from(templateLandmarks || []);

  if (live.length === 0 || template.length === 0) {
    return 0;
  }

  // Pre-normalize the template
  const templateNormalized = normalizeLandmarks(template);
  if (!templateNormalized) return 0;

  let totalDistanceNormal = 0;
  let totalDistanceFlipped = 0;

  // Safe length comparison matching up to minimum coordinate size
  const minLength = Math.min(live.length, templateNormalized.length);
  if (minLength === 0) return 0;

  for (let i = 0; i < minLength; i++) {
    const livePoint = live[i];
    const templatePoint = templateNormalized[i];

    if (!livePoint || !templatePoint) continue;

    // Y coordinate distance
    const dy = livePoint.y - templatePoint.y;

    // Normal X coordinate distance
    const dxNormal = livePoint.x - templatePoint.x;
    totalDistanceNormal += Math.sqrt(dxNormal * dxNormal + dy * dy);

    // Horizontally Flipped X coordinate distance (-templatePoint.x)
    const dxFlipped = livePoint.x - (-templatePoint.x);
    totalDistanceFlipped += Math.sqrt(dxFlipped * dxFlipped + dy * dy);
  }

  // Choose the best match (minimum distance)
  const averageDistance = Math.min(totalDistanceNormal, totalDistanceFlipped) / minLength;
  
  // Convert 2D average distance into a percentage score.
  // Using 0.40 as the max expected 2D distance divisor yields highly responsive, natural results.
  const similarity = Math.max(0, 1 - (averageDistance / 0.40));
  return similarity;
}
