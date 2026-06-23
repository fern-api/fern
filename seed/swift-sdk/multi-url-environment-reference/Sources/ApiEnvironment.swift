import Foundation

public struct ApiEnvironment: Sendable {
    public let base: String
    public let auth: String
    public let upload: String
    public static let production: ApiEnvironment = ApiEnvironment(
        base: "https://api.example.com/2.0",
        auth: "https://auth.example.com/oauth2",
        upload: "https://upload.example.com/2.0"
    )

    public init(
        base: String,
        auth: String,
        upload: String
    ) {
        self.base = base
        self.auth = auth
        self.upload = upload
    }
}