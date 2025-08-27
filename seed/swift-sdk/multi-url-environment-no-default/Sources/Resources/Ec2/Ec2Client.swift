import Foundation

public final class Ec2Client: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func bootInstance(request: Requests.BootInstanceRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/ec2/boot",
            body: request,
            requestOptions: requestOptions
        )
    }
}