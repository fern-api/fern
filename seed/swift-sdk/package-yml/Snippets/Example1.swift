import PackageYml

private func main() async throws {
    let client = SeedPackageYmlClient()

    try await client.echo(
        id: "id",
        request: EchoRequest(
            name: "name",
            size: 1
        )
    )
}

try await main()
