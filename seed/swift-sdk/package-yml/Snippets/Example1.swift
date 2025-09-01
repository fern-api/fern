import PackageYml

let client = SeedPackageYmlClient()

private func main() async throws {
    try await client.echo(
        id: "id",
        request: EchoRequest(
            name: "name",
            size: 1
        )
    )
}

try await main()
