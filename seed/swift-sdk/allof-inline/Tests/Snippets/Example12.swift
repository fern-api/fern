import Foundation
import Api

enum Example12 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.createTree(request: TreeRecord(
            id: "id",
            treeName: "treeName",
            treeSpecies: "treeSpecies"
        ))
    }
}
