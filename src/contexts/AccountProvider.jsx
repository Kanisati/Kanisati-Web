import { changeAccountPassword, deactivateAccount, getAccountProfile, updateAccountProfile } from '../api/accounts';
import { clearSession, signOutAllDevices } from '../api/auth';
import { useApiResource } from '../hooks/useApiResource';
import { useAuth } from './AuthContext';
import { AccountContext } from './AccountContext';

export default function AccountProvider({ children, onDeactivated, onSignedOutAll }) {
  const { accountKey, isSignedIn } = useAuth();
  const profile = useApiResource(getAccountProfile, accountKey, isSignedIn);
  const saveProfile = async (values) => {
    const changes = {};
    for (const name of ['firstName', 'lastName']) {
      const value = values[name].trim() || null;
      if (value !== (profile.data?.[name] ?? null)) changes[name] = value;
    }
    if (!Object.keys(changes).length) return 'No changes to save.';
    await updateAccountProfile(changes);
    profile.updateData((current) => ({ ...current, ...changes }));
    return 'Your profile was updated.';
  };
  const deactivate = async () => {
    await deactivateAccount();
    clearSession();
    onDeactivated?.();
  };
  const saveLocation = async (values) => {
    const latitude = values.latitude.trim();
    const longitude = values.longitude.trim();
    const errors = {};
    if (Boolean(latitude) !== Boolean(longitude)) {
      errors[latitude ? 'longitude' : 'latitude'] = ['Enter both coordinates, or clear both.'];
    }
    for (const [name, value, limit] of [['latitude', latitude, 90], ['longitude', longitude, 180]]) {
      if (value && (!Number.isFinite(Number(value)) || Math.abs(Number(value)) > limit)) {
        errors[name] = [`Enter a number between -${limit} and ${limit}.`];
      }
    }
    if (Object.keys(errors).length) throw Object.assign(new Error('Check your coordinates.'), { errors });
    const changes = { latitude: latitude ? Number(latitude) : null, longitude: longitude ? Number(longitude) : null };
    await updateAccountProfile(changes);
    profile.updateData((current) => ({ ...current, ...changes }));
    return latitude ? 'Your location was saved.' : 'Your saved location was cleared.';
  };
  const signOutEverywhere = async () => {
    await signOutAllDevices();
    clearSession();
    onSignedOutAll?.();
  };
  return <AccountContext.Provider value={{ ...profile, saveProfile, saveLocation, changePassword: changeAccountPassword, deactivate, signOutEverywhere }}>{children}</AccountContext.Provider>;
}
