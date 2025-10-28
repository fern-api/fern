import Foundation

public enum ClientError: Error {
    // Network & Client Errors
    case invalidURL
    case encodingError(Error)
    case decodingError(Error)
    case invalidResponse
    case networkError(Error)

    // Generic HTTP Errors (status code based)
    case badRequest(APIErrorResponse?)  // 400
    case unauthorized(APIErrorResponse?)  // 401
    case forbidden(APIErrorResponse?)  // 403
    case notFound(APIErrorResponse?)  // 404
    case validationError(APIErrorResponse?)  // 422
    case serverError(APIErrorResponse?)  // 5xx
    case httpError(statusCode: Int, response: APIErrorResponse?)  // other

    public var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .encodingError(let error):
            return "Failed to encode request: \(error.localizedDescription)"
        case .decodingError(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        case .invalidResponse:
            return "Invalid response received"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"

        case .badRequest(let response):
            return formatErrorMessage("Bad request", response)
        case .unauthorized(let response):
            return formatErrorMessage("Unauthorized", response)
        case .forbidden(let response):
            return formatErrorMessage("Forbidden", response)
        case .notFound(let response):
            return formatErrorMessage("Not found", response)
        case .validationError(let response):
            return formatErrorMessage("Validation error", response)
        case .serverError(let response):
            return formatErrorMessage("Server error", response)
        case .httpError(let statusCode, let response):
            return formatErrorMessage("HTTP error (\(statusCode))", response)
        }
    }

    private func formatErrorMessage(_ defaultMessage: String, _ response: APIErrorResponse?)
        -> String
    {
        guard let response = response else {
            return defaultMessage
        }

        var message = defaultMessage

        // Use server message if available and meaningful
        if let serverMessage = response.message, !serverMessage.isEmpty {
            message = serverMessage
        }

        // Always include the status code
        message += " (Code: \(response.code))"

        // Include type if available
        if let type = response.type, !type.isEmpty {
            message += " [Type: \(type)]"
        }

        return message
    }
}
