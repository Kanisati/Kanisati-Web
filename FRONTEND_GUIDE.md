# Kanisati Frontend Guide

This guide describes the API and the frontend surfaces supported by the current backend. It is based on `src/routes`, controllers, validators, services, and `prisma/schema.prisma`.

The repository contains backend code only. It does not define a frontend framework, design tokens, typography, colors, or a component library. The screen and visual guidance below is a product-facing recommendation based on the data and actions the API provides.

## 1. Connect to the API

The server exposes both the original paths and versioned aliases. Use the versioned prefix for new clients:

```text
Development: http://localhost:3000/api/v1
Production:  https://kanisati.duckdns.org/api/v1
```

The same endpoints are also available under `/api`. Health checks are outside the API prefix:

- `GET /health` — process health.
- `GET /health/ready` — database readiness.
- `GET /openapi.yaml` — currently a partial OpenAPI document; it does not list the complete current API.

Send JSON with `Content-Type: application/json`. For protected routes send:

```http
Authorization: Bearer <accessToken>
```

The API does not currently use cookie sessions or accept image uploads. Image fields take HTTP(S) URLs, so the frontend needs an image-hosting/upload flow outside this API.

Configure `CORS_ORIGINS` on the backend to include the frontend's exact origin. The default is `http://localhost:3000`.

## 2. Response and error conventions

Most business API responses include `success`; detail and mutation responses commonly use this shape:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Collection responses use more than one envelope and pagination shape. For example, church search nests `items` inside `data`, while event and schedule search put the collection directly in `data`. Follow the response shown by each endpoint group below; do not assume every collection is at `data.items`.

