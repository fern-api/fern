import Foundation
import Testing
import Api

@Suite("ItemsClient Wire Tests") struct ItemsClientWireTests {
    @Test func createItem1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "id": "id",
                  "name": "name"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Item(
            id: "id",
            name: "name"
        )
        let response = try await client.items.createItem(
            request: .init(name: "name"),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createItemThrowsClientRequestError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 400,
            body: Foundation.Data(
                #"""
                {
                  "error_type": "error_type",
                  "error_code": "error_code",
                  "error_message": "error_message",
                  "request_id": "request_id"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.items.createItem(
                request: .init(name: "name"),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ApiError.httpError with status code 400")
        } catch ApiError.httpError(let httpError) {
            #expect(httpError.statusCode == 400)
            let body = try #require(httpError.body)
            #expect(body.code == 400)
            #expect(body.type == nil)
            #expect(body.message == #"""
            {
              "error_type": "error_type",
              "error_code": "error_code",
              "error_message": "error_message",
              "request_id": "request_id"
            }
            """#)
        }
    }

    @Test func createItemThrowsServerError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 500,
            body: Foundation.Data(
                #"""
                {
                  "error_type": "error_type",
                  "error_code": "error_code",
                  "error_message": "error_message",
                  "request_id": "request_id"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.items.createItem(
                request: .init(name: "name"),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ApiError.httpError with status code 500")
        } catch ApiError.httpError(let httpError) {
            #expect(httpError.statusCode == 500)
            let body = try #require(httpError.body)
            #expect(body.code == 500)
            #expect(body.type == nil)
            #expect(body.message == #"""
            {
              "error_type": "error_type",
              "error_code": "error_code",
              "error_message": "error_message",
              "request_id": "request_id"
            }
            """#)
        }
    }

    @Test func getItem1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "id": "id",
                  "name": "name"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Item(
            id: "id",
            name: "name"
        )
        let response = try await client.items.getItem(
            itemId: "item_id",
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getItemThrowsNotFoundError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 404,
            body: Foundation.Data(
                #"""
                {
                  "item_id": "item_id"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.items.getItem(
                itemId: "item_id",
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ApiError.httpError with status code 404")
        } catch ApiError.httpError(let httpError) {
            #expect(httpError.statusCode == 404)
            let body = try #require(httpError.body)
            #expect(body.code == 404)
            #expect(body.type == nil)
            #expect(body.message == #"""
            {
              "item_id": "item_id"
            }
            """#)
        }
    }

    @Test func getItemThrowsClientRequestError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 400,
            body: Foundation.Data(
                #"""
                {
                  "error_type": "error_type",
                  "error_code": "error_code",
                  "error_message": "error_message",
                  "request_id": "request_id"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.items.getItem(
                itemId: "item_id",
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ApiError.httpError with status code 400")
        } catch ApiError.httpError(let httpError) {
            #expect(httpError.statusCode == 400)
            let body = try #require(httpError.body)
            #expect(body.code == 400)
            #expect(body.type == nil)
            #expect(body.message == #"""
            {
              "error_type": "error_type",
              "error_code": "error_code",
              "error_message": "error_message",
              "request_id": "request_id"
            }
            """#)
        }
    }

    @Test func getItemThrowsServerError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 500,
            body: Foundation.Data(
                #"""
                {
                  "error_type": "error_type",
                  "error_code": "error_code",
                  "error_message": "error_message",
                  "request_id": "request_id"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.items.getItem(
                itemId: "item_id",
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ApiError.httpError with status code 500")
        } catch ApiError.httpError(let httpError) {
            #expect(httpError.statusCode == 500)
            let body = try #require(httpError.body)
            #expect(body.code == 500)
            #expect(body.type == nil)
            #expect(body.message == #"""
            {
              "error_type": "error_type",
              "error_code": "error_code",
              "error_message": "error_message",
              "request_id": "request_id"
            }
            """#)
        }
    }
}