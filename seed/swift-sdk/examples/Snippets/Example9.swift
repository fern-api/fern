import Examples

let client = SeedExamplesClient(token: "<token>")

private func main() async throws {
    try await client.health.service.check(
        id: "id"
    )
}

try await main()
