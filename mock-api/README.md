# Mock API

A small local stand-in for the Organize My Group backend. Use it to run the app
without a server, for UI work, demos and README screenshots. All people,
groups and events in it are fictional.

It has no dependencies, only Node.

## Run it

1. Start the server:

   ```sh
   npm run mock-api
   ```

   It listens on `http://localhost:4000/api/` and logs every request.
   Requests marked `(default)` are not modelled and get a generic success
   response.

2. In `src/constants/endpoints.js`, set `USE_MOCK_API = true`.

3. Forward the port to the Android emulator or device:

   ```sh
   adb reverse tcp:4000 tcp:4000
   ```

   (Not needed on the iOS simulator.)

4. Start the app as usual (`npm start`, then `npm run android`) and log in
   with any email and password.

Set `USE_MOCK_API` back to `false` before committing.

## What it covers

| Area | Endpoints |
| --- | --- |
| Auth | `login`, `logout`, `token/refresh`, `user/check-password` |
| User | `user/me`, `user/view/:id`, `user/notifications` |
| Groups | `groups/manage`, `groups/view/:id`, `groups/search`, `groups/members/:id`, `groups/requests` |
| Events | `events/manage`, `events/upcoming`, `events/view/:id`, `events/members/:id`, `events/templates` |
| Payments | `payment/methods` |
| Message board | `forum/posts`, `forum/:id/posts/create` |
| Settings | `app/settings` |

Anything else (joining, editing, deleting) returns `200` with a success
message, so buttons work but nothing changes. New message board posts are kept
in memory until the server restarts.

Event dates are relative to today, so upcoming events always look upcoming.
Group and event images are placeholder illustrations in `mock-api/images`
(served under `/static/`), and avatars come from
`ui-avatars.com`, which needs internet access.

The Stripe payment flows call the real dev server directly and do not work
against the mock.
