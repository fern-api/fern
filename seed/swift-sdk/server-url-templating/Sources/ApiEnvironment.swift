import Foundation

public struct ApiEnvironment: Equatable, Sendable {
    public let base: String
    public let auth: String
    public static let regionalApiServer: ApiEnvironment = ApiEnvironment(
        base: "https://api.example.com/v1",
        auth: "https://auth.example.com"
    )

    public init(base: String, auth: String) {
        self.base = base
        self.auth = auth
    }
}