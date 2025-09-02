import Foundation
import Audiences

private func main() async throws {
    let client = AudiencesClient()

    try await client.folderD.service.getDirectThread()
}

try await main()
