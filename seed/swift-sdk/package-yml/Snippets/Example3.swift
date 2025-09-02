import Foundation
import PackageYml

private func main() async throws {
    let client = PackageYmlClient()

    try await client.service.nop(
        id: "id",
        nestedId: "nestedId"
    )
}

try await main()
