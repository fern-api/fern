import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.createuser(request: .init(
        email: "email",
        emailVerified: .value(true),
        username: .value("username"),
        password: .value("password"),
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
        connection: "connection"
    ))
}

try await main()
