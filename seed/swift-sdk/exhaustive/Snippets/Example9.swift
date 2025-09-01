import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.endpoints.enum.getAndReturnEnum(
        request: .sunny
    )
}

try await main()
