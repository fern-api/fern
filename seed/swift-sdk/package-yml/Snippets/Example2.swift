import Foundation
import PackageYml

private func main() async throws {
    let client = SeedPackageYmlClient()

    try await client.service.nop(
        id: "id-a2ijs82",
        nestedId: "id-219xca8"
    )
}

try await main()
