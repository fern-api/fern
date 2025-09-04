import Foundation
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.service.updateUser(
        userId: "userId",
        request: UpdateUserRequest(
            email: "email",
            emailVerified: True,
            username: "username",
            phoneNumber: "phone_number",
            phoneVerified: True,
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
            password: "password",
            blocked: True
        )
    )
}

try await main()
