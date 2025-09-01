import ErrorProperty

let client = SeedErrorPropertyClient()

private func main() async throws {
    try await client.propertyBasedError.throwError(

    )
}

try await main()
