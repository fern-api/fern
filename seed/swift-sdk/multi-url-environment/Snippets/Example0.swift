import MultiUrlEnvironment

let client = SeedMultiUrlEnvironmentClient(token: "<token>")

try await client.ec2.bootInstance(
    request: .init(size: "size")
)
