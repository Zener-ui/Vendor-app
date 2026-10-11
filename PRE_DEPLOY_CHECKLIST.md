# Fidelx Android role-app rollout checklist

- [ ] Deploy the matching role-aware backend patch before testing FCM app-type registration.
- [ ] Verify `/api/push/fcm/register` derives `app_type` from authenticated `req.user.role`, not from the request body.
- [ ] Create Firebase Android app registrations for `com.fidelx.vendor`, `com.fidelx.rider`, and `com.fidelx.admin`; add the matching `google-services.json` to each generated Android project.
- [ ] Preserve `com.fidelx.app` for the current customer app unless intentionally migrating Firebase.
- [ ] Generate native platforms with `npx cap add android`, then `npm run cap:sync`.
- [ ] Sign in to each app with a matching server-side role. Confirm wrong-role login is rejected.
- [ ] Enable notifications and verify `public.fcm_device_tokens.app_type` is customer/vendor/rider/admin as appropriate.
- [ ] Send test notifications and verify tap destinations stay within the recipient's role namespace.
- [ ] Verify customer app notifications continue working before release.
- [ ] Build and install debug APKs on physical Android devices; this bundle does not include generated Android projects or signed APKs.
