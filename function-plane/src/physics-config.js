// Function Plane — Ball physics tuning
//
// energyRetention: fraction of total speed kept after each *real bounce*
//   (significant normal-velocity impact; sliding contact does NOT trigger it,
//   so a ball rolling along a slope keeps its tangential momentum).
//   1.0 = no energy loss on bounce
//   0.0 = instant full stop on first impact
//
// bounciness: coefficient of restitution for the surface-normal velocity
//   component, applied on every contact (slide or bounce).
//   0.0 = no bounce (ball settles onto curve)
//   1.0 = perfectly elastic bounce
//   Values above ~0.4 make most levels very hard to solve.

const PHYSICS_CONFIG = {
  energyRetention: 0.985,
  bounciness:      0.5,
};

window.PHYSICS_CONFIG = PHYSICS_CONFIG;
