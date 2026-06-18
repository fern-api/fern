import Foundation
import Api

enum Example4 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.catalog.createCatalogImage(request: .init(
            request: CreateCatalogImageRequest(
                catalogObjectId: "catalog_object_id"
            ),
            imageFile: .init(data: Data("".utf8))
        ))
    }
}
