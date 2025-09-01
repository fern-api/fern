import ClientSideParams

let client = SeedClientSideParamsClient(token: "<token>")

private func main() async throws {
    try await client.service.createUser(
        request: CreateUserRequest(
            email: "email",
            emailVerified: True,
            username: "username",
            password: "password",
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
            connection: "connection"
        )
    )
}

try await main()
