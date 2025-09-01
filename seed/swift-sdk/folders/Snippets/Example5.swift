import Api

private func main() async throws {
    let client = SeedApiClient()

    try await client.folder.service.unknownRequest(request: .object([
        "key": .string("value")
    ]))
}

try await main()
