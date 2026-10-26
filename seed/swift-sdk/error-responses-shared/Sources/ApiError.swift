import Foundation

/// High-level error type thrown by generated Swift SDKs.
///
/// Request / client-side failures are represented as dedicated cases and
/// HTTP response failures are wrapped in an `HTTPError` that classifies the status code.
public enum ApiError: Swift.Error {
    // MARK: - Client / transport errors

    /// The request URL could not be constructed.
    case invalidURL(Swift.String)

    /// The request body could not be encoded.
    case encodingError(Swift.Error)

    /// The response body could not be decoded.
    case decodingError(Swift.Error)

    /// The SDK received a response it could not interpret as a valid HTTP response.
    case invalidResponse

    /// An underlying networking error occurred (e.g., connection reset).
    case networkError(Swift.Error)

    /// The request timed out.
    case timeout(Swift.Error?)

    // MARK: - HTTP response errors

    /// An error HTTP response was returned by the server.
    case httpError(HTTPError)

    // MARK: - Description

    public var errorDescription: Swift.String? {
        switch self {
        case .invalidURL(let url):
            return "Invalid URL '\(url)'"
        case .encodingError(let error):
            return "Failed to encode request: \(error.localizedDescription)"
        case .decodingError(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        case .invalidResponse:
            return "Invalid response received"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .timeout(let underlying):
            if let underlying {
                return "Request timed out: \(underlying.localizedDescription)"
            } else {
                return "Request timed out"
            }
        case .httpError(let httpError):
            return httpError.localizedDescription
        }
    }
}
