# Specification

## Summary
**Goal:** Ensure the specified Principal is automatically granted admin access and retains it across canister upgrades.

**Planned changes:**
- Update backend initialization to register/grant admin permissions to Principal `ksdex-jr3fp-ll2uw-hoqgv-wlwa7-erlfc-juio3-m33lu-7dqc7-hzatt-uqe` so admin checks recognize it.
- Ensure the admin allowlist/grant for that Principal persists across canister upgrades (adjust `backend/migration.mo` only if required by the existing upgrade path).

**User-visible outcome:** When signed in as Principal `ksdex-jr3fp-ll2uw-hoqgv-wlwa7-erlfc-juio3-m33lu-7dqc7-hzatt-uqe`, the Admin Dashboard shows admin content and admin-only actions work both before and after upgrades.
