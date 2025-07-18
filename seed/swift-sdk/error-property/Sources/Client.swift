public final class ErrorPropertyClient: Sendable {
    public let errors: ErrorsClient
    public let propertyBasedError: PropertyBasedErrorClient
    private let config: ClientConfig
}