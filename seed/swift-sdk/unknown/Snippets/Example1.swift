import UnknownAsAny

let client = SeedUnknownAsAnyClient()

private func main() async throws {
    try await client.unknown.postObject(
        request: MyObject(
            unknown: .object([
                "key": .string("value")
            ])
        )
    )
}

try await main()
