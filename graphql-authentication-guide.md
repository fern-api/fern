# GraphQL Authentication Fix for Fern

## 🚨 Problem: GitHub GraphQL API Rate Limiting

When using the GitHub GraphQL API with Fern's introspection feature, you may encounter:

```
GraphQL schema origin found, performing introspection query to https://api.github.com/graphql
[api]: GraphQL introspection failed: 403 rate limit exceeded
```

## ✅ Solution: Authentication Support

Fern now automatically detects authentication tokens from environment variables and includes them in GraphQL introspection requests.

## 🔧 Setup Instructions

### For GitHub GraphQL API

1. **Create a GitHub Personal Access Token:**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate a new token with appropriate scopes (usually `public_repo` or `repo`)

2. **Set Environment Variable:**
   ```bash
   export GITHUB_TOKEN="ghp_your_token_here"
   ```

3. **Configure generators.yml:**
   ```yaml
   # generators.yml
   api:
     specs:
       - graphql: fern/apis/github/schema.graphql
         origin: "https://api.github.com/graphql"
         resource: "GitHub"
   ```

4. **Run API Update:**
   ```bash
   fern api update
   ```

### For Other GraphQL APIs

**Environment Variables Supported:**
- `GITHUB_TOKEN` or `GITHUB_ACCESS_TOKEN` - GitHub APIs (uses `token` auth format)
- `GRAPHQL_TOKEN` - General GraphQL APIs (uses `Bearer` auth format)
- `API_TOKEN` or `ACCESS_TOKEN` - Generic APIs (uses `Bearer` auth format)

**Example for Generic GraphQL API:**
```bash
export GRAPHQL_TOKEN="your_bearer_token_here"
```

```yaml
# generators.yml
api:
  specs:
    - graphql: fern/apis/myapi/schema.graphql
      origin: "https://api.example.com/graphql"
      resource: "MyAPI"
```

## 🔍 How Authentication Works

When Fern performs GraphQL introspection:

1. **Token Detection**: Checks for auth tokens in environment variables
2. **Header Selection**:
   - GitHub APIs: Uses `Authorization: token <your-token>`
   - Other APIs: Uses `Authorization: Bearer <your-token>`
3. **Introspection Query**: Sends authenticated POST request with standard GraphQL introspection query
4. **Schema Generation**: Converts response to SDL and saves to your local file

## 🎯 Error Messages

**Before (without token):**
```
GraphQL introspection failed: 403 rate limit exceeded
```

**Now (with helpful guidance):**
```
GraphQL introspection failed: 403 Forbidden. This endpoint requires authentication.
Set GITHUB_TOKEN environment variable with a GitHub personal access token
```

## ✨ Benefits

- **✅ Automatic Detection**: No configuration needed, just set environment variables
- **✅ Multiple Token Support**: Supports various naming conventions
- **✅ API-Specific Logic**: Handles GitHub's unique token format
- **✅ Clear Error Messages**: Helpful guidance when authentication is missing
- **✅ Secure**: Uses environment variables instead of hardcoded tokens

## 🚀 Complete Workflow Example

```bash
# 1. Set your GitHub token
export GITHUB_TOKEN="ghp_your_personal_access_token"

# 2. Update your GraphQL schema from GitHub
fern api update

# 3. Generate your SDK with the latest schema
fern generate --group production
```

## 🔒 Security Best Practices

1. **Never commit tokens** to version control
2. **Use environment variables** for all authentication
3. **Rotate tokens regularly**
4. **Use minimal required scopes** for GitHub tokens
5. **Consider using GitHub Actions secrets** in CI/CD pipelines

## 📚 Additional Resources

- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GraphQL Introspection Specification](https://graphql.org/learn/introspection/)
- [Fern CLI Documentation](https://buildwithfern.com/docs)

---

This enhancement ensures your GraphQL introspection works seamlessly with authenticated endpoints! 🎉