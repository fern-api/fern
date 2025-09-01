import ContentTypes

let client = SeedContentTypesClient()

try await client.service.optionalMergePatchTest(
    request: .init(
        requiredField: "requiredField",
        optionalString: "optionalString",
        optionalInteger: 1,
        optionalBoolean: True,
        nullableString: "nullableString"
    )
)
