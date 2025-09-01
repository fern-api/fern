import MultiUrlEnvironmentNoDefault

let client = SeedMultiUrlEnvironmentNoDefaultClient(token: "<token>")

try await client.ec2.bootInstance(
    request: .init(size: "size")
)
