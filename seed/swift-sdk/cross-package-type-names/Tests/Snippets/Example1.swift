import Foundation
import CrossPackageTypeNames

enum Example1 {
    static func snippet() async throws {
        let client = CrossPackageTypeNamesClient(baseURL: "https://api.fern.com")

        _ = try await client.folderD.service.getDirectThread()
    }
}
