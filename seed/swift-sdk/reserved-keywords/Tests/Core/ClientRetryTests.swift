import NurseryApi
import Foundation
import Testing

@Suite("Client Retry Tests") struct ClientRetryTests {
    @Test func testRetryOn408RequestTimeout() async throws {
        let stub = HTTPStub()
        stub.setResponseSequence([
            (statusCode: 408, headers: ["Content-Type": "application/json"], body: Data()),
            (statusCode: 408, headers: ["Content-Type": "application/json"], body: Data()),
            (
                statusCode: 200, headers: ["Content-Type": "application/json"],
                body: Data("true".utf8)
            ),
        ])

        let client = NurseryApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        let response = try await client.package.test(
            for: "for",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )

        try #require(response == true)
        try #require(stub.getRequestCount() == 3)
    }

    @Test func testRetryOn429TooManyRequests() async throws {
        let stub = HTTPStub()
        stub.setResponseSequence([
            (statusCode: 429, headers: ["Content-Type": "application/json"], body: Data()),
            (statusCode: 429, headers: ["Content-Type": "application/json"], body: Data()),
            (
                statusCode: 200, headers: ["Content-Type": "application/json"],
                body: Data("true".utf8)
            ),
        ])

        let client = NurseryApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        let response = try await client.package.test(
            for: "for",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )

        try #require(response == true)
        try #require(stub.getRequestCount() == 3)
    }

    @Test func testRetryOn500InternalServerError() async throws {
        let stub = HTTPStub()
        stub.setResponseSequence([
            (statusCode: 500, headers: ["Content-Type": "application/json"], body: Data()),
            (statusCode: 500, headers: ["Content-Type": "application/json"], body: Data()),
            (
                statusCode: 200, headers: ["Content-Type": "application/json"],
                body: Data("true".utf8)
            ),
        ])

        let client = NurseryApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        let response = try await client.package.test(
            for: "for",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )

        try #require(response == true)
        try #require(stub.getRequestCount() == 3)
    }

    @Test func testRetryOn503ServiceUnavailable() async throws {
        let stub = HTTPStub()
        stub.setResponseSequence([
            (statusCode: 503, headers: ["Content-Type": "application/json"], body: Data()),
            (
                statusCode: 200, headers: ["Content-Type": "application/json"],
                body: Data("true".utf8)
            ),
        ])

        let client = NurseryApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        let response = try await client.package.test(
            for: "for",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )

        try #require(response == true)
        try #require(stub.getRequestCount() == 2)
    }

    @Test func testNoRetryOn400BadRequest() async throws {
        let stub = HTTPStub()
        stub.setResponseSequence([
            (
                statusCode: 400, headers: ["Content-Type": "application/json"],
                body: Data("{\"errorName\":\"BadRequest\"}".utf8)
            )
        ])

        let client = NurseryApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        do {
            _ = try await client.package.test(
                for: "for",
                requestOptions: RequestOptions(additionalHeaders: stub.headers)
            )

            Issue.record("Expected error to be thrown")
        } catch {
            try #require(stub.getRequestCount() == 1)
        }
    }

    @Test func testNoRetryOn404NotFound() async throws {
        let stub = HTTPStub()
        stub.setResponseSequence([
            (
                statusCode: 404, headers: ["Content-Type": "application/json"],
                body: Data("{\"errorName\":\"NotFound\"}".utf8)
            )
        ])

        let client = NurseryApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        do {
            _ = try await client.package.test(
                for: "for",
                requestOptions: RequestOptions(additionalHeaders: stub.headers)
            )

            Issue.record("Expected error to be thrown")
        } catch {
            try #require(stub.getRequestCount() == 1)
        }
    }

    @Test func testMaxRetriesExhausted() async throws {
        let stub = HTTPStub()
        stub.setResponseSequence([
            (statusCode: 500, headers: ["Content-Type": "application/json"], body: Data()),
            (statusCode: 500, headers: ["Content-Type": "application/json"], body: Data()),
            (statusCode: 500, headers: ["Content-Type": "application/json"], body: Data()),
            (statusCode: 500, headers: ["Content-Type": "application/json"], body: Data()),
        ])

        let client = NurseryApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        do {
        _ = try await client.package.test(
            for: "for",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )

            Issue.record("Expected error to be thrown")
        } catch {
            try #require(stub.getRequestCount() == 3)
        }
    }

