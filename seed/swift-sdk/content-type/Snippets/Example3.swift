import ContentTypes

let client = SeedContentTypesClient()

private func main() async throws {
    try await client.service.optionalMergePatchTest(
        request: .init(
            requiredField: "requiredField",
            optionalString: "optionalString",
            optionalInteger: 1,
            optionalBoolean: True,
            nullableString: "nullableString"
        )
    )
}

try await main()
