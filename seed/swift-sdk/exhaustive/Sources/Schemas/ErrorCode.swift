import Foundation

public enum ErrorCode: String, Codable, Hashable, CaseIterable, Sendable {
    case internalServerError = "INTERNAL_SERVER_ERROR"
    case unauthorized = "UNAUTHORIZED"
    case forbidden = "FORBIDDEN"
    case badRequest = "BAD_REQUEST"
    case conflict = "CONFLICT"
    case gone = "GONE"
    case unprocessableEntity = "UNPROCESSABLE_ENTITY"
    case notImplemented = "NOT_IMPLEMENTED"
    case badGateway = "BAD_GATEWAY"
    case serviceUnavailable = "SERVICE_UNAVAILABLE"
    case unknown = "Unknown"
}