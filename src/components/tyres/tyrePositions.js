export const TYRE_POSITIONS = [
  { id: 'FL', label: 'Front Left', order: 0 },
  { id: 'FR', label: 'Front Right', order: 1 },
  { id: 'RL', label: 'Rear Left', order: 2 },
  { id: 'RR', label: 'Rear Right', order: 3 },
  { id: 'SPARE', label: 'Spare', order: 4 },
];

export const ROTATABLE_POSITIONS = TYRE_POSITIONS.filter((p) => p.id !== 'SPARE').map((p) => p.id);
