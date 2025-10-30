import Foundation
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableOptional.testDeserialization(request: DeserializationTestRequest(
        requiredString: "requiredString",
        nullableString: "nullableString",
        optionalString: "optionalString",
        optionalNullableString: "optionalNullableString",
        nullableEnum: .admin,
        optionalEnum: .active,
        nullableUnion: NotificationMethod.email(
            .init(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: "htmlContent"
            )
        ),
        optionalUnion: SearchResult.user(
            .init(
                id: "id",
                username: "username",
                email: "email",
                phone: "phone",
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
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
        ),
        nullableList: [
            "nullableList",
            "nullableList"
        ],
        nullableMap: [
            "nullableMap": 1
        ],
        nullableObject: Address(
            street: "street",
            city: "city",
            state: "state",
            zipCode: "zipCode",
            country: "country",
            buildingId: "buildingId",
            tenantId: "tenantId"
        ),
        optionalObject: Organization(
            id: "id",
            name: "name",
            domain: "domain",
            employeeCount: 1
        )
    ))
}

try await main()
