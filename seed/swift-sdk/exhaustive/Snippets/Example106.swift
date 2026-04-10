import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.inlinedrequests.postwithobjectbodyandresponse(request: .init(
        string: "string",
        integer: 1,
        nestedObject: TypesObjectWithOptionalField(

        )
    ))
}

try await main()
