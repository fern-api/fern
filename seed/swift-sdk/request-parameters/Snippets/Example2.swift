import Foundation
import RequestParameters

private func main() async throws {
    let client = RequestParametersClient(baseURL: "https://api.fern.com")

    _ = try await client.user.createUsernameOptional(request: .value(CreateUsernameBodyOptionalProperties(

    )))
}

try await main()
