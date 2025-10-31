import Foundation
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableOptional.updateComplexProfile(
        profileId: "profileId",
        request: .init(
            nullableRole: .value(.admin),
            nullableStatus: .value(.active),
            nullableNotification: .value(NotificationMethod.email(
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
            nullableArray: .value([
                "nullableArray",
                "nullableArray"
            ])
        )
    )
}

try await main()
