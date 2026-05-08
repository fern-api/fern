import Foundation
import CrossPackageTypeNames

private func main() async throws {
    let client = CrossPackageTypeNamesClient(baseURL: "https://api.fern.com")

    _ = try await client.folderA.service.getDirectThread()
}

try await main()
