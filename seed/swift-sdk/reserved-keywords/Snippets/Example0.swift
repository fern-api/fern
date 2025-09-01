import NurseryApi

let client = SeedNurseryApiClient()

private func main() async throws {
    try await client.package.test(
        request: .init(for: "for")
    )
}

try await main()
