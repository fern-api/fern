import CrossPackageTypeNames

let client = SeedCrossPackageTypeNamesClient()

private func main() async throws {
    try await client.foo.find(
        request: .init(
            optionalString: "optionalString",
            publicProperty: "publicProperty",
            privateProperty: 1
        )
    )
}

try await main()
