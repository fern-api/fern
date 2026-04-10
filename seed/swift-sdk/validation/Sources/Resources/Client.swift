import Foundation

public final class Client: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func create(request: Requests.CreateRequest, requestOptions: RequestOptions? = nil) async throws -> Type {
        return try await httpClient.performRequest(
            method: .post,
            path: "/create",
            body: request,
            requestOptions: requestOptions,
            responseType: Type.self
        )
    }

    public func get(decimal: Swift.Double, even: Int, name: String, requestOptions: RequestOptions? = nil) async throws -> Type {
        return try await httpClient.performRequest(
            method: .get,
            path: "/",
            queryParams: [
                "decimal": .double(decimal), 
                "even": .int(even), 
                "name": .string(name)
            ],
            requestOptions: requestOptions,
            responseType: Type.self
        )
    }
}