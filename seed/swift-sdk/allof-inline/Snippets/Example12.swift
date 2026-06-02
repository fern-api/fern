import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.createTree(request: TreeRecord(
        id: "id",
        treeName: "treeName",
        treeSpecies: "treeSpecies"
    ))
}

try await main()
