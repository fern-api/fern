# Snippet resolver

This directory emulates the offline snippet resolver library. The library is generated with a
single config directory containing the `ir.json`, as well as a separate dependency specified in
the `package.json` for each of the supported languages.

The high level file layout is shown below:

```sh
.
├── config
│   └── ir.json
├── pacakge.json
└── src
    ├── Language.ts
    ├── Resolver.ts
    └── ResolverProvider.ts
```

Instantiate the snippet resolver like so:

```typescript
import { ResolverProvider } from "snippets";

const provider = new ResolverProvider();
const resolver = provider.getResolver({ language: "go" });

const snippet = resolver.resolve({
  snippet: {
    endpointID: "GET /users",
    pathParameters: {
      username: "john.doe"
    },
    queryParameters: {
      status: "DEACTIVATED"
    }
  }
});

// Returns:
//
// import (
//   context "context"
//   acme "github.com/buildwithfern/acme-go"
//   client "github.com/buildwithfern/acme-go/client"
// )
//
// client := client.NewClient()
// client.User.Create(
//   context.TODO(),
//   &acme.GetUserRequest{
//     Username: "john.doe",
//     Status:   StatusDeactivated,
//   },
// )
```
