import Foundation

public final class EnumClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAndReturnEnum(request: TypesWeatherReport, requestOptions: RequestOptions? = nil) async throws -> TypesWeatherReport {
        return try await httpClient.performRequest(
            method: .post,
            path: "/enum",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesWeatherReport.self
        )
    }
}