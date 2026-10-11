# Fidelx Vendor Android Firebase setup

Firebase app registration was added to the existing `fidelx-app` project for Android package `com.fidelx.vendor`.

This bundle includes `firebase/google-services.json` filtered to the vendor client only. The generated Android project is intentionally not included.

## Prepare the native Android project

From this `vendor/` directory, with Node.js/npm installed and network access available for dependencies:

```bash
npm install
npm run android:prepare
```

The script creates `android/` if missing, copies the vendor Firebase configuration to `android/app/google-services.json`, builds the web app, and runs `npx cap sync android`.

Then open `android/` in Android Studio, allow Gradle sync, and build/install the app. Confirm the final application ID is `com.fidelx.vendor`.

## Test notification registration

1. Install on a real Android device with Google Play services.
2. Sign in with a real account whose server-side role is `vendor`.
3. Enable push notifications and grant the Android permission.
4. Verify the backend registers the token with `app_type = 'vendor'` in `public.fcm_device_tokens`.
5. Send a test push through the deployed backend and confirm the vendor device receives it and the tap opens only a vendor route.

The front-end role hint is `VITE_APP_ROLE=vendor`; the backend must still derive/validate role from the authenticated account. Keep service-account credentials on the server; never place them in the app.

This source package has not been built with Android Gradle or tested on a physical device in this environment. A successful web build alone does not prove FCM delivery.
