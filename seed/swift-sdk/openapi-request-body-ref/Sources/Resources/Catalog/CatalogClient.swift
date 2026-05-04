import Foundation

public final class CatalogClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

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

    public func getCatalogImage(imageId: String, requestOptions: RequestOptions? = nil) async throws -> CatalogImage {
        return try await httpClient.performRequest(
            method: .get,
            path: "/catalog/images/\(imageId)",
            requestOptions: requestOptions,
            responseType: CatalogImage.self
        )
    }
}