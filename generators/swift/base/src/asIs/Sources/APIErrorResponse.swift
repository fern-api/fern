import Foundation

public struct APIErrorResponse: Codable, Sendable {
    public let code: Swift.Int
    public let type: Swift.String?
    public let message: Swift.String?

    public init(code: Swift.Int, type: Swift.String? = nil, message: Swift.String? = nil) {
        self.code = code
        self.type = type
        self.message = message
    }
}
