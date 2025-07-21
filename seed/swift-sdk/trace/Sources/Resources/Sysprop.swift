public final class SyspropClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func setNumWarmInstances(language: String, numWarmInstances: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .put, 
            path: "/sysprop/num-warm-instances/\(language)/\(numWarmInstances)", 
            requestOptions: requestOptions
        )
    }

    public func getNumWarmInstances(requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/sysprop/num-warm-instances", 
            requestOptions: requestOptions
        )
    }
}