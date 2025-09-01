import AuthEnvironmentVariables

let client = SeedAuthEnvironmentVariablesClient(apiKey: "<value>")

try await client.service.getWithHeader(
    request: .init(xEndpointHeader: "X-Endpoint-Header")
)
