import Foundation
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableOptional.updateUser(
        userId: "userId",
        request: UpdateUserRequest(
            username: "username",
            email: .value("email"),
            phone: "phone",
            address: .value(Address(
                street: "street",
                city: .value("city"),
                state: "state",
                zipCode: "zipCode",
                country: .value("country"),
                buildingId: .value("buildingId"),
                tenantId: "tenantId"
            ))
        )
    )
}

try await main()
