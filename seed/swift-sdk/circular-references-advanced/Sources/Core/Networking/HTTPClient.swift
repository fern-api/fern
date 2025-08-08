final class HTTPClient: Sendable {
    private let clientConfig: ClientConfig
    private let jsonEncoder = Serde.jsonEncoder
    private let jsonDecoder = Serde.jsonDecoder

    init(config: ClientConfig) {
        self.clientConfig = config
    }

    func performRequest<T: Decodable>(
        method: HTTP.Method,
        path: String,
        headers requestHeaders: [String: String] = [:],
        queryParams requestQueryParams: [String: QueryParameter?] = [:],
        body requestBody: (any Encodable)? = nil,
        requestOptions: RequestOptions? = nil,
        responseType: T.Type
    ) async throws -> T {
        let requestBody: HTTP.RequestBody? = requestBody.map { .jsonEncodable($0) }

        let request = buildRequest(
            method: method,
            path: path,
            requestContentType: .applicationJson,
            requestHeaders: requestHeaders,
            requestQueryParams: requestQueryParams,
            requestBody: requestBody,
            requestOptions: requestOptions
        )

        let (data, contentType) = try await executeRequestWithURLSession(request)

        if T.self == String.self {
            do {
                return try jsonDecoder.decode(responseType, from: data)
            } catch {
                if contentType?.lowercased().contains("text") == true,
                    let string = String(data: data, encoding: .utf8) as? T
                {
                    return string
                }
                throw ClientError.decodingError(error)
            }
        }

        do {
            return try jsonDecoder.decode(responseType, from: data)
        } catch {
            throw ClientError.decodingError(error)
        }
    }

    func performRequest(
        method: HTTP.Method,
        path: String,
        headers requestHeaders: [String: String] = [:],
        queryParams requestQueryParams: [String: QueryParameter?] = [:],
        body requestBody: (any Encodable)? = nil,
        requestOptions: RequestOptions? = nil
    ) async throws {
        let requestBody: HTTP.RequestBody? = requestBody.map { .jsonEncodable($0) }

        let request = buildRequest(
            method: method,
            path: path,
            requestContentType: .applicationJson,
            requestHeaders: requestHeaders,
            requestQueryParams: requestQueryParams,
            requestBody: requestBody,
            requestOptions: requestOptions
        )
        _ = try await executeRequestWithURLSession(request)
    }

    func performFileUpload<T: Decodable>(
        method: HTTP.Method,
        path: String,
        headers requestHeaders: [String: String] = [:],
        queryParams requestQueryParams: [String: QueryParameter?] = [:],
        fileData: Data,
        requestOptions: RequestOptions? = nil,
        responseType: T.Type
    ) async throws -> T {
        let request = buildRequest(
            method: method,
            path: path,
            requestContentType: .applicationOctetStream,
            requestHeaders: requestHeaders,
            requestQueryParams: requestQueryParams,
            requestBody: .data(fileData),
            requestOptions: requestOptions
        )
        let (data, _) = try await executeRequestWithURLSession(request)

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
        requestHeaders: [String: String],
        requestQueryParams: [String: QueryParameter?],
        requestBody: HTTP.RequestBody? = nil,
        requestOptions: RequestOptions? = nil
    ) -> URLRequest {
        // Init with URL
        let url = buildRequestURL(
            path: path, requestQueryParams: requestQueryParams, requestOptions: requestOptions
        )
        var request = URLRequest(url: url)

        // Set timeout
        // TODO(kafkas): URLSession already has a timeout setting; find out if this is the right way to override it at the request level
        if let timeout = requestOptions?.timeout {
            request.timeoutInterval = TimeInterval(timeout)
        }

        // Set method
        request.httpMethod = method.rawValue

        // Set headers
        let headers = buildRequestHeaders(
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
            precondition(
                false,
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
            precondition(
                false,
                "Failed to construct URL from components - this indicates an unexpected error in the SDK."
            )
        }
        return url
    }

    private func buildRequestHeaders(
        requestContentType: HTTP.ContentType,
        requestHeaders: [String: String],
        requestOptions: RequestOptions? = nil
    ) -> [String: String] {
        var headers = clientConfig.headers ?? [:]
        headers["Content-Type"] = requestContentType.rawValue
        if let apiKeyConfig = clientConfig.apiKey {
            headers[apiKeyConfig.header] = requestOptions?.apiKey ?? apiKeyConfig.key
        }
        if let token = requestOptions?.token ?? clientConfig.token {
            headers["Authorization"] = "Bearer \(token)"
        }
        for (key, value) in requestHeaders {
            headers[key] = value
        }
        for (key, value) in requestOptions?.additionalHeaders ?? [:] {
            headers[key] = value
        }
        return headers
    }

    private func buildRequestBody(
        requestBody: HTTP.RequestBody,
        requestOptions: RequestOptions? = nil
    ) -> Data {
        switch requestBody {
        case .jsonEncodable(let encodableBody):
            do {
                // TODO(kafkas): Merge requestOptions.additionalBodyParameters into this
                return try jsonEncoder.encode(encodableBody)
            } catch {
                precondition(
                    false,
                    "Failed to encode request body: \(error) - this indicates an unexpected error in the SDK."
                )
            }
        case .data(let dataBody):
            return dataBody
        }
    }

    private func executeRequestWithURLSession(
        _ request: URLRequest
    ) async throws -> (Data, String?) {
        do {
            // TODO(kafkas): Handle retries
            let (data, response) = try await clientConfig.urlSession.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw ClientError.invalidResponse
            }

            // Handle successful responses
            if 200...299 ~= httpResponse.statusCode {
                let contentType = httpResponse.value(forHTTPHeaderField: "Content-Type")
                return (data, contentType)
            }

            // Handle error responses
            try handleErrorResponse(
                statusCode: httpResponse.statusCode,
                data: data
            )

            // This should never be reached, but satisfy the compiler
            let contentType = httpResponse.value(forHTTPHeaderField: "Content-Type")
            return (data, contentType)

        } catch {
            if error is ClientError {
                throw error
            } else {
                throw ClientError.networkError(error)
            }
        }
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
