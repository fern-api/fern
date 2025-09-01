import InferredAuthImplicitNoExpiry

let client = SeedInferredAuthImplicitNoExpiryClient()

try await client.nestedNoAuth.api.getSomething(

)
