import Foundation
import CrossPackageTypeNames

private func main() async throws {
    let client = SeedCrossPackageTypeNamesClient()

    try await client.foo.find(request: .init(
        optionalString: "optionalString",
        publicProperty: "publicProperty",
        privateProperty: 1
    ))
}

try await main()
