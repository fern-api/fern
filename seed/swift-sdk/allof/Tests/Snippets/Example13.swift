import Foundation
import Api

enum Example13 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.createTree(request: TreeRecord(
            id: "id",
            treeName: "treeName",
            treeSpecies: "treeSpecies",
            plantedDate: CalendarDate("2023-01-15")!,
            heightInFeet: 1.1,
            treeDescription: "treeDescription"
        ))
    }
}
