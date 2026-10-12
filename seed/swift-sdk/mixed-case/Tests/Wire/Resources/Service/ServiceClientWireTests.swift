import Foundation
import Testing
import MixedCase

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func getResource1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "status": "ACTIVE",
                  "resource_type": "user",
                  "userName": "username",
                  "metadata_tags": [
                    "tag1",
                    "tag2"
                  ],
                  "EXTRA_PROPERTIES": {
                    "foo": "bar",
                    "baz": "qux"
                  }
                }
                """#.utf8
            )
        )
        let client = MixedCaseClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Resource.user(
            .init(
                userName: "username",
                metadataTags: [
                    "tag1",
                    "tag2"
                ],
                extraProperties: [
                    "foo": "bar", 
                    "baz": "qux"
                ],
                additionalProperties: [
                    "status": JSONValue.string("ACTIVE"), 
                    "resource_type": JSONValue.string("user")
                ]
            )
        )
        let response = try await client.service.getResource(
            resourceId: "rsc-xyz",
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listResources1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                [
                  {
                    "resource_type": "user",
                    "status": "ACTIVE",
                    "userName": "username",
                    "metadata_tags": [
                      "tag1",
                      "tag2"
                    ],
                    "EXTRA_PROPERTIES": {
                      "foo": "bar",
                      "baz": "qux"
                    }
                  }
                ]
                """#.utf8
            )
        )
        let client = MixedCaseClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            Resource.user(
                .init(
                    userName: "username",
                    metadataTags: [
                        "tag1",
                        "tag2"
                    ],
                    extraProperties: [
                        "foo": "bar", 
                        "baz": "qux"
                    ],
                    additionalProperties: [
                        "resource_type": JSONValue.string("user"), 
                        "status": JSONValue.string("ACTIVE")
                    ]
                )
            )
        ]
        let response = try await client.service.listResources(
            pageLimit: 10,
            beforeDate: CalendarDate("2023-01-01")!,
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}