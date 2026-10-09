import Foundation
import Testing
import ContentTypes

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func patch1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = ContentTypesClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.service.patch(
            request: .init(
                application: .value("application"),
                requireAuth: .value(true)
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func patchComplex1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = ContentTypesClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.service.patchComplex(
            id: "id",
            request: .init(
                name: "name",
                age: 1,
                active: true,
                metadata: [
                    "metadata": .object([
                        "key": .string("value")
                    ])
                ],
                tags: [
                    "tags",
                    "tags"
                ],
                email: .value("email"),
                nickname: .value("nickname"),
                bio: .value("bio"),
                profileImageUrl: .value("profileImageUrl"),
                settings: .value([
                    "settings": .object([
                        "key": .string("value")
                    ])
                ])
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func namedPatchWithMixed1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = ContentTypesClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.service.namedPatchWithMixed(
            id: "id",
            request: .init(
                appId: "appId",
                instructions: .value("instructions"),
                active: .value(true)
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func optionalMergePatchTest1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = ContentTypesClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.service.optionalMergePatchTest(
            request: .init(
                requiredField: "requiredField",
                optionalString: "optionalString",
                optionalInteger: 1,
                optionalBoolean: true,
                nullableString: .value("nullableString")
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func regularPatch1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = ContentTypesClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.service.regularPatch(
            id: "id",
            request: .init(
                field1: "field1",
                field2: 1
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }
}