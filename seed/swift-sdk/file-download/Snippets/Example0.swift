import FileDownload

private func main() async throws {
    let client = SeedFileDownloadClient()

    try await client.service.simple()
}

try await main()
