import MultiUrlEnvironment

let client = SeedMultiUrlEnvironmentClient(token: "<token>")

private func main() async throws {
    try await client.s3.getPresignedUrl(
        request: .init(s3Key: "s3Key")
    )
}

try await main()
