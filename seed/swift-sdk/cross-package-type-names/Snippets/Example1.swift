import Foundation
import CrossPackageTypeNames

private func main() async throws {
    let client = CrossPackageTypeNamesClient(baseURL: "https://api.fern.com")

    try await client.folderA.service.getDirectThread()
}

try await main()
