import CrossPackageTypeNames

let client = SeedCrossPackageTypeNamesClient()

try await client.foo.find(
    request: .init(
        optionalString: "optionalString",
        publicProperty: "publicProperty",
        privateProperty: 1
    )
)
