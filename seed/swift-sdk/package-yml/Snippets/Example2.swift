import PackageYml

let client = SeedPackageYmlClient()

private func main() async throws {
    try await client.service.nop(
        id: "id-a2ijs82",
        nestedId: "id-219xca8"
    )
}

try await main()
