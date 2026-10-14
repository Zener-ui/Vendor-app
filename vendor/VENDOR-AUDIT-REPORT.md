# Fidelx Vendor App — Follow-up Audit

## Confirmed bugs corrected

1. **Vendor registration defaulted to customer.** `RegisterPage.jsx` only pinned the customer app role. The vendor build had `VITE_APP_ROLE=vendor`, but that value was not used to choose the initial role, so a plain `/register` route initialized `form.role` as `customer`. The vendor native app now initializes and locks registration to `vendor`, displays vendor-specific guidance, and validates the returned account role.
2. **Android launcher icon was not installed.** The workflow generated a fresh Capacitor Android project and synced it without replacing the default native launcher resources. Web/PWA icons alone do not replace Android launcher icons. The workflow now copies density-specific Fidelx icon assets and adaptive-icon resources into `android/app/src/main/res` before building.

## Validation status

Source and workflow changes were inspected and packaged. An Android APK build/device test has not been performed in this environment, so the generated APK still needs CI build verification and installation testing.