Typical errors look like:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Please provide a valid email address"]
  }
}
```

Validation errors use HTTP `400`. Other common statuses are `401` unauthenticated/invalid session, `403` wrong role or forbidden action, `404` missing or non-public record, `409` conflict/duplicate, and `429` rate limited. A malformed JSON body returns `400`; unexpected errors return `500`.

Pagination defaults to page `1` and limit `20` unless noted. A response may provide either:

- `pagination: { page, limit, total, totalPages }` (church discovery adds `hasNextPage` and `hasPreviousPage`), or
- `meta: { page, limit, total, totalPages }` (some responses add `unreadCount`).

Treat timestamps as ISO 8601 values. Schedule clock times use 24-hour `HH:mm`. Days are enum strings: `MONDAY` through `SUNDAY`. Roles are `USER`, `CHURCH`, `ADMIN`.

## 3. Authentication and accounts

### Session behavior

Registration and login return `data.accessToken`, `data.refreshToken`, `data.expiresIn`, account fields, and a legacy `data.token` alias for the access token. Use `accessToken` for API requests. Refresh tokens rotate: after refreshing, replace the old refresh token with the new one. Coordinate refresh calls so concurrent `401` responses do not try to reuse the same single-use refresh token.

Defaults in the backend are a 15-minute access token and 30-day refresh token. The exact `expiresIn` value is returned by the server. A church session also includes `churchStatus` (`PENDING`, `APPROVED`, `REJECTED`, or `SUSPENDED`).

### Endpoints

| Method and path                         | Access             | Purpose / request                                   |
| --------------------------------------- | ------------------ | --------------------------------------------------- |
| `POST /auth/register/user`              | Public             | `{ email, password, firstName, lastName }`          |
| `POST /auth/register/church`            | Public             | Church registration; fields below                   |
| `POST /auth/login`                      | Public             | `{ email, password }`                               |
| `POST /auth/refresh`                    | Public             | `{ refreshToken }`; rotates refresh token           |
| `POST /auth/logout`                     | Public             | `{ refreshToken }`; revokes that session            |
| `POST /auth/logout-all`                 | Any signed-in role | Revokes all refresh tokens for the account          |
| `GET /auth/profile`                     | Any signed-in role | Legacy account profile endpoint                     |
| `POST /auth/email-verification/request` | Any signed-in role | Creates a verification token                        |
| `POST /auth/email-verification/verify`  | Public             | `{ token }`                                         |
| `POST /auth/forgot-password`            | Public             | `{ email }`                                         |
| `POST /auth/reset-password`             | Public             | `{ token, password }`                               |
| `GET /accounts/me`                      | Any signed-in role | Current account profile; preferred profile endpoint |
| `PATCH /accounts/me`                    | Any signed-in role | Partial account profile update                      |
| `PATCH /accounts/me/password`           | Any signed-in role | `{ currentPassword, newPassword }`                  |
| `DELETE /accounts/me`                   | Any signed-in role | Deactivates the account and its sessions            |

Password rules for registration and reset: at least 8 characters, one uppercase letter, one lowercase letter, one number, and no more than 72 UTF-8 bytes. Password change accepts up to 128 characters and requires a different password.

Church registration requires `email`, `password`, `churchName`, `phone`, and either `formattedAddress` or the legacy `location` field. Optional fields: `churchDescription`, `denomination`, `city`, `region`, `country`, `postalCode`, `latitude`, `longitude`, `website`, `timezone`. Coordinates must be supplied together. New churches start with status `PENDING` and cannot publish events until approved.

Account profile updates accept any subset of `firstName`, `lastName`, `avatarUrl`, `latitude`, `longitude`; coordinates must be changed together. Use `null` to clear nullable values. Email and role are not editable through this endpoint.

### Verification and reset flow limitation

The current service creates verification and password-reset tokens but does not send email. It includes the token in API data only outside production; production responses omit it. Email delivery therefore needs to be integrated server-side before these flows can work for production users. The forgot-password response is intentionally generic whether or not the email exists.

## 4. Church discovery and profiles

### Public endpoints

| Method and path                          | Purpose                                                     |
| ---------------------------------------- | ----------------------------------------------------------- |
| `GET /churches`                          | Search approved, active churches                            |
| `GET /churches/nearby`                   | Search by coordinates and radius                            |
| `GET /churches/amenities`                | Get amenity IDs, slugs, names, and descriptions for filters |
| `GET /churches/:churchId`                | Get public church detail                                    |
| `GET /churches/:churchId/reviews`        | Paginated published reviews                                 |
| `GET /mass-schedules/churches/:churchId` | Active public recurring schedules                           |
| `GET /events/churches/:churchId`         | Future published events for a church                        |

`GET /churches` supports these query parameters:

| Parameter                                   | Meaning                                                                                             |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `q`                                         | Partial-text search across name, description, denomination, formatted address, city, and region     |
| `denomination`, `city`, `region`, `country` | Exact categorical/location filters                                                                  |
| `minRating`                                 | Minimum rating from `0` to `5`                                                                      |
| `amenities`                                 | Amenity slugs; comma-separated or repeated query parameter; a church must match every selected slug |
| `massDay`                                   | Day enum, such as `SUNDAY`                                                                          |
| `massLanguage`, `serviceType`               | Filter by schedule language/service type                                                            |
| `hasUpcomingEvents`, `openNow`              | Boolean filters (`true` or `false`)                                                                 |
| `sort`                                      | `rating`, `name`, or `newest`                                                                       |
| `page`, `limit`                             | Page defaults to 1; limit defaults to 20 and maxes at 50                                            |

`GET /churches/nearby` accepts the same filters, plus required `latitude` and `longitude`, `radiusKm` (default 5; allowed 5–200), and `sort` (`distance`, `rating`, `name`, or `newest`). Its result is `{ success, data: { items, search, pagination } }`; each item includes `distanceKm`.

Church list items are summary objects with `id`, `name`, address/location fields, denomination, coordinates, `timezone`, rating/favorite counts, `image` (one image object or `null`), and `amenities` (array of amenity objects). Standard list results are `{ success, data: { items, pagination } }`.

Church detail is `{ success, data: church }`. The detail includes all public image records, amenities, opening hours, active mass schedules, up to 20 upcoming published events, and up to 20 newest published reviews. Use the paginated review/event/schedule endpoints when the screen needs more records. The schedule endpoint accepts `page`, `limit`, `dayOfWeek`, and `asOf`.

Reviews accept `page` and `limit` (max 50); response fields include `data.church.rating` and `data.reviews`, with paging in `meta`.

### User favorites and reviews

| Method and path                           | Access | Request / behavior                                                         |
| ----------------------------------------- | ------ | -------------------------------------------------------------------------- |
| `GET /accounts/me/favorites`              | `USER` | `page`, `limit` (max 50); returns favorite church summaries and `meta`     |
| `PUT /accounts/me/favorites/:churchId`    | `USER` | Idempotently adds a favorite; response includes `isFavorite` and `created` |
| `DELETE /accounts/me/favorites/:churchId` | `USER` | Removes a favorite; response includes `isFavorite: false`                  |
| `POST /churches/:churchId/reviews`        | `USER` | `{ rating, comment? }`; rating is an integer 1–5, comment max 1000 chars   |
| `PATCH /churches/:churchId/reviews/me`    | `USER` | Partial `{ rating?, comment? }`; a user has at most one review per church  |
| `DELETE /churches/:churchId/reviews/me`   | `USER` | Deletes the signed-in user's review                                        |

An existing review cannot be created twice; update it instead. Rating aggregates update with review create, update, and delete.

## 5. Church owner tools

All `/churches/me/...`, `/mass-schedules/mine...`, and owner event endpoints require a signed-in `CHURCH` account and only operate on that account's own church.

### Church profile and content

| Method and path                       | Request / behavior                                               |
| ------------------------------------- | ---------------------------------------------------------------- |
| `GET /churches/me/profile`            | Church profile including images, amenities, hours, and schedules |
| `PATCH /churches/me/profile`          | Partial profile update; fields below                             |
| `POST /churches/me/images`            | `{ url, altText?, displayOrder? }`; maximum 20 images            |
| `PATCH /churches/me/images/:imageId`  | Partial `{ url?, altText?, displayOrder? }`                      |
| `DELETE /churches/me/images/:imageId` | Deletes an owned image                                           |
| `PUT /churches/me/amenities`          | Replaces the full selection: `{ amenityIds: string[] }`          |
| `PUT /churches/me/opening-hours`      | Replaces the full week: `{ hours: [...] }`                       |

Profile fields: `name`, `description`, `denomination`, `formattedAddress`, `addressLine1`, `city`, `region`, `country`, `postalCode`, `latitude`, `longitude`, `phone`, `website`, and `timezone`. Send only changed fields; use `null` to clear nullable fields. Latitude and longitude must be updated/cleared together. `timezone` must be a valid IANA zone, such as `Asia/Beirut`.

Each opening-hours entry has `{ dayOfWeek, isClosed, opensAt?, closesAt? }`. Open hours require both times in `HH:mm`; `isClosed: true` can omit the times. The `hours` array replaces all existing opening hours, so submit the complete intended week (or an empty array to clear it). Amenities similarly replace the complete selection.

### Mass schedules

| Method and path                                  | Purpose / request                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------- |
| `GET /mass-schedules/mine`                       | Owner's schedules; filters `page`, `limit`, `dayOfWeek`, `isActive` |
| `GET /mass-schedules/mine/:scheduleId`           | One owned schedule                                                  |
| `POST /mass-schedules`                           | Create a recurring schedule                                         |
| `PATCH /mass-schedules/:scheduleId`              | Partial schedule update                                             |
| `DELETE /mass-schedules/:scheduleId`             | Delete schedule                                                     |
| `GET /mass-schedules/exceptions/mine`            | List dated overrides                                                |
| `POST /mass-schedules/exceptions`                | Create a cancellation or one-off special service                    |
| `DELETE /mass-schedules/exceptions/:exceptionId` | Delete an owned override                                            |

Create schedule body: `{ dayOfWeek, startTime, endTime?, serviceType?, language?, notes?, isActive?, validFrom?, validUntil? }`. `startTime` is required; times use `HH:mm`; `endTime` must be later than `startTime` when provided. Validity dates are ISO 8601 and `validUntil` cannot precede `validFrom`. Update accepts any subset; nullable fields can be cleared with `null`.

Exception body:

```json
{
  "type": "CANCELLED",
  "scheduleId": "schedule-id",
  "serviceDate": "2026-11-01",
  "notes": "Cancelled for the feast day"
}
```

`type` is `CANCELLED` or `SPECIAL`. Cancellation requires an owned `scheduleId`; special service requires `startTime` and can omit `scheduleId`. Both use a calendar `serviceDate`; optional fields include `endTime`, `serviceType`, `language`, and `notes`.

### Find Mass occurrences

`GET /mass-schedules/search` is public. Query fields: `from`, `to` (ISO timestamps; default is now through 7 days), `latitude` + `longitude` together, `radiusKm`, `language`, `serviceType`, `denomination`, `page`, `limit`. Search window is at most 31 days. With no location it searches all approved churches; when location is supplied, radius defaults to 25 km. Response is `{ success, data: occurrences, pagination }`. Occurrences have `kind` (`RECURRING` or `SPECIAL`), `startsAt`, `schedule`, `church`, and optional `distanceKm`. `startsAt` is calculated from the church's IANA timezone, including daylight saving transitions.

## 6. Events and registrations

Public event endpoints only show future `PUBLISHED` events belonging to approved churches with active owners.

| Method and path                         | Access   | Purpose / request                                               |
| --------------------------------------- | -------- | --------------------------------------------------------------- |
| `GET /events`                           | Public   | Filters: `page`, `limit` (max 100), `churchId`, `from`, `to`    |
| `GET /events/churches/:churchId`        | Public   | Same filters, scoped to a church                                |
| `GET /events/:eventId`                  | Public   | Public event detail                                             |
| `GET /events/mine`                      | `CHURCH` | Owner event list; filters `page`, `limit`, `status`, `upcoming` |
| `GET /events/mine/:eventId`             | `CHURCH` | One owned event, including drafts/cancellations                 |
| `POST /events`                          | `CHURCH` | Create draft; body below                                        |
| `PATCH /events/:eventId`                | `CHURCH` | Partial update; body fields below                               |
| `POST /events/:eventId/publish`         | `CHURCH` | Publish a future draft; church must be approved                 |
| `POST /events/:eventId/cancel`          | `CHURCH` | Cancel a published event                                        |
| `DELETE /events/:eventId`               | `CHURCH` | Delete draft only; drafts with registrations cannot be deleted  |
| `POST /events/:eventId/registrations`   | `USER`   | Register for a future published event with capacity available   |
| `DELETE /events/:eventId/registrations` | `USER`   | Remove registration before the event starts                     |
| `GET /events/registrations/mine`        | `USER`   | List registrations; filters `page`, `limit`, `upcoming`         |

Create event body: `{ title, startAt, description?, endAt?, location?, latitude?, longitude?, imageUrl?, registrationUrl?, capacity? }`. `title` is 3–160 characters; `startAt` must be a future ISO 8601 timestamp; `endAt` must be later than start; coordinates must be paired; capacity, when set, must be a positive integer. `PATCH` accepts a non-empty subset of these fields; send `null` to clear nullable values. `capacity: null` means unlimited capacity.

Event list responses are `{ success, data: events, pagination }`. Event objects include `church`, `status`, `registrationCount`, and `remainingCapacity` (`null` means unlimited). Registration records contain an `event` object. Event statuses are `DRAFT`, `PUBLISHED`, and `CANCELLED`.

## 7. Notifications

| Method and path                                         | Access    | Purpose / request                                                              |
| ------------------------------------------------------- | --------- | ------------------------------------------------------------------------------ |
| `GET /accounts/me/notifications`                        | Signed in | `page`, `limit` (max 50), `unreadOnly`; response `meta` includes `unreadCount` |
| `PATCH /accounts/me/notifications/read-all`             | Signed in | Marks all notifications read                                                   |
| `PATCH /accounts/me/notifications/:notificationId/read` | Signed in | Marks one notification read                                                    |
| `DELETE /accounts/me/notifications/:notificationId`     | Signed in | Deletes one notification                                                       |

Notification types currently include `SYSTEM`, `CHURCH_APPROVED`, `CHURCH_REJECTED`, `EVENT_REMINDER`, and `NEW_REVIEW`. Each item has `title`, `message`, optional JSON `data`, `isRead`, `readAt`, and `createdAt`.

## 8. Admin endpoints

All `/admin` endpoints require an `ADMIN` bearer token.

| Method and path                           | Purpose / request                                    |
| ----------------------------------------- | ---------------------------------------------------- | ----------- |
| `GET /admin/stats`                        | Dashboard counts                                     |
| `GET /admin/churches`                     | Filter by `status`, `query`, `page`, `limit`         |
| `PATCH /admin/churches/:churchId/status`  | `{ status, reason? }`; rejection requires a reason   |
| `GET /admin/accounts`                     | Filter by `role`, `active`, `query`, `page`, `limit` |
| `PATCH /admin/accounts/:accountId/active` | `{ isActive }`                                       |
| `PATCH /admin/reviews/:reviewId/status`   | `{ status: "PUBLISHED"                               | "HIDDEN" }` |
| `POST /admin/amenities`                   | `{ slug, name, description? }`                       |
| `PATCH /admin/amenities/:amenityId`       | Partial `{ slug?, name?, description? }`             |
| `DELETE /admin/amenities/:amenityId`      | Deletes amenity                                      |
| `GET /admin/audit-logs`                   | Paginated moderation/account audit trail             |

Church statuses are `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`. Admin lists use `page` and `limit` (max 100), and return `{ success, data, meta }`.

## 9. Frontend screen and design plan

These are recommended screens derived from available backend features, not existing layouts or a prescribed brand style.

### Public/user experience

1. **Discover** — prominent search; filter chips/drawer for location, denomination, service day/language, amenities, rating, open now, and upcoming events; church cards with name, primary image, location, denomination, rating, and favorite action. Use `/churches/amenities` to build amenity filters and `/churches` for results.
2. **Nearby** — request browser location only after a clear user action; provide manual city/search fallback; show radius and distance controls; offer a map/list switch if the frontend has a map provider. Use `/churches/nearby`; preserve active filters when toggling views.
3. **Church detail** — image gallery, name/location/contact, rating, amenities, opening-hours table, Mass schedule, upcoming events, reviews, directions/contact links, and favorite/review actions. Display approval/private owner data nowhere on public detail. For long sections, load their paginated endpoints instead of relying only on the first 20 nested detail records.
4. **Events** — chronological event list and detail with church link, date/time, capacity/availability, registration link, and register/cancel state. Hide registration controls for guests and show clear full/cancelled/past states.
5. **Account** — profile form, saved location, favorites, notifications, password change, and account deactivation. Include an explicit confirmation before deactivation.
6. **Sign in / sign up** — separate user and church registration. After church registration, show a pending-approval state and explain that event publishing is unavailable until approval. Keep reset/verification screens ready for email-link flows once backend email delivery is configured.

### Church portal

Use a separate owner area with navigation for **Overview/status**, **Profile**, **Photos**, **Amenities**, **Opening hours**, **Mass schedule**, **Events**, and **Notifications**. Show the current church status near the top. Since opening-hours and amenities updates replace the entire set, make their edit forms explicit and save the full form state together. For schedule/event mutations, show success feedback and refresh the affected list. Event actions should reflect backend rules: publish requires an approved church; delete is draft-only; cancellation is for published events.

### Admin portal (if in scope)

Provide a count dashboard, church review queue with approve/reject/suspend actions, account management, review moderation, amenity management, and audit history. Require a reason for rejected churches and display it clearly to church owners.

### Visual and interaction guidance

- Start mobile-first; discovery cards, filter controls, detail sections, and owner forms should reflow cleanly to desktop.
- Establish the visual brand separately: this backend contains no brand palette, type scale, logo, or Figma/design assets to copy. Define color, typography, spacing, radius, elevation, and focus tokens once, then use them consistently.
- Use semantic headings, keyboard-operable controls, visible focus, labels for form fields, alt text for church images, and non-color-only status indicators.
- Provide loading, empty, error/retry, and success states for each data surface. For search, distinguish “no matches” from a failed request. Preserve filter selections when paging.
- Format event/occurrence times in the church's `timezone`; show the local time zone when it prevents ambiguity. Opening hours and recurring schedule `HH:mm` values are local wall-clock times for that church.
- Keep public versus owner/admin data separate in the UI. A church owner profile can expose `PENDING` details to that owner while public discovery returns approved churches only.

## 10. Suggested frontend API client shape

Centralize base URL, bearer token injection, JSON parsing, and error conversion. Keep feature screens from building URLs ad hoc. Example:

```ts
const API_BASE = `${import.meta.env.VITE_API_URL}/api/v1`;

async function api<T>(
  path: string,
  accessToken?: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });

  const body = await response.json();
  if (!response.ok) {
    throw Object.assign(new Error(body.message ?? "Request failed"), {
      status: response.status,
      errors: body.errors,
    });
  }
  return body as T;
}
```

The helper returns the actual endpoint envelope, so feature hooks should type each endpoint response accurately. Add a single coordinated refresh path for `401` responses and retry the original request at most once.

## 11. Source of truth

For future API changes, update this guide alongside route/validator changes. The current `openapi.yaml` covers only selected church and schedule endpoints; the route and validator files are the authoritative implementation today.
