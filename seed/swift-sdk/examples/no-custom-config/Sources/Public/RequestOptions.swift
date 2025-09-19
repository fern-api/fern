import Foundation

/// Options for customizing an individual API request.
///
/// Use this struct to override or supplement client-wide configuration for a single request.
public struct RequestOptions {
    /// The API key to use for this request, overriding the client-wide API key if provided.
    let apiKey: String?

    /// The token to use for this request, overriding the client-wide token if provided.
    let token: String?

    /// The number of seconds to await an API call before timing out. If `nil`, uses the client or system default.
    let timeout: Int?

    /// The number of times to retry a failed API call. If `nil`, uses the client or system default.
    let maxRetries: Int?

    /// Additional HTTP headers to include with this request. These can override or supplement client-wide headers.
    let additionalHeaders: [String: String]?

    /// Additional query parameters to include in the request URL. These are merged with any parameters generated from the request model.
    let additionalQueryParameters: [String: String]?

    // TODO(kafkas): Omit for file uploads
    /// Additional body parameters to include in the request payload. These are merged with any parameters generated from the request model.
    let additionalBodyParameters: [String: String]?

    public init(
        apiKey: String? = nil,
        token: String? = nil,
        timeout: Int? = nil,
        maxRetries: Int? = nil,
        additionalHeaders: [String: String]? = nil,
        additionalQueryParameters: [String: String]? = nil,
        additionalBodyParameters: [String: String]? = nil
    ) {
        self.apiKey = apiKey
        self.token = token
        self.timeout = timeout
        self.maxRetries = maxRetries
        self.additionalHeaders = additionalHeaders
        self.additionalQueryParameters = additionalQueryParameters
        self.additionalBodyParameters = additionalBodyParameters
    }
}
