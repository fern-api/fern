import NullableOptional

let client = SeedNullableOptionalClient()

try await client.nullableOptional.createUser(
    request: CreateUserRequest(
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
