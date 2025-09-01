import OauthClientCredentialsWithVariables

let client = SeedOauthClientCredentialsWithVariablesClient()

try await client.service.post(
    endpointParam: "endpointParam"
)
