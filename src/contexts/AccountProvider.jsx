import { getAccountProfile, updateAccountProfile } from '../api/accounts';
import { useApiResource } from '../hooks/useApiResource';
import { useAuth } from './AuthContext';
import { AccountContext } from './AccountContext';

export default function AccountProvider({ children }) {
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
  return <AccountContext.Provider value={{ ...profile, saveProfile }}>{children}</AccountContext.Provider>;
}
