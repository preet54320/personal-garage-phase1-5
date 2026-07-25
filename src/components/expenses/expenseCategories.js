export const EXPENSE_CATEGORIES = [
  'Fuel',
  'Service',
  'Repair',
  'Insurance',
  'Accessories',
  'Parking',
  'FASTag',
  'Toll',
  'Cleaning',
  'Loan EMI',
  'Interest',
  'Miscellaneous',
];

// Categories that also roll up into a dedicated vehicle-level stat bucket
export const CATEGORY_ROLLUP_FIELD = {
  Fuel: 'fuelCost',
  Service: 'maintenanceCost',
  Repair: 'maintenanceCost',
  Insurance: 'insuranceCost',
};

export const CATEGORY_COLORS = {
  Fuel: '#c77b3d',
  Service: '#7fa8ff',
  Repair: '#f5b942',
  Insurance: '#4cd97d',
  Accessories: '#c084fc',
  Parking: '#5eead4',
  FASTag: '#fb923c',
  Toll: '#f472b6',
  Cleaning: '#38bdf8',
  'Loan EMI': '#a3a3a3',
  Interest: '#e879f9',
  Miscellaneous: '#94a3b8',
};
