import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableoptional.getsearchresults(request: .init(
        query: "query",
        filters: .value([
            "filters": .value("filters")
        ]),
        includeTypes: .value([
            "includeTypes",
            "includeTypes"
        ])
    ))
}

try await main()
