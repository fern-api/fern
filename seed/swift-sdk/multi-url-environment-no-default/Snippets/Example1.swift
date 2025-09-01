import MultiUrlEnvironmentNoDefault

private func main() async throws {
    let client = SeedMultiUrlEnvironmentNoDefaultClient(token: "<token>")

    try await client.s3.getPresignedUrl(request: .init(s3Key: "s3Key"))
}

try await main()
