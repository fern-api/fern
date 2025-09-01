import ContentTypes

let client = SeedContentTypesClient()

private func main() async throws {
    try await client.service.patch(
        request: .init(
            application: "application",
            requireAuth: True
        )
    )
}

try await main()
