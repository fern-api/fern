import Foundation

/// Represents an HTTP error response from the server.
///
/// This type provides a structured view of non-success HTTP responses, including
/// the status code, an optional parsed error payload and a semantic classification.
public struct HTTPError: Swift.Error, Swift.CustomStringConvertible {
    /// The HTTP status code returned by the server.
    public let statusCode: Swift.Int

    /// Parsed error payload returned by the server, if any.
    public let body: ResponseBody?

    /// Semantic classification of the error based on the status code.
    public let kind: Kind

    public init(
        statusCode: Swift.Int,
        body: ResponseBody?,
        kind: Kind
    ) {
        self.statusCode = statusCode
        self.body = body
        self.kind = kind
    }

    // MARK: - Description

    public var description: Swift.String {
        localizedDescription
    }

    public var localizedDescription: Swift.String {
        let defaultPrefix: Swift.String
        switch kind {
        case .redirect:
            defaultPrefix = "Redirect error"
        case .unauthorized:
            defaultPrefix = "Unauthorized"
        case .forbidden:
            defaultPrefix = "Forbidden"
        case .notFound:
            defaultPrefix = "Not found"
        case .client:
            defaultPrefix = "Client error"
        case .validation:
            defaultPrefix = "Validation error"
        case .serviceUnavailable:
            defaultPrefix = "Service unavailable"
        case .server:
            defaultPrefix = "Server error"
        case .other:
            defaultPrefix = "HTTP error"
        }

        guard let body = body else {
            return "\(defaultPrefix) (Code: \(statusCode))"
        }

        var message = defaultPrefix

        // Use server message if available and meaningful.
        if let serverMessage = body.message, !serverMessage.isEmpty {
            message = serverMessage
        }

        var details = "Code: \(body.code)"
        if let type = body.type, !type.isEmpty {
            details += ", Type: \(type)"
        }

        return "\(message) (\(details))"
    }

    // MARK: - Factories

    /// Builds an ``HTTPError`` from an HTTP status code and raw response data.
    ///
    /// The mapping from status code to ``Kind`` is:
    /// - `300...399` → `.redirect`
    /// - `401` → `.unauthorized`
    /// - `403` → `.forbidden`
    /// - `404` → `.notFound`
    /// - `422` → `.validation`
    /// - `400...499` → `.client`
    /// - `503` → `.serviceUnavailable`
    /// - `500...599` → `.server`
    /// - anything else → `.other`
    public static func from(
        statusCode: Swift.Int,
        data: Foundation.Data,
        jsonDecoder: Foundation.JSONDecoder
    ) -> HTTPError {
        let parsedBody = ResponseBody.decode(
            statusCode: statusCode,
            data: data,
            using: jsonDecoder
        )

        let kind: Kind
        switch statusCode {
        case 300..<400:
            kind = .redirect
        case 401:
            kind = .unauthorized
        case 403:
            kind = .forbidden
        case 404:
            kind = .notFound
        case 422:
            kind = .validation
        case 503:
            kind = .serviceUnavailable
        case 400..<500:
            kind = .client
        case 500..<600:
            kind = .server
        default:
            kind = .other
        }

        return HTTPError(statusCode: statusCode, body: parsedBody, kind: kind)
    }

    public enum Kind {
        /// 3xx responses.
        case redirect
        /// 401 responses.
        case unauthorized
        /// 403 responses.
        case forbidden
        /// 404 responses.
        case notFound
        /// Other 4xx responses.
        case client
        /// 422 responses.
        case validation
        /// 503 responses.
        case serviceUnavailable
        /// Other 5xx responses.
        case server
        /// Any other non-success status code.
        case other
    }

    /// A best-effort representation of an error payload returned by an API.
    ///
    /// This type is intentionally minimal and is populated from a variety of possible
    /// response body formats (typed JSON, loose JSON with a `"message"` field, or plain text).
    public struct ResponseBody: Swift.Codable, Swift.Sendable {
        public let code: Swift.Int
        public let type: Swift.String?
        public let message: Swift.String?

        /// Attempts to decode an `HTTPError.ResponseBody` from the given HTTP response payload.
        public static func decode(
            statusCode: Swift.Int,
            data: Foundation.Data,
            using jsonDecoder: Foundation.JSONDecoder
        ) -> ResponseBody? {
            // Try to parse as a strongly-typed error response first
            if let errorResponse = try? jsonDecoder.decode(ResponseBody.self, from: data) {
                return errorResponse
            }

            // Try to parse as a simple JSON object with a "message" field
            if let json = try? Foundation.JSONSerialization.jsonObject(with: data)
                as? [Swift.String: Any],
                let message = json["message"] as? Swift.String
            {
                return ResponseBody(code: statusCode, message: message)
            }

            // Try to parse as plain text
            if let errorMessage: String = Swift.String(data: data, encoding: .utf8),
                !errorMessage.isEmpty
            {
                return ResponseBody(code: statusCode, message: errorMessage)
            }

            return nil
        }

        public init(code: Swift.Int, type: Swift.String? = nil, message: Swift.String? = nil) {
            self.code = code
            self.type = type
            self.message = message
        }
    }
}
