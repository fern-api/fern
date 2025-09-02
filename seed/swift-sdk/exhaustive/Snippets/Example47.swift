import Foundation
import Exhaustive

private func main() async throws {
    let client = SeedExhaustiveClient(token: "<token>")

    try await client.noReqBody.postWithNoRequestBody()
}

try await main()
