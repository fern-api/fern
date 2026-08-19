import Foundation
import MyCustomModule

enum Example6 {
    static func snippet() async throws {
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.service.updateUser(
            userId: "userId",
            request: UpdateUserRequest(
                email: "email",
                emailVerified: true,
                username: "username",
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
                password: "password",
                blocked: true
            )
        )
    }
}
