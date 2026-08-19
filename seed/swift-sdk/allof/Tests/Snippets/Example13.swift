import Foundation
import Api

enum Example13 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.createTree(request: TreeRecord(
            treeSpecies: "treeSpecies",
            heightInFeet: 1.1,
            id: "id",
            treeName: "treeName",
            treeDescription: "treeDescription",
            plantedDate: CalendarDate("2023-01-15")!
        ))
    }
}
