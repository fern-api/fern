import Foundation
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableOptional.createComplexProfile(request: ComplexProfile(
        id: "id",
        nullableRole: .admin,
        optionalRole: .admin,
        optionalNullableRole: .admin,
        nullableStatus: .active,
        optionalStatus: .active,
        optionalNullableStatus: .active,
        nullableNotification: NotificationMethod.email(
            .init(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: "htmlContent"
            )
        ),
        optionalNotification: NotificationMethod.email(
            .init(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: "htmlContent"
            )
        ),
        optionalNullableNotification: NotificationMethod.email(
            .init(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: "htmlContent"
            )
        ),
        nullableSearchResult: SearchResult.user(
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
        optionalSearchResult: SearchResult.user(
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
        nullableArray: [
            "nullableArray",
            "nullableArray"
        ],
        optionalArray: [
            "optionalArray",
            "optionalArray"
        ],
        optionalNullableArray: [
            "optionalNullableArray",
            "optionalNullableArray"
        ],
        nullableListOfNullables: [
            "nullableListOfNullables",
            "nullableListOfNullables"
        ],
        nullableMapOfNullables: [
            "nullableMapOfNullables": Address(
                street: "street",
                city: "city",
                state: "state",
                zipCode: "zipCode",
                country: "country",
                buildingId: "buildingId",
                tenantId: "tenantId"
            )
        ],
        nullableListOfUnions: [
            NotificationMethod.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            ),
            NotificationMethod.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            )
        ],
        optionalMapOfEnums: [
            "optionalMapOfEnums": .admin
        ]
    ))
}

try await main()
