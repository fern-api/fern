import Foundation
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.listclients(
        fields: .value("fields"),
        includeFields: .value(true),
        page: .value(1),
        perPage: .value(1),
        includeTotals: .value(true),
        isGlobal: .value(true),
        isFirstParty: .value(true),
        appType: .value([
            "app_type",
            "app_type"
        ])
    )
}

try await main()
