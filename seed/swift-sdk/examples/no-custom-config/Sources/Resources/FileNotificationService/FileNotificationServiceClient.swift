import Foundation

public final class FileNotificationServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func fileNotificationServiceGetException(notificationId: String, requestOptions: RequestOptions? = nil) async throws -> Exception {
        return try await httpClient.performRequest(
            method: .get,
            path: "/file/notification/\(notificationId)",
            requestOptions: requestOptions,
            responseType: Exception.self
        )
    }
}