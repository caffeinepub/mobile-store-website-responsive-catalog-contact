# Specification

## Summary
**Goal:** Fix the Draft vs Live admin authorization mismatch so the specified principal has admin access in the Live deployment and retains it across upgrades, and clarify the Access Denied message for users.

**Planned changes:**
- Backend: Ensure the Live backend recognizes principal `yrzqp-j2xon-ju7hr-g5ger-pe7by-pn666-ywayt-ii77y-rq7wz-xelxd-bae` as an admin while keeping existing hardcoded admin `ksdex-jr3fp-ll2uw-hoqgv-wlwa7-erlfc-juio3-m33lu-7dqc7-hzatt-uqe` as an admin.
- Backend: Adjust upgrade/migration behavior so publishing/redeploying Live preserves (or re-establishes) admin authorization state and does not reset admin access to empty.
- Frontend: Update the Admin “Access Denied” copy to explain Draft vs Live can run on different backend canisters with different stored admin state, while keeping principal display and copy-to-clipboard behavior unchanged.

**User-visible outcome:** When logged in with the specified principal in Live, the Admin page shows the admin dashboard (Orders + Import Products) instead of Access Denied, and admin access continues to work after upgrades; users who are denied see clearer guidance about Draft vs Live differences.
