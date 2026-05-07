import Foundation

public final class NoreqbodyClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getwithnorequestbody(requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .get,
            path: "/no-req-body",
            requestOptions: requestOptions,
            responseType: TypesObjectWithOptionalField.self
        )
    }

    public func postwithnorequestbody(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/no-req-body",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}