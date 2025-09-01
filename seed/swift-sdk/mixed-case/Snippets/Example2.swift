import MixedCase

let client = SeedMixedCaseClient()

private func main() async throws {
    try await client.service.listResources(
        request: .init(
            pageLimit: 10,
            beforeDate: Date(timeIntervalSince1970: 1672531200)
        )
    )
}

try await main()
