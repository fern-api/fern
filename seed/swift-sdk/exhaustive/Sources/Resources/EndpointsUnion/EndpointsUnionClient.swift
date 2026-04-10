import Foundation

public final class EndpointsUnionClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func endpointsUnionGetAndReturnUnion(request: TypesAnimal, requestOptions: RequestOptions? = nil) async throws -> TypesAnimal {
        return try await httpClient.performRequest(
            method: .post,
            path: "/union",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesAnimal.self
        )
    }
}