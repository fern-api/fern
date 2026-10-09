import Foundation
import Testing
import Api

@Suite("ProductsClient Wire Tests") struct ProductsClientWireTests {
    @Test func search1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "results": [
                    {
                      "id": "id",
                      "name": "name",
                      "price": 1.1
                    }
                  ]
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = SearchProductsResponse(
            results: Optional([
                Product(
                    id: Optional("id"),
                    name: Optional("name"),
                    price: Optional(1.1)
                )
            ])
        )
        let response = try await client.products.search(
            regionId: "regionId",
            request: .init(),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func search2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "results": [
                    {
                      "id": "id",
                      "name": "name",
                      "price": 1.1
                    },
                    {
                      "id": "id",
                      "name": "name",
                      "price": 1.1
                    }
                  ]
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = SearchProductsResponse(
            results: Optional([
                Product(
                    id: Optional("id"),
                    name: Optional("name"),
                    price: Optional(1.1)
                ),
                Product(
                    id: Optional("id"),
                    name: Optional("name"),
                    price: Optional(1.1)
                )
            ])
        )
        let response = try await client.products.search(
            regionId: "regionId",
            request: .init(
                query: "query",
                config: SearchProductsRequestConfig(
                    currency: "currency",
                    limit: 1
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func get1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "id": "id",
                  "name": "name",
                  "price": 1.1
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Product(
            id: Optional("id"),
            name: Optional("name"),
            price: Optional(1.1)
        )
        let response = try await client.products.get(
            regionId: "regionId",
            productId: "productId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func get2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "id": "id",
                  "name": "name",
                  "price": 1.1
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Product(
            id: Optional("id"),
            name: Optional("name"),
            price: Optional(1.1)
        )
        let response = try await client.products.get(
            regionId: "regionId",
            productId: "productId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}