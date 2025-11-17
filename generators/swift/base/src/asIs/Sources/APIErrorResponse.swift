import Foundation

/// A best-effort representation of an error payload returned by an API.
///
/// This type is intentionally minimal and is populated from a variety of possible
/// response body formats (typed JSON, loose JSON with a `"message"` field, or plain text).
public struct APIErrorResponse: Swift.Codable, Swift.Sendable {
    public let code: Swift.Int
    public let type: Swift.String?
    public let message: Swift.String?

    public init(code: Swift.Int, type: Swift.String? = nil, message: Swift.String? = nil) {
        self.code = code
        self.type = type
        self.message = message
    }
}

extension APIErrorResponse {
    /// Attempts to decode an `APIErrorResponse` from the given HTTP response payload.
    public static func decode(
        statusCode: Swift.Int,
        data: Foundation.Data,
        using jsonDecoder: Foundation.JSONDecoder
    ) -> APIErrorResponse? {
        // Try to parse as a strongly-typed error response first
        if let errorResponse = try? jsonDecoder.decode(APIErrorResponse.self, from: data) {
            return errorResponse
        }

        // Try to parse as a simple JSON object with a "message" field
        if let json = try? Foundation.JSONSerialization.jsonObject(with: data)
            as? [Swift.String: Any],
            let message = json["message"] as? Swift.String
        {
            return APIErrorResponse(code: statusCode, message: message)
        }

        // Try to parse as plain text
        if let errorMessage = Swift.String(data: data, encoding: .utf8), !errorMessage.isEmpty {
            return APIErrorResponse(code: statusCode, message: errorMessage)
        }

        return nil
    }
}
