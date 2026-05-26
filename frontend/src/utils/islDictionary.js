/**
 * Indian Sign Language (ISL) Core Vocabulary Dictionary
 * 
 * Each gesture is represented as an array of 21 normalized 3D coordinates.
 * Coordinates are normalized:
 * 1. Translation: Wrist (landmark 0) is translated to (0,0,0).
 * 2. Scaling: All coordinates scaled relative to the distance between wrist (0) and middle finger knuckle (9).
 */

export const ISL_DICTIONARY = {
  "NAMASTE": {
    name: "Namaste (Greetings 🙏)",
    // Open flat hand, fingers fully extended and close together, tilted upward
    landmarks: [
      {x: 0.0, y: 0.0, z: 0.0},       // 0: Wrist
      {x: -0.15, y: -0.22, z: -0.05}, // 1: Thumb CMC
      {x: -0.28, y: -0.38, z: -0.09}, // 2: Thumb MCP
      {x: -0.35, y: -0.52, z: -0.12}, // 3: Thumb IP
      {x: -0.39, y: -0.63, z: -0.14}, // 4: Thumb Tip
      {x: -0.12, y: -0.45, z: -0.08}, // 5: Index MCP
      {x: -0.18, y: -0.72, z: -0.12}, // 6: Index PIP
      {x: -0.21, y: -0.91, z: -0.14}, // 7: Index DIP
      {x: -0.22, y: -1.05, z: -0.15}, // 8: Index Tip
      {x: 0.0, y: -0.48, z: -0.05},   // 9: Middle MCP (Base of scaling)
      {x: 0.0, y: -0.78, z: -0.09},   // 10: Middle PIP
      {x: 0.0, y: -0.99, z: -0.11},   // 11: Middle DIP
      {x: 0.0, y: -1.14, z: -0.12},   // 12: Middle Tip
      {x: 0.12, y: -0.45, z: -0.06},  // 13: Ring MCP
      {x: 0.18, y: -0.73, z: -0.10},  // 14: Ring PIP
      {x: 0.20, y: -0.93, z: -0.12},  // 15: Ring DIP
      {x: 0.22, y: -1.07, z: -0.13},  // 16: Ring Tip
      {x: 0.23, y: -0.40, z: -0.07},  // 17: Pinky MCP
      {x: 0.32, y: -0.63, z: -0.11},  // 18: Pinky PIP
      {x: 0.36, y: -0.79, z: -0.13},  // 19: Pinky DIP
      {x: 0.39, y: -0.91, z: -0.14}   // 20: Pinky Tip
    ]
  },
  "DHANYAVAAD": {
    name: "Dhanyavaad (Thank you 🤝)",
    // Flat hand moving outward from mouth.
    landmarks: [
      {x: 0.0, y: 0.0, z: 0.0},
      {x: -0.18, y: -0.18, z: -0.04},
      {x: -0.32, y: -0.32, z: -0.08},
      {x: -0.42, y: -0.43, z: -0.11},
      {x: -0.48, y: -0.52, z: -0.13},
      {x: -0.08, y: -0.38, z: -0.06},
      {x: -0.10, y: -0.62, z: -0.10},
      {x: -0.11, y: -0.79, z: -0.12},
      {x: -0.12, y: -0.92, z: -0.13},
      {x: 0.0, y: -0.40, z: -0.04},
      {x: 0.0, y: -0.66, z: -0.08},
      {x: 0.0, y: -0.84, z: -0.10},
      {x: 0.0, y: -0.97, z: -0.11},
      {x: 0.08, y: -0.38, z: -0.05},
      {x: 0.10, y: -0.62, z: -0.09},
      {x: 0.11, y: -0.79, z: -0.11},
      {x: 0.12, y: -0.92, z: -0.12},
      {x: 0.15, y: -0.34, z: -0.06},
      {x: 0.20, y: -0.54, z: -0.10},
      {x: 0.22, y: -0.69, z: -0.12},
      {x: 0.24, y: -0.80, z: -0.13}
    ]
  },
  "HAAN": {
    name: "Haan (Yes ✅)",
    // A solid closed fist gesture representing confirmation
    landmarks: [
      {x: 0.0, y: 0.0, z: 0.0},
      {x: -0.12, y: -0.10, z: -0.02},
      {x: -0.20, y: -0.18, z: -0.04},
      {x: -0.22, y: -0.26, z: -0.06},
      {x: -0.20, y: -0.32, z: -0.08},
      {x: -0.08, y: -0.18, z: -0.04},
      {x: -0.15, y: -0.28, z: -0.06},
      {x: -0.10, y: -0.26, z: -0.05},
      {x: -0.06, y: -0.22, z: -0.04},
      {x: 0.0, y: -0.20, z: -0.03},
      {x: 0.0, y: -0.32, z: -0.06},
      {x: 0.0, y: -0.30, z: -0.05},
      {x: 0.0, y: -0.24, z: -0.04},
      {x: 0.08, y: -0.18, z: -0.04},
      {x: 0.14, y: -0.28, z: -0.06},
      {x: 0.10, y: -0.26, z: -0.05},
      {x: 0.06, y: -0.22, z: -0.04},
      {x: 0.15, y: -0.15, z: -0.04},
      {x: 0.24, y: -0.24, z: -0.06},
      {x: 0.20, y: -0.22, z: -0.05},
      {x: 0.16, y: -0.18, z: -0.04}
    ]
  },
  "NAHI": {
    name: "Nahi (No ❌)",
    // Index finger pointing up, all other fingers fully curled/closed
    landmarks: [
      {x: 0.0, y: 0.0, z: 0.0},
      {x: -0.10, y: -0.12, z: -0.03},
      {x: -0.18, y: -0.20, z: -0.05},
      {x: -0.22, y: -0.28, z: -0.07},
      {x: -0.24, y: -0.34, z: -0.09},
      {x: -0.08, y: -0.35, z: -0.06}, // Index base
      {x: -0.12, y: -0.62, z: -0.09}, // Index mid
      {x: -0.14, y: -0.80, z: -0.11}, // Index top
      {x: -0.15, y: -0.94, z: -0.12}, // Index Tip (POINTING UP!)
      {x: 0.0, y: -0.25, z: -0.04},   // Middle base (closed)
      {x: 0.05, y: -0.38, z: -0.07},
      {x: 0.02, y: -0.34, z: -0.06},
      {x: -0.01, y: -0.28, z: -0.05},
      {x: 0.08, y: -0.22, z: -0.04},  // Ring base (closed)
      {x: 0.12, y: -0.32, z: -0.06},
      {x: 0.09, y: -0.29, z: -0.05},
      {x: 0.06, y: -0.24, z: -0.04},
      {x: 0.15, y: -0.18, z: -0.04},  // Pinky base (closed)
      {x: 0.20, y: -0.26, z: -0.06},
      {x: 0.17, y: -0.23, z: -0.05},
      {x: 0.14, y: -0.19, z: -0.04}
    ]
  },
  "HELP": {
    name: "Help (Sahaayata 🆘)",
    // Open palm facing directly up, flat horizontal alignment
    landmarks: [
      {x: 0.0, y: 0.0, z: 0.0},
      {x: -0.20, y: -0.12, z: 0.0},
      {x: -0.36, y: -0.18, z: 0.0},
      {x: -0.48, y: -0.22, z: 0.0},
      {x: -0.56, y: -0.25, z: 0.0},
      {x: -0.12, y: -0.35, z: 0.0},
      {x: -0.20, y: -0.56, z: 0.0},
      {x: -0.24, y: -0.70, z: 0.0},
      {x: -0.26, y: -0.80, z: 0.0},
      {x: 0.0, y: -0.38, z: 0.0},
      {x: 0.0, y: -0.62, z: 0.0},
      {x: 0.0, y: -0.78, z: 0.0},
      {x: 0.0, y: -0.90, z: 0.0},
      {x: 0.12, y: -0.35, z: 0.0},
      {x: 0.20, y: -0.56, z: 0.0},
      {x: 0.24, y: -0.70, z: 0.0},
      {x: 0.26, y: -0.80, z: 0.0},
      {x: 0.22, y: -0.30, z: 0.0},
      {x: 0.32, y: -0.48, z: 0.0},
      {x: 0.38, y: -0.60, z: 0.0},
      {x: 0.42, y: -0.70, z: 0.0}
    ]
  }
};
