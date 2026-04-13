import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

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

try await main()
