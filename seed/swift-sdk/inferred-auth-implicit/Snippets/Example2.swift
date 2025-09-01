import InferredAuthImplicit

let client = SeedInferredAuthImplicitClient()

try await client.nestedNoAuth.api.getSomething(

)
