import Foundation

public enum ErrorCategory: String, Codable, Hashable, CaseIterable, Sendable {
    case apiError = "API_ERROR"
    case authenticationError = "AUTHENTICATION_ERROR"
    case invalidRequestError = "INVALID_REQUEST_ERROR"
}