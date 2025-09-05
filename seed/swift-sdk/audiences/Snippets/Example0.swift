import Foundation
import Audiences

private func main() async throws {
    let client = AudiencesClient(baseURL: "https://api.fern.com")

    try await client.folderA.service.getDirectThread()
}

try await main()
