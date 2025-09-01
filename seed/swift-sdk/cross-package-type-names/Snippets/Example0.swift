import CrossPackageTypeNames

let client = SeedCrossPackageTypeNamesClient()

private func main() async throws {
    try await client.folderA.service.getDirectThread(

    )
}

try await main()
