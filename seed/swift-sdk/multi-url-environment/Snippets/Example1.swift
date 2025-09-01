import MultiUrlEnvironment

let client = SeedMultiUrlEnvironmentClient(token: "<token>")

try await client.s3.getPresignedUrl(
    request: .init(s3Key: "s3Key")
)
