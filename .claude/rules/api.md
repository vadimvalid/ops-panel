# API and UX states

## HTTP

- Every request goes through `http` from `src/lib/http.ts`. No direct `axios`
  import outside that file.
- The interceptor attaches the JWT and converts failures into `ApiError`:
  ```ts
  { status: number; message: string; fields?: Record<string, string> }
  ```
- Catch with `isApiError(e)` and render `e.message`. Don't surface raw axios
  errors or stack traces to users.
- A 401 clears the token — the router guard handles the redirect. Don't
  duplicate that logic per call site.
- Requests live in a store action or a composable, not inline in a component.

## The five UX states

Every view that loads data handles all of these. A screen that only handles
the happy path is incomplete:

1. **loading** — skeleton matching the eventual layout, not a bare spinner
   where a table will be. Never shift layout when data arrives.
2. **empty** — distinguish "no data yet" from "no results for these filters";
   the second offers a way to clear them.
3. **error** — the `ApiError` message plus a retry affordance.
4. **success** — the data.
5. **forbidden** — 403 renders a permission message, not an empty table that
   looks like a bug.

Forms add **validation** (field-level, from `ApiError.fields`) and
**disabled/submitting** (prevent double submit, show progress).

## Permissions

- Role checks come from the auth store, never from decoding the JWT ad hoc in
  a component.
- Hide actions the user can't perform, and still handle the 403 — the UI is a
  convenience, the server is the authority.

## Mocks

- MSW handlers in `src/mocks/`. Mirror the real contract, including error
  shapes — mocks that only return 200 hide every state above.
