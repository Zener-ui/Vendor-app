# Fidelx Android app source split

This bundle separates the existing Capacitor/React source into four independent app variants while retaining a common code architecture and backend API contract.

| Variant | Android application ID | FCM role | Firebase config |
|---|---|---|---|
| customer | `com.fidelx.app` | `customer` | Existing config retained |
| vendor | `com.fidelx.vendor` | `vendor` | Register app in Firebase and add its own config |
| rider | `com.fidelx.rider` | `rider` | Register app in Firebase and add its own config |
| admin | `com.fidelx.admin` | `admin` | Register app in Firebase and add its own config |

The source was derived from the provided customer Android/Capacitor source archive. It is **not** four signed or production-ready APKs: native Android projects are not present in the source archive, so each project must run Capacitor's Android platform setup and be built in Android Studio/CI. The customer package ID remains unchanged to avoid breaking its existing Firebase registration.

Role-specific builds set `VITE_APP_ROLE`; login rejects accounts whose server-reported role does not match the app. Push tap handling only accepts same-role internal paths. The server must remain the source of truth for roles and token app types.

Before deploying, merge the separately supplied role-aware backend patch and deploy it; do not rely on client-provided `app_type` for authorization. For vendor/rider/admin FCM, register each Android package in the existing Firebase project and provide its own `google-services.json`.
