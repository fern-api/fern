import Foundation
import Audiences

enum Example1 {
    static func snippet() async throws {
        let client = AudiencesClient(baseURL: "https://api.fern.com")

        _ = try await client.folderD.service.getDirectThread()
    }
}
