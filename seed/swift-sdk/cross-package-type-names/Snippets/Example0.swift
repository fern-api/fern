import Foundation
import CrossPackageTypeNames

private func main() async throws {
    let client = CrossPackageTypeNamesClient()

    try await client.folderA.service.getDirectThread()
}

try await main()
