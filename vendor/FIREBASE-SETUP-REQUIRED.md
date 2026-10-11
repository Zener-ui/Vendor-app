# Firebase setup required — Fidelx Vendor Android app

This source is role-wired but cannot receive native FCM notifications until its Android application is registered in the Fidelx Firebase project.

1. Register Android package `com.fidelx.vendor` in the existing Firebase project `fidelx-app`.
2. Download that app's `google-services.json` and place it in the generated `android/app/` directory after `npx cap add android`.
3. Build and install the Android app, sign in with an account whose server-side role is `vendor`, and enable notifications.
4. Confirm the token is saved with `app_type = 'vendor'` in `public.fcm_device_tokens`.

Do not copy the customer app's `google-services.json`: it is registered for `com.fidelx.app` only. Keep Firebase service-account credentials on the server; never place them in the app.
