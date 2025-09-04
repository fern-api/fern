import Foundation
import MyCustomModule

private func main() async throws {
    let client = MyCustomClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.service.listClients(request: .init(
        fields: "fields",
        includeFields: True,
        page: 1,
        perPage: 1,
        includeTotals: True,
        isGlobal: True,
        isFirstParty: True,
        appType: [
            "app_type",
            "app_type"
        ]
    ))
}

try await main()
