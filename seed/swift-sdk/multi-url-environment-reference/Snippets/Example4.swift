import Foundation
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    _ = try await client.files.upload(request: .init(
        name: "name",
        parentId: "parent_id"
    ))
}

try await main()
