import Foundation

public final class EnumClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    /// 
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    /// 
    ///     _ = try await client.endpoints.enum.getAndReturnEnum(request: .sunny)
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getAndReturnEnum(request: WeatherReport, requestOptions: RequestOptions? = nil) async throws -> WeatherReport {
        return try await httpClient.performRequest(
            method: .post,
            path: "/enum",
            body: request,
            requestOptions: requestOptions,
            responseType: WeatherReport.self
        )
    }
}