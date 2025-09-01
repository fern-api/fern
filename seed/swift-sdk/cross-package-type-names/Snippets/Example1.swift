import CrossPackageTypeNames

private func main() async throws {
    let client = SeedCrossPackageTypeNamesClient()

    try await client.folderA.service.getDirectThread()
}

try await main()
