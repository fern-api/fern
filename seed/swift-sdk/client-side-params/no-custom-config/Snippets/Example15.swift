import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.updateuser(
        userId: "userId",
        request: .init(
            email: .value("email"),
            emailVerified: .value(true),
            username: .value("username"),
            phoneNumber: .value("phone_number"),
            phoneVerified: .value(true),
            userMetadata: .value([
                "user_metadata": .object([
                    "key": .string("value")
                ])
            ]),
            appMetadata: .value([
                "app_metadata": .object([
                    "key": .string("value")
                ])
            ]),
            password: .value("password"),
            blocked: .value(true)
        )
    )
}

try await main()
