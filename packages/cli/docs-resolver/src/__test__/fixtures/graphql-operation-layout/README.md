# GraphQL Operation Layout Test Fixture

This fixture demonstrates the new `operation` layout syntax for GraphQL APIs in Fern documentation.

## Features Tested

1. **Basic Operation Reference**:
   ```yaml
   - operation: QUERY getUserProfile
     title: "Get User Profile"
   ```

2. **Operations with Custom Properties**:
   ```yaml
   - operation: MUTATION createUser
     title: "Create New User"
     slug: create-user
   ```

3. **Namespaced Operations**:
   ```yaml
   - operation: QUERY admin.getSystemInfo
     title: "System Information"
   ```

4. **Hidden Operations**:
   ```yaml
   - operation: MUTATION admin.resetSystem
     hidden: true
   ```

5. **Operations with Availability**:
   ```yaml
   - operation: SUBSCRIPTION userUpdates
     title: "Real-time User Updates"
     availability: beta
   ```

6. **Nested in Sections**:
   ```yaml
   - section: User Operations
     contents:
       - operation: QUERY getUserProfile
       - operation: MUTATION createUser
   ```

## API Definition

The fixture includes:
- 3 Query operations: `getUserProfile`, `admin.getSystemInfo`
- 3 Mutation operations: `createUser`, `updateUserProfile`, `admin.resetSystem`
- 1 Subscription operation: `userUpdates`

## Expected Output

The test should generate navigation nodes with:
- Proper GraphQL operation types
- Custom titles and slugs where specified
- Correct availability and visibility settings
- Proper nesting within sections

## Manual Testing

To test this fixture manually:
1. Run `fern docs dev` in the fixture directory
2. Verify that operations appear in the correct order
3. Check that custom properties (titles, slugs, availability) are applied
4. Verify that hidden operations are not shown
5. Test that namespaced operations resolve correctly