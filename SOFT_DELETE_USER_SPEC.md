# User Soft-Delete Semantics and Invariants

This document defines the source-of-truth behavior for soft-delete on the `User` entity.
It is intentionally implementation-agnostic so all layers (DB, ORM, API, services) can align.

## 1. Canonical Deletion State

- A user is **active** when `deletedAt IS NULL`.
- A user is **soft-deleted** when `deletedAt IS NOT NULL`.
- `deletedAt` is a nullable UTC timestamp.
- No existing row is physically removed during a soft-delete operation.

Rationale:
- Timestamp captures both state and time of deletion.
- Nullable field keeps backward compatibility for existing rows.

## 2. Read Semantics (Default Safety)

- All standard User reads MUST return only active users by default.
- Existing query call sites should not require changes to preserve behavior.
- Any query that needs deleted users must opt in explicitly via a named escape hatch.

Approved explicit modes:
- `default` => active users only (`deletedAt IS NULL`)
- `includeDeleted` => both active and soft-deleted
- `onlyDeleted` => soft-deleted users only (`deletedAt IS NOT NULL`)

## 3. Write Semantics

- `DELETE user` behavior is redefined as logical delete:
  - Set `deletedAt = now_utc` if currently active.
  - Operation is idempotent: deleting an already deleted user does not error.
- `RESTORE user` behavior:
  - Set `deletedAt = NULL` if currently soft-deleted.
  - Operation is idempotent.
- Physical hard delete is disallowed in normal application paths.
  - If required for retention/compliance cleanup, it must be an explicit admin/maintenance flow.

## 4. Invariants

The following invariants must hold at all times:

1. **State Invariant**
   - Exactly one state applies per row:
     - active iff `deletedAt IS NULL`
     - soft-deleted iff `deletedAt IS NOT NULL`

2. **Read Isolation Invariant**
   - Default reads cannot return soft-deleted users.

3. **Non-Destructive Invariant**
   - Soft-delete never removes the row.

4. **Idempotency Invariant**
   - Repeating soft-delete or restore requests does not produce inconsistent state.

5. **Compatibility Invariant**
   - Existing rows and existing query code remain valid after schema change.

6. **Auditability Invariant**
   - Deletion time is retained via `deletedAt`.

## 5. Uniqueness Policy (Must Be Chosen Before Migration)

One of these policies must be selected and applied consistently:

- **Policy A: Global uniqueness**
  - Unique keys (for example email) are unique across all rows, including soft-deleted.
- **Policy B: Active-only uniqueness**
  - Unique keys are unique only among active rows.
  - Enables re-creating a user with the same key after soft-delete.

Decision status:
- Default recommendation: **Policy B (active-only uniqueness)** for most product systems.

## 6. Auth and Authorization Expectations

- Soft-deleted users must be treated as non-existent for authentication flows.
- Token/session refresh for soft-deleted users must fail as inactive.
- Authorization checks must not grant access to soft-deleted users.

## 7. API Contract Expectations

- Existing external API contracts should remain stable where possible.
- If an endpoint currently returns "not found" for missing users, soft-deleted users should also resolve as "not found" in default mode.
- Admin endpoints may expose include/only-deleted filters explicitly.

## 8. Time and Consistency Rules

- `deletedAt` must be written in UTC.
- Comparisons and retention logic must assume UTC.
- If distributed writes are possible, the latest committed value is authoritative.

## 9. Acceptance Criteria for This Step

This step is complete when:

1. The team agrees on the canonical state model (`deletedAt` nullable timestamp).
2. The team agrees that default read mode excludes deleted users.
3. The team agrees on idempotent delete/restore semantics.
4. The team selects and records uniqueness policy (A or B).
5. The team confirms auth behavior for soft-deleted users.

## 10. Out of Scope for This Step

- Schema migration scripts
- Repository/ORM code changes
- API handler changes
- Backfill or reindex operations

Those are covered in later implementation steps.
