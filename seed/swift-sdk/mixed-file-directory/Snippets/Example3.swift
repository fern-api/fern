import Foundation
import MixedFileDirectory

private func main() async throws {
    let client = MixedFileDirectoryClient()

    try await client.user.events.metadata.getMetadata(request: .init(id: "id"))
}

try await main()
