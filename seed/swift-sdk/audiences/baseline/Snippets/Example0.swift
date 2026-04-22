import Foundation
import Audiences

private func main() async throws {
    let client = AudiencesClient(baseURL: "https://api.fern.com")

    _ = try await client.folderA.service.getDirectThread()
}

try await main()
