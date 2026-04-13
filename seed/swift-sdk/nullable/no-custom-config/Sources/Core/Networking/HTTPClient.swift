import Foundation

final class HTTPClient: Swift.Sendable {
    private let clientConfig: ClientConfig
    private let jsonEncoder = Serde.jsonEncoder
    private let jsonDecoder = Serde.jsonDecoder

    private static let initialRetryDelay: Foundation.TimeInterval = 1.0  // 1 second
    private static let maxRetryDelay: Foundation.TimeInterval = 60.0  // 60 seconds
    private static let jitterFactor: Swift.Double = 0.2  // 20% jitter

    init(config: ClientConfig) {
        self.clientConfig = config
    }

    /// Performs a request with no response.
    func performRequest(
        method: HTTP.Method,
        path: Swift.String,
        contentType requestContentType: HTTP.ContentType = .applicationJson,
        headers requestHeaders: [Swift.String: Swift.String?] = [:],
        queryParams requestQueryParams: [Swift.String: QueryParameter?] = [:],
        body requestBody: Any? = nil,
        requestOptions: RequestOptions? = nil
    ) async throws {
        _ = try await performRequest(
            method: method,
            path: path,
            contentType: requestContentType,
            headers: requestHeaders,
            queryParams: requestQueryParams,
            body: requestBody,
            requestOptions: requestOptions,
            responseType: Foundation.Data.self
        )
    }

    /// Performs a request with the specified response type.
    func performRequest<T: Swift.Decodable>(
        method: HTTP.Method,
        path: Swift.String,
        contentType requestContentType: HTTP.ContentType = .applicationJson,
        headers requestHeaders: [Swift.String: Swift.String?] = [:],
        queryParams requestQueryParams: [Swift.String: QueryParameter?] = [:],
        body requestBody: Any? = nil,
        requestOptions: RequestOptions? = nil,
        responseType: T.Type
    ) async throws -> T {
        let requestBody: HTTP.RequestBody? = requestBody.map { body in
            if let multipartData = body as? MultipartFormData {
                return .multipartFormData(multipartData)
            } else if let data = body as? Foundation.Data {
                return .data(data)
            } else if let encodable = body as? any Swift.Encodable {
                return .jsonEncodable(encodable)
            } else {
                preconditionFailure("Unsupported body type: \(type(of: body))")
            }
        }

        let request = try await buildRequest(
            method: method,
            path: path,
            requestContentType: requestContentType,
            requestHeaders: requestHeaders,
            requestQueryParams: requestQueryParams,
            requestBody: requestBody,
            requestOptions: requestOptions
        )

        let (data, _) = try await executeRequestWithURLSession(
            request,
            requestOptions: requestOptions
        )

        if responseType == Foundation.Data.self {
            if let data = data as? T {
                return data
            } else {
                throw ApiError.invalidResponse
            }
        }

        if responseType == Swift.String.self {
            if let string = Swift.String(data: data, encoding: .utf8) as? T {
                return string
            } else {
                throw ApiError.invalidResponse
            }
        }

        do {
            return try jsonDecoder.decode(responseType, from: data)
        } catch {
            throw ApiError.decodingError(error)
        }
    }

    private func buildRequest(
        method: HTTP.Method,
        path: Swift.String,
        requestContentType: HTTP.ContentType,
        requestHeaders: [Swift.String: Swift.String?],
        requestQueryParams: [Swift.String: QueryParameter?],
        requestBody: HTTP.RequestBody? = nil,
        requestOptions: RequestOptions? = nil
    ) async throws -> Networking.URLRequest {
        // Init with URL
        let url = buildRequestURL(
            path: path, requestQueryParams: requestQueryParams, requestOptions: requestOptions
        )
        var request = Networking.URLRequest(url: url)

        // Set timeout
        if let timeout = requestOptions?.timeout {
            request.timeoutInterval = Foundation.TimeInterval(timeout)
        }

        // Set method
        request.httpMethod = method.rawValue

        // Set headers
        let headers = try await buildRequestHeaders(
            requestBody: requestBody,
            requestContentType: requestContentType,
            requestHeaders: requestHeaders,
            requestOptions: requestOptions
        )
        for (key, value) in headers {
            request.setValue(value, forHTTPHeaderField: key)
        }

        // Set body
        if let requestBody = requestBody {
            request.httpBody = buildRequestBody(
                requestBody: requestBody,
                requestOptions: requestOptions
            )
        }

        return request
    }

