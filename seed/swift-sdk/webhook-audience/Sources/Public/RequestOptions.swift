import Foundation

/// Options for customizing an individual API request.
///
/// Use this struct to override or supplement client-wide configuration for a single request.
public struct RequestOptions {
    /// The API key to use for this request, overriding the client-wide API key if provided.
    let apiKey: Swift.String?

    /// The token to use for this request, overriding the client-wide token if provided.
    let token: Swift.String?

    /// The number of seconds to await an API call before timing out. If `nil`, uses the client or system default.
    let timeout: Swift.Int?

    /// The number of times to retry a failed API call. If `nil`, uses the client or system default.
    let maxRetries: Swift.Int?

    /// Additional HTTP headers to include with this request. These can override or supplement client-wide headers.
    let additionalHeaders: [Swift.String: Swift.String]?

    /// Additional query parameters to include in the request URL. These are merged with any parameters generated from the request model.
    let additionalQueryParameters: [Swift.String: Swift.String]?

    /// Additional body parameters to include in the request payload. These are merged with any parameters generated from the request model.
    let additionalBodyParameters: [Swift.String: Swift.String]?

    public init(
        apiKey: Swift.String? = nil,
        token: Swift.String? = nil,
        timeout: Swift.Int? = nil,
        maxRetries: Swift.Int? = nil,
        additionalHeaders: [Swift.String: Swift.String]? = nil,
        additionalQueryParameters: [Swift.String: Swift.String]? = nil,
        additionalBodyParameters: [Swift.String: Swift.String]? = nil
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
