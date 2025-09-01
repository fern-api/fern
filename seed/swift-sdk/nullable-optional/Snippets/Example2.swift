import NullableOptional

private func main() async throws {
    let client = SeedNullableOptionalClient()

    try await client.nullableOptional.updateUser(
        userId: "userId",
        request: UpdateUserRequest(
            username: "username",
            email: "email",
            phone: "phone",
            address: Address(
                street: "street",
                city: "city",
                state: "state",
                zipCode: "zipCode",
                country: "country",
                buildingId: "buildingId",
                tenantId: "tenantId"
            )
        )
    )
}

try await main()
