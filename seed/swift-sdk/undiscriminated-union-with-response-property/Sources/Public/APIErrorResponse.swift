import Foundation

public struct APIErrorResponse: Codable, Sendable {
    public let code: Int
    public let type: String?
    public let message: String?

    public init(code: Int, type: String? = nil, message: String? = nil) {
        self.code = code
        self.type = type
        self.message = message
    }
}
