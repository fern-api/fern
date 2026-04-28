import Foundation
import Testing
import Api

@Suite("CatalogClient Wire Tests") struct CatalogClientWireTests {
    @Test func createCatalogImage1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "caption": "caption",
                  "url": "url",
                  "create_request": {
                    "caption": "caption",
                    "catalog_object_id": "catalog_object_id"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = CatalogImage(
            id: "id",
            caption: Optional("caption"),
            url: Optional("url"),
            createRequest: Optional(CreateCatalogImageRequest(
                caption: Optional("caption"),
                catalogObjectId: "catalog_object_id"
            ))
        )
        let response = try await client.catalog.createCatalogImage(
            request: .init(
                imageFile: .init(data: Data("".utf8)),
                request: CreateCatalogImageRequest(
                    catalogObjectId: "catalog_object_id"
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getCatalogImage1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "caption": "caption",
                  "url": "url",
                  "create_request": {
                    "caption": "caption",
                    "catalog_object_id": "catalog_object_id"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = CatalogImage(
            id: "id",
            caption: Optional("caption"),
            url: Optional("url"),
            createRequest: Optional(CreateCatalogImageRequest(
                caption: Optional("caption"),
                catalogObjectId: "catalog_object_id"
            ))
        )
        let response = try await client.catalog.getCatalogImage(
            imageId: "image_id",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getCatalogImage2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "caption": "caption",
                  "url": "url",
                  "create_request": {
                    "caption": "caption",
                    "catalog_object_id": "catalog_object_id"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = CatalogImage(
            id: "id",
            caption: Optional("caption"),
            url: Optional("url"),
            createRequest: Optional(CreateCatalogImageRequest(
                caption: Optional("caption"),
                catalogObjectId: "catalog_object_id"
            ))
        )
        let response = try await client.catalog.getCatalogImage(
            imageId: "image_id",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}