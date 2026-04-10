import Foundation
import Testing
import Api

@Suite("EndpointsUnionClient Wire Tests") struct EndpointsUnionClientWireTests {
    @Test func endpointsUnionGetAndReturnUnion1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "name",
                  "likesToWoof": true,
                  "animal": "dog"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesAnimal.typesAnimalZero(
            TypesAnimalZero(
                name: "name",
                likesToWoof: true,
                animal: .dog
            )
        )
        let response = try await client.endpointsUnion.endpointsUnionGetAndReturnUnion(
            request: TypesAnimal.typesAnimalZero(
                TypesAnimalZero(
                    name: "name",
                    likesToWoof: true,
                    animal: .dog
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsUnionGetAndReturnUnion2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "animal": "dog",
                  "name": "name",
                  "likesToWoof": true
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = TypesAnimal.typesAnimalZero(
            TypesAnimalZero(
                animal: .dog,
                name: "name",
                likesToWoof: true
            )
        )
        let response = try await client.endpointsUnion.endpointsUnionGetAndReturnUnion(
            request: TypesAnimal.typesAnimalZero(
                TypesAnimalZero(
                    name: "name",
                    likesToWoof: true,
                    animal: .dog
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}