    @Test func testRetryAfterHeaderWithSeconds() async throws {
        let stub = HTTPStub()
        stub.setResponseSequence([
            (
                statusCode: 429, headers: ["Content-Type": "application/json", "Retry-After": "1"],
                body: Data()
            ),
            (
                statusCode: 200, headers: ["Content-Type": "application/json"],
                body: Data("true".utf8)
            ),
        ])

        let client = NurseryApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        let startTime = Date()
        let response = try await client.package.test(
            for: "for",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )

        let elapsed = Date().timeIntervalSince(startTime)

        try #require(response == true)
        try #require(stub.getRequestCount() == 2)
        try #require(elapsed >= 1.0)
    }

    @Test func testRetryAfterHeaderWithHTTPDate() async throws {
        let stub = HTTPStub()
        let futureEpoch = ceil(Date().timeIntervalSince1970) + 1.0
        let futureDate = Date(timeIntervalSince1970: futureEpoch)
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(abbreviation: "GMT")
        formatter.dateFormat = "EEE, dd MMM yyyy HH:mm:ss zzz"
        let httpDate = formatter.string(from: futureDate)

        stub.setResponseSequence([
            (
                statusCode: 429,
                headers: ["Content-Type": "application/json", "Retry-After": httpDate], body: Data()
            ),
            (
                statusCode: 200, headers: ["Content-Type": "application/json"],
                body: Data("true".utf8)
            ),
        ])

        let client = NurseryApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        let startTime = Date()
        let response = try await client.package.test(
            for: "for",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )

        let elapsed = Date().timeIntervalSince(startTime)

        try #require(response == true)
        try #require(stub.getRequestCount() == 2)
        try #require(elapsed >= 0.9)
    }

    @Test func testXRateLimitResetHeader() async throws {
        let stub = HTTPStub()
        let futureTimestamp = Int(ceil(Date().timeIntervalSince1970)) + 1

        stub.setResponseSequence([
            (
                statusCode: 429,
                headers: [
                    "Content-Type": "application/json", "X-RateLimit-Reset": "\(futureTimestamp)",
                ], body: Data()
            ),
            (
                statusCode: 200, headers: ["Content-Type": "application/json"],
                body: Data("true".utf8)
            ),
        ])

        let client = NurseryApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        let startTime = Date()
        let response = try await client.package.test(
            for: "for",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )

        let elapsed = Date().timeIntervalSince(startTime)

        try #require(response == true)
        try #require(stub.getRequestCount() == 2)
        try #require(elapsed >= 0.9)
    }

    @Test func testEndpointLevelMaxRetriesOverride() async throws {
        let stub = HTTPStub()
        stub.setResponseSequence([
            (
                statusCode: 500,
                headers: ["Content-Type": "application/json", "Retry-After": "0.1"], body: Data()
            ),
            (
                statusCode: 500,
                headers: ["Content-Type": "application/json", "Retry-After": "0.1"], body: Data()
            ),
            (
                statusCode: 500,
                headers: ["Content-Type": "application/json", "Retry-After": "0.1"], body: Data()
            ),
            (
                statusCode: 500,
                headers: ["Content-Type": "application/json", "Retry-After": "0.1"], body: Data()
            ),
            (
                statusCode: 500,
                headers: ["Content-Type": "application/json", "Retry-After": "0.1"], body: Data()
            ),
            (
                statusCode: 200, headers: ["Content-Type": "application/json"],
                body: Data("true".utf8)
            ),
        ])

        let client = NurseryApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        let response = try await client.package.test(
            for: "for",
            requestOptions: RequestOptions(maxRetries: 5, additionalHeaders: stub.headers)
        )

        try #require(response == true)
        try #require(stub.getRequestCount() == 6)
    }

    @Test func testEndpointLevelMaxRetriesZero() async throws {
        let stub = HTTPStub()
        stub.setResponseSequence([
            (statusCode: 500, headers: ["Content-Type": "application/json"], body: Data())
        ])

        let client = NurseryApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        do {
            _ = try await client.package.test(
                for: "for",
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )

            Issue.record("Expected error to be thrown")
        } catch {
            try #require(stub.getRequestCount() == 1)
        }
    }

    @Test func testSuccessOnFirstAttempt() async throws {
        let stub = HTTPStub()
        stub.setResponseSequence([
            (
                statusCode: 200, headers: ["Content-Type": "application/json"],
                body: Data("true".utf8)
            )
        ])

        let client = NurseryApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )

        let response = try await client.package.test(
            for: "for",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )

        try #require(response == true)
        try #require(stub.getRequestCount() == 1)
    }
}
