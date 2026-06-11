import Foundation
import PropertyAccess

enum Example0 {
    static func snippet() async throws {
        let client = PropertyAccessClient(baseURL: "https://api.fern.com")

        _ = try await client.createUser(request: User(
            id: "id",
            email: "email",
            password: "password",
            profile: UserProfile(
                name: "name",
                verification: UserProfileVerification(
                    verified: "verified"
                ),
                ssn: "ssn"
            )
        ))
    }
}
