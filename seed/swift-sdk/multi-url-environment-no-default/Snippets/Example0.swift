import MultiUrlEnvironmentNoDefault

let client = SeedMultiUrlEnvironmentNoDefaultClient(token: "<token>")

private func main() async throws {
    try await client.ec2.bootInstance(
        request: .init(size: "size")
    )
}

try await main()
