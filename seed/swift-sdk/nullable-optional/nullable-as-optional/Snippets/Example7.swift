import Foundation
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableOptional.updateComplexProfile(
        profileId: "profileId",
        request: .init(
            nullableRole: .admin,
            nullableStatus: .active,
            nullableNotification: NotificationMethod.email(
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
            nullableArray: [
                "nullableArray",
                "nullableArray"
            ]
        )
    )
}

try await main()
