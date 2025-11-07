import Foundation

final class HTTPClient: Sendable {
    private let clientConfig: ClientConfig
    private let jsonEncoder = Serde.jsonEncoder
    private let jsonDecoder = Serde.jsonDecoder

    private static let initialRetryDelay: TimeInterval = 1.0  // 1 second
    private static let maxRetryDelay: TimeInterval = 60.0  // 60 seconds
    private static let jitterFactor: Double = 0.2  // 20% jitter

    init(config: ClientConfig) {
        self.clientConfig = config
    }

    /// Performs a request with no response.
    func performRequest(
        method: HTTP.Method,
        path: String,
        contentType requestContentType: HTTP.ContentType = .applicationJson,
        headers requestHeaders: [String: String?] = [:],
        queryParams requestQueryParams: [String: QueryParameter?] = [:],
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
            responseType: Data.self
        )
    }

    /// Performs a request with the specified response type.
    func performRequest<T: Decodable>(
        method: HTTP.Method,
        path: String,
        contentType requestContentType: HTTP.ContentType = .applicationJson,
        headers requestHeaders: [String: String?] = [:],
        queryParams requestQueryParams: [String: QueryParameter?] = [:],
        body requestBody: Any? = nil,
        requestOptions: RequestOptions? = nil,
        responseType: T.Type
    ) async throws -> T {
        let requestBody: HTTP.RequestBody? = requestBody.map { body in
            if let multipartData = body as? MultipartFormData {
                return .multipartFormData(multipartData)
            } else if let data = body as? Data {
                return .data(data)
            } else if let encodable = body as? any Encodable {
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

        if responseType == Data.self {
            if let data = data as? T {
                return data
            } else {
                throw ClientError.invalidResponse
            }
        }

        if responseType == String.self {
            if let string = String(data: data, encoding: .utf8) as? T {
                return string
            } else {
                throw ClientError.invalidResponse
            }
        }

        do {
            return try jsonDecoder.decode(responseType, from: data)
        } catch {
            throw ClientError.decodingError(error)
        }
    }

    private func buildRequest(
        method: HTTP.Method,
        path: String,
        requestContentType: HTTP.ContentType,
        requestHeaders: [String: String?],
        requestQueryParams: [String: QueryParameter?],
        requestBody: HTTP.RequestBody? = nil,
        requestOptions: RequestOptions? = nil
    ) async throws -> URLRequest {
        // Init with URL
        let url = buildRequestURL(
            path: path, requestQueryParams: requestQueryParams, requestOptions: requestOptions
        )
        var request = URLRequest(url: url)

        // Set timeout
        if let timeout = requestOptions?.timeout {
            request.timeoutInterval = TimeInterval(timeout)
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
        path: String,
        requestQueryParams: [String: QueryParameter?],
        requestOptions: RequestOptions? = nil
    ) -> URL {
        let endpointURL: String = "\(clientConfig.baseURL)\(path)"
        guard var components: URLComponents = URLComponents(string: endpointURL) else {
            preconditionFailure(
                "Invalid URL '\(endpointURL)' - this indicates an unexpected error in the SDK."
            )
        }
        if !requestQueryParams.isEmpty {
            components.queryItems = requestQueryParams.map { key, value in
                URLQueryItem(name: key, value: value?.toString())
            }
        }
        if let additionalQueryParams = requestOptions?.additionalQueryParameters {
            components.queryItems?.append(
                contentsOf: additionalQueryParams.map { key, value in
                    URLQueryItem(name: key, value: value)
                })
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
        requestHeaders: [String: String?],
        requestOptions: RequestOptions? = nil
    ) async throws -> [String: String] {
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
    ) -> String {
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

    private func getBearerAuthToken(_ requestOptions: RequestOptions?) async throws -> String? {
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
        _ request: URLRequest,
        requestOptions: RequestOptions? = nil
    ) async throws -> (Data, String?) {
        let maxRetries = requestOptions?.maxRetries ?? clientConfig.maxRetries
        var lastResponse: (Data, HTTPURLResponse)?

        for attempt in 0...maxRetries {
            do {
                let (data, response) = try await clientConfig.urlSession.data(for: request)

                guard let httpResponse = response as? HTTPURLResponse else {
                    throw ClientError.invalidResponse
                }

                // Handle successful responses
                if 200...299 ~= httpResponse.statusCode {
                    let contentType = httpResponse.value(forHTTPHeaderField: "Content-Type")
                    return (data, contentType)
                }

                lastResponse = (data, httpResponse)

                if attempt < maxRetries && shouldRetry(statusCode: httpResponse.statusCode) {
                    let delay = getRetryDelay(response: httpResponse, retryAttempt: attempt)
                    try await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
                    continue
                }

                // Handle error responses (no more retries)
                try handleErrorResponse(
                    statusCode: httpResponse.statusCode,
                    data: data
                )

                // This should never be reached, but satisfy the compiler
                let contentType = httpResponse.value(forHTTPHeaderField: "Content-Type")
                return (data, contentType)

            } catch {
                if attempt >= maxRetries || error is ClientError {
                    if error is ClientError {
                        throw error
                    } else {
                        throw ClientError.networkError(error)
                    }
                }
                let delay = Self.initialRetryDelay * pow(2.0, Double(attempt))
                let cappedDelay = min(delay, Self.maxRetryDelay)
                let jitteredDelay = addSymmetricJitter(to: cappedDelay)
                try await Task.sleep(nanoseconds: UInt64(jitteredDelay * 1_000_000_000))
            }
        }

        // This should never be reached, but satisfy the compiler
        if let (data, httpResponse) = lastResponse {
            try handleErrorResponse(statusCode: httpResponse.statusCode, data: data)
            let contentType = httpResponse.value(forHTTPHeaderField: "Content-Type")
            return (data, contentType)
        }
        throw ClientError.invalidResponse
    }

    private func shouldRetry(statusCode: Int) -> Bool {
        return statusCode == 408 || statusCode == 429 || statusCode >= 500
    }

    private func getRetryDelay(response: HTTPURLResponse, retryAttempt: Int) -> TimeInterval {
        if let retryAfter = response.value(forHTTPHeaderField: "Retry-After") {
            if let seconds = Double(retryAfter), seconds > 0 {
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
            if let resetTimeSeconds = Double(rateLimitReset) {
                let resetDate = Date(timeIntervalSince1970: resetTimeSeconds)
                let delay = resetDate.timeIntervalSinceNow
                if delay > 0 {
                    let cappedDelay = min(delay, Self.maxRetryDelay)
                    return addPositiveJitter(to: cappedDelay)
                }
            }
        }

        let baseDelay = Self.initialRetryDelay * pow(2.0, Double(retryAttempt))
        let cappedDelay = min(baseDelay, Self.maxRetryDelay)
        return addSymmetricJitter(to: cappedDelay)
    }

    private func parseHTTPDate(_ dateString: String) -> Date? {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(abbreviation: "GMT")
        formatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss zzz"
        return formatter.date(from: dateString)
    }

    private func addPositiveJitter(to delay: TimeInterval) -> TimeInterval {
        let jitterMultiplier = 1.0 + Double.random(in: 0...Self.jitterFactor)
        return delay * jitterMultiplier
    }

    private func addSymmetricJitter(to delay: TimeInterval) -> TimeInterval {
        let jitterMultiplier =
            1.0 + Double.random(in: -Self.jitterFactor / 2...Self.jitterFactor / 2)
        return delay * jitterMultiplier
    }

    private func handleErrorResponse(statusCode: Int, data: Data) throws {
        let errorResponse = parseErrorResponse(statusCode: statusCode, from: data)

        switch statusCode {
        case 400:
            throw ClientError.badRequest(errorResponse)
        case 401:
            throw ClientError.unauthorized(errorResponse)
        case 403:
            throw ClientError.forbidden(errorResponse)
        case 404:
            throw ClientError.notFound(errorResponse)
        case 422:
            throw ClientError.validationError(errorResponse)
        case 500...599:
            throw ClientError.serverError(errorResponse)
        default:
            throw ClientError.httpError(statusCode: statusCode, response: errorResponse)
        }
    }

    private func parseErrorResponse(statusCode: Int, from data: Data) -> APIErrorResponse? {
        // Try to parse as JSON error response first
        if let errorResponse = try? jsonDecoder.decode(APIErrorResponse.self, from: data) {
            return errorResponse
        }

        // Try to parse as simple JSON with message field
        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
            let message = json["message"] as? String
        {
            return APIErrorResponse(code: statusCode, message: message)
        }

        // Try to parse as plain text
        if let errorMessage = String(data: data, encoding: .utf8), !errorMessage.isEmpty {
            return APIErrorResponse(code: statusCode, message: errorMessage)
        }

        return nil
    }
}
