import Audiences

private func main() async throws {
    let client = SeedAudiencesClient()

    try await client.folderD.service.getDirectThread()
}

try await main()
