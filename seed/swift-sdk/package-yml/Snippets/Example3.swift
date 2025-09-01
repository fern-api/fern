import PackageYml

let client = SeedPackageYmlClient()

try await client.service.nop(
    id: "id",
    nestedId: "nestedId"
)
