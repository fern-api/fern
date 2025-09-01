import Audiences

private func main() async throws {
    let client = SeedAudiencesClient()

    try await client.folderA.service.getDirectThread()
}

try await main()
