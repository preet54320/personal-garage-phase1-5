import { increment, updateDoc, serverTimestamp } from 'firebase/firestore';
import { vehicleDoc } from '../firebase/paths';

/**
 * Applies incremental deltas to a vehicle's rollup fields (totalExpenses,
 * fuelCost, maintenanceCost, insuranceCost) and optionally overwrites
 * point-in-time fields (currentOdometer, lastServiceDate, nextDueService)
 * when the new value supersedes the stored one.
 *
 * @param {string} uid
 * @param {string} vehicleId
 * @param {object} params
 * @param {object} [params.increments] - e.g. { totalExpenses: 1500, fuelCost: 1500 }
 * @param {number} [params.odometer] - only applied if greater than current
 * @param {string} [params.lastServiceDate]
 * @param {string} [params.nextDueService]
 */
export async function applyVehicleRollup(uid, vehicleId, currentVehicle, params = {}) {
  const { increments = {}, odometer, lastServiceDate, nextDueService } = params;

  const update = { updatedAt: serverTimestamp() };
  Object.entries(increments).forEach(([key, delta]) => {
    if (delta) update[key] = increment(delta);
  });

  if (odometer != null) {
    const current = Number(currentVehicle?.currentOdometer) || 0;
    if (Number(odometer) > current) update.currentOdometer = Number(odometer);
  }
  if (lastServiceDate) update.lastServiceDate = lastServiceDate;
  if (nextDueService) update.nextDueService = nextDueService;

  await updateDoc(vehicleDoc(uid, vehicleId), update);
}
