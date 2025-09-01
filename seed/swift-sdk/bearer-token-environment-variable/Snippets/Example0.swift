import BearerTokenEnvironmentVariable

let client = SeedBearerTokenEnvironmentVariableClient(apiKey: "<token>")

try await client.service.getWithBearerToken(

)
