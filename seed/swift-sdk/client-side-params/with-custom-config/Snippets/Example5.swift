import Foundation
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.service.createUser(request: CreateUserRequest(
        email: "email",
        emailVerified: true,
        username: "username",
        password: "password",
        phoneNumber: "phone_number",
        phoneVerified: true,
        userMetadata: [
            "user_metadata": .object([
                "key": .string("value")
            ])
        ],
        appMetadata: [
            "app_metadata": .object([
                "key": .string("value")
            ])
        ],
        connection: "connection"
    ))
}

try await main()
