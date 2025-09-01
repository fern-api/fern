import UnknownAsAny

private func main() async throws {
    let client = SeedUnknownAsAnyClient()

    try await client.unknown.post(request: .object([
        "key": .string("value")
    ]))
}

try await main()
