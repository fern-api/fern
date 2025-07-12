public enum ErrorCategory: String, Codable, Hashable, Sendable, CaseIterable {
    case apiError = "API_ERROR"
    case authenticationError = "AUTHENTICATION_ERROR"
    case invalidRequestError = "INVALID_REQUEST_ERROR"
}