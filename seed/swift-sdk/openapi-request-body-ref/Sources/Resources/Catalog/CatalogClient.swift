import Foundation

public final class CatalogClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Api
    /// 
    /// private func main() async throws {
    ///     let client = ApiClient()
    /// 
    ///     _ = try await client.catalog.createCatalogImage(request: .init(
    ///         request: CreateCatalogImageRequest(
    ///             catalogObjectId: "catalog_object_id"
    ///         ),
    ///         imageFile: .init(data: Data("".utf8))
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createCatalogImage(request: Requests.CreateCatalogImageBody, requestOptions: RequestOptions? = nil) async throws -> CatalogImage {
        return try await httpClient.performRequest(
            method: .post,
            path: "/catalog/images",
            contentType: .multipartFormData,
            body: request.asMultipartFormData(),
            requestOptions: requestOptions,
            responseType: CatalogImage.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Api
    /// 
    /// private func main() async throws {
    ///     let client = ApiClient()
    /// 
    ///     _ = try await client.catalog.getCatalogImage(imageId: "image_id")
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getCatalogImage(imageId: String, requestOptions: RequestOptions? = nil) async throws -> CatalogImage {
        return try await httpClient.performRequest(
            method: .get,
            path: "/catalog/images/\(imageId)",
            requestOptions: requestOptions,
            responseType: CatalogImage.self
        )
    }
}