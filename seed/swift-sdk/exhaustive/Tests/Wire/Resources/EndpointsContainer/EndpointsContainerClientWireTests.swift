import Foundation
import Testing
import Api

@Suite("EndpointsContainerClient Wire Tests") struct EndpointsContainerClientWireTests {
    @Test func endpointsContainerGetAndReturnListOfPrimitives1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  "string"
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "string"
        ]
        let response = try await client.endpointsContainer.endpointsContainerGetAndReturnListOfPrimitives(
            request: [
                "string"
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsContainerGetAndReturnListOfPrimitives2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  "string",
                  "string"
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "string",
            "string"
        ]
        let response = try await client.endpointsContainer.endpointsContainerGetAndReturnListOfPrimitives(
            request: [
                "string",
                "string"
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsContainerGetAndReturnListOfObjects1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "string": "string"
                  }
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            TypesObjectWithRequiredField(
                string: "string"
            )
        ]
        let response = try await client.endpointsContainer.endpointsContainerGetAndReturnListOfObjects(
            request: [
                TypesObjectWithRequiredField(
                    string: "string"
                )
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsContainerGetAndReturnListOfObjects2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "string": "string"
                  },
                  {
                    "string": "string"
                  }
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            TypesObjectWithRequiredField(
                string: "string"
            ),
            TypesObjectWithRequiredField(
                string: "string"
            )
        ]
        let response = try await client.endpointsContainer.endpointsContainerGetAndReturnListOfObjects(
            request: [
                TypesObjectWithRequiredField(
                    string: "string"
                ),
                TypesObjectWithRequiredField(
                    string: "string"
                )
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsContainerGetAndReturnSetOfPrimitives1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  "string"
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "string"
        ]
        let response = try await client.endpointsContainer.endpointsContainerGetAndReturnSetOfPrimitives(
            request: [
                "string"
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsContainerGetAndReturnSetOfPrimitives2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  "string",
                  "string"
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "string",
            "string"
        ]
        let response = try await client.endpointsContainer.endpointsContainerGetAndReturnSetOfPrimitives(
            request: [
                "string",
                "string"
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsContainerGetAndReturnSetOfObjects1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "string": "string"
                  }
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            TypesObjectWithRequiredField(
                string: "string"
            )
        ]
        let response = try await client.endpointsContainer.endpointsContainerGetAndReturnSetOfObjects(
            request: [
                TypesObjectWithRequiredField(
                    string: "string"
                )
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsContainerGetAndReturnSetOfObjects2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "string": "string"
                  },
                  {
                    "string": "string"
                  }
                ]
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            TypesObjectWithRequiredField(
                string: "string"
            ),
            TypesObjectWithRequiredField(
                string: "string"
            )
        ]
        let response = try await client.endpointsContainer.endpointsContainerGetAndReturnSetOfObjects(
            request: [
                TypesObjectWithRequiredField(
                    string: "string"
                ),
                TypesObjectWithRequiredField(
                    string: "string"
                )
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsContainerGetAndReturnMapPrimToPrim1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "key": "value"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "key": "value"
        ]
        let response = try await client.endpointsContainer.endpointsContainerGetAndReturnMapPrimToPrim(
            request: [
                "key": "value"
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsContainerGetAndReturnMapPrimToPrim2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "string": "string"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "string": "string"
        ]
        let response = try await client.endpointsContainer.endpointsContainerGetAndReturnMapPrimToPrim(
            request: [
                "string": "string"
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsContainerGetAndReturnMapOfPrimToObject1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "key": {
                    "string": "string"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "key": TypesObjectWithRequiredField(
                string: "string"
            )
        ]
        let response = try await client.endpointsContainer.endpointsContainerGetAndReturnMapOfPrimToObject(
            request: [
                "key": TypesObjectWithRequiredField(
                    string: "string"
                )
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsContainerGetAndReturnMapOfPrimToObject2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "string": {
                    "string": "string"
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "string": TypesObjectWithRequiredField(
                string: "string"
            )
        ]
        let response = try await client.endpointsContainer.endpointsContainerGetAndReturnMapOfPrimToObject(
            request: [
                "string": TypesObjectWithRequiredField(
                    string: "string"
                )
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "key": 1.1
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "key": TypesMixedType.double(
                1.1
            )
        ]
        let response = try await client.endpointsContainer.endpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion(
            request: [
                "key": TypesMixedType.double(
                    1.1
                )
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "string": 1.1
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "string": TypesMixedType.double(
                1.1
            )
        ]
        let response = try await client.endpointsContainer.endpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion(
            request: [
                "string": TypesMixedType.double(
                    1.1
                )
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsContainerGetAndReturnOptional1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "string": "string"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithRequiredField(
            string: "string"
        )
        let response = try await client.endpointsContainer.endpointsContainerGetAndReturnOptional(
            request: TypesObjectWithRequiredField(
                string: "string"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsContainerGetAndReturnOptional2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "string": "string"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesObjectWithRequiredField(
            string: "string"
        )
        let response = try await client.endpointsContainer.endpointsContainerGetAndReturnOptional(
            request: TypesObjectWithRequiredField(
                string: "string"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}