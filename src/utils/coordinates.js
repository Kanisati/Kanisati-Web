export const BEIRUT = [33.8938, 35.5018];

export function coordinatesOf(church) {
  if (church.latitude == null || church.longitude == null) return null;
  const latitude = Number(church.latitude);
  const longitude = Number(church.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? [latitude, longitude] : null;
}
