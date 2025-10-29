import Foundation
import Testing
import UndiscriminatedUnions

@Suite("UnionClient Wire Tests") struct UnionClientWireTests {
    @Test func get1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = UndiscriminatedUnionsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = MyUnion.string(
            "string"
        )
        let response = try await client.union.get(request: MyUnion.string(
            "string"
        ))
        try #require(response == expectedResponse)
    }

    @Test func getMetadata1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "exampleName",
                  "value": "exampleValue",
                  "default": "exampleDefault"
                }
                """.utf8
            )
        )
        let client = UndiscriminatedUnionsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            Key.keyType(
                .name
            ): "exampleName", 
            Key.keyType(
                .value
            ): "exampleValue", 
            Key.jsonValue(
                .default
            ): "exampleDefault"
        ]
        let response = try await client.union.getMetadata()
        try #require(response == expectedResponse)
    }

    @Test func getMetadata2() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "string"
                }
                """.utf8
            )
        )
        let client = UndiscriminatedUnionsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            Key.keyType(
                .name
            ): "string"
        ]
        let response = try await client.union.getMetadata()
        try #require(response == expectedResponse)
    }

    @Test func updateMetadata1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = UndiscriminatedUnionsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.union.updateMetadata(request: MetadataUnion.optionalMetadata(
            [
                "string": .object([
                    "key": .string("value")
                ])
            ]
        ))
        try #require(response == expectedResponse)
    }

    @Test func updateMetadata2() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = UndiscriminatedUnionsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.union.updateMetadata(request: MetadataUnion.optionalMetadata(
            [
                "string": .object([
                    "key": .string("value")
                ])
            ]
        ))
        try #require(response == expectedResponse)
    }

    @Test func call1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = UndiscriminatedUnionsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.union.call(request: Request(
            union: MetadataUnion.optionalMetadata(
                [
                    "string": .object([
                        "key": .string("value")
                    ])
                ]
            )
        ))
        try #require(response == expectedResponse)
    }

    @Test func call2() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                true
                """.utf8
            )
        )
        let client = UndiscriminatedUnionsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.union.call(request: Request(
            union: MetadataUnion.optionalMetadata(
                [
                    "union": .object([
                        "key": .string("value")
                    ])
                ]
            )
        ))
        try #require(response == expectedResponse)
    }

    @Test func duplicateTypesUnion1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = UndiscriminatedUnionsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = UnionWithDuplicateTypes.string(
            "string"
        )
        let response = try await client.union.duplicateTypesUnion(request: UnionWithDuplicateTypes.string(
            "string"
        ))
        try #require(response == expectedResponse)
    }

    @Test func nestedUnions1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = UndiscriminatedUnionsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.union.nestedUnions(request: NestedUnionRoot.string(
            "string"
        ))
        try #require(response == expectedResponse)
    }
}