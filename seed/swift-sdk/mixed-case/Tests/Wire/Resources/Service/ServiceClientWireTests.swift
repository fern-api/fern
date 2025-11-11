import Foundation
import Testing
import MixedCase

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func getResource1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
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
                """.utf8
            )
        )
        let client = MixedCaseClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = .user(
            .init(
                userName: "username",
                metadataTags: [
                    "tag1",
                    "tag2"
                ],
                extraProperties: [
                    "foo": "bar", 
                    "baz": "qux"
                ]
            )
        )
        let response = try await client.service.getResource(
            resourceId: "rsc-xyz",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getResource2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "resource_type": "user",
                  "userName": "userName",
                  "metadata_tags": [
                    "metadata_tags",
                    "metadata_tags"
                  ],
                  "EXTRA_PROPERTIES": {
                    "EXTRA_PROPERTIES": "EXTRA_PROPERTIES"
                  },
                  "status": "ACTIVE"
                }
                """.utf8
            )
        )
        let client = MixedCaseClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = .user(
            .init(
                userName: "userName",
                metadataTags: [
                    "metadata_tags",
                    "metadata_tags"
                ],
                extraProperties: [
                    "EXTRA_PROPERTIES": "EXTRA_PROPERTIES"
                ]
            )
        )
        let response = try await client.service.getResource(
            resourceId: "ResourceID",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listResources1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
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
                """.utf8
            )
        )
        let client = MixedCaseClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            .user(
                .init(
                    userName: "username",
                    metadataTags: [
                        "tag1",
                        "tag2"
                    ],
                    extraProperties: [
                        "foo": "bar", 
                        "baz": "qux"
                    ]
                )
            )
        ]
        let response = try await client.service.listResources(
            pageLimit: 10,
            beforeDate: CalendarDate("2023-01-01")!,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func listResources2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "resource_type": "user",
                    "userName": "userName",
                    "metadata_tags": [
                      "metadata_tags",
                      "metadata_tags"
                    ],
                    "EXTRA_PROPERTIES": {
                      "EXTRA_PROPERTIES": "EXTRA_PROPERTIES"
                    },
                    "status": "ACTIVE"
                  },
                  {
                    "resource_type": "user",
                    "userName": "userName",
                    "metadata_tags": [
                      "metadata_tags",
                      "metadata_tags"
                    ],
                    "EXTRA_PROPERTIES": {
                      "EXTRA_PROPERTIES": "EXTRA_PROPERTIES"
                    },
                    "status": "ACTIVE"
                  }
                ]
                """.utf8
            )
        )
        let client = MixedCaseClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            .user(
                .init(
                    userName: "userName",
                    metadataTags: [
                        "metadata_tags",
                        "metadata_tags"
                    ],
                    extraProperties: [
                        "EXTRA_PROPERTIES": "EXTRA_PROPERTIES"
                    ]
                )
            ),
            .user(
                .init(
                    userName: "userName",
                    metadataTags: [
                        "metadata_tags",
                        "metadata_tags"
                    ],
                    extraProperties: [
                        "EXTRA_PROPERTIES": "EXTRA_PROPERTIES"
                    ]
                )
            )
        ]
        let response = try await client.service.listResources(
            pageLimit: 1,
            beforeDate: CalendarDate("2023-01-15")!,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}