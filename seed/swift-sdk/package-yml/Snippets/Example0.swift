import PackageYml

let client = SeedPackageYmlClient()

try await client.echo(
    id: "id-ksfd9c1",
    request: EchoRequest(
        name: "Hello world!",
        size: 20
    )
)
