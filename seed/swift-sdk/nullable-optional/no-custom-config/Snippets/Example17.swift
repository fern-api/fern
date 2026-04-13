import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableoptional.testdeserialization(request: DeserializationTestRequest(
        requiredString: "requiredString",
        nullableString: .value("nullableString"),
        optionalString: .value("optionalString"),
        optionalNullableString: .value("optionalNullableString"),
        nullableEnum: .admin,
        optionalEnum: .active,
        nullableUnion: NotificationMethod.notificationMethodZero(
            NotificationMethodZero(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: .value("htmlContent"),
                type: .email
            )
        ),
        optionalUnion: SearchResult.searchResultZero(
            SearchResultZero(
                id: "id",
                username: "username",
                email: .value("email"),
                phone: .value("phone"),
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Address(
                    street: "street",
                    city: .value("city"),
                    state: .value("state"),
                    zipCode: "zipCode",
                    country: .value("country"),
                    buildingId: .value(.value("buildingId")),
                    tenantId: .value(.value("tenantId"))
                ),
                type: .user
            )
        ),
        nullableList: .value([
            "nullableList",
            "nullableList"
        ]),
        nullableMap: .value([
            "nullableMap": .value(1)
        ]),
        nullableObject: Address(
            street: "street",
            city: .value("city"),
            state: .value("state"),
            zipCode: "zipCode",
            country: .value("country"),
            buildingId: .value(.value("buildingId")),
            tenantId: .value(.value("tenantId"))
        ),
        optionalObject: Organization(
            id: "id",
            name: "name",
            domain: .value("domain"),
            employeeCount: .value(1)
        )
    ))
}

try await main()
