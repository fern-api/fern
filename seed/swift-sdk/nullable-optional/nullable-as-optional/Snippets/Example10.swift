import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableoptional.createcomplexprofile(request: ComplexProfile(
        id: "id",
        nullableRole: .admin,
        nullableStatus: .active,
        nullableNotification: NotificationMethod.notificationMethodZero(
            NotificationMethodZero(
                emailAddress: "emailAddress",
                subject: "subject",
                type: .email
            )
        ),
        nullableSearchResult: SearchResult.searchResultZero(
            SearchResultZero(
                id: "id",
                username: "username",
                email: .null,
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: .null,
                type: .user
            )
        ),
        nullableArray: .null,
        nullableListOfNullables: .null,
        nullableMapOfNullables: .null,
        nullableListOfUnions: .null
    ))
}

try await main()
