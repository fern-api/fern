import Foundation
import Testing
import Api

@Suite("ContainerClient Wire Tests") struct ContainerClientWireTests {
    @Test func getAndReturnListOfPrimitives1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                [
                  "string"
                ]
                """#.utf8
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
        let response = try await client.endpoints.container.getAndReturnListOfPrimitives(
            request: [
                "string"
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnListOfPrimitives2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                [
                  "string",
                  "string"
                ]
                """#.utf8
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
        let response = try await client.endpoints.container.getAndReturnListOfPrimitives(
            request: [
                "string",
                "string"
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnListOfObjects1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                [
                  {
                    "string": "string"
                  }
                ]
                """#.utf8
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
        let response = try await client.endpoints.container.getAndReturnListOfObjects(
            request: [
                TypesObjectWithRequiredField(
                    string: "string"
                )
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnListOfObjects2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                [
                  {
                    "string": "string"
                  },
                  {
                    "string": "string"
                  }
                ]
                """#.utf8
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
        let response = try await client.endpoints.container.getAndReturnListOfObjects(
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

    @Test func getAndReturnSetOfPrimitives1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                [
                  "string"
                ]
                """#.utf8
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
        let response = try await client.endpoints.container.getAndReturnSetOfPrimitives(
            request: [
                "string"
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnSetOfPrimitives2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                [
                  "string",
                  "string"
                ]
                """#.utf8
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
        let response = try await client.endpoints.container.getAndReturnSetOfPrimitives(
            request: [
                "string",
                "string"
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnSetOfObjects1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                [
                  {
                    "string": "string"
                  }
                ]
                """#.utf8
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
        let response = try await client.endpoints.container.getAndReturnSetOfObjects(
            request: [
                TypesObjectWithRequiredField(
                    string: "string"
                )
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnSetOfObjects2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                [
                  {
                    "string": "string"
                  },
                  {
                    "string": "string"
                  }
                ]
                """#.utf8
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
        let response = try await client.endpoints.container.getAndReturnSetOfObjects(
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

    @Test func getAndReturnMapPrimToPrim1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "key": "value"
                }
                """#.utf8
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
        let response = try await client.endpoints.container.getAndReturnMapPrimToPrim(
            request: [
                "key": "value"
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnMapPrimToPrim2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "string": "string"
                }
                """#.utf8
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
        let response = try await client.endpoints.container.getAndReturnMapPrimToPrim(
            request: [
                "string": "string"
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnMapOfPrimToObject1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "key": {
                    "string": "string"
                  }
                }
                """#.utf8
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
        let response = try await client.endpoints.container.getAndReturnMapOfPrimToObject(
            request: [
                "key": TypesObjectWithRequiredField(
                    string: "string"
                )
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnMapOfPrimToObject2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "string": {
                    "string": "string"
                  }
                }
                """#.utf8
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
        let response = try await client.endpoints.container.getAndReturnMapOfPrimToObject(
            request: [
                "string": TypesObjectWithRequiredField(
                    string: "string"
                )
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnMapOfPrimToUndiscriminatedUnion1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "key": 1.1
                }
                """#.utf8
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
        let response = try await client.endpoints.container.getAndReturnMapOfPrimToUndiscriminatedUnion(
            request: [
                "key": TypesMixedType.double(
                    1.1
                )
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnMapOfPrimToUndiscriminatedUnion2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "string": 1.1
                }
                """#.utf8
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
        let response = try await client.endpoints.container.getAndReturnMapOfPrimToUndiscriminatedUnion(
            request: [
                "string": TypesMixedType.double(
                    1.1
                )
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnOptional1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "string": "string"
                }
                """#.utf8
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
        let response = try await client.endpoints.container.getAndReturnOptional(
            request: TypesObjectWithRequiredField(
                string: "string"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnOptional2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "string": "string"
                }
                """#.utf8
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
        let response = try await client.endpoints.container.getAndReturnOptional(
            request: TypesObjectWithRequiredField(
                string: "string"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}