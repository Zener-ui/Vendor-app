# Fidelx Vendor Android source

- Role: `vendor`
- Android application ID: `com.fidelx.vendor`
- Display name: `Fidelx Vendor`
- FCM app type: derived by the backend from the authenticated user's server-side role; frontend sends `VITE_APP_ROLE=vendor` as a compatibility hint only.
- Notification tap fallback: `/vendor/dashboard` (role notification centre route is used where available).

## Build

```bash
npm install
npm run build
npx cap add android   # only if this variant has no android/ directory yet
npx cap sync android
npx cap open android
```

Build and sign each role app separately. The source bundle intentionally omits generated `android/` projects and build outputs so package IDs cannot be accidentally shared. Follow `FIREBASE-SETUP-REQUIRED.md` before testing native push.

## Notification flow

- Authenticated native app obtains its FCM token using Capacitor Push Notifications.
- Existing API helper registers the token through `/api/push/fcm/register`.
- Backend must determine the user's role server-side and bind the token to the role-specific `app_type`.
- Push taps are handled by `NativePushBridge.jsx`; external URLs and cross-role routes are rejected.
- The notification payload is a navigation hint only. Every protected screen/API still enforces authorization.
