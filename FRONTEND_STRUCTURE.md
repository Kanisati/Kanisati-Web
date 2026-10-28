# Frontend structure

The Home page composes the existing features. API requests, shared feature state, and reusable UI live in separate layers.

## Where code belongs

| Location | Responsibility |
| --- | --- |
| `src/pages/Home/index.jsx` | Compose the toolbar, discovery, Mass times, events, and dialogs. |
| `src/components/ui/` | Shared buttons, inputs, select fields, dialogs, cards, sections, request feedback, and pagination controls. |
| `src/components/Home/` | Discovery toolbar, search layout, and the Leaflet map. |
| `src/components/churches/` | Church results, favorites buttons, church profiles, and review UI. |
| `src/components/events/` | Event list and detail dialog. |
| `src/components/massSchedules/` | Nearby Mass occurrences. |
| `src/auth/` | Account control and the login/registration form. |
| `src/contexts/` | Providers and hooks for state shared by feature components. |
| `src/hooks/` | Reusable resource, pagination, and form behavior. |
| `src/api/` | Endpoint paths, payloads, and response-envelope normalization. `client.js` owns HTTP behavior; `auth.js` owns sessions and refresh. |
| `src/utils/` | Shared date formatting, coordinates, and error formatting. |

## Context ownership

- `AuthProvider` wraps the app. `useAuth()` exposes the session, account identity, user permissions, and authentication actions.
- `AccountProvider` is scoped to the My account dialog. `useAccount()` loads the current profile, saves changed first/last names through `/accounts/me`, and changes passwords through `/accounts/me/password`. Account UI lives in `src/components/account/`. Password drafts stay local to `PasswordForm` and are cleared after a successful change; confirmation is never sent to the API.
- `HomeProviders` scopes discovery, Mass schedules, events, and favorites to the Home page.
- `useDiscovery()` exposes the search, location, map view, selected church, and church details.
- `useMassSchedule()` exposes paginated occurrences for the current location and fixed seven-day window.
- `useEvents()` exposes paginated events and the selected event's details.
- `useFavorites()` shares saved-church state between search cards and the church dialog.
- `ReviewsProvider` is scoped to the selected church dialog. `useReviews()` exposes the public review list, save action, and delete-own-review action. Both mutations refresh the reviews and average rating.

Context definitions and consumer hooks are in `*Context.js`; providers are in `*Provider.jsx`. Keeping these exports separate supports React Fast Refresh.

Keep state in context when multiple components use it. Form drafts and validation use `useFormState` inside their forms; an individual dialog's display controls can remain local. Avoid putting unrelated input state into a global context.

## Shared components

Import the shared UI through its entry point:

```jsx
import { Button, Input, Dialog, Feedback } from '../../components/ui';

<Input label="Email" type="email" {...form.field('email')} required />
<Input kind="password" label="Password" {...form.field('password')} />
<Input kind="textarea" label="Comment" {...form.field('comment')} />
<Button type="submit" loading={form.submitting}>Save</Button>
<Feedback message={form.error} />
```

Inputs accept the API's field-error arrays. Buttons default to `type="button"`; submit buttons explicitly opt in. Dialogs share the layer above Leaflet, and select menus remain inside their dialog. Mantine layout and typography components can still be used directly.

## Data and pagination

`useApiResource(load, key, enabled)` manages a single request. Keep `load` stable with a module function or `useCallback`, and change `key` when the selected record or account changes. It ignores responses from obsolete requests and exposes `refresh()` and `updateData()`.

`usePaginatedResource(loadPage, key, enabled)` expects each API adapter to return `{ items, pagination, summary? }`. It exposes `items`, `status`, `error`, `hasMore`, `loadingMore`, `loadMore()`, and `refresh()`. API adapters translate the backend's `data`, `data.items`, and `meta` envelopes. Pagination keeps the original query, including Mass search timestamps.

Public GET requests still use the shared client's in-flight deduplication. Protected actions still use `authenticatedApiRequest` for token refresh and a single retry. Components should call their feature actions rather than construct endpoint URLs.

## Checks

Church registration uses its own form under `src/auth/`, reachable from Sign in → Register a church. It submits the required name, phone, address, email, and password to `/auth/register/church`, establishes the returned session, and explains pending approval. Owner management screens are separate future steps.

Church details load paginated upcoming events through `ChurchEventsProvider` and `/events/churches/:churchId`, replacing the embedded event list. View event closes church details and opens the existing event modal, where registration is available.

Church details load recurring Mass schedules through `ChurchSchedulesProvider` and `/mass-schedules/churches/:churchId`. The section includes pagination, retry, empty states, and the church timezone. It replaces the embedded schedule list; dated occurrences remain in the Home Mass search.

Saved churches is a user-only account tab with paginated favorites and removal. Favorite mutations notify the Home favorites provider to reload saved IDs. The profile photo feature was removed at the user's request.

The My registrations tab is available to user accounts. It mounts `RegistrationsProvider` on demand and loads `/events/registrations/mine`, with upcoming/all filters, pagination, and refresh. Event dates use the church timezone when provided. Signed-in users can register from event details using POST /events/:eventId/registrations. Successful registration refreshes events and capacity; API conflicts are displayed without assuming every conflict means a duplicate. My registrations supports cancellation before the event starts through DELETE /events/:eventId/registrations. An inline confirmation precedes the request, errors remain visible, and success refreshes the registration list from page one.

The Notifications tab mounts `NotificationsProvider` on demand. It loads `GET /accounts/me/notifications` with pagination, displays `meta.unreadCount`, and supports refresh/retry. Viewing notifications does not mark them read. Explicit actions mark one/all as read or delete a notification after confirmation. Mutations show feedback and refresh the list from page one with the latest unread count.

The Security tab also offers confirmed sign-out across devices via `POST /auth/logout-all`. Local credentials are cleared after success; other devices cannot refresh their sessions. Existing access tokens may remain valid until expiry.

Account deactivation lives in the Security tab and requires explicit confirmation. `AccountProvider` calls `DELETE /accounts/me`, clears the local session only after success, and closes the dialog with a signed-out confirmation. Failed requests show feedback in the confirmation panel.

Run `npm run lint` and `npm run build` after structural changes. For a browser smoke check, exercise search and location, open church/event dialogs, sign in, save a church, submit a review, and load another page when results are available.
