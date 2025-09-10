import Foundation

public final class V3Client: Sendable {
    public let problem: V3ProblemClient
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.problem = V3ProblemClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }
}