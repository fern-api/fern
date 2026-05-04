import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.conversations.outboundCall(request: .init(
        toPhoneNumber: "to_phone_number",
        dryRun: true
    ))
}

try await main()
