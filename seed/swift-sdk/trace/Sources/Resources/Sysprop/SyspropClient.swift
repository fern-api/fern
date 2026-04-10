import Foundation

public final class SyspropClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func setnumwarminstances(language: String, numWarmInstances: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .put,
            path: "/sysprop/num-warm-instances/\(language)/\(numWarmInstances)",
            requestOptions: requestOptions
        )
    }

    public func getnumwarminstances(requestOptions: RequestOptions? = nil) async throws -> [String: Int] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/sysprop/num-warm-instances",
            requestOptions: requestOptions,
            responseType: [String: Int].self
        )
    }
}