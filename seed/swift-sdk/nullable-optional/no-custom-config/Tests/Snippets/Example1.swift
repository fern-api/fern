import Foundation
import NullableOptional

enum Example1 {
    static func snippet() async throws {
        let client = NullableOptionalClient(baseURL: "https://api.fern.com")

        _ = try await client.nullableOptional.createUser(request: CreateUserRequest(
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
        ))
    }
}
