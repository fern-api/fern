import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.optional.sendoptionalnullablewithalloptionalproperties(
        actionId: "actionId",
        id: "id",
        request: .init(updateDraft: .value(true))
    )
}

try await main()
