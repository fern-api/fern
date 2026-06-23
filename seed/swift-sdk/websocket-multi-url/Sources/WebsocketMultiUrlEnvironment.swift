import Foundation

public struct WebsocketMultiUrlEnvironment: Sendable {
    public let rest: String
    public let wss: String
    public static let production: WebsocketMultiUrlEnvironment = WebsocketMultiUrlEnvironment(
        rest: "https://api.production.com",
        wss: "wss://ws.production.com"
    )
    public static let staging: WebsocketMultiUrlEnvironment = WebsocketMultiUrlEnvironment(
        rest: "https://api.staging.com",
        wss: "wss://ws.staging.com"
    )

    public init(
        rest: String,
        wss: String
    ) {
        self.rest = rest
        self.wss = wss
    }
}