import Foundation

public final class UnionClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAndReturnUnion(request: TypesAnimal, requestOptions: RequestOptions? = nil) async throws -> TypesAnimal {
        return try await httpClient.performRequest(
            method: .post,
            path: "/union",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesAnimal.self
        )
    }
}