import Foundation
import Testing
import Exhaustive

@Suite("ContainerClient Wire Tests") struct ContainerClientWireTests {
    @Test func getAndReturnListOfPrimitives1() async throws -> Void {
        let stub = WireStub()
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
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "string",
            "string"
        ]
        let response = try await client.endpoints.container.getAndReturnListOfPrimitives(request: [
            "string",
            "string"
        ])
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnListOfObjects1() async throws -> Void {
        let stub = WireStub()
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
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            ObjectWithRequiredField(
                string: "string"
            ),
            ObjectWithRequiredField(
                string: "string"
            )
        ]
        let response = try await client.endpoints.container.getAndReturnListOfObjects(request: [
            ObjectWithRequiredField(
                string: "string"
            ),
            ObjectWithRequiredField(
                string: "string"
            )
        ])
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnSetOfPrimitives1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                [
                  "string"
                ]
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = []
        let response = try await client.endpoints.container.getAndReturnSetOfPrimitives()
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnSetOfObjects1() async throws -> Void {
        let stub = WireStub()
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
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = []
        let response = try await client.endpoints.container.getAndReturnSetOfObjects()
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnMapPrimToPrim1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "string": "string"
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "string": "string"
        ]
        let response = try await client.endpoints.container.getAndReturnMapPrimToPrim(request: [
            "string": "string"
        ])
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnMapOfPrimToObject1() async throws -> Void {
        let stub = WireStub()
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
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            "string": ObjectWithRequiredField(
                string: "string"
            )
        ]
        let response = try await client.endpoints.container.getAndReturnMapOfPrimToObject(request: [
            "string": ObjectWithRequiredField(
                string: "string"
            )
        ])
        try #require(response == expectedResponse)
    }

    @Test func getAndReturnOptional1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "string": "string"
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Optional(ObjectWithRequiredField(
            string: "string"
        ))
        let response = try await client.endpoints.container.getAndReturnOptional(request: ObjectWithRequiredField(
            string: "string"
        ))
        try #require(response == expectedResponse)
    }
}