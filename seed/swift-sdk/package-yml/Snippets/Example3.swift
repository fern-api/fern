import Foundation
import PackageYml

private func main() async throws {
    let client = PackageYmlClient(baseURL: "https://api.fern.com")

    try await client.service.nop(
        id: "id",
        nestedId: "nestedId"
    )
}

try await main()
