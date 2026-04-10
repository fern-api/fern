import Foundation

public final class EndpointsEnumClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func endpointsEnumGetAndReturnEnum(request: TypesWeatherReport, requestOptions: RequestOptions? = nil) async throws -> TypesWeatherReport {
        return try await httpClient.performRequest(
            method: .post,
            path: "/enum",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesWeatherReport.self
        )
    }
}