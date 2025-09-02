import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(token: "<token>")

    try await client.noReqBody.getWithNoRequestBody()
}

try await main()
