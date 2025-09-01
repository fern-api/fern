import PackageYml

let client = SeedPackageYmlClient()

private func main() async throws {
    try await client.service.nop(
        id: "id",
        nestedId: "nestedId"
    )
}

try await main()
