import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.service.optionalmergepatchtest(request: .init(
        requiredField: "requiredField",
        nullableString: .null
    ))
}

try await main()
