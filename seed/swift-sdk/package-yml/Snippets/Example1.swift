import PackageYml

let client = SeedPackageYmlClient()

try await client.echo(
    id: "id",
    request: EchoRequest(
        name: "name",
        size: 1
    )
)
