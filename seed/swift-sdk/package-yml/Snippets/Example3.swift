import Foundation
import PackageYml

private func main() async throws {
    let client = SeedPackageYmlClient()

    try await client.service.nop(
        id: "id",
        nestedId: "nestedId"
    )
}

try await main()
