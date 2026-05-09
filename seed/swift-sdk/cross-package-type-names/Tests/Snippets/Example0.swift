import Foundation
import CrossPackageTypeNames

enum Example0 {
    static func snippet() async throws {
        let client = CrossPackageTypeNamesClient(baseURL: "https://api.fern.com")

        _ = try await client.folderA.service.getDirectThread()
    }
}
