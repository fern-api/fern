# Fern Exhaustive Testing Philosophy

Check/validate REST semantics/conventions:

- Verify protocol/status code for requests
- Verify response:
  - JSON field names, types, values
  - Error codes are correct

## Testing Hierarchy:

### Big Test 1:

api.yml has auth: bearer and we do the exhaustive test as otherwise with auth: false on all endpoints except one that has auth: true and tests the auth. Here, we also test requests with different content types in req bodies, response types, etc.

### Smaller Test 2:

api.yml has auth: basic and it tests this with one endpoint, don't need to test more because Big Test 1 was already exhaustive in other areas

### Smaller Test 3:

api.yml specifies a custom auth scheme and we test one endpoint w auth: true for that, but again don't need to test everything else bc Test 1 alr does that.

### Smaller Test 4:

error discrimination strategy => error name -> one endpoint that throws an error on purpose
