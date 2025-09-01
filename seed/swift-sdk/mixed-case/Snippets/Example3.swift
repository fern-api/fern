import MixedCase

let client = SeedMixedCaseClient()

private func main() async throws {
    try await client.service.listResources(
        request: .init(
            pageLimit: 1,
            beforeDate: Date(timeIntervalSince1970: 1673740800)
        )
    )
}

try await main()
