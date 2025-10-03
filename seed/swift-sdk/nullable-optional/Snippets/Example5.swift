import Foundation
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableOptional.createComplexProfile(request: ComplexProfile(
        id: "id",
        nullableRole: .value(.admin),
        optionalRole: .admin,
        optionalNullableRole: .value(.admin),
        nullableStatus: .value(.active),
        optionalStatus: .active,
        optionalNullableStatus: .value(.active),
        nullableNotification: .value(NotificationMethod.email(
            .init(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: "htmlContent"
            )
        )),
        optionalNotification: NotificationMethod.email(
            .init(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: "htmlContent"
            )
        ),
        optionalNullableNotification: .value(NotificationMethod.email(
            .init(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: "htmlContent"
            )
        )),
        nullableSearchResult: .value(SearchResult.user(
            .init(
                id: "id",
                username: "username",
                email: .value("email"),
                phone: "phone",
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Address(
                    street: "street",
                    city: .value("city"),
                    state: "state",
                    zipCode: "zipCode",
                    country: .value("country"),
                    buildingId: .value("buildingId"),
                    tenantId: "tenantId"
                )
            )
        )),
        optionalSearchResult: SearchResult.user(
            .init(
                id: "id",
                username: "username",
                email: .value("email"),
                phone: "phone",
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Address(
                    street: "street",
                    city: .value("city"),
                    state: "state",
                    zipCode: "zipCode",
                    country: .value("country"),
                    buildingId: .value("buildingId"),
                    tenantId: "tenantId"
                )
            )
        ),
        nullableArray: .value([
            "nullableArray",
            "nullableArray"
        ]),
        optionalArray: [
            "optionalArray",
            "optionalArray"
        ],
        optionalNullableArray: .value([
            "optionalNullableArray",
            "optionalNullableArray"
        ]),
        nullableListOfNullables: .value([
            .value("nullableListOfNullables"),
            .value("nullableListOfNullables")
        ]),
        nullableMapOfNullables: .value([
            "nullableMapOfNullables": .value(Address(
                street: "street",
                city: .value("city"),
                state: "state",
                zipCode: "zipCode",
                country: .value("country"),
                buildingId: .value("buildingId"),
                tenantId: "tenantId"
            ))
        ]),
        nullableListOfUnions: .value([
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
        ]),
        optionalMapOfEnums: [
            "optionalMapOfEnums": .admin
        ]
    ))
}

try await main()
