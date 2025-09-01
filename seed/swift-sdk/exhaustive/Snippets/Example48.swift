import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.reqWithHeaders.getWithCustomHeader(
    request: .init(
        xTestServiceHeader: "X-TEST-SERVICE-HEADER",
        xTestEndpointHeader: "X-TEST-ENDPOINT-HEADER",
        body: "string"
    )
)
