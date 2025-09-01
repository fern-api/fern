import Audiences

let client = SeedAudiencesClient()

try await client.foo.find(
    request: .init(
        optionalString: "optionalString",
        publicProperty: "publicProperty",
        privateProperty: 1
    )
)
