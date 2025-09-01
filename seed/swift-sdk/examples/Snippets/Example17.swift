import Examples

let client = SeedExamplesClient(token: "<token>")

private func main() async throws {
    try await client.service.getMetadata(
        request: .init(
            shallow: True,
            tag: [
                "tag"
            ],
            xApiVersion: "X-API-Version"
        )
    )
}

try await main()
