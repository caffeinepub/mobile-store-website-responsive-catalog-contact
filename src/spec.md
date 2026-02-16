# Specification

## Summary
**Goal:** Restore Live admin access for the single specified Internet Identity principal and ensure the /admin page works end-to-end after deploys/upgrades.

**Planned changes:**
- Backend: hardcode/grant admin privileges to ONLY principal `yrzqp-j2xon-ju7hr-g5ger-pe7by-pn666-ywayt-ii77y-rq7wz-xelxd-bae` and ensure the frontend admin check resolves correctly for this principal and false for others.
- Backend: expose/align the admin-check and bootstrap interface expected by the frontend (e.g., `isCallerAdmin()` and/or `getCallerUserRole()`, plus `hasAnyAdmin()` and deterministic `claimInitialAdmin()` behavior) so the frontend no longer hits missing-method errors.
- Backend: persist admin/authorization configuration across canister upgrades so Live does not lose admin access after redeploy; add/adjust migration only if required by state shape changes while keeping existing data intact.
- Frontend: verify AdminGuard + /admin routing uses the deployed backend checks correctly; ensure the admin dashboard loads (orders view + product import) only for the configured admin principal and shows Access Denied for non-admins.
- Frontend: apply a consistent, coherent site-wide visual theme (including /admin) that avoids a blue/purple primary palette.

**User-visible outcome:** On the Live site, the specified principal can log in with Internet Identity and access a functioning Admin Dashboard at `/admin` (orders and product import work), while all other principals see Access Denied; admin access remains intact after redeploy/upgrade and the site has a consistent non-blue/purple visual theme.