    private func buildRequestURL(
        path: Swift.String,
        requestQueryParams: [Swift.String: QueryParameter?],
        requestOptions: RequestOptions? = nil
    ) -> URL {
        let endpointURL = "\(clientConfig.baseURL)\(path)"
        guard var components = Foundation.URLComponents(string: endpointURL) else {
            preconditionFailure(
                "Invalid URL '\(endpointURL)' - this indicates an unexpected error in the SDK."
            )
        }
        if !requestQueryParams.isEmpty {
            let baseItems: [Foundation.URLQueryItem] = requestQueryParams.compactMap { key, value in
                guard let unwrapped = value else { return nil }
                let stringValue = unwrapped.toString()
                guard !stringValue.isEmpty else { return nil }
                return Foundation.URLQueryItem(name: key, value: stringValue)
            }
            if !baseItems.isEmpty {
                components.queryItems = baseItems
            }
        }
        if let additionalQueryParams = requestOptions?.additionalQueryParameters {
            let extraItems = additionalQueryParams.compactMap { key, value in
                value.isEmpty ? nil : Foundation.URLQueryItem(name: key, value: value)
            }
            if components.queryItems == nil {
                components.queryItems = extraItems
            } else {
                components.queryItems?.append(contentsOf: extraItems)
            }
        }
        guard let url = components.url else {
            preconditionFailure(
                "Failed to construct URL from components - this indicates an unexpected error in the SDK."
            )
        }
        return url
    }

    private func buildRequestHeaders(
        requestBody: HTTP.RequestBody?,
        requestContentType: HTTP.ContentType,
        requestHeaders: [Swift.String: Swift.String?],
        requestOptions: RequestOptions? = nil
    ) async throws -> [Swift.String: Swift.String] {
        var headers = clientConfig.headers ?? [:]

        headers["Content-Type"] = buildContentTypeHeader(
            requestBody: requestBody,
            requestContentType: requestContentType
        )

        if let headerAuth = clientConfig.headerAuth {
            headers[headerAuth.header] = requestOptions?.apiKey ?? headerAuth.key
        }
        if let basicAuthToken = clientConfig.basicAuth?.token {
            headers["Authorization"] = "Basic \(basicAuthToken)"
        }
        if let bearerAuthToken = try await getBearerAuthToken(requestOptions) {
            headers["Authorization"] = "Bearer \(bearerAuthToken)"
        }
        for (key, value) in requestHeaders {
            if let value = value {
                headers[key] = value
            }
        }
        for (key, value) in requestOptions?.additionalHeaders ?? [:] {
            headers[key] = value
        }

        return headers
    }

    private func buildContentTypeHeader(
        requestBody: HTTP.RequestBody?,
        requestContentType: HTTP.ContentType,
    ) -> Swift.String {
        var contentType = requestContentType.rawValue
        if let requestBody, case .multipartFormData(let multipartData) = requestBody {
            if contentType != HTTP.ContentType.multipartFormData.rawValue {
                preconditionFailure(
                    "The content type for multipart form data requests must be multipart/form-data - this indicates an unexpected error in the SDK."
                )
            }
            // Multipart form data content type must include the boundary
            contentType = "\(contentType); boundary=\(multipartData.boundary)"
        }
        return contentType
    }

    private func getBearerAuthToken(_ requestOptions: RequestOptions?) async throws -> Swift.String?
    {
        if let tokenString = requestOptions?.token {
            return tokenString
        }
        if let bearerAuth = clientConfig.bearerAuth {
            return try await bearerAuth.token.retrieve()
        }
        return nil
    }

    private func buildRequestBody(
        requestBody: HTTP.RequestBody,
        requestOptions: RequestOptions? = nil
    ) -> Data {
        switch requestBody {
        case .jsonEncodable(let encodableBody):
            do {
                return try jsonEncoder.encode(encodableBody)
            } catch {
                preconditionFailure(
                    "Failed to encode request body: \(error) - this indicates an unexpected error in the SDK."
                )
            }
        case .data(let dataBody):
            return dataBody
        case .multipartFormData(let multipartData):
            return multipartData.data()
        }
    }

