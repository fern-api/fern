import Foundation
import ExtraProperties

private func main() async throws {
    let client = ExtraPropertiesClient(baseURL: "https://api.fern.com")

    try await client.user.createUser(request: .init(
        type: .createUserRequest,
        version: .v1,
        name: "name"
    ))
}

try await main()
