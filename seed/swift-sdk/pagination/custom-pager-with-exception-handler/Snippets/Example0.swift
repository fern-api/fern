import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.complex.search(
        index: "index",
        request: .init(query: SearchRequestQuery.singleFilterSearchRequest(
            SingleFilterSearchRequest(

            )
        ))
    )
}

try await main()