    private func executeRequestWithURLSession(
        _ request: Networking.URLRequest,
        requestOptions: RequestOptions? = nil
    ) async throws -> (Foundation.Data, Swift.String?) {
        let maxRetries = requestOptions?.maxRetries ?? clientConfig.maxRetries
        var lastResponse: (Foundation.Data, Networking.HTTPURLResponse)?

        for attempt in 0...maxRetries {
            do {
                let (data, response) = try await clientConfig.urlSession.data(for: request)

                guard let httpResponse = response as? Networking.HTTPURLResponse else {
                    throw ApiError.invalidResponse
                }

                // Handle successful responses
                if 200...299 ~= httpResponse.statusCode {
                    let contentType = httpResponse.value(forHTTPHeaderField: "Content-Type")
                    return (data, contentType)
                }

                lastResponse = (data, httpResponse)

                if attempt < maxRetries && shouldRetry(statusCode: httpResponse.statusCode) {
                    let delay = getRetryDelay(response: httpResponse, retryAttempt: attempt)
                    try await _Concurrency.Task.sleep(
                        nanoseconds: Swift.UInt64(delay * 1_000_000_000))
                    continue
                }

                throw makeErrorFromResponse(
                    statusCode: httpResponse.statusCode,
                    data: data
                )
            } catch {
                let clientError: ApiError?

                // Treat timeouts as a first-class, non-retryable error
                if let urlError = error as? Foundation.URLError, urlError.code == .timedOut {
                    clientError = .timeout(error)
                } else if let existingClientError = error as? ApiError {
                    clientError = existingClientError
                } else {
                    clientError = nil
                }

                if attempt >= maxRetries || clientError != nil {
                    if let clientError {
                        throw clientError
                    } else {
                        throw ApiError.networkError(error)
                    }
                }
                let delay = Self.initialRetryDelay * pow(2.0, Swift.Double(attempt))
                let cappedDelay = min(delay, Self.maxRetryDelay)
                let jitteredDelay = addSymmetricJitter(to: cappedDelay)
                try await _Concurrency.Task.sleep(
                    nanoseconds: Swift.UInt64(jitteredDelay * 1_000_000_000))
            }
        }

        if let (data, httpResponse) = lastResponse {
            throw makeErrorFromResponse(statusCode: httpResponse.statusCode, data: data)
        }
        throw ApiError.invalidResponse
    }

    private func shouldRetry(statusCode: Swift.Int) -> Swift.Bool {
        return statusCode == 408 || statusCode == 429 || statusCode >= 500
    }

    private func getRetryDelay(response: Networking.HTTPURLResponse, retryAttempt: Swift.Int)
        -> Foundation.TimeInterval
    {
        if let retryAfter = response.value(forHTTPHeaderField: "Retry-After") {
            if let seconds = Swift.Double(retryAfter), seconds > 0 {
                return min(seconds, Self.maxRetryDelay)
            }

            if let date = parseHTTPDate(retryAfter) {
                let delay = date.timeIntervalSinceNow
                if delay > 0 {
                    return min(delay, Self.maxRetryDelay)
                }
            }
        }

        if let rateLimitReset = response.value(forHTTPHeaderField: "X-RateLimit-Reset") {
            if let resetTimeSeconds = Swift.Double(rateLimitReset) {
                let resetDate = Foundation.Date(timeIntervalSince1970: resetTimeSeconds)
                let delay = resetDate.timeIntervalSinceNow
                if delay > 0 {
                    let cappedDelay = min(delay, Self.maxRetryDelay)
                    return addPositiveJitter(to: cappedDelay)
                }
            }
        }

        let baseDelay = Self.initialRetryDelay * pow(2.0, Swift.Double(retryAttempt))
        let cappedDelay = min(baseDelay, Self.maxRetryDelay)
        return addSymmetricJitter(to: cappedDelay)
    }

    private func parseHTTPDate(_ dateString: Swift.String) -> Foundation.Date? {
        let formatter = Foundation.DateFormatter()
        formatter.locale = Foundation.Locale(identifier: "en_US_POSIX")
        formatter.timeZone = Foundation.TimeZone(abbreviation: "GMT")
        formatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss zzz"
        return formatter.date(from: dateString)
    }

    private func addPositiveJitter(to delay: Foundation.TimeInterval) -> Foundation.TimeInterval {
        let jitterMultiplier = 1.0 + Swift.Double.random(in: 0...Self.jitterFactor)
        return delay * jitterMultiplier
    }

    private func addSymmetricJitter(to delay: Foundation.TimeInterval) -> Foundation.TimeInterval {
        let jitterMultiplier =
            1.0 + Swift.Double.random(in: -Self.jitterFactor / 2...Self.jitterFactor / 2)
        return delay * jitterMultiplier
    }

    private func makeErrorFromResponse(statusCode: Swift.Int, data: Foundation.Data) -> ApiError
    {
        let httpError = HTTPError.from(
            statusCode: statusCode,
            data: data,
            jsonDecoder: jsonDecoder
        )
        return ApiError.httpError(httpError)
    }
}
