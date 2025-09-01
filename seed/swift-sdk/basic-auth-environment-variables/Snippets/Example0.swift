import BasicAuthEnvironmentVariables

let client = SeedBasicAuthEnvironmentVariablesClient(
    username: "<username>",
    accessToken: "<password>"
)

try await client.basicAuth.getWithBasicAuth(

)
