import Foundation
import Audiences

private func main() async throws {
    let client = AudiencesClient()

    try await client.folderA.service.getDirectThread()
}

try await main()
