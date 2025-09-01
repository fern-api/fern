import Api

let client = SeedApiClient()

private func main() async throws {
    try await client.folder.service.unknownRequest(
        request: .object([
            "key": .string("value")
        ])
    )
}

try await main()
