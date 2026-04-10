import BearerTokenEnvironmentVariable
import Foundation
import Testing

@Suite("Client Error & HTTP Error Tests") struct ClientErrorTests {
    // MARK: - 4xx client errors

    @Test func testClientErrorFor400BadRequest() async throws {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 400,
            headers: ["Content-Type": "application/json"],
            body: Data(#"{"message":"Bad request"}"#.utf8)
        )

        let client = BearerTokenEnvironmentVariableClient(
            baseURL: "https://api.fern.com",
            apiKey: "<token>",
            urlSession: stub.urlSession
        )

        do {
            _ = try await client.service.getWithBearerToken(requestOptions: RequestOptions(additionalHeaders: stub.headers))

            Issue.record("Expected error to be thrown")
        } catch let error as BearerTokenEnvironmentVariableError {
            guard case .httpError(let httpError) = error else {
                Issue.record("Expected BearerTokenEnvironmentVariableError.httpError, got \(error)")
                return
            }
            try #require(httpError.statusCode == 400)
            try #require(httpError.kind == .client)
            try #require(httpError.body?.message == "Bad request")
        } catch {
            Issue.record("Expected BearerTokenEnvironmentVariableError, got \(error)")
        }
    }

    @Test func testClientErrorFor404NotFound() async throws {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 404,
            headers: ["Content-Type": "application/json"],
            body: Data(#"{"message":"Not found"}"#.utf8)
        )

        let client = BearerTokenEnvironmentVariableClient(
            baseURL: "https://api.fern.com",
            apiKey: "<token>",
            urlSession: stub.urlSession
        )

        do {
            _ = try await client.service.getWithBearerToken(requestOptions: RequestOptions(additionalHeaders: stub.headers))

            Issue.record("Expected error to be thrown")
        } catch let error as BearerTokenEnvironmentVariableError {
            guard case .httpError(let httpError) = error else {
                Issue.record("Expected BearerTokenEnvironmentVariableError.httpError, got \(error)")
                return
            }
            try #require(httpError.statusCode == 404)
            try #require(httpError.kind == .notFound)
            try #require(httpError.body?.message == "Not found")
        } catch {
            Issue.record("Expected BearerTokenEnvironmentVariableError, got \(error)")
        }
    }

    @Test func testClientErrorFor422ValidationError() async throws {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 422,
            headers: ["Content-Type": "application/json"],
            body: Data(#"{"message":"Validation failed"}"#.utf8)
        )

        let client = BearerTokenEnvironmentVariableClient(
            baseURL: "https://api.fern.com",
            apiKey: "<token>",
            urlSession: stub.urlSession
        )

        do {
            _ = try await client.service.getWithBearerToken(requestOptions: RequestOptions(additionalHeaders: stub.headers))

            Issue.record("Expected error to be thrown")
        } catch let error as BearerTokenEnvironmentVariableError {
            guard case .httpError(let httpError) = error else {
                Issue.record("Expected BearerTokenEnvironmentVariableError.httpError, got \(error)")
                return
            }
            try #require(httpError.statusCode == 422)
            try #require(httpError.kind == .validation)
            try #require(httpError.body?.message == "Validation failed")
        } catch {
            Issue.record("Expected BearerTokenEnvironmentVariableError, got \(error)")
        }
    }

    // MARK: - 5xx server errors

    @Test func testClientErrorFor500ServerError() async throws {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 500,
            headers: ["Content-Type": "application/json"],
            body: Data(#"{"message":"Internal error"}"#.utf8)
        )

        let client = BearerTokenEnvironmentVariableClient(
            baseURL: "https://api.fern.com",
            apiKey: "<token>",
            urlSession: stub.urlSession
        )

        do {
            _ = try await client.service.getWithBearerToken(requestOptions: RequestOptions(additionalHeaders: stub.headers))

            Issue.record("Expected error to be thrown")
        } catch let error as BearerTokenEnvironmentVariableError {
            guard case .httpError(let httpError) = error else {
                Issue.record("Expected BearerTokenEnvironmentVariableError.httpError, got \(error)")
                return
            }
            try #require(httpError.statusCode == 500)
            try #require(httpError.kind == .server)
            try #require(httpError.body?.message == "Internal error")
        } catch {
            Issue.record("Expected BearerTokenEnvironmentVariableError, got \(error)")
        }
    }

    @Test func testClientErrorFor503ServiceUnavailable() async throws {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 503,
            headers: ["Content-Type": "application/json"],
            body: Data(#"{"message":"Unavailable"}"#.utf8)
        )

        let client = BearerTokenEnvironmentVariableClient(
            baseURL: "https://api.fern.com",
            apiKey: "<token>",
            urlSession: stub.urlSession
        )

        do {
            _ = try await client.service.getWithBearerToken(requestOptions: RequestOptions(additionalHeaders: stub.headers))

            Issue.record("Expected error to be thrown")
        } catch let error as BearerTokenEnvironmentVariableError {
            guard case .httpError(let httpError) = error else {
                Issue.record("Expected BearerTokenEnvironmentVariableError.httpError, got \(error)")
                return
            }
            try #require(httpError.statusCode == 503)
            try #require(httpError.kind == .serviceUnavailable)
            try #require(httpError.body?.message == "Unavailable")
        } catch {
            Issue.record("Expected BearerTokenEnvironmentVariableError, got \(error)")
        }
    }

    // MARK: - 3xx redirect & plain-text bodies

    @Test func testClientErrorFor302RedirectNoBody() async throws {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 302,
            headers: ["Location": "https://example.com"],
            body: Data()
        )

        let client = BearerTokenEnvironmentVariableClient(
            baseURL: "https://api.fern.com",
            apiKey: "<token>",
            urlSession: stub.urlSession
        )

        do {
            _ = try await client.service.getWithBearerToken(requestOptions: RequestOptions(additionalHeaders: stub.headers))

            Issue.record("Expected error to be thrown")
        } catch let error as BearerTokenEnvironmentVariableError {
            guard case .httpError(let httpError) = error else {
                Issue.record("Expected BearerTokenEnvironmentVariableError.httpError, got \(error)")
                return
            }
            try #require(httpError.statusCode == 302)
            try #require(httpError.kind == .redirect)
            try #require(httpError.body == nil)
        } catch {
            Issue.record("Expected BearerTokenEnvironmentVariableError, got \(error)")
        }
    }

    @Test func testClientErrorPlainTextBodyIsDecoded() async throws {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 500,
            headers: ["Content-Type": "text/plain"],
            body: Data("Plain text error".utf8)
        )

        let client = BearerTokenEnvironmentVariableClient(
            baseURL: "https://api.fern.com",
            apiKey: "<token>",
            urlSession: stub.urlSession
        )

        do {
            _ = try await client.service.getWithBearerToken(requestOptions: RequestOptions(additionalHeaders: stub.headers))

            Issue.record("Expected error to be thrown")
        } catch let error as BearerTokenEnvironmentVariableError {
            guard case .httpError(let httpError) = error else {
                Issue.record("Expected BearerTokenEnvironmentVariableError.httpError, got \(error)")
                return
            }
            try #require(httpError.statusCode == 500)
            try #require(httpError.kind == .server)
            try #require(httpError.body?.message == "Plain text error")
        } catch {
            Issue.record("Expected BearerTokenEnvironmentVariableError, got \(error)")
        }
    }
}

