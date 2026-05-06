import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.conversations.outboundcall(request: .init(
        toPhoneNumber: "to_phone_number",
        dryRun: .value(true)
    ))
}

try await main()
