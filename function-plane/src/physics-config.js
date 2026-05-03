// Function Plane — Ball physics tuning
//
// energyRetention: fraction of total speed kept after each surface contact.
//   1.0 = no energy loss (ball rolls forever)
//   0.0 = instant full stop on first touch
//   Default 0.997 gives a very slight rolling friction.
//
// bounciness: coefficient of restitution for the surface-normal velocity component.
//   0.0 = no bounce (ball sticks to curve, current default behaviour)
//   1.0 = perfectly elastic bounce (reflects at full speed)
//   Values above ~0.4 make most levels very hard to solve.

const PHYSICS_CONFIG = {
  energyRetention: 0.997,
  bounciness:      0.0,
};

window.PHYSICS_CONFIG = PHYSICS_CONFIG;
