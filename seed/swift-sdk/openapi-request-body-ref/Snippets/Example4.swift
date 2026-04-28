import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.catalog.createCatalogImage(request: .init(
        imageFile: .init(data: Data("".utf8)),
        request: CreateCatalogImageRequest(
            catalogObjectId: "catalog_object_id"
        )
    ))
}

try await main()
