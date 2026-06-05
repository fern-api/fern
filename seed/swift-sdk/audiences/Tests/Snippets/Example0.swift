import Foundation
import Audiences

enum Example0 {
    static func snippet() async throws {
        let client = AudiencesClient(baseURL: "https://api.fern.com")

        _ = try await client.folderA.service.getDirectThread()
    }
}
