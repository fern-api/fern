import Exhaustive

private func main() async throws {
    let client = SeedExhaustiveClient(token: "<token>")

    try await client.reqWithHeaders.getWithCustomHeader(request: .init(
        xTestServiceHeader: "X-TEST-SERVICE-HEADER",
        xTestEndpointHeader: "X-TEST-ENDPOINT-HEADER",
        body: "string"
    ))
}

try await main()
