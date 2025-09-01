import ErrorProperty

private func main() async throws {
    let client = SeedErrorPropertyClient()

    try await client.propertyBasedError.throwError()
}

try await main()
