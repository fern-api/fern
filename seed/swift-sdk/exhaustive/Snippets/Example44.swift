import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpointsObject.endpointsObjectGetAndReturnWithUnknownField(request: TypesObjectWithUnknownField(
        unknown: .object([
            "key": .string("value")
        ])
    ))
}

try await main()
